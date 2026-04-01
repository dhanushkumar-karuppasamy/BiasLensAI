from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd
import shap
import streamlit as st
import xgboost as xgb
from pandas.api.types import is_categorical_dtype, is_object_dtype, is_string_dtype
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, precision_score, recall_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from src.data_processing import PROTECTED_ATTRIBUTES


def _make_one_hot_encoder() -> OneHotEncoder:
    """Create a version-compatible OneHotEncoder."""
    try:
        return OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    except TypeError:
        return OneHotEncoder(handle_unknown="ignore", sparse=False)


def _build_preprocessor(df_features: pd.DataFrame) -> ColumnTransformer:
    numeric_cols = df_features.select_dtypes(include=["number"]).columns.tolist()
    categorical_cols = [col for col in df_features.columns if col not in numeric_cols]

    numeric_pipe = Pipeline(
        steps=[
            ("imputer", SimpleImputer(missing_values=np.nan, strategy="median")),
        ]
    )

    categorical_pipe = Pipeline(
        steps=[
            ("imputer", SimpleImputer(missing_values=np.nan, strategy="most_frequent")),
            ("onehot", _make_one_hot_encoder()),
        ]
    )

    return ColumnTransformer(
        transformers=[
            ("num", numeric_pipe, numeric_cols),
            ("cat", categorical_pipe, categorical_cols),
        ]
    )


def _build_model_pipeline(df_features: pd.DataFrame) -> Pipeline:
    preprocessor = _build_preprocessor(df_features)
    classifier = xgb.XGBClassifier(
        random_state=42,
        eval_metric="logloss",
        use_label_encoder=False,
        n_estimators=250,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.9,
        colsample_bytree=0.9,
    )

    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", classifier),
        ]
    )


def _sanitize_feature_frame(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize pandas nullable scalars to np.nan for sklearn compatibility."""
    sanitized = df.copy(deep=True)

    for col in sanitized.columns:
        col_data = sanitized[col]

        if is_string_dtype(col_data) or is_object_dtype(col_data) or is_categorical_dtype(col_data):
            col_data = col_data.astype("object")
            col_data = col_data.where(pd.notna(col_data), np.nan)
            col_data = col_data.map(lambda value: np.nan if value is pd.NA else value)
            sanitized[col] = col_data

    sanitized = sanitized.replace({pd.NA: np.nan})

    return sanitized


def _calculate_model_health(y_true: pd.Series, y_pred: pd.Series, model_label: str) -> dict[str, Any]:
    return {
        "model": model_label,
        "accuracy": accuracy_score(y_true, y_pred),
        "precision": precision_score(y_true, y_pred, zero_division=0),
        "recall": recall_score(y_true, y_pred, zero_division=0),
    }


def _compute_sample_weights(train_df: pd.DataFrame) -> pd.Series:
    """Compute fairness-oriented sample weights for intersectional minority groups."""
    groups = (
        train_df[PROTECTED_ATTRIBUTES]
        .fillna("Unknown")
        .astype(str)
        .agg("|".join, axis=1)
    )

    group_counts = groups.value_counts()
    n_groups = max(len(group_counts), 1)
    total = len(groups)

    # Inverse-frequency reweighting across protected intersections.
    group_weight_lookup = {k: total / (n_groups * v) for k, v in group_counts.items()}
    weights = groups.map(group_weight_lookup).astype(float)

    # Add moderate class-balance correction.
    label_counts = train_df["income"].value_counts()
    n_labels = max(len(label_counts), 1)
    label_weight_lookup = {
        cls: len(train_df) / (n_labels * count) for cls, count in label_counts.items()
    }
    class_weights = train_df["income"].map(label_weight_lookup).astype(float)

    combined = (weights * class_weights) ** 0.5
    combined = combined / combined.mean()
    return combined


def _extract_top_shap_feature_impacts(
    estimator: xgb.XGBClassifier,
    encoded_df: pd.DataFrame,
    top_n: int = 12,
) -> pd.DataFrame:
    """Return mean absolute SHAP impact ranking for a trained tree model."""
    explainer = shap.TreeExplainer(estimator)
    shap_values = explainer.shap_values(encoded_df)

    if isinstance(shap_values, list):
        shap_values = shap_values[1]

    mean_abs = np.abs(shap_values).mean(axis=0)
    ranking = pd.DataFrame(
        {
            "feature": encoded_df.columns,
            "mean_abs_shap": mean_abs,
        }
    ).sort_values("mean_abs_shap", ascending=False)

    return ranking.head(top_n).reset_index(drop=True)


def _group_positive_prediction_rate(preds: pd.Series, groups: pd.Series) -> pd.Series:
    return preds.groupby(groups).mean()


def _group_true_positive_rate(y_true: pd.Series, preds: pd.Series, groups: pd.Series) -> pd.Series:
    rates = {}
    for group_value in groups.dropna().unique().tolist():
        mask = groups == group_value
        positives = (y_true[mask] == 1)
        denom = positives.sum()
        if denom == 0:
            rates[group_value] = 0.0
            continue
        rates[group_value] = ((preds[mask] == 1) & positives).sum() / denom
    return pd.Series(rates, dtype=float)


def _calculate_fairness_tables(
    y_true: pd.Series,
    preds: pd.Series,
    sensitive_df: pd.DataFrame,
    model_label: str,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    by_group_rows = []
    gap_rows = []

    for attribute in PROTECTED_ATTRIBUTES:
        group_values = sensitive_df[attribute].fillna("Unknown")
        positive_rates = _group_positive_prediction_rate(preds, group_values)
        true_positive_rates = _group_true_positive_rate(y_true, preds, group_values)

        for group_name in positive_rates.index:
            by_group_rows.append(
                {
                    "model": model_label,
                    "attribute": attribute,
                    "group": group_name,
                    "demographic_parity_rate": float(positive_rates.loc[group_name]),
                    "equal_opportunity_tpr": float(true_positive_rates.get(group_name, 0.0)),
                }
            )

        dp_gap = float(positive_rates.max() - positive_rates.min()) if not positive_rates.empty else 0.0
        eo_gap = (
            float(true_positive_rates.max() - true_positive_rates.min())
            if not true_positive_rates.empty
            else 0.0
        )

        gap_rows.append(
            {
                "model": model_label,
                "attribute": attribute,
                "demographic_parity_gap": dp_gap,
                "equal_opportunity_gap": eo_gap,
            }
        )

    return pd.DataFrame(by_group_rows), pd.DataFrame(gap_rows)


@st.cache_resource
def train_models(train_df: pd.DataFrame, test_df: pd.DataFrame) -> dict[str, Any]:
    """Train overt/proxy model pipelines and return metrics, fairness, and SHAP-ready artifacts."""
    train_df = train_df.replace({pd.NA: np.nan}).copy()
    test_df = test_df.replace({pd.NA: np.nan}).copy()

    y_train = train_df["income"]
    y_test = test_df["income"]

    feature_cols_A = [col for col in train_df.columns if col != "income"]
    feature_cols_B = [col for col in feature_cols_A if col not in PROTECTED_ATTRIBUTES]

    X_train_A = _sanitize_feature_frame(train_df[feature_cols_A])
    X_test_A = _sanitize_feature_frame(test_df[feature_cols_A])
    X_train_B = _sanitize_feature_frame(train_df[feature_cols_B])
    X_test_B = _sanitize_feature_frame(test_df[feature_cols_B])
    X_train_C = X_train_B.copy()
    X_test_C = X_test_B.copy()

    model_A_pipeline = _build_model_pipeline(X_train_A)
    model_B_pipeline = _build_model_pipeline(X_train_B)
    model_C_pipeline = _build_model_pipeline(X_train_C)

    train_for_weights = train_df[[*PROTECTED_ATTRIBUTES, "income"]].copy()
    sample_weights = _compute_sample_weights(train_for_weights)

    model_A_pipeline.fit(X_train_A, y_train)
    model_B_pipeline.fit(X_train_B, y_train)
    model_C_pipeline.fit(X_train_C, y_train, classifier__sample_weight=sample_weights.values)

    pred_A = pd.Series(model_A_pipeline.predict(X_test_A), index=test_df.index)
    pred_B = pd.Series(model_B_pipeline.predict(X_test_B), index=test_df.index)
    pred_C = pd.Series(model_C_pipeline.predict(X_test_C), index=test_df.index)
    proba_A = pd.Series(model_A_pipeline.predict_proba(X_test_A)[:, 1], index=test_df.index)
    proba_B = pd.Series(model_B_pipeline.predict_proba(X_test_B)[:, 1], index=test_df.index)
    proba_C = pd.Series(model_C_pipeline.predict_proba(X_test_C)[:, 1], index=test_df.index)

    model_health_df = pd.DataFrame(
        [
            _calculate_model_health(y_test, pred_A, "Model A (Overt Bias)"),
            _calculate_model_health(y_test, pred_B, "Model B (Proxy Bias)"),
            _calculate_model_health(y_test, pred_C, "Model C (Mitigated Bias)"),
        ]
    )

    fairness_by_group_A, fairness_gaps_A = _calculate_fairness_tables(
        y_true=y_test,
        preds=pred_A,
        sensitive_df=test_df[PROTECTED_ATTRIBUTES],
        model_label="Model A (Overt Bias)",
    )
    fairness_by_group_B, fairness_gaps_B = _calculate_fairness_tables(
        y_true=y_test,
        preds=pred_B,
        sensitive_df=test_df[PROTECTED_ATTRIBUTES],
        model_label="Model B (Proxy Bias)",
    )
    fairness_by_group_C, fairness_gaps_C = _calculate_fairness_tables(
        y_true=y_test,
        preds=pred_C,
        sensitive_df=test_df[PROTECTED_ATTRIBUTES],
        model_label="Model C (Mitigated Bias)",
    )

    fairness_by_group_df = pd.concat(
        [fairness_by_group_A, fairness_by_group_B, fairness_by_group_C],
        ignore_index=True,
    )
    fairness_gaps_df = pd.concat(
        [fairness_gaps_A, fairness_gaps_B, fairness_gaps_C],
        ignore_index=True,
    )

    preprocessor_A = model_A_pipeline.named_steps["preprocessor"]
    preprocessor_B = model_B_pipeline.named_steps["preprocessor"]
    preprocessor_C = model_C_pipeline.named_steps["preprocessor"]
    estimator_A = model_A_pipeline.named_steps["classifier"]
    estimator_B = model_B_pipeline.named_steps["classifier"]
    estimator_C = model_C_pipeline.named_steps["classifier"]

    X_test_A_encoded = pd.DataFrame(
        preprocessor_A.transform(X_test_A),
        columns=preprocessor_A.get_feature_names_out(),
        index=test_df.index,
    )
    X_test_B_encoded = pd.DataFrame(
        preprocessor_B.transform(X_test_B),
        columns=preprocessor_B.get_feature_names_out(),
        index=test_df.index,
    )
    X_test_C_encoded = pd.DataFrame(
        preprocessor_C.transform(X_test_C),
        columns=preprocessor_C.get_feature_names_out(),
        index=test_df.index,
    )

    model_C_feature_impact_df = _extract_top_shap_feature_impacts(
        estimator=estimator_C,
        encoded_df=X_test_C_encoded,
        top_n=12,
    )

    # Derived fairness summary score where higher is better (1 - average DP gap).
    dp_summary = (
        fairness_gaps_df.groupby("model", as_index=False)["demographic_parity_gap"]
        .mean()
        .rename(columns={"demographic_parity_gap": "avg_demographic_parity_gap"})
    )
    dp_summary["demographic_parity_score"] = (1 - dp_summary["avg_demographic_parity_gap"]).clip(0, 1)

    audit_df = test_df.copy()
    audit_df["actual_income"] = y_test
    audit_df["pred_model_A"] = pred_A
    audit_df["pred_model_B"] = pred_B
    audit_df["pred_model_C"] = pred_C
    audit_df["proba_model_A"] = proba_A
    audit_df["proba_model_B"] = proba_B
    audit_df["proba_model_C"] = proba_C

    return {
        "model_A_pipeline": model_A_pipeline,
        "model_B_pipeline": model_B_pipeline,
        "model_C_pipeline": model_C_pipeline,
        "model_A_estimator": estimator_A,
        "model_B_estimator": estimator_B,
        "model_C_estimator": estimator_C,
        "X_test_A_encoded": X_test_A_encoded,
        "X_test_B_encoded": X_test_B_encoded,
        "X_test_C_encoded": X_test_C_encoded,
        "model_health_df": model_health_df,
        "fairness_by_group_df": fairness_by_group_df,
        "fairness_gaps_df": fairness_gaps_df,
        "demographic_parity_summary_df": dp_summary,
        "model_C_feature_impact_df": model_C_feature_impact_df,
        "audit_df": audit_df,
    }

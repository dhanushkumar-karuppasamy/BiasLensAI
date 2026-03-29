from typing import Tuple

import pandas as pd
import streamlit as st
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder


@st.cache_resource
def train_models(
    df: pd.DataFrame,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame, xgb.XGBClassifier, xgb.XGBClassifier, pd.DataFrame]:
    """Encode data, train overt and proxy models, and return datasets/models."""
    df_display = df.copy()

    df_encoded = df.copy()
    categorical_cols = df_encoded.select_dtypes(include=["object"]).columns
    for col in categorical_cols:
        df_encoded[col] = LabelEncoder().fit_transform(df_encoded[col])

    X = df_encoded.drop("income", axis=1)
    y = df_encoded["income"]

    X_train, X_test, y_train, _ = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    model_A = xgb.XGBClassifier(
        random_state=42,
        eval_metric="logloss",
        use_label_encoder=False,
    ).fit(X_train, y_train)

    X_blind_train = X_train.drop(columns=["sex", "race"])
    X_blind_test = X_test.drop(columns=["sex", "race"])
    model_B = xgb.XGBClassifier(
        random_state=42,
        eval_metric="logloss",
        use_label_encoder=False,
    ).fit(X_blind_train, y_train)

    return X_train, X_test, X_blind_train, X_blind_test, model_A, model_B, df_display

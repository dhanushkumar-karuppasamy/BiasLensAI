from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.data_processing import load_data
from src.modeling import _extract_top_shap_feature_impacts, train_models


app = FastAPI(title="BiasLens API Bridge", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _to_native(value: Any) -> Any:
    """Recursively convert pandas/numpy values into JSON-serializable Python types."""
    if isinstance(value, (np.floating, np.integer)):
        return value.item()
    if isinstance(value, np.ndarray):
        return [_to_native(v) for v in value.tolist()]
    if isinstance(value, pd.Series):
        return [_to_native(v) for v in value.tolist()]
    if isinstance(value, pd.DataFrame):
        return [_to_native(v) for v in value.to_dict(orient="records")]
    if isinstance(value, dict):
        return {str(k): _to_native(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_to_native(v) for v in value]
    if value is pd.NA or pd.isna(value):
        return None
    return value


def _pct(value: float) -> str:
    return f"{value * 100:.1f}%"


@app.get("/api/model-metrics")
def get_model_metrics() -> dict[str, Any]:
    train_df, test_df = load_data()
    results = train_models(train_df, test_df)

    model_health_df: pd.DataFrame = results["model_health_df"]
    dp_summary_df: pd.DataFrame = results["demographic_parity_summary_df"]

    accuracy_by_model = {
        row["model"]: float(row["accuracy"]) for row in model_health_df.to_dict(orient="records")
    }
    dp_score_by_model = {
        row["model"]: float(row["demographic_parity_score"])
        for row in dp_summary_df.to_dict(orient="records")
    }

    metric_rows = [
        {
            "metric": "Accuracy",
            "modelA": _pct(accuracy_by_model.get("Model A (Overt Bias)", 0.0)),
            "modelB": _pct(accuracy_by_model.get("Model B (Proxy Bias)", 0.0)),
            "modelC": _pct(accuracy_by_model.get("Model C (Mitigated Bias)", 0.0)),
        },
        {
            "metric": "Demographic Parity",
            "modelA": f"{dp_score_by_model.get('Model A (Overt Bias)', 0.0):.2f}",
            "modelB": f"{dp_score_by_model.get('Model B (Proxy Bias)', 0.0):.2f}",
            "modelC": f"{dp_score_by_model.get('Model C (Mitigated Bias)', 0.0):.2f}",
        },
        {
            "metric": "Fairness Posture",
            "modelA": "Direct demographic dependency",
            "modelB": "Proxy substitution",
            "modelC": "Mitigated with sample reweighting",
        },
    ]

    model_A_feature_impact_df = _extract_top_shap_feature_impacts(
        estimator=results["model_A_estimator"],
        encoded_df=results["X_test_A_encoded"],
        top_n=8,
    )
    model_B_feature_impact_df = _extract_top_shap_feature_impacts(
        estimator=results["model_B_estimator"],
        encoded_df=results["X_test_B_encoded"],
        top_n=8,
    )
    model_C_feature_impact_df = results["model_C_feature_impact_df"].head(8)

    shap_payload = {
        "modelA": [
            {"feature": row["feature"], "impact": float(row["mean_abs_shap"])}
            for row in model_A_feature_impact_df.to_dict(orient="records")
        ],
        "modelB": [
            {"feature": row["feature"], "impact": float(row["mean_abs_shap"])}
            for row in model_B_feature_impact_df.to_dict(orient="records")
        ],
        "modelC": [
            {"feature": row["feature"], "impact": float(row["mean_abs_shap"])}
            for row in model_C_feature_impact_df.to_dict(orient="records")
        ],
    }

    return _to_native(
        {
            "section3ComparisonRows": metric_rows,
            "featureImpact": shap_payload,
        }
    )

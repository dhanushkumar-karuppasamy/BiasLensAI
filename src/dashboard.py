from __future__ import annotations

from typing import Any

import matplotlib.pyplot as plt
import pandas as pd
import shap
import streamlit as st


def _normalize_shap_values(shap_values: Any) -> Any:
    if isinstance(shap_values, list):
        return shap_values[1]
    return shap_values


def _normalize_expected_value(expected_value: Any) -> float:
    if isinstance(expected_value, list):
        return float(expected_value[1])
    if hasattr(expected_value, "shape") and getattr(expected_value, "shape", ()):
        return float(expected_value.ravel()[0])
    return float(expected_value)


def _render_model_health_banner(model_health_df: pd.DataFrame) -> None:
    show_banner = st.toggle("Show Model Health Banner", value=True)
    if not show_banner:
        return

    st.subheader("Model Health Check")
    st.caption(
        "These metrics validate baseline predictive quality before we inspect fairness and bias patterns."
    )

    cols = st.columns(len(model_health_df))
    for idx, row in model_health_df.iterrows():
        with cols[idx]:
            st.markdown(f"**{row['model']}**")
            st.metric("Accuracy", f"{row['accuracy']:.3f}")
            st.metric("Precision", f"{row['precision']:.3f}")
            st.metric("Recall", f"{row['recall']:.3f}")


def _render_fairness_section(fairness_gaps_df: pd.DataFrame, fairness_by_group_df: pd.DataFrame) -> None:
    st.subheader("Statistical Fairness Audit")
    st.markdown(
        "We report **Demographic Parity Gap** and **Equal Opportunity Gap** across sensitive groups. "
        "Lower gaps are better; larger gaps indicate stronger fairness violations."
    )

    st.dataframe(
        fairness_gaps_df.style.format(
            {
                "demographic_parity_gap": "{:.3f}",
                "equal_opportunity_gap": "{:.3f}",
            }
        ),
        use_container_width=True,
    )

    with st.expander("See group-level rates used to compute gaps"):
        st.dataframe(
            fairness_by_group_df.style.format(
                {
                    "demographic_parity_rate": "{:.3f}",
                    "equal_opportunity_tpr": "{:.3f}",
                }
            ),
            use_container_width=True,
        )


def _render_global_shap_tab(
    model_A_estimator,
    model_B_estimator,
    X_test_A_encoded: pd.DataFrame,
    X_test_B_encoded: pd.DataFrame,
) -> None:
    st.header("The Colorblind Fallacy")
    st.markdown(
        "Removing protected attributes does **not** guarantee fairness. "
        "Models can re-route signal through correlated **proxy variables**."
    )

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Model A: Overt Bias (includes Sex/Race)")
        explainer_A = shap.TreeExplainer(model_A_estimator)
        shap_values_A = _normalize_shap_values(explainer_A.shap_values(X_test_A_encoded))
        fig_A, _ = plt.subplots()
        shap.summary_plot(shap_values_A, X_test_A_encoded, show=False)
        st.pyplot(fig_A, clear_figure=True)

    with col2:
        st.subheader("Model B: Proxy Bias (Sex/Race removed)")
        explainer_B = shap.TreeExplainer(model_B_estimator)
        shap_values_B = _normalize_shap_values(explainer_B.shap_values(X_test_B_encoded))
        fig_B, _ = plt.subplots()
        shap.summary_plot(shap_values_B, X_test_B_encoded, show=False)
        st.pyplot(fig_B, clear_figure=True)
        st.caption(
            "If fairness gaps persist here, the model likely learned substitutes for protected attributes."
        )


def _render_local_shap_tab(
    audit_df: pd.DataFrame,
    model_B_estimator,
    X_test_B_encoded: pd.DataFrame,
) -> None:
    st.header("Intersectional Audit (Local XAI)")
    st.markdown(
        "A **SHAP waterfall plot** explains one prediction by starting at the model baseline and then "
        "adding feature contributions step-by-step. Bars pushing right increase predicted income >50K; "
        "bars pushing left decrease it."
    )

    filter_col1, filter_col2, filter_col3 = st.columns(3)
    with filter_col1:
        sex_selected = st.selectbox("Sex", sorted(audit_df["sex"].dropna().unique().tolist()))
    with filter_col2:
        race_selected = st.selectbox("Race", sorted(audit_df["race"].dropna().unique().tolist()))
    with filter_col3:
        marital_selected = st.selectbox(
            "Marital Status",
            sorted(audit_df["marital-status"].dropna().unique().tolist()),
        )

    filtered = audit_df[
        (audit_df["sex"] == sex_selected)
        & (audit_df["race"] == race_selected)
        & (audit_df["marital-status"] == marital_selected)
    ]

    if filtered.empty:
        st.warning("No applicant matches this intersection. Try different demographic filters.")
        return

    selected_index = st.selectbox(
        "Choose applicant row",
        options=filtered.index.tolist(),
        format_func=lambda i: (
            f"Row {i} | age={filtered.loc[i, 'age']} | occupation={filtered.loc[i, 'occupation']} "
            f"| predicted P(>50K)={filtered.loc[i, 'proba_model_B']:.3f}"
        ),
    )

    st.caption(
        f"Model B prediction for selected applicant: **{int(filtered.loc[selected_index, 'pred_model_B'])}** "
        f"with probability **{filtered.loc[selected_index, 'proba_model_B']:.3f}**"
    )

    single_row_encoded = X_test_B_encoded.loc[[selected_index]]

    explainer_B = shap.TreeExplainer(model_B_estimator)
    local_shap_values = _normalize_shap_values(explainer_B.shap_values(single_row_encoded))
    expected_value = _normalize_expected_value(explainer_B.expected_value)

    explanation = shap.Explanation(
        values=local_shap_values[0],
        base_values=expected_value,
        data=single_row_encoded.iloc[0].values,
        feature_names=single_row_encoded.columns.tolist(),
    )

    plt.figure(figsize=(10, 6))
    shap.plots.waterfall(explanation, max_display=15, show=False)
    st.pyplot(plt.gcf(), clear_figure=True)


def render_dashboard(results: dict[str, Any]) -> None:
    """Render upgraded BiasLens dashboard with model health, fairness, and local XAI."""
    _render_model_health_banner(results["model_health_df"])
    _render_fairness_section(results["fairness_gaps_df"], results["fairness_by_group_df"])

    tab1, tab2 = st.tabs(["Global Audit (Overt vs. Proxy)", "Local/Intersectional Audit"])

    with tab1:
        _render_global_shap_tab(
            model_A_estimator=results["model_A_estimator"],
            model_B_estimator=results["model_B_estimator"],
            X_test_A_encoded=results["X_test_A_encoded"],
            X_test_B_encoded=results["X_test_B_encoded"],
        )

    with tab2:
        _render_local_shap_tab(
            audit_df=results["audit_df"],
            model_B_estimator=results["model_B_estimator"],
            X_test_B_encoded=results["X_test_B_encoded"],
        )

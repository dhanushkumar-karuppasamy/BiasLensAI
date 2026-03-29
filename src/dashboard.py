import matplotlib.pyplot as plt
import pandas as pd
import shap
import streamlit as st
import xgboost as xgb


def _normalize_shap_values(shap_values):
    if isinstance(shap_values, list):
        return shap_values[1]
    return shap_values


def render_dashboard(
    X_test: pd.DataFrame,
    X_blind_test: pd.DataFrame,
    model_A: xgb.XGBClassifier,
    model_B: xgb.XGBClassifier,
    df_display: pd.DataFrame,
) -> None:
    """Render the two-tab BiasLens dashboard."""
    tab1, tab2 = st.tabs(["Global Audit (Overt vs. Proxy)", "Intersectional Audit (Local XAI)"])

    with tab1:
        st.header("The Colorblind Fallacy")
        st.markdown(
            "Deleting protected attributes does not stop bias. "
            "The AI shifts its weight to **Proxy Variables**."
        )

        col1, col2 = st.columns(2)

        with col1:
            st.subheader("Model A: Overt Bias (Includes Sex/Race)")
            explainer_A = shap.TreeExplainer(model_A)
            shap_values_A = _normalize_shap_values(explainer_A.shap_values(X_test))

            fig_A, _ = plt.subplots()
            shap.summary_plot(shap_values_A, X_test, show=False)
            st.pyplot(fig_A, clear_figure=True)

        with col2:
            st.subheader("Model B: Proxy Bias (Sex/Race Deleted)")
            explainer_B = shap.TreeExplainer(model_B)
            shap_values_B = _normalize_shap_values(explainer_B.shap_values(X_blind_test))

            fig_B, _ = plt.subplots()
            shap.summary_plot(shap_values_B, X_blind_test, show=False)
            st.pyplot(fig_B, clear_figure=True)
            st.caption(
                "Notice how features like 'relationship' or 'marital-status' "
                "can spike in importance to replace Sex."
            )

    with tab2:
        st.header("Intersectional Subgroup Auditing")
        st.markdown("How does the proxy model treat specific overlapping identities?")

        # Placeholder for local SHAP waterfall UI controls.
        st.info(
            "Global plots rendered successfully! "
            "Next step: wire up the waterfall plot here for individual applicants."
        )

        # Keep this parameter intentionally available for upcoming filter UI work.
        _ = df_display

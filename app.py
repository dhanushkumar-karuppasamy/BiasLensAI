import streamlit as st
from src.dashboard import render_dashboard
from src.data_processing import load_data
from src.modeling import train_models

# --- 1. SET UP THE PAGE ---
st.set_page_config(page_title="BiasLens AI", layout="wide")
st.title("BiasLens AI: Intersectional Bias Auditing via XAI")


# --- 3. EXECUTE BACKGROUND TASKS ---
df = load_data()
X_train, X_test, X_blind_train, X_blind_test, model_A, model_B, df_display = train_models(df)


# --- 4. BUILD THE UI DASHBOARD ---
render_dashboard(X_test, X_blind_test, model_A, model_B, df_display)

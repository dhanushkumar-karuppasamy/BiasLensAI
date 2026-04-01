import streamlit as st
from src.dashboard import render_dashboard
from src.data_processing import load_data
from src.modeling import train_models

# --- 1. SET UP THE PAGE ---
st.set_page_config(page_title="BiasLens AI", layout="wide")
st.title("BiasLens AI: Intersectional Bias Auditing via XAI")

# Clear old cache artifacts once per browser session to avoid stale pre-refactor objects.
if "cache_reset_done" not in st.session_state:
	st.cache_data.clear()
	st.cache_resource.clear()
	st.session_state["cache_reset_done"] = True


# --- 3. EXECUTE BACKGROUND TASKS ---
train_df, test_df = load_data()
results = train_models(train_df, test_df)


# --- 4. BUILD THE UI DASHBOARD ---
render_dashboard(results)

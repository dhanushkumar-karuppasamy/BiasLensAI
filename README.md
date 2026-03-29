# BiasLens AI

BiasLens AI is a Streamlit-based prototype for auditing algorithmic bias in the Adult Income dataset using explainable AI (SHAP) and two model perspectives:

- **Model A (Overt Bias)**: trained with all features, including protected attributes.
- **Model B (Proxy Bias)**: trained after removing `sex` and `race` to reveal proxy behavior.

The app visualizes global feature influence and helps demonstrate the colorblind fallacy: removing protected attributes does not necessarily remove bias.

## Features

- Data loading and preprocessing pipeline for Adult dataset files in `data/`
- XGBoost training for both overt and proxy-bias models
- SHAP summary plots for side-by-side global audit
- Streamlit UI with tabs for global and local/intersectional auditing workflow
- Modular code structure under `src/`

## Project Structure

```text
BiasLens_AI/
├─ app.py
├─ requirements.txt
├─ README.md
├─ data/
│  ├─ adult-training.csv
│  └─ adult-test.csv
└─ src/
   ├─ __init__.py
   ├─ data_processing.py
   ├─ modeling.py
   └─ dashboard.py
```

## Setup

### 1) Create and activate a Python environment

Use your preferred environment manager (conda or venv).

### 2) Install dependencies

```bash
pip install -r requirements.txt
```

## Run the App

```bash
streamlit run app.py
```

Then open:

- http://localhost:8501

## Data Notes

- The app expects Adult dataset files in `data/adult-training.csv` (primary) and `data/adult-test.csv`.
- Files are parsed as headerless CSV with predefined column names.
- Missing values marked with `?` are dropped for this prototype.

## Implementation Notes

- Entry point: `app.py`
- Data loading/cleaning: `src/data_processing.py`
- Model training: `src/modeling.py`
- UI rendering + SHAP plots: `src/dashboard.py`

## Known Behavior

- You may see a non-blocking XGBoost warning about `use_label_encoder` being unused in newer versions. The app still runs correctly.

## Next Steps

- Implement the Tab 2 local explanation workflow with subgroup filters and SHAP waterfall plots.
- Add model metrics (accuracy, precision/recall, subgroup comparison).
- Add fairness metrics (demographic parity, equal opportunity) for deeper audits.

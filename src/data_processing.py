import pandas as pd
import streamlit as st

ADULT_COLUMNS = [
    "age",
    "workclass",
    "fnlwgt",
    "education",
    "education-num",
    "marital-status",
    "occupation",
    "relationship",
    "race",
    "sex",
    "capital-gain",
    "capital-loss",
    "hours-per-week",
    "native-country",
    "income",
]


@st.cache_data
def load_data(data_path: str = "data/adult-training.csv") -> pd.DataFrame:
    """Load and clean the Adult dataset from project data files."""
    df = pd.read_csv(
        data_path,
        header=None,
        names=ADULT_COLUMNS,
        skipinitialspace=True,
    )

    df = df.replace("?", pd.NA).dropna().copy()
    df["income"] = df["income"].astype(str).str.strip().str.replace(".", "", regex=False)
    df["income"] = df["income"].apply(lambda x: 1 if ">50K" in x else 0)

    return df

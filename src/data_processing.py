import numpy as np
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

PROTECTED_ATTRIBUTES = ["sex", "race"]


def _read_adult_csv(data_path: str) -> pd.DataFrame:
    """Read Adult CSV robustly (handles the adult-test comment/header line)."""
    return pd.read_csv(
        data_path,
        header=None,
        names=ADULT_COLUMNS,
        skipinitialspace=True,
        na_values=["?", " ?"],
        comment="|",
    )


def _clean_adult_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize strings/labels and keep feature NaNs for pipeline imputation."""
    cleaned = df.copy()

    object_cols = cleaned.select_dtypes(include=["object"]).columns
    for col in object_cols:
        cleaned[col] = cleaned[col].astype("object").map(
            lambda value: value.strip() if isinstance(value, str) else value
        )

    # Ensure sklearn imputers receive np.nan (not pandas scalar NA in object arrays).
    cleaned = cleaned.replace({pd.NA: np.nan})

    # adult.test has trailing periods in label values (e.g., ">50K.").
    cleaned["income"] = cleaned["income"].map(
        lambda value: value.replace(".", "") if isinstance(value, str) else value
    )
    cleaned["income"] = cleaned["income"].map({"<=50K": 0, ">50K": 1})

    # Keep missing feature values for sklearn imputers; drop only unknown target rows.
    cleaned = cleaned.dropna(subset=["income"]).copy()
    cleaned["income"] = cleaned["income"].astype(int)

    return cleaned


@st.cache_data
def load_data(
    train_path: str = "data/adult-training.csv",
    test_path: str = "data/adult-test.csv",
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Load and clean train/test Adult datasets for robust out-of-sample evaluation."""
    train_df = _clean_adult_dataframe(_read_adult_csv(train_path))
    test_df = _clean_adult_dataframe(_read_adult_csv(test_path))
    return train_df, test_df

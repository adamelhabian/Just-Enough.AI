"""
Just Enough - Demand Forecasting
Model loading and inference utilities.
"""

from pathlib import Path
import json
import joblib


# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

PACKAGE_DIR = Path(__file__).resolve().parents[1]

MODEL_PATH = PACKAGE_DIR / "model" / "demand_model.joblib"
CONFIG_PATH = PACKAGE_DIR / "config" / "model_config.json"


# ---------------------------------------------------------
# Load model configuration
# ---------------------------------------------------------

with open(CONFIG_PATH, "r", encoding="utf-8") as file:
    MODEL_CONFIG = json.load(file)


# ---------------------------------------------------------
# Load trained model
# ---------------------------------------------------------

MODEL = joblib.load(MODEL_PATH)


# ---------------------------------------------------------
# Basic information
# ---------------------------------------------------------

def get_model_info():
    """Return basic information about the trained model."""

    return {
        "model_name": MODEL_CONFIG["model_name"],
        "target": MODEL_CONFIG["target"],
        "forecast_horizon_days": MODEL_CONFIG["forecast_horizon_days"],
        "train_end": MODEL_CONFIG["train_end"],
        "number_of_features": len(MODEL_CONFIG["features"]),
    }


# ---------------------------------------------------------
# Basic prediction function
# ---------------------------------------------------------

def predict(features):
    """
    Generate predictions from already-prepared ML features.

    Parameters
    ----------
    features : pandas.DataFrame
        DataFrame containing the exact features expected by the model.

    Returns
    -------
    numpy.ndarray
        Non-negative demand predictions.
    """

    predictions = MODEL.predict(
        features[MODEL_CONFIG["features"]]
    )

    predictions = predictions.clip(
        min=0
    )

    return predictions
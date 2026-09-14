"""
Baseline test suite for Just Enough ML forecasting package.
Non-intrusive verification to assert model loading, feature engineering,
and recursive 7-day forecast inference.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from just_enough_ml.inference.predict import get_model_info, predict
from just_enough_ml.inference.forecast import forecast_next_7_days, MODEL_CONFIG
from just_enough_ml.preprocessing.features import build_features


def test_model_load_and_info():
    """Verify that the trained LightGBM model loads and returns expected metadata."""
    info = get_model_info()
    assert info["model_name"] == "LightGBM"
    assert info["target"] == "quantity"
    assert info["forecast_horizon_days"] == 7
    assert info["number_of_features"] == 52


def test_model_config_structure():
    """Verify that model configuration defines all required feature names and lags."""
    assert len(MODEL_CONFIG["features"]) == 52
    assert "unit_price" in MODEL_CONFIG["features"]
    assert "lag_1" in MODEL_CONFIG["features"]
    assert "lag_7" in MODEL_CONFIG["features"]
    assert "rmean_7" in MODEL_CONFIG["features"]
    assert MODEL_CONFIG["forecast_horizon_days"] == 7


def test_feature_pipeline_on_synthetic_data():
    """Verify that the 52 production features are constructed properly from raw sales history."""
    dates = pd.date_range(start="2025-01-01", periods=60, freq="D")
    data = []
    for d in dates:
        data.append({
            "date": d,
            "restaurant_id": "R01",
            "menu_item_id": "M01",
            "menu_item_name": "Classic Cheeseburger",
            "quantity": 50 + int(10 * np.sin(d.dayofweek)),
            "unit_price": 9.99,
            "day_of_week": d.day_name(),
            "day_of_week_num": d.dayofweek,
            "is_weekend": int(d.dayofweek >= 5),
            "avg_temp_f": 65.0,
            "precip_inches": 0.0,
            "precip_type": None,
            "is_holiday": 0,
            "holiday_name": None,
            "is_special_event": 0,
            "special_event_name": None,
            "is_promotion": 0
        })
    df = pd.DataFrame(data)
    featured = build_features(df)
    
    # Assert all 52 features are generated in the DataFrame
    for feat in MODEL_CONFIG["features"]:
        assert feat in featured.columns, f"Missing feature: {feat}"


def test_recursive_7day_forecasting():
    """Verify that 7-day recursive forecasting executes and produces valid output."""
    dates = pd.date_range(start="2025-01-01", periods=90, freq="D")
    data = []
    for d in dates:
        for item_id, item_name, price in [
            ("M01", "Classic Cheeseburger", 9.99),
            ("M02", "Double Bacon Burger", 12.99)
        ]:
            data.append({
                "date": d,
                "restaurant_id": "R01",
                "menu_item_id": item_id,
                "menu_item_name": item_name,
                "quantity": 40 + int(5 * np.sin(d.dayofweek)),
                "unit_price": price,
                "day_of_week": d.day_name(),
                "day_of_week_num": d.dayofweek,
                "is_weekend": int(d.dayofweek >= 5),
                "avg_temp_f": 60.0,
                "precip_inches": 0.0,
                "precip_type": None,
                "is_holiday": 0,
                "holiday_name": None,
                "is_special_event": 0,
                "special_event_name": None,
                "is_promotion": 0
            })
    history_df = pd.DataFrame(data)

    future_dates = pd.date_range(start="2025-04-01", periods=7, freq="D")
    future_data = []
    for d in future_dates:
        for item_id in ["M01", "M02"]:
            future_data.append({
                "date": d,
                "restaurant_id": "R01",
                "menu_item_id": item_id,
                "unit_price": 9.99 if item_id == "M01" else 12.99,
                "avg_temp_f": 62.0,
                "precip_inches": 0.0,
                "precip_type": None,
                "is_holiday": 0,
                "holiday_name": None,
                "is_special_event": 0,
                "special_event_name": None,
                "is_promotion": 0
            })
    future_context_df = pd.DataFrame(future_data)

    forecast_result = forecast_next_7_days(
        history=history_df,
        restaurant_id="R01",
        forecast_start="2025-04-01",
        future_context=future_context_df
    )

    # Output should have 7 days * 2 menu items = 14 rows
    assert len(forecast_result) == 14
    assert "predicted_quantity" in forecast_result.columns
    assert "recommended_quantity" in forecast_result.columns
    assert (forecast_result["predicted_quantity"] >= 0).all()
    assert (forecast_result["recommended_quantity"] >= 0).all()
    assert forecast_result["recommended_quantity"].dtype in [np.int32, np.int64, int]

"""
Just Enough - 7-Day Demand Forecasting

Recursive forecasting for the next 7 days.

The model predicts menu-item demand one day at a time.
Each prediction is added back into the history so that
later forecast days can use earlier predictions as lag values.

Future business context such as promotions, holidays,
events, prices, and weather can be supplied separately.
"""

from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd

from just_enough_ml.preprocessing.features import build_features


# =========================================================
# Paths
# =========================================================

PACKAGE_DIR = Path(__file__).resolve().parents[1]

MODEL_PATH = PACKAGE_DIR / "model" / "demand_model.joblib"
CONFIG_PATH = PACKAGE_DIR / "config" / "model_config.json"


# =========================================================
# Load model and configuration
# =========================================================

with open(CONFIG_PATH, "r", encoding="utf-8") as file:
    MODEL_CONFIG = json.load(file)

MODEL = joblib.load(MODEL_PATH)

FEATURES = MODEL_CONFIG["features"]


# =========================================================
# Future context columns
# =========================================================

FUTURE_CONTEXT_COLUMNS = [
    "date",
    "restaurant_id",
    "menu_item_id",
    "unit_price",
    "avg_temp_f",
    "precip_inches",
    "precip_type",
    "is_holiday",
    "holiday_name",
    "is_special_event",
    "special_event_name",
    "is_promotion",
]


# =========================================================
# Create future rows
# =========================================================

def _create_future_rows(
    history,
    forecast_date,
    restaurant_id,
    future_context=None
):
    """
    Create one row for every menu item for one future date.

    If future_context is provided, its values are used for
    the future date.

    Otherwise, the latest known context for each menu item
    is used as a fallback.
    """

    restaurant_history = history[
        history["restaurant_id"] == restaurant_id
    ].copy()

    if restaurant_history.empty:
        raise ValueError(
            f"No historical data found for restaurant "
            f"{restaurant_id}."
        )

    # -----------------------------------------------------
    # Latest known information for each menu item
    # -----------------------------------------------------

    latest_items = (
        restaurant_history
        .sort_values("date")
        .groupby("menu_item_id", as_index=False)
        .tail(1)
        .copy()
    )

    future_rows = latest_items.copy()

    # -----------------------------------------------------
    # Set future date
    # -----------------------------------------------------

    future_rows["date"] = pd.Timestamp(
        forecast_date
    )

    # Quantity is unknown and will be predicted
    future_rows["quantity"] = np.nan

        # Recalculate calendar fields for the future date
    future_rows["day_of_week_num"] = (
        future_rows["date"].dt.dayofweek
    )

    future_rows["day_of_week"] = (
        future_rows["date"].dt.day_name()
    )

    future_rows["is_weekend"] = (
        future_rows["day_of_week_num"] >= 5
    ).astype(int)

    future_rows["year"] = (
        future_rows["date"].dt.year
    )

    future_rows["month"] = (
        future_rows["date"].dt.month
    )

    # -----------------------------------------------------
    # Apply future context if provided
    # -----------------------------------------------------

    if future_context is not None:

        context = future_context.copy()

        context["date"] = pd.to_datetime(
            context["date"]
        )

        context = context[
            (context["date"] == pd.Timestamp(forecast_date))
            &
            (context["restaurant_id"] == restaurant_id)
        ].copy()

        if not context.empty:

            # Keep only context columns that exist
            available_columns = [
                column
                for column in FUTURE_CONTEXT_COLUMNS
                if column in context.columns
            ]

            context = context[
                available_columns
            ].drop_duplicates(
                subset=["menu_item_id"]
            )

            # -------------------------------------------------
            # Merge future context with menu items
            # -------------------------------------------------

            future_rows = future_rows.drop(
                columns=[
                    column
                    for column in available_columns
                    if column not in [
                        "date",
                        "restaurant_id",
                        "menu_item_id"
                    ]
                ],
                errors="ignore"
            )

            future_rows = future_rows.merge(
                context,
                on=[
                    "date",
                    "restaurant_id",
                    "menu_item_id"
                ],
                how="left",
                suffixes=("", "_context")
            )

            # -------------------------------------------------
            # Fill missing context values with latest known
            # values for that menu item.
            # -------------------------------------------------

            for column in [
                "unit_price",
                "avg_temp_f",
                "precip_inches",
                "precip_type",
                "is_holiday",
                "holiday_name",
                "is_special_event",
                "special_event_name",
                "is_promotion",
            ]:

                context_column = f"{column}_context"

                if context_column in future_rows.columns:

                    future_rows[column] = (
                        future_rows[context_column]
                        .combine_first(
                            future_rows[column]
                        )
                    )

                    future_rows = future_rows.drop(
                        columns=[context_column]
                    )

    return future_rows


# =========================================================
# Main forecasting function
# =========================================================

def forecast_next_7_days(
    history,
    restaurant_id,
    forecast_start=None,
    future_context=None
):
    """
    Forecast demand for every menu item for the next 7 days.

    Parameters
    ----------
    history : pandas.DataFrame
        Historical sales data.

    restaurant_id : str or int
        Restaurant to forecast.

    forecast_start : str or pandas.Timestamp, optional
        First forecast date.

        If None, the day after the latest historical date
        for the selected restaurant is used.

    future_context : pandas.DataFrame, optional
        Known future context for the forecast period.

        Expected columns include:
            date
            restaurant_id
            menu_item_id
            unit_price
            avg_temp_f
            precip_inches
            precip_type
            is_holiday
            holiday_name
            is_special_event
            special_event_name
            is_promotion

    Returns
    -------
    pandas.DataFrame
        Seven days of menu-item forecasts.
    """

    data = history.copy()

    data["date"] = pd.to_datetime(
        data["date"]
    )

    # -----------------------------------------------------
    # Select restaurant
    # -----------------------------------------------------

    restaurant_data = data[
        data["restaurant_id"] == restaurant_id
    ].copy()

    if restaurant_data.empty:
        raise ValueError(
            f"No data found for restaurant {restaurant_id}."
        )

    # -----------------------------------------------------
    # Determine forecast start
    # -----------------------------------------------------

    latest_date = restaurant_data["date"].max()

    if forecast_start is None:

        forecast_start = (
            latest_date
            + pd.Timedelta(days=1)
        )

    else:

        forecast_start = pd.Timestamp(
            forecast_start
        )

    # -----------------------------------------------------
    # Safety check
    # -----------------------------------------------------

    if forecast_start <= latest_date:

        raise ValueError(
            "forecast_start must be after the latest "
            "historical date."
        )

    # -----------------------------------------------------
    # Prepare future context
    # -----------------------------------------------------

    if future_context is not None:

        future_context = future_context.copy()

        future_context["date"] = pd.to_datetime(
            future_context["date"]
        )

    # -----------------------------------------------------
    # Working history
    # -----------------------------------------------------

    working_history = restaurant_data.copy()

    forecasts = []

    # =====================================================
    # Recursive 7-day forecasting
    # =====================================================

    for day_number in range(7):

        forecast_date = (
            forecast_start
            + pd.Timedelta(days=day_number)
        )

        # -------------------------------------------------
        # Create future rows
        # -------------------------------------------------

        future_rows = _create_future_rows(
            history=working_history,
            forecast_date=forecast_date,
            restaurant_id=restaurant_id,
            future_context=future_context
        )

        # -------------------------------------------------
        # Combine history + future rows
        # -------------------------------------------------

        combined = pd.concat(
            [
                working_history,
                future_rows
            ],
            ignore_index=True
        )

        # -------------------------------------------------
        # Build production features
        # -------------------------------------------------

        featured = build_features(
            combined
        )

        # -------------------------------------------------
        # Select current forecast rows
        # -------------------------------------------------

        forecast_rows = featured[
            featured["date"] == forecast_date
        ].copy()

        # -------------------------------------------------
        # Verify required features
        # -------------------------------------------------

        missing_features = [
            feature
            for feature in FEATURES
            if feature not in forecast_rows.columns
        ]

        if missing_features:

            raise ValueError(
                "Missing model features: "
                + ", ".join(missing_features)
            )

        # -------------------------------------------------
        # Model prediction
        # -------------------------------------------------

        X_future = forecast_rows[
            FEATURES
        ]

        log_predictions = MODEL.predict(
            X_future
        )

        predictions = np.expm1(
            log_predictions
        )

        predictions = np.clip(
            predictions,
            0,
            None
        )

        # -------------------------------------------------
        # Store predictions
        # -------------------------------------------------

        forecast_rows[
            "predicted_quantity"
        ] = predictions

        forecasts.append(
            forecast_rows[
                [
                    "date",
                    "restaurant_id",
                    "menu_item_id",
                    "menu_item_name",
                    "predicted_quantity"
                ]
            ].copy()
        )

        # -------------------------------------------------
        # Add predictions back to history
        #
        # This makes the forecast recursive.
        # -------------------------------------------------

        future_rows["quantity"] = predictions

        working_history = pd.concat(
            [
                working_history,
                future_rows
            ],
            ignore_index=True
        )

    # =====================================================
    # Final result
    # =====================================================

    result = pd.concat(
        forecasts,
        ignore_index=True
    )

    result["recommended_quantity"] = (
        np.rint(
            result["predicted_quantity"]
        )
        .astype(int)
    )

    result["recommended_quantity"] = (
        result["recommended_quantity"]
        .clip(lower=0)
    )

    return result[
        [
            "date",
            "restaurant_id",
            "menu_item_id",
            "menu_item_name",
            "predicted_quantity",
            "recommended_quantity"
        ]
    ]
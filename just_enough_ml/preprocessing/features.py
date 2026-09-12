"""
Just Enough - Feature Engineering

Production feature engineering for the demand forecasting model.
The logic mirrors the feature engineering used during model training.
"""

import numpy as np
import pandas as pd


# =========================================================
# Calendar features
# =========================================================

def add_calendar_features(data):
    data = data.copy()

    data["date"] = pd.to_datetime(data["date"])

    data["year"] = data["date"].dt.year
    data["month"] = data["date"].dt.month
    data["day_of_month"] = data["date"].dt.day
    data["day_of_year"] = data["date"].dt.dayofyear
    data["week_of_year"] = (
        data["date"].dt.isocalendar().week.astype(int)
    )

    data["dow_sin"] = np.sin(
        2 * np.pi * data["day_of_week_num"] / 7
    )

    data["dow_cos"] = np.cos(
        2 * np.pi * data["day_of_week_num"] / 7
    )

    data["month_sin"] = np.sin(
        2 * np.pi * data["month"] / 12
    )

    data["month_cos"] = np.cos(
        2 * np.pi * data["month"] / 12
    )

    data["is_month_start"] = (
        data["day_of_month"] <= 3
    ).astype(int)

    data["is_month_end"] = (
        data["day_of_month"] >= 28
    ).astype(int)

    return data


# =========================================================
# Weather features
# =========================================================

def add_weather_features(data):
    data = data.copy()

    temp = data["avg_temp_f"].fillna(
        data["avg_temp_f"].median()
    )

    precip = data["precip_inches"].fillna(0)

    data["is_rain"] = (
        data["precip_type"].fillna("") == "Rain"
    ).astype(int)

    data["is_snow"] = (
        data["precip_type"].fillna("") == "Snow"
    ).astype(int)

    data["is_precip"] = (
        precip > 0
    ).astype(int)

    data["heavy_precip"] = (
        precip > 0.5
    ).astype(int)

    data["temp_squared"] = temp ** 2

    data["temp_x_precip"] = (
        temp * precip
    )

    return data


# =========================================================
# Promotion / event interaction features
# =========================================================

def add_signal_features(data):
    data = data.copy()

    data["promo_x_weekend"] = (
        data["is_promotion"].fillna(0)
        * data["is_weekend"].fillna(0)
    )

    data["promo_x_holiday"] = (
        data["is_promotion"].fillna(0)
        * data["is_holiday"].fillna(0)
    )

    data["event_x_weekend"] = (
        data["is_special_event"].fillna(0)
        * data["is_weekend"].fillna(0)
    )

    return data


# =========================================================
# Holiday distance features
# =========================================================

def add_holiday_distance(data):
    data = data.copy()

    holiday_dates = np.array(
        sorted(
            pd.to_datetime(
                data.loc[
                    data["is_holiday"]
                    .fillna(0)
                    .astype(int)
                    == 1,
                    "date"
                ].unique()
            )
        )
    )

    if len(holiday_dates) == 0:
        data["days_to_holiday"] = 30
        data["days_since_holiday"] = 30

        data["near_holiday"] = 0
        data["holiday_week"] = 0
        data["post_holiday"] = 0

        return data

    dates = data["date"].values.astype(
        "datetime64[D]"
    )

    holidays = holiday_dates.astype(
        "datetime64[D]"
    )

    pos = np.searchsorted(
        holidays,
        dates
    )

    next_dist = np.full(
        len(data),
        30,
        dtype=float
    )

    prev_dist = np.full(
        len(data),
        30,
        dtype=float
    )

    valid_next = pos < len(holidays)

    next_dist[valid_next] = (
        holidays[pos[valid_next]]
        - dates[valid_next]
    ).astype(
        "timedelta64[D]"
    ).astype(int)

    valid_prev = pos > 0

    prev_dist[valid_prev] = (
        dates[valid_prev]
        - holidays[pos[valid_prev] - 1]
    ).astype(
        "timedelta64[D]"
    ).astype(int)

    data["days_to_holiday"] = next_dist
    data["days_since_holiday"] = prev_dist

    data["near_holiday"] = (
        data["days_to_holiday"] <= 3
    ).astype(int)

    data["holiday_week"] = (
        data["days_to_holiday"] <= 7
    ).astype(int)

    data["post_holiday"] = (
        data["days_since_holiday"] <= 2
    ).astype(int)

    return data


# =========================================================
# Historical lag features
# =========================================================

LAGS = [
    1,
    2,
    3,
    7,
    14,
    28,
    56,
    364
]

SAME_WEEKDAY_WEEKS = [
    1,
    2,
    3,
    4
]

ROLLING_WINDOWS = [
    7,
    14,
    28
]

GROUP_COLUMNS = [
    "restaurant_id",
    "menu_item_id"
]


def add_lag_features(data):
    data = data.copy()

    data = data.sort_values(
        GROUP_COLUMNS + ["date"]
    ).copy()

    group = data.groupby(
        GROUP_COLUMNS,
        sort=False
    )["quantity"]

    for lag in LAGS:
        data[f"lag_{lag}"] = group.shift(lag)

    for weeks in SAME_WEEKDAY_WEEKS:
        data[f"sdow_lag_{weeks}"] = group.shift(
            7 * weeks
        )

    return data


# =========================================================
# Rolling demand features
# =========================================================

def add_rolling_features(data):
    data = data.copy()

    data = data.sort_values(
        GROUP_COLUMNS + ["date"]
    ).copy()

    group = data.groupby(
        GROUP_COLUMNS,
        sort=False
    )["quantity"]

    shifted = group.shift(1)

    grouped_shifted = shifted.groupby(
        [
            data["restaurant_id"],
            data["menu_item_id"]
        ],
        sort=False
    )

    for window in ROLLING_WINDOWS:

        data[f"rmean_{window}"] = (
            grouped_shifted
            .transform(
                lambda s: s.rolling(
                    window,
                    min_periods=max(
                        3,
                        window // 2
                    )
                ).mean()
            )
        )

        data[f"rstd_{window}"] = (
            grouped_shifted
            .transform(
                lambda s: s.rolling(
                    window,
                    min_periods=max(
                        3,
                        window // 2
                    )
                ).std()
            )
        )

    data["trend_7_28"] = (
        data["rmean_7"]
        / (data["rmean_28"] + 1.0)
    )

    return data


# =========================================================
# Historical target encodings
#
# Kept here for reference / experimentation only.
# They are NOT used by the production feature pipeline.
# =========================================================

def add_expanding_encoding(
    data,
    keys,
    output_name
):
    data = data.copy()

    data[output_name] = (
        data.groupby(
            keys,
            sort=False
        )["quantity"]
        .transform(
            lambda s:
                s.shift(1)
                .expanding(min_periods=3)
                .mean()
        )
    )

    return data


def add_target_encoding_features(data):
    data = data.copy()

    data = add_expanding_encoding(
        data,
        ["menu_item_id"],
        "item_mean_enc"
    )

    data = add_expanding_encoding(
        data,
        ["restaurant_id"],
        "restaurant_mean_enc"
    )

    data = add_expanding_encoding(
        data,
        [
            "restaurant_id",
            "menu_item_id"
        ],
        "ri_mean_enc"
    )

    data = add_expanding_encoding(
        data,
        [
            "menu_item_id",
            "day_of_week_num"
        ],
        "item_dow_mean_enc"
    )

    data = add_expanding_encoding(
        data,
        [
            "menu_item_id",
            "month"
        ],
        "item_month_mean_enc"
    )

    data = add_expanding_encoding(
        data,
        [
            "restaurant_id",
            "day_of_week_num"
        ],
        "restaurant_dow_mean_enc"
    )

    data = add_expanding_encoding(
        data,
        [
            "restaurant_id",
            "month"
        ],
        "restaurant_month_mean_enc"
    )

    return data


# =========================================================
# Complete feature pipeline
# =========================================================

def build_features(data):
    """
    Apply the production feature-engineering pipeline.

    Target-encoding features are intentionally excluded
    because the production model uses the clean 52-feature
    configuration.
    """

    data = data.copy()

    data["date"] = pd.to_datetime(
        data["date"]
    )

    data = data.sort_values(
        GROUP_COLUMNS + ["date"]
    ).reset_index(drop=True)

    data = add_calendar_features(data)
    data = add_weather_features(data)
    data = add_signal_features(data)
    data = add_holiday_distance(data)

    data = add_lag_features(data)
    data = add_rolling_features(data)

    # IMPORTANT:
    # Target encodings are intentionally NOT added here.
    # The production model uses 52 clean features.

    numeric_columns = data.select_dtypes(
        include=[np.number]
    ).columns

    data[numeric_columns] = (
        data[numeric_columns]
        .replace(
            [np.inf, -np.inf],
            np.nan
        )
    )

    return data
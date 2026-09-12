# JustEnough ML Baseline Specification & Audit

## 1. Executive Summary
The Machine Learning component delivered by the AI/ML engineering team in `adamelhabian/Just-Enough.AI` provides 7-day recursive demand forecasting for restaurant menu items.

- **Model Architecture**: LightGBM Regressor (`LGBMRegressor`)
- **Target Variable**: `quantity`
- **Target Transformation**: `log1p(quantity)`
- **Inference Inversion**: `expm1(predictions)` clipped at 0
- **Forecast Horizon**: 7 days (recursive day-by-day rollout)
- **Training Data Cutoff**: `2025-09-30`
- **Benchmark Performance**: `wMAPE ≈ 15.12%`
- **Artifact Path**: `ML/just_enough_ml/model/demand_model.joblib`
- **Configuration Path**: `ML/just_enough_ml/config/model_config.json`

---

## 2. Feature Pipeline Specification (52 Production Features)

The production pipeline deliberately excludes experimental target-encoding features to ensure stability and low operational complexity. The 52 features are:

1. **Pricing & Basic**: `unit_price`
2. **Calendar & Seasonality**: `day_of_week_num`, `is_weekend`, `month`, `year`, `day_of_month`, `day_of_year`, `week_of_year`, `dow_sin`, `dow_cos`, `month_sin`, `month_cos`, `is_month_start`, `is_month_end`
3. **Weather Drivers**: `avg_temp_f`, `precip_inches`, `is_rain`, `is_snow`, `is_precip`, `heavy_precip`, `temp_squared`, `temp_x_precip`
4. **Events & Promotions**: `is_holiday`, `is_special_event`, `is_promotion`, `promo_x_weekend`, `promo_x_holiday`, `event_x_weekend`
5. **Holiday Proximity**: `days_to_holiday`, `days_since_holiday`, `near_holiday`, `holiday_week`, `post_holiday`
6. **Lags**: `lag_1`, `lag_2`, `lag_3`, `lag_7`, `lag_14`, `lag_28`, `lag_56`, `lag_364`
7. **Same Day-of-Week Lags**: `sdow_lag_1`, `sdow_lag_2`, `sdow_lag_3`, `sdow_lag_4`
8. **Rolling Statistics**: `rmean_7`, `rmean_14`, `rmean_28`, `rstd_7`, `rstd_14`, `rstd_28`, `trend_7_28`

---

## 3. Recursive Forecasting Interface

The primary integration entrypoint is:
```python
from just_enough_ml.inference.forecast import forecast_next_7_days

forecast_df = forecast_next_7_days(
    history=historical_sales_df,
    restaurant_id="R01",
    forecast_start="2026-01-01",
    future_context=future_context_df
)
```

### Expected Return Structure:
- `date`: Forecast date (`Timestamp`)
- `restaurant_id`: Restaurant identifier
- `menu_item_id`: Item identifier
- `menu_item_name`: Item display name
- `predicted_quantity`: Continuous floating-point prediction (`float`)
- `recommended_quantity`: Non-negative rounded integer (`int`)

---

## 4. Operational Boundaries
1. **ML Scope**: The ML model predicts **menu item quantities**, not raw ingredients.
2. **Backend Scope**: The Backend translates menu item forecasts into ingredient requirements via the **Recipe / Bill of Materials (BOM)** mapping layer.
3. **External Dependencies**: The ML package executes purely locally on passed DataFrames and makes zero network calls to external weather or ERP services.

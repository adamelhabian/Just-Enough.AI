# Just Enough --- ML Demand Forecasting

## 1. Overview

This repository contains the Machine Learning component of **Just
Enough**, an AI-powered restaurant intelligence system.

The ML component forecasts the expected **number of orders/units for
every menu item for each day of the next 7 days**.

The production model is a **LightGBM regression model trained with a
log-transformed target (`log1p(quantity)`)**.

The ML package is designed to sit behind the Backend. It does not own
the restaurant ERP/POS system and it does not call external APIs
directly.

### High-level flow

``` text
Restaurant ERP / POS
        |
        | Historical sales
        v
     Backend
        |
        | + Future context
        |   - Promotions
        |   - Holidays
        |   - Events
        |   - Weather
        |   - Future prices
        v
   Just Enough ML
        |
        | Feature engineering
        | + LightGBM
        | + Recursive 7-day forecasting
        v
  7-day menu-item demand
        |
        v
     Backend
        |
        +--> Dashboard / Recommendations
        |
        +--> Recipe/BOM layer
              |
              v
        Ingredient requirements
```

------------------------------------------------------------------------

# 2. What the ML Team Delivered

The ML package contains:

-   A trained LightGBM demand forecasting model.
-   Production feature engineering.
-   Recursive 7-day forecasting.
-   Model configuration.
-   Basic prediction utilities.
-   A training/EDA notebook documenting the ML work.
-   A clear interface for Backend integration.

The production model uses **52 features**.

The model predicts **menu-item quantity**, not ingredient quantity.

Ingredient requirements should be calculated separately using the
restaurant's recipe/BOM mapping.

------------------------------------------------------------------------

# 3. Production Model

## Model

**LightGBM Regressor**

Target:

``` text
quantity
```

Target transformation:

``` text
log1p(quantity)
```

Forecast horizon:

``` text
7 days
```

Training cutoff:

``` text
2025-09-30
```

Random state:

``` text
42
```

Number of production features:

``` text
52
```

## Model selection

The clean production model was selected because it provides a strong
result while keeping the production pipeline simpler and more
defensible.

The clean LightGBM model achieved approximately:

``` text
wMAPE = 15.12%
```

A previous experimental version with additional target-encoding features
achieved approximately 14.85% wMAPE, but those target encodings were
intentionally excluded from the production version.

**Do not add the experimental target-encoding features to the production
pipeline unless the ML team explicitly retrains and validates a new
production model.**

------------------------------------------------------------------------

# 4. What Does the Model Predict?

For a selected restaurant, the model produces a prediction for every
menu item for every day in the next 7 days.

For example:

``` text
Restaurant: R01
Date: 2026-01-01
Menu item: Classic Cheeseburger

Predicted quantity: 62.41
Recommended quantity: 62
```

The `predicted_quantity` is the model's continuous prediction.

The `recommended_quantity` is the rounded non-negative integer intended
for business use.

------------------------------------------------------------------------

# 5. 7-Day Forecasting

The forecast is generated recursively.

This means:

``` text
Day 1 prediction
      |
      v
added to history
      |
      v
Day 2 prediction
      |
      v
added to history
      |
      v
Day 3 prediction
      |
     ...
      |
      v
Day 7 prediction
```

This is important because later forecast days can use earlier predicted
demand as lag information.

The Backend does not need to implement this recursive logic. It is
already implemented inside:

``` text
just_enough_ml/inference/forecast.py
```

------------------------------------------------------------------------

# 6. What Backend Must Provide

The ML package needs two main types of information.

## A. Historical sales data

Historical data should contain the sales history required to build the
model's lag and rolling features.

The historical dataset used during development contains fields such as:

``` text
date
restaurant_id
menu_item_id
menu_item_name
quantity
unit_price
day_of_week
day_of_week_num
is_weekend
avg_temp_f
precip_inches
precip_type
is_holiday
holiday_name
is_special_event
special_event_name
is_promotion
```

The exact ERP/POS schema may be different.

The Backend should map its own ERP/POS fields into the schema expected
by the ML feature pipeline before calling the model.

### Important

The historical data must contain the `quantity` field because it is the
target and is also required to calculate historical lag/rolling
features.

------------------------------------------------------------------------

# 7. Future Context

For the next 7 days, Backend should provide information that is already
known or can reasonably be obtained before the forecast is generated.

Examples:

-   Future promotions
-   Holidays
-   Special events
-   Future prices
-   Weather forecasts

Expected future-context fields include:

``` text
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
```

Backend is responsible for obtaining these values from the ERP/POS or
external services.

## External APIs

The ML package does **not** call:

-   Weather APIs
-   Holiday APIs
-   Event APIs
-   Promotion systems
-   ERP APIs

Instead:

``` text
External APIs / ERP
        |
        v
     Backend
        |
        v
   future_context
        |
        v
       ML
```

This keeps the ML component independent from external services.

------------------------------------------------------------------------

# 8. Future Context Example

For example, Backend could prepare:

``` python
future_context = pd.DataFrame([
    {
        "date": "2026-01-01",
        "restaurant_id": "R01",
        "menu_item_id": "M01",
        "unit_price": 6.99,
        "avg_temp_f": 25.4,
        "precip_inches": 0.0,
        "precip_type": None,
        "is_holiday": 1,
        "holiday_name": "New Year's Day",
        "is_special_event": 0,
        "special_event_name": None,
        "is_promotion": 1
    }
])
```

In the real system, Backend should provide the appropriate values for
all required menu items and forecast dates.

------------------------------------------------------------------------

# 9. Project Structure

``` text
ML_model/
│
├── just_enough_ml/
│   ├── __init__.py
│   │
│   ├── config/
│   │   └── model_config.json
│   │
│   ├── model/
│   │   └── demand_model.joblib
│   │
│   ├── preprocessing/
│   │   ├── __init__.py
│   │   └── features.py
│   │
│   └── inference/
│       ├── __init__.py
│       ├── predict.py
│       └── forecast.py
│
├── Just_Enough_ML_MVP_Complete.ipynb
├── requirements.txt
└── README.md
```

### File responsibilities

  -------------------------------------------------------------------------
  File                                  Purpose
  ------------------------------------- -----------------------------------
  `demand_model.joblib`                 Trained production LightGBM model

  `model_config.json`                   Model configuration and required
                                        feature list

  `features.py`                         Production feature engineering

  `forecast.py`                         Recursive 7-day forecasting

  `predict.py`                          Model loading and basic prediction

  `requirements.txt`                    Python dependencies

  `Just_Enough_ML_MVP_Complete.ipynb`   EDA, experimentation, training and
                                        evaluation

  `README.md`                           Backend integration documentation
  -------------------------------------------------------------------------

------------------------------------------------------------------------

# 10. How Backend Can Use the ML Package

The main function Backend should use is:

``` python
from just_enough_ml.inference.forecast import forecast_next_7_days
```

Then:

``` python
forecast = forecast_next_7_days(
    history=historical_data,
    restaurant_id="R01",
    forecast_start="2026-01-01",
    future_context=future_context
)
```

The returned value is a pandas DataFrame.

------------------------------------------------------------------------

# 11. ML Output

The forecast contains:

``` text
date
restaurant_id
menu_item_id
menu_item_name
predicted_quantity
recommended_quantity
```

Example:

``` text
date        restaurant_id  menu_item_id  menu_item_name          predicted_quantity  recommended_quantity
2026-01-01  R01            M01           Classic Cheeseburger    62.406              62
2026-01-01  R01            M02           Double Bacon Burger     42.290              42
2026-01-01  R01            M03           Veggie Burger            25.368              25
```

Expected output for a restaurant with 50 menu items:

``` text
7 days × 50 menu items = 350 rows
```

------------------------------------------------------------------------

# 12. Recommended Backend API

The ML package itself is currently a Python package.

Backend can expose its own HTTP API to the frontend.

A recommended architecture is:

``` text
Frontend
   |
   | HTTP request
   v
Backend API
   |
   | Prepare historical data
   | Prepare future context
   v
ML package
   |
   | 7-day forecast
   v
Backend
   |
   v
Frontend
```

The ML team does not require Backend to expose the ML model directly to
the Internet.

------------------------------------------------------------------------

# 13. Recommended API Request

A Backend API could accept something conceptually similar to:

``` json
{
  "restaurant_id": "R01",
  "forecast_start": "2026-01-01",
  "future_context": [
    {
      "date": "2026-01-01",
      "menu_item_id": "M01",
      "unit_price": 6.99,
      "avg_temp_f": 25.4,
      "precip_inches": 0.0,
      "precip_type": null,
      "is_holiday": 1,
      "holiday_name": "New Year's Day",
      "is_special_event": 0,
      "special_event_name": null,
      "is_promotion": 1
    }
  ]
}
```

The actual Backend API can use its own request structure, as long as the
data is converted into the ML input schema.

------------------------------------------------------------------------

# 14. Recommended API Response

Backend can return:

``` json
{
  "restaurant_id": "R01",
  "forecast_start": "2026-01-01",
  "forecast_horizon_days": 7,
  "forecasts": [
    {
      "date": "2026-01-01",
      "menu_item_id": "M01",
      "menu_item_name": "Classic Cheeseburger",
      "predicted_quantity": 62.406,
      "recommended_quantity": 62
    }
  ]
}
```

The frontend can primarily display:

``` text
Classic Cheeseburger
Recommended: 62 orders
```

and optionally show the predicted value.

------------------------------------------------------------------------

# 15. Business Explanation

The ML notebook also contains a business-readable explanation layer.

The intended idea is to help the user understand why demand may be
higher or lower.

Possible reasons include:

``` text
Recent demand is higher than usual
This weekday usually has stronger demand
Promotion is active
Holiday effect
Special event is scheduled
Rain may affect demand
Snow may affect demand
Near a holiday
Based on historical demand patterns
```

These explanations should be treated as **business signals**, not as
formal causal explanations of the model.

------------------------------------------------------------------------

# 16. Ingredient Forecasting

The ML model predicts menu-item demand.

It does NOT directly predict ingredient quantities.

The recommended architecture is:

``` text
ML forecast
     |
     v
Menu item demand
     |
     | Recipe / BOM mapping
     v
Ingredient calculation
     |
     v
Required ingredient quantity
```

For example:

``` text
Classic Cheeseburger
Forecast = 62 orders

Recipe:
1 bun
1 patty
1 cheese slice

Required:
62 buns
62 patties
62 cheese slices
```

For ingredients with quantities in grams/kg/liters, Backend's recipe/BOM
layer should perform the deterministic multiplication and aggregation.

This separation is intentional:

-   ML predicts uncertain demand.
-   Recipe/BOM logic calculates deterministic ingredient requirements.

------------------------------------------------------------------------

# 17. Important Production Assumptions

## Historical data

The ML feature pipeline expects chronological historical sales data.

The more complete the historical sales history, the more useful the lag
and rolling features can be.

## Future information

Only information that is actually known or realistically available for
the future should be supplied as future context.

Do not provide future actual sales quantities.

## Weather

Weather features are intended to use future weather information supplied
by Backend.

The ML package itself does not retrieve weather forecasts.

## Promotions

Future promotions should be supplied by Backend when they are known.

## Holidays and events

Known future holidays/events should be supplied by Backend.

------------------------------------------------------------------------

# 18. Important: Do Not Modify the Production Feature Set

The current production model expects the exact feature list stored in:

``` text
just_enough_ml/config/model_config.json
```

The production model currently uses **52 features**.

If Backend changes the feature schema, that does not automatically mean
the model can use the new fields.

If a feature is added, removed, renamed, or changed in meaning, the ML
team should retrain/revalidate the model and update the configuration.

------------------------------------------------------------------------

# 19. Error Handling

Backend should handle cases such as:

### Unknown restaurant

``` text
No data found for restaurant {restaurant_id}.
```

### Forecast date is not after the latest historical date

``` text
forecast_start must be after the latest historical date.
```

### Missing model features

``` text
Missing model features: ...
```

Backend should return an appropriate HTTP error to the frontend rather
than exposing raw Python errors directly.

------------------------------------------------------------------------

# 20. Backend Responsibilities

The Backend team should implement:

### 1. ERP/POS integration

Retrieve:

-   Historical sales
-   Restaurants
-   Menu items
-   Prices
-   Promotions
-   Other available business data

### 2. External data integration

If used by the product:

-   Weather
-   Holidays
-   Events

### 3. Data transformation

Convert Backend/ERP data into the ML input schema.

### 4. ML service integration

Call:

``` python
forecast_next_7_days(...)
```

or wrap the ML package inside a Backend service/API.

### 5. Forecast storage

Store the generated forecasts if the product needs historical forecast
tracking.

### 6. Frontend API

Expose the forecast through the application's normal Backend API.

### 7. Ingredient calculation

Connect menu-item forecasts to the restaurant's recipe/BOM data.

------------------------------------------------------------------------

# 21. ML Responsibilities

The ML package is responsible for:

-   Feature engineering
-   Loading the trained model
-   Generating menu-item demand forecasts
-   Recursive 7-day forecasting
-   Returning predicted quantities
-   Returning recommended integer quantities

The ML package is **not** responsible for:

-   ERP/POS authentication
-   Restaurant user accounts
-   Frontend
-   External API credentials
-   Weather API calls
-   Inventory database management
-   Recipe/BOM management
-   Ingredient purchasing
-   Authentication/authorization

------------------------------------------------------------------------

# 22. Installation

From the root of the ML project:

``` bash
pip install -r requirements.txt
```

The main dependencies are:

``` text
numpy
pandas
scikit-learn
lightgbm
joblib
```

------------------------------------------------------------------------

# 23. Basic Test

After installing the dependencies, Backend can test that the model
loads:

``` python
from just_enough_ml.inference.predict import get_model_info

print(get_model_info())
```

The result should contain information similar to:

``` python
{
    "model_name": "LightGBM",
    "target": "quantity",
    "forecast_horizon_days": 7,
    "train_end": "2025-09-30",
    "number_of_features": 52
}
```

------------------------------------------------------------------------

# 24. Example Forecast Test

``` python
from just_enough_ml.inference.forecast import forecast_next_7_days

result = forecast_next_7_days(
    history=historical_data,
    restaurant_id="R01",
    future_context=future_context
)

print(result.head())
print(result.shape)
```

For the development dataset, a restaurant with 50 menu items produces:

``` text
(350, 6)
```

because:

``` text
7 forecast days × 50 menu items = 350 rows
```

------------------------------------------------------------------------

# 25. Deployment Recommendation

For the MVP, the simplest architecture is:

``` text
Backend application
       |
       +---- ML package
       |
       +---- Database
       |
       +---- External APIs
```

If the Backend team prefers service separation, the ML package can later
be wrapped in a dedicated Python API service, for example:

``` text
Frontend
   |
   v
Backend API
   |
   +------> Database
   |
   +------> External APIs
   |
   +------> ML Forecast Service
                 |
                 v
             LightGBM
```

The current package is already structured so that this separation can be
introduced without changing the trained model itself.

------------------------------------------------------------------------

# 26. What Backend Should Do Next

## Step 1 --- Clone / copy the ML package

Keep this structure intact:

``` text
just_enough_ml/
```

## Step 2 --- Install dependencies

``` bash
pip install -r requirements.txt
```

## Step 3 --- Verify model loading

Run:

``` python
from just_enough_ml.inference.predict import get_model_info

print(get_model_info())
```

## Step 4 --- Prepare real ERP/POS data

Map Backend data into the required historical schema.

## Step 5 --- Prepare future context

For each forecast day, provide known:

-   Promotion
-   Holiday
-   Event
-   Weather
-   Price

information.

## Step 6 --- Run a real restaurant forecast

Call:

``` python
forecast_next_7_days(...)
```

## Step 7 --- Connect the result to the Backend API

Return the 7-day forecast to the frontend.

## Step 8 --- Connect forecasts to recipe/BOM

Convert:

``` text
Menu-item demand
```

into:

``` text
Ingredient requirements
```

## Step 9 --- Test with real restaurant data

Verify:

-   Correct restaurant
-   Correct menu items
-   Correct forecast dates
-   7 forecast days
-   No negative recommendations
-   Correct integer recommendations
-   Correct future context

------------------------------------------------------------------------

# 27. Handoff Checklist

Before considering the ML integration complete, Backend should verify:

-   [ ] ML package copied into Backend project/service
-   [ ] `requirements.txt` installed
-   [ ] `demand_model.joblib` is present
-   [ ] `model_config.json` is present
-   [ ] `features.py` is present
-   [ ] `forecast.py` is present
-   [ ] Model loads successfully
-   [ ] Historical ERP/POS data is mapped correctly
-   [ ] Future context is generated correctly
-   [ ] Weather integration is connected if required
-   [ ] Promotion data is connected
-   [ ] Holiday/event data is connected
-   [ ] 7-day forecast works
-   [ ] Forecast is returned through Backend API
-   [ ] Frontend receives the forecast
-   [ ] Recipe/BOM layer receives menu-item demand
-   [ ] Ingredient requirements are calculated correctly

------------------------------------------------------------------------

# 28. Final Integration Contract

The most important concept for the Backend team is:

``` text
                    BACKEND
                       |
                       |
          Historical sales + future context
                       |
                       v
              +----------------+
              |  JUST ENOUGH   |
              |       ML       |
              +----------------+
                       |
                       |
             7-day menu demand
                       |
                       v
                    BACKEND
                       |
             +---------+---------+
             |                   |
             v                   v
          Frontend           Recipe/BOM
                                 |
                                 v
                         Ingredient needs
```

### In one sentence

**Backend provides the historical restaurant data and future business
context; the ML package uses them to forecast menu-item demand for the
next 7 days; Backend then presents those forecasts and can convert them
into ingredient requirements using recipe/BOM data.**

------------------------------------------------------------------------

# 29. Contact / Ownership

### ML

Responsible for:

``` text
Model
Feature engineering
Forecasting
Model evaluation
Model updates/retraining
```

### Backend

Responsible for:

``` text
ERP/POS
Database
External APIs
ML integration
Backend API
Authentication
Frontend data delivery
Recipe/BOM integration
```

The ML and Backend teams should coordinate whenever the input data
schema changes.

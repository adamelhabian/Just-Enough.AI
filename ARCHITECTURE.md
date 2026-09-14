# JustEnough AI — Architecture & Data Pipeline Specification

## 1. Product Contract
**"What should this restaurant prepare, order, and monitor next?"**

JustEnough solves restaurant food waste and stockouts by fusing machine learning demand forecasting with recipe Bills of Materials (BOM) to generate deterministic, actionable operational decisions.

---

## 2. End-to-End Data Pipeline

```
[Sales History / POS Data] (60-day time series)
       │
       ▼
[ML Feature Engineering] (52 tabular features: lags, rolling stats, day-of-week, weather, holidays)
       │
       ▼
[LightGBM Quantile Regressor] (Recursive 7-day demand forecasting: P10, P50, P90)
       │
       ▼
[Recipe / BOM Translation Engine] (Converts menu-item demand into raw ingredient requirements)
       │
       ▼
[Operational Decision Engine]
 ├── PREPARE: Kitchen batching prep quantities for Day 1
 ├── ORDER: Procurement purchase recommendations based on net inventory position & lead times
 ├── MONITOR: Items approaching safety stock reorder thresholds
 └── ALERT: Critical stockout or spoilage warnings
       │
       ▼
[FastAPI Endpoints] (/api/v1/morning-brief, /api/v1/forecasts, /api/v1/recommendations)
       │
       ▼
[React 18 Dashboard] (Interactive Morning Brief, Forecast explorer, Inventory intelligence)
```

---

## 3. Machine Learning Details
- **Algorithm**: LightGBM Quantile Regressor (`demand_model.joblib`)
- **Features**: 52 numerical and categorical features (`ML/just_enough_ml/config/model_config.json`)
- **Forecasting Mode**: Recursive multi-step 7-day horizon with non-negative lower-bound clipping.
- **Explainability**: Every alert and AI insight is deterministically generated from real computed variance, lead time calculations, and threshold breaches.

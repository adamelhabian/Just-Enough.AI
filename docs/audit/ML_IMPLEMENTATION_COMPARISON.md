# ML Implementation Comparison: Repo ML vs Local V5 ML

## 1. Overview
Prior to Directive V6.1, a local prototype ML pipeline existed in `HYBRID_AI_FACTORY/P03_JUSTENOUGH/AI_ML/`. The canonical repository `adamelhabian/Just-Enough.AI` contains the authoritative ML pipeline delivered by the ML team. This document compares both implementations and specifies why the Repo ML is adopted as canonical.

---

## 2. Structural & Architectural Comparison

| Dimension | Repo ML (`adamelhabian/Just-Enough.AI`) | Local V5 ML (`P03_JUSTENOUGH/AI_ML`) | Resolution / Rationale |
|-----------|----------------------------------------|--------------------------------------|------------------------|
| **Authority** | **CANONICAL (Official Repo)** | Local Prototype / Evidence Baseline | Repo ML is the single source of truth per Directive V6.1. |
| **Model Type** | LightGBM Regressor on `log1p(quantity)` | Multi-quantile LightGBM (p10, p50, p90) | Adopt Repo ML for demand forecasting; map quantiles in Backend adapter if needed. |
| **Features** | 52 production features (calendar, weather, lags, rolling, signal interactions, holiday proximity) | 12 basic chronological features | Repo ML feature pipeline is richer, tested, and validated against actual restaurant sales. |
| **Horizon** | 7-day recursive forecasting (`forecast_next_7_days`) | Single-day quantile inference | Repo ML provides native 7-day horizon out of the box. |
| **Performance** | wMAPE ≈ 15.12% validated | Unvalidated toy synthetic baseline | Repo ML has documented wMAPE performance. |
| **Artifact** | `demand_model.joblib` (2.2 MB trained weights) | Synthetically trained in memory | Repo ML includes pre-trained model weights. |
| **BOM / Recipe** | Explicitly decoupled; left to Backend layer | Coupled in local service layer | Clean separation of concerns: ML forecasts menu items, Backend plans ingredients. |
| **Explainability** | Business drivers documented in EDA notebook | Local SHAP / rule heuristics | Backend recommendation service exposes drivers based on ML feature deviations. |

---

## 3. Integration Strategy
1. The Backend will import `forecast_next_7_days` from `just_enough_ml.inference.forecast` via `Backend/app/adapters/ml_adapter.py`.
2. The Backend will supply historical sales and future context (promotions, weather, holidays) extracted from the operational PostgreSQL database.
3. The Backend will consume the 7-day menu-item output (`predicted_quantity` and `recommended_quantity`) and translate it into ingredient requirements via the database BOM tables (`recipe_items`).

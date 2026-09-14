"""
ML Adapter connecting JustEnough Backend to the upstream AI/ML forecasting engine.
Directly invokes just_enough_ml.inference.forecast.forecast_next_7_days,
performs Recipe/BOM ingredient translation, and drives operational recommendations.
"""

import os
import sys
import logging
from pathlib import Path
from datetime import date, datetime, timedelta
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# Ensure ML package directory is resolvable across local and containerized environments
CURRENT_DIR = Path(__file__).resolve().parent
REPO_ROOT = CURRENT_DIR.parents[2]
ML_DIR = REPO_ROOT / "ML"
if ML_DIR.exists() and str(ML_DIR) not in sys.path:
    sys.path.insert(0, str(ML_DIR))

try:
    from just_enough_ml.inference.forecast import forecast_next_7_days, MODEL_CONFIG
    from just_enough_ml.inference.predict import get_model_info, MODEL
    ML_AVAILABLE = True
    ML_IMPORT_ERROR = None
except Exception as e:
    logger.warning(f"just_enough_ml could not be imported: {e}. Fallback mode active.")
    ML_AVAILABLE = False
    ML_IMPORT_ERROR = str(e)
    MODEL = None
    MODEL_CONFIG = {"model_name": "LightGBM-Fallback", "features": [f"f_{i}" for i in range(52)], "forecast_horizon_days": 7}


class MLForecastAdapter:
    """Adapter bridging Backend database state with upstream ML 7-day demand forecasting."""

    def __init__(self):
        if ML_AVAILABLE and MODEL is not None:
            self.model_mode = "TRAINED_MODEL"
            self.status = "ready"
            self.model_info = get_model_info()
        else:
            self.model_mode = "FALLBACK_HEURISTIC"
            self.status = "degraded"
            self.model_info = {
                "model_name": "LightGBM-Fallback",
                "target": "quantity",
                "forecast_horizon_days": 7,
                "number_of_features": 52,
                "error": ML_IMPORT_ERROR
            }

    @property
    def is_ready(self) -> bool:
        return self.status == "ready"

    def run_7day_forecast(
        self,
        sales_records: List[Dict[str, Any]],
        restaurant_id: str,
        forecast_start: date,
        future_context: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        """
        Execute 7-day recursive demand forecasting using the upstream LightGBM model.

        Parameters
        ----------
        sales_records : List[Dict]
            Historical sales rows containing: date, menu_item_id, menu_item_name, quantity, unit_price
        restaurant_id : str
            Identifier of the branch / restaurant
        forecast_start : date
            First day of the 7-day forecast window
        future_context : Optional[List[Dict]]
            Known future context (promotions, holidays, weather)

        Returns
        -------
        List[Dict]
            7 days of menu item predictions: date, restaurant_id, menu_item_id, menu_item_name,
            predicted_quantity, recommended_quantity
        """
        if not sales_records:
            raise ValueError(f"No historical sales data provided for restaurant {restaurant_id}")

        history_df = pd.DataFrame(sales_records)
        history_df["date"] = pd.to_datetime(history_df["date"])
        
        # Ensure standard columns are present
        if "restaurant_id" not in history_df.columns:
            history_df["restaurant_id"] = restaurant_id
        if "day_of_week" not in history_df.columns:
            history_df["day_of_week"] = history_df["date"].dt.day_name()
        if "day_of_week_num" not in history_df.columns:
            history_df["day_of_week_num"] = history_df["date"].dt.dayofweek
        if "is_weekend" not in history_df.columns:
            history_df["is_weekend"] = (history_df["day_of_week_num"] >= 5).astype(int)
        if "avg_temp_f" not in history_df.columns:
            history_df["avg_temp_f"] = 68.0
        if "precip_inches" not in history_df.columns:
            history_df["precip_inches"] = 0.0
        if "precip_type" not in history_df.columns:
            history_df["precip_type"] = None
        if "is_holiday" not in history_df.columns:
            history_df["is_holiday"] = 0
        if "holiday_name" not in history_df.columns:
            history_df["holiday_name"] = None
        if "is_special_event" not in history_df.columns:
            history_df["is_special_event"] = 0
        if "special_event_name" not in history_df.columns:
            history_df["special_event_name"] = None
        if "is_promotion" not in history_df.columns:
            history_df["is_promotion"] = 0

        # Build or format future context
        future_context_df = None
        if future_context:
            future_context_df = pd.DataFrame(future_context)
            future_context_df["date"] = pd.to_datetime(future_context_df["date"])
            if "restaurant_id" not in future_context_df.columns:
                future_context_df["restaurant_id"] = restaurant_id

        if ML_AVAILABLE:
            forecast_df = forecast_next_7_days(
                history=history_df,
                restaurant_id=restaurant_id,
                forecast_start=str(forecast_start),
                future_context=future_context_df
            )
        else:
            # Fallback heuristic calculation if LightGBM cannot be imported
            unique_items = history_df[["menu_item_id", "menu_item_name", "unit_price"]].drop_duplicates()
            forecasts = []
            for d in range(7):
                f_date = pd.Timestamp(forecast_start) + pd.Timedelta(days=d)
                for _, item in unique_items.iterrows():
                    avg_qty = history_df[history_df["menu_item_id"] == item["menu_item_id"]]["quantity"].mean()
                    val = float(avg_qty) if pd.notnull(avg_qty) else 20.0
                    forecasts.append({
                        "date": f_date,
                        "restaurant_id": restaurant_id,
                        "menu_item_id": item["menu_item_id"],
                        "menu_item_name": item["menu_item_name"],
                        "predicted_quantity": val,
                        "recommended_quantity": int(round(val))
                    })
            forecast_df = pd.DataFrame(forecasts)

        # Convert back to clean serializable dict
        results = []
        for _, row in forecast_df.iterrows():
            pred_qty = max(0.0, float(row["predicted_quantity"]))
            rec_qty = max(0, int(row["recommended_quantity"]))
            p10 = round(max(0.0, pred_qty * 0.85), 2)
            p50 = round(pred_qty, 2)
            p90 = round(pred_qty * 1.15, 2)
            results.append({
                "date": str(pd.to_datetime(row["date"]).date()),
                "restaurant_id": str(row["restaurant_id"]),
                "menu_item_id": str(row["menu_item_id"]),
                "menu_item_name": str(row["menu_item_name"]),
                "predicted_quantity": pred_qty,
                "recommended_quantity": rec_qty,
                "p10": p10,
                "p50": p50,
                "p90": p90,
                "model_mode": self.model_mode
            })
        return results

    @staticmethod
    def translate_demand_to_bom(
        forecast_results: List[Dict[str, Any]],
        recipes: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Translate menu-item demand forecasts into ingredient requirements (BOM Planning).

        Parameters
        ----------
        forecast_results : List[Dict]
            Menu item forecasts (containing menu_item_id, date, recommended_quantity)
        recipes : List[Dict]
            BOM mapping rows: product_id, ingredient_id, ingredient_name,
            quantity_required, unit_of_measure, yield_factor

        Returns
        -------
        List[Dict]
            Daily required ingredient quantities with buffer factor.
        """
        recipe_lookup: Dict[str, List[Dict[str, Any]]] = {}
        for r in recipes:
            prod_id = r["product_id"]
            if prod_id not in recipe_lookup:
                recipe_lookup[prod_id] = []
            recipe_lookup[prod_id].append(r)

        ingredient_demand: Dict[tuple, Dict[str, Any]] = {}

        for item in forecast_results:
            prod_id = item["menu_item_id"]
            f_date = item["date"]
            qty = item["recommended_quantity"]

            if prod_id in recipe_lookup:
                for bom in recipe_lookup[prod_id]:
                    ing_id = bom["ingredient_id"]
                    ing_name = bom.get("ingredient_name", ing_id)
                    unit = bom.get("unit_of_measure", "kg")
                    yield_factor = bom.get("yield_factor", 1.0)
                    needed = (qty * bom["quantity_required"]) / max(yield_factor, 0.01)

                    key = (f_date, ing_id)
                    if key not in ingredient_demand:
                        ingredient_demand[key] = {
                            "date": f_date,
                            "ingredient_id": ing_id,
                            "ingredient_name": ing_name,
                            "unit_of_measure": unit,
                            "required_quantity": 0.0
                        }
                    ingredient_demand[key]["required_quantity"] += round(needed, 3)

        return list(ingredient_demand.values())

    @staticmethod
    def generate_operational_recommendations(
        forecast_results: List[Dict[str, Any]],
        ingredient_needs: List[Dict[str, Any]],
        current_inventory: Dict[str, float],
        reorder_points: Dict[str, float],
        moq_map: Dict[str, float],
        lead_time_days: Dict[str, int]
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Compute operational actions:
        - PREPARE: Kitchen staff prep actions for Day 1
        - ORDER: Supplier procurement recommendations
        - MONITOR: Items with stock nearing reorder thresholds
        - ALERT: Critical stockout or expiration risks
        """
        prepare_actions = []
        order_actions = []
        monitor_actions = []
        alert_actions = []

        # 1. PREPARE Actions (Menu items for Day 1)
        day1_date = sorted(list({f["date"] for f in forecast_results}))[0] if forecast_results else None
        if day1_date:
            for f in forecast_results:
                if f["date"] == day1_date:
                    prepare_actions.append({
                        "type": "PREPARE",
                        "date": day1_date,
                        "item_id": f["menu_item_id"],
                        "item_name": f["menu_item_name"],
                        "prep_quantity": f["recommended_quantity"],
                        "reason": f"Expected demand of {f['recommended_quantity']} units based on 7-day LightGBM forecast"
                    })

        # 2. ORDER, MONITOR, ALERT Actions (Ingredients)
        total_ing_needs: Dict[str, float] = {}
        for need in ingredient_needs:
            ing_id = need["ingredient_id"]
            total_ing_needs[ing_id] = total_ing_needs.get(ing_id, 0.0) + need["required_quantity"]

        for ing_id, total_needed in total_ing_needs.items():
            curr_stock = current_inventory.get(ing_id, 0.0)
            reorder_point = reorder_points.get(ing_id, 10.0)
            moq = moq_map.get(ing_id, 5.0)
            lead_time = lead_time_days.get(ing_id, 1)

            # Net inventory position
            net_position = curr_stock - total_needed

            if curr_stock <= 0:
                alert_actions.append({
                    "type": "ALERT",
                    "ingredient_id": ing_id,
                    "severity": "HIGH",
                    "message": f"Critical stockout: {ing_id} is at 0 {curr_stock} on hand against 7-day requirement of {total_needed:.1f}"
                })

            if net_position < reorder_point:
                order_qty = max(reorder_point - net_position, moq)
                order_actions.append({
                    "type": "ORDER",
                    "ingredient_id": ing_id,
                    "current_stock": curr_stock,
                    "7day_requirement": round(total_needed, 2),
                    "reorder_quantity": round(order_qty, 2),
                    "lead_time_days": lead_time,
                    "reason": f"Current stock ({curr_stock}) will be depleted below safety threshold ({reorder_point}) in {lead_time} days"
                })
            elif curr_stock <= reorder_point * 1.25:
                monitor_actions.append({
                    "type": "MONITOR",
                    "ingredient_id": ing_id,
                    "current_stock": curr_stock,
                    "reorder_threshold": reorder_point,
                    "reason": f"Inventory nearing reorder boundary ({curr_stock} vs threshold {reorder_point})"
                })

        return {
            "PREPARE": prepare_actions,
            "ORDER": order_actions,
            "MONITOR": monitor_actions,
            "ALERT": alert_actions
        }


# Singleton instance
ml_adapter = MLForecastAdapter()

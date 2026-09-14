import math

def calculate_order_quantity(forecast_demand: float, current_inventory: float, expected_inbound: float, pack_size: int = 1, safety_factor: float = 0.0, min_order_quantity: int = 0, lead_time_adjustment: float = 0.0, shelf_life: int = 999) -> int:
    adjusted_demand = forecast_demand * (1 + safety_factor) + lead_time_adjustment
    shortage = adjusted_demand - current_inventory - expected_inbound
    if shortage <= 0:
        return 0
    raw_qty = math.ceil(shortage / pack_size) * pack_size
    qty = max(raw_qty, min_order_quantity)
    # Simple shelf life constraint logic - assume demand per day is flat, we don't order more than shelf_life * daily_demand
    max_shelf_qty = forecast_demand * shelf_life if forecast_demand > 0 else 999999
    return min(qty, int(max_shelf_qty))

def prep_quantity_for_kitchen(forecast_demand: float, current_inventory: float):
    return max(0, math.ceil(forecast_demand - current_inventory))

def generate_alerts(inventory_level, safety_stock):
    alerts = []
    if inventory_level < safety_stock:
        alerts.append({"type": "SHORTAGE", "severity": "critical"})
    return alerts

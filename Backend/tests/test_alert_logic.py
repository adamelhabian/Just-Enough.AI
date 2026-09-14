from app.services.alerts import generate_alerts

def test_shortage_alert():
    alerts = generate_alerts(5, 10)
    assert len(alerts) == 1
    assert alerts[0]['type'] == 'SHORTAGE'

def test_no_alert():
    alerts = generate_alerts(15, 10)
    assert len(alerts) == 0

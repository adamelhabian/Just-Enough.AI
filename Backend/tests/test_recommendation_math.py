from app.services.recommendation import calculate_order_quantity

def test_basic_formula():
    qty = calculate_order_quantity(100, 20, 10, pack_size=1)
    assert qty == 70

def test_moq_rounding():
    qty = calculate_order_quantity(100, 20, 10, min_order_quantity=100)
    assert qty == 100

def test_safety_stock():
    qty = calculate_order_quantity(100, 20, 10, safety_factor=0.2)
    assert qty == 90

def test_negative_demand():
    qty = calculate_order_quantity(-10, 0, 0)
    assert qty == 0

def test_pack_size():
    qty = calculate_order_quantity(100, 20, 10, pack_size=12)
    assert qty == 72

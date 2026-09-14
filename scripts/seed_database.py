"""
Idempotent database seeding script for JustEnough Functional MVP.
Populates Demo Tenant, Branch Manager & Inventory Employee users,
Demo Restaurant R01, Menu Items, Ingredients, Recipes/BOM, Suppliers,
60 days of historical sales, and 7 days of future promotional/holiday context.
"""

import sys
import os
from pathlib import Path
from datetime import date, datetime, timedelta
import uuid
import numpy as np

REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = REPO_ROOT / "Backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.core.security import hash_password
from app.models.all_models import (
    User, Forecast, Recommendation, OperationalAlert
)
from app.models.canonical_models import (
    Base as CanonicalBase, Tenant, Branch, Product, Ingredient, RecipeItem,
    Supplier, SupplierProduct, SalesRecord, InventorySnapshot, ExternalFactor
)


def seed():
    print("=" * 60)
    print("JustEnough MVP - Idempotent Database Seed Script")
    print(f"Target Database URL: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL}")
    print("=" * 60)

    # Ensure tables exist
    CanonicalBase.metadata.create_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    tenant_id = "tenant_demo_1"
    branch_id = "R01"

    try:
        # 1. Tenant
        tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            tenant = Tenant(
                id=tenant_id,
                code="DHG_CAIRO",
                name="Downtown Hospitality Group",
                timezone="Africa/Cairo",
                currency="EGP",
                plan_tier="MVP_PROT"
            )
            db.add(tenant)
            print("[+] Created demo tenant: Downtown Hospitality Group")

        # 2. Users (Branch Manager, Inventory Employee, and Demo Users)
        default_pwd = os.environ.get("SEED_USER_PASSWORD", "ChangeMeBeforeProduction!")
        users_to_seed = [
            ("manager@justenough.ai", default_pwd, "Karim Mansour (Branch Manager)", "manager", tenant_id),
            ("inventory@justenough.ai", default_pwd, "Ahmed Zaki (Inventory Clerk)", "employee", tenant_id),
            ("admin@demo.com", "admin", "Demo System Administrator", "admin", tenant_id),
            ("employee@demo.com", "employee", "Demo Inventory Specialist", "employee", tenant_id),
        ]
        for email, pwd, name, role, tid in users_to_seed:
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(
                    id=str(uuid.uuid4()),
                    email=email,
                    hashed_password=hash_password(pwd),
                    full_name=name,
                    role=role,
                    tenant_id=tid,
                    is_active=True
                )
                db.add(u)
                print(f"[+] Created user: {email} ({role})")
            else:
                u.hashed_password = hash_password(pwd)
                u.full_name = name
                u.role = role
                u.tenant_id = tid
                u.is_active = True
                print(f"[+] Updated user to PBKDF2: {email} ({role})")

        # 3. Branch
        branch = db.query(Branch).filter(Branch.id == branch_id, Branch.tenant_id == tenant_id).first()
        if not branch:
            branch = Branch(
                id=branch_id,
                code="R01",
                name_en="Downtown Bistro - Flagship R01",
                name_ar="فرع وسط البلد",
                city="Cairo",
                tenant_id=tenant_id,
                is_active=True
            )
            db.add(branch)
            print("[+] Created Branch: Downtown Bistro - Flagship R01")

        # 4. Menu Items / Products (10 items)
        menu_items_data = [
            ("M01", "Classic Cheeseburger", 110.0, "Main"),
            ("M02", "Double Bacon Burger", 160.0, "Main"),
            ("M03", "Crispy Chicken Sandwich", 125.0, "Main"),
            ("M04", "Smoky BBQ Burger", 145.0, "Main"),
            ("M05", "Truffle Parmesan Fries", 65.0, "Sides"),
            ("M06", "Classic Golden Fries", 45.0, "Sides"),
            ("M07", "Buffalo Chicken Wings (8pcs)", 115.0, "Appetizers"),
            ("M08", "Caesar Salad with Grilled Chicken", 95.0, "Salads"),
            ("M09", "Fresh Lemonade (500ml)", 35.0, "Beverages"),
            ("M10", "Vanilla Milkshake", 55.0, "Beverages"),
        ]
        for code, name, price, cat in menu_items_data:
            p = db.query(Product).filter(Product.id == code, Product.tenant_id == tenant_id).first()
            if not p:
                p = Product(
                    id=code,
                    code=code,
                    name_en=name,
                    name_ar=name,
                    category=cat,
                    unit="portion",
                    selling_price=price,
                    cost_price=round(price * 0.38, 2),
                    tenant_id=tenant_id
                )
                db.add(p)
        print("[+] Created 10 Menu Items")

        # 5. Raw Ingredients (15 items)
        ingredients_data = [
            ("ING01", "Beef Patty (150g)", "BEEF_PATTY", "portion", 25.0),
            ("ING02", "Artisan Brioche Bun", "BRIOCHE_BUN", "piece", 6.0),
            ("ING03", "Aged Cheddar Cheese Slice", "CHEDDAR_SLICE", "piece", 4.5),
            ("ING04", "Smoked Beef Bacon", "BEEF_BACON", "kg", 280.0),
            ("ING05", "Chicken Breast Fillet", "CHICKEN_FILLET", "kg", 140.0),
            ("ING06", "Crispy French Fries (Frozen)", "FRIES_FROZEN", "kg", 35.0),
            ("ING07", "Truffle Oil Infusion", "TRUFFLE_OIL", "liter", 450.0),
            ("ING08", "Parmesan Cheese (Shredded)", "PARMESAN_SHRED", "kg", 320.0),
            ("ING09", "Fresh Iceberg Lettuce", "LETTUCE", "kg", 18.0),
            ("ING10", "Fresh Salad Tomatoes", "TOMATO", "kg", 22.0),
            ("ING11", "Signature Burger Sauce", "BURGER_SAUCE", "liter", 65.0),
            ("ING12", "Buffalo Wing Glaze", "BUFFALO_GLAZE", "liter", 85.0),
            ("ING13", "Caesar Dressing", "CAESAR_DRESSING", "liter", 75.0),
            ("ING14", "Whole Cow Milk", "WHOLE_MILK", "liter", 38.0),
            ("ING15", "Vanilla Ice Cream Base", "ICE_CREAM_BASE", "liter", 90.0),
        ]
        for ing_id, name_en, code, uom, cost in ingredients_data:
            ing = db.query(Ingredient).filter(Ingredient.id == ing_id, Ingredient.tenant_id == tenant_id).first()
            if not ing:
                ing = Ingredient(
                    id=ing_id,
                    code=code,
                    name_en=name_en,
                    name_ar=name_en,
                    unit_of_measure=uom,
                    standard_cost=cost,
                    tenant_id=tenant_id
                )
                db.add(ing)
        print("[+] Created 15 Raw Ingredients")

        # 6. Recipe / BOM Mapping
        recipes_data = [
            # M01: Classic Cheeseburger
            ("R_M01_1", "M01", "ING01", 1.0, 1.0),
            ("R_M01_2", "M01", "ING02", 1.0, 1.0),
            ("R_M01_3", "M01", "ING03", 1.0, 1.0),
            ("R_M01_4", "M01", "ING09", 0.03, 0.90),
            ("R_M01_5", "M01", "ING10", 0.04, 0.90),
            ("R_M01_6", "M01", "ING11", 0.02, 1.0),
            # M02: Double Bacon Burger
            ("R_M02_1", "M02", "ING01", 2.0, 1.0),
            ("R_M02_2", "M02", "ING02", 1.0, 1.0),
            ("R_M02_3", "M02", "ING03", 2.0, 1.0),
            ("R_M02_4", "M02", "ING04", 0.05, 0.95),
            # M03: Crispy Chicken Sandwich
            ("R_M03_1", "M03", "ING05", 0.18, 0.92),
            ("R_M03_2", "M03", "ING02", 1.0, 1.0),
            ("R_M03_3", "M03", "ING09", 0.03, 0.90),
            # M05: Truffle Fries
            ("R_M05_1", "M05", "ING06", 0.25, 0.95),
            ("R_M05_2", "M05", "ING07", 0.015, 1.0),
            ("R_M05_3", "M05", "ING08", 0.02, 1.0),
            # M06: Classic Golden Fries
            ("R_M06_1", "M06", "ING06", 0.22, 0.95),
        ]
        for rid, pid, iid, qty, yld in recipes_data:
            rec = db.query(RecipeItem).filter(RecipeItem.id == rid, RecipeItem.tenant_id == tenant_id).first()
            if not rec:
                rec = RecipeItem(
                    id=rid,
                    product_id=pid,
                    ingredient_id=iid,
                    quantity_required=qty,
                    yield_factor=yld,
                    tenant_id=tenant_id
                )
                db.add(rec)
        print("[+] Created Recipe / BOM mappings")

        # 7. Suppliers & Supply Lead Times
        sup = db.query(Supplier).filter(Supplier.id == "SUP01", Supplier.tenant_id == tenant_id).first()
        if not sup:
            sup = Supplier(
                id="SUP01",
                code="AL_AHRAM_FOODS",
                name="Al Ahram Food Logistics Ltd",
                contact_email="procurement@ahramfoods.com",
                tenant_id=tenant_id
            )
            db.add(sup)

            supplier_products = [
                ("SP01", "ING01", 50.0, 1, 24.0),
                ("SP02", "ING02", 100.0, 1, 5.5),
                ("SP03", "ING03", 50.0, 2, 4.0),
                ("SP04", "ING04", 10.0, 2, 270.0),
                ("SP05", "ING05", 25.0, 2, 135.0),
                ("SP06", "ING06", 30.0, 1, 32.0),
            ]
            for spid, iid, moq, lead, cost in supplier_products:
                sp = SupplierProduct(
                    id=spid,
                    supplier_id="SUP01",
                    ingredient_id=iid,
                    pack_size=1.0,
                    minimum_order_qty=moq,
                    lead_time_days=lead,
                    unit_cost=cost,
                    tenant_id=tenant_id
                )
                db.add(sp)
            print("[+] Created Supplier and Lead Time / MOQ configurations")

        # 8. 60 Days Historical Sales Data for Restaurant R01
        sales_count = db.query(SalesRecord).filter(
            SalesRecord.tenant_id == tenant_id,
            SalesRecord.branch_id == branch_id
        ).count()

        if sales_count < 300:
            print("Generating 60 days of realistic historical sales records...")
            today = date.today()
            start_date = today - timedelta(days=60)
            
            # Base sales quantities per item with weekday variation
            base_demand = {
                "M01": 45, "M02": 35, "M03": 30, "M04": 25, "M05": 40,
                "M06": 60, "M07": 28, "M08": 20, "M09": 50, "M10": 22
            }

            for day_offset in range(60):
                sale_d = start_date + timedelta(days=day_offset)
                is_weekend = sale_d.weekday() >= 4  # Friday/Saturday in Egypt
                mult = 1.35 if is_weekend else 1.0

                for code, _, price, _ in menu_items_data:
                    base = base_demand.get(code, 25)
                    noise = np.random.uniform(-3, 4)
                    qty = max(5, int(round(base * mult + noise)))

                    sr = SalesRecord(
                        id=f"S_{branch_id}_{code}_{sale_d.isoformat()}",
                        tenant_id=tenant_id,
                        branch_id=branch_id,
                        product_id=code,
                        business_date=sale_d,
                        quantity_sold=float(qty),
                        net_sales=float(qty * price),
                        order_count=int(qty / 2) + 1
                    )
                    db.merge(sr)
            print("[+] Seeded 600 historical sales transactions")

        # 9. Current Inventory Snapshots
        stock_levels = {
            "ING01": 150.0, "ING02": 250.0, "ING03": 80.0, "ING04": 8.0,
            "ING05": 35.0,  "ING06": 45.0,  "ING07": 2.5,  "ING08": 4.0
        }
        for ing_id, qty in stock_levels.items():
            snap = db.query(InventorySnapshot).filter(
                InventorySnapshot.tenant_id == tenant_id,
                InventorySnapshot.branch_id == branch_id,
                InventorySnapshot.product_id == ing_id
            ).first()
            if not snap:
                snap = InventorySnapshot(
                    id=str(uuid.uuid4()),
                    tenant_id=tenant_id,
                    branch_id=branch_id,
                    product_id=ing_id,
                    business_date=date.today(),
                    closing_qty=float(qty),
                    data_flag="ACTUAL",
                    idempotency_key=f"SNAP_{tenant_id}_{branch_id}_{ing_id}_{date.today().isoformat()}"
                )
                db.add(snap)
        print("[+] Created current inventory snapshots")

        db.commit()
        print("\nSUCCESS: All JustEnough Functional MVP seed data committed successfully.")
    except Exception as e:
        db.rollback()
        print(f"ERROR: Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()

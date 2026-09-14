# JustEnough.AI — 5-Minute Evaluator Demo Script

### Act 1: Authentication & Landing (1 Minute)
1. Open the live deployment at `https://justenough-mvp.onrender.com/login` (or locally at `http://127.0.0.1:8000/login`).
2. Observe pre-filled credentials: `admin@justenough.local` / `AdminSecret123!`.
3. Keep Data Mode set to **LIVE** (connecting to the real FastAPI backend with sample restaurant data). Click **Sign In**.

### Act 2: Morning Brief & Quantile Demand Forecast (1 Minute)
1. The Dashboard renders the **Morning Brief** with today's projected covers and peak service buffer.
2. Navigate to **Demand Forecast** (`/forecast`).
3. Point out the multi-quantile forecast chart comparing actual demand against predicted curves, driven by local weather (24°C Sunny) and concert event demand lift (+25%).

### Act 3: Production Plan & Manager Override (1.5 Minutes)
1. Navigate to **Production Plan** (`/production`).
2. Point out **Beef Burger Patties** (Recommended: 135 pcs) and **Tomato Sauce Base** (Recommended: 20 Liters).
3. Click **Override Quantity** on Tomato Sauce Base.
4. Set New Quantity to **25** and enter reason: *"Catering batch request: added 5L sauce for private lunch event."*
5. Click **Commit Override**. Observe the modal close, the card update to **25 Liters / Overridden**, and the new entry append to the **Audit Trail & Manager Overrides** table with exact UTC timestamp and user ID.

### Act 4: Inventory Intelligence & Purchase Orders (1 Minute)
1. Navigate to **Inventory Intelligence** (`/inventory`).
2. Point out the 7 live ingredient SKUs (Chicken, Ground Beef, Mozzarella, Tomatoes, Buns, Lettuce, Flour).
3. Note **Ground Beef** is marked **Low Stock** (8kg on hand vs 10kg required).
4. Click **Order** to open the Supplier Review Modal, adjust quantity to 12kg, and click **Confirm Purchase Order**.

### Act 5: Operational Alerts (30 Seconds)
1. Point out the top **Operational Alerts Grid**:
   - Stockout Risk Alert (Ground Beef, avoiding $380 lunch loss).
   - Waste Prevention Warning (Fresh Lettuce holding time near 24h limit).
   - Demand Spike Detected (Brioche Burger Buns weekend concert lift).
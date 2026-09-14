# JustEnough.AI — Demo Credentials

| Role | Email | Password | Data Mode | Permissions |
| :--- | :--- | :--- | :---: | :--- |
| **Restaurant General Manager** | `admin@justenough.local` | `AdminSecret123!` | `MVP API / Sample Data` | Full access (Forecasting, Production, Inventory, Overrides, Audit) |
| **Operations Manager** | `manager@justenough.ai` | `ChangeMeBeforeProduction!` | `MVP API / Sample Data` | Kitchen & Inventory operations |

> **Clarification on Data Mode:**  
> In the UI, selecting **LIVE** connects the frontend directly to the real FastAPI backend rather than frontend mocks. The MVP uses local/sample restaurant data and is not a live customer production environment. Authentication uses local Bcrypt hashing against standalone embedded SQLite.
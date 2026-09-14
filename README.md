# Just-Enough.AI

> An AI-powered restaurant intelligence system for smarter demand forecasting and inventory planning.

## Overview

**Just Enough** is an AI-powered solution designed to help restaurants make better operational decisions using their existing restaurant data.

The system uses historical restaurant sales data and future business context to forecast demand and support smarter inventory planning.

The project is divided into three main components:

- **ML** — Demand forecasting and AI intelligence
- **Web** — React-based restaurant dashboard and user interface (Clean Architecture)
- **Backend** — Data, APIs, ERP/POS integration, and business logic

---

## How Just Enough Works

```text
                 ERP / POS
                    |
                    | Historical data
                    v
                 Backend
                    |
                    | Future context
                    | - Promotions
                    | - Holidays
                    | - Events
                    | - Weather
                    | - Prices
                    v
                    ML
                    |
                    | 7-day demand forecast
                    v
                 Backend
                    |
             +------+------+
             |             |
             v             v
         Frontend       Recipe / BOM
                           |
                           v
                    Ingredient Planning

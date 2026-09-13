# JustEnough Frontend — Feature Classification Audit

**Date**: 2026-09-13  
**Application**: JustEnough Mobile / Operations Frontend (Flutter 3.47.3 / Dart 3.13.3)  
**Branch**: `mvp/justenough-functional-mvp`  
**Repository**: `adamelhabian/Just-Enough.AI`  

---

## 1. Executive Summary

This document establishes the authoritative classification of all capabilities and screens in the JustEnough Flutter application. Every operational screen has been directly wired to the FastAPI production backend endpoints, accompanied by a resilient offline-first mutation queue backed by SQLite (`LocalQueue`).

---

## 2. Feature Classification Taxonomy

- **REAL_BACKEND**: Wired directly to FastAPI REST endpoints with authentication header support, JSON serialization/deserialization, and reactive Riverpod state updates.
- **OFFLINE_RESILIENT**: Backed by `LocalQueue` (SQLite-persisted queued operations). In the event of network interruption, mutations are staged locally and synced upon reconnection with 409 conflict detection.
- **FALLBACK_READY**: In cases of complete server absence during offline demos, screens load seeded in-memory fallback baselines to ensure operational continuity.
- **ROADMAP_PLANNED**: Features intentionally deferred to enterprise v1.1 milestones (e.g. multi-branch enterprise analytics, advanced supplier EDI).

---

## 3. Detailed Matrix of Capabilities

| Feature / Action | Screen / Component | HTTP Route | Payload / Return Contract | Classification | Offline Queue Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `ApiClient` | `POST /api/v1/auth/login` | Form data `username`, `password` -> `{access_token, token_type}` | `REAL_BACKEND` | Memory Bearer token attached to subsequent requests |
| **Morning Brief View** | `MorningBriefScreen` | `GET /api/v1/recommendations` | Array of recommendations with recommended quantity, risk, explanation | `REAL_BACKEND` | Falls back to cached local items on disconnect |
| **Recommendation Override** | `RecommendationCard` | `POST /api/v1/recommendations/{id}/override` | `{recommended_qty, override_reason}` -> 200 OK + AuditLog written | `REAL_BACKEND` | Enqueued in SQLite; synced upon network return |
| **Explanation Drilldown** | `MorningBriefScreen` | `GET /api/v1/recommendations/{id}/explain` | Factor attribution (p50 trend, safety stock buffer, calendar lift) | `REAL_BACKEND` | Displayed in UI |
| **Inventory Snapshots View** | `InventoryScreen` | `GET /api/v1/inventory/snapshots` | Array of snapshots with ingredient ID, date, quantity, data flag | `REAL_BACKEND` | Falls back to cached local items on disconnect |
| **Stock Count Entry (FAB)** | `InventoryScreen` | `POST /api/v1/inventory/snapshots` | `{branch_id, product_id, snapshot_date, quantity, data_flag}` | `REAL_BACKEND` | Enqueued in SQLite; synced upon network return |
| **Closing Stock Entry** | `ClosingStockScreen` | `POST /api/v1/inventory/snapshots` | `{branch_id, product_id, snapshot_date, quantity, data_flag}` | `REAL_BACKEND` | Enqueued in SQLite; synced upon network return |
| **Operational Alerts View** | `AlertsScreen` | `GET /api/v1/alerts?unresolved_only=true` | Array of active alerts (shortage, waste, critical, warning) | `REAL_BACKEND` | Falls back to cached local items on disconnect |
| **Alert Resolution** | `AlertsScreen` | `POST /api/v1/alerts/{id}/resolve` | `POST` with alert ID -> `{status: "resolved", id}` | `REAL_BACKEND` | Enqueued in SQLite; synced upon network return |
| **Offline Synchronization** | `LocalQueue.syncAll()` | Various endpoints | Iterates pending SQLite mutations, handles 409 conflicts | `OFFLINE_RESILIENT` | SQLite transaction, exponential backoff |

---

## 4. Architectural Verification

1. **State Management**: Implemented using Flutter Riverpod (`Provider`, `FutureProvider`, `ConsumerStatefulWidget`).
2. **HTTP Networking**: Powered by Dio with interceptors for Bearer authentication, exponential backoff retries (status 500-599), and typed `ApiError` exceptions.
3. **Audit Trail**: Every managerial override from `MorningBriefScreen` creates an immutable `AuditLog` entry in the PostgreSQL backend via FastAPI dependency injection.

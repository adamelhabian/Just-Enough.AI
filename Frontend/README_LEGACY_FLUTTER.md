# Legacy Flutter Frontend Prototype (Reference Only)

> **HISTORICAL REFERENCE NOTICE — APEX OMEGA MAX V4 DIRECTIVE (SECTION 24)**
>
> The Flutter cross-platform mobile client contained in this directory (Frontend/) represents the **historical prototype and reference implementation** developed during earlier phases of the JustEnough MVP.
>
> Under the **Apex Omega Max V4 Supreme Closure Directive**, the **canonical production MVP frontend for JustEnough is the Web Application** located in Web/ (built with React 18, TypeScript, Vite, TanStack Query, and Tailwind CSS).
>
> **Preservation Guarantee**:
> - This directory is strictly preserved in its entirety for provenance, design reference, architecture lineage, and multi-client evaluation.
> - It is **not** deleted, but it is no longer the primary submission artifact for the functional MVP.
> - All new production flows, zero-cost cloud deployments, and automated end-to-end browser tests target Just-Enough.AI/Web.

---

## Historical Architecture Summary
- **Framework**: Flutter 3.x / Dart 3.x
- **State Management**: Riverpod (StateNotifierProvider)
- **Networking**: Dio HTTP client with retry interceptor
- **Storage**: SQLite / shared_preferences offline queue
- **Key Features Tested**:
  - Morning Brief dashboard (Prepare, Order, Monitor cards)
  - Inventory count and stock reception
  - Recommendation approval and override modal
  - Operational alerts feed
  - Dual Mode toggle (LIVE vs DEMO)

## Canonical V4 Web Client
For the active, deployable, and verified web MVP, please refer to:
Just-Enough.AI/Web/

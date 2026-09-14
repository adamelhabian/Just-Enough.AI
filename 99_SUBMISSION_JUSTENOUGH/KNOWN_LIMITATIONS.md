# JustEnough.AI — Known Limitations & Post-MVP Roadmap

## 1. Known Non-Blocking Limitations
1. **Frontend Chunk Size Warning (>500 kB):**
   - *Status:* Non-blocking for MVP evaluation.
   - *Context:* The production Vite bundle contains Recharts and Lucide icons packaged together. The entire gzip bundle is 295.44 kB, which loads in <200ms on broadband.
   - *Roadmap:* Implement dynamic `React.lazy()` chunking in Post-MVP release.
2. **Zero-Database Evaluation Mode:**
   - *Status:* Architectural decision to ensure $0.00 friction and 100% portable evaluation.
   - *Context:* The application operates on SQLite with auto-seeded demo records instead of requiring external Docker PostgreSQL or cloud Neon instances.
   - *Roadmap:* Multi-region enterprise PostgreSQL migration path is preserved via Alembic migrations in `Backend/alembic/` for production SaaS deployment.
3. **Single Location Scope in Demo:**
   - *Status:* Focused MVP scope.
   - *Context:* The initial demonstration focuses on primary branch `branch-main` with multi-tenant isolation demonstrated across unit tests.
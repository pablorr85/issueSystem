# TODO

All tasks for Sprint 37 (Interactive OpenAPI / Swagger Documentation) are completed. No pending tasks for Sprint 37.

---

## 📋 Upcoming Sprints Backlog

### ⚡ Sprint 38: PostgreSQL & Django ORM Database Indexing Optimization
- [ ] Audit model query fields in `backend/core/models.py`.
- [ ] Add `db_index=True` on high-cardinality and frequent filter fields (`status`, `assigned_to`, `created_at`, `order_index`, `secure_token`).
- [ ] Add composite indexes for multi-variable triage queries (`['tenant', 'status']`, `['tenant', 'assigned_to']`) in `Meta.indexes`.
- [ ] Run `python manage.py makemigrations` and `python manage.py migrate` to apply database indexes.
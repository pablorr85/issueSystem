# TODO

All tasks for Sprint 36 (Frontend RTK Query Full Migration & UI Component Unification) are completed. No pending tasks for Sprint 36.

---

## 📋 Upcoming Sprints Backlog

### 🚀 Sprint 37: Interactive OpenAPI / Swagger Documentation
- [ ] Install and configure `drf-spectacular` in `backend/requirements.txt` and `issue_system/settings.py`.
- [ ] Add OpenAPI schema generation endpoint (`/api/schema/`) and Swagger UI view (`/api/docs/`).
- [ ] Annotate dynamic tenant JSONB endpoints (`extra_data`) and passwordless operator endpoints in Django REST Framework views/serializers.

### ⚡ Sprint 38: PostgreSQL & Django ORM Database Indexing Optimization
- [ ] Audit model query fields in `backend/core/models.py`.
- [ ] Add `db_index=True` on high-cardinality and frequent filter fields (`tenant_id`, `status`, `assigned_to`, `created_at`, `order_number`).
- [ ] Add composite indexes for multi-variable triage queries (`['tenant', 'status']`, `['tenant', 'assigned_to']`).
- [ ] Run `python manage.py makemigrations` and `python manage.py migrate` to apply database indexes.
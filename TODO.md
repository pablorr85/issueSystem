# SPRINT 1: Core Generic Infrastructure

## [ ] Backend Technical Tasks (Antigravity IDE)

- [ ] Initialize Django project and create the `core` app.
- [ ] Implement the `Tenant`, `CustomField`, and `Issue` models utilizing `models.JSONField` for dynamic data.
- [ ] Configure the database connection (PostgreSQL recommended for JSONB features, SQLite acceptable for initial local dev).
- [ ] Execute `makemigrations` and `migrate`.
- [ ] Create a `superuser` and register the models in `admin.py` to allow manual creation of mock tenants.

## [ ] Acceptance Criteria

- Ability to create a `Tenant` with a visual configuration JSON via the Django Admin panel.
- Ability to associate dynamic `CustomField` records to a specific `Tenant`.
- Ability to save an `Issue` where the `extra_data` field accepts different key-value structures depending on the `Tenant`.

# Architecture & Development Practices

## 🏛 Architecture Pattern: Single-DB Multi-Tenancy

The system uses a shared database, shared schema multi-tenant architecture.
Data isolation is enforced at the application level (Django ORM) rather than the infrastructure level.

### Core Data Entities

1. **`Tenant`:** Represents the paying business entity (e.g., a Zoo, a Property Management Company). Holds visual configuration (JSON).
2. **`CustomField`:** Defines the dynamic schema required by a specific Tenant (e.g., "Building Block", "Machine Serial Number").
3. **`Issue`:** The universal core entity. Contains standard fields (status, photo_url, timestamp) AND an `extra_data` (JSONField/JSONB) column to store the Tenant's custom fields.

## 📜 Strict Coding Practices

- **Security by Design:** Every API endpoint MUST filter by `tenant_id`. Cross-tenant data leakage is the highest severity risk.
- **PostgreSQL JSONB Optimization:** All dynamic querying will rely on PostgreSQL's JSONB indexing capabilities. Do not create EAV (Entity-Attribute-Value) anti-pattern tables.
- **Stateless Architecture:** The backend must remain completely stateless. JWT (JSON Web Tokens) will be used for authentication.
- **DRY & SOLID Principles:** Keep the code modular. Reusable components in React, fat models/thin views in Django.
- **Agile/Scrum Iterations:** Develop in atomic, functional increments. Do not over-engineer features that are not explicitly required by the current Sprint TODO.
- **English First:** All code, variables, database schemas, docstrings, and commits MUST be in professional technical English. No exceptions.

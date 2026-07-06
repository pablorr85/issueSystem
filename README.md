# Solvo - Multi-Tenant Issue Tracking & Upkeep SaaS

**Solvo** is a lean, highly scalable, multi-tenant B2B SaaS platform designed to manage and resolve on-site issues (maintenance, repairs, cleaning) for physical locations such as amusement parks, shopping malls, schools, zoos, and residential communities.

The platform decouples reporting from management: end-users can report incidents instantly and anonymously by scanning physical QR codes on site without installing any app, while managers and operators triage and resolve issues through a centralized dashboard.

---

## 🚀 Core Architectural Philosophy

1. **Single Source of Truth:** A unified codebase and single database instance serving all tenants. Zero forks or tenant-specific branches.
2. **Data-Driven Customization:** Custom fields, visual styles (primary branding colors), and logos are dynamically driven by database configurations (JSONB schema configurations), rather than hardcoded client logic.
3. **Frictionless UX:** Anonymous reporting form via QR codes minimizes user friction, maximizing reporting rate and data collection.
4. **Data Isolation:** Strict tenant-level data isolation enforced across all database queries, serializers, and frontend contexts.

---

## 🌟 Key Features

### 📊 Manager Command Center & Dashboards
* **Interactive KPI Analytics:** Real-time counters showing Unassigned, In-Progress, and Blocked tasks that act as quick-filters for the backlog list.
* **Dashboard Analytics & Workload Expansion:** Live widgets showing operator active workloads (color-coded bars highlighting overload/capacity), resolution leaderboards (last 30 days resolved statistics), and ranking charts of zone hotspots.
* **Sleek Branding Engine:** The management dashboard automatically injects HSL styling variables mapped from each tenant's custom database branding configuration.

### 📋 Triaging & Operations
* **Backlog Triage Inbox:** Headless table built with `@tanstack/react-table` featuring multi-variable search, pagination, and filters (status, assignee, urgency) synchronized instantly with the URL query parameters (`useSearchParams`).
* **Kanban Operations Board:** Drag-and-drop workspace powered by `@dnd-kit/core` displaying tasks across Pending, In Progress, Blocked, and Resolved columns for fast status transitions.
* **Audit log & Comments Timeline:** Chronological thread of comments, manager updates, operator notes, and system logs tracking task transitions.

### ⚙️ Extensible Dynamic Schema (JSONB Validation)
* **Custom Fields Engine:** Managers can specify required or optional custom fields per tenant (supporting boolean switches, numeric fields, text, and select options).
* **Strict API Type Safety:** Custom fields submitted inside `extra_data` are dynamically typechecked, normalized, and validated at the serializer level before database write.

### 📱 Operator Workspace & Dispatch
* **Passwordless Operator Hub:** Operators log in securely using permanent UUID tokens (`hub_token`) without passwords, accessing their specific assigned workload.
* **Batch Assignment & Notifications:** Transaction-safe bulk assignment endpoint (`POST /api/tasks/bulk-assign/`) that updates assignee fields in batch and dispatches grouped WhatsApp SMS messages to avoid notification fatigue.
* **Media Management:** Direct multipart photo uploads to Google Cloud Storage (GCS) with automatic file cleanup via `django-cleanup` upon record deletion, and image preview zoom Lightboxes.

### 🌐 Internationalization (i18n)
* Fully localized interface supporting **Spanish** (default locale) and **English** translation catalogs.

---

## 🛠 Tech Stack

* **Backend:** Python 3.9+ / Django 4.x / Django REST Framework
* **Database:** PostgreSQL (with SQLite support for local dev environment)
* **Frontend:** React / TypeScript / Vite / styled-components / Material-UI
* **Testing:** Vitest (Frontend unit), Cypress (End-to-End), Django APITestCase (Backend integration)
* **External Services:** Google Cloud Storage (Media files), WhatsApp Business API / Twilio

---

## 🔒 Security Architecture

### Passwordless Operator Workspace
To maximize operational efficiency, operators access their tasks and workloads passwordless via secure magic links dispatched to their contact numbers (e.g. WhatsApp/SMS).

### Cryptographic Token Binding & Lifecycle
1. **Token Structure:** Magic link tokens are cryptographically signed using Django's `TimestampSigner`/`Signer`. The signed payload encapsulates both the `task_id` and the `operator_id`.
2. **Reassignment Invalidation:** When an operator attempts to access or update a task, the backend decodes the token and matches the `operator_id` inside the payload against the task's current assignee. If the task has been reassigned to a different operator, the token is automatically invalidated, returning a `403 Forbidden` response.
3. **Operator Status Check:** If the operator is marked as inactive (`is_active=False` on their User account), all of their magic links (both for individual tasks and their hub) are immediately rejected with a `403 Forbidden` response.
4. **Access Denied UI:** Any request resolving to a `403 Forbidden` for magic link routes automatically redirects the operator to a friendly "Access Denied" page.

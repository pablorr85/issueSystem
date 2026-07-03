# Changelog

All notable changes to the **Solvo** project are documented in this file.

---

## [Sprint 22] - Code Quality, Performance Optimization & Restructuring
### Added
- Created `resolved_at` DateTimeField on `Issue` model to persistently store issue resolution time, backed by schema migration `0009` and data migration `0010` to backfill historical resolved issues from audit logs.
- Automatic transition rules for `resolved_at` via `pre_save` signal.
- Enhanced type-safety validation for custom dynamic JSONB fields (`extra_data`) in `IssueSerializer.validate()`, covering boolean coercion, numeric validation, and select option checks.
- Refactored frontend Views folder structure for `BoardView` and `BacklogView` to separate styling definitions into dedicated `.styles.ts` files, aligning with the `ARCHITECTURE.md` conventions.
- Added assigned status filter support (`assignedFilter` and `onAssignedFilterChange`) to the main DashboardView interface to maintain TS build completeness.
- Optimized Django querysets in list endpoints (`IssueListView`, `OperatorHubView`, `OperatorListView`, and `IssueCommentsView`) using `select_related` to eliminate N+1 database queries.

## [Sprint 21] - Dashboard Interactive Drill-down & URL Query Filters
### Added
- Transformed static Dashboard KPI cards (Unassigned, In Progress, Blocked) into interactive, accessible links with pointer hover states.
- Handled query string navigation so that clicking a card navigates to `/backlog?assigned=false`, `/backlog?status=blocked`, or `/board`.
- Sync'ed the backlog filters, pagination, and data retrieval hooks directly with the URL query parameters using `useSearchParams`.
- Built backend support for the `assigned` query param in `IssueListView` (filtering by `assigned_to__isnull`).
- Added an "Assignment" ("Filtrar por Asignación") dropdown filter in the Backlog table view to let managers dynamically view assigned or unassigned issues.
- Documented full E2E test coverage in `manage_issue.cy.ts` validating card click-throughs and auto-filtering.

## [Sprint 19] - Command Center & Operations Kanban Board
### Added
- Designed a dashboard statistics landing page (`/`) with real-time KPI metrics (Unassigned, In Progress, and Blocked task counters) and direct sub-navigation triggers.
- Re-routed and isolated the master issues list to a dedicated Backlog page (`/backlog`).
- Engineered a complete Operations Board (`/board`) with a responsive 4-column Kanban layout (Pending, In Progress, Blocked, Resolved) using `@dnd-kit/core` for seamless drag-and-drop task status transitions.
- Integrated dynamic styling variables to inject the active tenant's primary colors into the dashboard metrics and navigation systems.
- Updated operator action button copy consistently across Spanish ("Iniciar Trabajo") and English ("Start Work") locales in the Operator Task view.
- Validated all route access levels and status transitions through a fully optimized Cypress end-to-end testing suite.

## [Sprint 18] - Task Assignment Batching & Notification Optimization
### Added
- Created a transaction-safe bulk assignment endpoint (`POST /api/tasks/bulk-assign/`) that updates assignee fields in batch.
- Grouped modified tasks by assignee and implemented a consolidated WhatsApp notification system to avoid alert fatigue.
- Handled character limit constraints (max 1600 characters) for WhatsApp messages with graceful truncation.
- Prevented individual task notifications during bulk actions using an instance bypass flag (`_skip_whatsapp`).
- Designed a premium floating action bar with a glassmorphism theme and pop-up micro-animations to manage bulk actions in the React dashboard.
- Integrated row-level checkboxes and a select-all page checkbox in the TanStack task table.
- Added localization keys for both English and Spanish covering all new bulk actions and toast states.

---

## [Sprint 17] - Corporate Identity & "Solvo" Marketing Site
### Added
- Decoupled marketing landing page at the root domain (`www.solvo.app`).
- Corporate brand identity "Solvo" applied across all platform interfaces.
- Minimalist Solvo logo, custom favicon, and high-resolution browser/mobile assets.
- Verticals showcase displaying dynamic dashboard screenshots for Zoos, Malls, Schools, and Residential communities.
- Contact section with direct native email options (`hello@solvo.app`).
- Global SEO meta attributes configured on landing and app pages.

---

## [Sprint 16.5] - Dynamic Resolution Timestamps & "Wont Fix" Status
### Added
- Added `'wont_fix'` status to `Issue` model and serializers.
- Dynamic `resolved_at` calculated field on issues using historical audit logs with a fallback to `updated_at`.
- Unit test suite to verify the `wont_fix` state transitions and resolution timestamp calculation.
- Support for `wont_fix` filtering and steel-grey status badges across Admin Dashboard and Operator Task Hub.
- Button to mark tasks as "Wont Fix" directly from the operator mobile view.

---

## [Sprint 16] - Task Audit Log, Multi-Author Comments & Blocked Status
### Added
- Added `BLOCKED` status to the `Issue` model and frontend status badges (amber/orange styling).
- `IssueComment` model for chronological notes from managers, operators, or system events.
- Chronological timeline audit logs in the Admin Dashboard and Operator Mobile views.
- Operator quick actions to report blocked tasks with pre-filled comments on a single tap.

---

## [Sprint 15] - Interactive Row Reordering & Custom Priority Sorting
### Added
- Persistent `order_index` in the `Issue` database model.
- Specialized `/api/issues/reorder/` transaction-safe bulk reorder endpoint.
- Drag-and-drop interactive row reordering inside the TanStack Table using `@dnd-kit`.
- Optimistic UI updates to ensure drag actions persist instantly.

---

## [Sprint 14] - Media Rendering & Image Management
### Added
- Public GCS absolute URL serialization in Django serializers.
- Automated file cleanup on bucket storage via `django-cleanup` when issues are deleted or images replaced.
- Live image thumbnail previews before submission on mobile cameras.
- Click-to-zoom Lightbox modal in both Admin and Operator views.

---

## [Sprint 13] - Cloud Storage Integration & Advanced Data Tables
### Added
- HEADLESS React table migration to `@tanstack/react-table`.
- Multivariable filtering (by operator, status, and urgency) inside the admin dashboard.
- Google Cloud Storage (GCS) integration via `django-storages[google]`.
- Multipart Form-Data payload support to upload images directly to GCS.

---

## [Sprint 13.5] - Operator Hub & Localized Dual-Link Notifications
### Added
- Permanent passwordless UUID `hub_token` on `OperatorProfile`.
- `/api/operator/hub/` endpoint to list pending tasks assigned to a specific operator token.
- Dual-link construction inside WhatsApp notifications: direct task details vs. operator pending workload hub.
- Full Spanish localization for automated SMS/WhatsApp alerts.

---

## [Sprint 12.5] - Image Uploads (Frontend) & UX Quick Wins
### Added
- Native mobile camera prompt integration using `capture="environment"`.
- Text-overflow handling for Status Badge cells in the admin interface.
- Distinct high-visibility red styling for `critical` urgency items in the table.

---

## [Sprint 12] - Media Uploads & WhatsApp Notifications (Foundation)
### Added
- Service account authentication for cloud storage.
- WhatsApp notification delivery framework via Meta API or Twilio wrapper.

---

## [Sprint 11] - Operator Assignment & Task Workflow
### Added
- `OperatorProfile` model linked to the Django `User` model, including telephone data.
- Assignee and status attributes on the `Issue` model.
- Dedicated operator single-task mobile view.

---

## [Sprint 10] - Dynamic QR Code Generator
### Added
- Client-side QR code generator on the dashboard page.
- Direct download function to export QR codes as PNG labels.

---

## [Sprint 9] - UI/UX Separation & Routing
### Added
- Frontend route structure using `react-router-dom`.
- Route guards to restrict access to the `/dashboard` page to authenticated managers.
- Clean isolation of the public QR reporting form from manager layouts.

---

## [Sprint 8] - Internationalization (i18n) & Spanish Default Localization
### Added
- `default_language` attribute on `Tenant` models.
- Multilingual translation configurations using `i18next`.
- Automatic translation of the reporting screen based on tenant configuration.

---

## [Sprint 7] - Authentication, Access Control & Smart Reporting
### Added
- JWT-based authentication system using SimpleJWT.
- Configurable tenant-wide access rules to allow/prevent anonymous reporting.

---

## [Sprint 6] - Tenant Dashboard & Issue Management
### Added
- Paginated retrieval endpoints for managers to view issues.
- Interactive status adjustment controls on rows.

---

## [Sprint 5] - Dynamic Form Engine
### Added
- Dynamic form renderer that parses tenant schema settings to show appropriate inputs (select, boolean, numbers, texts).
- Backend verification of required dynamic fields.

---

## [Sprint 4] - TypeScript, MUI & Testing Setup
### Added
- Static code typing configurations for Vite using TypeScript.
- Integration of Material-UI (`@mui/material`) and `styled-components`.
- Setup of Vitest and Cypress testing.

---

## [Sprint 2] - Security Patch & API Foundation
### Added
- UUID primary keys on the `Tenant` model to enhance security.
- Initial API settings using Django REST Framework.

---

## [Sprint 1] - Core Generic Infrastructure
### Added
- Core backend models (`Tenant`, `CustomField`, `Issue`) using JSON fields.
- Admin panel registration for manual mock configurations.

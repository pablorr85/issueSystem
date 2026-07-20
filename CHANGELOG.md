# Changelog

All notable changes to the **Solvo** project are documented in this file.

---

## [Sprint 29] - Printable Work Orders & Configurable QA Flow
### Added
- Created `Zone` model linked to `Tenant` for structured facility/area management (`GET/POST /api/zones/`).
- Extended `Issue` model with `order_number` (`WO-00001` format), `zone`, `started_at`, `completed_at`, `qa_checklist`, and added `'qa'` ("Verification / QA") status choice.
- Implemented Django `issue_pre_save` signal automation to stamp `started_at` when entering `in_progress` and `completed_at` when entering `qa` or `resolved`.
- Expanded `IssueSerializer` and `IssueListSerializer` to expose order numbers, zones, QA checklists, and execution timestamps.
- Updated Operations Kanban Board (`BoardView`) to support 5 columns including the new "Verification (QA)" stage.
- Engineered `WorkOrderPrintView` component styled with A4 `@media print` rules, signature lines, total material/service cost & effective time worked display (or manual pen line if empty), and dynamic `[ ]` checklist checkboxes for physical paper work orders.
- Integrated "Print Work Order" trigger buttons on Kanban cards and inside `EditIssueModal`.
- Added standardized default QA "Definition of Done" (DoD) checklist fallback items (Cleanliness, Functionality, Safety, Visual Inspection) to work orders and added a "+ Load Default Checklist (DoD)" quick action in `EditIssueModal`.
- Added localization catalogs for Spanish and English covering all QA workflow and Work Order print elements.

## [Sprint 28] - Activity Logbook, Proof of Work, Cost & Time Tracking
### Added
- Created a new `TaskLog` model to track chronological comments, costs, time spent, and uploaded media attachments for every task, linked via foreign keys to issues and author profiles.
- Added cumulative database cache fields `total_cost` and `total_time_spent_hours` to the `Issue` model, maintained automatically via real-time Django database signal hooks (`post_save`, `post_delete`).
- Built the `TaskLogbook` component displaying the chronological activity timeline, highlighting logs with numeric time or cost updates, and allowing incremental submissions.
- Built the `CompletionReportModal` to enforce "Proof of Work" (compulsory image upload and validation checks) before operators can mark a task as resolved.
- Integrated the `TaskLogbook` and `CompletionReportModal` into the mobile-focused `OperatorTaskView` to replace basic comments and streamline task resolution.
- Integrated the `TaskLogbook` and KPI total headers showing cumulative costs and hours into the manager's `EditIssueModal`.
- Configured robust unit and E2E validation test suites for both Django and React components to ensure complete reliability.

## [Sprint 27] - Introduce Task Titles for UI Clarity
### Added
- Introduced a required `title` field (max 100 characters) to the `Issue` data model.
- Created a Django database migration including a custom Python data migration backfill to copy the first 50 characters of `description` into `title` for all pre-existing records.
- Added automatic serializer fallback to generate titles from descriptions (`description[:50]`) for programmatic API creations and testing backward compatibility.
- Exposed the `title` field in Django Admin list displays, filters, and search query scopes.
- Redesigned the Backlog view table (TanStack table) to replace the Description column with a Title column, rendering the title in bold and the full description compactly underneath.
- Updated the Kanban card display in BoardView to render the task title prominently as a bold card header, showing description text underneath with clean two-line CSS clamping.
- Displayed the task title prominently at the top of the mobile Operator Task detail view.
- Added Title input fields and required validations (max 100 characters) to the Public Reporting Form and the Manager's Edit Issue modal.
- Integrated full English and Spanish translations for all title-related labels, input place-helpers, and required validation errors.

## [Sprint 26] - Magic Link Security & Access Control
### Added
- Implemented **Operator Deactivation (The "Red Button")**: Added active status tracking (`is_active` boolean field on User model) and a dedicated grid interface in the manager's dashboard with an interactive status toggle button.
- Implemented **Cryptographic Token Binding**: Upgraded magic links to use Django's `TimestampSigner`/`Signer` cryptographic signing to securely encode `task_id` and `operator_id` in the link payload.
- Added automatic link invalidation upon task reassignment: The backend verifies the current assignee matches the operator ID in the token, rejecting mismatched requests with `403 Forbidden`.
- Implemented **Access Denied Mobile View**: Added a dedicated, user-friendly access denied screen displaying a message for invalid, expired, or reassigned magic links, supported by a global Axios interceptor.
- Implemented **Tenant Staff Access Bypass**: Allowed authenticated staff/managers of the corresponding tenant to access task views directly (via ID, UUID, or signed tokens), with strict tenant-level isolation checking.
- Implemented **Kanban Card Click Navigation**: Added a propagation-stopped launch link button (`ID #123 <LaunchIcon />`) inside BoardView Kanban cards to navigate to `/work/task/:id`, supported by a PointerSensor distance constraint (`8px`) on `DndContext` to completely prevent drag-and-drop sensor conflicts.
- Implemented **Layout Shift Improvements**: Standardized wide container alignment to the top (`justify-content: flex-start`) and aligned header titles to `{t('app.appTitle')}` ("Solvo") to ensure smooth transitions across Dashboard Stats, Backlog, and Kanban Board without layout jumps.

## [Sprint 25] - Dashboard Analytics Expansion
### Added
- Expanded the backend dashboard statistics endpoint (`IssueStatsView`) using efficient Django ORM aggregation (Count and Q) to fetch active operator workloads, 30-day resolution performance counts, and ranked zone hotspots.
- Implemented **Operator Active Workload Widget**: Added progress-bar styling color-coded by capacity load to easily identify operator availability at a glance.
- Implemented **Resolution Leaderboard Widget**: Top list showing operators ranked by tasks resolved within the last 30 days.
- Implemented **Zone Hotspots Widget**: Clean listing ranking the top 5 zones with the highest incident volume.
- Styled widgets using tenant-brand primary HSL values and implemented loading states and empty state fallbacks.
- Added comprehensive integration test suite `DashboardAnalyticsAPITests` verifying correct statistics calculations on the API.

## [Sprint 24] - Code Quality, Performance Optimization & Restructuring
### Added
- Created `resolved_at` DateTimeField on `Issue` model to persistently store issue resolution time, backed by schema migration `0009` and data migration `0010` to backfill historical resolved issues from audit logs.
- Automatic transition rules for `resolved_at` via `pre_save` signal.
- Enhanced type-safety validation for custom dynamic JSONB fields (`extra_data`) in `IssueSerializer.validate()`, covering boolean coercion, numeric validation, and select option checks.
- Refactored frontend Views folder structure for `BoardView` and `BacklogView` to separate styling definitions into dedicated `.styles.ts` files, aligning with the `ARCHITECTURE.md` conventions.
- Added assigned status filter support (`assignedFilter` and `onAssignedFilterChange`) to the main DashboardView interface to maintain TS build completeness.
- Optimized Django querysets in list endpoints (`IssueListView`, `OperatorHubView`, `OperatorListView`, and `IssueCommentsView`) using `select_related` to eliminate N+1 database queries.

## [Sprint 23] - Dashboard Interactive Drill-down & URL Query Filters
### Added
- Transformed static Dashboard KPI cards (Unassigned, In Progress, Blocked) into interactive, accessible links with pointer hover states.
- Handled query string navigation so that clicking a card navigates to `/backlog?assigned=false`, `/backlog?status=blocked`, or `/board`.
- Sync'ed the backlog filters, pagination, and data retrieval hooks directly with the URL query parameters using `useSearchParams`.
- Built backend support for the `assigned` query param in `IssueListView` (filtering by `assigned_to__isnull`).
- Added an "Assignment" ("Filtrar por Asignación") dropdown filter in the Backlog table view to let managers dynamically view assigned or unassigned issues.
- Documented full E2E test coverage in `manage_issue.cy.ts` validating card click-throughs and auto-filtering.

## [Sprint 22] - Command Center & Operations Kanban Board
### Added
- Designed a dashboard statistics landing page (`/`) with real-time KPI metrics (Unassigned, In Progress, and Blocked task counters) and direct sub-navigation triggers.
- Re-routed and isolated the master issues list to a dedicated Backlog page (`/backlog`).
- Engineered a complete Operations Board (`/board`) with a responsive 4-column Kanban layout (Pending, In Progress, Blocked, Resolved) using `@dnd-kit/core` for seamless drag-and-drop task status transitions.
- Integrated dynamic styling variables to inject the active tenant's primary colors into the dashboard metrics and navigation systems.
- Updated operator action button copy consistently across Spanish ("Iniciar Trabajo") and English ("Start Work") locales in the Operator Task view.
- Validated all route access levels and status transitions through a fully optimized Cypress end-to-end testing suite.

## [Sprint 21] - Task Assignment Batching & Notification Optimization
### Added
- Created a transaction-safe bulk assignment endpoint (`POST /api/tasks/bulk-assign/`) that updates assignee fields in batch.
- Grouped modified tasks by assignee and implemented a consolidated WhatsApp notification system to avoid alert fatigue.
- Handled character limit constraints (max 1600 characters) for WhatsApp messages with graceful truncation.
- Prevented individual task notifications during bulk actions using an instance bypass flag (`_skip_whatsapp`).
- Designed a premium floating action bar with a glassmorphism theme and pop-up micro-animations to manage bulk actions in the React dashboard.
- Integrated row-level checkboxes and a select-all page checkbox in the TanStack task table.
- Added localization keys for both English and Spanish covering all new bulk actions and toast states.

---

## [Sprint 20] - Corporate Identity & "Solvo" Marketing Site
### Added
- Decoupled marketing landing page at the root domain (`www.solvo.app`).
- Corporate brand identity "Solvo" applied across all platform interfaces.
- Minimalist Solvo logo, custom favicon, and high-resolution browser/mobile assets.
- Verticals showcase displaying dynamic dashboard screenshots for Zoos, Malls, Schools, and Residential communities.
- Contact section with direct native email options (`hello@solvo.app`).
- Global SEO meta attributes configured on landing and app pages.

---

## [Sprint 19] - Dynamic Resolution Timestamps & "Wont Fix" Status
### Added
- Added `'wont_fix'` status to `Issue` model and serializers.
- Dynamic `resolved_at` calculated field on issues using historical audit logs with a fallback to `updated_at`.
- Unit test suite to verify the `wont_fix` state transitions and resolution timestamp calculation.
- Support for `wont_fix` filtering and steel-grey status badges across Admin Dashboard and Operator Task Hub.
- Button to mark tasks as "Wont Fix" directly from the operator mobile view.

---

## [Sprint 18] - Task Audit Log, Multi-Author Comments & Blocked Status
### Added
- Added `BLOCKED` status to the `Issue` model and frontend status badges (amber/orange styling).
- `IssueComment` model for chronological notes from managers, operators, or system events.
- Chronological timeline audit logs in the Admin Dashboard and Operator Mobile views.
- Operator quick actions to report blocked tasks with pre-filled comments on a single tap.

---

## [Sprint 17] - Interactive Row Reordering & Custom Priority Sorting
### Added
- Persistent `order_index` in the `Issue` database model.
- Specialized `/api/issues/reorder/` transaction-safe bulk reorder endpoint.
- Drag-and-drop interactive row reordering inside the TanStack Table using `@dnd-kit`.
- Optimistic UI updates to ensure drag actions persist instantly.

---

## [Sprint 16] - Media Rendering & Image Management
### Added
- Public GCS absolute URL serialization in Django serializers.
- Automated file cleanup on bucket storage via `django-cleanup` when issues are deleted or images replaced.
- Live image thumbnail previews before submission on mobile cameras.
- Click-to-zoom Lightbox modal in both Admin and Operator views.

---

## [Sprint 15] - Operator Hub & Localized Dual-Link Notifications
### Added
- Permanent passwordless UUID `hub_token` on `OperatorProfile`.
- `/api/operator/hub/` endpoint to list pending tasks assigned to a specific operator token.
- Dual-link construction inside WhatsApp notifications: direct task details vs. operator pending workload hub.
- Full Spanish localization for automated SMS/WhatsApp alerts.

---

## [Sprint 14] - Cloud Storage Integration & Advanced Data Tables
### Added
- HEADLESS React table migration to `@tanstack/react-table`.
- Multivariable filtering (by operator, status, and urgency) inside the admin dashboard.
- Google Cloud Storage (GCS) integration via `django-storages[google]`.
- Multipart Form-Data payload support to upload images directly to GCS.

---

## [Sprint 13] - Image Uploads (Frontend) & UX Quick Wins
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

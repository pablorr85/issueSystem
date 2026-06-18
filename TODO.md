# SPRINT 1: Core Generic Infrastructure

## [x] General tasks

- [x] Create a `.gitignore` file.

## [x] Backend Technical Tasks (Antigravity IDE)

- [x] Initialize Django project and create the `core` app.
- [x] Implement the `Tenant`, `CustomField`, and `Issue` models utilizing `models.JSONField` for dynamic data.
- [x] Configure the database connection (PostgreSQL recommended for JSONB features, SQLite acceptable for initial local dev).
- [x] Execute `makemigrations` and `migrate`.
- [x] Create a `superuser` and register the models in `admin.py` to allow manual creation of mock tenants.

## [x] Acceptance Criteria

- [x] Ability to create a `Tenant` with a visual configuration JSON via the Django Admin panel.
- [x] Ability to associate dynamic `CustomField` records to a specific `Tenant`.
- [x] Ability to save an `Issue` where the `extra_data` field accepts different key-value structures depending on the `Tenant`.

# SPRINT 2: Security Patch, API Foundation & Frontend Initialization

## [x] Backend Tasks (Django)

- [x] **Security Refactor:** Update the `Tenant` model in `core/models.py`. Change the `id` field from the default auto-increment integer to a secure UUID: `id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)`.
- [x] **Database Reset:** Since this is early development and changing a Primary Key type is complex in SQL, delete the existing `db.sqlite3` (if using SQLite) and the files inside the `migrations` folder (except `__init__.py`). Rerun `makemigrations` and `migrate`. Create a new superuser.
- [x] **API Setup:** Install Django REST Framework (`pip install djangorestframework`). Add `'rest_framework'` to `INSTALLED_APPS`.
- [x] **Tenant Config Endpoint:** Create a simple GET endpoint (e.g., `/api/tenant/<uuid>/config/`) that returns the `name`, `logo_url`, and `visual_config` of a specific Tenant.

## [x] Frontend Tasks (React)

- [x] **Initialization:** Navigate to the `frontend` directory and initialize a new React project using Vite (e.g., `npm create vite@latest . -- --template react` or `react-ts` if using TypeScript).
- [x] **Dependencies:** Run `npm install`. Install `axios` for future API calls.
- [x] **Structure:** Clean up the default Vite boilerplate. Create a clean base folder structure inside `src/`: `/components`, `/pages`, and `/services`.
- [x] **Validation:** Ensure the development server runs correctly (`npm run dev`).

## [x] Acceptance Criteria

- [x] Django Admin displays `Tenant` IDs as secure UUID strings (e.g., `f47ac10b...`).
- [x] A GET request to `/api/tenant/<uuid>/config/` successfully returns the JSON data.
- [x] The React application runs locally without errors and is ready for component development.

# SPRINT 4: TypeScript, MUI & Testing Setup

## [x] TypeScript Initialization

- [x] **Dependencies:** Install TypeScript and necessary type definitions (`npm install -D typescript @types/react @types/react-dom @types/node`).
- [x] **Configuration:** Generate a `tsconfig.json` with `"strict": true` and `"jsx": "react-jsx"`. Configure Vite to support TypeScript (`vite.config.ts`).

## [x] Frontend Dependencies & Types

- [x] **UI Framework:** Install MUI and styled-components (`npm install @mui/material @emotion/react @emotion/styled @mui/icons-material styled-components`).
- [x] **Types for Libraries:** Install type definitions for styled-components and testing tools (`npm install -D @types/styled-components`).
- [x] **Testing Tools:** Install Vitest, React Testing Library, and Cypress (`npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom cypress`).

## [x] Component Refactor & Proof of Concept (TypeScript)

- [x] **File Renaming:** Ensure all frontend files use `.ts` or `.tsx` extensions.
- [x] **Interfaces:** In `src/services/types.ts`, create a TypeScript interface `TenantConfig` that matches the JSON payload expected from the Django API.
- [x] **MUI Component:** Refactor `TenantForm.tsx` using an MUI `<Card>` and strong typing for its props. Create `TenantForm.styles.ts` for custom styles.
- [x] **Tests:** Write a unit test (`TenantForm.test.tsx`) ensuring the component renders. Initialize Cypress (`npx cypress open`) and write an E2E test (`cypress/e2e/tenant_flow.cy.ts`).

## [x] Acceptance Criteria

- [x] Running `npx tsc --noEmit` returns zero type errors.
- [x] Material-UI components render without style conflicts.
- [x] Unit and Cypress tests pass successfully.

# SPRINT 5: The Dynamic Form Engine (Core Business Logic)

## [x] Backend Tasks (Django API)

- [x] **Schema Payload:** Update the existing GET endpoint for the Tenant config (e.g., `/api/tenant/<uuid>/config/`) to also serialize and return its related `CustomField`s (including `name`, `field_type`, `required`, and `options`).
- [x] **Issue Serialization:** Create a `ModelSerializer` for the `Issue` model.
- [x] **Submission Endpoint:** Ensure the `POST /api/issues/create/` endpoint validates the incoming data (tenant UUID, description, photo_url) and properly saves the `extra_data` JSON payload into the database.

## [x] Frontend Tasks (React + TypeScript)

- [x] **Type Definitions:** Update the `TenantConfig` interface in `types.ts` to include an array of `CustomField` objects. Create an interface for the `IssuePayload`.
- [x] **Dynamic Form Component:** Create a `DynamicIssueForm.tsx` component using MUI. It must render standard inputs (Description) and dynamically loop through the `CustomField`s to render the correct MUI components (e.g., `<TextField>` for text/number, `<Select>` for dropdowns).
- [x] **State Management:** Implement form state handling (consider using `react-hook-form` for performance, or standard React state) to capture the standard fields and construct the `extra_data` key-value object.
- [x] **Submission Handler:** Wire up the submit button to send the Axios POST request. Show an MUI `<Snackbar>` or `<Alert>` on success.

## [x] Testing Tasks

- [x] **Unit Tests:** Write a test in `DynamicIssueForm.test.tsx` verifying that providing mock `CustomField` data correctly renders the dynamic inputs on the screen.
- [x] **E2E Tests:** Add a Cypress scenario (`submit_issue.cy.ts`) that fills out both standard and dynamic fields, clicks submit, and asserts the success message appears.

## [x] Acceptance Criteria

- [x] End-users can see a form that perfectly matches the Tenant's database configuration.
- [x] Submitting the form creates a new `Issue` row in PostgreSQL.
- [x] The Django Admin panel displays the new `Issue` with the custom fields correctly saved inside the `extra_data` JSONB column.

# SPRINT 6: Tenant Dashboard & Issue Management

## [x] Backend Tasks (Django API)

- [x] **List Endpoint:** Create a `GET` endpoint for issues (e.g., `/api/issues/`). It must accept query parameters to filter by `tenant_id` and `status`.
- [x] **Pagination:** Implement Django REST Framework pagination on the issue list to ensure performance as the database grows (e.g., 20 items per page).
- [x] **Update Endpoint:** Create a `PATCH` endpoint (e.g., `/api/issues/<uuid>/status/`) to allow the Tenant Admin to change the status of an issue (e.g., from 'open' to 'in_progress' or 'resolved').

## [x] Frontend Tasks (React + TypeScript + MUI)

- [x] **API Integration:** Add the corresponding Axios calls in `src/services/api.ts` for fetching the paginated issues and updating an issue's status.
- [x] **Dashboard Layout:** Create a `Dashboard.tsx` view. Use MUI layout components (`Container`, `Grid`, `Typography`) to build a professional B2B interface.
- [x] **Data Table/List:** Implement a data presentation component (using MUI `Table` or `@mui/x-data-grid`). It should display the standard fields (`status`, `created_at`, `description`) and dynamically flatten/display the key-value pairs from the `extra_data` JSON payload.
- [x] **Action Handlers:** Add a dropdown or action buttons in the table rows to quickly update the `status` of an issue. Ensure the UI optimistically updates or re-fetches the list upon success.

## [x] Testing Tasks

- [x] **Unit Tests:** Write a test for `Dashboard.tsx` to verify it correctly parses and renders mocked `extra_data` fields.
- [x] **E2E Tests:** Add a Cypress scenario (`manage_issue.cy.ts`) that visits the dashboard, locates an open issue, changes its status to 'resolved', and asserts the UI reflects the change.

## [x] Acceptance Criteria

- [x] A manager can view a paginated list of all issues for their specific Tenant.
- [x] The custom fields (e.g., "zona_parque", "urgencia") are clearly visible in the dashboard.
- [x] The manager can successfully change the status of an issue, and the update persists in the database.

# SPRINT 7: Authentication, Access Control & Smart Reporting

## [x] Backend Tasks (Django & Security)

- [x] **Tenant Model Update:** Add `is_public_reporting_enabled = models.BooleanField(default=True)` to the `Tenant` model in `core/models.py`. Run `makemigrations` and `migrate`.
- [x] **User Model Link:** Extend the standard Django `User` model (or create a custom one) to include a `tenant` ForeignKey. This guarantees an employee is cryptographically bound to their company.
- [x] **JWT Setup:** Install `djangorestframework-simplejwt`. Configure `/api/token/` (Login) and `/api/token/refresh/` endpoints.
- [x] **Smart Issue Creation Endpoint:** Modify the `POST /api/issues/create/` logic:
  - Query the target Tenant.
  - If `is_public_reporting_enabled` is `True`: allow anonymous creation.
  - If `is_public_reporting_enabled` is `False`: strictly enforce `IsAuthenticated` and verify the JWT user belongs to the target Tenant. Return a 403 Forbidden otherwise.
- [x] **Restricted Signup:** Do NOT create a public registration endpoint. Employee accounts will only be created by the Tenant Admin (handled via Django Admin for now).

## [x] Frontend Tasks (React + TypeScript)

- [x] **Auth State Management:** Implement `AuthContext.tsx` to handle the JWT lifecycle. Configure an Axios interceptor to automatically attach `Authorization: Bearer <token>` to requests.
- [x] **Login View:** Create `Login.tsx` with MUI (Email and Password inputs).
- [x] **Smart QR Flow Logic:** Update the dynamic issue reporting component:
  - Upon fetching the Tenant config, check `is_public_reporting_enabled`.
  - If it's `false` AND the user lacks a valid JWT, do NOT render the issue form. Instead, render an MUI `<Alert>` stating "Employee login required to report issues for this location" with a button routing to the Login view.
- [x] **Protected Routes:** Implement a `ProtectedRoute` wrapper component to block unauthenticated access to the Dashboard, redirecting intruders to the Login page.

## [x] Acceptance Criteria

- [x] Anonymous users CAN successfully submit issues if the Tenant's public reporting is enabled.
- [x] Anonymous users CANNOT see the form or submit issues if public reporting is disabled (they are prompted to log in).
- [x] The Dashboard route is completely inaccessible without a valid JWT.
- [x] There is no public "Sign Up" or "Register" link anywhere in the UI.

# SPRINT 8: Internationalization (i18n) & Spanish Default Localization

## [x] Backend Tasks (Django)

- [x] **Tenant Model Update:** Add a `default_language` field to the `Tenant` model in `core/models.py` using `models.CharField(max_length=5, choices=[('es', 'Spanish'), ('en', 'English')], default='es')`.
- [x] **Migrations:** Run `makemigrations` and `migrate`.
- [x] **API Update:** Ensure the `default_language` is serialized and included in the JSON payload returned by the Tenant config endpoint (`/api/tenant/<uuid>/config/`).

## [x] Frontend Tasks (React + TypeScript)

- [x] **Dependencies:** Install i18next packages (`npm install i18next react-i18next i18next-browser-languagedetector`).
- [x] **Translation Files:** Create a `src/locales/` directory containing `es/` and `en/` subfolders. Create a `translation.json` inside each. Extract all currently hardcoded UI texts from the React components into these JSON files.
- [x] **i18n Configuration:** Create `src/i18n.ts` to initialize `i18next`. **CRITICAL:** Set the `fallbackLng` and `defaultNS` to `'es'` (Spanish). Import this configuration file into `main.tsx`.
- [x] **Dynamic Language Switching:** Update the logic that fetches the Tenant configuration: if the API returns a `default_language`, update the UI language dynamically using `i18n.changeLanguage()`.
- [x] **Component Refactoring:** Refactor `Login.tsx`, `Dashboard.tsx`, and `DynamicIssueForm.tsx` to strictly use the `useTranslation()` hook and the `t('key')` function instead of plain text.

## [x] Acceptance Criteria

- No hardcoded UI strings exist in any React component.
- The UI defaults to Spanish upon loading.
- Changing the `default_language` setting for a Tenant in the Django Admin automatically translates their public QR reporting form.

# SPRINT 9: UI/UX Separation & Routing

## [x] Backend Tasks (Django)

- [x] **Endpoint Verification:** Verify that all REST API endpoints (e.g., submitting issues, fetching tenant config) function correctly and independently of the new frontend routing structure.
- [x] **CORS/CSRF Check:** Ensure CORS and CSRF settings in `settings.py` correctly handle requests from the decoupled frontend setup.

## [x] Frontend Tasks (React + TypeScript)

- [x] **Dependencies:** Install the routing library (`npm install react-router-dom`).
- [x] **Routing Configuration:** Set up `BrowserRouter` in `main.tsx` or `App.tsx`. Define the routing tree using `Routes` and `Route` components.
- [x] **Public View (\`/:tenant_id/report\`):** Create `src/views/ReportIssueView.tsx`. Extract and move the issue submission form here. Remove all headers, navigation bars, and login buttons to keep the view strictly isolated for QR code users.
- [x] **Authentication View (\`/login\`):** Create `src/views/LoginView.tsx`. Move the login form component here and configure a successful authentication redirect to `/dashboard`.
- [x] **Private View (\`/dashboard\`):** Create `src/views/DashboardView.tsx`. Extract the administration panel and issue list/table and move them into this component.
- [x] **Route Guarding:** Create a `ProtectedRoute` wrapper component. Apply it to the `/dashboard` route to verify if the user has a valid auth token, redirecting them to `/login` if unauthorized.
- [x] **Cleanup:** Refactor `App.tsx` so it solely manages the route definitions, stripping out any residual UI elements or form states.

## [x] Acceptance Criteria

- Navigating to `/:tenant_id/report` renders only the reporting form, preventing any access to other parts of the application.
- Navigating to `/dashboard` without an active, valid session automatically redirects the user to `/login`.
- The root component (`App.tsx`) acts purely as a router, containing no direct UI layout or business logic.

# SPRINT 10: Dynamic QR Code Generator

## [x] Backend Tasks (Django)

- [x] No immediate backend tasks required. The QR code will be generated on the client side. Ensure the frontend environment variables hold the correct base URL for production/localhost.

## [x] Frontend Tasks (React + TypeScript)

- [x] **Dependencies:** Install a QR code generation library (e.g., `npm install qrcode.react`).
- [x] **UI Integration:** Add a "Generate/Download QR" section within the `DashboardView` or Tenant settings panel.
- [x] **URL Construction:** Write the logic to dynamically construct the public reporting URL using the current Tenant's ID (e.g., `https://yourdomain.com/${tenant_id}/report`).
- [x] **QR Rendering:** Render the QR code component on the screen using the constructed URL as its value.
- [x] **Download Functionality:** Implement a function to convert the rendered QR code canvas into an image file (PNG) and trigger a download so the administrator can print it on stickers.

## [x] Acceptance Criteria

- [x] The administrator can see a QR code that accurately points to their specific public reporting form.
- [x] The QR code can be successfully downloaded as a standard image file.
- [x] Scanning the generated QR code with a mobile device correctly routes the user directly to the isolated `ReportIssueView`.

# SPRINT 11: Operator Assignment & Task Workflow

## [x] Backend Tasks (Django)

- [x] **Operator Profile Model:** Create an `OperatorProfile` model in `core/models.py` linked to the Django `User` model, including a `phone_number` field for WhatsApp integration.
- [x] **Issue Model Update:** Add an `assigned_to` field (ForeignKey to `User`/`OperatorProfile`, nullable) and a `status` field (`choices=[('pending', 'Pending'), ('in_progress', 'In Progress'), ('resolved', 'Resolved')]`, default='pending') to the `Issue` model.
- [x] **Assignment API Endpoint:** Create or update a REST endpoint (e.g., `PATCH /api/issues/<uuid>/assign/`) to allow administrators to assign an operator and update the issue status.
- [x] **Operator Task Endpoint:** Implement a secure, tokenized endpoint (or standard authenticated view) to fetch details for a specific assigned task without requiring a full password login if a valid secure token is provided.

## [x] Frontend Tasks (React + TypeScript)

- [x] **Admin Assignment UI:** Add an "Assign Operator" dropdown menu inside the `DashboardView` issue detail panel, populated with available operators fetched from the backend.
- [x] **Status Badges:** Update the issue table/list in the dashboard to display the current status (`Pending`, `In Progress`, `Resolved`) and the assigned operator's name.
- [x] **Operator Mobile View (`/work/task`):** Create a minimal, mobile-first view (`src/views/OperatorTaskView.tsx`) optimized for field workers. It should display the issue description, submitted photos, and a prominent action button to change the status.
- [x] **Status Update Logic:** Connect the action buttons in the operator view to send status update requests (`in_progress`, `resolved`) back to the Django API.

## [x] Acceptance Criteria

- [x] Administrators can select and assign a specific operator to any pending issue from the main dashboard.
- [x] The issue status dynamically changes reflecting the progress (e.g., updates to 'In Progress' when the operator accepts it).
- [x] Operators can access their specific assigned task via a clean, mobile-friendly interface and successfully mark it as resolved.
- [x] Changing an issue's assignment or status updates the records instantly in the database with proper data integrity.

# SPRINT 12: Media Uploads & WhatsApp Notifications

## [x] Backend Tasks (Django)

- [x] **Storage Configuration:** Install `django-storages` and `boto3` (for AWS S3) or `cloudinary` to handle media files. Configure `settings.py` to route uploaded files securely to the cloud provider.
- [x] **Issue Model Media Update:** Add an `image` or `evidence` field (`models.ImageField`, nullable) to the `Issue` model.
- [x] **WhatsApp Service Integration:** Create a dedicated notification service/utility (using Twilio or Meta's official API). Store API keys and credentials securely in environment variables.
- [x] **Trigger Notification:** Implement a Django signal or utility function so that when an administrator assigns an operator to an issue, an automated WhatsApp message is automatically triggered containing the task details and the secure mobile view link (Magic Link).

## [x] Frontend Tasks (React + TypeScript)

- [x] **Form File Input:** Update `ReportIssueView.tsx` (the public QR form) to include a file input field allowing users to take or upload a photo of the incident.
- [x] **API Payload Update:** Modify the submission logic in the frontend to use `FormData` instead of a standard JSON payload, enabling the multi-part transfer of both text data and the image file to the Django API.
- [x] **Operator View Images:** Update `OperatorTaskView.tsx` to safely render the submitted image/evidence if it exists, so the operator can inspect the damage visually before arriving.
- [x] **Loading & Upload States:** Add visual loading spinners or progress bars in the UI to ensure users know their media is being uploaded during submission.

## [x] Acceptance Criteria

- [x] Public users can successfully attach a photo when reporting an issue from their phone via the QR view.
- [x] Images are stored securely in cloud storage (AWS S3/Cloudinary) and are referenced via dynamic, absolute URLs in the database.
- [x] Assigning an issue to an operator sends an instant WhatsApp message to their registered phone number.
- [x] The WhatsApp notification contains a functional, secure link that opens the operator's mobile view directly, showing both the description and the uploaded photo.

# SPRINT 13: Operator Hub & Localized Dual-Link Notifications

## 🎯 Objective

Implement a centralized, passwordless task dashboard (Operator Hub) for field workers using persistent secure tokens. Update the WhatsApp notification system to dispatch messages strictly in Spanish, utilizing localized templates and providing two distinct navigation links (specific task vs. general hub).

## [x] Backend Tasks (Django)

- [x] **Operator Model Update:** Add a `hub_token` field (`models.UUIDField`, default=`uuid.uuid4`, unique=True) to the `OperatorProfile` model in `core/models.py` to act as a permanent secure access key for their dashboard.
- [x] **Hub API Endpoint:** Create a secure REST endpoint (e.g., `GET /api/operator/hub/`) that accepts the `hub_token` as a query parameter and returns a list of all active issues assigned to that specific operator.
- [x] **Localized Message Templates:** Define the notification string templates in Spanish within the backend service, ensuring all text aligns with the application's default localization strategy.
- [x] **Dual-Link Payload Construction:** Update the notification trigger logic to dynamically generate two separate URLs:
  1. Specific Task Link: `http://localhost:5173/work/task/<issue_id>?token=<dynamic_task_token>`
  2. General Hub Link: `http://localhost:5173/work/hub?token=<operator_hub_token>`
- [x] **WhatsApp Dispatch Update:** Update the payload sent to Meta's Cloud API so the single WhatsApp message combines both links cleanly in the Spanish message body.

## [x] Frontend Tasks (React + TypeScript)

- [x] **Translation Files Update:** Add the new UI keys for the operator dashboard and notifications into `src/locales/es/translation.json` and `src/locales/en/translation.json` to keep all text decoupled.
- [x] **Operator Hub View (`/work/hub`):** Create a new mobile-first component `src/views/OperatorHubView.tsx`.
- [x] **Hub Data Fetching:** Implement logic in `OperatorHubView` to parse the `token` parameter from the URL, call the `api/operator/hub/` endpoint, and handle loading or unauthorized states if the token is invalid.
- [x] **Task List Layout:** Design a clean, high-contrast list view within the Hub showing all assigned jobs grouped or sorted by urgency level (`Critical`, `High`, etc.).
- [x] **Navigation Links:** Ensure each task item in the Hub list links directly to its corresponding individual `OperatorTaskView`.

## [x] Acceptance Criteria

- [x] High-priority automated WhatsApp notifications are generated and delivered strictly in Spanish.
- [x] The dispatch message contains two fully operational links: one for immediate access to the reported incident and another pointing to the operator's total pending workload.
- [x] Navigating to `/work/hub?token=<valid_uuid>` successfully retrieves and displays all tasks matching that operator profile without requiring an email or password login.
- [x] Invalid or missing hub tokens securely reject access to the backend data and show an error view.

# SPRINT 12.5: Image Uploads (Frontend) & UX Quick Wins

## 🎯 Objective

Connect the React frontend to the new Google Cloud Storage backend to allow mobile photo uploads. Apply quick UX/UI fixes reported by park management to improve the dashboard experience.

## [x] Frontend Tasks: Media Uploads (React)

- [x] **Mobile Camera Integration:** Update the `ReportIssueView.tsx` form. Ensure the file input includes `accept="image/*" capture="environment"` so mobile phones natively open the camera when tapped.
- [x] **FormData Submission:** Refactor the API call in `ReportIssueView.tsx` to use `FormData` instead of a JSON payload, allowing the image file and text data to be sent together to Django.
- [x] **Edit Form Consistency:** Add the same `FormData` logic and file input to the Issue Edit modal/page in the Dashboard, so managers can also upload or replace photos after the issue is created.

## [x] Frontend Tasks: UX/UI Quick Wins

- [x] **Fix Status Badge Overflow:** Inspect the `span` showing the issue status in `DashboardView.tsx`. Apply CSS fixes (e.g., `text-overflow: ellipsis`, `white-space: nowrap`, or flexbox adjustments) to ensure long status names don't break the layout.
- [x] **Critical Urgency Highlighting:** Update the urgency rendering logic in the Dashboard table. If `urgency === 'critical'`, apply a prominent red styling (background/text) to immediately draw the manager's attention.

# SPRINT 13: Cloud Storage Integration & Advanced Data Tables

## 🎯 Objective

Migrate media storage to Google Cloud Storage (GCS) for secure mobile photo uploads. Refactor the administration table using TanStack Table to implement robust client-side filtering (by operator, urgency, and status) and fix reported UI/UX layout bugs.

## [x] Backend Tasks (Django)

- [x] **GCS Dependencies:** Install `django-storages[google]` and update `requirements.txt`. Remove `boto3` if previously present.
- [x] **Storage Settings:** Configure the `STORAGES` dictionary in `settings.py` to use Google Cloud Storage as the default file storage backend backend, using environment variables for `GS_BUCKET_NAME`.
- [x] **Authentication Setup:** Ensure the backend authenticates with GCS using the standard `GOOGLE_APPLICATION_CREDENTIALS` environment variable pathway.
- [x] **Multipart API Support:** Verify that both the issue creation and issue partial update (PATCH) endpoints correctly parse multipart form data to process incoming binary image files.

## [x] Frontend Tasks (React + TypeScript)

- [x] **Dependencies:** Install the headless table library via `npm install @tanstack/react-table`.
- [x] **TanStack Table Core Refactoring:** Replace the legacy HTML table in `DashboardView.tsx` with TanStack's `useReactTable` hook. Map existing columns (ID, description, operator, status, urgency) to the new structure.
- [x] **Filter Controls UI:** Add dropdown `<select>` components above the table for filtering rows by "Assigned Operator" and "Urgency Level". Link these controls directly to TanStack's column filtering state.
- [x] **Status Badge Layout Fix:** Apply text-overflow and layout constraint classes (e.g., `white-space: nowrap`, `overflow-hidden`) to the status `span` elements to prevent any text clipping or breaking.
- [x] **Critical Urgency Alert:** Conditionalize row or badge styling within the TanStack cell renderer so that if `urgency === 'critical'`, it displays a high-visibility red color palette.
- [x] **Mobile Camera Integration:** Add a file input field to both `ReportIssueView.tsx` and the Issue Edit interface with attributes `accept="image/*" capture="environment"` to trigger native mobile cameras.
- [x] **FormData Payload:** Rewrite API submission hooks for creating and editing issues to wrap text fields and the binary image file into a unified `FormData` object.

## [x] Acceptance Criteria

- [x] Table columns can be dynamically filtered by operator or urgency instantly with smooth layout handling.
- [x] Status strings never overflow their containment boxes, and critical tasks stand out with clear red visual indicators.
- [x] Submitting an issue or editing an existing one with a photo uploads the file directly to the Google Cloud Storage bucket.
- [x] Mobile devices automatically prompt the user to use their camera when tapping the file upload input.

# SPRINT 14: Media Rendering & Image Management

## 🎯 Objective

Complete the cloud storage integration by properly rendering the uploaded images across all frontend views (Admin Dashboard and Operator Mobile View). Implement image previews before uploading, a lightbox for detailed inspection, and automated file cleanup on the backend to prevent storage bloat.

## [x] Backend Tasks (Django)

- [x] **URL Serialization:** Verify the Django REST Framework serializers (e.g., `IssueSerializer`). Ensure that the `image` field returns the absolute, public URL from Google Cloud Storage so the frontend can render it directly.
- [x] **Automated Cleanup:** Install `django-cleanup` (`pip install django-cleanup`) and add it to `INSTALLED_APPS`. This ensures that when an `Issue` is deleted or an image is replaced, the actual binary file is automatically removed from the GCS bucket to save costs.

## [x] Frontend Tasks (React + TypeScript)

- [x] **Pre-upload Thumbnail Preview:** Update `ReportIssueView.tsx`. When a user selects a file using the camera input, use `URL.createObjectURL(file)` to display a small thumbnail preview of the photo _before_ they hit submit.
- [x] **Admin Dashboard Rendering:** Update the Issue Detail modal/drawer in the admin dashboard. If an `image` URL exists in the issue payload, render the image prominently next to the description.
- [x] **Operator Mobile View Rendering:** Update the `OperatorTaskView.tsx` (the magic link view from WhatsApp). Display the uploaded image at the top of the task details so the operator can visually inspect the problem before arriving at the location.
- [x] **Lightbox / Fullscreen Modal:** Implement a simple click-to-expand feature (lightbox) for the images in both the Admin Dashboard and the Operator View. Maintenance workers need to zoom in on the photos to see specific details of the damage.
- [x] **Placeholder / Fallback:** Add a visual fallback (e.g., a gray box with an icon or "No photo provided") for issues that were submitted without an attached image, ensuring the UI remains structurally consistent.

## [x] Acceptance Criteria

- [x] Users can see a preview of their photo immediately after taking it on their phone, before submitting the form.
- [x] The admin dashboard and the operator mobile view successfully load and display the GCS image URLs.
- [x] Clicking on an image expands it to a full-screen view for detailed inspection.
- [x] Deleting an issue from the Django admin or API automatically deletes the corresponding file from the Google Cloud Storage bucket.

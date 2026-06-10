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

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

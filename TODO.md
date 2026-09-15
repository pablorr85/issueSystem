# TODO

## 🚀 Upcoming Sprints & Architectural Enhancements

### [Sprint 35] - Frontend Global State & API Caching with RTK Query (Point C)
- [ ] Integrate Redux Toolkit (RTK Query) into React frontend.
- [ ] Migrate API endpoints (`getIssues`, `getOperators`, `getTenantConfig`) from manual `useEffect` hooks to RTK Query api slices.
- [ ] Implement automatic cache invalidation, stale-while-revalidate strategy, and optimistic UI updates for task status and operator assignments.

### [Sprint 36] - Production Containerization & CI/CD Pipeline (Point D - Scheduled for Later)
- [ ] Create production-ready `Dockerfile` for Django backend and React frontend.
- [ ] Create `docker-compose.yml` orchestrating PostgreSQL, Redis, Django API, Celery Workers, and Vite frontend for 1-command local onboarding.
- [ ] Build GitHub Actions CI pipeline (`.github/workflows/ci.yml`) enforcing ESLint, TypeScript type-check (`tsc --noEmit`), backend pytest, Vitest, and Cypress E2E.

### [Sprint 37] - OpenAPI 3.0 Auto-Documentation & TypeScript Client Generation (Point E)
- [ ] Integrate `drf-spectacular` into Django backend for automated OpenAPI 3.0 schema generation.
- [ ] Expose interactive Swagger UI and ReDoc interfaces at `/api/docs/` and `/api/schema/`.
- [ ] Setup automated TypeScript client and interface generator from OpenAPI schema (`openapi-typescript` / `orval`).
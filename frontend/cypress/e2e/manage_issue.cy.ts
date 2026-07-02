describe('Tenant Dashboard & Issue Management E2E Test', () => {
  const tenantUuid = 'f818979b-2ea0-43cb-8dd1-7c1729ee1fea';
  const issueId = 101;

  beforeEach(() => {
    // Set localStorage auth tokens so the dashboard is accessible
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'mock-jwt-access-token');
      win.localStorage.setItem('user', 'zoo_keeper');
      win.localStorage.setItem('tenantId', tenantUuid);
    });

    // Intercept Tenant Config loading
    cy.intercept('GET', `**/api/tenant/${tenantUuid}/config/`, {
      statusCode: 200,
      body: {
        id: tenantUuid,
        name: 'Wild Park MVP',
        logo_url: null,
        default_language: 'en',
        visual_config: {
          primary_color: '#2e7d32'
        },
        custom_fields: [
          {
            name: 'zona_parque',
            field_type: 'select',
            required: true,
            options: ['Restaurante', 'Zona Marina']
          },
          {
            name: 'urgencia',
            field_type: 'select',
            required: true,
            options: ['Baja', 'Media', 'CRÍTICA']
          }
        ]
      }
    }).as('getTenantConfig');

    // Intercept Issue list GET request
    cy.intercept('GET', '**/api/issues/*', {
      statusCode: 200,
      body: {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: issueId,
            tenant_id: tenantUuid,
            status: 'pending',
            description: 'Water leak in alligator pond',
            created_at: '2026-06-01T12:00:00Z',
            extra_data: {
              zona_parque: 'Zona Marina',
              urgencia: 'CRÍTICA'
            },
            assigned_to: null
          }
        ]
      }
    }).as('getIssuesList');

    // Intercept status update PATCH request
    cy.intercept('PATCH', `**/api/issues/${issueId}/`, {
      statusCode: 200,
      body: {
        id: issueId,
        status: 'resolved',
        description: 'Water leak in alligator pond',
        extra_data: {
          zona_parque: 'Zona Marina',
          urgencia: 'CRÍTICA'
        }
      }
    }).as('updateIssue');

    // Intercept operators to prevent hitting actual backend and receiving 401
    cy.intercept('GET', '**/api/operators/', {
      statusCode: 200,
      body: [
        {
          id: 1,
          username: 'zoo_keeper',
          email: 'zoo@test.com',
          phone_number: '+123456789'
        }
      ]
    }).as('getOperators');

    // Intercept comments request to prevent 401 logout
    cy.intercept('GET', '**/api/issues/*/comments/', {
      statusCode: 200,
      body: []
    }).as('getComments');

    // Intercept stats request
    cy.intercept('GET', '**/api/issues/stats/', {
      statusCode: 200,
      body: {
        unassigned_count: 5,
        in_progress_count: 3,
        blocked_count: 2
      }
    }).as('getStats');
  });

  it('navigates to dashboard, displays dynamic custom columns, and resolves an issue', () => {
    // 1. Load the Dashboard directly (already authenticated)
    cy.visit('/backlog');
    cy.wait('@getTenantConfig');
    cy.wait('@getIssuesList');
    cy.wait('@getOperators');

    // 3. Verify Dashboard Layout
    cy.contains('h2', 'Tenant Manager Dashboard').should('be.visible');

    // Verify table columns exist
    cy.contains('th', 'ID').should('be.visible');
    cy.contains('th', 'Status').should('be.visible');
    cy.contains('th', 'Description').should('be.visible');
    cy.contains('th', 'zona parque').should('be.visible'); // Custom field column (flattened)
    cy.contains('th', 'urgencia').should('be.visible'); // Custom field column (flattened)
    cy.contains('th', 'Created At').should('be.visible');
    cy.contains('th', 'Assign Operator').should('be.visible');

    // Verify row data renders
    cy.get(`[data-testid="issue-row-${issueId}"]`).within(() => {
      cy.contains('101').should('be.visible');
      cy.contains('Pending').should('be.visible');
      cy.contains('Water leak in alligator pond').should('be.visible');
      cy.contains('Zona Marina').should('be.visible');
      cy.contains('CRÍTICA').should('be.visible');
    });

    // 4. Update the Issue Status (via Edit Issue Modal)
    cy.get(`[data-testid="edit-issue-id-${issueId}"]`).click();
    cy.wait('@getComments');

    // In Edit Modal, select status 'resolved'
    cy.get('[data-testid="edit-status-select"]').parent().find('.MuiSelect-select').click();
    cy.get('.MuiMenuItem-root').contains('Resolved').click();

    // Save changes
    cy.contains('button', 'Save Changes').click();

    // Verify network call was made to patch status
    cy.wait('@updateIssue').then((interception) => {
      expect(interception.request.body.status).to.equal('resolved');
    });

    // Verify UI reflects resolved state
    cy.get(`[data-testid="issue-row-${issueId}"]`).within(() => {
      cy.contains('Resolved').should('be.visible');
    });
  });

  it('navigates through interactive KPI cards and syncs backlog filters with URL query parameters', () => {
    // 1. Visit Stats Dashboard
    cy.visit('/');
    cy.wait('@getTenantConfig');
    cy.wait('@getStats');

    // Verify KPI numbers rendered
    cy.get('[data-testid="kpi-card-unassigned"]').contains('5').should('be.visible');
    cy.get('[data-testid="kpi-card-in-progress"]').contains('3').should('be.visible');
    cy.get('[data-testid="kpi-card-blocked"]').contains('2').should('be.visible');

    // 2. Click Unassigned Issues KPI card
    cy.get('[data-testid="kpi-card-unassigned"]').click();
    cy.url().should('include', '/backlog?assigned=false');
    cy.wait('@getIssuesList');

    // Verify assignment filter dropdown in UI is pre-selected to 'Unassigned'
    cy.get('[data-testid="dashboard-assignment-filter"]').parent().find('.MuiSelect-select').contains('Unassigned').should('be.visible');

    // Go back to Dashboard
    cy.visit('/');
    cy.wait('@getStats');

    // 3. Click Blocked Tasks KPI card
    cy.get('[data-testid="kpi-card-blocked"]').click();
    cy.url().should('include', '/backlog?status=blocked');
    cy.wait('@getIssuesList');

    // Verify status filter dropdown in UI is pre-selected to 'Blocked'
    cy.get('[data-testid="dashboard-status-filter"]').parent().find('.MuiSelect-select').contains('Blocked').should('be.visible');

    // Go back to Dashboard
    cy.visit('/');
    cy.wait('@getStats');

    // 4. Click Currently in Progress KPI card
    cy.get('[data-testid="kpi-card-in-progress"]').click();
    cy.url().should('include', '/board');
  });
});

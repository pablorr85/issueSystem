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
            status: 'open',
            description: 'Water leak in alligator pond',
            extra_data: {
              zona_parque: 'Zona Marina',
              urgencia: 'CRÍTICA'
            },
            created_at: '2026-06-09T12:00:00Z',
            updated_at: '2026-06-09T12:00:00Z'
          }
        ]
      }
    }).as('getIssuesList');

    // Intercept status update PATCH request
    cy.intercept('PATCH', `**/api/issues/${issueId}/status/`, {
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
    }).as('updateIssueStatus');
  });

  it('navigates to dashboard, displays dynamic custom columns, and resolves an issue', () => {
    cy.visit('/');

    // 1. Load the Tenant Configuration
    cy.get('input[placeholder*="Enter Tenant UUID"]').type(tenantUuid);
    cy.get('button').contains('Load').click();
    cy.wait('@getTenantConfig');

    // Verify dynamic form renders
    cy.contains(`Report an Issue (Wild Park MVP)`).should('be.visible');

    // 2. Switch to Manager Dashboard Tab
    cy.get('[data-testid="tab-dashboard"]').click();
    cy.wait('@getIssuesList');

    // 3. Verify Dashboard Layout
    cy.contains('h2', 'Tenant Manager Dashboard').should('be.visible');

    // Verify table columns exist
    cy.contains('th', 'ID').should('be.visible');
    cy.contains('th', 'Status').should('be.visible');
    cy.contains('th', 'Description').should('be.visible');
    cy.contains('th', 'zona parque').should('be.visible'); // Custom field column (flattened)
    cy.contains('th', 'urgencia').should('be.visible'); // Custom field column (flattened)
    cy.contains('th', 'Created At').should('be.visible');
    cy.contains('th', 'Actions').should('be.visible');

    // Verify row data renders
    cy.get(`[data-testid="issue-row-${issueId}"]`).within(() => {
      cy.contains('101').should('be.visible');
      cy.contains('open').should('be.visible');
      cy.contains('Water leak in alligator pond').should('be.visible');
      cy.contains('Zona Marina').should('be.visible');
      cy.contains('CRÍTICA').should('be.visible');
    });

    // 4. Update the Issue Status
    cy.get(`[data-testid="issue-row-${issueId}"]`).within(() => {
      // Find row action select input (hidden select or the button styled select)
      cy.get('.MuiSelect-select').click();
    });
    
    // Choose 'resolved' from the popover options list
    cy.get('.MuiMenuItem-root').contains('Resolved').click();

    // Verify network call was made to patch status
    cy.wait('@updateIssueStatus').then((interception) => {
      expect(interception.request.body).to.deep.equal({
        status: 'resolved'
      });
    });

    // Verify UI reflects resolved state
    cy.get(`[data-testid="issue-row-${issueId}"]`).within(() => {
      cy.contains('resolved').should('be.visible');
    });
  });
});

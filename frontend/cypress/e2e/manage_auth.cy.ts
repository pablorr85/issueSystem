describe('Authentication & Access Control E2E Test', () => {
  const tenantUuid = 'f818979b-2ea0-43cb-8dd1-7c1729ee1fea';

  beforeEach(() => {
    // Clear localStorage to start clean
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('blocks form and prompts to login when is_public_reporting_enabled is false and user is anonymous', () => {
    // Intercept config with public reporting disabled
    cy.intercept('GET', `**/api/tenant/${tenantUuid}/config/`, {
      statusCode: 200,
      body: {
        id: tenantUuid,
        name: 'Private Zoo',
        logo_url: null,
        visual_config: { primary_color: '#4a148c' },
        is_public_reporting_enabled: false,
        custom_fields: []
      }
    }).as('getPrivateConfig');

    cy.visit('/');

    // Load tenant
    cy.get('input[placeholder*="Enter Tenant UUID"]').type(tenantUuid);
    cy.get('button').contains('Load').click();
    cy.wait('@getPrivateConfig');

    // Form should not be displayed, instead show alert
    cy.get('[data-testid="public-disabled-warning"]').should('be.visible');
    cy.contains('Employee login required to report issues for this location.').should('be.visible');
    cy.contains('button[type="submit"]', 'Submit Issue').should('not.exist');

    // Click "Go to Login" button
    cy.get('[data-testid="go-to-login-button"]').click();

    // Verify login view is active
    cy.contains('h2', 'Employee Sign In').should('be.visible');
  });

  it('redirects anonymous user to login page when trying to access manager dashboard', () => {
    // Intercept config with public reporting enabled
    cy.intercept('GET', `**/api/tenant/${tenantUuid}/config/`, {
      statusCode: 200,
      body: {
        id: tenantUuid,
        name: 'Selwo Marina',
        logo_url: null,
        visual_config: { primary_color: '#00E5FF' },
        is_public_reporting_enabled: true,
        custom_fields: []
      }
    }).as('getTenantConfig');

    cy.visit('/');

    // Load tenant
    cy.get('input[placeholder*="Enter Tenant UUID"]').type(tenantUuid);
    cy.get('button').contains('Load').click();
    cy.wait('@getTenantConfig');

    // Click Dashboard tab
    cy.get('[data-testid="tab-dashboard"]').click();

    // Should redirect to employee login
    cy.contains('h2', 'Employee Sign In').should('be.visible');
  });

  it('authenticates user successfully, transitions to dashboard, shows logout, and allows public form access', () => {
    // Intercept config with public reporting disabled to test complete path
    cy.intercept('GET', `**/api/tenant/${tenantUuid}/config/`, {
      statusCode: 200,
      body: {
        id: tenantUuid,
        name: 'Private Zoo',
        logo_url: null,
        visual_config: { primary_color: '#4a148c' },
        is_public_reporting_enabled: false,
        custom_fields: []
      }
    }).as('getPrivateConfig');

    // Intercept token request
    cy.intercept('POST', '**/api/token/', {
      statusCode: 200,
      body: {
        access: 'mock-jwt-access-token',
        refresh: 'mock-jwt-refresh-token',
        tenant_id: tenantUuid,
        username: 'zoo_keeper'
      }
    }).as('loginRequest');

    // Intercept issues list request
    cy.intercept('GET', '**/api/issues/?tenant_id=*', {
      statusCode: 200,
      body: {
        count: 0,
        next: null,
        previous: null,
        results: []
      }
    }).as('getIssues');

    cy.visit('/');

    // Load tenant
    cy.get('input[placeholder*="Enter Tenant UUID"]').type(tenantUuid);
    cy.get('button').contains('Load').click();
    cy.wait('@getPrivateConfig');

    // Verify warning is visible initially
    cy.get('[data-testid="public-disabled-warning"]').should('be.visible');

    // Go to Dashboard (which redirects to Login)
    cy.get('[data-testid="tab-dashboard"]').click();
    cy.contains('h2', 'Employee Sign In').should('be.visible');

    // Type credentials
    cy.contains('label', 'Username').parent().find('input').type('zoo_keeper');
    cy.contains('label', 'Password').parent().find('input').type('keeperpass');
    cy.get('[data-testid="login-submit-button"]').click();

    // Wait for auth request
    cy.wait('@loginRequest');
    cy.wait('@getIssues');

    // Verify redirected to dashboard, and shows title
    cy.contains('h2', 'Tenant Manager Dashboard').should('be.visible');

    // Verify logged in status header and logout button
    cy.contains('Logged in as zoo_keeper').should('be.visible');
    cy.get('[data-testid="logout-button"]').should('be.visible');

    // Now go back to "Report Issue" tab (since user is authenticated, they should see the form)
    cy.get('[data-testid="tab-report"]').click();
    cy.get('[data-testid="public-disabled-warning"]').should('not.exist');
    cy.contains('Report an Issue (Private Zoo)').should('be.visible');
    cy.get('textarea[required]').should('exist'); // Description input

    // Logout
    cy.get('[data-testid="logout-button"]').click();

    // Verify logged out state
    cy.get('[data-testid="logout-button"]').should('not.exist');
    cy.get('[data-testid="public-disabled-warning"]').should('be.visible'); // blocked again
  });
});

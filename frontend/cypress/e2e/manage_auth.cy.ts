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
        default_language: 'en',
        visual_config: { primary_color: '#4a148c' },
        is_public_reporting_enabled: false,
        custom_fields: []
      }
    }).as('getPrivateConfig');

    cy.visit('/');

    // Load tenant
    cy.get('input').type(tenantUuid);
    cy.get('button[type="submit"]').click();
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
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
    cy.contains('h2', 'Inicio de Sesión de Empleado').should('be.visible');
  });

  it('authenticates user successfully, transitions to dashboard, shows logout, and allows public form access', () => {
    // Intercept config with public reporting disabled to test complete path
    cy.intercept('GET', `**/api/tenant/${tenantUuid}/config/`, {
      statusCode: 200,
      body: {
        id: tenantUuid,
        name: 'Private Zoo',
        logo_url: null,
        default_language: 'en',
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

    // Intercept issues stats request
    cy.intercept('GET', '**/api/issues/stats/', {
      statusCode: 200,
      body: {
        unassigned_count: 5,
        in_progress_count: 3,
        blocked_count: 1
      }
    }).as('getIssuesStats');

    // 1. Visit report page, verify warning is visible initially
    cy.visit(`/${tenantUuid}/report`);
    cy.wait('@getPrivateConfig');
    cy.get('[data-testid="public-disabled-warning"]').should('be.visible');

    // 2. Click "Go to Login" button
    cy.get('[data-testid="go-to-login-button"]').click();
    cy.contains('h2', 'Employee Sign In').should('be.visible');

    // 3. Type credentials and sign in
    cy.contains('label', 'Username').parent().find('input').type('zoo_keeper');
    cy.contains('label', 'Password').parent().find('input').type('keeperpass');
    cy.get('[data-testid="login-submit-button"]').click();

    // Wait for auth request
    cy.wait('@loginRequest');
    cy.wait('@getIssuesStats');

    // Verify redirected to dashboard, and shows title
    cy.contains('h2', 'Tenant Manager Dashboard').should('be.visible');

    // Verify logged in status header and logout button
    cy.contains('Logged in as zoo_keeper').should('be.visible');
    cy.get('[data-testid="logout-button"]').should('be.visible');

    // 4. Now go back to Report page directly (since user is authenticated, they should see the form)
    cy.visit(`/${tenantUuid}/report`);
    cy.get('[data-testid="public-disabled-warning"]').should('not.exist');
    cy.contains('Report an Issue (Private Zoo)').should('be.visible');
    cy.get('textarea[required]').should('exist'); // Description input

    // 5. Go back to Dashboard to log out
    cy.visit('/dashboard');
    cy.get('[data-testid="logout-button"]').click();

    // Verify logged out state
    cy.get('[data-testid="logout-button"]').should('not.exist');
    cy.visit(`/${tenantUuid}/report`);
    cy.get('[data-testid="public-disabled-warning"]').should('be.visible'); // blocked again
  });
});

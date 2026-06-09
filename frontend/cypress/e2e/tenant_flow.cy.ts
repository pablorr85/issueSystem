describe('Tenant Flow E2E Test', () => {
  it('should load tenant branding dynamically when a UUID is submitted', () => {
    // Intercept the backend API config call
    cy.intercept('GET', '**/api/tenant/f818979b-2ea0-43cb-8dd1-7c1729ee1fea/config/', {
      statusCode: 200,
      body: {
        name: 'Parque de Atracciones',
        logo_url: null,
        default_language: 'en',
        visual_config: {
          primary_color: '#FF5733',
        },
      },
    }).as('getTenantConfig');

    cy.visit('/');

    // Verify initial state is Spanish default
    cy.contains('h1', 'SaaS de Gestión de Incidencias').should('be.visible');
    
    // Type UUID and submit
    cy.get('input').type('f818979b-2ea0-43cb-8dd1-7c1729ee1fea');
    cy.get('button[type="submit"]').click();

    // Wait for the intercepted request
    cy.wait('@getTenantConfig');

    // Verify updated tenant branding (switched to English)
    cy.contains('h3', 'Parque de Atracciones').should('be.visible');
    cy.contains('Branding theme updated dynamically.').should('be.visible');
  });

  it('should show an error message when a tenant is not found', () => {
    cy.intercept('GET', '**/api/tenant/00000000-0000-0000-0000-000000000000/config/', {
      statusCode: 404,
    }).as('getNotFound');

    cy.visit('/');

    cy.get('input').type('00000000-0000-0000-0000-000000000000');
    cy.get('button[type="submit"]').click();

    cy.wait('@getNotFound');

    cy.contains('Tenant no encontrado. Por favor verifique el UUID.').should('be.visible');
  });
});

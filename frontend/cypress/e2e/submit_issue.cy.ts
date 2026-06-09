describe('Submit Issue E2E Test', () => {
  const tenantUuid = 'f818979b-2ea0-43cb-8dd1-7c1729ee1fea';

  beforeEach(() => {
    // Intercept Tenant Config loading
    cy.intercept('GET', `**/api/tenant/${tenantUuid}/config/`, {
      statusCode: 200,
      body: {
        id: tenantUuid,
        name: 'Selwo Marina',
        logo_url: null,
        default_language: 'en',
        visual_config: {
          primary_color: '#00E5FF'
        },
        custom_fields: [
          {
            name: 'Zone',
            field_type: 'text',
            required: true,
            options: []
          },
          {
            name: 'Cage Number',
            field_type: 'number',
            required: false,
            options: []
          },
          {
            name: 'Urgent',
            field_type: 'boolean',
            required: false,
            options: []
          },
          {
            name: 'Category',
            field_type: 'select',
            required: true,
            options: ['Cleaning', 'Maintenance', 'Security']
          }
        ]
      }
    }).as('getTenantConfig');

    // Intercept Issue creation POST request
    cy.intercept('POST', '**/api/issues/create/', {
      statusCode: 201,
      body: {
        id: 101,
        status: 'open',
        description: 'Water leak in penguin enclosure',
        extra_data: {
          Zone: 'Zone A',
          'Cage Number': 3,
          Urgent: true,
          Category: 'Maintenance'
        }
      }
    }).as('createIssue');
  });

  it('renders dynamic fields and submits successfully', () => {
    cy.visit('/');

    // Load Tenant
    cy.get('input').type(tenantUuid);
    cy.get('button[type="submit"]').click();
    cy.wait('@getTenantConfig');

    // Verify dynamic form renders
    cy.contains(`Report an Issue (Selwo Marina)`).should('be.visible');
    cy.get('textarea[required]').should('exist'); // Description field
    cy.contains('label', 'Zone').parent().find('input').should('exist'); // Text custom field
    cy.contains('label', 'Cage Number').parent().find('input').should('exist'); // Number custom field
    cy.get('input[type="checkbox"]').should('exist'); // Boolean custom field
    
    // Fill out standard fields
    cy.get('textarea[required]').type('Water leak in penguin enclosure');

    // Fill out custom fields
    cy.contains('label', 'Zone').parent().find('input').type('Zone A');
    cy.contains('label', 'Cage Number').parent().find('input').type('3');
    cy.get('input[type="checkbox"]').check({ force: true });

    // Fill out select dropdown (Cypress clicks the MUI select trigger, then selects the option from the popover)
    cy.get('.MuiSelect-select').click();
    cy.get('.MuiMenuItem-root').contains('Maintenance').click();

    // Click Submit
    cy.get('button[type="submit"]').contains('Submit Issue').click();

    // Verify submission network call was made
    cy.wait('@createIssue').then((interception) => {
      expect(interception.request.body).to.deep.equal({
        tenant_id: tenantUuid,
        description: 'Water leak in penguin enclosure',
        extra_data: {
          Zone: 'Zone A',
          'Cage Number': 3,
          Urgent: true,
          Category: 'Maintenance'
        }
      });
    });

    // Verify success snackbar alert appears
    cy.contains('Issue submitted successfully!').should('be.visible');
  });
});

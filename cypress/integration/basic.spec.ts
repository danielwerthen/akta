/// <reference types="cypress" />

describe('Smoke Test', () => {
  it('should render', () => {
    cy.visit('http://localhost:8080/basic');

    cy.get('h1').contains('This will outline the basic options for akta');
  });
});

describe('UI Smoke Test', () => {
  it('should render the homepage and find the main heading', () => {
    cy.visit('/')
    cy.contains('Create Next App').should('exist')
  })
}) 
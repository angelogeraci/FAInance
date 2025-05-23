describe('UI shadcn/ui Smoke Test', () => {
  it('should render the homepage and find the card and button', () => {
    cy.visit('/')
    cy.contains('Bienvenue sur la nouvelle UI shadcn/ui').should('exist')
    cy.contains('Ouvrir le dialogue').click()
    cy.contains('Bravo, tu utilises maintenant une UI moderne, flexible et design').should('exist')
  })
}) 
import React from 'react'
import StatusBadge from '../StatusBadge'

describe('<StatusBadge />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<StatusBadge />)
  })
})

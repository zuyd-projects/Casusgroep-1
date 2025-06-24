import React from 'react'
import OrderStatusManager from './OrderStatusManager'

describe('<OrderStatusManager />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<OrderStatusManager />)
  })
})
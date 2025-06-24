import React from 'react'
import SimulationStatus from '../SimulationStatus'

describe('<SimulationStatus />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<SimulationStatus />)
  })
})
import React from 'react'
import PlannerWarnings from '../PlannerWarnings'

const mockNoWarnings = {
  totalOngoingOrders: 10,
  delayedOrders: 0,
  atRiskOrders: 0,
  averageDeliveryTime: 2.5,
  warnings: []
};

const mockWarnings = {
  totalOngoingOrders: 12,
  delayedOrders: 2,
  atRiskOrders: 3,
  averageDeliveryTime: 3.2,
  warnings: [
    {
      severity: 'High',
      caseId: 'A123',
      orderAge: 5.1,
      type: 'Late Delivery',
      message: 'Order is significantly delayed.',
      lastActivity: '2025-06-22',
      expectedDelivery: 2.0,
      recommendedAction: 'Contact supplier'
    },
    {
      severity: 'Medium',
      caseId: 'B456',
      orderAge: 3.0,
      type: 'Potential Delay',
      message: 'Order may be delayed.',
      lastActivity: '2025-06-21',
      expectedDelivery: 2.5,
      recommendedAction: 'Monitor closely'
    }
  ]
};

describe('<PlannerWarnings />', () => {
  beforeEach(() => {
    // Stub the api.get method before each test
    cy.stub(require('@CASUSGROEP1/utils/api'), 'api').value({
      get: cy.stub()
    });
  });

  it('shows loading skeleton initially', () => {
    // Don't resolve the promise to simulate loading
    require('@CASUSGROEP1/utils/api').api.get.returns(new Promise(() => {}));
    cy.mount(<PlannerWarnings />);
    cy.get('.animate-pulse').should('exist');
  });

  it('shows "All deliveries on track" when there are no warnings (default)', () => {
    require('@CASUSGROEP1/utils/api').api.get.resolves(mockNoWarnings);
    cy.mount(<PlannerWarnings />);
    cy.contains('All deliveries on track').should('be.visible');
    cy.contains('No delivery delays detected').should('be.visible');
  });

  it('shows "All deliveries on track" in compact mode when there are no warnings', () => {
    require('@CASUSGROEP1/utils/api').api.get.resolves(mockNoWarnings);
    cy.mount(<PlannerWarnings compact />);
    cy.contains('All deliveries on track').should('be.visible');
  });

  it('renders warnings and stats when there are warnings', () => {
    require('@CASUSGROEP1/utils/api').api.get.resolves(mockWarnings);
    cy.mount(<PlannerWarnings />);
    cy.contains('Ongoing Orders').should('be.visible');
    cy.contains('Delayed Orders').should('be.visible');
    cy.contains('At Risk Orders').should('be.visible');
    cy.contains('Avg Delivery (days)').should('be.visible');
    cy.contains('Active Delivery Warnings').should('be.visible');
    cy.contains('Late Delivery').should('be.visible');
    cy.contains('Potential Delay').should('be.visible');
    cy.contains('High').should('be.visible');
    cy.contains('Medium').should('be.visible');
    cy.contains('Contact supplier').should('be.visible');
    cy.contains('Monitor closely').should('be.visible');
  });

  it('renders compact warnings view', () => {
    require('@CASUSGROEP1/utils/api').api.get.resolves(mockWarnings);
    cy.mount(<PlannerWarnings compact />);
    cy.contains('Delivery Warnings').should('be.visible');
    cy.contains('2 delayed, 3 at risk').should('be.visible');
    cy.contains('Order A123').should('be.visible');
    cy.contains('Levertijd wordt later').should('be.visible');
  });
})
 

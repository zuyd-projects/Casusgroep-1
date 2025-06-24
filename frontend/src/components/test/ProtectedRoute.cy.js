import React from 'react';
import ProtectedRoute from '../ProtectedRoute';

describe('<ProtectedRoute />', () => {
  it('redirects to /login when no token is present', () => {
    // Cypress stub for tokenService
    const tokenServiceMock = {
      getToken: cy.stub().returns(null)
    };

    // Cypress stub for useRouter
    const pushStub = cy.stub();
    const routerMock = () => ({ push: pushStub });

    cy.mount(
      <ProtectedRoute tokenService={tokenServiceMock} useRouter={routerMock}>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );

    cy.contains('Loading...').should('be.visible');
    cy.wrap(pushStub).should('have.been.calledWith', '/login');
    cy.get('[data-testid="protected-content"]').should('not.exist');
  });

  it('renders children when token is present', () => {
    const tokenServiceMock = {
      getToken: cy.stub().returns('valid-token')
    };

    const pushStub = cy.stub();
    const routerMock = () => ({ push: pushStub });

    cy.mount(
      <ProtectedRoute tokenService={tokenServiceMock} useRouter={routerMock}>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );

    cy.contains('Loading...').should('be.visible');
    cy.get('[data-testid="protected-content"]').should('be.visible');
    cy.wrap(pushStub).should('not.have.been.called');
  });
});

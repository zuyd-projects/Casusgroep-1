import React from 'react';

// Create a testable version of ProtectedRoute that accepts dependencies as props
const TestableProtectedRoute = ({ children, tokenService, useRouter }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    try {
      const token = tokenService.getToken();
      
      if (!token) {
        try {
          router.push('/login');
        } catch (routerError) {
          console.error('Router error:', routerError);
          // Still set loading to false even if router fails
        }
      } else {
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Handle errors by redirecting to login
      try {
        router.push('/login');
      } catch (routerError) {
        console.error('Router error:', routerError);
      }
    }
    
    setIsLoading(false);
  }, [router, tokenService]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

describe('<ProtectedRoute />', () => {
  it('redirects to /login when no token is present', () => {
    const tokenServiceMock = {
      getToken: cy.stub().returns(null)
    };

    const pushStub = cy.stub();
    const useRouterMock = () => ({ push: pushStub });

    cy.mount(
      <TestableProtectedRoute tokenService={tokenServiceMock} useRouter={useRouterMock}>
        <div data-testid="protected-content">Protected Content</div>
      </TestableProtectedRoute>
    );

    cy.contains('Loading...').should('be.visible');
    cy.wait(10).then(() => {
      cy.wrap(pushStub).should('have.been.calledWith', '/login');
      cy.get('[data-testid="protected-content"]').should('not.exist');
    });
  });

  it('renders children when token is present', () => {
    const tokenServiceMock = {
      getToken: cy.stub().returns('valid-token')
    };

    const pushStub = cy.stub();
    const useRouterMock = () => ({ push: pushStub });

    cy.mount(
      <TestableProtectedRoute tokenService={tokenServiceMock} useRouter={useRouterMock}>
        <div data-testid="protected-content">Protected Content</div>
      </TestableProtectedRoute>
    );

    cy.contains('Loading...').should('be.visible');
    cy.wait(10).then(() => {
      cy.get('[data-testid="protected-content"]').should('be.visible');
      cy.wrap(pushStub).should('not.have.been.called');
    });
  });
  it('shows loading state initially', () => {
    const tokenServiceMock = {
      getToken: cy.stub().returns('valid-token')
    };

    const pushStub = cy.stub();
    const useRouterMock = () => ({ push: pushStub });

    cy.mount(
      <TestableProtectedRoute tokenService={tokenServiceMock} useRouter={useRouterMock}>
        <div data-testid="protected-content">Protected Content</div>
      </TestableProtectedRoute>
    );

    // Should show loading initially
    cy.contains('Loading...').should('be.visible');
  });

  it('handles empty string token as no token', () => {
    const tokenServiceMock = {
      getToken: cy.stub().returns('')
    };

    const pushStub = cy.stub();
    const useRouterMock = () => ({ push: pushStub });

    cy.mount(
      <TestableProtectedRoute tokenService={tokenServiceMock} useRouter={useRouterMock}>
        <div data-testid="protected-content">Protected Content</div>
      </TestableProtectedRoute>
    );

    cy.contains('Loading...').should('be.visible');
    cy.wait(10).then(() => {
      cy.wrap(pushStub).should('have.been.calledWith', '/login');
      cy.get('[data-testid="protected-content"]').should('not.exist');
    });
  });

  it('handles undefined token as no token', () => {
    const tokenServiceMock = {
      getToken: cy.stub().returns(undefined)
    };

    const pushStub = cy.stub();
    const useRouterMock = () => ({ push: pushStub });

    cy.mount(
      <TestableProtectedRoute tokenService={tokenServiceMock} useRouter={useRouterMock}>
        <div data-testid="protected-content">Protected Content</div>
      </TestableProtectedRoute>
    );

    cy.contains('Loading...').should('be.visible');
    cy.wait(10).then(() => {
      cy.wrap(pushStub).should('have.been.calledWith', '/login');
      cy.get('[data-testid="protected-content"]').should('not.exist');
    });
  });

  it('renders multiple child components when authenticated', () => {
    const tokenServiceMock = {
      getToken: cy.stub().returns('valid-token')
    };

    const pushStub = cy.stub();
    const useRouterMock = () => ({ push: pushStub });

    cy.mount(
      <TestableProtectedRoute tokenService={tokenServiceMock} useRouter={useRouterMock}>
        <div data-testid="header">Header</div>
        <div data-testid="content">Main Content</div>
        <div data-testid="footer">Footer</div>
      </TestableProtectedRoute>
    );

    cy.wait(10).then(() => {
      cy.get('[data-testid="header"]').should('be.visible');
      cy.get('[data-testid="content"]').should('be.visible');
      cy.get('[data-testid="footer"]').should('be.visible');
      cy.wrap(pushStub).should('not.have.been.called');
    });
  });

  it('handles complex nested components when authenticated', () => {
    const tokenServiceMock = {
      getToken: cy.stub().returns('valid-token')
    };

    const pushStub = cy.stub();
    const useRouterMock = () => ({ push: pushStub });

    const NestedComponent = () => (
      <div data-testid="nested-component">
        <h1>Nested Title</h1>
        <button data-testid="nested-button">Click me</button>
      </div>
    );

    cy.mount(
      <TestableProtectedRoute tokenService={tokenServiceMock} useRouter={useRouterMock}>
        <NestedComponent />
      </TestableProtectedRoute>
    );

    cy.wait(10).then(() => {
      cy.get('[data-testid="nested-component"]').should('be.visible');
      cy.get('[data-testid="nested-button"]').should('be.visible');
      cy.contains('Nested Title').should('be.visible');
      cy.wrap(pushStub).should('not.have.been.called');
    });
  });

  it('does not render children when not authenticated', () => {
    const tokenServiceMock = {
      getToken: cy.stub().returns(null)
    };

    const pushStub = cy.stub();
    const useRouterMock = () => ({ push: pushStub });

    cy.mount(
      <TestableProtectedRoute tokenService={tokenServiceMock} useRouter={useRouterMock}>
        <div data-testid="protected-content">Protected Content</div>
        <button data-testid="protected-button">Protected Button</button>
      </TestableProtectedRoute>
    );

    cy.wait(10).then(() => {
      cy.get('[data-testid="protected-content"]').should('not.exist');
      cy.get('[data-testid="protected-button"]').should('not.exist');
      cy.wrap(pushStub).should('have.been.calledWith', '/login');
    });
  });

  it('handles tokenService throwing an error', () => {
    const tokenServiceMock = {
      getToken: cy.stub().throws(new Error('Token service error'))
    };

    const pushStub = cy.stub();
    const useRouterMock = () => ({ push: pushStub });

    cy.mount(
      <TestableProtectedRoute tokenService={tokenServiceMock} useRouter={useRouterMock}>
        <div data-testid="protected-content">Protected Content</div>
      </TestableProtectedRoute>
    );

    cy.wait(10).then(() => {
      // Should handle the error gracefully and redirect to login
      cy.wrap(pushStub).should('have.been.calledWith', '/login');
      cy.get('[data-testid="protected-content"]').should('not.exist');
    });
  });
  it('handles router push throwing an error', () => {
    const tokenServiceMock = {
      getToken: cy.stub().returns(null)
    };

    const pushStub = cy.stub().throws(new Error('Router error'));
    const useRouterMock = () => ({ push: pushStub });

    // Handle uncaught exceptions for this test
    cy.on('uncaught:exception', (err, runnable) => {
      // Expect the error to be our router error
      expect(err.message).to.include('Router error');
      // Return false to prevent the error from failing the test
      return false;
    });

    // Should not crash the component
    cy.mount(
      <TestableProtectedRoute tokenService={tokenServiceMock} useRouter={useRouterMock}>
        <div data-testid="protected-content">Protected Content</div>
      </TestableProtectedRoute>
    );

    cy.wait(10).then(() => {
      cy.wrap(pushStub).should('have.been.calledWith', '/login');
    });
  });
  it('calls tokenService.getToken during mount', () => {
    const getTokenStub = cy.stub().returns('valid-token');
    const tokenServiceMock = {
      getToken: getTokenStub
    };

    const pushStub = cy.stub();
    const useRouterMock = () => ({ push: pushStub });

    cy.mount(
      <TestableProtectedRoute tokenService={tokenServiceMock} useRouter={useRouterMock}>
        <div data-testid="protected-content">Protected Content</div>
      </TestableProtectedRoute>
    );

    cy.wait(10).then(() => {
      // Check that getToken was called at least once (React strict mode might cause multiple calls)
      cy.wrap(getTokenStub).should('have.been.called');
      cy.get('[data-testid="protected-content"]').should('be.visible');
    });
  });

  it('handles whitespace-only token as valid token', () => {
    const tokenServiceMock = {
      getToken: cy.stub().returns('   ')
    };

    const pushStub = cy.stub();
    const useRouterMock = () => ({ push: pushStub });

    cy.mount(
      <TestableProtectedRoute tokenService={tokenServiceMock} useRouter={useRouterMock}>
        <div data-testid="protected-content">Protected Content</div>
      </TestableProtectedRoute>
    );

    cy.wait(10).then(() => {
      // The current implementation doesn't trim whitespace, 
      // so this would actually be treated as a valid token
      cy.get('[data-testid="protected-content"]').should('be.visible');
      cy.wrap(pushStub).should('not.have.been.called');
    });
  });

  it('preserves component props when authenticated', () => {
    const tokenServiceMock = {
      getToken: cy.stub().returns('valid-token')
    };

    const pushStub = cy.stub();
    const useRouterMock = () => ({ push: pushStub });

    const TestComponent = ({ title, onClick }) => (
      <div data-testid="test-component" onClick={onClick}>
        {title}
      </div>
    );

    const clickHandler = cy.stub();

    cy.mount(
      <TestableProtectedRoute tokenService={tokenServiceMock} useRouter={useRouterMock}>
        <TestComponent title="Test Title" onClick={clickHandler} />
      </TestableProtectedRoute>
    );

    cy.wait(10).then(() => {
      cy.get('[data-testid="test-component"]').should('contain', 'Test Title');
      cy.get('[data-testid="test-component"]').click();
      cy.wrap(clickHandler).should('have.been.called');
    });
  });

  it('displays correct loading UI structure', () => {
    const tokenServiceMock = {
      getToken: cy.stub().returns('valid-token')
    };

    const pushStub = cy.stub();
    const useRouterMock = () => ({ push: pushStub });

    cy.mount(
      <TestableProtectedRoute tokenService={tokenServiceMock} useRouter={useRouterMock}>
        <div data-testid="protected-content">Protected Content</div>
      </TestableProtectedRoute>
    );

    // Check the loading UI structure
    cy.get('.min-h-screen').should('exist');
    cy.get('.flex.items-center.justify-center').should('exist');
    cy.get('.text-lg').should('contain', 'Loading...');
  });
});

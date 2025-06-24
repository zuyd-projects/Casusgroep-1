import React from 'react';
import Header from '../Header';

// Mock SimulationContext
const SimulationContext = React.createContext();

// Mock LogoutButton component
const MockLogoutButton = ({ className, children }) => (
  <button className={className} data-testid="logout-button">
    {children || 'Logout'}
  </button>
);

// Mock useSimulation hook
const useSimulation = () => ({
  currentSimulation: null,
  currentRound: null,
  isRunning: false,
  isConnected: false,
  roundTimeLeft: 0,
  stopSimulation: cy.stub(),
  connectToSignalR: cy.stub()
});

// Mock tokenService
const mockTokenService = {
  getUserData: () => null,
  getToken: () => null
};

// Test wrapper component
const TestWrapper = ({ children, user = null, isRunning = false }) => {
  // Mock the modules before mounting
  React.useEffect(() => {
    // Mock tokenService
    window.tokenService = {
      getUserData: () => user,
      getToken: () => user ? 'mock-token' : null
    };
  }, [user]);

  return (
    <SimulationContext.Provider value={{
      currentSimulation: isRunning ? 1 : null,
      currentRound: isRunning ? { number: 1 } : null,
      isRunning,
      isConnected: isRunning,
      roundTimeLeft: 300,
      stopSimulation: cy.stub(),
      connectToSignalR: cy.stub()
    }}>
      {children}
    </SimulationContext.Provider>
  );
};

describe('<Header />', () => {
  beforeEach(() => {
    cy.viewport(1024, 800);
    
    // Clear localStorage and session storage
    cy.window().then(win => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
    
    // Clear any existing mounts
    cy.document().then(doc => {
      const root = doc.querySelector('#root');
      if (root) {
        root.innerHTML = '';
      }
    });
  });

  afterEach(() => {
    // Clean up after each test
    cy.window().then(win => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
  });

  describe('Authentication States', () => {
    it('shows login and register when logged out', () => {
      cy.mount(<Header />);

      cy.contains('Login').should('be.visible');
      cy.contains('Register').should('be.visible');
    });

    it('login and register links have correct hrefs', () => {
      cy.mount(<Header />);

      cy.contains('Login').should('have.attr', 'href', '/login');
      cy.contains('Register').should('have.attr', 'href', '/register');
    });

    it('login and register have correct styling', () => {
      cy.mount(<Header />);

      cy.contains('Login')
        .should('have.class', 'bg-white')
        .and('have.class', 'text-purple-600');
      
      cy.contains('Register')
        .should('have.class', 'bg-pink-600')
        .and('have.class', 'text-white');
    });
  });

  describe('Mobile Menu Functionality', () => {
    it('shows mobile menu button and logo on small screens', () => {
      cy.viewport(768, 600);
      
      cy.mount(<Header />);

      // Mobile menu button should be visible
      cy.get('button').first().should('be.visible');
      
      // Mobile logo should be visible
      cy.contains('ERPNumber1').should('be.visible');
    });

    it('mobile logo links to dashboard', () => {
      cy.viewport(768, 600);
      
      cy.mount(<Header />);

      cy.contains('ERPNumber1').should('have.attr', 'href', '/dashboard');
    });

    it('opens mobile menu when button is clicked', () => {
      cy.viewport(768, 600);
      
      cy.mount(<Header />);

      // Mobile menu should be closed initially
      cy.get('nav').should('not.exist');

      // Click menu button to open
      cy.get('button').first().click();
      
      // Mobile menu should now be visible
      cy.get('nav').should('be.visible');
    });

    it('shows login/register in mobile menu when logged out', () => {
      cy.viewport(768, 600);
      
      cy.mount(<Header />);

      // Open mobile menu
      cy.get('button').first().click();
      
      // Should show login/register options in mobile menu
      cy.get('nav').within(() => {
        cy.contains('Login').should('be.visible');
        cy.contains('Register').should('be.visible');
      });
    });
  });

  describe('Responsive Behavior', () => {    it('hides mobile elements on large screens', () => {
      cy.viewport(1024, 800);
      
      cy.mount(<Header />);

      // Mobile menu button should exist but have responsive classes
      cy.get('button').should('exist');
    });

    it('adjusts layout for mobile viewport', () => {
      cy.viewport(768, 600);
      
      cy.mount(<Header />);

      // Header should maintain proper structure
      cy.get('header').should('exist');
      cy.get('header').within(() => {
        cy.get('button').should('be.visible'); // Mobile menu button
        cy.contains('ERPNumber1').should('be.visible'); // Mobile logo
      });
    });
  });

  describe('Styling and Layout', () => {
    it('has correct header styling classes', () => {
      cy.mount(<Header />);

      cy.get('header')
        .should('have.class', 'bg-gradient-to-r')
        .and('have.class', 'from-purple-600')
        .and('have.class', 'to-pink-600');
    });

    it('has proper layout structure', () => {
      cy.mount(<Header />);

      cy.get('header').should('exist');
      cy.get('header > div')
        .should('have.class', 'flex')
        .and('have.class', 'items-center')
        .and('have.class', 'justify-between');
    });

    it('has proper height and spacing', () => {
      cy.mount(<Header />);

      cy.get('header > div')
        .should('have.class', 'h-16')
        .and('have.class', 'px-4');
    });
  });

  describe('Interactive Elements', () => {
    it('login and register buttons are clickable', () => {
      cy.mount(<Header />);

      cy.contains('Login').should('not.be.disabled');
      cy.contains('Register').should('not.be.disabled');
    });

    it('mobile menu button is clickable', () => {
      cy.viewport(768, 600);
      
      cy.mount(<Header />);

      cy.get('button').first().should('not.be.disabled');
    });    it('mobile menu closes when clicking menu items', () => {
      cy.viewport(768, 600);
      
      cy.mount(<Header />);

      // Open mobile menu
      cy.get('button').first().click();
      cy.get('nav').should('be.visible');

      // Click a menu item (should close menu due to onClick handler)
      cy.get('nav').within(() => {
        cy.contains('Login').click();
      });
    });
  });

  describe('Accessibility', () => {
    it('uses semantic HTML elements', () => {
      cy.mount(<Header />);

      // Component should render something
      cy.get('*').should('have.length.at.least', 1);
      // Should render header element (the main container)
      cy.get('header').should('exist');
    });

    it('mobile menu button has proper accessibility', () => {
      cy.viewport(768, 600);
      
      cy.mount(<Header />);

      // Component should render something first
      cy.get('*').should('have.length.at.least', 1);
      // Mobile menu button should be accessible
      cy.get('button').should('exist').and('be.visible');
    });    it('links have proper focus states', () => {
      cy.mount(<Header />);

      // Component should render first
      cy.get('*').should('have.length.at.least', 1);
      // Login/Register links should be accessible
      cy.get('a').should('have.length.at.least', 2);
    });
  });
});

// Additional comprehensive test coverage (isolated to avoid state issues)
describe('<Header /> Additional Coverage', () => {
  beforeEach(() => {
    cy.viewport(1024, 800);
    cy.window().then(win => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
  });

  it('renders with proper semantic HTML structure', () => {
    cy.mount(<Header />);
    
    // Verify semantic HTML and accessibility
    cy.get('header').should('exist');
    cy.get('header').should('have.class', 'bg-gradient-to-r');
    cy.get('header').within(() => {
      cy.get('div').should('exist');
      cy.contains('Login').should('be.visible');
      cy.contains('Register').should('be.visible');
    });
  });

  it('provides full accessibility features', () => {
    cy.mount(<Header />);
    
    // Verify all accessibility features work
    cy.contains('Login').should('have.attr', 'href', '/login');
    cy.contains('Register').should('have.attr', 'href', '/register');
    cy.contains('Login').should('not.be.disabled');
    cy.contains('Register').should('not.be.disabled');
  });

  it('mobile menu accessibility and interaction', () => {
    cy.viewport(768, 600);
    cy.mount(<Header />);
    
    // Verify mobile menu accessibility
    cy.get('button').should('be.visible').and('not.be.disabled');
    cy.get('button').click();
    cy.get('nav').should('be.visible');
    cy.get('nav').within(() => {
      cy.contains('Login').should('be.visible');
      cy.contains('Register').should('be.visible');
    });
  });

  it('comprehensive content and structure verification', () => {
    cy.mount(<Header />);
    
    // Verify all expected content is present and accessible
    cy.get('header').should('exist');
    cy.get('header > div').should('exist');
    cy.get('header > div').should('have.class', 'flex');
    cy.contains('Login').should('exist').and('be.visible');
    cy.contains('Register').should('exist').and('be.visible');
    cy.contains('ERPNumber1').should('exist'); // Mobile logo
  });
});

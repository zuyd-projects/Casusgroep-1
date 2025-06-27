import React from 'react';
import Header from '../Header';

describe('Header Component', () => {
  beforeEach(() => {
    // Clear any stored auth data before each test
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      cy.viewport(1024, 768);
      cy.mount(<Header />);
      cy.get('header').should('exist');
    });

    it('should have proper header structure', () => {
      cy.viewport(1024, 768);
      cy.mount(<Header />);
      cy.get('header').should('have.class', 'w-full');
      cy.get('header').should('have.class', 'bg-gradient-to-r');
      cy.get('header > div').should('have.class', 'flex');
      cy.get('header > div').should('have.class', 'items-center');
      cy.get('header > div').should('have.class', 'justify-between');
      cy.get('header > div').should('have.class', 'h-16');
    });

    it('should have correct gradient background', () => {
      cy.viewport(1024, 768);
      cy.mount(<Header />);
      cy.get('header').should('have.class', 'from-purple-600');
      cy.get('header').should('have.class', 'to-pink-600');
    });
  });

  describe('Unauthenticated State', () => {
    it('should show login and register buttons when not authenticated', () => {
      cy.viewport(1024, 768);
      cy.mount(<Header />);
      cy.contains('Login').should('be.visible');
      cy.contains('Register').should('be.visible');
    });

    it('should have correct styling for auth buttons', () => {
      cy.viewport(1024, 768);
      cy.mount(<Header />);
      cy.contains('Login').should('have.class', 'bg-white');
      cy.contains('Login').should('have.class', 'text-purple-600');
      cy.contains('Register').should('have.class', 'bg-pink-600');
      cy.contains('Register').should('have.class', 'text-white');
    });

    it('should have proper href attributes for auth links', () => {
      cy.viewport(1024, 768);
      cy.mount(<Header />);
      cy.contains('Login').should('have.attr', 'href', '/login');
      cy.contains('Register').should('have.attr', 'href', '/register');
    });

    it('should have hover effects on auth buttons', () => {
      cy.viewport(1024, 768);
      cy.mount(<Header />);
      cy.contains('Login').should('have.class', 'hover:bg-gray-100');
      cy.contains('Register').should('have.class', 'hover:bg-pink-700');
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should show mobile menu button on small screens', () => {
      cy.viewport(768, 600);
      cy.mount(<Header />);
      
      // Mobile menu button should be visible
      cy.get('button').should('exist');
      cy.get('button svg').should('exist'); // Hamburger icon
    });

    it('should show ERPNumber1 brand on mobile', () => {
      cy.viewport(768, 600);
      cy.mount(<Header />);
      
      cy.contains('ERPNumber1').should('be.visible');
      cy.contains('ERPNumber1').should('have.class', 'lg:hidden');
    });

    it('should handle mobile menu interaction', () => {
      cy.viewport(768, 600);
      cy.mount(<Header />);
      
      // Initially no nav should be visible
      cy.get('nav').should('not.exist');
      
      // Click mobile menu button
      cy.get('button').first().click();
      
      // Nav should now be visible
      cy.get('nav').should('be.visible');
    });

    it('should show login/register in mobile menu when unauthenticated', () => {
      cy.viewport(768, 600);
      cy.mount(<Header />);
      
      // Open mobile menu
      cy.get('button').first().click();
      
      // Should show login/register in mobile menu
      cy.get('nav').within(() => {
        cy.contains('Login').should('be.visible');
        cy.contains('Register').should('be.visible');
      });
    });

    it('should close mobile menu when clicking menu items', () => {
      cy.viewport(768, 600);
      cy.mount(<Header />);
      
      // Open mobile menu
      cy.get('button').first().click();
      cy.get('nav').should('be.visible');
      
      // Click a menu item
      cy.get('nav').within(() => {
        cy.contains('Login').click();
      });
      
      // Menu should close (nav should not exist)
      cy.get('nav').should('not.exist');
    });
  });
  describe('Authenticated User State', () => {
    beforeEach(() => {
      // Mock user data in localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'mock-jwt-token');
        win.localStorage.setItem('userData', JSON.stringify({
          name: 'John Doe',
          role: 'admin',
          email: 'john@example.com'
        }));
      });
    });

    it('should not show login/register buttons when authenticated', () => {
      cy.viewport(1024, 768);
      cy.mount(<Header />);
      
      cy.contains('Login').should('not.exist');
      cy.contains('Register').should('not.exist');
    });
  });

});

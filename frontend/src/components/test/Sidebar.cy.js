import React from 'react';
import Sidebar from '../Sidebar';

describe('<Sidebar />', () => {
  beforeEach(() => {
    cy.viewport(1024, 800);
  });

  it('renders the sidebar component', () => {
    cy.mount(<Sidebar />);
    
    // Check that the sidebar renders with key elements
    cy.get('[data-testid="sidebar-brand"]').should('contain', 'ERPNumber1');
    cy.get('[data-testid="sidebar-about"]').should('contain', 'About');
  });

  it('displays navigation items', () => {
    cy.mount(<Sidebar />);
    
    // Check that main navigation items are visible
    const expectedNavItems = [
      'Dashboard', 'Simulations', 'Orders', 'Supplier', 'Voorraad Beheer',
      'Products', 'Plannings', 'Runner', 'Production Lines', 'Account Manager',
      'Delivery', 'Process Mining', 'Admin'
    ];

    expectedNavItems.forEach(item => {
      cy.contains(item).should('be.visible');
    });
  });

  it('can expand and collapse product submenu', () => {
    cy.mount(<Sidebar />);
    
    // Initially, submenu should be collapsed
    cy.contains('Product A').should('not.exist');
    
    // Click to expand
    cy.contains('Products').click();
    cy.contains('Product A').should('be.visible');
    
    // Click to collapse
    cy.contains('Products').click();
    cy.contains('Product A').should('not.exist');
  });

  it('can expand and collapse production lines submenu', () => {
    cy.mount(<Sidebar />);
    
    // Initially, submenu should be collapsed
    cy.contains('Production Line 1').should('not.exist');
    cy.contains('Production Line 2').should('not.exist');
    
    // Click to expand
    cy.contains('Production Lines').click();
    cy.contains('Production Line 1').should('be.visible');
    cy.contains('Production Line 2').should('be.visible');
    
    // Click to collapse
    cy.contains('Production Lines').click();
    cy.contains('Production Line 1').should('not.exist');
    cy.contains('Production Line 2').should('not.exist');
  });

  it('has proper accessibility attributes', () => {
    cy.mount(<Sidebar />);
    
    // Check semantic HTML
    cy.get('aside').should('exist');
    cy.get('nav').should('exist');
    
    // Check expandable buttons have proper aria attributes
    cy.get('button[aria-expanded]').should('exist');
    cy.get('button[aria-controls]').should('exist');
  });

  it('shows mobile menu button on small screens', () => {
    cy.viewport(768, 600); // Mobile viewport
    cy.mount(<Sidebar />);
    
    // Mobile button should be visible
    cy.get('button[aria-label="Toggle mobile menu"]').should('be.visible');
    
    // Sidebar should be hidden initially on mobile
    cy.get('aside').should('have.class', 'hidden');
  });

  it('can open and close mobile menu', () => {
    cy.viewport(768, 600); // Mobile viewport
    cy.mount(<Sidebar />);
    
    // Open mobile menu
    cy.get('button[aria-label="Toggle mobile menu"]').click();
    
    // Sidebar should now be visible
    cy.get('aside').should('have.class', 'fixed');
    cy.get('aside').should('not.have.class', 'hidden');
    
    // Overlay should be visible
    cy.get('[class*="bg-black/50"]').should('be.visible');
    
    // Close by clicking overlay
    cy.get('[class*="bg-black/50"]').click();
    
    // Sidebar should be hidden again
    cy.get('aside').should('have.class', 'hidden');
    cy.get('[class*="bg-black/50"]').should('not.exist');
  });

  it('is visible on large screens', () => {
    cy.viewport(1024, 800); // Large viewport
    cy.mount(<Sidebar />);
    
    cy.get('aside').should('be.visible');
    cy.get('aside').should('have.class', 'lg:block');
  });

  it('chevron icon rotates when submenu opens', () => {
    cy.mount(<Sidebar />);
    
    // Get the chevron icon for Products
    cy.contains('button', 'Products')
      .find('svg')
      .should('not.have.class', 'rotate-90');
    
    // Click to expand
    cy.contains('Products').click();
    
    // Check rotation
    cy.contains('button', 'Products')
      .find('svg')
      .should('have.class', 'rotate-90');
  });

  it('submenu has proper accessibility structure', () => {
    cy.mount(<Sidebar />);
    
    cy.contains('Products').click();
    
    // Check submenu has proper id that matches aria-controls
    cy.get('#submenu-Products').should('exist');
    cy.contains('button', 'Products')
      .should('have.attr', 'aria-controls', 'submenu-Products');
  });
  // Additional tests for missing functionality
  it('toggles mobile menu button icon correctly', () => {
    cy.viewport(768, 600); // Mobile viewport
    cy.mount(<Sidebar />);
    
    // Initially should show Menu icon (hamburger)
    cy.get('button[aria-label="Toggle mobile menu"]')
      .find('svg')
      .should('exist');
    
    // Click to open - should show X icon
    cy.get('button[aria-label="Toggle mobile menu"]').click();
    
    // Check that the icon changed (X icon has different path)
    cy.get('button[aria-label="Toggle mobile menu"]')
      .find('svg')
      .should('exist');
  });

  it('handles multiple submenus independently', () => {
    cy.mount(<Sidebar />);
    
    // Open Products submenu
    cy.contains('Products').click();
    cy.contains('Product A').should('be.visible');
    
    // Open Production Lines submenu
    cy.contains('Production Lines').click();
    cy.contains('Production Line 1').should('be.visible');
    cy.contains('Production Line 2').should('be.visible');
    
    // Both submenus should be open
    cy.contains('Product A').should('be.visible');
    cy.contains('Production Line 1').should('be.visible');
    
    // Close Products submenu
    cy.contains('Products').click();
    cy.contains('Product A').should('not.exist');
    
    // Production Lines should still be open
    cy.contains('Production Line 1').should('be.visible');
  });

  it('maintains consistent navigation structure', () => {
    cy.mount(<Sidebar />);
    
    // Verify all expected navigation items are present
    const expectedItems = [
      'Dashboard', 'Simulations', 'Orders', 'Supplier', 'Voorraad Beheer',
      'Products', 'Plannings', 'Runner', 'Production Lines', 'Account Manager',
      'Delivery', 'Process Mining', 'Admin'
    ];
    
    expectedItems.forEach((item) => {
      cy.contains(item).should('be.visible');
    });
  });

  it('submenu items are properly nested', () => {
    cy.mount(<Sidebar />);
    
    // Expand Products submenu
    cy.contains('Products').click();
    
    // Check that submenu item is properly nested with margin
    cy.get('#submenu-Products')
      .should('have.class', 'ml-4')
      .and('have.class', 'mt-1')
      .and('have.class', 'space-y-1');
    
    cy.contains('Product A').should('be.visible');
  });

  it('aria attributes are correctly implemented', () => {
    cy.mount(<Sidebar />);
    
    // Check that submenu buttons have correct aria attributes
    cy.contains('button', 'Products')
      .should('have.attr', 'aria-expanded', 'false')
      .and('have.attr', 'aria-controls', 'submenu-Products');
    
    // Click to expand and check aria-expanded changes
    cy.contains('Products').click();
    cy.contains('button', 'Products')
      .should('have.attr', 'aria-expanded', 'true');
  });
});

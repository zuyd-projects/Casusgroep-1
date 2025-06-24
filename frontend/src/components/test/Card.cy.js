import React from 'react';
import Card from '../Card';
// Card is not being used in the application, delete tests if we delete card.
describe('<Card />', () => {
  describe('Basic Rendering', () => {
    it('renders children content', () => {
      cy.mount(<Card>Test Content</Card>);
      cy.contains('Test Content').should('be.visible');
    });    it('renders with default styling classes', () => {
      cy.mount(<Card>Content</Card>);
      cy.get('.bg-white')
        .should('have.class', 'dark:bg-zinc-900')
        .and('have.class', 'border')
        .and('have.class', 'border-zinc-200')
        .and('have.class', 'rounded-xl')
        .and('have.class', 'shadow-card');
    });

    it('applies custom className alongside default classes', () => {
      cy.mount(<Card className="custom-class">Content</Card>);
      cy.get('.custom-class')
        .should('have.class', 'bg-white')
        .and('have.class', 'rounded-xl');
    });
  });

  describe('Title Functionality', () => {
    it('renders the title when provided', () => {
      cy.mount(<Card title="My Title">Content</Card>);
      cy.contains('My Title').should('be.visible');
      cy.get('h3').should('contain', 'My Title');
    });

    it('does not render title section when title is not provided', () => {
      cy.mount(<Card>Content</Card>);
      cy.get('h3').should('not.exist');
    });

    it('renders title with proper styling classes', () => {
      cy.mount(<Card title="Styled Title">Content</Card>);
      cy.get('h3')
        .should('have.class', 'text-lg')
        .and('have.class', 'font-medium')
        .and('have.class', 'text-zinc-800')
        .and('have.class', 'dark:text-zinc-100');
    });

    it('renders title container with proper border styling', () => {
      cy.mount(<Card title="Border Test">Content</Card>);
      cy.get('h3')
        .parent()
        .should('have.class', 'px-5')
        .and('have.class', 'py-4')
        .and('have.class', 'border-b')
        .and('have.class', 'border-zinc-200')
        .and('have.class', 'dark:border-zinc-800');
    });

    it('handles empty string title', () => {
      cy.mount(<Card title="">Content</Card>);
      cy.get('h3').should('not.exist');
    });
  });
  describe('Padding Functionality', () => {
    it('applies padding by default', () => {
      cy.mount(<Card>Content</Card>);
      cy.get('.p-5').should('exist');
    });

    it('does not apply padding when padded is false', () => {
      cy.mount(<Card padded={false}>Content</Card>);
      cy.get('.p-5').should('not.exist');
    });

    it('applies padding when padded is explicitly true', () => {
      cy.mount(<Card padded={true}>Content</Card>);
      cy.get('.p-5').should('exist');
    });
  });

  describe('Combined Props', () => {
    it('works with all props combined', () => {
      cy.mount(
        <Card 
          title="Complete Card" 
          className="test-class" 
          padded={true}
        >
          Full featured content
        </Card>
      );
      
      // Check title
      cy.contains('Complete Card').should('be.visible');
      
      // Check custom class
      cy.get('.test-class').should('exist');
        // Check padding
      cy.get('.p-5').should('exist');
      
      // Check content
      cy.contains('Full featured content').should('be.visible');
    });

    it('works with title and no padding', () => {
      cy.mount(
        <Card title="No Padding Card" padded={false}>
          Unpadded content
        </Card>
      );
        cy.contains('No Padding Card').should('be.visible');
      cy.get('.p-5').should('not.exist');
    });
  });

  describe('Content Types', () => {
    it('renders complex JSX children', () => {
      cy.mount(
        <Card title="Complex Content">
          <div>
            <p>Paragraph content</p>
            <button>Click me</button>
          </div>
        </Card>
      );
      
      cy.contains('Paragraph content').should('be.visible');
      cy.get('button').should('contain', 'Click me');
    });

    it('renders multiple child elements', () => {
      cy.mount(
        <Card>
          <h4>Sub heading</h4>
          <p>Some text</p>
          <span>A span element</span>
        </Card>
      );
      
      cy.get('h4').should('contain', 'Sub heading');
      cy.get('p').should('contain', 'Some text');
      cy.get('span').should('contain', 'A span element');
    });
  });

  describe('Accessibility', () => {
    it('maintains semantic structure with title', () => {
      cy.mount(<Card title="Accessible Title">Content</Card>);
      
      // Title should be in an h3 element
      cy.get('h3').should('exist').and('contain', 'Accessible Title');
    });    it('has proper color contrast classes for text', () => {
      cy.mount(<Card title="Color Test">Content text</Card>);
      
      // Check that text color classes are applied to the main card
      cy.get('.text-gray-900')
        .should('have.class', 'dark:text-gray-100');
    });
  });
});

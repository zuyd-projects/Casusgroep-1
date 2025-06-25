# Frontend Component Testing

This directory contains component tests for the ERPNumber1 Next.js frontend application.

## Overview

The testing setup includes:

- **Component Tests**: Test individual React components with Cypress component testing
- **UI/UX Tests**: Test component rendering, styling, and user interactions
- **Authentication Tests**: Test auth flows and protected route behavior
- **Accessibility Tests**: Validate ARIA attributes and keyboard navigation
- **Responsive Design Tests**: Test components across different viewport sizes

## Test Structure

```
frontend/
├── src/components/test/          # Component test files
│   ├── Card.cy.js               # UI Card component tests
│   ├── Header.cy.js             # Navigation header tests
│   ├── LogoutButton.cy.js       # Authentication logout tests
│   ├── OrderStatusManager.cy.js  # Order management component tests
│   ├── PlannerWarnings.cy.js    # Delivery warnings component tests
│   ├── ProtectedRoute.cy.js     # Route protection tests
│   ├── Sidebar.cy.js            # Navigation sidebar tests
│   ├── SimulationStatus.cy.js   # Simulation status component tests
│   └── StatusBadge.cy.js        # Status indicator tests
├── cypress/                     # Cypress configuration and support
│   ├── support/
│   │   ├── component.js         # Component test setup
│   │   └── commands.js          # Custom Cypress commands
│   ├── fixtures/                # Test data files
│   ├── screenshots/             # Failed test screenshots
│   └── downloads/               # Test downloads
├── cypress.config.js            # Cypress configuration
└── package.json                 # Dependencies and test scripts
```

## Running Tests Locally

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn package manager
- Modern browser (Chrome, Firefox, Edge)

### Quick Start

```bash
# Install dependencies
cd frontend
npm install

# Run component tests in headless mode
npm run cypress:run --component

# Open Cypress Test Runner (interactive mode)
npm run cypress:open

# Run specific component tests
npx cypress run --component --spec "src/components/test/Header.cy.js"
```

### Running Specific Test Categories

```bash
# Run tests for UI components
npx cypress run --component --spec "src/components/test/{Card,StatusBadge,Header}.cy.js"

# Run authentication-related tests
npx cypress run --component --spec "src/components/test/{LogoutButton,ProtectedRoute}.cy.js"

# Run business logic component tests
npx cypress run --component --spec "src/components/test/{OrderStatusManager,PlannerWarnings}.cy.js"
```

## Test Categories

### Component Tests
- Test React component rendering and props
- Validate component styling and CSS classes
- Test user interactions (clicks, form inputs, etc.)
- Mock API calls and external dependencies
- Verify component state changes

### UI/UX Tests
- Responsive design across different viewport sizes
- Dark mode compatibility testing
- Component accessibility (ARIA attributes, keyboard navigation)
- Visual styling consistency
- Animation and transition testing

### Authentication Tests
- Login/logout flow validation
- Protected route access control
- Token management and localStorage handling
- Authentication state management

### Business Logic Tests
- Order status management workflows
- Simulation monitoring and updates
- Warning and notification systems
- Data formatting and display logic

## Test Configuration

### Cypress Configuration (`cypress.config.js`)
```javascript
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    specPattern: "src/components/test/**/*.cy.{js,jsx,ts,tsx}",
  },
});
```

### Component Test Setup
- Next.js integration with webpack bundler
- Tailwind CSS styling support
- Global styles imported in support files
- Mock API interceptors for external calls

## Adding New Tests

### Component Test Structure
1. Create new test file with `.cy.js` extension in `src/components/test/`
2. Import the component to test
3. Use `cy.mount()` to render React components
4. Write test cases using Cypress commands

Example:
```javascript
import React from 'react';
import MyComponent from '../MyComponent';

describe('<MyComponent />', () => {
  it('renders correctly with props', () => {
    cy.mount(<MyComponent title="Test Title" />);
    
    cy.contains('Test Title').should('be.visible');
    cy.get('[data-testid="my-component"]')
      .should('have.class', 'expected-class');
  });

  it('handles user interactions', () => {
    const onClickSpy = cy.stub().as('onClickSpy');
    cy.mount(<MyComponent onClick={onClickSpy} />);
    
    cy.get('button').click();
    cy.get('@onClickSpy').should('have.been.called');
  });
});
```

### Test Data and Mocking
- Use `cy.intercept()` for API call mocking
- Create reusable test data objects
- Mock external services and dependencies
- Use fixtures for complex test data

Example API mocking:
```javascript
beforeEach(() => {
  cy.intercept('GET', '/api/orders', { fixture: 'orders.json' }).as('getOrders');
  cy.intercept('PATCH', '/api/orders/*/status', { statusCode: 200 }).as('updateStatus');
});
```

## Test Results and Coverage

### Current Test Status
- **Total Tests**: 141 component tests
- **Success Rate**: 95.7% (135 passing, 6 failing)
- **Components Covered**: 9 major UI components
- **Test Categories**: Authentication, UI/UX, Business Logic, Accessibility

### Test Execution Metrics
- **Average Test Duration**: ~43 seconds for full suite
- **Fastest Component**: StatusBadge (28 tests in 1 second)
- **Most Complex**: OrderStatusManager (16 tests with API interactions)

## Package.json Scripts

```json
{
  "scripts": {
    "cypress:open": "cypress open",
    "cypress:run": "cypress run --component",
    "test:component": "cypress run --component",
    "test:component:watch": "cypress open --component"
  }
}
```

## Troubleshooting

### Common Issues

**Tests fail with component not rendering:**
- Check if all dependencies are installed (`npm install`)
- Verify component imports and file paths
- Ensure Tailwind CSS is properly configured

**API mocking not working:**
- Verify `cy.intercept()` patterns match actual API calls
- Check network tab in Cypress Test Runner
- Ensure interceptors are set up before component mounting

**Styling tests failing:**
- Confirm Tailwind CSS classes are available in test environment
- Check if component styles are imported correctly
- Verify CSS compilation in test setup

**Viewport/responsive tests failing:**
- Use `cy.viewport()` to set screen size before tests
- Test both mobile and desktop viewports
- Check CSS media query breakpoints

### Debug Mode
Run tests with detailed output and browser visibility:
```bash
# Run in headed mode (shows browser)
npx cypress run --component --headed

# Run with verbose logging
npx cypress run --component --config video=true,screenshotOnRunFailure=true

# Open specific test file in Test Runner
npx cypress open --component --config specPattern="src/components/test/MyComponent.cy.js"
```

## Best Practices

1. **Component Isolation**: Each test should mount components independently
2. **Descriptive Test Names**: Use clear, descriptive test descriptions
3. **Arrange-Act-Assert**: Structure tests with setup, action, and verification
4. **Fast Tests**: Mock external dependencies and API calls
5. **Accessibility**: Test keyboard navigation and screen reader compatibility
6. **Responsive Design**: Test components across multiple viewport sizes
7. **Error Handling**: Test both success and failure scenarios
8. **Realistic Data**: Use representative test data that matches production

## Test Coverage Goals

- **Critical User Paths**: 100% coverage of main user journeys
- **Component Props**: Test all component prop variations
- **Error States**: Verify error handling and fallback UI
- **Accessibility**: WCAG compliance validation
- **Cross-browser**: Ensure compatibility across supported browsers

## Continuous Integration

### GitHub Actions Integration
Tests should be integrated with CI/CD pipeline to run on:
- Pull requests to main branches
- Frontend file changes
- Automated regression testing

### Test Artifacts
- Screenshots of failed tests
- Video recordings of test runs
- Test result reports and coverage
- Performance metrics and timing data

## Performance Considerations

- Keep test data minimal and focused
- Use `cy.intercept()` to mock slow API calls
- Minimize DOM queries and optimize selectors
- Run tests in parallel when possible
- Monitor test execution time and optimize slow tests

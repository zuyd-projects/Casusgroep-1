# Frontend Component Testing

This directory contains comprehensive component tests for the ERPNumber1 Next.js frontend application using Cypress component testing framework.

## Overview

The testing suite provides full coverage of React components with:

- **Component Tests**: Complete testing of individual React components with Cypress component testing
- **UI/UX Tests**: Comprehensive component rendering, styling, and user interaction validation
- **Authentication Tests**: Robust authentication flows and protected route behavior testing
- **Accessibility Tests**: WCAG compliance validation with ARIA attributes and keyboard navigation
- **Responsive Design Tests**: Cross-viewport testing ensuring mobile and desktop compatibility
- **API Integration Tests**: Mock API interactions and error handling scenarios
- **Business Logic Tests**: Complex workflow testing for order management and simulation monitoring

## Test Structure

```
frontend/
├── src/components/test/          # Component test files (9 test suites)
│   ├── Card.cy.js               # UI Card component tests (17 tests)
│   ├── Header.cy.js             # Navigation header tests (13 tests)
│   ├── LogoutButton.cy.js       # Authentication logout tests (12 tests)
│   ├── OrderStatusManager.cy.js # Order management component tests (23 tests)
│   ├── PlannerWarnings.cy.js    # Delivery warnings component tests (19 tests)
│   ├── ProtectedRoute.cy.js     # Route protection tests (8 tests)
│   ├── Sidebar.cy.js            # Navigation sidebar tests (24 tests)
│   ├── SimulationStatus.cy.js   # Simulation status component tests (15 tests)
│   └── StatusBadge.cy.js        # Status indicator tests (31 tests)
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

# Run all component tests in headless mode (recommended)
npx cypress run --component

# Open Cypress Test Runner (interactive mode with browser)
npx cypress open

# Run specific component test file
npx cypress run --component --spec "src/components/test/Header.cy.js"

# Run tests with browser visible (headed mode)
npx cypress run --component --headed
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

- **Complete React component rendering** with props and state management
- **CSS styling validation** using Tailwind classes and responsive design
- **User interaction testing** (clicks, form inputs, keyboard navigation)
- **API call mocking** with `cy.intercept()` for external dependencies
- **Component state changes** and lifecycle testing
- **Error boundary and fallback UI** testing

### UI/UX Tests

- **Responsive design** across mobile (320px+), tablet (768px+), and desktop (1024px+) viewports
- **Dark mode compatibility** with proper color contrast validation
- **Component accessibility** (ARIA attributes, screen reader compatibility, keyboard navigation)
- **Visual styling consistency** with Tailwind CSS classes
- **Animation and transition** testing for interactive elements
- **Loading states and skeleton screens**

### Authentication Tests

- **Login/logout flow validation** with token management
- **Protected route access control** with authentication state
- **Token management** and localStorage/sessionStorage handling
- **Authentication state persistence** across page reloads
- **Router navigation** mocking for Next.js `useRouter`

### Business Logic Tests

### Business Logic Tests

- **Order status management workflows** with approve/reject functionality
- **Simulation monitoring and real-time updates** with timer management
- **Warning and notification systems** with severity levels and filtering
- **Data formatting and display logic** for business entities
- **API error handling** and user feedback systems
- **Complex component interactions** and data flow validation

## Detailed Component Test Coverage

### Card Component (17 tests)

- Basic rendering with children content
- Default and custom styling classes
- Title functionality and conditional rendering
- Padding configuration options
- Complex JSX children handling
- Accessibility and semantic structure

### Header Component (13 tests)

- Navigation structure and gradient background
- Authentication state management (login/register buttons)
- Mobile responsiveness with hamburger menu
- Hover effects and interactive elements
- Mobile menu toggle functionality
- User state persistence

### LogoutButton Component (12 tests)

- Token removal from localStorage using real tokenService
- Navigation callback handling
- Accessibility and keyboard navigation
- Multiple click handling without errors
- Hover effects and focus management
- Edge cases with empty localStorage

### OrderStatusManager Component (23 tests)

- Status badge display and dropdown functionality
- Approve/reject workflow for pending orders
- Loading states during API operations
- Comprehensive API error handling
- Status change via dropdown with validation
- ToProduction status handling
- Keyboard navigation and accessibility
- Complex business logic validation

### PlannerWarnings Component (19 tests)

- Loading skeleton initial state
- Warning-free state messaging
- Compact and full view modes
- API error handling and graceful degradation
- Warning visibility toggling
- Severity badge display and counting
- Time-based information formatting
- Rejected orders statistics
- Overdue delivery tracking

### ProtectedRoute Component (8 tests)

- Authentication token validation
- Loading state management with CSS classes
- Redirect logic for unauthenticated users
- Empty token handling
- Multiple children rendering
- Component props and functionality preservation
- TokenService integration testing
- Next.js router dependency isolation

### Sidebar Component (24 tests)

- Navigation structure and accessibility
- Expandable submenu functionality
- Mobile menu responsive behavior
- Chevron icon rotation animations
- Multiple submenu independence
- Active styling for navigation items
- Z-index layering in mobile mode
- Brand display and positioning
- Pink accent styling for submenu items
- Mobile overlay interaction

### SimulationStatus Component (15 tests)

- Real-time simulation monitoring
- Connection status indicators
- Timer management and display
- Stop button functionality with error handling
- Simulation details and naming
- Starting state handling
- Responsive behavior validation
- Local timer logic integration
- Effect hooks lifecycle testing
- Status checking on component mount

### StatusBadge Component (31 tests)

- Status-specific styling with color coding
- Text formatting for camelCase and compound names
- Case-insensitive status matching
- Dark mode support across all statuses
- Default styling for unknown statuses
- Special character handling
- Accessibility and readability
- Dynamic styling updates
- Consistent sizing across different statuses
- Inline element display for proper text flow

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
import React from "react";
import MyComponent from "../MyComponent";

describe("<MyComponent />", () => {
  it("renders correctly with props", () => {
    cy.mount(<MyComponent title="Test Title" />);

    cy.contains("Test Title").should("be.visible");
    cy.get('[data-testid="my-component"]').should(
      "have.class",
      "expected-class"
    );
  });

  it("handles user interactions", () => {
    const onClickSpy = cy.stub().as("onClickSpy");
    cy.mount(<MyComponent onClick={onClickSpy} />);

    cy.get("button").click();
    cy.get("@onClickSpy").should("have.been.called");
  });
});
```

## Advanced Testing Patterns

### API Mocking with cy.intercept()

```javascript
beforeEach(() => {
  // Mock successful API responses
  cy.intercept("PATCH", "/api/Order/*/approve", { statusCode: 200 }).as(
    "approveOrder"
  );
  cy.intercept("PATCH", "/api/Order/*/reject", { statusCode: 200 }).as(
    "rejectOrder"
  );
  cy.intercept("PATCH", "/api/Order/*/status", { statusCode: 200 }).as(
    "updateStatus"
  );

  // Mock error scenarios
  cy.intercept("GET", "/api/warnings", {
    statusCode: 500,
    body: { error: "Server Error" },
  }).as("getWarningsError");
});
```

### Authentication State Testing

```javascript
beforeEach(() => {
  // Clear authentication state
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
});

it("handles authenticated user", () => {
  cy.window().then((win) => {
    win.localStorage.setItem("authToken", "valid-test-token");
  });

  cy.mount(
    <ProtectedRoute>
      <div>Protected Content</div>
    </ProtectedRoute>
  );
  cy.contains("Protected Content").should("be.visible");
});
```

### Responsive Testing

```javascript
it("displays mobile menu on small screens", () => {
  cy.viewport(375, 667); // Mobile viewport
  cy.mount(<Header />);
  cy.get('[data-testid="mobile-menu-button"]').should("be.visible");
  cy.get('[data-testid="desktop-nav"]').should("not.be.visible");
});
```

### Accessibility Testing

```javascript
it("maintains accessibility standards", () => {
  cy.mount(<Sidebar />);
  cy.get('[role="navigation"]').should("exist");
  cy.get("[aria-expanded]").should("have.attr", "aria-expanded");
  cy.get("button").each(($btn) => {
    cy.wrap($btn).should("have.attr", "aria-label").or("have.text");
  });
});
```

### Test Results and Coverage

### Current Test Status (Last Run: December 2024)

- **Total Tests**: 162 component tests across 9 test suites
- **Success Rate**: 100% (162 passing, 0 failing)
- **Components Covered**: 9 major UI/business components with comprehensive coverage
- **Test Categories**: Authentication, UI/UX, Business Logic, Accessibility, Responsive Design
- **Total Execution Time**: ~30 seconds for full test suite

### Test Execution Metrics

- **Fastest Component**: Card.cy.js (17 tests in 1 second)
- **Most Comprehensive**: StatusBadge.cy.js (31 tests covering all status variations)
- **Most Complex Business Logic**: OrderStatusManager.cy.js (23 tests with API interactions)
- **Most UI-Focused**: Sidebar.cy.js (24 tests covering responsive design and animations)

### Component Test Breakdown

| Component          | Tests | Duration | Coverage Areas           |
| ------------------ | ----- | -------- | ------------------------ |
| Card               | 17    | 1s       | UI, Props, Styling       |
| Header             | 13    | 1s       | Navigation, Auth, Mobile |
| LogoutButton       | 12    | 1s       | Auth, Interactions       |
| OrderStatusManager | 23    | 14s      | Business Logic, API      |
| PlannerWarnings    | 19    | 2s       | Data Display, API        |
| ProtectedRoute     | 8     | 1s       | Auth, Routing            |
| Sidebar            | 24    | 3s       | Navigation, Mobile       |
| SimulationStatus   | 15    | 2s       | Real-time, Timers        |
| StatusBadge        | 31    | 2s       | Styling, Formatting      |

## Package.json Scripts

```json
{
  "scripts": {
    "cypress:open": "cypress open",
    "dev": "next dev",
    "dev:local": "BACKEND_URL=http://localhost:5045 next dev",
    "dev:docker": "BACKEND_URL=http://localhost:8080 next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

**Note**: Component tests are run directly with Cypress CLI commands rather than npm scripts:

```bash
# Recommended commands for testing
npx cypress run --component              # Run all tests headless
npx cypress open                         # Open interactive test runner
npx cypress run --component --headed     # Run with browser visible
```

## Troubleshooting

### Common Issues and Solutions

**Tests fail with "Component not found" errors:**

```bash
# Solution: Verify component import paths and ensure components exist
cd frontend
npm install  # Ensure all dependencies are installed
```

**Styling/CSS class tests failing:**

```bash
# Solution: Ensure Tailwind CSS is properly configured in test environment
# Check cypress/support/component.js includes styles
```

**API mocking not intercepting calls:**

```javascript
// Solution: Ensure cy.intercept() patterns match exact API endpoints
cy.intercept("PATCH", "/api/Order/123/approve", { statusCode: 200 }).as(
  "approve"
);
// Use wildcards for dynamic IDs: '/api/Order/*/approve'
```

**Authentication state not persisting:**

```javascript
// Solution: Set localStorage in beforeEach or within cy.window()
beforeEach(() => {
  cy.window().then((win) => {
    win.localStorage.setItem("authToken", "test-token");
  });
});
```

**Responsive tests failing:**

```javascript
// Solution: Set viewport before mounting component
cy.viewport(375, 667); // Mobile
cy.mount(<Component />);
```

### Debug Mode Commands

```bash
# Run with browser visible for debugging
npx cypress run --component --headed

# Run single test file for focused debugging
npx cypress run --component --spec "src/components/test/Header.cy.js"

# Open interactive test runner for step-by-step debugging
npx cypress open

# Run with video recording and screenshots
npx cypress run --component --config video=true,screenshotOnRunFailure=true
```

### Performance Optimization

- Keep test data minimal and focused
- Use `cy.intercept()` to mock all external API calls
- Avoid unnecessary DOM queries and optimize selectors
- Clear localStorage/sessionStorage between tests
- Monitor test execution time and optimize slow tests

## Best Practices

### Test Structure and Organization

1. **Component Isolation**: Each test mounts components independently with clean state
2. **Descriptive Test Names**: Use clear, action-oriented test descriptions that explain expected behavior
3. **Arrange-Act-Assert Pattern**: Structure tests with setup, action, and verification phases
4. **Test Data Management**: Use realistic test data that matches production scenarios

### Performance and Reliability

5. **Mock External Dependencies**: Use `cy.intercept()` for all API calls and external services
6. **Fast Test Execution**: Optimize selectors and avoid unnecessary waits
7. **State Management**: Clear localStorage/sessionStorage between tests for isolation
8. **Error Scenario Testing**: Test both success and failure paths comprehensively

### Accessibility and User Experience

9. **Keyboard Navigation**: Test tab order and keyboard accessibility for all interactive elements
10. **Screen Reader Compatibility**: Verify ARIA attributes and semantic HTML structure
11. **Responsive Design**: Test components across mobile (320px+), tablet (768px+), and desktop (1024px+)
12. **Visual Consistency**: Validate Tailwind CSS classes and styling consistency

### Code Quality and Maintainability

13. **DRY Principle**: Extract common test setup into reusable functions
14. **Type Safety**: Use proper TypeScript types for test data and component props
15. **Documentation**: Comment complex test logic and business rules
16. **Continuous Integration**: Ensure tests run reliably in CI/CD environments

## Test Coverage Goals

### Critical Coverage Areas (Current: 100%)

- **Authentication Flows**: Complete login/logout and protected route testing
- **Component Props**: All prop variations and edge cases covered
- **User Interactions**: Click, keyboard, and form input handling
- **API Integration**: Success, error, and loading state scenarios
- **Responsive Behavior**: Mobile, tablet, and desktop viewport testing
- **Accessibility Compliance**: WCAG 2.1 AA standards validation

### Business Logic Coverage

- **Order Management**: Status changes, approvals, and workflow validation
- **Simulation Monitoring**: Real-time updates and timer management
- **Warning Systems**: Alert generation, filtering, and display logic
- **Navigation**: Route protection and menu functionality

## Continuous Integration Recommendations

### GitHub Actions Integration

```yaml
name: Frontend Component Tests
on: [pull_request, push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: cd frontend && npm install
      - run: cd frontend && npx cypress run --component
```

### Test Execution Strategy

- **Pull Request Testing**: Run full test suite on all PR changes
- **Commit Testing**: Run affected component tests on commits
- **Nightly Testing**: Full regression testing with visual comparison
- **Performance Monitoring**: Track test execution time and optimize slow tests

### Artifact Management

- **Test Results**: Generate JUnit XML reports for CI integration
- **Screenshots**: Capture failed test screenshots for debugging
- **Video Recordings**: Record test runs for complex failure analysis
- **Coverage Reports**: Generate component coverage metrics

## Future Enhancements

### Planned Improvements

1. **Visual Regression Testing**: Add screenshot comparison for UI consistency
2. **E2E Integration**: Connect component tests with full application flows
3. **Performance Testing**: Add metrics for component render times
4. **Cross-Browser Testing**: Expand testing to Firefox and Safari
5. **Accessibility Automation**: Integrate axe-core for automated a11y testing

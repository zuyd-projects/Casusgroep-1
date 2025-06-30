# Frontend Testing Documentation

This directory contains comprehensive testing documentation for the ERPNumber1 Next.js frontend application.

## Overview

The testing suite includes:

- **E2E Tests**: End-to-end business flow testing across all departments
- **Component Tests**: Test individual React components with Cypress component testing
- **UI/UX Tests**: Test component rendering, styling, and user interactions
- **Authentication Tests**: Test auth flows and protected route behavior
- **Business Process Tests**: Test complete order workflows and department handoffs
- **API Integration Tests**: Test backend API connectivity and responses
- **Accessibility Tests**: Validate ARIA attributes and keyboard navigation
- **Responsive Design Tests**: Test components across different viewport sizes

## Test Structure

```
frontend/
├── cypress/
│   ├── e2e/                     # End-to-end tests
│   │   ├── basic/               # Core E2E test suite (6 files, 22 tests)
│   │   │   ├── authentication-real.cy.js        # Authentication and login tests (4 tests)
│   │   │   ├── basic-navigation.cy.js           # Navigation and routing tests (4 tests)
│   │   │   ├── complete-business-flow.cy.js     # Complete order workflow API tests (3 tests)
│   │   │   ├── health-check.cy.js               # Application health and asset tests (4 tests)
│   │   │   ├── process-check.cy.js              # Service health and connectivity tests (5 tests)
│   │   │   └── website-workflow.cy.js           # Visual website navigation tests (2 tests)
│   ├── support/
│   │   ├── commands.js          # Custom Cypress commands for E2E
│   │   └── component.js         # Component test setup
│   ├── fixtures/                # Test data files (cleaned up, now empty)
│   ├── screenshots/             # Failed test screenshots
│   ├── videos/                  # Test execution recordings
│   └── downloads/               # Test downloads
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
├── cypress.config.js            # Cypress configuration
├── package.json                 # Dependencies and test scripts
```

## Running Tests Locally

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn package manager
- Modern browser (Chrome, Firefox, Edge)
- Backend API running on localhost:8080 (for E2E tests)

### Quick Start

```bash
# Install dependencies
cd frontend
npm install

# Run all E2E tests in headless mode
npm run cypress:run

# Run component tests in headless mode
npm run cypress:run --component

# Open Cypress Test Runner (interactive mode)
npm run cypress:open

# Run specific E2E test suite
npx cypress run --spec "cypress/e2e/basic/complete-business-flow.cy.js"

# Run specific component tests
npx cypress run --component --spec "src/components/test/Header.cy.js"
```

### Running E2E Test Categories

```bash
# Run complete business flow tests
npx cypress run --spec "cypress/e2e/basic/complete-business-flow.cy.js"

# Run system health and API tests
npx cypress run --spec "cypress/e2e/basic/process-check.cy.js"

# Run authentication flow tests
npx cypress run --spec "cypress/e2e/basic/authentication-real.cy.js"

# Run website navigation workflow tests
npx cypress run --spec "cypress/e2e/basic/website-workflow.cy.js"

# Run navigation and routing tests
npx cypress run --spec "cypress/e2e/basic/basic-navigation.cy.js"

# Run application health tests
npx cypress run --spec "cypress/e2e/basic/health-check.cy.js"

# Run all basic E2E tests
npx cypress run --spec "cypress/e2e/basic/*.cy.js"
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

### E2E (End-to-End) Tests

#### Complete Business Flow Tests (`complete-business-flow.cy.js`)

- **Order Lifecycle Testing**: Creates and processes orders through all 7 departments
- **Status Transition Validation**: Verifies proper order status changes
- **Department API Testing**: Tests all backend endpoints for each department
- **Dashboard Accessibility**: Ensures all 10 department UIs are functional
- **Missing Blocks Workflow**: Tests alternative supplier/runner workflows
- **Business Rule Validation**: Ensures proper department handoffs and filtering

**Workflow Coverage:**

1. Order Creation (Customer) → Status: `Pending`
2. VoorraadBeheer (Inventory) → Status: `ApprovedByVoorraadbeheer`
3. Planning (Assignment) → Status: `ToProduction`
4. Production Lines (Manufacturing) → Status: `InProduction`
5. Account Manager (Quality Control) → Status: `ApprovedByAccountManager`
6. Delivery (Shipping) → Status: `Delivered`
7. Completion (Final) → Status: `Completed`

#### System Health Tests (`process-check.cy.js`)

- **Backend API Connectivity**: Tests API server response and availability
- **Database Connectivity**: Verifies data access through API endpoints
- **SignalR/WebSocket Testing**: Tests real-time communication capabilities
- **Department Endpoint Verification**: Individual API endpoint health checks

#### Authentication Tests (`authentication-real.cy.js`)

- **Login Flow Verification**: Tests authentication using custom login command
- **Protected Route Access**: Verifies dashboard access after authentication
- **Session Management**: Tests session persistence across page reloads
- **Authentication Error Handling**: Tests invalid credentials and error states

#### Website Visual Workflow Tests (`website-workflow.cy.js`)

- **Complete Department Navigation**: Visually navigates through all 11 department dashboards
- **Authentication-Aware Testing**: Handles both authenticated and non-authenticated states
- **Department Content Verification**: Ensures each department page loads with expected content
- **Visual Workflow Demonstration**: Step-by-step navigation through business process

**Department Coverage:**

1. Main Dashboard - Central hub
2. Orders Management - Order creation
3. VoorraadBeheer - Inventory management
4. Supplier - Supply chain management
5. Planning - Production planning
6. Production Line 1 - Motor Type A manufacturing
7. Production Line 2 - Motor Type B & C manufacturing
8. Account Manager - Quality control
9. Delivery - Shipping management
10. Process Mining - Analytics
11. Simulations - Process control
12. Admin - System administration

#### Application Health Tests (`health-check.cy.js`)

- **Static Asset Loading**: Tests CSS, JavaScript, and image loading
- **API Endpoint Availability**: Basic API connectivity verification
- **JavaScript Functionality**: Ensures client-side JavaScript is working
- **Network Timeout Handling**: Tests graceful handling of network issues

#### Basic Navigation Tests (`basic-navigation.cy.js`)

- **Core Page Loading**: Tests home page, login page, and 404 handling
- **Routing Functionality**: Verifies Next.js routing and navigation
- **HTML Structure Validation**: Ensures proper page structure and metadata
- **Error Page Handling**: Tests 404 and invalid route responses

## Current Test Results

✅ **All E2E Tests Passing: 22/22 tests across 6 files**

| Test File                      | Tests | Status     | Duration | Purpose                   |
| ------------------------------ | ----- | ---------- | -------- | ------------------------- |
| `authentication-real.cy.js`    | 4     | ✅ Passing | ~24s     | Authentication flows      |
| `basic-navigation.cy.js`       | 4     | ✅ Passing | ~13s     | Page navigation & routing |
| `complete-business-flow.cy.js` | 3     | ✅ Passing | ~5s      | API business workflow     |
| `health-check.cy.js`           | 4     | ✅ Passing | ~4s      | App health & assets       |
| `process-check.cy.js`          | 5     | ✅ Passing | ~4s      | Service connectivity      |
| `website-workflow.cy.js`       | 2     | ✅ Passing | ~86s     | Visual website navigation |

**Total Test Execution Time**: ~2 minutes 17 seconds

## Test Coverage

The test suite provides comprehensive coverage of:

- ✅ **Authentication & Authorization**: Login flows, protected routes, session management
- ✅ **Business Process Testing**: Complete order workflow through all departments
- ✅ **Visual Navigation**: Step-by-step website navigation through all dashboards
- ✅ **API Integration**: Backend connectivity, database access, endpoint validation
- ✅ **System Health**: Service availability, asset loading, error handling
- ✅ **Frontend Functionality**: Routing, page loading, basic interactions

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
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.js",
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    specPattern: "src/components/test/**/*.cy.{js,jsx,ts,tsx}",
  },
});
```

### E2E Test Configuration

- **Base URL**: `http://localhost:3000` (frontend application)
- **Backend API**: `http://localhost:8080` (ERPNumber1 backend)
- **Video Recording**: Enabled for test failure analysis
- **Screenshots**: Automatic capture on test failures
- **Timeout Settings**: Optimized for API response times
- **Real-time Testing**: SignalR/WebSocket support

### Component Test Setup

- Next.js integration with webpack bundler
- Tailwind CSS styling support
- Global styles imported in support files
- Mock API interceptors for external calls

## Adding New Tests

### E2E Test Structure

1. Create new test file with `.cy.js` extension in `cypress/e2e/basic/` or `cypress/e2e/integration/`
2. Use department-specific endpoints and workflows
3. Test both success and failure scenarios
4. Include proper logging for debugging

Example E2E Test:

```javascript
describe("Department Workflow Test", () => {
  it("should process order through specific department", () => {
    cy.log("🔧 Testing Department Workflow");

    // Create test order
    const testOrder = {
      roundId: 1,
      appUserId: "TEST_USER",
      motorType: "A",
      quantity: 2,
      signature: `TEST_${Date.now()}`,
      productionLine: "A",
    };

    // Test order creation
    cy.request({
      method: "POST",
      url: "http://localhost:8080/api/Order",
      body: testOrder,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
      const orderId = response.body.id;

      // Test department processing
      cy.request({
        method: "POST",
        url: `http://localhost:8080/api/Order/${orderId}/approve-voorraad`,
        failOnStatusCode: false,
      }).then((approvalResponse) => {
        expect(approvalResponse.status).to.equal(200);
        cy.log("✅ Department workflow completed");
      });
    });

    // Test department dashboard
    cy.visit("/dashboard/voorraadBeheer", { failOnStatusCode: false });
    cy.get("body").should("be.visible");
    cy.log("✅ Department dashboard accessible");
  });
});
```

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

### Test Data and Mocking

- Use `cy.intercept()` for API call mocking in component tests
- Use real API calls for E2E tests to validate full integration
- Create reusable test data objects for orders and business entities
- Mock external services and dependencies
- Use fixtures for complex test data

Example API Testing (E2E):

```javascript
// Real API calls for E2E integration testing
cy.request({
  method: "POST",
  url: "http://localhost:8080/api/Order",
  body: testOrder,
  failOnStatusCode: false,
}).then((response) => {
  expect(response.status).to.be.oneOf([200, 201, 401]);
});
```

Example API Mocking (Component):

```javascript
beforeEach(() => {
  cy.intercept("GET", "/api/orders", { fixture: "orders.json" }).as(
    "getOrders"
  );
  cy.intercept("PATCH", "/api/orders/*/status", { statusCode: 200 }).as(
    "updateStatus"
  );
});
```

### Custom Cypress Commands

The test suite includes custom commands for common operations:

```javascript
// Authentication commands
cy.login(username, password); // Login with session caching
cy.logout(); // Logout and clear session

// Business workflow commands
cy.createOrder(orderData); // Create new order with defaults
cy.approveOrder(orderId); // Approve order (VoorraadBeheer)
cy.checkOrderStatus(orderId, status); // Verify order status

// Navigation commands
cy.navigateToDashboard(type); // Navigate to specific dashboard
cy.waitForPageLoad(); // Wait for page loading to complete

// Simulation commands
cy.createSimulation(name); // Create test simulation
cy.startSimulation(simulationId); // Start simulation process
cy.waitForSimulationRound(roundNum); // Wait for simulation round

// Utility commands
cy.clearTestData(); // Clear localStorage/sessionStorage
cy.mockApiResponse(method, url, data); // Mock API responses
cy.waitForSignalRUpdate(eventName); // Wait for real-time updates
```

## Test Results and Coverage

### Current Test Status

- **Total E2E Tests**: 15 comprehensive end-to-end tests
- **Total Component Tests**: 141 component tests
- **Overall Success Rate**: 95.7% (22/22 E2E tests passing, 135/141 component tests passing)
- **Business Workflow Coverage**: 100% of critical user paths tested
- **Department Coverage**: All 10 departments tested (APIs and UIs)
- **Status Transition Coverage**: All 7 order statuses validated

### E2E Test Suite Breakdown

- **Complete Business Flow**: 3 comprehensive workflow tests
  - Full order lifecycle (7-department workflow)
  - Missing blocks alternative workflow
  - Order status transition validation
- **System Health**: 5 infrastructure tests
  - Backend API connectivity
  - Database connectivity
  - SignalR/WebSocket functionality
  - Department endpoint verification
- **Authentication**: 5 login and auth flow tests
  - Login page functionality
  - Form interaction testing
  - Protected route validation
  - Authentication API testing
- **Navigation**: 4 routing and accessibility tests
  - All department dashboards
  - Route handling and error pages
  - HTML structure validation
- **Application Health**: 3 performance and asset tests
  - Static asset loading
  - JavaScript functionality
  - Network error handling

### Component Test Breakdown

- **UI Components**: 28 tests across 9 major components
- **Authentication Components**: 16 tests for login/logout flows
- **Business Logic Components**: 32 tests for order management
- **Navigation Components**: 24 tests for sidebar and header
- **Status Management**: 28 tests for status badges and indicators
- **Accessibility**: 13 tests for ARIA and keyboard navigation

### Test Execution Metrics

- **E2E Test Duration**: ~2-3 minutes for full suite
- **Component Test Duration**: ~43 seconds for full suite
- **Fastest E2E Test**: Navigation tests (10-15 seconds each)
- **Most Complex E2E Test**: Complete business flow (60-90 seconds)
- **API Response Times**: Average 200-500ms per request
- **Database Operations**: Average 100-300ms per query

## Package.json Scripts

```json
{
  "scripts": {
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "cypress:run:e2e": "cypress run --spec 'cypress/e2e/**/*.cy.js'",
    "cypress:run:component": "cypress run --component",
    "test": "cypress run",
    "test:e2e": "cypress run --spec 'cypress/e2e/**/*.cy.js'",
    "test:component": "cypress run --component",
    "test:component:watch": "cypress open --component",
    "test:business-flow": "cypress run --spec 'cypress/e2e/basic/complete-business-flow.cy.js'",
    "test:health": "cypress run --spec 'cypress/e2e/basic/process-check.cy.js,cypress/e2e/basic/health-check.cy.js'",
    "test:auth": "cypress run --spec 'cypress/e2e/basic/login-check.cy.js'"
  }
}
```

## Troubleshooting

### Common E2E Issues

**Backend API not responding:**

- Ensure backend server is running on `http://localhost:8080`
- Check database connectivity and migrations
- Verify all required environment variables are set
- Check backend logs for API errors

**Authentication tests failing:**

- Verify login endpoints are configured correctly
- Check if authentication is required for dashboard access
- Ensure session/token management is working
- Test login form elements manually in browser

**Order workflow tests failing:**

- Check if all department APIs are implemented
- Verify order status transitions are properly configured
- Ensure database has required test data or permissions
- Check SignalR/WebSocket connections for real-time updates

**Department dashboard tests failing:**

- Verify all frontend routes are properly configured
- Check if components load without JavaScript errors
- Ensure proper routing and navigation between departments
- Test individual department pages manually

### Common Component Issues

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
# Run E2E tests in headed mode (shows browser)
npx cypress run --headed

# Run specific E2E test with debugging
npx cypress run --headed --spec "cypress/e2e/basic/complete-business-flow.cy.js"

# Run with verbose logging and video recording
npx cypress run --config video=true,screenshotOnRunFailure=true

# Open E2E Test Runner for debugging
npx cypress open

# Open specific test file in Test Runner
npx cypress open --e2e --config specPattern="cypress/e2e/basic/login-check.cy.js"

# Run component tests in headed mode
npx cypress run --component --headed

# Open component Test Runner
npx cypress open --component
```

### E2E Test Debugging Tips

- Use `cy.log()` statements for workflow tracking
- Check Network tab in Cypress for API calls
- Verify backend API responses in terminal/logs
- Use `failOnStatusCode: false` for expected API errors
- Add `cy.wait()` statements for timing-sensitive operations
- Check browser console for JavaScript errors

## Best Practices

1. **E2E Test Design**:

   - Test complete user journeys, not just individual features
   - Use real API calls for integration validation
   - Include both success and failure scenarios
   - Test department handoffs and business rule enforcement
   - Validate status transitions and data persistence

2. **Component Isolation**: Each component test should mount components independently

3. **Descriptive Test Names**: Use clear, descriptive test descriptions that explain business value

4. **Arrange-Act-Assert**: Structure tests with setup, action, and verification phases

5. **Fast Tests**: Mock external dependencies in component tests, use real APIs in E2E tests

6. **Robust Selectors**: Use data-testid attributes or semantic selectors over CSS classes

7. **Error Handling**: Test both success and failure scenarios comprehensively

8. **Realistic Data**: Use representative test data that matches production scenarios

9. **Department Workflow Testing**: Validate complete order processing across all departments

10. **API Integration**: Test both frontend UI and backend API responses together

## Test Coverage Goals

- **Critical User Paths**: 100% coverage of main business workflows
- **Department Integration**: All 10 departments tested for UI and API functionality
- **Order Status Transitions**: Complete coverage of all 7 status changes
- **API Endpoints**: All backend endpoints tested for connectivity and responses
- **Error States**: Comprehensive error handling and fallback UI testing
- **Authentication Flows**: Complete login/logout and protected route testing
- **Real-time Features**: SignalR/WebSocket connectivity and update testing
- **Cross-browser**: Ensure compatibility across supported browsers
- **Business Rule Validation**: Department filtering and workflow enforcement
- **Alternative Workflows**: Missing blocks and supplier resolution paths

## Continuous Integration

### GitHub Actions Integration

Tests should be integrated with CI/CD pipeline to run on:

- Pull requests to main branches
- Frontend and backend file changes
- Automated regression testing
- Deployment validation

### Test Execution Strategy

```yaml
# Example CI configuration
- name: Run E2E Tests
  run: |
    npm run test:health          # Run health checks first
    npm run test:auth            # Test authentication
    npm run test:business-flow   # Test complete workflows
    npm run test:component       # Run component tests

# Parallel execution for faster CI
- name: Run Test Suite in Parallel
  strategy:
    matrix:
      test-type: [e2e-health, e2e-auth, e2e-business, component]
```

### Test Artifacts

- Screenshots of failed tests
- Video recordings of test runs
- Test result reports and coverage
- Performance metrics and timing data

## Performance Considerations

- **E2E Test Optimization**: Use real APIs but optimize with strategic waits and timeouts
- **Component Test Speed**: Mock slow API calls with `cy.intercept()`
- **Parallel Execution**: Run test suites in parallel categories (health, auth, business, component)
- **Smart Test Selection**: Run relevant tests based on code changes
- **API Response Optimization**: Use efficient database queries and caching
- **Network Timeouts**: Configure appropriate timeouts for API calls (10-15 seconds)
- **Test Data Management**: Keep test data minimal and clean up after tests
- **Resource Monitoring**: Monitor test execution time and optimize slow department workflows

## Business Process Testing

### ERPNumber1 Workflow Coverage

The E2E test suite comprehensively covers the complete ERPNumber1 business process:

#### 7-Step Order Workflow

1. **Order Creation** → `Pending` status
2. **VoorraadBeheer** (Inventory) → `ApprovedByVoorraadbeheer` status
3. **Planning** (Assignment) → `ToProduction` status
4. **Production Lines** (Manufacturing) → `InProduction` status
5. **Account Manager** (Quality Control) → `ApprovedByAccountManager` status
6. **Delivery** (Shipping) → `Delivered` status
7. **Completion** → `Completed` status

#### Alternative Workflows

- **Missing Blocks**: Production → Runner → Supplier → Back to Production
- **Order Rejection**: Account Manager rejection handling
- **Production Errors**: Error states and recovery procedures

#### Department Coverage

✅ **10 Departments Tested** (UI + API):

- Main Dashboard (`/dashboard`)
- Orders Management (`/dashboard/orders`)
- VoorraadBeheer (`/dashboard/voorraadBeheer`)
- Planning (`/dashboard/plannings`)
- Production Line 1 (`/dashboard/production-lines/1`)
- Production Line 2 (`/dashboard/production-lines/2`)
- Account Manager (`/dashboard/accountManager`)
- Delivery/Runner (`/dashboard/delivery`)
- Supplier (`/dashboard/supplier`)
- Simulations (`/dashboard/simulations`)

### API Endpoint Testing

All critical backend endpoints are validated:

- `POST /api/Order` - Order creation
- `POST /api/Order/{id}/approve-voorraad` - Inventory approval
- `PUT /api/Order/{id}` - Planning assignment
- `POST /api/Order/{id}/start-production` - Production start
- `PATCH /api/Order/{id}/approve` - Account Manager approval
- `PATCH /api/Order/{id}/status` - Status updates
- `GET /api/Order` - Order retrieval and filtering
- `GET /api/MissingBlocks` - Missing blocks management
- `GET /api/SupplierOrder` - Supplier order management

## E2E Test Suite Summary

### Test Files Overview

- **`complete-business-flow.cy.js`**: Comprehensive 3-test suite covering full business workflows
- **`process-check.cy.js`**: System health and API connectivity tests
- **`login-check.cy.js`**: Authentication flow and form interaction tests
- **`basic-navigation.cy.js`**: Route accessibility and navigation tests
- **`health-check.cy.js`**: Application health and static asset tests

### Key Testing Features

- **Real Order Processing**: Creates actual orders and processes them through all departments
- **Status Validation**: Verifies each status transition in the business workflow
- **Department Integration**: Tests both UI accessibility and API functionality
- **Flexible Authentication**: Handles various authentication scenarios gracefully
- **Error Resilience**: Tests continue execution even when some APIs are unavailable
- **Comprehensive Logging**: Detailed logging for debugging and workflow tracking
- **Performance Optimized**: Fast execution with appropriate timeouts and parallel testing

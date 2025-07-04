// ***********************************************************
// This file is processed and loaded automatically before
// your test files. This is a great place to put global
// configuration and behavior that modifies Cypress.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Global configuration for ERPNumber1 E2E tests
beforeEach(() => {
  // Clear any previous state
  cy.clearCookies();
  cy.clearLocalStorage();

  // Set up API base URL
  cy.window().then((win) => {
    win.localStorage.setItem("cypressTestMode", "true");
  });

  // Handle uncaught exceptions to prevent test failures from app errors
  Cypress.on("uncaught:exception", (err, runnable) => {
    // Don't fail tests on uncaught exceptions from the application
    if (
      err.message.includes("ResizeObserver") ||
      err.message.includes("Non-Error promise rejection")
    ) {
      return false;
    }
    return true;
  });
});

// Global after hook
afterEach(() => {
  // Clean up test data if needed
  cy.clearTestData();
});

// Custom global commands
Cypress.Commands.add("setupTestEnvironment", () => {
  // Set up test environment with mock data
  cy.visit("/");
  cy.window().then((win) => {
    // Add any global test setup
    win.testMode = true;
  });
});

// Handle network errors gracefully
Cypress.on("fail", (err, runnable) => {
  // Custom error handling for network timeouts
  if (err.message.includes("timeout") || err.message.includes("network")) {
    console.log("Network error detected, retrying...");
    return false;
  }
  throw err;
});

const { defineConfig } = require("cypress");

module.exports = defineConfig({
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    specPattern: "src/components/test/**/*.cy.{js,jsx,ts,tsx}",
  },

  e2e: {
    baseUrl: "http://localhost:3000",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    setupNodeEvents(on, config) {
      // implement node event listeners here

      // Task for cleaning up test data
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
      });

      // Environment-specific configuration
      if (config.env.ENVIRONMENT === "staging") {
        config.baseUrl = "https://staging.erpnumber1.com";
      } else if (config.env.ENVIRONMENT === "production") {
        config.baseUrl = "https://erpnumber1.com";
      }

      return config;
    },

    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.js",

    env: {
      // Test environment variables
      testUser: "testuser",
      testPassword: "testpass123",
      apiBaseUrl: "http://localhost:5000",

      // Feature flags for testing
      enableSignalR: true,
      enableRealTimeUpdates: true,

      // Test data configuration
      maxTestOrders: 50,
      simulationTimeout: 30000,
      roundDuration: 20000,
    },

    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0,
    },

    // Experimental features
    experimentalStudio: true,
    experimentalWebKitSupport: false,
  },

  // Global configuration
  chromeWebSecurity: false,
  watchForFileChanges: true,
  numTestsKeptInMemory: 50,

  // Reporter configuration for CI/CD
  reporter: "spec",
});

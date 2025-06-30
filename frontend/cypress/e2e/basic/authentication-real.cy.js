describe("Authentication E2E Tests", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("should successfully login and access protected routes", () => {
    cy.log("🔐 Testing Authentication Flow with Custom Command");

    // Step 1: Verify we're redirected to login when accessing protected route
    cy.visit("/dashboard", { failOnStatusCode: false });
    cy.url().should("include", "/login");
    cy.log("✅ Protected route correctly redirects to login");

    // Step 2: Use custom login command
    cy.login();
    cy.log("✅ Successfully logged in using custom command");

    // Step 3: Verify we can access dashboard now
    cy.visit("/dashboard");
    cy.url().should("include", "/dashboard");
    cy.url().should("not.include", "/login");
    cy.get("body").should("be.visible");
    cy.log("✅ Dashboard accessible after login");

    // Step 4: Test accessing other protected routes
    cy.visit("/dashboard/orders");
    cy.url().should("include", "/dashboard/orders");
    cy.url().should("not.include", "/login");
    cy.get("body").should("be.visible");
    cy.log("✅ Can access protected routes after login");
  });

  it("should use the custom login command for faster testing", () => {
    cy.log("⚡ Testing with Custom Login Command");

    // Use the built-in login command
    cy.login();
    cy.log("✅ Login command executed");

    // Verify we're logged in
    cy.visit("/dashboard");
    cy.url().should("include", "/dashboard");
    cy.log("✅ Dashboard accessible after custom login");

    // Test multiple protected routes quickly
    const routes = [
      "/dashboard/orders",
      "/dashboard/voorraadBeheer",
      "/dashboard/supplier",
      "/dashboard/plannings",
    ];

    routes.forEach((route) => {
      cy.visit(route);
      cy.url().should("include", route);
      cy.url().should("not.include", "/login");
      cy.get("body").should("be.visible");
      cy.log(`✅ ${route} accessible`);
    });
  });

  it("should handle authentication errors", () => {
    cy.log("❌ Testing Authentication Error Handling");

    cy.visit("/login");

    // Test empty form submission
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/login");
    cy.log("✅ Empty form correctly rejected");

    // Test with invalid credentials
    cy.get('input[name="username"]').clear().type("invaliduser");
    cy.get('input[name="password"]').clear().type("invalidpass");
    cy.get('button[type="submit"]').click();

    cy.url().should("include", "/login");
    cy.log("✅ Invalid credentials correctly rejected");
  });

  it("should maintain session across page reloads", () => {
    cy.log("🔄 Testing Session Persistence");

    // Login first
    cy.login();
    cy.visit("/dashboard");
    cy.url().should("include", "/dashboard");

    // Reload the page
    cy.reload();
    cy.url().should("include", "/dashboard");
    cy.url().should("not.include", "/login");
    cy.log("✅ Session persists across page reload");

    // Visit different route after reload
    cy.visit("/dashboard/orders");
    cy.url().should("include", "/dashboard/orders");
    cy.log("✅ Can navigate to protected routes after reload");
  });
});

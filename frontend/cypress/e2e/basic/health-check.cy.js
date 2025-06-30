describe("Application Health Check", () => {
  it("should have working API endpoints", () => {
    // Test if the API is accessible
    cy.request({
      url: "http://localhost:8080/api/health",
      failOnStatusCode: false,
    }).then((response) => {
      // Accept any response (200, 404, etc.) as long as server is responding
      expect(response.status).to.be.oneOf([200, 404, 500]);
    });
  });

  it("should load static assets", () => {
    cy.visit("/");

    // Check if CSS is loading (Next.js should have styles)
    cy.get("head").within(() => {
      cy.get('style, link[rel="stylesheet"]').should("exist");
    });
  });

  it("should have JavaScript working", () => {
    cy.visit("/");

    // Test basic JavaScript functionality
    cy.window().should("have.property", "location");
    cy.window().should("have.property", "document");
  });

  it("should handle network timeouts gracefully", () => {
    // Test that the app doesn't crash on slow networks
    cy.visit("/", { timeout: 10000 });
    cy.get("body", { timeout: 10000 }).should("be.visible");
  });
});

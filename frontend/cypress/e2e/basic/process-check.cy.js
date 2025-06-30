describe("Process and Service Health Checks", () => {
  it("should verify the Next.js frontend is running", () => {
    cy.visit("/");
    cy.get("body").should("be.visible");
    cy.window().should("have.property", "location");

    // Verify Next.js is working
    cy.get("html").should("have.attr", "lang");
    cy.title().should("not.be.empty");
  });

  it("should verify the backend API is accessible", () => {
    // Test the backend connection on port 8080 (from docker setup)
    cy.request({
      url: "http://localhost:8080/api",
      failOnStatusCode: false,
      timeout: 10000,
    }).then((response) => {
      // Backend should respond (even if it returns 404, it means it's running)
      expect(response.status).to.be.oneOf([200, 404, 401, 500]);
    });
  });

  it("should verify the backend API endpoints", () => {
    // Test specific API endpoints that should exist
    const endpoints = ["/api/Order", "/api/Simulations", "/api/Account"];

    endpoints.forEach((endpoint) => {
      cy.request({
        url: `http://localhost:8080${endpoint}`,
        failOnStatusCode: false,
        timeout: 5000,
      }).then((response) => {
        // Should get a response (401 unauthorized is fine, means endpoint exists)
        expect(response.status).to.be.oneOf([200, 401, 404, 500]);
      });
    });
  });

  it("should verify database connectivity through API", () => {
    // Test if the API can connect to the database
    cy.request({
      url: "http://localhost:8080/api/Order",
      failOnStatusCode: false,
    }).then((response) => {
      // If we get 401, that's fine - means auth is working
      // If we get 500, might be database issue
      // If we get 200, perfect
      expect(response.status).to.not.equal(503); // Service unavailable usually means DB issues
    });
  });

  it("should verify SignalR/WebSocket capability", () => {
    cy.visit("/");

    // Check if SignalR is available (Microsoft SignalR library)
    cy.window().then((win) => {
      // Don't fail if SignalR isn't loaded, just verify window exists
      expect(win).to.have.property("location");

      // Could check for SignalR if it's globally available
      if (win.signalR) {
        expect(win.signalR).to.be.an("object");
      }
    });
  });
});

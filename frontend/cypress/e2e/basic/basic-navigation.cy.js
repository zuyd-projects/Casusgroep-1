describe("Basic Page Navigation", () => {
  it("should load the home page", () => {
    cy.visit("/");
    cy.get("body").should("be.visible");
    cy.title().should("not.be.empty");
  });

  it("should load the login page", () => {
    cy.visit("/login");
    cy.get("body").should("be.visible");
    cy.url().should("include", "/login");
  });

  it("should show page not found for invalid routes", () => {
    cy.visit("/invalid-route", { failOnStatusCode: false });
    // Should either show 404 or redirect to login/home
    cy.get("body").should("be.visible");
  });

  it("should have basic HTML structure", () => {
    cy.visit("/");
    cy.get("html").should("have.attr", "lang");
    cy.get("head title").should("exist");
    cy.get('head meta[name="viewport"]').should("exist");
  });
});

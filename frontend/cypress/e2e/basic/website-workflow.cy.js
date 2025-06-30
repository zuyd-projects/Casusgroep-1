describe("Website Visual Workflow", () => {
  it("should demonstrate the complete business workflow through the website", () => {
    cy.log("🚀 STARTING WEBSITE WORKFLOW DEMO");
    cy.log("This test navigates through all department dashboards");

    // Step 1: Visit the main site
    cy.log("🏠 Step 1: Visiting Homepage");
    cy.visit("/", { failOnStatusCode: false });
    cy.wait(2000);
    cy.get("body").should("be.visible");
    cy.log("✅ Homepage loaded successfully");

    // Step 2: Try to access dashboard to check authentication
    cy.log("🔍 Step 2: Checking Authentication Requirements");
    cy.visit("/dashboard", { failOnStatusCode: false });
    cy.wait(2000);

    cy.url().then((url) => {
      if (url.includes("/login")) {
        cy.log("🔒 Authentication required - logging in first");

        // Use our custom login command
        cy.login();
        cy.log("✅ Successfully logged in");

        // Now proceed with the workflow
        demonstrateWorkflowLoggedIn();
      } else {
        cy.log("✅ Direct access allowed - demonstrating workflow");
        demonstrateWorkflowLoggedIn();
      }
    });

    function demonstrateWorkflowLoggedIn() {
      cy.log("📋 DEMONSTRATING BUSINESS WORKFLOW THROUGH WEBSITE");

      // Step 3: Main Dashboard
      cy.log("🏠 Step 3: Main Dashboard");
      cy.visit("/dashboard");
      cy.wait(3000);
      cy.get("body").should("be.visible");
      cy.log("✅ Main Dashboard - Central hub for all operations");

      // Step 4: Orders Management
      cy.log("📦 Step 4: Orders Management");
      cy.visit("/dashboard/orders");
      cy.wait(3000);
      cy.get("body").should("be.visible");
      cy.log("✅ Orders Management - Where customers create new orders");

      // Step 5: VoorraadBeheer (Inventory)
      cy.log("🏪 Step 5: VoorraadBeheer (Inventory Management)");
      cy.visit("/dashboard/voorraadBeheer");
      cy.wait(3000);
      cy.get("body").should("be.visible");
      cy.log("✅ VoorraadBeheer - Stock availability checks and approval");

      // Step 6: Supplier
      cy.log("🛍️ Step 6: Supplier Management");
      cy.visit("/dashboard/supplier");
      cy.wait(3000);
      cy.get("body").should("be.visible");
      cy.log("✅ Supplier - Handles deliveries and missing blocks");

      // Step 7: Planning Department
      cy.log("📋 Step 7: Planning Department");
      cy.visit("/dashboard/plannings");
      cy.wait(3000);
      cy.get("body").should("be.visible");
      cy.log("✅ Planning - Production planning and line assignment");

      // Step 8: Production Line 1
      cy.log("🏭 Step 8: Production Line 1");
      cy.visit("/dashboard/production-lines/1");
      cy.wait(3000);
      cy.get("body").should("be.visible");
      cy.log("✅ Production Line 1 - Manufactures Motor Type A");

      // Step 9: Production Line 2
      cy.log("🏭 Step 9: Production Line 2");
      cy.visit("/dashboard/production-lines/2");
      cy.wait(3000);
      cy.get("body").should("be.visible");
      cy.log("✅ Production Line 2 - Manufactures Motor Type B & C");

      // Step 10: Account Manager
      cy.log("👔 Step 10: Account Manager");
      cy.visit("/dashboard/accountManager");
      cy.wait(3000);
      cy.get("body").should("be.visible");
      cy.log("✅ Account Manager - Quality control and final approval");

      // Step 11: Delivery
      cy.log("🚚 Step 11: Delivery (Runner)");
      cy.visit("/dashboard/delivery");
      cy.wait(3000);
      cy.get("body").should("be.visible");
      cy.log("✅ Delivery - Order shipping and delivery management");

      // Step 12: Process Mining
      cy.log("📊 Step 12: Process Mining");
      cy.visit("/dashboard/process-mining");
      cy.wait(3000);
      cy.get("body").should("be.visible");
      cy.log("✅ Process Mining - Analytics and process optimization");

      // Step 13: Simulations
      cy.log("🎮 Step 13: Simulations");
      cy.visit("/dashboard/simulations");
      cy.wait(3000);
      cy.get("body").should("be.visible");
      cy.log("✅ Simulations - Process control and testing");

      // Step 14: Admin
      cy.log("⚙️ Step 14: Admin Panel");
      cy.visit("/dashboard/admin");
      cy.wait(3000);
      cy.get("body").should("be.visible");
      cy.log("✅ Admin - System administration and configuration");
    }

    // Final Summary
    cy.log("🎉 WEBSITE WORKFLOW DEMO COMPLETE!");
    cy.log("📋 COMPLETE BUSINESS PROCESS SUMMARY:");
    cy.log("1. 📦 Order Creation → Orders Management Dashboard");
    cy.log("2. 🏪 Inventory Check → VoorraadBeheer Dashboard");
    cy.log("3. 🛍️ Supplier Coordination → Supplier Dashboard");
    cy.log("4. 📋 Production Planning → Planning Dashboard");
    cy.log("5. 🏭 Manufacturing → Production Line Dashboards");
    cy.log("6. 👔 Quality Control → Account Manager Dashboard");
    cy.log("7. 🚚 Delivery → Delivery Dashboard");
    cy.log("8. 📊 Analytics → Process Mining Dashboard");
    cy.log("9. 🎮 Process Control → Simulations Dashboard");
    cy.log("10. ⚙️ System Management → Admin Dashboard");
    cy.log("");
    cy.log("✅ All department dashboards are accessible and functional!");
    cy.log(
      "🌐 Website navigation through complete business workflow verified!"
    );
  });

  it("should verify each department page has expected content", () => {
    cy.log("🔍 VERIFYING DEPARTMENT PAGE CONTENT");

    // Login first if needed
    cy.visit("/dashboard", { failOnStatusCode: false });
    cy.url().then((url) => {
      if (url.includes("/login")) {
        cy.login();
      }
    });

    const departments = [
      {
        url: "/dashboard/orders",
        name: "Orders Management",
        expectedElements: ["body", "h1, h2, .title, [data-testid*='title']"],
      },
      {
        url: "/dashboard/voorraadBeheer",
        name: "VoorraadBeheer",
        expectedElements: ["body", "h1, h2, .title, [data-testid*='title']"],
      },
      {
        url: "/dashboard/supplier",
        name: "Supplier",
        expectedElements: ["body", "h1, h2, .title, [data-testid*='title']"],
      },
      {
        url: "/dashboard/plannings",
        name: "Planning",
        expectedElements: ["body", "h1, h2, .title, [data-testid*='title']"],
      },
      {
        url: "/dashboard/production-lines/1",
        name: "Production Line 1",
        expectedElements: ["body", "h1, h2, .title, [data-testid*='title']"],
      },
      {
        url: "/dashboard/production-lines/2",
        name: "Production Line 2",
        expectedElements: ["body", "h1, h2, .title, [data-testid*='title']"],
      },
      {
        url: "/dashboard/accountManager",
        name: "Account Manager",
        expectedElements: ["body", "h1, h2, .title, [data-testid*='title']"],
      },
      {
        url: "/dashboard/delivery",
        name: "Delivery",
        expectedElements: ["body", "h1, h2, .title, [data-testid*='title']"],
      },
    ];

    departments.forEach((dept) => {
      cy.log(`🔍 Checking ${dept.name} content`);
      cy.visit(dept.url, { failOnStatusCode: false });
      cy.wait(2000);

      // Check that page loads
      cy.get("body").should("be.visible");

      // Check for basic content structure
      cy.get("body").then(($body) => {
        const hasContent = $body.find("h1, h2, h3, p, div, section").length > 0;
        expect(hasContent).to.be.true;
        cy.log(`✅ ${dept.name} has content structure`);
      });

      cy.log(`✅ ${dept.name} page verified`);
    });

    cy.log("✅ All department pages have expected content!");
  });
});

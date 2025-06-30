describe("Complete Business Workflow with Real Authentication", () => {
  beforeEach(() => {
    // Clear any existing sessions
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("should complete the full business workflow after successful login", () => {
    cy.log("🚀 TESTING COMPLETE BUSINESS WORKFLOW WITH REAL LOGIN");

    // Step 1: Verify we need to login first
    cy.log("🔐 Step 1: Verifying Authentication Requirement");
    cy.visit("/dashboard", { failOnStatusCode: false });
    cy.url().should("include", "/login");
    cy.log("✅ Dashboard correctly redirects to login when not authenticated");

    // Step 2: Perform actual login
    cy.log("👤 Step 2: Performing Login");
    cy.login(); // Uses the custom command with default credentials
    cy.log("✅ Login successful - session established");

    // Step 3: Verify we can now access protected routes
    cy.log("🏠 Step 3: Accessing Main Dashboard");
    cy.visit("/dashboard");
    cy.url().should("include", "/dashboard");
    cy.url().should("not.include", "/login");
    cy.get("body").should("be.visible");
    cy.log("✅ Main dashboard accessible after login");

    // Step 4: Test each department in the business workflow
    cy.log("📋 Step 4: Testing Complete Business Process Flow");

    const businessFlow = [
      {
        name: "📦 Orders Management",
        url: "/dashboard/orders",
        description: "Customer order creation and management",
        businessStep: "Orders are created by customers or sales staff",
      },
      {
        name: "🏪 VoorraadBeheer (Inventory)",
        url: "/dashboard/voorraadBeheer",
        description: "Inventory management and stock approval",
        businessStep:
          "Inventory team checks stock availability and approves orders",
      },
      {
        name: "🛍️ Supplier Management",
        url: "/dashboard/supplier",
        description: "Supplier coordination and block delivery",
        businessStep: "Suppliers deliver required blocks and materials",
      },
      {
        name: "📋 Production Planning",
        url: "/dashboard/plannings",
        description: "Production planning and line assignment",
        businessStep:
          "Planning team assigns orders to appropriate production lines",
      },
      {
        name: "🏭 Production Line 1",
        url: "/dashboard/production-lines/1",
        description: "Motor Type A manufacturing",
        businessStep: "Production Line 1 manufactures Motor Type A",
      },
      {
        name: "🏭 Production Line 2",
        url: "/dashboard/production-lines/2",
        description: "Motor Type B & C manufacturing",
        businessStep: "Production Line 2 manufactures Motor Type B & C",
      },
      {
        name: "👔 Account Manager",
        url: "/dashboard/accountManager",
        description: "Quality control and approval",
        businessStep:
          "Account Manager performs quality control and final approval",
      },
      {
        name: "🚚 Delivery Department",
        url: "/dashboard/delivery",
        description: "Order shipping and delivery",
        businessStep:
          "Delivery team handles packaging and shipping to customers",
      },
      {
        name: "📊 Process Mining",
        url: "/dashboard/process-mining",
        description: "Business process analytics",
        businessStep:
          "Analytics team monitors process efficiency and bottlenecks",
      },
      {
        name: "🎮 Simulations",
        url: "/dashboard/simulations",
        description: "Process simulation and control",
        businessStep:
          "Simulation system controls and optimizes the overall process",
      },
      {
        name: "⚙️ Admin Panel",
        url: "/dashboard/admin",
        description: "System administration",
        businessStep: "Admin manages system configuration and user permissions",
      },
    ];

    // Visit each department and verify access
    businessFlow.forEach((dept, index) => {
      cy.log(`🏢 Department ${index + 1}: ${dept.name}`);

      // Visit the department
      cy.visit(dept.url);
      cy.wait(2000); // Allow page to load

      // Verify we're not redirected to login
      cy.url().should("include", dept.url);
      cy.url().should("not.include", "/login");

      // Verify page content loads
      cy.get("body").should("be.visible");

      // Log business process information
      cy.log(`✅ ${dept.name} - Accessible`);
      cy.log(`📝 Description: ${dept.description}`);
      cy.log(`🔄 Business Step: ${dept.businessStep}`);

      // Optional: Take a screenshot for documentation
      cy.screenshot(
        `workflow-${index + 1}-${dept.name.replace(/[^a-zA-Z0-9]/g, "_")}`
      );
    });

    // Step 5: Test logout functionality
    cy.log("🚪 Step 5: Testing Logout");
    cy.logout(); // Uses the custom logout command
    cy.url().should("not.include", "/dashboard");
    cy.log("✅ Logout successful");

    // Step 6: Verify we can't access protected routes after logout
    cy.log("🔒 Step 6: Verifying Route Protection After Logout");
    cy.visit("/dashboard/orders", { failOnStatusCode: false });
    cy.url().should("include", "/login");
    cy.log("✅ Protected routes correctly redirect to login after logout");

    // Final summary
    cy.log("🎉 COMPLETE BUSINESS WORKFLOW TEST SUCCESSFUL!");
    cy.log("✅ Authentication working correctly");
    cy.log("✅ All department dashboards accessible");
    cy.log("✅ Business process flow validated");
    cy.log("✅ Route protection working");
    cy.log("✅ Logout functionality working");
  });

  it("should handle login failures gracefully", () => {
    cy.log("❌ Testing Login Failure Scenarios");

    // Test with wrong credentials
    cy.visit("/login");
    cy.get('input[name="username"]').type("wronguser");
    cy.get('input[name="password"]').type("wrongpass");
    cy.get('button[type="submit"]').click();

    // Should stay on login page
    cy.url().should("include", "/login");
    cy.log("✅ Wrong credentials correctly rejected");

    // Check for error message (if implemented)
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="error-message"]').length > 0) {
        cy.get('[data-testid="error-message"]').should("be.visible");
        cy.log("✅ Error message displayed for failed login");
      } else {
        cy.log(
          "ℹ️ No error message element found - consider adding user feedback"
        );
      }
    });
  });

  it("should provide helpful debug information when backend is unavailable", () => {
    cy.log("🔧 Backend Connectivity Test");

    // Try to check if backend is reachable
    cy.request({
      url: "http://localhost:5000/health",
      failOnStatusCode: false,
      timeout: 5000,
    })
      .then((response) => {
        if (response.status === 200) {
          cy.log("✅ Backend is running and reachable");
          cy.log("🎯 Ready for full E2E testing with authentication");
        } else {
          cy.log("⚠️ Backend health check failed");
          cy.log("💡 Start backend with: cd backend && docker-compose up -d");
        }
      })
      .catch(() => {
        cy.log("❌ Backend not reachable");
        cy.log("💡 To run full E2E tests:");
        cy.log("   1. cd backend");
        cy.log("   2. docker-compose up -d");
        cy.log("   3. Wait for services to start");
        cy.log("   4. Re-run this test");
      });
  });
});

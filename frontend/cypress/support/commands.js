// ***********************************************
// Custom commands for ERPNumber1 E2E testing
// ***********************************************

// Authentication Commands
Cypress.Commands.add(
  "login",
  (username = "test", password = "Qwerty01234567?!") => {
    cy.session([username, password], () => {
      cy.visit("/login");
      cy.get('input[name="username"]').type(username);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"]').click();
      cy.url().should("include", "/dashboard");
      cy.window().its("localStorage.token").should("exist");
    });
  }
);

Cypress.Commands.add("register", (userData = {}) => {
  const defaultUser = {
    name: "Test User",
    email: "test@example.com",
    password: "testpass123",
    role: "User",
  };
  const user = { ...defaultUser, ...userData };

  cy.visit("/register");
  cy.get('input[name="name"]').type(user.name);
  cy.get('input[name="email"]').type(user.email);
  cy.get('input[name="password"]').type(user.password);
  cy.get('select[name="role"]').select(user.role);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add("logout", () => {
  cy.get('[data-testid="logout-button"]', { timeout: 10000 })
    .should("be.visible")
    .click();
  cy.url().should("not.include", "/dashboard");
  cy.window().its("localStorage.token").should("not.exist");
});

// Simulation Commands
Cypress.Commands.add("createSimulation", (name = "Test Simulation") => {
  cy.visit("/dashboard/simulations");
  cy.get('[data-testid="create-simulation-button"]').click();
  cy.get('input[name="name"]').type(name);
  cy.get('button[type="submit"]').click();
  cy.contains("Simulation created successfully").should("be.visible");
});

Cypress.Commands.add("startSimulation", (simulationId = 1) => {
  cy.request("POST", `/api/Simulations/${simulationId}/run`).then(
    (response) => {
      expect(response.status).to.eq(200);
    }
  );
});

Cypress.Commands.add("stopSimulation", (simulationId = 1) => {
  cy.request("POST", `/api/Simulations/${simulationId}/stop`).then(
    (response) => {
      expect(response.status).to.eq(200);
    }
  );
});

Cypress.Commands.add(
  "waitForSimulationRound",
  (roundNumber = 1, timeout = 30000) => {
    cy.get('[data-testid="current-round"]', { timeout }).should(
      "contain",
      `Round ${roundNumber}`
    );
  }
);

// Order Commands
Cypress.Commands.add("createOrder", (orderData = {}) => {
  const defaultOrder = {
    motorType: "A",
    quantity: 5,
    customer: "yes",
  };
  const order = { ...defaultOrder, ...orderData };

  cy.visit("/dashboard/orders");
  cy.get('[data-testid="create-order-button"]').click();
  cy.get('select[name="motorType"]').select(order.motorType);
  cy.get('input[name="quantity"]').clear().type(order.quantity.toString());
  cy.get('select[name="customer"]').select(order.customer);
  cy.get('button[type="submit"]').click();
  cy.contains("Order created successfully").should("be.visible");
});

Cypress.Commands.add("approveOrder", (orderId) => {
  cy.request("PATCH", `/api/Order/${orderId}/approve`).then((response) => {
    expect(response.status).to.eq(200);
  });
});

Cypress.Commands.add("checkOrderStatus", (orderId, expectedStatus) => {
  cy.request("GET", `/api/Order/${orderId}`).then((response) => {
    expect(response.body.status).to.eq(expectedStatus);
  });
});

// Navigation Commands
Cypress.Commands.add("navigateToDashboard", (dashboardType = "main") => {
  const dashboardRoutes = {
    main: "/dashboard",
    orders: "/dashboard/orders",
    simulations: "/dashboard/simulations",
    accountManager: "/dashboard/accountManager",
    supplier: "/dashboard/supplier",
    admin: "/dashboard/admin",
  };

  cy.visit(dashboardRoutes[dashboardType]);
  cy.url().should("include", dashboardRoutes[dashboardType]);
});

Cypress.Commands.add("waitForPageLoad", () => {
  cy.get('[data-testid="loading"]').should("not.exist");
  cy.get("body").should("be.visible");
});

// Utility Commands
Cypress.Commands.add("clearTestData", () => {
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
});

Cypress.Commands.add(
  "mockApiResponse",
  (method, url, response, statusCode = 200) => {
    cy.intercept(method, url, {
      statusCode,
      body: response,
    }).as("mockedRequest");
  }
);

// Real-time Commands
Cypress.Commands.add("waitForSignalRUpdate", (eventName, timeout = 10000) => {
  cy.window({ timeout }).its("signalRConnection").should("exist");
  // Wait for specific SignalR event
  cy.wait(1000); // Allow time for real-time updates
});

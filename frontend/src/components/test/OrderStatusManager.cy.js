import React from "react";
import OrderStatusManager from "../OrderStatusManager";

// Mock the API module
beforeEach(() => {
  // Intercept API calls and provide mock responses
  cy.intercept("PATCH", "/api/Order/*/approve", { statusCode: 200 }).as(
    "approveOrder"
  );
  cy.intercept("PATCH", "/api/Order/*/reject", { statusCode: 200 }).as(
    "rejectOrder"
  );
  cy.intercept("PATCH", "/api/Order/*/status", { statusCode: 200 }).as(
    "updateStatus"
  );
});

describe("<OrderStatusManager />", () => {
  const mockOrder = {
    id: 123,
    status: "Pending",
  };
  it("renders correctly with basic order", () => {
    cy.mount(<OrderStatusManager order={mockOrder} />);

    // Should show status badge and dropdown
    cy.contains("span", "Pending").should("be.visible");
    cy.get("select").should("be.visible").should("have.value", "Pending");
  });

  it("shows approve/reject buttons for awaiting approval status", () => {
    const awaitingOrder = {
      ...mockOrder,
      status: "AwaitingAccountManagerApproval",
    };

    cy.mount(<OrderStatusManager order={awaitingOrder} />);

    // Should show approve and reject buttons
    cy.contains("button", "Approve")
      .should("be.visible")
      .should("not.be.disabled");
    cy.contains("button", "Reject")
      .should("be.visible")
      .should("not.be.disabled");

    // Should not show dropdown
    cy.get("select").should("not.exist");
  });

  it("handles approve action successfully", () => {
    const awaitingOrder = {
      ...mockOrder,
      status: "AwaitingAccountManagerApproval",
    };
    const onStatusUpdate = cy.stub().as("onStatusUpdate");

    cy.mount(
      <OrderStatusManager
        order={awaitingOrder}
        onStatusUpdate={onStatusUpdate}
      />
    );

    cy.contains("button", "Approve").click();

    // Verify API call was made
    cy.wait("@approveOrder").then((interception) => {
      expect(interception.request.url).to.include("/api/Order/123/approve");
    });

    // Verify callback was called
    cy.get("@onStatusUpdate").should(
      "have.been.calledWith",
      123,
      "ApprovedByAccountManager"
    );
  });

  it("handles reject action successfully", () => {
    const awaitingOrder = {
      ...mockOrder,
      status: "AwaitingAccountManagerApproval",
    };
    const onStatusUpdate = cy.stub().as("onStatusUpdate");

    cy.mount(
      <OrderStatusManager
        order={awaitingOrder}
        onStatusUpdate={onStatusUpdate}
      />
    );

    cy.contains("button", "Reject").click();

    // Verify API call was made
    cy.wait("@rejectOrder").then((interception) => {
      expect(interception.request.url).to.include("/api/Order/123/reject");
    });

    // Verify callback was called
    cy.get("@onStatusUpdate").should(
      "have.been.calledWith",
      123,
      "RejectedByAccountManager"
    );
  });

  it("shows loading state during approve/reject actions", () => {
    const awaitingOrder = {
      ...mockOrder,
      status: "AwaitingAccountManagerApproval",
    };

    // Make API call take some time
    cy.intercept("PATCH", "/api/Order/*/approve", {
      statusCode: 200,
      delay: 1000,
    }).as("slowApprove");

    cy.mount(<OrderStatusManager order={awaitingOrder} />);

    cy.contains("button", "Approve").click();
    // Should show loading spinner and disable buttons
    cy.get(".animate-spin").should("be.visible");
    cy.contains("button", "Approve").should("be.disabled");
    cy.contains("button", "Reject").should("be.disabled");
  });

  it("handles status change via dropdown", () => {
    const onStatusUpdate = cy.stub().as("onStatusUpdate");

    cy.mount(
      <OrderStatusManager order={mockOrder} onStatusUpdate={onStatusUpdate} />
    );

    cy.get("select").select("InProduction");

    // Verify API call was made
    cy.wait("@updateStatus").then((interception) => {
      expect(interception.request.url).to.include("/api/Order/123/status");
      expect(interception.request.body).to.deep.equal({
        status: "InProduction",
      });
    });

    // Verify callback was called
    cy.get("@onStatusUpdate").should(
      "have.been.calledWith",
      123,
      "InProduction"
    );
  });

  it("shows loading state during status change", () => {
    // Make API call take some time
    cy.intercept("PATCH", "/api/Order/*/status", {
      statusCode: 200,
      delay: 1000,
    }).as("slowStatusUpdate");

    cy.mount(<OrderStatusManager order={mockOrder} />);

    cy.get("select").select("InProduction");
    // Should show loading spinner and disable dropdown
    cy.get(".animate-spin").should("be.visible");
    cy.get("select").should("be.disabled");
  });

  it("handles API errors gracefully for approve action", () => {
    const awaitingOrder = {
      ...mockOrder,
      status: "AwaitingAccountManagerApproval",
    };

    // Mock API to return error
    cy.intercept("PATCH", "/api/Order/*/approve", {
      statusCode: 500,
      body: { message: "Server Error" },
    }).as("approveError");

    // Stub window.alert to capture error messages
    cy.window().then((win) => {
      cy.stub(win, "alert").as("alert");
    });

    cy.mount(<OrderStatusManager order={awaitingOrder} />);

    cy.contains("button", "Approve").click();

    cy.wait("@approveError");
    cy.get("@alert").should(
      "have.been.calledWith",
      "Failed to approve order. Please try again."
    );
    // Should not be in loading state after error
    cy.get(".animate-spin").should("not.exist");
    cy.contains("button", "Approve").should("not.be.disabled");
  });

  it("handles API errors gracefully for reject action", () => {
    const awaitingOrder = {
      ...mockOrder,
      status: "AwaitingAccountManagerApproval",
    };

    cy.intercept("PATCH", "/api/Order/*/reject", {
      statusCode: 500,
      body: { message: "Server Error" },
    }).as("rejectError");

    cy.window().then((win) => {
      cy.stub(win, "alert").as("alert");
    });

    cy.mount(<OrderStatusManager order={awaitingOrder} />);

    cy.contains("button", "Reject").click();

    cy.wait("@rejectError");
    cy.get("@alert").should(
      "have.been.calledWith",
      "Failed to reject order. Please try again."
    );
  });

  it("handles API errors gracefully for status change", () => {
    cy.intercept("PATCH", "/api/Order/*/status", {
      statusCode: 500,
      body: { message: "Server Error" },
    }).as("statusError");

    cy.window().then((win) => {
      cy.stub(win, "alert").as("alert");
    });

    cy.mount(<OrderStatusManager order={mockOrder} />);

    cy.get("select").select("InProduction");

    cy.wait("@statusError");
    cy.get("@alert").should(
      "have.been.calledWith",
      "Failed to update status. Please try again."
    );
  });

  it("works without onStatusUpdate callback", () => {
    const awaitingOrder = {
      ...mockOrder,
      status: "AwaitingAccountManagerApproval",
    };

    // Should not throw error when onStatusUpdate is not provided
    cy.mount(<OrderStatusManager order={awaitingOrder} />);

    cy.contains("button", "Approve").click();

    cy.wait("@approveOrder");
    // Test passes if no errors are thrown
  });

  it("handles different order statuses correctly", () => {
    const statuses = [
      "Pending",
      "InProduction",
      "ApprovedByAccountManager",
      "RejectedByAccountManager",
      "Delivered",
      "Completed",
      "Cancelled",
    ];

    statuses.forEach((status) => {
      const testOrder = { ...mockOrder, status };

      cy.mount(<OrderStatusManager order={testOrder} />);

      if (status === "AwaitingAccountManagerApproval") {
        cy.contains("button", "Approve").should("exist");
        cy.contains("button", "Reject").should("exist");
        cy.get("select").should("not.exist");
      } else {
        cy.get("select").should("exist").should("have.value", status);
        cy.contains("button", "Approve").should("not.exist");
        cy.contains("button", "Reject").should("not.exist");
      }
    });
  });

  it("handles order without status (defaults to Pending)", () => {
    const orderWithoutStatus = { id: 123 };

    cy.mount(<OrderStatusManager order={orderWithoutStatus} />);

    cy.get("select").should("have.value", "Pending");
  });

  it("applies correct CSS classes", () => {
    const awaitingOrder = {
      ...mockOrder,
      status: "AwaitingAccountManagerApproval",
    };

    cy.mount(<OrderStatusManager order={awaitingOrder} />);

    cy.contains("button", "Approve")
      .should("have.class", "bg-green-600")
      .should("have.class", "hover:bg-green-700");

    cy.contains("button", "Reject")
      .should("have.class", "bg-red-600")
      .should("have.class", "hover:bg-red-700");
  });

  it("maintains accessibility standards", () => {
    const awaitingOrder = {
      ...mockOrder,
      status: "AwaitingAccountManagerApproval",
    };

    cy.mount(<OrderStatusManager order={awaitingOrder} />);

    // Buttons should be accessible
    cy.contains("button", "Approve")
      .should("be.visible")
      .should("not.have.attr", "aria-disabled", "true");

    cy.contains("button", "Reject")
      .should("be.visible")
      .should("not.have.attr", "aria-disabled", "true");
  });
  it("supports keyboard navigation", () => {
    cy.mount(<OrderStatusManager order={mockOrder} />);

    // Dropdown should be keyboard navigable
    cy.get("select").focus().should("be.focused").select("InProduction");

    // Wait for the API call to complete
    cy.wait("@updateStatus").then((interception) => {
      expect(interception.request.body).to.deep.equal({
        status: "InProduction",
      });
    });
  });

  it("displays StatusBadge with correct status", () => {
    const testStatuses = [
      "Pending",
      "ToProduction",
      "InProduction",
      "AwaitingAccountManagerApproval",
      "ApprovedByAccountManager",
      "RejectedByAccountManager",
      "Delivered",
      "Completed",
      "Cancelled",
    ];

    testStatuses.forEach((status) => {
      const testOrder = { ...mockOrder, status };

      cy.mount(<OrderStatusManager order={testOrder} />);

      // Should render StatusBadge component with correct status
      cy.get(
        'span[class*="inline-flex items-center px-2.5 py-0.5 rounded-full"]'
      )
        .should("be.visible")
        .should(
          "contain.text",
          status
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim()
        );
    });
  });

  it("shows correct icons in approve/reject buttons", () => {
    const awaitingOrder = {
      ...mockOrder,
      status: "AwaitingAccountManagerApproval",
    };

    cy.mount(<OrderStatusManager order={awaitingOrder} />);

    // Should show CheckCircle icon in Approve button
    cy.contains("button", "Approve").find("svg").should("be.visible");

    // Should show XCircle icon in Reject button
    cy.contains("button", "Reject").find("svg").should("be.visible");
  });

  it("shows animated Clock icon during loading states", () => {
    const awaitingOrder = {
      ...mockOrder,
      status: "AwaitingAccountManagerApproval",
    };

    // Make API call take some time
    cy.intercept("PATCH", "/api/Order/*/approve", {
      statusCode: 200,
      delay: 1000,
    }).as("slowApprove");

    cy.mount(<OrderStatusManager order={awaitingOrder} />);

    cy.contains("button", "Approve").click();

    // Should show Clock icon with animation
    cy.get("svg")
      .should("have.class", "animate-spin")
      .should("have.class", "h-4")
      .should("have.class", "w-4")
      .should("have.class", "text-blue-500");
  });

  it("includes ToProduction status in dropdown options", () => {
    cy.mount(<OrderStatusManager order={mockOrder} />);

    // Should have ToProduction as an option
    cy.get('select option[value="ToProduction"]')
      .should("exist")
      .should("contain.text", "To Production");
  });

  it("handles ToProduction status selection correctly", () => {
    const onStatusUpdate = cy.stub().as("onStatusUpdate");

    cy.mount(
      <OrderStatusManager order={mockOrder} onStatusUpdate={onStatusUpdate} />
    );

    cy.get("select").select("ToProduction");

    // Verify API call was made with correct status
    cy.wait("@updateStatus").then((interception) => {
      expect(interception.request.url).to.include("/api/Order/123/status");
      expect(interception.request.body).to.deep.equal({
        status: "ToProduction",
      });
    });

    // Verify callback was called
    cy.get("@onStatusUpdate").should(
      "have.been.calledWith",
      123,
      "ToProduction"
    );
  });

  it("StatusBadge displays with proper styling and formatting", () => {
    const testOrder = {
      ...mockOrder,
      status: "AwaitingAccountManagerApproval",
    };

    cy.mount(<OrderStatusManager order={testOrder} />);

    // Should format CamelCase properly
    cy.get('span[class*="inline-flex items-center px-2.5 py-0.5 rounded-full"]')
      .should("contain.text", "Awaiting Account Manager Approval")
      .should("have.class", "text-xs")
      .should("have.class", "font-medium");
  });

  it("verifies all dropdown options are present and correctly labeled", () => {
    cy.mount(<OrderStatusManager order={mockOrder} />);

    const expectedOptions = [
      { value: "Pending", text: "Pending" },
      { value: "ToProduction", text: "To Production" },
      { value: "InProduction", text: "In Production" },
      { value: "AwaitingAccountManagerApproval", text: "Awaiting Approval" },
      { value: "ApprovedByAccountManager", text: "Approved" },
      { value: "RejectedByAccountManager", text: "Rejected" },
      { value: "Delivered", text: "Delivered" },
      { value: "Completed", text: "Completed" },
      { value: "Cancelled", text: "Cancelled" },
    ];

    expectedOptions.forEach((option) => {
      cy.get(`select option[value="${option.value}"]`)
        .should("exist")
        .should("contain.text", option.text);
    });
  });
});

# Frontend Documentation

Welcome to the ERPNumber1 Next.js frontend documentation! This frontend provides a comprehensive user interface for managing orders, production lines, inventory, and business process analytics.

## 🏗️ Frontend Architecture

The frontend is built with modern React technologies and provides a responsive, real-time interface for all business departments.

### Technology Stack

- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context and hooks
- **Real-time Communication**: SignalR/WebSocket integration
- **Testing**: Cypress for E2E and component testing
- **Development**: Hot reloading with fast refresh

## 📖 Documentation Structure

### Setup and Development

- **[Getting Started Guide](./setup/getting-started.md)** - Quick setup for local development
- **[Development Environment](./setup/)** - IDE configuration and tooling

### Testing and Quality Assurance

- **[Testing Guide](./test/README.md)** - Comprehensive E2E and component testing
  - Complete E2E test suite with 22 tests across 6 files
  - Authentication and login flow testing
  - Business workflow validation
  - Visual website navigation testing
  - API integration and health checks

### Features and Modules

- **[Process Mining Interface](./proces-mining/process-mining-frontend.md)** - Analytics and reporting
- **[Simulations](./simulations/README.md)** - Process control and testing interface

## 🚀 Quick Start

1. **Install Dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   ```

3. **Access Application**

   - Main Application: http://localhost:3000
   - Dashboard: http://localhost:3000/dashboard (requires authentication)

4. **Run Tests**

   ```bash
   # Run all E2E tests
   npm run cypress:run

   # Open interactive test runner
   npm run cypress:open
   ```

## 🏢 Business Departments

The frontend provides dedicated dashboards for each business department:

| Department            | URL                             | Purpose                                    |
| --------------------- | ------------------------------- | ------------------------------------------ |
| **Orders Management** | `/dashboard/orders`             | Customer order creation and management     |
| **VoorraadBeheer**    | `/dashboard/voorraadBeheer`     | Inventory management and stock approval    |
| **Supplier**          | `/dashboard/supplier`           | Supply chain and missing blocks management |
| **Planning**          | `/dashboard/plannings`          | Production planning and line assignment    |
| **Production Line 1** | `/dashboard/production-lines/1` | Motor Type A manufacturing                 |
| **Production Line 2** | `/dashboard/production-lines/2` | Motor Type B & C manufacturing             |
| **Account Manager**   | `/dashboard/accountManager`     | Quality control and approval               |
| **Delivery**          | `/dashboard/delivery`           | Shipping and delivery management           |
| **Process Mining**    | `/dashboard/process-mining`     | Analytics and process optimization         |
| **Simulations**       | `/dashboard/simulations`        | Process control and testing                |
| **Admin**             | `/dashboard/admin`              | System administration                      |

## 🔧 Development Features

- **Hot Reloading**: Instant updates during development
- **TypeScript Support**: Type-safe component development
- **Responsive Design**: Mobile-first responsive layout
- **Component Library**: Reusable UI components
- **Real-time Updates**: Live data synchronization
- **Authentication**: Secure login and session management

## 📊 Business Process Flow

The frontend supports the complete business process:

1. **Order Creation** → Customer places orders
2. **Inventory Check** → VoorraadBeheer approves stock
3. **Supplier Coordination** → Handle missing components
4. **Production Planning** → Assign to production lines
5. **Manufacturing** → Production line execution
6. **Quality Control** → Account manager approval
7. **Delivery** → Shipping and completion
8. **Analytics** → Process mining and optimization

## 🧪 Testing Coverage

- ✅ **22 E2E Tests** across 6 comprehensive test files
- ✅ **Authentication Testing** with real login flows
- ✅ **Business Workflow Testing** complete order lifecycle
- ✅ **Visual Navigation Testing** all department dashboards
- ✅ **API Integration Testing** backend connectivity
- ✅ **System Health Testing** application reliability

## 🔗 Related Documentation

- [Backend API Documentation](../backend/README.md)
- [Infrastructure Documentation](../infra/README.md)
- [Contributing Guidelines](../contributing/README.md)

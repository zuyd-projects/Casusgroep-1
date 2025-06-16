# ERPNumber1 Backend Documentation

Welcome to the ERPNumber1 Backend documentation. This directory contains comprehensive guides and documentation for the ERP system backend.

## 📚 Documentation Overview

### Quick Start

- **[Getting Started Guide](setup/getting-started.md)** - Complete setup instructions for Docker and local development

### Features & Modules

- **[Process Mining System](process-mining/README.md)** - Event logging, process discovery, and analytics
- **[Controller Integration Examples](process-mining/examples/controller-integration.md)** - Detailed integration patterns

## 🏗️ System Architecture

ERPNumber1 is a comprehensive ERP (Enterprise Resource Planning) system built with ASP.NET Core and designed for modern business process management.

### Core Components

#### API Controllers

- **Orders** - Order lifecycle management and processing
- **Inventory** - Stock management and material tracking
- **Products** - Product catalog and specifications
- **Materials** - Raw materials and components management
- **Suppliers** - Supplier order management
- **Deliveries** - Shipping and delivery tracking
- **Simulations** - Production simulation and planning
- **Rounds** - Production round execution
- **Statistics** - Business analytics and reporting
- **Users** - User management and authentication
- **Process Mining** - Event logging and process analytics

#### Key Features

- **JWT Authentication** - Secure API access with token-based authentication
- **Process Mining** - Comprehensive event logging for business process analysis
- **Real-time Analytics** - Statistics and performance monitoring
- **Docker Support** - Containerized deployment with SQL Server
- **CORS Configuration** - Frontend integration support
- **Entity Framework Core** - Modern ORM with migrations
- **Swagger Documentation** - Auto-generated API documentation

### Technology Stack

- **Framework**: ASP.NET Core 9.0
- **Database**: SQL Server (Azure SQL Edge for development)
- **ORM**: Entity Framework Core
- **Authentication**: JWT Bearer tokens with ASP.NET Identity
- **Containerization**: Docker & Docker Compose
- **Documentation**: Swagger/OpenAPI

## 🚀 Getting Started

### Prerequisites

- Docker Desktop 4.0+
- .NET 9.0 SDK (for local development)
- Git

### Quick Setup

1. **Clone and Start (Docker)**

   ```bash
   git clone <repository-url>
   cd backend
   docker-compose up --build
   ```

2. **Access the System**

   - API: <http://localhost:8080>
   - Swagger UI: <http://localhost:8080/swagger>
   - Database: localhost:1433

For detailed setup instructions, see the [Getting Started Guide](setup/getting-started.md).

## 📖 API Documentation

### Authentication

The system uses JWT bearer token authentication. All endpoints (except authentication) require a valid JWT token in the Authorization header.

### Available Endpoints

#### Core Business Operations

- `/api/orders` - Order management
- `/api/inventory` - Inventory operations
- `/api/products` - Product catalog
- `/api/materials` - Materials management
- `/api/supplierorder` - Supplier interactions
- `/api/delivery` - Delivery tracking

#### Production & Planning

- `/api/simulations` - Production simulations
- `/api/rounds` - Production rounds
- `/api/statistics` - Analytics and reporting

#### System & Monitoring

- `/api/users` - User management
- `/api/processmining` - Process analytics and event logs

### Swagger Documentation

When running the system, visit `/swagger` for interactive API documentation with:

- Endpoint descriptions
- Request/response schemas
- Authentication setup
- Try-it-out functionality

## 🔍 Process Mining & Analytics

The system includes comprehensive process mining capabilities for business process analysis:

- **Automatic Event Logging** - All business operations are automatically tracked
- **Process Discovery** - Identify actual business processes from event data
- **Performance Analytics** - Monitor process performance and bottlenecks
- **XES Export** - Export data for external process mining tools (ProM, Celonis, Disco)
- **Real-time Monitoring** - Live process statistics and analytics

Learn more in the [Process Mining Documentation](process-mining/README.md).

## 🏢 Business Domain

ERPNumber1 manages the complete lifecycle of a manufacturing business:

### Order-to-Cash Process

1. Customer order creation and management
2. Inventory allocation and checking
3. Production planning via simulations
4. Manufacturing execution through rounds
5. Delivery scheduling and tracking
6. Order completion and analytics

### Procure-to-Pay Process

1. Material requirements planning
2. Supplier order creation
3. Delivery receipt and inventory updates
4. Payment processing and supplier management

### Production Planning

- Simulation-based production planning
- Resource optimization
- Round-based execution
- Performance monitoring and statistics

## 🔧 Development Guide

### Database Management

- **Migrations**: Entity Framework Core migrations for schema management
- **Seeding**: Automated data seeding for development
- **Health Checks**: Built-in database connectivity monitoring

### Code Organization

```text
ERPNumber1/
├── Controllers/     # API endpoints
├── Models/         # Data models and entities
├── Services/       # Business logic services
├── Data/          # Database context and configuration
├── Interfaces/    # Service contracts
├── Extensions/    # Utility extensions
├── Attributes/    # Custom attributes (e.g., LogEvent)
├── Dtos/          # Data transfer objects
└── Migrations/    # Database migrations
```

### Adding New Features

1. **Model Creation** - Define entity in `Models/`
2. **Database Migration** - Create and apply EF migration
3. **Controller Implementation** - Add API endpoints
4. **Service Layer** - Implement business logic
5. **Process Mining Integration** - Add event logging
6. **Documentation** - Update relevant docs

## 🐳 Docker Configuration

The system includes production-ready Docker configuration:

- **Multi-stage builds** for optimized container size
- **Health checks** for service monitoring
- **Volume persistence** for data retention
- **Environment configuration** for flexible deployment
- **SQL Server container** for complete development environment

## 📊 Monitoring & Observability

### Built-in Monitoring

- **Health Check endpoints** for service status
- **Structured logging** with configurable levels
- **Process event tracking** via Process Mining system
- **Performance metrics** through Statistics controller

### Process Analytics

- Real-time process monitoring
- Historical trend analysis
- Bottleneck identification
- Compliance checking
- Performance optimization insights

## 🤝 Contributing

### Development Workflow

1. Follow the setup guide to get the development environment running
2. Create feature branches for new development
3. Implement features with proper event logging
4. Add/update documentation as needed
5. Test with Docker environment before committing

### Documentation Standards

- Keep documentation current with code changes
- Include examples for complex features
- Document API changes in Swagger annotations
- Update process mining integration for new business processes

## 📝 Additional Resources

- **[Controller Integration Examples](process-mining/examples/controller-integration.md)** - Detailed code examples
- **Swagger UI** - Interactive API documentation (available when running)
- **Docker Logs** - `docker-compose logs` for troubleshooting
- **Database Migrations** - `dotnet ef migrations` for schema changes

## 🆘 Support & Troubleshooting

### Common Issues

- **Port conflicts**: Ensure ports 8080 and 1433 are available
- **Docker issues**: Restart Docker Desktop and run `docker-compose down && docker-compose up --build`
- **Database connection**: Check connection string in `appsettings.json`
- **Authentication**: Verify JWT configuration and token validity

### Getting Help

- Check the [Getting Started Guide](setup/getting-started.md) for setup issues
- Review Docker logs for runtime errors
- Consult Swagger documentation for API usage
- Check Process Mining logs for event tracking issues

---

*This documentation is maintained alongside the codebase. For updates or improvements, please contribute to the docs/ directory.*

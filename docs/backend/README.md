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
- **Supplier Orders** - Supplier order management
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
- **Testing**: xUnit with integration tests

## 🚀 Getting Started

### Prerequisites

- Docker Desktop 4.0+
- .NET 9.0 SDK (for local development)
- Git

### Quick Setup

1. **Clone and Start (Docker)**

   ```bash
   git clone <repository-url>
   cd Casusgroep-1
   docker-compose up --build
   ```

2. **Access the System**

   - API: <http://localhost:8080>
   - Swagger UI: <http://localhost:8080/swagger>
   - Database: localhost:1433
   - Frontend (via proxy): <http://localhost:80>

For detailed setup instructions, see the [Getting Started Guide](setup/getting-started.md).

## 📖 API Documentation

### Authentication

The system uses JWT bearer token authentication. All endpoints (except authentication) require a valid JWT token in the Authorization header.

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
- **Real-time Monitoring** - Live process statistics and analytics

Learn more in the [Process Mining Documentation](process-mining/README.md).

## 🔧 Development Guide

### Database Management

- **Migrations**: Entity Framework Core migrations for schema management
- **Seeding**: Automated data seeding for development
- **Health Checks**: Built-in database connectivity monitoring

### Testing

The project includes comprehensive testing infrastructure:

- **Unit Tests**: Individual component testing
- **Integration Tests**: Full API and database integration testing
- **Custom Test Factory**: `CustomWebApplicationFactory` for isolated test environments
- **Test Database**: Separate test configuration with `appsettings.Testing.json`

Run tests with: `dotnet test` or use the provided `run-tests.sh` script.

### Code Organization

```plaintext
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
- **Health checks** for database monitoring
- **Volume persistence** for data retention
- **Environment configuration** for flexible deployment
- **Azure SQL Edge container** for complete development environment
- **Nginx reverse proxy** for load balancing and routing

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
- Performance optimization insights
xwxwww
## 🛠️ Development & Contributing

### Contributing Guidelines

Before contributing to the backend, please review the project-wide contributing guidelines:

- **[Contributing Overview](../contributing/README.md)** - Main contributing guide and project standards
- **[Commit Guidelines](../contributing/commits.md)** - Conventional commit standards and examples
- **[Branching & Pull Requests](../contributing/branching.md)** - Branch naming and review process
- **[Code Comments](../contributing/comments.md)** - Comment standards and conventions

### Backend-Specific Development Workflow

1. Follow the setup guide to get the development environment running
2. Create feature branches following our [branching conventions](../contributing/branching.md)
3. Implement features with proper event logging
4. Add/update tests for new functionality
5. Follow our [commit message standards](../contributing/commits.md)
6. Update documentation as needed
7. Test with Docker environment before committing

### Backend Code Standards

In addition to the project-wide [code comment standards](../contributing/comments.md), follow these backend-specific guidelines:

- **API Design**: Follow RESTful conventions and consistent naming
- **Error Handling**: Use proper exception handling and return appropriate HTTP status codes
- **Logging**: Include structured logging for debugging and monitoring
- **XML Documentation**: Add comprehensive XML documentation for public APIs
- **Process Mining**: Implement event logging for new business processes using the `LogEvent` attribute
- **Testing**: Write both unit and integration tests for new features
- **Entity Framework**: Follow EF Core best practices for data access
- **Authentication**: Ensure proper JWT token validation for protected endpoints

## 📝 Additional Resources

- **[Controller Integration Examples](process-mining/examples/controller-integration.md)** - Detailed code examples
- **Swagger UI** - Interactive API documentation (available when running)
- **Docker Logs** - `docker-compose logs` for troubleshooting
- **Database Migrations** - `dotnet ef migrations` for schema changes

## 🆘 Support & Troubleshooting

### Common Issues

- **Port conflicts**: Ensure ports 80, 8080, and 1433 are available
- **Docker issues**: Restart Docker Desktop and run `docker-compose down && docker-compose up --build`
- **Database connection**: Check connection string in `appsettings.json` or environment variables
- **Authentication**: Verify JWT configuration and token validity
- **CORS errors**: Ensure frontend URL is configured in CORS policy

### Getting Help

- Check the [Getting Started Guide](setup/getting-started.md) for setup issues
- Review Docker logs for runtime errors
- Consult Swagger documentation for API usage
- Check Process Mining logs for event tracking issues

---

*This documentation is maintained alongside the codebase. For updates or improvements, please contribute to the docs/ directory.*

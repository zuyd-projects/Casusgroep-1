# Casusgroep-1 Documentation

🤖 **Welcome to the Casusgroep-1 project documentation!**

This monorepo contains a comprehensive DevOps/BPA solution with a modern tech stack and infrastructure setup.

## 🏗️ Project Overview

Casusgroep-1 is a full-stack application designed for business process automation with a focus on modern DevOps practices, scalability, and maintainability.

### Architecture

- **Frontend**: Next.js with React and Tailwind CSS
- **Backend**: .NET Core API with Entity Framework
- **Database**: SQL Server with automated migrations
- **Infrastructure**: Azure-based deployment with Terraform
- **Containerization**: Docker with multi-stage builds
- **Reverse Proxy**: Nginx for load balancing and SSL termination

## 📖 Documentation Structure

### Development Guides

- **[Backend Documentation](./backend/)** - API development, database setup, and testing
  - [Setup Guide](./backend/setup/getting-started.md) - Installation and configuration
  - [API Usage Guide](./backend/api-usage/README.md) - Entity relationships and DTOs
  - [Process Mining](./backend/process-mining/README.md) - Event logging and analytics
  - [Testing Guide](./backend/test/README.md) - Unit and integration testing

- **[Frontend Documentation](./frontend/)** - React components, styling, and user interface
  - [Component Library](./frontend/components/) - Reusable UI components
  - [Styling Guide](./frontend/styles/) - Design system and CSS standards

- **[Infrastructure Documentation](./infra/)** - Deployment, cloud resources, and DevOps
  - [Terraform Setup](./infra/terraform/) - Infrastructure as code
  - [Docker Configuration](./infra/docker/) - Container deployment

### Contributing

- **[Contributing Guidelines](./contributing/)** - Code standards, commit guidelines, and review process
  - [Commit Standards](./contributing/commits.md) - Conventional commit guidelines
  - [Branching Strategy](./contributing/branching.md) - Workflow and pull requests
  - [Code Comments](./contributing/comments.md) - Comment conventions

## 🚀 Quick Start

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd Casusgroep-1
   ```

2. **Development Setup**
   - Follow the [Backend Setup Guide](./backend/setup/getting-started.md)
   - Review the [Frontend README](./frontend/README.md)
   - Check [Infrastructure Setup](./infra/README.md) for deployment

3. **Contributing**
   - Read the [Contributing Guidelines](./contributing/README.md)
   - Follow our [Commit Standards](./contributing/commits.md)
   - Understand our [Branching Strategy](./contributing/branching.md)

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **Authentication**: JWT-based auth system

### Backend

- **Framework**: .NET Core
- **Database**: Entity Framework Core with SQL Server
- **Testing**: xUnit with integration tests
- **API Documentation**: OpenAPI/Swagger

### Infrastructure

- **Cloud Provider**: Microsoft Azure
- **Infrastructure as Code**: Terraform
- **Container Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Built-in logging and health checks

## 📋 Project Structure

```plaintext
├── backend/          # .NET Core API and services
├── frontend/         # Next.js React application
├── infra/           # Terraform infrastructure code
├── proxy/           # Nginx reverse proxy configuration
├── docs/            # Project documentation
└── scripts/         # Utility and deployment scripts
```

## 🤝 Team & Collaboration

This project follows strict collaboration guidelines to ensure code quality and team productivity:

- **Conventional Commits** for clear git history
- **Branch Protection** with required reviews
- **Automated Testing** with comprehensive coverage
- **Code Review Process** for knowledge sharing

## 📞 Support & Contact

For questions, issues, or contributions:

1. Check the relevant documentation section
2. Review existing issues and discussions
3. Follow the contributing guidelines for new features or bug reports

---

**Happy coding!** 🚀


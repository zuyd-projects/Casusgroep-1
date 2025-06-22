# Backend API Testing

This directory contains unit and integration tests for the ERPNumber1 API.

## Overview

The testing setup includes:

- **Unit Tests**: Test individual controllers and business logic with mocked dependencies
- **Integration Tests**: Test the full API with an in-memory database (if needed)
- **GitHub Actions**: Automated testing on PR creation
- **Health Checks**: Basic API availability tests

## Test Structure

```
ERPNumber1.Tests/
├── Unit/                   # Unit tests for controllers
│   ├── ProductsControllerUnitTests.cs
│   └── OrderControllerUnitTests.cs
├── Simple/                 # Basic model and database tests
│   └── SimpleProductsTest.cs
├── Controllers/           # Full integration tests (if needed)
│   ├── ProductsControllerTests.cs
│   └── OrderControllerTests.cs
├── CustomWebApplicationFactory.cs  # Test application factory
├── BaseIntegrationTest.cs          # Base class for integration tests
├── appsettings.Testing.json        # Test configuration
└── .gitignore                      # Test project gitignore
```

## Running Tests Locally

### Prerequisites

- .NET 9.0 SDK
- No SQL Server required (tests use in-memory database)

### Quick Start

```bash
# Run all tests
./scripts/test-backend.sh

# Or manually from backend/ERPNumber1:
cd backend/ERPNumber1
dotnet test --configuration Release

# From the test project directory:
cd backend/ERPNumber1/ERPNumber1.Tests
dotnet test --verbosity normal
```

### Running Specific Test Categories

```bash
# Run only unit tests
dotnet test --filter "Unit"

# Run only simple tests
dotnet test --filter "SimpleProductsTest"

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

## Test Categories

### Integration Tests
- Test full API endpoints with real HTTP requests
- Use in-memory database for isolation
- Mock external services (EventLogService)
- Verify both success and error scenarios

### API Health Checks
- Basic endpoint availability
- Response status validation
- Database connectivity (when using real DB)

## GitHub Actions Workflow

The workflow automatically runs on:
- Pull requests to `main` or `develop` branches
- Pushes to `main` or `develop` branches
- Only when backend files are changed

### Workflow Steps
1. **Setup**: .NET SDK + SQL Server container
2. **Build**: Restore dependencies and compile
3. **Test**: Run all unit/integration tests
4. **Health Check**: Start API and verify endpoints
5. **Artifacts**: Upload test results and coverage

## Adding New Tests

### Controller Tests
1. Create new test class inheriting from `BaseIntegrationTest`
2. Add test methods with `[Fact]` or `[Theory]` attributes
3. Use FluentAssertions for readable assertions

Example:
```csharp
[Fact]
public async Task GetItems_ShouldReturnOk()
{
    // Arrange
    var item = new Item { Name = "Test" };
    DbContext.Items.Add(item);
    await DbContext.SaveChangesAsync();

    // Act
    var response = await HttpClient.GetAsync("/api/items");

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.OK);
}
```

### Test Data
- Use the in-memory database for test data
- Clean database between tests (handled by `BaseIntegrationTest`)
- Create realistic test data that matches your DTOs/Models

## Configuration

### Test Settings
- `appsettings.Testing.json`: Test-specific configuration
- In-memory database for fast, isolated tests
- Mocked external services

### Environment Variables
The tests respect these environment variables:
- `ASPNETCORE_ENVIRONMENT=Testing`
- Connection strings (when using real database)

## Troubleshooting

### Common Issues

**Tests fail with database errors:**
- Check if SQL Server is running (for integration tests with real DB)
- Verify connection strings in test configuration

**API health checks fail:**
- Check if port 5000 is available
- Verify API starts correctly in test environment
- Check for missing dependencies

**Build errors:**
- Ensure all NuGet packages are restored
- Check .NET SDK version compatibility

### Debug Mode
Run tests with detailed output:
```bash
dotnet test --verbosity diagnostic
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Meaningful Names**: Use descriptive test method names
3. **Arrange-Act-Assert**: Follow the AAA pattern
4. **Fast Tests**: Use in-memory database for speed
5. **Coverage**: Aim for good test coverage of critical paths

## Coverage Reports

Coverage reports are generated automatically and can be found in:
- `TestResults/*/coverage.cobertura.xml`
- GitHub Actions artifacts (for CI runs)

View coverage locally:
```bash
dotnet test --collect:"XPlat Code Coverage"
# Use tools like ReportGenerator to view HTML reports
```

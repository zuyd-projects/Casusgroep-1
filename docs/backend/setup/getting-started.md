# Getting Started Guide

This guide will help you set up and run the ERP system from scratch.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Docker Desktop** (v4.0+)
  - [Download for Windows](https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe)
  - [Download for macOS](https://desktop.docker.com/mac/main/amd64/Docker.dmg)
  - [Download for Linux](https://docs.docker.com/desktop/install/linux-install/)

- **.NET 9.0 SDK** (for local development)
  - [Download here](https://dotnet.microsoft.com/download/dotnet/9.0)

- **Git** (for version control)
  - [Download here](https://git-scm.com/downloads)

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or modern Linux distribution

## 🚀 Quick Start (5 minutes)

### Option 1: Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Start the system**

   ```bash
   docker-compose up --build
   ```

3. **Verify the setup**

   - API: [http://localhost:8080](http://localhost:8080)
   - Database: `localhost:1433`

**That's it!** The system is now running with a complete database setup.

### Option 2: Local Development

1. **Start the database**

   ```bash
   docker-compose up sqlserver
   ```

2. **Run the API locally**

   ```bash
   cd ERPNumber1/ERPNumber1
   dotnet run
   ```

3. **Access the API**

   - API: [http://localhost:5000](http://localhost:5000)
   - HTTPS: [https://localhost:5001](https://localhost:5001)

## 🔧 Configuration

### Environment Variables

The system supports these environment variables:

```bash
# Database Configuration
ConnectionStrings__DefaultConnection="Server=localhost;Database=SimulationDb;User Id=sa;Password=Your_password123!;TrustServerCertificate=True;"

# JWT Configuration
Jwt__Key="your-secret-key-here"
Jwt__Issuer="ERPSystem"
Jwt__Audience="ERPUsers"

# Logging
Logging__LogLevel__Default="Information"
```

### Docker Configuration

The `docker-compose.yml` file includes:

- **API Service**: ASP.NET Core application
- **Database Service**: Azure SQL Edge
- **Volume Mapping**: Persistent data storage
- **Health Checks**: Automatic service monitoring

### Database Setup

The database is automatically configured with:

- **Database**: `SimulationDb`
- **Tables**: All EF Core models
- **User**: `sa`
- **Password**: `Your_password123!`

## 🧪 Testing the Setup

### 1. Health Check

```bash
curl http://localhost:8080/api/health
```

**Expected Response**: `200 OK`

### 2. Create a Test User

```bash
curl -X POST http://localhost:8080/api/Users/register \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "password": "Test123!",
  "userName": "testuser"
}'
```

### 3. Login and Get Token

```bash
curl -X POST http://localhost:8080/api/Users/login \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "password": "Test123!"
}'
```

### 4. Test Process Mining

```bash
# Get process statistics
curl http://localhost:8080/api/ProcessMining/statistics \
-H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Enable Process Mining

Process mining is automatically enabled when you start the system. To verify:

### 1. Check Event Logging

```bash
# Create a test order to generate events
curl -X POST http://localhost:8080/api/Order \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "motorType": "A-Type",
  "quantity": 5,
  "orderDate": "2025-06-16T10:00:00Z"
}'
```

### 2. View Generated Events

```bash
# Get all events
curl http://localhost:8080/api/ProcessMining/events \
-H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Export Process Data

```bash
# Export to XES format for process mining tools
curl http://localhost:8080/api/ProcessMining/export/xes \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-o process_data.xes
```

## 🛠️ Development Setup

### IDE Setup

**Visual Studio Code** (Recommended):

1. Install extensions:
   - C# Dev Kit
   - REST Client
   - Docker

2. Open the workspace:

   ```bash
   code .
   ```

**Visual Studio** (Alternative):

1. Open `ERPNumber1/ERPNumber1.sln`
2. Set `ERPNumber1` as startup project
3. Run with `F5`

### Database Management

**Connect via SQL Server Management Studio**:

- **Server**: `localhost,1433`
- **Authentication**: SQL Server Authentication
- **Login**: `sa`
- **Password**: `Your_password123!`

**Command Line Database Access**:

```bash
# Access database container
docker exec -it $(docker ps -q --filter "ancestor=mcr.microsoft.com/azure-sql-edge") /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'Your_password123!'
```

### Hot Reload Development

For rapid development with automatic rebuilds:

```bash
# Terminal 1: Start database
docker-compose up sqlserver

# Terminal 2: Run with hot reload
cd ERPNumber1/ERPNumber1
dotnet watch run
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `Port 8080 is already allocated`

**Solution**:

```bash
# Stop all containers
docker-compose down

# Or use different ports
docker-compose up --build -p 8081:8080
```

#### 2. Database Connection Failed

**Error**: `Cannot connect to SQL Server`

**Solutions**:

```bash
# Check container status
docker-compose ps

# View database logs
docker-compose logs sqlserver

# Reset database
docker-compose down -v
docker-compose up sqlserver
```

#### 3. Authentication Issues

**Error**: `401 Unauthorized`

**Check**:

- JWT token is included in requests
- Token hasn't expired (check expiration time)
- Correct `Authorization: Bearer <token>` header format

#### 4. Build Errors

**Common Fixes**:

```bash
# Clean and rebuild
dotnet clean
dotnet build

# Restore packages
dotnet restore

# Check for updates
dotnet list package --outdated
```

### Performance Optimization

#### 1. Database Indexing

For better process mining performance:

```sql
-- Add indexes for event queries
CREATE INDEX IX_EventLog_CaseId ON EventLogs (CaseId);
CREATE INDEX IX_EventLog_EventType ON EventLogs (EventType);
CREATE INDEX IX_EventLog_Timestamp ON EventLogs (Timestamp);
```

#### 2. Memory Settings

For large datasets, adjust Docker memory:

```yaml
# In docker-compose.yml
services:
  sqlserver:
    environment:
      MSSQL_MEMORY_LIMIT_MB: 2048
```

## 🎯 Success Checklist

- [ ] Docker containers are running
- [ ] API responds on port 8080
- [ ] Database accepts connections
- [ ] User registration works
- [ ] JWT authentication works
- [ ] Process mining endpoints respond
- [ ] Event logging captures data
- [ ] XES export generates valid files

**Congratulations!** Your ERP system with process mining is now ready for development and production use.

---
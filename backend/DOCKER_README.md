# ERP Backend with Azure SQL Edge Database

This project uses Docker Compose to run both the .NET API and Azure SQL Edge database. Azure SQL Edge is used for better compatibility with ARM-based Macs (Apple Silicon).

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1. **Build and start the services:**

   ```bash
   docker-compose up --build
   ```

2. **Run in detached mode (background):**

   ```bash
   docker-compose up -d --build
   ```

3. **View logs:**

   ```bash
   docker-compose logs -f api
   docker-compose logs -f sqlserver
   ```

4. **Stop the services:**

   ```bash
   docker-compose down
   ```

5. **Stop and remove volumes (reset database):**

   ```bash
   docker-compose down -v
   ```

## Services

- **API**: Runs on ports 8080 (HTTP) and 8081 (HTTPS)
- **Azure SQL Edge**: Runs on port 1433
  - Database: `SimulationDb` (automatically created)
  - Username: `sa`
  - Password: `Your_password123!`

## Database Setup

The database is automatically created when the API starts up. The application uses Entity Framework's `EnsureCreated()` method to:

1. Create the `SimulationDb` database if it doesn't exist
2. Create all necessary tables based on your Entity Framework models
3. Set up the database schema automatically

**No manual migrations are needed** - the database and tables are created automatically on first startup.

## Development

For local development without Docker:

1. Start only the SQL Server service: `docker-compose up sqlserver`
2. Update `appsettings.json` to use `localhost` instead of `sqlserver` for the server name
3. Run the API locally: `dotnet run`

## Database Access

You can connect to the database using any SQL Server client:
- **Server**: `localhost,1433`
- **Database**: `SimulationDb`
- **Username**: `sa`
- **Password**: `Your_password123!`
- **Connection string**: `Server=localhost;Database=SimulationDb;User Id=sa;Password=Your_password123!;TrustServerCertificate=True;`

## Troubleshooting

- **API can't connect to database**: Make sure the SQL Server container is healthy. Check logs with `docker-compose logs sqlserver`
- **Database login failed**: Ensure you're using the correct password (`Your_password123!` with exclamation mark)
- **Connection refused**: Wait for SQL Server to fully start up (can take 30-60 seconds)
- **Apple Silicon compatibility**: This setup uses Azure SQL Edge which is optimized for ARM processors

## Architecture Notes

- Uses Azure SQL Edge instead of SQL Server 2022 for better ARM compatibility
- Database is automatically created on application startup
- Health checks ensure SQL Server is ready before starting the API
- Persistent data storage using Docker volumes

#!/bin/bash
echo "Starting database setup..."

# Wait for SQL Server to be ready
echo "Waiting for SQL Server to be ready..."
for i in {1..30}; do
    if sqlcmd -S sqlserver -U sa -P 'Your_password123!' -C -Q "SELECT 1" >/dev/null 2>&1; then
        echo "SQL Server is ready!"
        break
    fi
    echo "Attempt $i: SQL Server not ready, waiting 2 seconds..."
    sleep 2
done

# Create the database if it doesn't exist
echo "Creating database if it doesn't exist..."
sqlcmd -S sqlserver -U sa -P 'Your_password123!' -C -Q "
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'SimulationDb')
BEGIN
    CREATE DATABASE SimulationDb;
    PRINT 'Database SimulationDb created successfully.';
END
ELSE
BEGIN
    PRINT 'Database SimulationDb already exists.';
END
"

# Run EF migrations
echo "Running Entity Framework migrations..."
dotnet ef database update --verbose

echo "Database setup completed!"

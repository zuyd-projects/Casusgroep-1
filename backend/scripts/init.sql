-- Initial database setup for SimulationDb
USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'SimulationDb')
BEGIN
    CREATE DATABASE SimulationDb;
    PRINT 'Database SimulationDb created successfully.';
END
ELSE
BEGIN
    PRINT 'Database SimulationDb already exists.';
END
GO

USE SimulationDb;
GO

-- This file will be executed when the SQL Server container starts
-- The tables will be created by Entity Framework when the API starts
PRINT 'Database setup completed. Tables will be created by Entity Framework.';
GO

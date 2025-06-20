-- Process Mining Test Data Cleanup Script
-- This script removes all test data created by process_mining_test_data.sql
-- Run this when you want to clean up the test data and start fresh

USE [SimulationDb];
GO

PRINT 'Starting cleanup of process mining test data...';
PRINT '';

-- Show current data counts before cleanup
PRINT 'Current EventLog counts:';
SELECT 
    'Total Events' as DataType, 
    COUNT(*) as Count
FROM [EventLogs]
UNION ALL
SELECT 
    'Test Orders (ORDER-xxxx)', 
    COUNT(*)
FROM [EventLogs] 
WHERE [CaseId] LIKE 'ORDER-%'
UNION ALL
SELECT 
    'Anomaly Events', 
    COUNT(*)
FROM [EventLogs] 
WHERE [CaseId] LIKE 'ANOMALY-%' OR [CaseId] LIKE 'TIMING-%'
UNION ALL
SELECT 
    'Bottleneck Events', 
    COUNT(*)
FROM [EventLogs] 
WHERE [CaseId] LIKE 'BOTTLENECK-%'
UNION ALL
SELECT 
    'Failure Events', 
    COUNT(*)
FROM [EventLogs] 
WHERE [CaseId] LIKE 'FAILURE-%';

PRINT '';
PRINT 'Cleaning up test data...';

-- Delete test order events (ORDER-0001 through ORDER-0030)
DELETE FROM [EventLogs] 
WHERE [CaseId] LIKE 'ORDER-%' 
  AND [CaseId] LIKE 'ORDER-[0-9][0-9][0-9][0-9]';

PRINT 'Deleted ORDER-xxxx events: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

-- Delete anomaly test events
DELETE FROM [EventLogs] 
WHERE [CaseId] LIKE 'ANOMALY-%';

PRINT 'Deleted ANOMALY-xxx events: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

-- Delete timing anomaly events
DELETE FROM [EventLogs] 
WHERE [CaseId] LIKE 'TIMING-%';

PRINT 'Deleted TIMING-xxx events: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

-- Delete bottleneck test events
DELETE FROM [EventLogs] 
WHERE [CaseId] LIKE 'BOTTLENECK-%';

PRINT 'Deleted BOTTLENECK-xxx events: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

-- Delete failure test events
DELETE FROM [EventLogs] 
WHERE [CaseId] LIKE 'FAILURE-%';

PRINT 'Deleted FAILURE-xxx events: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

-- Delete any events with test resources
DELETE FROM [EventLogs] 
WHERE [Resource] IN (
    'OrderSystem', 'ValidationTeam', 'ProductionLine1', 'ProductionLine2',
    'QualityTeam', 'PackagingTeam', 'ShippingTeam', 'DeliveryService',
    'InventorySystem', 'PaymentGateway', 'NotificationService', 'BackupService'
) AND [UserId] IN ('SYSTEM', 'USER001', 'USER002', 'PROD001', 'PROD002', 'QC001', 'QC002', 'PACK001', 'SHIP001', 'DELIVERY001', 'INV001', 'PAY001', 'EMAIL001', 'SYS001');

PRINT 'Deleted additional test resource events: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

-- Show final counts
PRINT '';
PRINT 'Cleanup completed! Remaining EventLog counts:';
SELECT 
    'Total Events' as DataType, 
    COUNT(*) as Count
FROM [EventLogs]
UNION ALL
SELECT 
    'Test Orders (ORDER-xxxx)', 
    COUNT(*)
FROM [EventLogs] 
WHERE [CaseId] LIKE 'ORDER-%'
UNION ALL
SELECT 
    'Other Events', 
    COUNT(*)
FROM [EventLogs] 
WHERE [CaseId] NOT LIKE 'ORDER-%';

PRINT '';
PRINT '✅ Test data cleanup completed successfully!';
PRINT '';
PRINT 'The EventLogs table now contains only production data.';
PRINT 'You can run process_mining_test_data.sql again to recreate test data if needed.';
PRINT '';

-- Optional: Reset identity if the table is completely empty
IF NOT EXISTS (SELECT 1 FROM [EventLogs])
BEGIN
    PRINT 'Table is empty - resetting identity seed to 1';
    DBCC CHECKIDENT('[EventLogs]', RESEED, 0);
    PRINT 'Identity seed reset completed.';
END

GO

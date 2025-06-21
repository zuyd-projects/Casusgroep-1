-- Process Mining Test Data Script
-- This script creates realistic EventLog data to test anomaly detection features
-- Run this in SQL Server Management Studio or Azure Data Studio

USE [SimulationDb];
GO

-- Clear existing EventLog data (optional - uncomment if needed)
-- DELETE FROM [EventLogs];

-- Insert realistic process mining test data
DECLARE @BaseDate DATETIME = DATEADD(day, -45, GETUTCDATE());
DECLARE @CurrentDate DATETIME = GETUTCDATE();

-- Create normal order processing events (20 orders)
DECLARE @OrderCounter INT = 1;
DECLARE @CaseId NVARCHAR(50);
DECLARE @CurrentTime DATETIME;

WHILE @OrderCounter <= 20
BEGIN
    SET @CaseId = 'ORDER-' + RIGHT('0000' + CAST(@OrderCounter AS VARCHAR), 4);
    SET @CurrentTime = DATEADD(minute, CAST(RAND() * 60000 AS INT), @BaseDate); -- Random start time within 45 days
    
    -- Order Created (15 seconds)
    INSERT INTO [EventLogs] ([CaseId], [Activity], [Resource], [Timestamp], [EventType], [Status], [AdditionalData], [EntityId], [Priority], [UserId], [SessionId], [DurationMs])
    VALUES (@CaseId, 'Order Created', 'OrderSystem', @CurrentTime, 'Order', 'Completed', 
            '{"orderId": ' + CAST(@OrderCounter AS VARCHAR) + ', "step": 1, "totalSteps": 7}', 
            CAST(@OrderCounter AS VARCHAR), 
            CASE WHEN @OrderCounter % 5 = 0 THEN 'High' ELSE 'Normal' END, 
            'SYSTEM', NEWID(), 15000);
    
    SET @CurrentTime = DATEADD(second, 15 + CAST(RAND() * 30 AS INT), @CurrentTime); -- 15-45 seconds later
    
    -- Order Validated (45 seconds)
    INSERT INTO [EventLogs] ([CaseId], [Activity], [Resource], [Timestamp], [EventType], [Status], [AdditionalData], [EntityId], [Priority], [UserId], [SessionId], [DurationMs])
    VALUES (@CaseId, 'Order Validated', 'ValidationTeam', @CurrentTime, 'Order', 'Completed', 
            '{"orderId": ' + CAST(@OrderCounter AS VARCHAR) + ', "step": 2, "totalSteps": 7}', 
            CAST(@OrderCounter AS VARCHAR), 'Normal', 'USER001', NEWID(), 45000);
    
    SET @CurrentTime = DATEADD(second, 45 + CAST(RAND() * 60 AS INT), @CurrentTime); -- 45-105 seconds later
    
    -- Production Started (8 minutes)
    INSERT INTO [EventLogs] ([CaseId], [Activity], [Resource], [Timestamp], [EventType], [Status], [AdditionalData], [EntityId], [Priority], [UserId], [SessionId], [DurationMs])
    VALUES (@CaseId, 'Production Started', 'ProductionLine1', @CurrentTime, 'Order', 'Completed', 
            '{"orderId": ' + CAST(@OrderCounter AS VARCHAR) + ', "step": 3, "totalSteps": 7}', 
            CAST(@OrderCounter AS VARCHAR), 'Normal', 'PROD001', NEWID(), 480000);
    
    SET @CurrentTime = DATEADD(minute, 8 + CAST(RAND() * 4 AS INT), @CurrentTime); -- 8-12 minutes later
    
    -- Quality Check (1 minute, except for anomalies)
    INSERT INTO [EventLogs] ([CaseId], [Activity], [Resource], [Timestamp], [EventType], [Status], [AdditionalData], [EntityId], [Priority], [UserId], [SessionId], [DurationMs])
    VALUES (@CaseId, 'Quality Check', 'QualityTeam', @CurrentTime, 'Order', 
            CASE WHEN @OrderCounter IN (3, 7, 12) THEN 'Failed' ELSE 'Completed' END, 
            '{"orderId": ' + CAST(@OrderCounter AS VARCHAR) + ', "step": 4, "totalSteps": 7}', 
            CAST(@OrderCounter AS VARCHAR), 'Normal', 'QC001', NEWID(), 
            CASE WHEN @OrderCounter = 15 THEN 300000 ELSE 60000 END); -- Order 15 has quality issues (5 min vs 1 min)
    
    -- Skip remaining steps if quality failed
    IF @OrderCounter NOT IN (3, 7, 12)
    BEGIN
        SET @CurrentTime = DATEADD(minute, 1 + CAST(RAND() * 2 AS INT), @CurrentTime); -- 1-3 minutes later
        
        -- Packaging (30 seconds)
        INSERT INTO [EventLogs] ([CaseId], [Activity], [Resource], [Timestamp], [EventType], [Status], [AdditionalData], [EntityId], [Priority], [UserId], [SessionId], [DurationMs])
        VALUES (@CaseId, 'Packaging', 'PackagingTeam', @CurrentTime, 'Order', 'Completed', 
                '{"orderId": ' + CAST(@OrderCounter AS VARCHAR) + ', "step": 5, "totalSteps": 7}', 
                CAST(@OrderCounter AS VARCHAR), 'Normal', 'PACK001', NEWID(), 30000);
        
        SET @CurrentTime = DATEADD(second, 30 + CAST(RAND() * 90 AS INT), @CurrentTime); -- 30-120 seconds later
        
        -- Shipped (45 seconds)
        INSERT INTO [EventLogs] ([CaseId], [Activity], [Resource], [Timestamp], [EventType], [Status], [AdditionalData], [EntityId], [Priority], [UserId], [SessionId], [DurationMs])
        VALUES (@CaseId, 'Shipped', 'ShippingTeam', @CurrentTime, 'Order', 
                CASE WHEN @OrderCounter = 9 THEN 'Delayed' ELSE 'Completed' END, 
                '{"orderId": ' + CAST(@OrderCounter AS VARCHAR) + ', "step": 6, "totalSteps": 7}', 
                CAST(@OrderCounter AS VARCHAR), 'Normal', 'SHIP001', NEWID(), 45000);
        
        -- Only complete delivery for orders <= 15 (simulate ongoing orders)
        IF @OrderCounter <= 15
        BEGIN
            -- Delivered (1 minute, but some orders have longer delivery times for anomaly detection)
            SET @CurrentTime = DATEADD(minute, 
                CASE 
                    WHEN @OrderCounter IN (5, 11) THEN 120 + CAST(RAND() * 240 AS INT) -- 2-6 hours for delivery delays
                    ELSE 1 + CAST(RAND() * 2 AS INT) -- Normal: 1-3 minutes
                END, @CurrentTime);
            
            INSERT INTO [EventLogs] ([CaseId], [Activity], [Resource], [Timestamp], [EventType], [Status], [AdditionalData], [EntityId], [Priority], [UserId], [SessionId], [DurationMs])
            VALUES (@CaseId, 'Delivered', 'DeliveryService', @CurrentTime, 'Order', 'Completed', 
                    '{"orderId": ' + CAST(@OrderCounter AS VARCHAR) + ', "step": 7, "totalSteps": 7}', 
                    CAST(@OrderCounter AS VARCHAR), 'Normal', 'DELIVERY001', NEWID(), 60000);
        END
    END
    
    SET @OrderCounter = @OrderCounter + 1;
END

-- Create some anomalous events
-- Duration Anomaly: Extremely long production time (2 hours instead of 8 minutes)
INSERT INTO [EventLogs] ([CaseId], [Activity], [Resource], [Timestamp], [EventType], [Status], [AdditionalData], [EntityId], [Priority], [UserId], [SessionId], [DurationMs])
VALUES ('ANOMALY-001', 'Production Started', 'ProductionLine2', DATEADD(day, -10, GETUTCDATE()), 'Anomaly', 'Completed', 
        '{"type": "duration_anomaly", "expected": 480000, "actual": 7200000}', '999', 'High', 'PROD002', NEWID(), 7200000); -- 2 hours instead of 8 minutes

-- Bottleneck: Multiple rapid fire events
DECLARE @BottleneckCounter INT = 1;
WHILE @BottleneckCounter <= 25
BEGIN
    INSERT INTO [EventLogs] ([CaseId], [Activity], [Resource], [Timestamp], [EventType], [Status], [AdditionalData], [EntityId], [Priority], [UserId], [SessionId], [DurationMs])
    VALUES ('BOTTLENECK-' + CAST(@BottleneckCounter AS VARCHAR), 'Inventory Check', 'InventorySystem', 
            DATEADD(minute, @BottleneckCounter * 10, DATEADD(day, -5, GETUTCDATE())), 'Inventory', 'Completed', 
            '{"type": "bottleneck", "frequency": "high"}', CAST(1000 + @BottleneckCounter AS VARCHAR), 'Medium', 'INV001', NEWID(), 5000);
    
    SET @BottleneckCounter = @BottleneckCounter + 1;
END

-- System Failures
INSERT INTO [EventLogs] ([CaseId], [Activity], [Resource], [Timestamp], [EventType], [Status], [AdditionalData], [EntityId], [Priority], [UserId], [SessionId], [DurationMs])
VALUES ('FAILURE-001', 'Payment Processing', 'PaymentGateway', DATEADD(day, -3, GETUTCDATE()), 'Payment', 'Failed', 
        '{"error": "Gateway timeout", "retry_count": 3}', '501', 'High', 'PAY001', NEWID(), 120000);

INSERT INTO [EventLogs] ([CaseId], [Activity], [Resource], [Timestamp], [EventType], [Status], [AdditionalData], [EntityId], [Priority], [UserId], [SessionId], [DurationMs])
VALUES ('FAILURE-002', 'Email Notification', 'NotificationService', DATEADD(day, -2, GETUTCDATE()), 'Notification', 'Failed', 
        '{"error": "SMTP server unreachable"}', '502', 'Medium', 'EMAIL001', NEWID(), 30000);

INSERT INTO [EventLogs] ([CaseId], [Activity], [Resource], [Timestamp], [EventType], [Status], [AdditionalData], [EntityId], [Priority], [UserId], [SessionId], [DurationMs])
VALUES ('FAILURE-003', 'Database Backup', 'BackupService', DATEADD(day, -1, GETUTCDATE()), 'System', 'Failed', 
        '{"error": "Insufficient disk space"}', '503', 'High', 'SYS001', NEWID(), 60000);

-- Recent ongoing orders (these will show up in delivery predictions)
DECLARE @OngoingCounter INT = 21;
WHILE @OngoingCounter <= 30
BEGIN
    SET @CaseId = 'ORDER-' + RIGHT('0000' + CAST(@OngoingCounter AS VARCHAR), 4);
    SET @CurrentTime = DATEADD(minute, -(@OngoingCounter - 15) * 30, GETUTCDATE()); -- Started 30min-7.5hours ago
    
    -- Order Created (15 seconds)
    INSERT INTO [EventLogs] ([CaseId], [Activity], [Resource], [Timestamp], [EventType], [Status], [AdditionalData], [EntityId], [Priority], [UserId], [SessionId], [DurationMs])
    VALUES (@CaseId, 'Order Created', 'OrderSystem', @CurrentTime, 'Order', 'Completed', 
            '{"orderId": ' + CAST(@OngoingCounter AS VARCHAR) + ', "ongoing": true}', 
            CAST(@OngoingCounter AS VARCHAR), 'Normal', 'SYSTEM', NEWID(), 15000);
    
    SET @CurrentTime = DATEADD(second, 15, @CurrentTime);
    
    -- Order Validated (45 seconds)
    INSERT INTO [EventLogs] ([CaseId], [Activity], [Resource], [Timestamp], [EventType], [Status], [AdditionalData], [EntityId], [Priority], [UserId], [SessionId], [DurationMs])
    VALUES (@CaseId, 'Order Validated', 'ValidationTeam', @CurrentTime, 'Order', 'Completed', 
            '{"orderId": ' + CAST(@OngoingCounter AS VARCHAR) + ', "ongoing": true}', 
            CAST(@OngoingCounter AS VARCHAR), 'Normal', 'USER001', NEWID(), 45000);
    
    -- Some orders are stuck in production (will trigger delivery warnings)
    IF @OngoingCounter % 3 = 0
    BEGIN
        SET @CurrentTime = DATEADD(second, 45, @CurrentTime);
        INSERT INTO [EventLogs] ([CaseId], [Activity], [Resource], [Timestamp], [EventType], [Status], [AdditionalData], [EntityId], [Priority], [UserId], [SessionId], [DurationMs])
        VALUES (@CaseId, 'Production Started', 'ProductionLine1', @CurrentTime, 'Order', 'In Progress', 
                '{"orderId": ' + CAST(@OngoingCounter AS VARCHAR) + ', "stuck": true}', 
                CAST(@OngoingCounter AS VARCHAR), 'High', 'PROD001', NEWID(), NULL);
    END
    
    SET @OngoingCounter = @OngoingCounter + 1;
END

-- Add some irregular timing patterns for anomaly detection
INSERT INTO [EventLogs] ([CaseId], [Activity], [Resource], [Timestamp], [EventType], [Status], [AdditionalData], [EntityId], [Priority], [UserId], [SessionId], [DurationMs])
VALUES ('TIMING-001', 'Order Validated', 'ValidationTeam', DATEADD(hour, -2, GETUTCDATE()), 'Order', 'Completed', 
        '{"timing_anomaly": true}', '701', 'Normal', 'USER002', NEWID(), 600000); -- 10 minutes instead of normal 45 seconds

INSERT INTO [EventLogs] ([CaseId], [Activity], [Resource], [Timestamp], [EventType], [Status], [AdditionalData], [EntityId], [Priority], [UserId], [SessionId], [DurationMs])
VALUES ('TIMING-002', 'Quality Check', 'QualityTeam', DATEADD(hour, -1, GETUTCDATE()), 'Order', 'Completed', 
        '{"timing_anomaly": true}', '702', 'Normal', 'QC002', NEWID(), 900000); -- 15 minutes instead of normal 1 minute

PRINT 'Test data insertion completed!';
PRINT 'Created:';
PRINT '- 20 complete order workflows (some with failures)';
PRINT '- 10 ongoing orders (some stuck, will trigger delivery warnings)';
PRINT '- 25 bottleneck events (high frequency inventory checks)';
PRINT '- 3 system failures';
PRINT '- 3 duration anomalies';
PRINT '- Various timing irregularities';
PRINT '';
PRINT 'Realistic timing:';
PRINT '- Order Created: 15 seconds';
PRINT '- Order Validated: 45 seconds';  
PRINT '- Production: 8 minutes (normal), 2 hours (anomaly)';
PRINT '- Quality Check: 1 minute (normal), 5-15 minutes (anomaly)';
PRINT '- Packaging: 30 seconds';
PRINT '- Shipping: 45 seconds';
PRINT '- Delivery: 1-3 minutes (normal), 2-6 hours (delayed)';
PRINT '- Total normal case duration: ~11 minutes';
PRINT '';
PRINT 'Expected anomalies:';
PRINT '- Duration anomalies: Production and validation taking too long';
PRINT '- Process bottlenecks: High frequency inventory checks';
PRINT '- Process failures: Payment, email, and backup failures';
PRINT '- Delivery delays: Orders 5, 11 took 2-6 hours instead of minutes';
PRINT '- Delivery warnings: Orders 21-30 are ongoing, some stuck in production';
PRINT '';
PRINT 'You can now test the process mining dashboard at /dashboard/process-mining';
GO

-- Migration script to add EventLog table
-- Run this script against your database if you're not using Entity Framework migrations

CREATE TABLE [dbo].[EventLogs] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [CaseId] nvarchar(450) NOT NULL,
    [Activity] nvarchar(450) NOT NULL,
    [Resource] nvarchar(450) NOT NULL,
    [Timestamp] datetime2 NOT NULL,
    [EventType] nvarchar(450) NOT NULL DEFAULT(''),
    [AdditionalData] nvarchar(max) NULL,
    [Status] nvarchar(450) NOT NULL DEFAULT('Completed'),
    [DurationMs] bigint NULL,
    [EntityId] nvarchar(450) NULL,
    [Priority] nvarchar(450) NOT NULL DEFAULT('Normal'),
    [UserId] nvarchar(450) NULL,
    [SessionId] nvarchar(450) NULL,
    CONSTRAINT [PK_EventLogs] PRIMARY KEY ([Id])
);

-- Add indexes for better query performance
CREATE INDEX [IX_EventLogs_CaseId] ON [dbo].[EventLogs] ([CaseId]);
CREATE INDEX [IX_EventLogs_EventType] ON [dbo].[EventLogs] ([EventType]);
CREATE INDEX [IX_EventLogs_Timestamp] ON [dbo].[EventLogs] ([Timestamp]);
CREATE INDEX [IX_EventLogs_Resource] ON [dbo].[EventLogs] ([Resource]);
CREATE INDEX [IX_EventLogs_UserId] ON [dbo].[EventLogs] ([UserId]);

-- Composite indexes for common query patterns
CREATE INDEX [IX_EventLogs_EventType_Timestamp] ON [dbo].[EventLogs] ([EventType], [Timestamp]);
CREATE INDEX [IX_EventLogs_CaseId_Timestamp] ON [dbo].[EventLogs] ([CaseId], [Timestamp]);

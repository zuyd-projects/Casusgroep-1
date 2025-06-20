# Process Mining Test Data Management

This document explains how to use the test data scripts for process mining development and testing.

## Overview

The process mining system includes two main SQL scripts for managing test data:

1. **`process_mining_test_data.sql`** - Creates realistic test data for development and testing
2. **`cleanup_process_mining_test_data.sql`** - Removes all test data and cleans up the database

## Scripts Location

Both scripts are located in: `backend/scripts/`

## Test Data Script (`process_mining_test_data.sql`)

### What It Creates

This script generates comprehensive test data including:

- **30 realistic order processing workflows** with normal completion times
- **Anomaly detection test cases** with various types of anomalies:
  - Duration anomalies (unusually long processing times)
  - Bottleneck scenarios (resource conflicts)
  - Process failures (failed validations, production errors)
  - Delivery delay scenarios
- **Sub-minute processing times** for quick testing and development

### Test Data Categories

#### Normal Orders (ORDER-0001 to ORDER-0020)

- Complete order processing workflows
- Realistic processing times (15 seconds to 12 minutes per step)
- Multiple process steps: Created → Validated → Production → Quality Check → Packaging → Shipping → Delivered
- Random variations in timing and priority levels

#### Anomaly Test Cases

- **TIMING-001 to TIMING-005**: Duration anomalies with extremely long processing times
- **BOTTLENECK-001 to BOTTLENECK-005**: Resource bottleneck scenarios
- **FAILURE-001 to FAILURE-005**: Process failure scenarios
- **ANOMALY-001 to ANOMALY-010**: Additional anomaly variations

### How to Use the Test Data Script

1. **Connect to your database** using SQL Server Management Studio, Azure Data Studio, or similar tool
2. **Ensure you're using the correct database** (usually `SimulationDb` or `ERPNumber1`)
3. **Execute the script**:

   ```sql
   -- Run the entire script or execute in sections
   ```

4. **Verify data creation**:

   ```sql
   SELECT COUNT(*) FROM EventLogs;
   SELECT DISTINCT CaseId FROM EventLogs ORDER BY CaseId;
   ```

### Expected Results

After running the script, you should have:

- **200+ EventLog records** representing various process scenarios
- **Test cases for all anomaly detection features**
- **Realistic timeline data** for testing process mining algorithms

## Cleanup Script (`cleanup_process_mining_test_data.sql`)

### What It Does

This script safely removes all test data by:

- **Counting existing records** before cleanup
- **Deleting test EventLogs** using specific pattern matching
- **Preserving production data** (if any exists)
- **Providing detailed feedback** about what was removed
- **Optionally resetting identity columns**

### Test Data Patterns Removed

The cleanup script removes EventLogs with these patterns:

- **ORDER-xxxx**: Test order workflows (ORDER-0001, ORDER-0002, etc.)
- **ANOMALY-xxx**: Anomaly test cases
- **TIMING-xxx**: Duration anomaly test cases
- **BOTTLENECK-xxx**: Bottleneck test cases
- **FAILURE-xxx**: Process failure test cases
- **Test resources**: Events created by specific test resources and users

### How to Use the Cleanup Script

1. **Connect to your database**
2. **Execute the cleanup script**:

   ```sql
   -- Run the entire script
   ```

3. **Review the output** to confirm successful cleanup
4. **Verify cleanup**:

   ```sql
   SELECT COUNT(*) FROM EventLogs;
   ```

### Safety Features

- **Transaction-based**: Uses transactions for safe execution
- **Pattern matching**: Only removes data matching specific test patterns
- **Detailed logging**: Shows exactly what was removed
- **Count verification**: Displays before/after record counts

## Development Workflow

### Setting Up Test Environment

1. **Clean start**:

   ```sql
   -- Run cleanup script first
   EXEC cleanup_process_mining_test_data.sql
   ```

2. **Create test data**:

   ```sql
   -- Run test data script
   EXEC process_mining_test_data.sql
   ```

3. **Verify setup**:

   ```sql
   -- Check data is available
   SELECT TOP 10 * FROM EventLogs ORDER BY Timestamp DESC;
   ```

### Testing Anomaly Detection

After creating test data, you can test the anomaly detection APIs:

```bash
# Test anomaly detection endpoint
curl "http://localhost:5045/api/processmining/anomalies"

# Test process flow analysis
curl "http://localhost:5045/api/processmining/flow"

# Test delivery predictions
curl "http://localhost:5045/api/processmining/delivery-predictions"
```

### Iterative Development

For rapid development cycles:

1. **Make code changes** to your process mining logic
2. **Clean up test data** (optional, if you want fresh data)
3. **Recreate test data** (if cleaned up)
4. **Test your changes** using the frontend dashboard or API calls
5. **Repeat** as needed

## Frontend Integration

### Dashboard Access

After setting up test data, access the process mining dashboard:

1. **Start the frontend**: `npm run dev` (in frontend directory)
2. **Navigate to**: [http://localhost:3000/dashboard/process-mining](http://localhost:3000/dashboard/process-mining)
3. **View anomalies and analytics** based on the test data

### Expected Dashboard Features

With test data loaded, you should see:

- **Process flow visualization** with realistic process steps
- **Anomaly alerts** for the test anomaly cases
- **Performance metrics** based on the test order processing times
- **Planner warnings** for delivery delays and bottlenecks

## Database Considerations

### Development vs. Production

- **Development**: Safe to run both scripts repeatedly
- **Production**: **Never run the test data script** on production databases
- **Staging**: Use for testing deployment and integration scenarios

### Identity Management

The cleanup script includes optional identity reset:

```sql
-- Uncomment this line in the cleanup script if you want to reset ID counters
-- DBCC CHECKIDENT('[EventLogs]', RESEED, 0);
```

### Backup Recommendations

Before running either script on important data:

1. **Create a database backup**
2. **Test on a copy first**
3. **Verify results** before applying to shared environments

## Troubleshooting

### Common Issues

1. **Permission errors**: Ensure your database user has INSERT/DELETE permissions
2. **Database name mismatch**: Update the `USE [DatabaseName]` line in both scripts
3. **No data visible**: Check that the correct database is selected
4. **Cleanup incomplete**: Verify test data patterns match your actual test data

### Verification Queries

```sql
-- Check if test data exists
SELECT COUNT(*) as TestOrderCount 
FROM EventLogs 
WHERE CaseId LIKE 'ORDER-%';

-- Check anomaly test cases
SELECT COUNT(*) as AnomalyCount 
FROM EventLogs 
WHERE CaseId LIKE 'ANOMALY-%' OR CaseId LIKE 'TIMING-%';

-- View sample test data
SELECT TOP 5 CaseId, Activity, Resource, Timestamp 
FROM EventLogs 
WHERE CaseId LIKE 'ORDER-0001' 
ORDER BY Timestamp;
```

## Integration with CI/CD

### Automated Testing

Consider integrating these scripts into your testing pipeline:

```bash
# Example test pipeline step
# 1. Setup test database
# 2. Run test data script
sqlcmd -S server -d database -i process_mining_test_data.sql

# 3. Run integration tests
npm test

# 4. Cleanup
sqlcmd -S server -d database -i cleanup_process_mining_test_data.sql
```

### Environment-Specific Configuration

Modify the database name in scripts for different environments:

```sql
-- Development
USE [ERPNumber1_Dev];

-- Testing  
USE [ERPNumber1_Test];

-- Staging
USE [ERPNumber1_Staging];
```

## Next Steps

1. **Run the test data script** to populate your development database
2. **Explore the process mining dashboard** to see the data visualization
3. **Test anomaly detection** using the API endpoints
4. **Develop and iterate** using the cleanup/recreate cycle
5. **Create additional test scenarios** by modifying the test data script

## Support

For questions or issues:

1. **Check the process mining documentation**: `backend/docs/process-mining/README.md`
2. **Review API integration examples**: `backend/docs/process-mining/examples/`
3. **Examine the actual scripts** for detailed implementation
4. **Test with small datasets first** before scaling up

---

*Last updated: January 2025*
*Scripts version: 1.0*

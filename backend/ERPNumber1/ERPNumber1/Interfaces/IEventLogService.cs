using ERPNumber1.Models;

namespace ERPNumber1.Interfaces
{
    public interface IEventLogService
    {
        /// <summary>
        /// Log a simple event with basic information
        /// </summary>
        Task LogEventAsync(string caseId, string activity, string resource, string eventType = "", string? additionalData = null);
        
        /// <summary>
        /// Log a detailed event with all parameters
        /// </summary>
        Task LogEventAsync(string caseId, string activity, string resource, string eventType, 
            string status, string? additionalData = null, string? entityId = null, 
            string priority = "Normal", string? userId = null, string? sessionId = null);
        
        /// <summary>
        /// Log an event with timing information (for measuring duration)
        /// </summary>
        Task LogTimedEventAsync(string caseId, string activity, string resource, string eventType,
            DateTime startTime, DateTime endTime, string status = "Completed", 
            string? additionalData = null, string? entityId = null, string? userId = null);
        
        /// <summary>
        /// Get event logs for a specific case
        /// </summary>
        Task<IEnumerable<EventLog>> GetEventLogsByCaseAsync(string caseId);
        
        /// <summary>
        /// Get event logs filtered by criteria
        /// </summary>
        Task<IEnumerable<EventLog>> GetEventLogsAsync(
            string? eventType = null, 
            string? resource = null, 
            DateTime? startDate = null, 
            DateTime? endDate = null,
            string? status = null,
            int skip = 0,
            int take = 100);
        
        /// <summary>
        /// Get process mining data in XES format (industry standard)
        /// </summary>
        Task<string> ExportToXesAsync(DateTime? startDate = null, DateTime? endDate = null);
        
        /// <summary>
        /// Get aggregated statistics for process analysis
        /// </summary>
        Task<object> GetProcessStatisticsAsync(string? eventType = null, DateTime? startDate = null, DateTime? endDate = null);
        
        /// <summary>
        /// Detect process anomalies and bottlenecks
        /// </summary>
        Task<object> DetectAnomaliesAsync(DateTime? startDate = null, DateTime? endDate = null, string? severity = null);
        
        /// <summary>
        /// Get process flow visualization data
        /// </summary>
        Task<object> GetProcessFlowAsync(DateTime? startDate = null, DateTime? endDate = null);
        
        /// <summary>
        /// Get delivery time predictions and warnings for planners
        /// </summary>
        Task<object> GetDeliveryPredictionsAsync();

        /// <summary>
        /// Get comprehensive business process analysis including cycle times, throughput, and efficiency metrics
        /// </summary>
        Task<object> GetBusinessProcessAnalysisAsync(DateTime? startDate = null, DateTime? endDate = null);

        /// <summary>
        /// Get detailed process performance metrics for specific activities
        /// </summary>
        Task<object> GetActivityPerformanceAnalysisAsync(DateTime? startDate = null, DateTime? endDate = null);

        /// <summary>
        /// Get process conformance analysis showing deviation from expected process flow
        /// </summary>
        Task<object> GetProcessConformanceAnalysisAsync(DateTime? startDate = null, DateTime? endDate = null);

        /// <summary>
        /// Get resource utilization and workload analysis
        /// </summary>
        Task<object> GetResourceUtilizationAnalysisAsync(DateTime? startDate = null, DateTime? endDate = null);

        /// <summary>
        /// Get detailed case journey analysis for individual orders
        /// </summary>
        Task<object> GetCaseJourneyAnalysisAsync(string? caseId = null, DateTime? startDate = null, DateTime? endDate = null);

        /// <summary>
        /// Get process optimization recommendations based on analysis
        /// </summary>
        Task<object> GetProcessOptimizationRecommendationsAsync(DateTime? startDate = null, DateTime? endDate = null);
    }
}

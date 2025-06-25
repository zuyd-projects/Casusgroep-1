namespace ERPNumber1.Models
{
    public enum OrderStatus
    {
        Pending,
        ApprovedByVoorraadbeheer,
        InProduction,
        RejectedByVoorraadbeheer,
        AwaitingAccountManagerApproval,
        ApprovedByAccountManager,
        RejectedByAccountManager,
        Delivered,
        Completed,
        Cancelled,
        ProductionError,
    }
}

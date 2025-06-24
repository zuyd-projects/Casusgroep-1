namespace ERPNumber1.Models
{
    public enum OrderStatus
    {
        Pending,
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

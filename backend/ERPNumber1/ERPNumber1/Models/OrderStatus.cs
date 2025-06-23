namespace ERPNumber1.Models
{
    public enum OrderStatus
    {
        Pending,
        InProduction,
        AwaitingAccountManagerApproval,
        ApprovedByAccountManager,
        RejectedByAccountManager,
        Delivered,
        Completed,
        Cancelled
    }
}

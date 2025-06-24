namespace ERPNumber1.Dtos.MissingBlocks
{
    public class CreateMissingBlocksDto
    {
        public int OrderId { get; set; }
        public string ProductionLine { get; set; } = null!;
        public char MotorType { get; set; }
        public int Quantity { get; set; }
        public int BlueBlocks { get; set; }
        public int RedBlocks { get; set; }
        public int GrayBlocks { get; set; }
    }

    public class UpdateMissingBlocksDto
    {
        public string Status { get; set; } = null!;
        public bool? RunnerAttempted { get; set; }
        public string? ResolvedBy { get; set; }
    }

    public class MissingBlocksDto
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string ProductionLine { get; set; } = null!;
        public char MotorType { get; set; }
        public int Quantity { get; set; }
        public int BlueBlocks { get; set; }
        public int RedBlocks { get; set; }
        public int GrayBlocks { get; set; }
        public string Status { get; set; } = null!;
        public bool RunnerAttempted { get; set; }
        public DateTime ReportedAt { get; set; }
        public DateTime? RunnerAttemptedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public string? ResolvedBy { get; set; }
    }
}

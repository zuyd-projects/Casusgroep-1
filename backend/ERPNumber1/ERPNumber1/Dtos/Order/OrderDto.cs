﻿namespace ERPNumber1.Dtos.Order
{
    public class OrderDto
    {
        public int Id { get; set; }
        public int RoundId { get; set; }
        public int? DeliveryId { get; set; }
        public string? AppUserId { get; set; }
        public char MotorType { get; set; }
        public int Quantity { get; set; }
        public string? Signature { get; set; }
        public char? ProductionLine { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}

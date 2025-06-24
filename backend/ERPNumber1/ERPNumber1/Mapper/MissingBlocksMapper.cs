using ERPNumber1.Dtos.MissingBlocks;
using ERPNumber1.Models;

namespace ERPNumber1.Mapper
{
    public static class MissingBlocksMapper
    {
        public static MissingBlocksDto ToMissingBlocksDto(this MissingBlocks missingBlocks)
        {
            return new MissingBlocksDto
            {
                Id = missingBlocks.Id,
                OrderId = missingBlocks.OrderId,
                ProductionLine = missingBlocks.ProductionLine,
                MotorType = missingBlocks.MotorType,
                Quantity = missingBlocks.Quantity,
                BlueBlocks = missingBlocks.BlueBlocks,
                RedBlocks = missingBlocks.RedBlocks,
                GrayBlocks = missingBlocks.GrayBlocks,
                Status = missingBlocks.Status,
                RunnerAttempted = missingBlocks.RunnerAttempted,
                ReportedAt = missingBlocks.ReportedAt,
                RunnerAttemptedAt = missingBlocks.RunnerAttemptedAt,
                ResolvedAt = missingBlocks.ResolvedAt,
                ResolvedBy = missingBlocks.ResolvedBy
            };
        }

        public static MissingBlocks ToMissingBlocksFromCreate(this CreateMissingBlocksDto createDto)
        {
            return new MissingBlocks
            {
                OrderId = createDto.OrderId,
                ProductionLine = createDto.ProductionLine,
                MotorType = createDto.MotorType,
                Quantity = createDto.Quantity,
                BlueBlocks = createDto.BlueBlocks,
                RedBlocks = createDto.RedBlocks,
                GrayBlocks = createDto.GrayBlocks,
                Status = "Pending",
                ReportedAt = DateTime.UtcNow
            };
        }

        public static MissingBlocks ToMissingBlocksFromUpdate(this UpdateMissingBlocksDto updateDto)
        {
            return new MissingBlocks
            {
                Status = updateDto.Status,
                RunnerAttempted = updateDto.RunnerAttempted ?? false,
                RunnerAttemptedAt = updateDto.RunnerAttempted == true ? DateTime.UtcNow : null,
                ResolvedBy = updateDto.ResolvedBy,
                ResolvedAt = updateDto.Status == "Resolved" ? DateTime.UtcNow : null
            };
        }
    }
}

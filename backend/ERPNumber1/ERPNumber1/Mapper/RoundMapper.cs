using ERPNumber1.Dtos.Round;
using ERPNumber1.Models;

namespace ERPNumber1.Mapper
{
    public static class RoundMapper
    {
        public static RoundDto ToRoundDto(this Round round)
        {
            return new RoundDto
            {
                Id = round.Id,
                SimulationId = round.SimulationId,
                RoundNumber = round.RoundNumber
            };
        }

        public static Round ToRoundFromCreate(this CreateRoundDto dto)
        {
            return new Round
            {
                SimulationId = dto.SimulationId,
                RoundNumber = dto.RoundNumber
            };
        }

        public static Round ToRoundFromUpdate(this UpdateRoundDto dto)
        {
            return new Round
            {
                SimulationId = dto.SimulationId,
                RoundNumber = dto.RoundNumber
            };
        }
    }
}

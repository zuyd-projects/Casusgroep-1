using ERPNumber1.Dtos.Simulation;
using ERPNumber1.Models;

namespace ERPNumber1.Mapper
{
    public static class SimulationMapper
    {

        public static SimulationDto ToSimulationDto(this Simulation simulationModel)
        {
            return new SimulationDto
            {
                Id = simulationModel.Id,
                Name = simulationModel.Name,
                Date = simulationModel.Date
            };

        }

        public static Simulation ToSimulationFromCreate(this CreateSimulationDto simulationDto)
        {
            return new Simulation
            {

                Name = simulationDto.Name,
                Date = simulationDto.Date,
              
            };
        }

        public static Simulation ToCommentFromUpdate(this UpdateSimulationDto simulationDto)
        {
            return new Simulation
            {

                Name = simulationDto.Name,
                Date = simulationDto.Date,
            };
        }
    }
}

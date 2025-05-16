using ERPNumber1.Models;

namespace ERPNumber1.Services
{
    public interface IWeatherService
    {
        IEnumerable<WeatherForecast> GetForecast();
    }
}

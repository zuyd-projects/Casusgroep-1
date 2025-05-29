using Microsoft.AspNetCore.Mvc;
using ERPNumber1.Models;
using ERPNumber1.Services;
using Microsoft.AspNetCore.Authorization;

namespace MyApiApp.Controllers
{
    [Authorize(Roles = "Admin,User")]
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private readonly IWeatherService _weatherService;

        public WeatherForecastController(IWeatherService weatherService)
        {
            _weatherService = weatherService;
        }

        [HttpGet]
        public IEnumerable<WeatherForecast> Get()
        {
            return _weatherService.GetForecast();
        }
    }
}

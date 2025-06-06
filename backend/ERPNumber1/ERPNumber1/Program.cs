using ERPNumber1.Auth;
using ERPNumber1.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Register custom authentication
builder.Services.AddAuthentication(MyAuthenticationOptions.DefaultScheme)
    .AddScheme<MyAuthenticationOptions, MyAuthenticationHandler>(
        MyAuthenticationOptions.DefaultScheme, options => { });

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddScoped<IWeatherService, WeatherService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();

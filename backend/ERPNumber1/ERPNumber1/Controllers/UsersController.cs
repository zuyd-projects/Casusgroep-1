
using ERPNumber1.Dtos.User;
using ERPNumber1.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.EntityFrameworkCore;
using ERPNumber1.Interfaces;
using ERPNumber1.Extensions;
using ERPNumber1.Attributes;
using System.Security.Claims;

namespace api.Controllers
{
    [Route("api/account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly ITokenService _tokenService;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IEventLogService _eventLogService;
        
        public AccountController(UserManager<AppUser> userManager, ITokenService tokenService, 
            SignInManager<AppUser> signInManager, IEventLogService eventLogService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _signInManager = signInManager;
            _eventLogService = eventLogService;
        }

        [HttpPost("register")]
        [LogEvent("User", "User Registration", logRequest: true)]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    await _eventLogService.LogEventAsync($"User_Registration", "User Registration Failed", 
                        "AccountController", "User", "Failed", 
                        System.Text.Json.JsonSerializer.Serialize(new { 
                            reason = "Invalid model state",
                            email = registerDto.Email,
                            name = registerDto.Name 
                        }));
                    return BadRequest(ModelState);
                }

                var appUser = new AppUser
                {
                    UserName = registerDto.Name,
                    Email = registerDto.Email,
                    Role = registerDto.Role, 
                };

                var createUser = await _userManager.CreateAsync(appUser, registerDto.Password);

                if (createUser.Succeeded)
                {
                    var roleResult = await _userManager.AddToRoleAsync(appUser, "User");
                    if (roleResult.Succeeded)
                    {
                        await _eventLogService.LogEventAsync($"User_{appUser.Id}", "User Registration Completed", 
                            "AccountController", "User", "Completed", 
                            System.Text.Json.JsonSerializer.Serialize(new { 
                                userName = appUser.UserName,
                                email = appUser.Email,
                                role = appUser.Role 
                            }), appUser.Id);
                        
                        return Ok(
                                new NewUserDto
                                {
                                    Name = appUser.UserName,
                                    Email = appUser.Email,
                                    Role = appUser.Role,
                                    Token = _tokenService.CreateToken(appUser),
                                }
                            );

                    }
                    else
                    {
                        return StatusCode(500, roleResult.Errors);
                    }
                }
                else
                {
                    return StatusCode(500, createUser.Errors);
                }
            }
            catch (Exception e)
            {
                //return StatusCode(500, e);
                return StatusCode(500, new { error = e.Message });
            }
        }

        [HttpPost("login")]
        [LogEvent("User", "User Login", logRequest: true)]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                await _eventLogService.LogEventAsync($"User_Login", "User Login Failed", 
                    "AccountController", "User", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { 
                        reason = "Invalid model state",
                        username = loginDto.Username 
                    }));
                return BadRequest(ModelState);
            }

            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.UserName == loginDto.Username.ToLower());

            if (user == null) 
            {
                await _eventLogService.LogEventAsync($"User_Login", "User Login Failed", 
                    "AccountController", "User", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { 
                        reason = "Invalid username",
                        username = loginDto.Username 
                    }));
                return Unauthorized("Invalid Username");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if (!result.Succeeded)
            {
                await _eventLogService.LogEventAsync($"User_{user.Id}", "User Login Failed", 
                    "AccountController", "User", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { 
                        reason = "Invalid password",
                        username = user.UserName 
                    }), user.Id);
                return Unauthorized("Username not found and/or password incorrect");
            }

            await _eventLogService.LogEventAsync($"User_{user.Id}", "User Login Successful", 
                "AccountController", "User", "Completed", 
                System.Text.Json.JsonSerializer.Serialize(new { 
                    username = user.UserName,
                    email = user.Email,
                    loginTime = DateTime.UtcNow
                }), user.Id);

            return Ok(
                new NewUserDto
                {
                    Name = user.UserName,
                    Email = user.Email,
                    Token = _tokenService.CreateToken(user),
                }
                );
        }
    }
}
using ERPNumber1.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace ERPNumber1.Auth
{
    public class MyAuthenticationHandler : AuthenticationHandler<MyAuthenticationOptions>
    {
        public MyAuthenticationHandler(
            IOptionsMonitor<MyAuthenticationOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder,
            TimeProvider clock)
            : base(options, logger, encoder) { }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            if (!Request.Headers.ContainsKey(Options.TokenHeaderName))
            {
                return Task.FromResult(AuthenticateResult.Fail($"Missing header: {Options.TokenHeaderName}"));
            }

            string token = Request.Headers[Options.TokenHeaderName]!;

            if (token != "supersecretecode") //HACK: Replace with actual token validation logic when tokens can be Generated with actual users
            {
                return Task.FromResult(AuthenticateResult.Fail("Invalid token."));
            }

            //ToDo: Replace with actual user retrieval logic from a database when they are made

            var testUser = new User
            {
                Id = 1,
                Name = "TestUser",
                Role = "User"
            };

            var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, testUser.Id.ToString()),
                    new Claim(ClaimTypes.Name, testUser.Name),
                    new Claim(ClaimTypes.Role, testUser.Role),
                };
            var identity = new ClaimsIdentity(claims, Scheme.Name);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);

            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }

    
}

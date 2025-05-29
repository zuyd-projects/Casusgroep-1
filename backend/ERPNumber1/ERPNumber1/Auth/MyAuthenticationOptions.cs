using Microsoft.AspNetCore.Authentication;

namespace ERPNumber1.Auth
{
    public class MyAuthenticationOptions : AuthenticationSchemeOptions
    {
        public const string DefaultScheme = "MyAuthenticationScheme";
        public string TokenHeaderName { get; set; } = "AuthenticationToken";
    }
}

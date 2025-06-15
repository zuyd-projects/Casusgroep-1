using ERPNumber1.Models;

namespace ERPNumber1.Interfaces
{
    public interface ITokenService
    {
        string CreateToken(AppUser user);
    }
}

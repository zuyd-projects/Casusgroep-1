using ERPNumber1.Models;

namespace ERPNumber1.Interfaces
{
    public interface IRequireRole
    {
        public Role[] AllowedRoles { get; }

    }
}

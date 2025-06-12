namespace ERPNumber1.Dtos.User
{
    public class NewUserDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; }
        public string Token { get; set; } = string.Empty;
    }
}

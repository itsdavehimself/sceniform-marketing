public class OrganizationUser
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int OrganizationId { get; set; }
    public Organization Organization { get; set; } = null!;

    public string Role { get; set; } = "member";
}
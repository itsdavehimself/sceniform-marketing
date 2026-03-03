public class User
{
    public int Id { get; set; }
    
    public string ClerkUserId { get; set; } = string.Empty; 
    
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    
    public ICollection<OrganizationUser> OrganizationMemberships { get; set; } = new List<OrganizationUser>();
    public ICollection<MakeConnection> AddedConnections { get; set; } = new List<MakeConnection>();
}
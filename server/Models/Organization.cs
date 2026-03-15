public class Organization
{
    public int Id { get; set; }
    public string ClerkOrgId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string SubscriptionPlan { get; set; } = "free"; 
    public bool IsSubscriptionActive { get; set; } = false;
    public ICollection<OrganizationUser> Members { get; set; } = new List<OrganizationUser>();
    public ICollection<MakeConnection> MakeConnections { get; set; } = new List<MakeConnection>();
}
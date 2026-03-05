public class MakeConnection
{
    public int Id { get; set; } 
    
    public Guid Uid { get; set; } = Guid.NewGuid();
    public int OrganizationId { get; set; }
    public Organization Organization { get; set; } = null!;

    public int AddedByUserId { get; set; }
    public User AddedByUser { get; set; } = null!;

    public string Label { get; set; } = string.Empty; 
    public string EncryptedApiKey { get; set; } = string.Empty; 
    
    public string Zone { get; set; } = "us1";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}
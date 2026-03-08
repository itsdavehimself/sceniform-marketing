namespace DiffDetector.Api.Models;

public class AppDomainCache
{
    public int Id { get; set; }
  
    public string AccountName { get; set; } = string.Empty;
    
    public string Domain { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
public class MakeConnectionDto
    {
        public Guid Uid { get; set; }
        public string Label { get; set; } = string.Empty;
        public string Zone { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
    }
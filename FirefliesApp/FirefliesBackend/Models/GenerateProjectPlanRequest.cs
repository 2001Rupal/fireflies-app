namespace FirefliesBackend.Models
{
    public class GenerateProjectPlanRequest
    {
        public int DurationWeeks { get; set; }
        public string AdditionalDetails { get; set; } = string.Empty;
         public double Temperature { get; set; } = 0.3;
    }

    public class ProjectPlanResponse
    {
        public int MeetingId { get; set; }
        public string ProjectPlan { get; set; } = string.Empty;
        public int DurationWeeks { get; set; }
        public string AdditionalDetails { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
        public string? MeetingTitle { get; set; }
        public string? FirefliesId { get; set; }
        public double Temperature { get; set; } = 0.3;
    }
}




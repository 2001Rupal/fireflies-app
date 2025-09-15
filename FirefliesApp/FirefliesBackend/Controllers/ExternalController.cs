




using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using FirefliesBackend.Services;
using System;
using System.Linq;
using FirefliesBackend.Data;
using FirefliesBackend.Models;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using System.Net.Http;
using Microsoft.Extensions.Configuration;

namespace FirefliesBackend.Controllers
{
    [ApiController]
    [Route("api/external")]
    public class ExternalController : ControllerBase
    {
        private readonly IFirefliesClient _ff;
        private readonly AppDbContext _db;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public ExternalController(IFirefliesClient ff, AppDbContext db, IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _ff = ff;
            _db = db;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        [HttpGet("meetings")]
        public async Task<IActionResult> GetMeetings(int limit = 25)
        {
            var query = @"query Transcripts($limit:Int){
              transcripts(limit:$limit){
                id title date duration summary { overview short_summary }
              }
            }";

            var doc = await _ff.QueryAsync(query, new { limit });
            return Ok(doc.RootElement.GetProperty("data").GetProperty("transcripts"));
        }

        [HttpGet("meetings/{id}")]
        public async Task<IActionResult> GetMeeting(string id)
        {
            var dbMeeting = await _db.Meetings.FirstOrDefaultAsync(m => m.FirefliesId == id);
            if (dbMeeting != null)
            {
                var mapped = new
                {
                    id = dbMeeting.FirefliesId,
                    title = dbMeeting.Title,
                    date = dbMeeting.MeetingDate,
                    duration = dbMeeting.DurationSeconds,
                    sentences = dbMeeting.TranscriptJson,
                    summary = new
                    {
                        overview = dbMeeting.Summary,
                        short_summary = dbMeeting.Summary,
                        bullet_gist = dbMeeting.BulletGist,
                        action_items = dbMeeting.ActionItems,
                        keywords = dbMeeting.Keywords,
                        extended_sections = dbMeeting.ExtendedSectionsJson
                    },
                    audio_url = dbMeeting.AudioUrl,
                    summaryPreferencesJson = dbMeeting.SummaryPreferencesJson,
                    userEditedSummary = dbMeeting.UserEditedSummary,
                    analytics = dbMeeting.AnalyticsJson != null ? JsonSerializer.Deserialize<object>(dbMeeting.AnalyticsJson) : null
                };
                return Ok(mapped);
            }

            try
            {
                var query = @"query Transcript($transcriptId: String!) { 
                    transcript(id: $transcriptId) { 
                        id title date duration audio_url organizer_email
                        sentences { text speaker_name }
                        summary { 
                            overview short_summary bullet_gist action_items keywords
                            extended_sections { title content }
                        }
                        analytics { 
                            sentiments { negative_pct neutral_pct positive_pct } 
                            speakers { name } 
                        }
                    }
                }";

                var doc = await _ff.QueryAsync(query, new { transcriptId = id });
                var transcriptEl = doc.RootElement.GetProperty("data").GetProperty("transcript");

                DateTime? meetingDate = null;
                if (transcriptEl.TryGetProperty("date", out var dateEl) && dateEl.ValueKind == JsonValueKind.Number && dateEl.TryGetInt64(out var unixTimestamp))
                {
                    meetingDate = DateTimeOffset.FromUnixTimeMilliseconds(unixTimestamp).UtcDateTime;
                }

                var meeting = new Meeting
                {
                    FirefliesId = transcriptEl.GetProperty("id").GetString() ?? id,
                    Title = transcriptEl.GetProperty("title").GetString() ?? "",
                    MeetingDate = meetingDate,
                    OrganizerEmail = transcriptEl.TryGetProperty("organizer_email", out var emailEl) ? emailEl.GetString() : null,
                    DurationSeconds = transcriptEl.TryGetProperty("duration", out var dur) && dur.TryGetDouble(out var duration) ? (int)Math.Round(duration) : 0,
                    TranscriptJson = transcriptEl.TryGetProperty("sentences", out var s) ? s.ToString() : "[]",
                    AudioUrl = transcriptEl.TryGetProperty("audio_url", out var audioUrlEl) ? audioUrlEl.GetString() : null
                };

                if (transcriptEl.TryGetProperty("summary", out var summaryEl) && summaryEl.ValueKind != JsonValueKind.Null)
                {
                    meeting.Summary = summaryEl.TryGetProperty("overview", out var ov) ? ov.GetString() : "";
                    meeting.BulletGist = summaryEl.TryGetProperty("bullet_gist", out var bgEl) ? bgEl.GetString() : null;
                    meeting.ActionItems = summaryEl.TryGetProperty("action_items", out var aiEl) ? aiEl.ToString() : null;
                    meeting.Keywords = summaryEl.TryGetProperty("keywords", out var kwEl) ? kwEl.ToString() : null;
                    meeting.ExtendedSectionsJson = summaryEl.TryGetProperty("extended_sections", out var extEl) ? extEl.ToString() : null;
                }

                if (transcriptEl.TryGetProperty("analytics", out var analyticsEl) && analyticsEl.ValueKind != JsonValueKind.Null)
                {
                    meeting.AnalyticsJson = analyticsEl.ToString();
                    
                    if (analyticsEl.TryGetProperty("sentiments", out var sentimentsEl) && sentimentsEl.ValueKind != JsonValueKind.Null)
                    {
                        meeting.SentimentPositivePct = sentimentsEl.TryGetProperty("positive_pct", out var posEl) && posEl.TryGetDouble(out var pos) ? pos : null;
                        meeting.SentimentNeutralPct = sentimentsEl.TryGetProperty("neutral_pct", out var neuEl) && neuEl.TryGetDouble(out var neu) ? neu : null;
                        meeting.SentimentNegativePct = sentimentsEl.TryGetProperty("negative_pct", out var negEl) && negEl.TryGetDouble(out var neg) ? neg : null;
                    }

                    // --- Calculate Participant Count ---
                    int participantCount = 0;
                    if (analyticsEl.TryGetProperty("speakers", out var speakersEl) && speakersEl.ValueKind == JsonValueKind.Array)
                    {
                        participantCount = speakersEl.EnumerateArray()
                            .Count(speaker => speaker.TryGetProperty("name", out var nameEl) && 
                                              nameEl.GetString()?.ToLowerInvariant() != "fred (fireflies.ai)");
                    }
                    meeting.ParticipantCount = participantCount;
                }

                _db.Meetings.Add(meeting);
                await _db.SaveChangesAsync();

                return Ok(new { transcript = transcriptEl, dbId = meeting.Id });
            }
            catch (HttpRequestException httpEx)
            {
                Console.WriteLine($"[ERROR] Network error fetching from Fireflies: {httpEx.Message}");
                return StatusCode(503, new { message = "The Fireflies service is temporarily unavailable. Please try again later." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Failed processing Fireflies data: {ex}");
                return StatusCode(500, new { message = "An unexpected error occurred while processing data from Fireflies." });
            }
        }

        [HttpPost("generate-files")]
        public async Task<IActionResult> GenerateFiles([FromBody] GenerateFilesRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Summary))
                return BadRequest("Summary is required.");

            var apiKey = _configuration["OpenAI:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
                return StatusCode(500, "OpenAI API key not configured.");

            var client = _httpClientFactory.CreateClient("OpenAI");
            var files = await ChatGptService.GenerateFilesFromSummary(client, req.Summary, apiKey);
            return Ok(files);
        }

        [HttpPost("save-files")]
        public async Task<IActionResult> SaveFiles([FromBody] SaveFilesRequest req)
        {
            var meeting = await _db.Meetings.FirstOrDefaultAsync(m => m.Id == req.MeetingId);
            if (meeting == null) return NotFound();

            foreach (var file in req.Files)
            {
                var name = System.IO.Path.GetFileNameWithoutExtension(file.Name).ToLowerInvariant();
                if (name == "markdown")
                    meeting.Markdown = file.Content;
                else if (name == "functionaldoc")
                    meeting.FunctionalDoc = file.Content;
                else if (name == "mockups")
                    meeting.Mockups = file.Content;
            }

            meeting.GeneratedFilesJson = JsonSerializer.Serialize(req.Files);
            await _db.SaveChangesAsync();
            return Ok();
        }
    }
}

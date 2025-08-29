
// using Microsoft.AspNetCore.Mvc;
// using System.Threading.Tasks;
// using FirefliesBackend.Services;
// using System;
// using System.Linq;
// using FirefliesBackend.Data;
// using FirefliesBackend.Models;
// using System.Text.Json;
// using Microsoft.EntityFrameworkCore;
// using System.Net.Http;
// using Microsoft.Extensions.Configuration;
// using Microsoft.AspNetCore.Authorization;

// namespace FirefliesBackend.Controllers
// {
//     [ApiController]
//     [Route("api/external")]
//     public class ExternalController : ControllerBase
//     {
//         private readonly IFirefliesClient _ff;
//         private readonly AppDbContext _db;
//         private readonly IHttpClientFactory _httpClientFactory;
//         private readonly IConfiguration _configuration;

//         public ExternalController(IFirefliesClient ff, AppDbContext db, IHttpClientFactory httpClientFactory, IConfiguration configuration)
//         {
//             _ff = ff;
//             _db = db;
//             _httpClientFactory = httpClientFactory;
//             _configuration = configuration;
//         }

//            [HttpGet("meetings")]
//         public async Task<IActionResult> GetMeetings(int limit = 25)
//         {
//             var query = @"query Transcripts($limit:Int){
//               transcripts(limit:$limit){
//                 id title date duration summary { overview short_summary }
//               }
//             }";

//             var doc = await _ff.QueryAsync(query, new { limit });
//             return Ok(doc.RootElement.GetProperty("data").GetProperty("transcripts"));
//         }


//         [HttpGet("meetings/{id}")]
//         public async Task<IActionResult> GetMeeting(string id)
//         {
//             var dbMeeting = await _db.Meetings.FirstOrDefaultAsync(m => m.FirefliesId == id);
//             if (dbMeeting != null)
//             {
//                 var mapped = new
//                 {
//                     id = dbMeeting.FirefliesId,
//                     title = dbMeeting.Title,
//                     date = dbMeeting.MeetingDate,
//                     duration = dbMeeting.DurationSeconds,
//                     sentences = dbMeeting.TranscriptJson,
//                     summary = new
//                     {
//                          overview = dbMeeting.Summary,
//                 short_summary = dbMeeting.Summary,
//                 bullet_gist = dbMeeting.BulletGist,
//                 action_items = dbMeeting.ActionItems,
//                 keywords = dbMeeting.Keywords,
//                 extended_sections = dbMeeting.ExtendedSectionsJson
//                     },
//                       audio_url = dbMeeting.AudioUrl,
//             summaryPreferencesJson = dbMeeting.SummaryPreferencesJson,
//             userEditedSummary = dbMeeting.UserEditedSummary
//                 };
//                 return Ok(mapped);
//             }

//                try
//     {
//         var query = @"query Transcript($id:String!){
//             transcript(id:$id){
//             id title date duration audio_url organizer_email
//             sentences { index text start_time end_time speaker_name }
//             summary { 
//                 overview short_summary bullet_gist action_items keywords
//                 extended_sections { title content }
//             }
//             }
//         }";

//         var doc = await _ff.QueryAsync(query, new { id });
//         var transcriptEl = doc.RootElement.GetProperty("data").GetProperty("transcript");

// //Parse Meeting Date into dateTime
//         DateTime? meetingDate = null;
//         if (transcriptEl.TryGetProperty("date", out var dateEl))
//         {
//             if (dateEl.ValueKind == JsonValueKind.Number && dateEl.TryGetInt64(out var unixTimestamp))
//             {
//                 meetingDate = DateTimeOffset.FromUnixTimeMilliseconds(unixTimestamp).UtcDateTime;
//             }
//             else if (dateEl.ValueKind == JsonValueKind.String && dateEl.TryGetDateTimeOffset(out var dto))
//             {
//                 meetingDate = dto.UtcDateTime;
//             }
//         }

//          // Extract organizer email
//                 string? organizerEmail = null;
//                 if (transcriptEl.TryGetProperty("organizer_email", out var emailEl) && emailEl.ValueKind != JsonValueKind.Null)
//                 {
//                     organizerEmail = emailEl.GetString();
//                 }

//         var meeting = new Meeting
//         {
//             FirefliesId = transcriptEl.GetProperty("id").GetString() ?? id,
//             Title = transcriptEl.GetProperty("title").GetString() ?? "",
//             MeetingDate = meetingDate,
//             OrganizerEmail = organizerEmail
//         };


//         string? bulletGist = null;
//         string? actionItems = null;
//         string? keywords = null;
//         string? extendedSectionsJson = null;
//         if (transcriptEl.TryGetProperty("summary", out var summaryEl) && summaryEl.ValueKind != JsonValueKind.Null)
//         {
//             if (summaryEl.TryGetProperty("bullet_gist", out var bgEl) && bgEl.ValueKind != JsonValueKind.Null) bulletGist = bgEl.GetString();
//             if (summaryEl.TryGetProperty("action_items", out var aiEl) && aiEl.ValueKind != JsonValueKind.Null) actionItems = aiEl.ToString();
//             if (summaryEl.TryGetProperty("keywords", out var kwEl) && kwEl.ValueKind != JsonValueKind.Null) keywords = kwEl.ToString();
//             if (summaryEl.TryGetProperty("extended_sections", out var extEl) && extEl.ValueKind == JsonValueKind.Array) extendedSectionsJson = extEl.ToString();
//         }
//         meeting.DurationSeconds = transcriptEl.TryGetProperty("duration", out var dur) && dur.TryGetDouble(out var duration) ? (int)Math.Round(duration) : 0;
//         meeting.TranscriptJson = transcriptEl.TryGetProperty("sentences", out var s) ? s.ToString() : "[]";
//         meeting.Summary = transcriptEl.TryGetProperty("summary", out var su) && su.TryGetProperty("overview", out var ov) ? ov.GetString() ?? "" : "";
//         meeting.ActionItems = actionItems;
//         meeting.Keywords = keywords;
//         meeting.BulletGist = bulletGist;
//         meeting.ExtendedSectionsJson = extendedSectionsJson;
//         meeting.AudioUrl = transcriptEl.TryGetProperty("audio_url", out var audioUrlEl) ? audioUrlEl.GetString() : null;

//         Console.WriteLine($"[LOG 1 - ExternalController SAVE]: Fireflies se aayi date (UTC): {meeting.MeetingDate}, Kind: {meeting.MeetingDate?.Kind}");
//         Console.WriteLine($"[LOG 2 - ExternalController SAVE]: Organizer Email: {meeting.OrganizerEmail}");

//         _db.Meetings.Add(meeting);
//         // Save the meeting to the database
//         await _db.SaveChangesAsync();

//         var responseData = new {
//             transcript = transcriptEl,
//             dbId = meeting.Id
//         };

//         return Ok(JsonSerializer.SerializeToElement(responseData));
//     }
//     catch (HttpRequestException httpEx)
//     {

//         //503 = Fireflies service/network issue.
//         Console.WriteLine($"[ERROR - ExternalController] Network error fetching from Fireflies: {httpEx.Message}");
//         return StatusCode(503, new { message = "The Fireflies service is temporarily unavailable. Please try again later.", error = "NetworkError" });
//     }
//     catch (Exception ex)
//     {

//         //500 = Unexpected error in parsing/DB.
//         Console.WriteLine("Failed processing Fireflies data: " + ex);
//         return StatusCode(500, new { message = "An unexpected error occurred while processing data from Fireflies.", error = ex.GetType().Name });
//     }
// }

//         [HttpPost("generate-files")]
//         public async Task<IActionResult> GenerateFiles([FromBody] GenerateFilesRequest req)
//         {
//             if (req == null || string.IsNullOrWhiteSpace(req.Summary))
//                 return BadRequest("Summary is required.");

//             var apiKey = _configuration["OpenAI:ApiKey"];
//             if (string.IsNullOrWhiteSpace(apiKey))
//                 return StatusCode(500, "OpenAI API key not configured.");

//             var client = _httpClientFactory.CreateClient("OpenAI");
//             var files = await ChatGptService.GenerateFilesFromSummary(client, req.Summary, apiKey);
//             return Ok(files);
//         }

//         [HttpPost("save-files")]
//         public async Task<IActionResult> SaveFiles([FromBody] SaveFilesRequest req)
//         {
//             var meeting = await _db.Meetings.FirstOrDefaultAsync(m => m.Id == req.MeetingId);
//             if (meeting == null) return NotFound();

//             foreach (var file in req.Files)
//             {
//                 var name = System.IO.Path.GetFileNameWithoutExtension(file.Name).ToLowerInvariant();
//                 if (name == "markdown")
//                     meeting.Markdown = file.Content;
//                 else if (name == "functionaldoc")
//                     meeting.FunctionalDoc = file.Content;
//                 else if (name == "mockups")
//                     meeting.Mockups = file.Content;
//             }

//             meeting.GeneratedFilesJson = JsonSerializer.Serialize(req.Files);
//             await _db.SaveChangesAsync();
//             return Ok();
//         }
//     }
// }


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
using Microsoft.AspNetCore.Authorization;

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
            analytics = dbMeeting.AnalyticsJson != null ? JsonSerializer.Deserialize<object>(dbMeeting.AnalyticsJson) : new
            {
                sentiments = new
                {
                    positive_pct = dbMeeting.SentimentPositivePct,
                    neutral_pct = dbMeeting.SentimentNeutralPct,
                    negative_pct = dbMeeting.SentimentNegativePct
                }
            }
                };
                return Ok(mapped);
            }

               try
    {
        var query = @"query Transcript($transcriptId: String!) { 
            transcript(id: $transcriptId) { 
                id title date duration audio_url organizer_email
                sentences { index speaker_name speaker_id text raw_text start_time end_time ai_filters { task pricing metric question date_and_time text_cleanup sentiment } }
                summary { 
                    overview short_summary bullet_gist action_items keywords
                    extended_sections { title content }
                }
                analytics { 
                    sentiments { 
                        negative_pct neutral_pct positive_pct 
                    } 
                    categories { questions date_times metrics tasks } 
                    speakers { speaker_id name duration word_count longest_monologue monologues_count filler_words questions duration_pct words_per_minute } 
                }
            }
        }";

        var doc = await _ff.QueryAsync(query, new { transcriptId = id });
        var transcriptEl = doc.RootElement.GetProperty("data").GetProperty("transcript");

//Parse Meeting Date into dateTime
        DateTime? meetingDate = null;
        if (transcriptEl.TryGetProperty("date", out var dateEl))
        {
            if (dateEl.ValueKind == JsonValueKind.Number && dateEl.TryGetInt64(out var unixTimestamp))
            {
                meetingDate = DateTimeOffset.FromUnixTimeMilliseconds(unixTimestamp).UtcDateTime;
            }
            else if (dateEl.ValueKind == JsonValueKind.String && dateEl.TryGetDateTimeOffset(out var dto))
            {
                meetingDate = dto.UtcDateTime;
            }
        }

         // Extract organizer email
                string? organizerEmail = null;
                if (transcriptEl.TryGetProperty("organizer_email", out var emailEl) && emailEl.ValueKind != JsonValueKind.Null)
                {
                    organizerEmail = emailEl.GetString();
                }

        var meeting = new Meeting
        {
            FirefliesId = transcriptEl.GetProperty("id").GetString() ?? id,
            Title = transcriptEl.GetProperty("title").GetString() ?? "",
            MeetingDate = meetingDate,
            OrganizerEmail = organizerEmail
        };

        // Extract sentiment analytics
        double? sentimentPositivePct = null;
        double? sentimentNeutralPct = null;
        double? sentimentNegativePct = null;
        string? analyticsJson = null;

        if (transcriptEl.TryGetProperty("analytics", out var analyticsEl) && analyticsEl.ValueKind != JsonValueKind.Null)
        {
            analyticsJson = analyticsEl.ToString();
            
            if (analyticsEl.TryGetProperty("sentiments", out var sentimentsEl) && sentimentsEl.ValueKind != JsonValueKind.Null)
            {
                if (sentimentsEl.TryGetProperty("positive_pct", out var posEl) && posEl.ValueKind != JsonValueKind.Null)
                {
                    sentimentPositivePct = posEl.TryGetDouble(out var pos) ? pos : null;
                }
                if (sentimentsEl.TryGetProperty("neutral_pct", out var neuEl) && neuEl.ValueKind != JsonValueKind.Null)
                {
                    sentimentNeutralPct = neuEl.TryGetDouble(out var neu) ? neu : null;
                }
                if (sentimentsEl.TryGetProperty("negative_pct", out var negEl) && negEl.ValueKind != JsonValueKind.Null)
                {
                    sentimentNegativePct = negEl.TryGetDouble(out var neg) ? neg : null;
                }
            }
        }

        string? bulletGist = null;
        string? actionItems = null;
        string? keywords = null;
        string? extendedSectionsJson = null;
        if (transcriptEl.TryGetProperty("summary", out var summaryEl) && summaryEl.ValueKind != JsonValueKind.Null)
        {
            if (summaryEl.TryGetProperty("bullet_gist", out var bgEl) && bgEl.ValueKind != JsonValueKind.Null) bulletGist = bgEl.GetString();
            if (summaryEl.TryGetProperty("action_items", out var aiEl) && aiEl.ValueKind != JsonValueKind.Null) actionItems = aiEl.ToString();
            if (summaryEl.TryGetProperty("keywords", out var kwEl) && kwEl.ValueKind != JsonValueKind.Null) keywords = kwEl.ToString();
            if (summaryEl.TryGetProperty("extended_sections", out var extEl) && extEl.ValueKind == JsonValueKind.Array) extendedSectionsJson = extEl.ToString();
        }
        meeting.DurationSeconds = transcriptEl.TryGetProperty("duration", out var dur) && dur.TryGetDouble(out var duration) ? (int)Math.Round(duration) : 0;
        meeting.TranscriptJson = transcriptEl.TryGetProperty("sentences", out var s) ? s.ToString() : "[]";
        meeting.Summary = transcriptEl.TryGetProperty("summary", out var su) && su.TryGetProperty("overview", out var ov) ? ov.GetString() ?? "" : "";
        meeting.ActionItems = actionItems;
        meeting.Keywords = keywords;
        meeting.BulletGist = bulletGist;
        meeting.ExtendedSectionsJson = extendedSectionsJson;
        meeting.AudioUrl = transcriptEl.TryGetProperty("audio_url", out var audioUrlEl) ? audioUrlEl.GetString() : null;

        // Store sentiment data
        meeting.SentimentPositivePct = sentimentPositivePct;
        meeting.SentimentNeutralPct = sentimentNeutralPct;
        meeting.SentimentNegativePct = sentimentNegativePct;
        meeting.AnalyticsJson = analyticsJson;

        Console.WriteLine($"[LOG 1 - ExternalController SAVE]: Fireflies se aayi date (UTC): {meeting.MeetingDate}, Kind: {meeting.MeetingDate?.Kind}");
        Console.WriteLine($"[LOG 2 - ExternalController SAVE]: Organizer Email: {meeting.OrganizerEmail}");
        Console.WriteLine($"[LOG 3 - ExternalController SAVE]: Sentiment - Positive: {meeting.SentimentPositivePct}%, Neutral: {meeting.SentimentNeutralPct}%, Negative: {meeting.SentimentNegativePct}%");

        _db.Meetings.Add(meeting);
        // Save the meeting to the database
        await _db.SaveChangesAsync();

        var responseData = new {
            transcript = transcriptEl,
            dbId = meeting.Id
        };

        return Ok(JsonSerializer.SerializeToElement(responseData));
    }
    catch (HttpRequestException httpEx)
    {

        //503 = Fireflies service/network issue.
        Console.WriteLine($"[ERROR - ExternalController] Network error fetching from Fireflies: {httpEx.Message}");
        return StatusCode(503, new { message = "The Fireflies service is temporarily unavailable. Please try again later.", error = "NetworkError" });
    }
    catch (Exception ex)
    {

        //500 = Unexpected error in parsing/DB.
        Console.WriteLine("Failed processing Fireflies data: " + ex);
        return StatusCode(500, new { message = "An unexpected error occurred while processing data from Fireflies.", error = ex.GetType().Name });
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
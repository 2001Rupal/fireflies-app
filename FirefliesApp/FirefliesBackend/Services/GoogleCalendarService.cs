

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace FirefliesBackend.Services
{
    public interface IGoogleCalendarService
    {
        Task<List<UpcomingMeeting>> GetUpcomingMeetingsWithFireflies(string accessToken);
        string GetAuthUrl();
        Task<string> ExchangeCodeForToken(string code);
        Task<bool> AddAttendeeToEvent(string accessToken, string eventId, string email, string? displayName);
        Task<bool> RemoveAttendeeFromEvent(string accessToken, string eventId, string email);
        Task<bool> UpdateAttendeeStatus(string accessToken, string eventId, string email, string status);
        
        // NEW METHODS FOR CANCEL AND RESCHEDULE
        Task<bool> CancelMeeting(string accessToken, string eventId, bool sendNotifications = true);
        Task<bool> RescheduleMeeting(string accessToken, string eventId, DateTime newStartTime, DateTime? newEndTime = null, bool sendNotifications = true);
    }
    public class UpdateEventTimeDto
    {
        [JsonPropertyName("start")]
        public EventDateTime Start { get; set; }

        [JsonPropertyName("end")]
        public EventDateTime End { get; set; }
    }

    public class EventDateTime
    {
        [JsonPropertyName("dateTime")]
        public string DateTime { get; set; }

        [JsonPropertyName("timeZone")]
        public string TimeZone { get; set; }
    }



    public class GoogleCalendarService : IGoogleCalendarService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly string _clientId;
        private readonly string _clientSecret;
        private readonly string _redirectUri;
        private readonly string[] _firefliesEmails = { "fred@fireflies.ai", "bot@fireflies.ai", "notetaker@fireflies.ai" };

        private readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = null,
            WriteIndented = false,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        public GoogleCalendarService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _clientId = _configuration["Google:ClientId"] ?? throw new InvalidOperationException("Google Client ID not configured");
            _clientSecret = _configuration["Google:ClientSecret"] ?? throw new InvalidOperationException("Google Client Secret not configured");
            _redirectUri = _configuration["Google:RedirectUri"] ?? throw new InvalidOperationException("Google Redirect URI not configured");
        }

        // ... [Existing methods remain the same - GetAuthUrl, ExchangeCodeForToken, GetUpcomingMeetingsWithFireflies, etc.]

        public string GetAuthUrl()
        {
            var scopes = "https://www.googleapis.com/auth/calendar.events";
            var authUrl = $"https://accounts.google.com/o/oauth2/v2/auth?" +
                         $"client_id={Uri.EscapeDataString(_clientId)}&" +
                         $"redirect_uri={Uri.EscapeDataString(_redirectUri)}&" +
                         $"response_type=code&" +
                         $"scope={Uri.EscapeDataString(scopes)}&" +
                         $"access_type=offline&" +
                         $"prompt=consent";
            return authUrl;
        }

        public async Task<string> ExchangeCodeForToken(string code)
        {
            var tokenRequest = new Dictionary<string, string>
            {
                {"client_id", _clientId}, 
                {"client_secret", _clientSecret}, 
                {"code", code},
                {"grant_type", "authorization_code"}, 
                {"redirect_uri", _redirectUri}
            };
            
            var content = new FormUrlEncodedContent(tokenRequest);
            var response = await _httpClient.PostAsync("https://oauth2.googleapis.com/token", content);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Token exchange failed: {response.StatusCode} - {errorContent}");
                throw new HttpRequestException($"Token exchange failed: {response.StatusCode} - {errorContent}");
            }
            
            var jsonResponse = await response.Content.ReadAsStringAsync();
            var tokenResponse = JsonSerializer.Deserialize<JsonElement>(jsonResponse);
            
            if (!tokenResponse.TryGetProperty("access_token", out var accessTokenElement))
            {
                throw new InvalidOperationException("Access token not found in response");
            }
            
            return accessTokenElement.GetString() ?? throw new InvalidOperationException("Access token is null");
        }

        // NEW METHOD: Cancel Meeting
        public async Task<bool> CancelMeeting(string accessToken, string eventId, bool sendNotifications = true)
        {
            try
            {
                Console.WriteLine($"[DEBUG] Cancelling meeting {eventId}");
                
                var deleteUrl = $"https://www.googleapis.com/calendar/v3/calendars/primary/events/{eventId}?sendNotifications={sendNotifications.ToString().ToLowerInvariant()}";

                using var request = new HttpRequestMessage(HttpMethod.Delete, deleteUrl);
                request.Headers.Add("Authorization", $"Bearer {accessToken}");

                var response = await _httpClient.SendAsync(request);

                if (response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[SUCCESS] Meeting {eventId} cancelled successfully");
                    return true;
                }

                var errorBody = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"[ERROR] Failed to cancel meeting: {response.StatusCode}");
                Console.WriteLine($"[ERROR] Response body: {errorBody}");
                
                // Handle specific error cases
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    Console.WriteLine($"[WARNING] Meeting {eventId} not found (may already be deleted)");
                    return true; // Consider it successful if already deleted
                }

                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Exception cancelling meeting {eventId}: {ex.Message}");
                return false;
            }
        }


        // NEW METHOD: Reschedule Meeting
        public async Task<bool> RescheduleMeeting(string accessToken, string eventId, DateTime newStartTime, DateTime? newEndTime = null, bool sendNotifications = true)
        {
            try
            {
                Console.WriteLine($"[DEBUG] Rescheduling meeting {eventId} to {newStartTime}");
                
                // 1. Get current event data to find the duration and time zone
                var eventData = await GetEventData(accessToken, eventId);
                if (!eventData.HasValue)
                {
                    Console.WriteLine($"[ERROR] Could not retrieve event {eventId} for rescheduling");
                    return false;
                }

                var existingEvent = eventData.Value;
                
                // 2. Safely extract time zone and calculate duration to preserve them
                string timeZone = "UTC"; // Default to UTC as a safe fallback
                if (existingEvent.TryGetProperty("start", out var startProp) && startProp.TryGetProperty("timeZone", out var tzProp))
                {
                    timeZone = tzProp.GetString() ?? timeZone;
                }

                DateTime existingStartTime = startProp.TryGetProperty("dateTime", out var startDtProp) ? startDtProp.GetDateTime() : DateTime.UtcNow;
                DateTime existingEndTime = existingEvent.TryGetProperty("end", out var endProp) && endProp.TryGetProperty("dateTime", out var endDtProp) 
                    ? endDtProp.GetDateTime() 
                    : existingStartTime.AddHours(1);

                var duration = existingEndTime - existingStartTime;

                // 3. Construct the PATCH payload with the original time zone
                var updatePayload = new UpdateEventTimeDto
                {
                    Start = new EventDateTime
                    {
                        DateTime = newStartTime.ToString("o"), // "o" format is ISO 8601 round-trip
                        TimeZone = timeZone
                    },
                    End = new EventDateTime
                    {
                        DateTime = (newEndTime ?? newStartTime.Add(duration)).ToString("o"),
                        TimeZone = timeZone
                    }
                };
                
                var updateUrl = $"https://www.googleapis.com/calendar/v3/calendars/primary/events/{eventId}?sendNotifications={sendNotifications.ToString().ToLowerInvariant()}";
                var jsonPayload = JsonSerializer.Serialize(updatePayload, _jsonOptions);
                Console.WriteLine($"[DEBUG] PATCH payload: {jsonPayload}");

                // 4. Use HttpMethod("PATCH") for a partial and safe update
                using var request = new HttpRequestMessage(new HttpMethod("PATCH"), updateUrl);
                request.Headers.Add("Authorization", $"Bearer {accessToken}");
                request.Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(request);

                if (response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[SUCCESS] Meeting {eventId} rescheduled successfully to {newStartTime}");
                    return true;
                }

                var errorBody = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"[ERROR] Failed to reschedule meeting: {response.StatusCode}");
                Console.WriteLine($"[ERROR] Response body: {errorBody}");

                if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
        throw new UnauthorizedAccessException("Your access token has expired. Please reconnect your calendar.");
    if (response.StatusCode == System.Net.HttpStatusCode.Forbidden)
        throw new InvalidOperationException("You do not have permission to modify this meeting.");
    if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        throw new InvalidOperationException("Meeting not found. It may have been deleted or cancelled.");


                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Exception rescheduling meeting {eventId}: {ex.Message}");
                return false;
            }
        }


        // Helper method to parse JsonElement values
        private object ParseJsonValue(JsonElement element)
        {
            return element.ValueKind switch
            {
                JsonValueKind.String => element.GetString() ?? "",
                JsonValueKind.Number => element.TryGetInt32(out var intVal) ? intVal : element.GetDouble(),
                JsonValueKind.True => true,
                JsonValueKind.False => false,
                JsonValueKind.Array => element.EnumerateArray().Select(ParseJsonValue).ToList(),
                JsonValueKind.Object => element.EnumerateObject().ToDictionary(prop => prop.Name, prop => ParseJsonValue(prop.Value)),
                JsonValueKind.Null => null,
                _ => element.GetRawText()
            };
        }

        // ... [All existing methods remain unchanged - AddAttendeeToEvent, RemoveAttendeeFromEvent, etc.]

        public async Task<List<UpcomingMeeting>> GetUpcomingMeetingsWithFireflies(string accessToken)
        {
            var meetings = new List<UpcomingMeeting>();
            
            try
            {
                var timeMin = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
                var requestUrl = $"https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin={timeMin}&singleEvents=true&orderBy=startTime&maxResults=100";
                
                using var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
                request.Headers.Add("Authorization", $"Bearer {accessToken}");
                
                var response = await _httpClient.SendAsync(request);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Calendar API error: {response.StatusCode} - {errorContent}");
                    
                    if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized) 
                        throw new UnauthorizedAccessException("Google Calendar access token is invalid or expired");
                    
                    throw new HttpRequestException($"Calendar API request failed: {response.StatusCode} - {errorContent}");
                }
                
                var jsonResponse = await response.Content.ReadAsStringAsync();
                var calendarData = JsonSerializer.Deserialize<JsonElement>(jsonResponse);
                
                if (!calendarData.TryGetProperty("items", out var items) || items.ValueKind != JsonValueKind.Array) 
                    return meetings;
                
                foreach (var item in items.EnumerateArray())
                {
                    if (HasFirefliesAttendee(item))
                    {
                        var meeting = ParseMeeting(item);
                        if (meeting != null) meetings.Add(meeting);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching calendar events: {ex.Message}");
                throw;
            }
            
            return meetings.OrderBy(m => m.StartTime).ToList();
        }

        public async Task<bool> AddAttendeeToEvent(string accessToken, string eventId, string email, string? displayName)
        {
            try
            {
                Console.WriteLine($"[DEBUG] Adding attendee {email} to event {eventId}");
                
                var eventData = await GetEventData(accessToken, eventId);
                if (!eventData.HasValue)
                {
                    Console.WriteLine($"[ERROR] Could not retrieve event {eventId}");
                    return false;
                }

                var currentAttendees = ParseAttendeesFromEvent(eventData.Value);
                
                if (currentAttendees.Any(a => string.Equals(GetEmailFromAttendee(a), email, StringComparison.OrdinalIgnoreCase)))
                {
                    Console.WriteLine($"[INFO] Attendee {email} already exists in event {eventId}");
                    return true;
                }

                currentAttendees.Add(CreateNewAttendee(email, displayName));
                
                return await UpdateEventAttendees(accessToken, eventId, currentAttendees);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Adding attendee failed: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> RemoveAttendeeFromEvent(string accessToken, string eventId, string email)
        {
            try
            {
                Console.WriteLine($"[DEBUG] Removing attendee {email} from event {eventId}");
                
                var eventData = await GetEventData(accessToken, eventId);
                if (!eventData.HasValue) return false;

                var currentAttendees = ParseAttendeesFromEvent(eventData.Value);
                var updatedAttendees = currentAttendees
                    .Where(a => !string.Equals(GetEmailFromAttendee(a), email, StringComparison.OrdinalIgnoreCase))
                    .ToList();

                if (currentAttendees.Count == updatedAttendees.Count)
                {
                    Console.WriteLine($"[INFO] Attendee {email} not found in event {eventId}");
                    return true;
                }

                return await UpdateEventAttendees(accessToken, eventId, updatedAttendees);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Removing attendee failed: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> UpdateAttendeeStatus(string accessToken, string eventId, string email, string status)
        {
            try
            {
                Console.WriteLine($"[DEBUG] Updating attendee {email} status to {status} in event {eventId}");
                
                var validStatuses = new[] { "needsAction", "declined", "tentative", "accepted" };
                if (!validStatuses.Contains(status))
                {
                    Console.WriteLine($"[ERROR] Invalid status: {status}. Valid statuses: {string.Join(", ", validStatuses)}");
                    return false;
                }

                var eventData = await GetEventData(accessToken, eventId);
                if (!eventData.HasValue) return false;

                var currentAttendees = ParseAttendeesFromEvent(eventData.Value);
                var attendeeToUpdate = currentAttendees.FirstOrDefault(a => 
                    string.Equals(GetEmailFromAttendee(a), email, StringComparison.OrdinalIgnoreCase));

                if (attendeeToUpdate == null)
                {
                    Console.WriteLine($"[ERROR] Attendee {email} not found in event {eventId}");
                    return false;
                }

                attendeeToUpdate["responseStatus"] = status;
                
                return await UpdateEventAttendees(accessToken, eventId, currentAttendees);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Updating attendee status failed: {ex.Message}");
                return false;
            }
        }

        // HELPER METHODS

        private async Task<JsonElement?> GetEventData(string accessToken, string eventId)
        {
            var eventUrl = $"https://www.googleapis.com/calendar/v3/calendars/primary/events/{eventId}";
            
            using var request = new HttpRequestMessage(HttpMethod.Get, eventUrl);
            request.Headers.Add("Authorization", $"Bearer {accessToken}");

            var response = await _httpClient.SendAsync(request);
            
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"[ERROR] Failed to get event {eventId}: {response.StatusCode} - {error}");
                return null;
            }

            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<JsonElement>(json);
        }

        private List<Dictionary<string, object>> ParseAttendeesFromEvent(JsonElement eventData)
        {
            var attendees = new List<Dictionary<string, object>>();
            
            if (eventData.TryGetProperty("attendees", out var attendeesArray) && 
                attendeesArray.ValueKind == JsonValueKind.Array)
            {
                foreach (var attendee in attendeesArray.EnumerateArray())
                {
                    var attendeeDict = new Dictionary<string, object>();
                    
                    foreach (var property in attendee.EnumerateObject())
                    {
                        attendeeDict[property.Name] = property.Value.ValueKind switch
                        {
                            JsonValueKind.String => property.Value.GetString() ?? "",
                            JsonValueKind.True => true,
                            JsonValueKind.False => false,
                            JsonValueKind.Number => property.Value.TryGetInt32(out var intVal) ? intVal : property.Value.GetDouble(),
                            _ => property.Value.GetRawText()
                        };
                    }
                    
                    attendees.Add(attendeeDict);
                }
            }
            
            return attendees;
        }

        private Dictionary<string, object> CreateNewAttendee(string email, string? displayName)
        {
            var attendee = new Dictionary<string, object>
            {
                ["email"] = email,
                ["responseStatus"] = "needsAction"
            };
            
            if (!string.IsNullOrEmpty(displayName))
            {
                attendee["displayName"] = displayName;
            }
            
            return attendee;
        }

        private string GetEmailFromAttendee(Dictionary<string, object> attendee)
        {
            return attendee.ContainsKey("email") ? attendee["email"]?.ToString() ?? "" : "";
        }

        private async Task<bool> UpdateEventAttendees(string accessToken, string eventId, List<Dictionary<string, object>> attendees)
        {
            try
            {
                var patchUrl = $"https://www.googleapis.com/calendar/v3/calendars/primary/events/{eventId}?sendNotifications=true";
                var patchData = new Dictionary<string, object>
                {
                    ["attendees"] = attendees
                };

                var jsonPayload = JsonSerializer.Serialize(patchData, _jsonOptions);
                Console.WriteLine($"[DEBUG] Patch payload: {jsonPayload}");

                using var request = new HttpRequestMessage(new HttpMethod("PATCH"), patchUrl);
                request.Headers.Add("Authorization", $"Bearer {accessToken}");
                request.Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"[ERROR] Failed to update attendees: {response.StatusCode}");
                    Console.WriteLine($"[ERROR] Response body: {errorBody}");
                    return false;
                }

                Console.WriteLine($"[SUCCESS] Attendees updated successfully for event {eventId}");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Exception in UpdateEventAttendees: {ex.Message}");
                return false;
            }
        }

        private bool HasFirefliesAttendee(JsonElement eventItem)
        {
            if (!eventItem.TryGetProperty("attendees", out var attendees) || 
                attendees.ValueKind != JsonValueKind.Array) return false;
            
            foreach (var attendee in attendees.EnumerateArray())
            {
                if (attendee.TryGetProperty("email", out var email))
                {
                    var emailStr = email.GetString()?.ToLowerInvariant();
                    if (!string.IsNullOrEmpty(emailStr) && 
                        (_firefliesEmails.Contains(emailStr) || emailStr.Contains("fireflies.ai"))) 
                        return true;
                }
            }
            return false;
        }

        private UpcomingMeeting? ParseMeeting(JsonElement eventItem)
        {
            try
            {
                var meeting = new UpcomingMeeting
                {
                    GoogleEventId = eventItem.TryGetProperty("id", out var id) ? id.GetString() ?? "" : "",
                    Title = eventItem.TryGetProperty("summary", out var summary) ? 
                        summary.GetString() ?? "Untitled Meeting" : "Untitled Meeting",
                    Description = eventItem.TryGetProperty("description", out var desc) ? desc.GetString() : null
                };

                // Parse start time
                if (eventItem.TryGetProperty("start", out var start) && 
                    start.TryGetProperty("dateTime", out var dateTime) && 
                    DateTime.TryParse(dateTime.GetString(), out var parsedDateTime))
                    meeting.StartTime = parsedDateTime;

                // Parse end time
                if (eventItem.TryGetProperty("end", out var end) && 
                    end.TryGetProperty("dateTime", out var endDateTime) && 
                    DateTime.TryParse(endDateTime.GetString(), out var parsedEndDateTime))
                    meeting.EndTime = parsedEndDateTime;

                // Parse meeting link
                if (eventItem.TryGetProperty("hangoutLink", out var hangoutLink) && 
                    !string.IsNullOrEmpty(hangoutLink.GetString()))
                    meeting.MeetingLink = hangoutLink.GetString();

                // Parse attendees
                if (eventItem.TryGetProperty("attendees", out var attendees) && 
                    attendees.ValueKind == JsonValueKind.Array)
                {
                    meeting.AttendeesCount = attendees.GetArrayLength();
                    foreach (var attendeeElement in attendees.EnumerateArray())
                    {
                        var email = attendeeElement.TryGetProperty("email", out var emailEl) ? 
                            emailEl.GetString() : null;
                        
                        if (!string.IsNullOrEmpty(email))
                        {
                            var attendee = new Attendee
                            {
                                Email = email,
                                DisplayName = attendeeElement.TryGetProperty("displayName", out var nameEl) ? 
                                    nameEl.GetString() : null,
                                ResponseStatus = attendeeElement.TryGetProperty("responseStatus", out var statusEl) ? 
                                    statusEl.GetString() ?? "needsAction" : "needsAction",
                                Organizer = attendeeElement.TryGetProperty("organizer", out var orgEl) && 
                                    orgEl.ValueKind == JsonValueKind.True,
                                Self = attendeeElement.TryGetProperty("self", out var selfEl) && 
                                    selfEl.ValueKind == JsonValueKind.True
                            };
                            
                            meeting.Attendees.Add(attendee);
                        }
                    }
                }

                return meeting;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Error parsing meeting: {ex.Message}");
                return null;
            }
        }
    }

    public class Attendee
    {
        public string Email { get; set; } = string.Empty;
        public string? DisplayName { get; set; }
        public string ResponseStatus { get; set; } = "needsAction";
        public bool Organizer { get; set; } = false;
        public bool Self { get; set; } = false;
        public bool Optional { get; set; } = false;
    }

    public class UpcomingMeeting
    {
        public string GoogleEventId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public bool IsAllDay { get; set; } = false;
        public string? MeetingLink { get; set; }
        public int AttendeesCount { get; set; }
        public List<Attendee> Attendees { get; set; } = new List<Attendee>();
    }
}
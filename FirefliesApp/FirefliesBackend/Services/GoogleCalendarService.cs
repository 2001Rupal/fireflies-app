// using System;
// using System.Collections.Generic;
// using System.Net.Http;
// using System.Threading.Tasks;
// using System.Text.Json;
// using Microsoft.Extensions.Configuration;

// namespace FirefliesBackend.Services
// {
//     public interface IGoogleCalendarService
//     {
//         Task<List<UpcomingMeeting>> GetUpcomingMeetingsWithFireflies(string accessToken);
//         string GetAuthUrl();
//         Task<string> ExchangeCodeForToken(string code);
//     }

//     public class GoogleCalendarService : IGoogleCalendarService
//     {
//         private readonly HttpClient _httpClient;
//         private readonly IConfiguration _configuration;
//         private readonly string _clientId;
//         private readonly string _clientSecret;
//         private readonly string _redirectUri;

//         public GoogleCalendarService(HttpClient httpClient, IConfiguration configuration)
//         {
//             _httpClient = httpClient;
//             _configuration = configuration;
//             _clientId = _configuration["Google:ClientId"] ?? "";
//             _clientSecret = _configuration["Google:ClientSecret"] ?? "";
//             _redirectUri = _configuration["Google:RedirectUri"] ?? "";
//         }

//         public string GetAuthUrl()
//         {
//             var scopes = "https://www.googleapis.com/auth/calendar.readonly";
//             var authUrl = $"https://accounts.google.com/o/oauth2/v2/auth?" +
//                          $"client_id={_clientId}&" +
//                          $"redirect_uri={Uri.EscapeDataString(_redirectUri)}&" +
//                          $"response_type=code&" +
//                          $"scope={Uri.EscapeDataString(scopes)}&" +
//                          $"access_type=offline&" +
//                          $"prompt=consent";
            
//             return authUrl;
//         }

//         public async Task<string> ExchangeCodeForToken(string code)
//         {
//             var tokenRequest = new Dictionary<string, string>
//             {
//                 {"client_id", _clientId},
//                 {"client_secret", _clientSecret},
//                 {"code", code},
//                 {"grant_type", "authorization_code"},
//                 {"redirect_uri", _redirectUri}
//             };

//             var content = new FormUrlEncodedContent(tokenRequest);
//             var response = await _httpClient.PostAsync("https://oauth2.googleapis.com/token", content);
            
//             if (!response.IsSuccessStatusCode)
//             {
//                 throw new HttpRequestException($"Token exchange failed: {await response.Content.ReadAsStringAsync()}");
//             }

//             var jsonResponse = await response.Content.ReadAsStringAsync();
//             var tokenResponse = JsonSerializer.Deserialize<JsonElement>(jsonResponse);
            
//             return tokenResponse.GetProperty("access_token").GetString() ?? "";
//         }

//         public async Task<List<UpcomingMeeting>> GetUpcomingMeetingsWithFireflies(string accessToken)
//         {
//             var meetings = new List<UpcomingMeeting>();
            
//             try
//             {
//                 // Set up the request to Google Calendar API
//                 var timeMin = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
//                 var timeMax = DateTime.UtcNow.AddDays(30).ToString("yyyy-MM-ddTHH:mm:ssZ");
                
//                 var requestUrl = $"https://www.googleapis.com/calendar/v3/calendars/primary/events?" +
//                                $"timeMin={timeMin}&" +
//                                $"timeMax={timeMax}&" +
//                                $"singleEvents=true&" +
//                                $"orderBy=startTime&" +
//                                $"maxResults=50";

//                 _httpClient.DefaultRequestHeaders.Clear();
//                 _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");

//                 var response = await _httpClient.GetAsync(requestUrl);
                
//                 if (!response.IsSuccessStatusCode)
//                 {
//                     throw new HttpRequestException($"Calendar API request failed: {await response.Content.ReadAsStringAsync()}");
//                 }

//                 var jsonResponse = await response.Content.ReadAsStringAsync();
//                 var calendarData = JsonSerializer.Deserialize<JsonElement>(jsonResponse);

//                 if (calendarData.TryGetProperty("items", out var items) && items.ValueKind == JsonValueKind.Array)
//                 {
//                     foreach (var item in items.EnumerateArray())
//                     {
//                         // Check if Fireflies bot is invited
//                         if (HasFirefliesAttendee(item))
//                         {
//                             var meeting = ParseMeeting(item);
//                             if (meeting != null)
//                             {
//                                 meetings.Add(meeting);
//                             }
//                         }
//                     }
//                 }
//             }
//             catch (Exception ex)
//             {
//                 Console.WriteLine($"Error fetching calendar events: {ex.Message}");
//                 throw;
//             }

//             return meetings;
//         }

//         private bool HasFirefliesAttendee(JsonElement eventItem)
//         {
//             if (eventItem.TryGetProperty("attendees", out var attendees) && attendees.ValueKind == JsonValueKind.Array)
//             {
//                 foreach (var attendee in attendees.EnumerateArray())
//                 {
//                     if (attendee.TryGetProperty("email", out var email))
//                     {
//                         var emailStr = email.GetString()?.ToLowerInvariant();
//                         if (emailStr != null && (emailStr.Contains("fred@fireflies.ai") || emailStr.Contains("fireflies.ai")))
//                         {
//                             return true;
//                         }
//                     }
//                 }
//             }
//             return false;
//         }

//         private UpcomingMeeting? ParseMeeting(JsonElement eventItem)
//         {
//             try
//             {
//                 var meeting = new UpcomingMeeting();

//                 // Get basic info
//                 meeting.GoogleEventId = eventItem.TryGetProperty("id", out var id) ? id.GetString() ?? "" : "";
//                 meeting.Title = eventItem.TryGetProperty("summary", out var summary) ? summary.GetString() ?? "Untitled Meeting" : "Untitled Meeting";
//                 meeting.Description = eventItem.TryGetProperty("description", out var desc) ? desc.GetString() : null;

//                 // Get start time
//                 if (eventItem.TryGetProperty("start", out var start))
//                 {
//                     if (start.TryGetProperty("dateTime", out var dateTime))
//                     {
//                         if (DateTime.TryParse(dateTime.GetString(), out var parsedDateTime))
//                         {
//                             meeting.StartTime = parsedDateTime;
//                         }
//                     }
//                     else if (start.TryGetProperty("date", out var date))
//                     {
//                         if (DateTime.TryParse(date.GetString(), out var parsedDate))
//                         {
//                             meeting.StartTime = parsedDate;
//                             meeting.IsAllDay = true;
//                         }
//                     }
//                 }

//                 // Get end time
//                 if (eventItem.TryGetProperty("end", out var end))
//                 {
//                     if (end.TryGetProperty("dateTime", out var endDateTime))
//                     {
//                         if (DateTime.TryParse(endDateTime.GetString(), out var parsedEndDateTime))
//                         {
//                             meeting.EndTime = parsedEndDateTime;
//                         }
//                     }
//                     else if (end.TryGetProperty("date", out var endDate))
//                     {
//                         if (DateTime.TryParse(endDate.GetString(), out var parsedEndDate))
//                         {
//                             meeting.EndTime = parsedEndDate;
//                         }
//                     }
//                 }

//                 // Get meeting link
//                 if (eventItem.TryGetProperty("hangoutLink", out var hangoutLink))
//                 {
//                     meeting.MeetingLink = hangoutLink.GetString();
//                 }
//                 else if (eventItem.TryGetProperty("location", out var location))
//                 {
//                     var locationStr = location.GetString();
//                     if (locationStr != null && (locationStr.StartsWith("http") || locationStr.Contains("zoom.us") || locationStr.Contains("teams.microsoft.com")))
//                     {
//                         meeting.MeetingLink = locationStr;
//                     }
//                 }

//                 // Get attendees count
//                 if (eventItem.TryGetProperty("attendees", out var attendees) && attendees.ValueKind == JsonValueKind.Array)
//                 {
//                     meeting.AttendeesCount = attendees.GetArrayLength();
//                 }

//                 return meeting;
//             }
//             catch (Exception ex)
//             {
//                 Console.WriteLine($"Error parsing meeting: {ex.Message}");
//                 return null;
//             }
//         }
//     }

//     public class UpcomingMeeting
//     {
//         public string GoogleEventId { get; set; } = string.Empty;
//         public string Title { get; set; } = string.Empty;
//         public string? Description { get; set; }
//         public DateTime StartTime { get; set; }
//         public DateTime? EndTime { get; set; }
//         public bool IsAllDay { get; set; }
//         public string? MeetingLink { get; set; }
//         public int AttendeesCount { get; set; }
//         public string TimeUntilMeeting 
//         { 
//             get 
//             {
//                 var timeSpan = StartTime - DateTime.Now;
//                 if (timeSpan.TotalDays >= 1)
//                     return $"{(int)timeSpan.TotalDays}d";
//                 else if (timeSpan.TotalHours >= 1)
//                     return $"{(int)timeSpan.TotalHours}h";
//                 else if (timeSpan.TotalMinutes >= 1)
//                     return $"{(int)timeSpan.TotalMinutes}m";
//                 else
//                     return "Now";
//             } 
//         }
//     }
// }




using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace FirefliesBackend.Services
{
    public interface IGoogleCalendarService
    {
        Task<List<UpcomingMeeting>> GetUpcomingMeetingsWithFireflies(string accessToken);
        string GetAuthUrl();
        Task<string> ExchangeCodeForToken(string code);
    }

    public class GoogleCalendarService : IGoogleCalendarService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly string _clientId;
        private readonly string _clientSecret;
        private readonly string _redirectUri;

        public GoogleCalendarService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _clientId = _configuration["Google:ClientId"] ?? "";
            _clientSecret = _configuration["Google:ClientSecret"] ?? "";
            _redirectUri = _configuration["Google:RedirectUri"] ?? "";
        }

        public string GetAuthUrl()
        {
            var scopes = "https://www.googleapis.com/auth/calendar.readonly";
            var authUrl = $"https://accounts.google.com/o/oauth2/v2/auth?" +
                         $"client_id={_clientId}&" +
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
                throw new HttpRequestException($"Token exchange failed: {await response.Content.ReadAsStringAsync()}");
            }

            var jsonResponse = await response.Content.ReadAsStringAsync();
            var tokenResponse = JsonSerializer.Deserialize<JsonElement>(jsonResponse);
            
            return tokenResponse.GetProperty("access_token").GetString() ?? "";
        }

        public async Task<List<UpcomingMeeting>> GetUpcomingMeetingsWithFireflies(string accessToken)
        {
            var meetings = new List<UpcomingMeeting>();
            
            try
            {
                var timeMin = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
                var timeMax = DateTime.UtcNow.AddDays(30).ToString("yyyy-MM-ddTHH:mm:ssZ");
                
                var requestUrl = $"https://www.googleapis.com/calendar/v3/calendars/primary/events?" +
                               $"timeMin={timeMin}&" +
                               $"timeMax={timeMax}&" +
                               $"singleEvents=true&" +
                               $"orderBy=startTime&" +
                               $"maxResults=50";

                var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
                request.Headers.Add("Authorization", $"Bearer {accessToken}");

                var response = await _httpClient.SendAsync(request);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Calendar API request failed with status {response.StatusCode}: {errorContent}");
                    throw new HttpRequestException($"Calendar API request failed: {errorContent}");
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                var calendarData = JsonSerializer.Deserialize<JsonElement>(jsonResponse);

                if (calendarData.TryGetProperty("items", out var items) && items.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in items.EnumerateArray())
                    {
                        if (HasFirefliesAttendee(item))
                        {
                            var meeting = ParseMeeting(item);
                            if (meeting != null)
                            {
                                meetings.Add(meeting);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching calendar events: {ex.Message}");
                throw;
            }

            return meetings;
        }

        private bool HasFirefliesAttendee(JsonElement eventItem)
        {
            if (eventItem.TryGetProperty("attendees", out var attendees) && attendees.ValueKind == JsonValueKind.Array)
            {
                foreach (var attendee in attendees.EnumerateArray())
                {
                    if (attendee.TryGetProperty("email", out var email))
                    {
                        var emailStr = email.GetString()?.ToLowerInvariant();
                        if (emailStr != null && (emailStr.Contains("fred@fireflies.ai") || emailStr.Contains("fireflies.ai")))
                        {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        private UpcomingMeeting? ParseMeeting(JsonElement eventItem)
        {
            try
            {
                var meeting = new UpcomingMeeting();

                meeting.GoogleEventId = eventItem.TryGetProperty("id", out var id) ? id.GetString() ?? "" : "";
                meeting.Title = eventItem.TryGetProperty("summary", out var summary) ? summary.GetString() ?? "Untitled Meeting" : "Untitled Meeting";
                meeting.Description = eventItem.TryGetProperty("description", out var desc) ? desc.GetString() : null;

                if (eventItem.TryGetProperty("start", out var start))
                {
                    if (start.TryGetProperty("dateTime", out var dateTime))
                    {
                        if (DateTime.TryParse(dateTime.GetString(), out var parsedDateTime))
                        {
                            meeting.StartTime = parsedDateTime;
                        }
                    }
                    else if (start.TryGetProperty("date", out var date))
                    {
                        if (DateTime.TryParse(date.GetString(), out var parsedDate))
                        {
                            meeting.StartTime = parsedDate;
                            meeting.IsAllDay = true;
                        }
                    }
                }

                if (eventItem.TryGetProperty("end", out var end))
                {
                    if (end.TryGetProperty("dateTime", out var endDateTime))
                    {
                        if (DateTime.TryParse(endDateTime.GetString(), out var parsedEndDateTime))
                        {
                            meeting.EndTime = parsedEndDateTime;
                        }
                    }
                    else if (end.TryGetProperty("date", out var endDate))
                    {
                        if (DateTime.TryParse(endDate.GetString(), out var parsedEndDate))
                        {
                            meeting.EndTime = parsedEndDate;
                        }
                    }
                }

                if (eventItem.TryGetProperty("hangoutLink", out var hangoutLink))
                {
                    meeting.MeetingLink = hangoutLink.GetString();
                }
                else if (eventItem.TryGetProperty("location", out var location))
                {
                    var locationStr = location.GetString();
                    if (locationStr != null && (locationStr.StartsWith("http") || locationStr.Contains("zoom.us") || locationStr.Contains("teams.microsoft.com")))
                    {
                        meeting.MeetingLink = locationStr;
                    }
                }

                if (eventItem.TryGetProperty("attendees", out var attendees) && attendees.ValueKind == JsonValueKind.Array)
                {
                    meeting.AttendeesCount = attendees.GetArrayLength();
                }

                return meeting;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error parsing meeting: {ex.Message}");
                return null;
            }
        }
    }

    public class UpcomingMeeting
    {
        public string GoogleEventId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public bool IsAllDay { get; set; }
        public string? MeetingLink { get; set; }
        public int AttendeesCount { get; set; }
        public string TimeUntilMeeting 
        { 
            get 
            {
                var timeSpan = StartTime - DateTime.Now;
                if (timeSpan.TotalDays >= 1)
                    return $"{(int)timeSpan.TotalDays}d";
                else if (timeSpan.TotalHours >= 1)
                    return $"{(int)timeSpan.TotalHours}h";
                else if (timeSpan.TotalMinutes >= 1)
                    return $"{(int)timeSpan.TotalMinutes}m";
                else
                    return "Now";
            } 
        }
    }
}
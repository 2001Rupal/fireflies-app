

using Microsoft.AspNetCore.Mvc;
using FirefliesBackend.Services;
using System.Threading.Tasks;
using System;
using System.ComponentModel.DataAnnotations;

namespace FirefliesBackend.Controllers
{
    [ApiController]
    [Route("api/calendar")]
    public class CalendarController : ControllerBase
    {
        private readonly IGoogleCalendarService _calendarService;

        public CalendarController(IGoogleCalendarService calendarService)
        {
            _calendarService = calendarService;
        }

        [HttpGet("auth-url")]
        public IActionResult GetAuthUrl()
        {
            try
            {
                var authUrl = _calendarService.GetAuthUrl();
                return Ok(new { authUrl });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting auth URL: {ex.Message}");
                return StatusCode(500, new { message = "Failed to generate authentication URL" });
            }
        }

        [HttpPost("exchange-code")]
        public async Task<IActionResult> ExchangeCode([FromBody] ExchangeCodeRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Code))
            {
                return BadRequest(new { message = "Authorization code is required" });
            }

            try
            {
                var accessToken = await _calendarService.ExchangeCodeForToken(request.Code);
                return Ok(new { accessToken });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error exchanging code for token: {ex.Message}");
                return StatusCode(500, new { message = "Failed to exchange authorization code" });
            }
        }

        [HttpPost("events/{eventId}/attendees")]
        public async Task<IActionResult> AddAttendee(
            [FromHeader(Name = "Authorization")] string authorization, 
            [FromRoute] string eventId, 
            [FromBody] AddAttendeeRequest request)
        {
            if (string.IsNullOrWhiteSpace(authorization) || !authorization.StartsWith("Bearer "))
            {
                return Unauthorized(new { message = "Valid access token is required in Authorization header" });
            }

            if (string.IsNullOrWhiteSpace(eventId))
            {
                return BadRequest(new { message = "Event ID is required" });
            }

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { message = "Email address is required" });
            }

            if (!IsValidEmail(request.Email))
            {
                return BadRequest(new { message = "Please provide a valid email address" });
            }

            var accessToken = authorization.Substring(7);

            try
            {
                Console.WriteLine($"[Controller] Adding attendee {request.Email} to event {eventId}");
                
                var success = await _calendarService.AddAttendeeToEvent(
                    accessToken, 
                    eventId, 
                    request.Email.Trim().ToLowerInvariant(), 
                    request.DisplayName?.Trim()
                );

                if (success)
                {
                    Console.WriteLine($"[Controller] Successfully added attendee {request.Email}");
                    return Ok(new { message = "Attendee added successfully" });
                }
                else
                {
                    Console.WriteLine($"[Controller] Failed to add attendee {request.Email}");
                    return BadRequest(new { message = "Failed to add attendee. The meeting may not exist or you may not have permission to modify it." });
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                Console.WriteLine($"[Controller] Unauthorized error adding attendee: {ex.Message}");
                return Unauthorized(new { message = "Your access token has expired. Please reconnect your calendar." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Controller] Error adding attendee: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while adding the attendee. Please try again." });
            }
        }

        [HttpDelete("events/{eventId}/attendees/{email}")]
        public async Task<IActionResult> RemoveAttendee(
            [FromHeader(Name = "Authorization")] string authorization, 
            [FromRoute] string eventId, 
            [FromRoute] string email)
        {
            if (string.IsNullOrWhiteSpace(authorization) || !authorization.StartsWith("Bearer "))
            {
                return Unauthorized(new { message = "Valid access token is required in Authorization header" });
            }

            if (string.IsNullOrWhiteSpace(eventId))
            {
                return BadRequest(new { message = "Event ID is required" });
            }

            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest(new { message = "Email address is required" });
            }

            var accessToken = authorization.Substring(7);

            try
            {
                Console.WriteLine($"[Controller] Removing attendee {email} from event {eventId}");
                
                var success = await _calendarService.RemoveAttendeeFromEvent(
                    accessToken, 
                    eventId, 
                    Uri.UnescapeDataString(email).Trim().ToLowerInvariant()
                );

                if (success)
                {
                    Console.WriteLine($"[Controller] Successfully removed attendee {email}");
                    return Ok(new { message = "Attendee removed successfully" });
                }
                else
                {
                    Console.WriteLine($"[Controller] Failed to remove attendee {email}");
                    return BadRequest(new { message = "Failed to remove attendee. The meeting or attendee may not exist." });
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                Console.WriteLine($"[Controller] Unauthorized error removing attendee: {ex.Message}");
                return Unauthorized(new { message = "Your access token has expired. Please reconnect your calendar." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Controller] Error removing attendee: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while removing the attendee. Please try again." });
            }
        }

        [HttpPatch("events/{eventId}/attendees/{email}/status")]
        public async Task<IActionResult> UpdateAttendeeStatus(
            [FromHeader(Name = "Authorization")] string authorization, 
            [FromRoute] string eventId, 
            [FromRoute] string email, 
            [FromBody] UpdateStatusRequest request)
        {
            if (string.IsNullOrWhiteSpace(authorization) || !authorization.StartsWith("Bearer "))
            {
                return Unauthorized(new { message = "Valid access token is required in Authorization header" });
            }

            if (string.IsNullOrWhiteSpace(eventId))
            {
                return BadRequest(new { message = "Event ID is required" });
            }

            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest(new { message = "Email address is required" });
            }

            if (string.IsNullOrWhiteSpace(request.Status))
            {
                return BadRequest(new { message = "Status is required" });
            }

            var validStatuses = new[] { "needsAction", "declined", "tentative", "accepted" };
            if (!Array.Exists(validStatuses, status => status.Equals(request.Status, StringComparison.OrdinalIgnoreCase)))
            {
                return BadRequest(new { message = $"Invalid status. Valid values are: {string.Join(", ", validStatuses)}" });
            }

            var accessToken = authorization.Substring(7);

            try
            {
                Console.WriteLine($"[Controller] Updating attendee {email} status to {request.Status} in event {eventId}");
                
                var success = await _calendarService.UpdateAttendeeStatus(
                    accessToken, 
                    eventId, 
                    Uri.UnescapeDataString(email).Trim().ToLowerInvariant(), 
                    request.Status.ToLowerInvariant()
                );

                if (success)
                {
                    Console.WriteLine($"[Controller] Successfully updated attendee {email} status to {request.Status}");
                    return Ok(new { message = "Attendee status updated successfully" });
                }
                else
                {
                    Console.WriteLine($"[Controller] Failed to update attendee {email} status");
                    return BadRequest(new { message = "Failed to update attendee status. The meeting or attendee may not exist." });
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                Console.WriteLine($"[Controller] Unauthorized error updating attendee status: {ex.Message}");
                return Unauthorized(new { message = "Your access token has expired. Please reconnect your calendar." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Controller] Error updating attendee status: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while updating the attendee status. Please try again." });
            }
        }

        [HttpGet("upcoming-meetings")]
        public async Task<IActionResult> GetUpcomingMeetings([FromHeader(Name = "Authorization")] string authorization)
        {
            if (string.IsNullOrWhiteSpace(authorization) || !authorization.StartsWith("Bearer "))
            {
                return Unauthorized(new { message = "Valid access token is required in Authorization header" });
            }

            var accessToken = authorization.Substring(7);

            try
            {
                var meetings = await _calendarService.GetUpcomingMeetingsWithFireflies(accessToken);
                return Ok(meetings);
            }
            catch (UnauthorizedAccessException ex)
            {
                Console.WriteLine($"Google API authorization error: {ex.Message}");
                return Unauthorized(new { message = "Your Google Calendar access has expired. Please reconnect your calendar." });
            }
            catch (HttpRequestException ex) when (ex.Message.Contains("401") || ex.Message.Contains("403"))
            {
                Console.WriteLine($"Google API authorization error: {ex.Message}");
                return Unauthorized(new { message = "Google API token is invalid or expired." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching upcoming meetings: {ex.Message}");
                return StatusCode(500, new { message = "An internal error occurred while fetching meetings." });
            }
        }

        // ✅ NEW: Cancel Meeting Endpoint
        [HttpDelete("events/{eventId}")]
        public async Task<IActionResult> CancelMeeting(
            [FromHeader(Name = "Authorization")] string authorization, 
            [FromRoute] string eventId,
            [FromQuery] bool sendNotifications = true)
        {
            if (string.IsNullOrWhiteSpace(authorization) || !authorization.StartsWith("Bearer "))
            {
                return Unauthorized(new { message = "Valid access token is required in Authorization header" });
            }

            if (string.IsNullOrWhiteSpace(eventId))
            {
                return BadRequest(new { message = "Event ID is required" });
            }

            var accessToken = authorization.Substring(7);

            try
            {
                Console.WriteLine($"[Controller] Cancelling meeting {eventId}");
                
                var success = await _calendarService.CancelMeeting(accessToken, eventId, sendNotifications);

                if (success)
                {
                    Console.WriteLine($"[Controller] Successfully cancelled meeting {eventId}");
                    return Ok(new { message = "Meeting cancelled successfully" });
                }
                else
                {
                    Console.WriteLine($"[Controller] Failed to cancel meeting {eventId}");
                    return BadRequest(new { message = "Failed to cancel meeting. The meeting may not exist or you may not have permission to cancel it." });
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                Console.WriteLine($"[Controller] Unauthorized error cancelling meeting: {ex.Message}");
                return Unauthorized(new { message = "Your access token has expired. Please reconnect your calendar." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Controller] Error cancelling meeting: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while cancelling the meeting. Please try again." });
            }
        }

        // ✅ NEW: Reschedule Meeting Endpoint
[HttpPatch("events/{eventId}/reschedule")]
    public async Task<IActionResult> RescheduleMeeting(
        [FromHeader(Name = "Authorization")] string authorization, 
        [FromRoute] string eventId, 
        [FromBody] RescheduleMeetingRequest request)
    {
        if (string.IsNullOrWhiteSpace(authorization) || !authorization.StartsWith("Bearer "))
        {
            return Unauthorized(new { message = "Valid access token is required" });
        }

        if (string.IsNullOrWhiteSpace(eventId))
        {
            return BadRequest(new { message = "Event ID is required" });
        }

        if (request.NewStartTime == default)
        {
            return BadRequest(new { message = "New start time is required" });
        }

        // ✨ FIX: Use DateTimeOffset for reliable timezone-aware comparison
        if (request.NewStartTime <= DateTimeOffset.UtcNow)
        {
            return BadRequest(new { message = "New start time must be in the future" });
        }

        var accessToken = authorization.Substring(7);

        try
        {
            Console.WriteLine($"[Controller] Rescheduling meeting {eventId} to {request.NewStartTime}");
            
            // Pass the UTC DateTime to the service layer, which expects DateTime
            var success = await _calendarService.RescheduleMeeting(
                accessToken, 
                eventId, 
                request.NewStartTime.UtcDateTime, // ✨ FIX: Pass the UTC time
                request.NewEndTime?.UtcDateTime, // ✨ FIX: Pass the UTC time
                request.SendNotifications
            );

            if (success)
            {
                return Ok(new { message = "Meeting rescheduled successfully" });
            }
            else
            {
                // This generic message is okay, but we'll improve it in the next step
                return BadRequest(new { message = "Failed to reschedule meeting. The meeting may not exist or you may not have permission to modify it." });
            }
        }
        catch (UnauthorizedAccessException ex)
{
    Console.WriteLine($"[Controller] Unauthorized error rescheduling meeting: {ex.Message}");
    // Return a 401 Unauthorized status
    return Unauthorized(new { message = ex.Message });
}
catch (InvalidOperationException ex)
{
    Console.WriteLine($"[Controller] Invalid operation error rescheduling meeting: {ex.Message}");
    // Return a 400 Bad Request or 404 Not Found depending on the message
    if (ex.Message.Contains("not found")) {
        return NotFound(new { message = ex.Message });
    }
    return BadRequest(new { message = ex.Message });
}
catch (Exception ex)
{
    Console.WriteLine($"[Controller] Generic error rescheduling meeting: {ex.Message}");
    return StatusCode(500, new { message = "An internal server error occurred." });
}

    }


        private static bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return false;
            
            try
            {
                var emailAttribute = new EmailAddressAttribute();
                return emailAttribute.IsValid(email);
            }
            catch
            {
                return false;
            }
        }
    }

    // ✅ Existing request models
    public record ExchangeCodeRequest([Required] string Code);
    
    public record AddAttendeeRequest(
        [Required][EmailAddress] string Email, 
        string? DisplayName = null);
    
    public record UpdateStatusRequest([Required] string Status);

    // ✅ NEW: Reschedule meeting request model
    public record RescheduleMeetingRequest(
    [Required] DateTimeOffset NewStartTime,
    DateTimeOffset? NewEndTime = null,
    bool SendNotifications = true
);

}
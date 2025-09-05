using Microsoft.AspNetCore.Mvc;
using FirefliesBackend.Services;
using System.Threading.Tasks;
using System;

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

        [HttpGet("upcoming-meetings")]
        public async Task<IActionResult> GetUpcomingMeetings([FromHeader] string authorization)
        {
            if (string.IsNullOrWhiteSpace(authorization) || !authorization.StartsWith("Bearer "))
            {
                return BadRequest(new { message = "Valid access token is required in Authorization header" });
            }

            var accessToken = authorization.Substring(7); // Remove "Bearer " prefix

            try
            {
                var meetings = await _calendarService.GetUpcomingMeetingsWithFireflies(accessToken);
                return Ok(meetings);
            }
            catch (HttpRequestException ex) when (ex.Message.Contains("401") || ex.Message.Contains("403"))
            {
                // This indicates the access token is invalid or expired.
                Console.WriteLine($"Google API authorization error: {ex.Message}");
                return Unauthorized(new { message = "Google API token is invalid or expired." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching upcoming meetings: {ex.Message}");
                return StatusCode(500, new { message = "Failed to fetch upcoming meetings" });
            }
        }
    }

    public record ExchangeCodeRequest(string Code);
}
// Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    // A separate, private key for your own app's tokens
    private readonly string _appSecretKey = "YOUR_APP_UNIQUE_SECRET_KEY"; 

    [HttpPost("login")]
    public IActionResult LoginFromPms([FromBody] PmsTokenRequest req)
    {
        var pmsToken = req.Token;
        var handler = new JwtSecurityTokenHandler();

        try
        {
            // Validate the token from PMS using the same parameters as in Program.cs
            var validationParameters = new TokenValidationParameters
            {
                 RequireSignedTokens = true, // Ensure a signature exists
            ValidateIssuer = true,
            ValidIssuer = "ProjectManagementSystem",
            ValidateAudience = true,
            ValidAudience = "FirefliesApp",
            ValidateLifetime = true,
            
            ValidateActor = false,
            
            ValidateIssuerSigningKey = true,
             IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("your-super-long-development-secret-key-that-is-secure")),
            ClockSkew = TimeSpan.Zero
            };
            
            var principal = handler.ValidateToken(pmsToken, validationParameters, out SecurityToken validatedToken);

            // If validation is successful, extract the user's ID
            var userId = principal.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID claim not found in token.");
            }

            // You can now create a new, simpler token for your application
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId),
                // Add any other user-specific claims from the PMS token if needed
            };

            var appToken = GenerateAppToken(claims);

            return Ok(new AppTokenResponse { AppToken = appToken });
        }
        catch (SecurityTokenExpiredException)
        {
            return Unauthorized("PMS token has expired.");
        }
        catch (Exception ex)
        {
            // Log the error for debugging
            Console.WriteLine($"Token validation error: {ex.Message}");
            return Unauthorized("Invalid token.");
        }
    }

    private string GenerateAppToken(IEnumerable<Claim> claims)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_appSecretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        
        var token = new JwtSecurityToken(
            issuer: "YOUR_FIREFLIES_APP_ISSUER",
            audience: "YOUR_FIREFLIES_APP_AUDIENCE",
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(30), // App token lifetime (e.g., 30 minutes)
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
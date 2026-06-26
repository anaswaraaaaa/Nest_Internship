using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using nestinternship.Data;
using nestinternship.Models;
using System.Threading.Tasks;

namespace nestinternship.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context; 

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                // EF Core uses LINQ to safely compile your query and map the matching row directly to an object
                var activeUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email
                                           && u.Password == request.Password
                                           && !u.IsDisabled);

                if (activeUser == null)
                {
                    return Unauthorized("Invalid email/password credentials or account disabled.");
                }

                // Return properties matching standard naming policy rules cleanly
                return Ok(new
                {
                    UserId = activeUser.UserId,
                    Name = activeUser.Name,
                    Email = activeUser.Email,
                    Role = activeUser.Role
                });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
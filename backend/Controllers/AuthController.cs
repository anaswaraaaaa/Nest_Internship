using Microsoft.AspNetCore.Mvc;
using MySqlConnector; // FIXED: Changed from MySql.Data.MySqlClient to match Pomelo
using System;
using System.Data;

namespace nestinternship.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public AuthController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            string connectionString = _configuration.GetConnectionString("DefaultConnection") ?? string.Empty;

            using (var conn = new MySqlConnection(connectionString))
            {
                try
                {
                    conn.Open();

                    string query = "SELECT user_id, name, email, role FROM users WHERE email = @Email AND password = @Password AND is_disabled = 0";

                    using (var cmd = new MySqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@Email", request.Email);
                        cmd.Parameters.AddWithValue("@Password", request.Password);

                        using (var reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                return Ok(new
                                {
                                    UserId = reader.GetInt32("user_id"),
                                    Name = reader.GetString("name"),
                                    Email = reader.GetString("email"),
                                    Role = reader.GetString("role")
                                });
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    return StatusCode(500, $"Database error: {ex.Message}");
                }
            }

            return Unauthorized("Invalid email/password credentials or account disabled.");
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
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
            string connectionString = _configuration.GetConnectionString("DefaultConnection");

            using (MySqlConnection conn = new MySqlConnection(connectionString))
            {
                try
                {
                    conn.Open();

                    // FIXED: Strictly matches BOTH email AND password string columns inside the schema row scan
                    string query = "SELECT user_id, name, email, role FROM users WHERE email = @Email AND password = @Password AND is_disabled = 0";

                    using (MySqlCommand cmd = new MySqlCommand(query, conn))
                    {
                        // Safely injects parameter tokens to prevent any SQL injection vectors
                        cmd.Parameters.AddWithValue("@Email", request.Email);
                        cmd.Parameters.AddWithValue("@Password", request.Password);

                        using (MySqlDataReader reader = cmd.ExecuteReader())
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
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
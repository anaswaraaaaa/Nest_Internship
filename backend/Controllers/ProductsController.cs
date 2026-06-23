using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using nestinternship.Data;
using nestinternship.Models;
using System.Text.Json.Serialization;

namespace nestinternship.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET: Fetch all master registry items using pure EF Core mapping methods
        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            try
            {
                var productsList = await _context.Products.ToListAsync();

                // Formats property keys perfectly to match your camelCase frontend state expectations
                var formattedResponse = productsList.Select(p => new
                {
                    ProductId = p.ProductId,
                    ModelNo = p.ModelNo,
                    Description = p.Description,
                    ImageUrl = p.ImageUrl
                });

                return Ok(formattedResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database extraction exception: {ex.Message}");
            }
        }

        // 2. POST: Insert new product entries automatically via C# object state changes
        [HttpPost]
        public async Task<IActionResult> AddProduct([FromBody] ProductSaveRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.ModelNo))
                {
                    return BadRequest("Model Number field identifier is required.");
                }

                // Instantiate a fresh Product row entity mapping explicitly to your database fields
                var newProduct = new Product
                {
                    ModelNo = request.ModelNo,
                    Description = request.Description ?? $"Specification profile node for {request.ModelNo}",
                    ImageUrl = request.ImageUrl
                };

                // Track and execute save sequence safely using mapped parameter columns
                await _context.Products.AddAsync(newProduct);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Component successfully provisioned using Entity Framework!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database modification exception: {ex.Message}");
            }
        }
    }

    public class ProductSaveRequest
    {
        [JsonPropertyName("modelNo")]
        public string ModelNo { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("imageUrl")]
        public string ImageUrl { get; set; }
    }
}
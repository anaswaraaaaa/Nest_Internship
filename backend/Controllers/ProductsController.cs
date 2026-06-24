using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using nestinternship.Data;
using nestinternship.Models;
using System;
using System.Linq;
using System.Threading.Tasks;
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

        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            try
            {
                var productsList = await _context.Products.ToListAsync();
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
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> SaveProduct([FromBody] ProductSaveRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.ModelNo))
                {
                    return BadRequest("Model Number field identifier is required.");
                }

                // Map incoming data explicitly to Entity Framework columns
                var newProduct = new Product
                {
                    ModelNo = request.ModelNo,
                    Description = request.Description ?? $"Specification profile node for {request.ModelNo}",
                    ImageUrl = request.ImageUrl // FIXED: Securely captures mapping values now
                };

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
        public string ModelNo { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        [JsonPropertyName("imageUrl")] // FIXED: Added proper attribute string matching configuration tags
        public string ImageUrl { get; set; } = string.Empty;
    }
}
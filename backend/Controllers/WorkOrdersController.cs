using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using nestinternship.Data;
using nestinternship.Models;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace nestinternship.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorkOrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WorkOrdersController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/WorkOrders/create-full
        [HttpPost("create-full")]
        public async Task<IActionResult> CreateFullWorkOrder([FromBody] FullWorkOrderRequest request)
        {
            if (request == null || request.Order == null || request.Items == null)
            {
                return BadRequest("Invalid work order payload structure.");
            }

            // Fallback Sync: Ensure initiator mapping properties align regardless of casing variations
            if (string.IsNullOrEmpty(request.Order.InitiatorEmail) && !string.IsNullOrEmpty(request.Order.Initiator))
            {
                request.Order.InitiatorEmail = request.Order.Initiator;
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Step 1: Append Parent Work Order Header Record
                _context.WorkOrders.Add(request.Order);
                await _context.SaveChangesAsync();

                // Step 2: Bind and Append Child Line Items
                foreach (var item in request.Items)
                {
                    item.OrderNo = request.Order.OrderNo; // Force reference linkage identification
                    _context.OrderItems.Add(item);
                }

                await _context.SaveChangesAsync();

                // Step 3: Secure persistent commit if all constraints pass verification
                await transaction.CommitAsync();

                return Ok(new { message = $"Work Order {request.Order.OrderNo} successfully logged into database records!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();

                // Outputs raw database trace parameters straight to your Visual Studio output stream window
                Console.WriteLine($"[TX CORRUPTION LOG]: {ex.Message} -> Inner Exception: {ex.InnerException?.Message}");

                return StatusCode(500, $"Database commit rejected: {ex.Message}. Specific trace: {ex.InnerException?.Message}");
            }
        }

        // PUT: api/WorkOrders/{orderNo}/clearance
        [HttpPut("{orderNo}/clearance")]
        public async Task<IActionResult> UpdateClearanceGate(string orderNo, [FromBody] QAUpdateRequest request)
        {
            try
            {
                var order = await _context.WorkOrders.FirstOrDefaultAsync(w => w.OrderNo == orderNo);
                if (order == null) return NotFound($"Work order '{orderNo}' not found.");

                order.Status = request.Approve ? "Closed" : "Open";
                order.ClosedTime = request.Approve ? DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") : "—";
                order.QaApprovedBy = request.Approve ? request.QaApprovedBy : "—";

                _context.WorkOrders.Update(order);
                await _context.SaveChangesAsync();

                return Ok(new { message = $"Clearance gate updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Mutation failure: {ex.Message}");
            }
        }
    }

    // FIXED: Added precise serialization rules to catch camelCase JSON payloads from React safely
    public class FullWorkOrderRequest
    {
        [JsonPropertyName("order")]
        public WorkOrder Order { get; set; } = null!;

        [JsonPropertyName("items")]
        public List<OrderItem> Items { get; set; } = null!;
    }

    public class QAUpdateRequest
    {
        [JsonPropertyName("orderNo")]
        public string OrderNo { get; set; } = string.Empty;

        [JsonPropertyName("approve")]
        public bool Approve { get; set; }

        [JsonPropertyName("qaApprovedBy")]
        public string QaApprovedBy { get; set; } = string.Empty;
    }
}
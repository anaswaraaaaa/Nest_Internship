using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using nestinternship.Data;
using nestinternship.Models;
using System;
using System.Collections.Generic;
using System.Linq;
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

        // FIXED: ADDED GET GATEWAY TO PERSIST REFRESH MUTATIONS
        // GET: api/WorkOrders
        [HttpGet]
        public async Task<IActionResult> GetWorkOrders()
        {
            try
            {
                // Pull parent records from MySQL storage
                var workOrders = await _context.WorkOrders.ToListAsync();

                // Pull nested line components to construct full items layout mapping arrays
                var orderItems = await _context.OrderItems.ToListAsync();

                // Join records into the shape expected by your React frontend
                var synchronizedPayload = workOrders.Select(order => new
                {
                    orderNo = order.OrderNo,
                    initiatorEmail = order.InitiatorEmail,
                    status = order.Status,
                    createTime = order.CreateTime,
                    closedTime = order.ClosedTime,
                    qaApprovedBy = order.QaApprovedBy,
                    orderItems = orderItems.Where(item => item.OrderNo == order.OrderNo).Select(item => new
                    {
                        itemUid = item.ItemUid,
                        modelNo = item.ModelNo,
                        description = item.Description,
                        quantity = item.Quantity,
                        partArrangement = item.PartArrangement,
                        qcStatus = item.QcStatus,
                        remarks = item.Remarks,
                        imageSrc = item.ImageSrc
                    }).ToList()
                });

                return Ok(synchronizedPayload);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database parsing exception: {ex.Message}");
            }
        }

        // POST: api/WorkOrders/create-full
        [HttpPost("create-full")]
        public async Task<IActionResult> CreateFullWorkOrder([FromBody] FullWorkOrderRequest request)
        {
            if (request == null || request.Order == null || request.Items == null)
            {
                return BadRequest("Invalid work order payload structure.");
            }

            if (string.IsNullOrEmpty(request.Order.InitiatorEmail) && !string.IsNullOrEmpty(request.Order.Initiator))
            {
                request.Order.InitiatorEmail = request.Order.Initiator;
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.WorkOrders.Add(request.Order);
                await _context.SaveChangesAsync();

                foreach (var item in request.Items)
                {
                    item.OrderNo = request.Order.OrderNo;
                    _context.OrderItems.Add(item);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = $"Work Order {request.Order.OrderNo} successfully logged into database records!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
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
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace nestinternship.Models
{
    [Table("work_orders")]
    public class WorkOrder
    {
        [Key]
        [Column("order_no")]
        [StringLength(50)]
        public string OrderNo { get; set; } = string.Empty;

        [Required]
        [Column("initiator_email")]
        [StringLength(150)]
        public string InitiatorEmail { get; set; } = string.Empty;

        
        [NotMapped]
        public string Initiator
        {
            get => InitiatorEmail;
            set => InitiatorEmail = value;
        }

        [Column("status")]
        public string Status { get; set; } = "Open";

        [Column("create_time")]
        public DateTime CreateTime { get; set; } = DateTime.UtcNow;

        [Column("closed_time")]
        [StringLength(50)]
        public string ClosedTime { get; set; } = "—";

        [Column("qa_approved_by")]
        [StringLength(150)]
        public string QaApprovedBy { get; set; } = "—";
    }
}
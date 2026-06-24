using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace nestinternship.Models
{
    [Table("order_items")]
    public class OrderItem
    {
        [Key]
        [Column("item_uid")]
        public int ItemUid { get; set; }

        [Required]
        [Column("order_no")]
        [StringLength(50)]
        public string OrderNo { get; set; } = string.Empty;

        [Required]
        [Column("model_no")]
        [StringLength(50)]
        public string ModelNo { get; set; } = string.Empty;

        [Required]
        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column("quantity")]
        public int Quantity { get; set; }

        [Required]
        [Column("part_arrangement")]
        public string PartArrangement { get; set; } = "Assembled"; // "Assembled" or "Loosed"

        [Column("qc_status")]
        public string QcStatus { get; set; } = "Verified";

        [Column("selected_checkpoints")]
        public string? SelectedCheckpoints { get; set; }

        [Column("remarks")]
        public string? Remarks { get; set; }

        [Column("image_src")]
        public string? ImageSrc { get; set; }
    }
}
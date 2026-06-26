using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace nestinternship.Models
{
    [Table("products")]
    public class Product
    {
        [Key]
        [Column("product_id")]
        public int ProductId { get; set; }

        [Required]
        [Column("model_no")]
        [StringLength(50)]
        public string ModelNo { get; set; } = string.Empty;

        [Required]
        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Column("image_url")]
        public string? ImageUrl { get; set; } 

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
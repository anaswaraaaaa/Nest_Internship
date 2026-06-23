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
        public string ModelNo { get; set; }

        [Column("description")]
        public string Description { get; set; }

        [Column("image_url")]
        public string ImageUrl { get; set; }
    }
}
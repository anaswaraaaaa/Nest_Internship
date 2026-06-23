using Microsoft.EntityFrameworkCore;
using nestinternship.Models; // CRITICAL: Gives this file access to your Product entity

namespace nestinternship.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // Exposes your single products database dataset to the framework context session
        public DbSet<Product> Products { get; set; }
    }
}
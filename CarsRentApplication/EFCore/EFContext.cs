using Employees_shifts_schedule.EFCore.EntitiesConfigurations;
using Microsoft.EntityFrameworkCore;
using System.Data;

public class EFContext : DbContext
{
	internal DbSet<User> Users { get; set; } = null!;
	internal DbSet<Car> Cars { get; set; } = null!;
	public EFContext(DbContextOptions<EFContext> options) : base(options) { }

	protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
	{
		optionsBuilder.UseSqlServer();
	}
	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		modelBuilder.ApplyConfiguration(new UserConfiguration());
		modelBuilder.ApplyConfiguration(new CarConfiguration());
	}
}
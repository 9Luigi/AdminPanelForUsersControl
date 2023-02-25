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
		IConfigurationRoot configuration = new ConfigurationBuilder()
		   .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
		   .AddJsonFile("appsettings.json")
		   .Build();
		optionsBuilder.UseSqlServer(configuration.GetConnectionString("MSSQLServerCars"), builder =>
		{
			builder.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null);
		});
	}
	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		modelBuilder.ApplyConfiguration(new UserConfiguration());
		modelBuilder.ApplyConfiguration(new CarConfiguration());
	}
}
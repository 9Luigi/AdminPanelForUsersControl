using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Employees_shifts_schedule.EFCore.EntitiesConfigurations
{
	public class CarConfiguration : IEntityTypeConfiguration<Car>
	{
		public void Configure(EntityTypeBuilder<Car> builder)
		{
			builder.HasKey(c => c.Id);

			builder.Property(c => c.Company).HasColumnName("Company");
			builder.Property(c => c.Model).HasColumnName("Model");
			builder.Property(c => c.Cost).HasColumnName("Cost");
			builder.Property(c => c.ImagePath).HasColumnName("ImagePath");
		}
	}
}

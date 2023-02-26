using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
	public void Configure(EntityTypeBuilder<User> builder)
	{
		builder.HasKey(u => u.Id);
		builder.HasIndex(u => u.Id).IsUnique();
		builder.HasIndex(u => u.Email).IsUnique();

		builder.Property(u=> u.Name).HasColumnName("name").IsRequired();
		builder.Property(u=> u.Surname).HasColumnName("surname").IsRequired();
		builder.Property(u => u.Email).HasColumnName("email").IsRequired();
	}
}
using System.ComponentModel.DataAnnotations;

public class User
{
	public int Id { get; set; }
	public string Name { get; set; }
	public string Surname { get; set; }
	public string Email { get; set; }
	public string Password { get; set; }
	public string PhoneNumber { get; set; }
	public string Role { get; set; }
	[Timestamp]
	public byte[]? UserVersion { get; set; }
	public User(string name, string surname, string email, string role)
	{
		Name = name;
		Surname = surname;
		Email = email;
		Role = role;
	}
}
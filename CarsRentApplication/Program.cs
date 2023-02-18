using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;

string ConnectionString = @"Server="
		+ Environment.MachineName
		+ ";DataBase=Cars;User Id=RomanKudrik;Password=98585R;MultipleActiveResultSets=true;Encrypt=False";

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddAuthentication().AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
{
	options.LoginPath = "/html/login.html"; //redirect on unauthenticated
	options.AccessDeniedPath = "/html/accessDenied"; //redirect on unauthorize
});
builder.Services.AddAuthorization();
builder.Services.AddDbContext<EFContext>(options =>
{
	options.UseSqlServer(ConnectionString);
});

var app = builder.Build();
#region Middleware
app.UseAuthentication();
app.UseAuthorization();

app.UseDefaultFiles();
app.UseStaticFiles();
#endregion

#region EndPoints
app.MapGet("/admin", [Authorize(Roles = "Admin")] () =>
{
	return Results.Redirect("html/admin/admin.html");
});
app.MapGet("/admin/getAllUsers", async (EFContext db) =>
{
	return await db.Users.Select(u => new { u.Name,u.Surname,u.Email,u.Role, u.Id }).ToListAsync();
});
app.MapPost("/login", async (string? returnUrl, HttpContext context, EFContext db) =>
{
	var form = context.Request.Form;
	if (!form.ContainsKey("email") || !form.ContainsKey("password"))
		return Results.BadRequest("Email or password not send");
	string email = form["email"]!;
	string password = form["password"]!;
	var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email && u.Password == password);
	if (user == null)
	{
		return Results.NotFound(new { message = "User is not found" });
	}
	var claims = new List<Claim>
	 {
		 new Claim(ClaimsIdentity.DefaultNameClaimType, email),
		 new Claim(ClaimsIdentity.DefaultRoleClaimType,user.Role)
	 };
	var claimsIdentity = new ClaimsIdentity(claims, "Cookies");
	var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
	await context.SignInAsync(claimsPrincipal);
	if (user.Role=="Admin")
	{
		return Results.Redirect("html/admin/admin.html");
	}
	return Results.Redirect(returnUrl ?? "/");
});
/*app.Map("/", async () =>
{
	Results.Redirect("/cars");
});*/
app.MapGet("/api/users", async (EFContext db) => await db.Users.ToListAsync());
//app.MapGet("/api/cars")
#endregion

app.Run();

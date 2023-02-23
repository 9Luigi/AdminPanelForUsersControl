using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Net;
using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;
using System.Text.Json;

string ConnectionString = @"Server="
		+ Environment.MachineName
		+ ";DataBase=Cars;User Id=RomanKudrik;Password=98585R;MultipleActiveResultSets=true;Encrypt=False";

#region WebApplicationBuilder
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddAuthentication().AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
{
	options.LoginPath = "/html/login.html"; //redirect on unauthenticated
	options.AccessDeniedPath = "/html/accessDenied.html"; //redirect on unauthorize
	options.LogoutPath = "/";
});
builder.Services.AddAuthorization(options =>
{
	options.AddPolicy("AdminOnly", policy =>
	{
		policy.RequireClaim(ClaimTypes.Role, "Admin");
	});
});
builder.Services.AddDbContext<EFContext>(options =>
{
	options.UseSqlServer(ConnectionString);
});
#endregion

var app = builder.Build();

#region Middleware
app.UseAuthentication();
app.UseAuthorization();
app.ProtectStaticFilesForNonAdminMiddlware(new ProtectStaticFilesForNonAdminOptions("/html/admin/admin.html", "AdminOnly"));
app.UseDefaultFiles();
app.UseStaticFiles();
#endregion

#region EndPoints
//TODO change endpoints regions
#region MapGET
app.MapGet("/admin", [Authorize(Roles = "Admin")] () => //just for comfort
{
	return Results.Redirect("/html/admin/admin.html");
});
app.MapGet("/admin/users", async (EFContext db) =>
{
	return await db.Users.Select(u => new { u.Name, u.Surname, u.Email, u.Role, u.Id }).ToListAsync();
});
app.MapGet("/admin/users/{id}", async (int id, EFContext db) =>
{
	var user = await db.Users.Where(u => u.Id == id).Select(u => new { u.Id, u.Name, u.Surname, u.Email, u.Role }).FirstOrDefaultAsync();
	if (user is not null)
	{
		return Results.Json(user);
	}
	return Results.NotFound();
});
#endregion

#region MapPost
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
	if (user.Role == "Admin")
	{
		return Results.Redirect("/html/admin/admin.html");
	}
	return Results.Redirect(returnUrl ?? "/");
});
app.MapGet("/Admin/Users/Count", (EFContext db) =>
{
	int usersCount = db.Users.Count();
	var usersCountJson = JsonSerializer.Serialize(new {Count=usersCount});
	return Results.Ok(usersCountJson);
});
app.MapPut("/admin/users", async (User? dataFromFront, EFContext db) =>
{
	if (dataFromFront == null) return Results.BadRequest(new { message = "Request body is empty" });
	var user = await db.Users.Where(u => u.Id == dataFromFront.Id).FirstOrDefaultAsync();
	if (user == null) return Results.NotFound();
	user.Email = dataFromFront.Email;
	user.Surname = dataFromFront.Surname;
	user.Name = dataFromFront.Name;
	user.Role = dataFromFront.Role;
	db.SaveChanges();
	return Results.Ok(user);
});
app.MapDelete("/admin/users", async ([FromBody] User? userForDelete, EFContext db) => //TODO why need attribute FromBody?
{
	if (userForDelete == null) return Results.BadRequest(new { message = "Request body is empty" });
	var user = await db.Users.Where(u => u.Id == userForDelete.Id).FirstOrDefaultAsync();
	if (user == null) return Results.NotFound();
	db.Users.Remove(user);
	db.SaveChanges();
	return Results.Ok();
});
#endregion
#endregion

app.Run();

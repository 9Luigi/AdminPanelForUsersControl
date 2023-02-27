using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.IO.Compression;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;
using System.Text.Json;

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
builder.Services.AddDbContext<EFContext>();
builder.Services.AddTransient<UserCache>();//service cashes users data
builder.Services.AddMemoryCache();
builder.Services.AddResponseCompression(
	options =>
	{
		options.EnableForHttps = true;
		options.Providers.Add(new GzipCompressionProvider(new GzipCompressionProviderOptions()));
	});
builder.Services.Configure<BrotliCompressionProviderOptions>(options => options.Level = CompressionLevel.Optimal);
#endregion

var app = builder.Build();

#region Middleware

app.UseResponseCompression();
app.UseAuthentication();
app.UseAuthorization();
app.ProtectStaticFilesForNonAdminMiddlware(new ProtectStaticFilesForNonAdminOptions("/html/admin", "AdminOnly"));
app.UseDefaultFiles();
app.UseStaticFiles();

#endregion

#region EndPoints

#region Authorization
app.MapGet("/admin", [Authorize(Roles = "Admin")] () => //just for comfort //TODO Redirect instead of endpoint
{
	return Results.Redirect("/html/admin/admin.html");
});

app.MapPost("/login", async (string? returnUrl, HttpContext context, EFContext db) =>
{
	var form = context.Request.Form; //form sends from frontend
	if (!form.ContainsKey("email") || !form.ContainsKey("password"))
		return Results.BadRequest("Email or password not send");
	if (form["email"].Count == 0 || form["password"].Count == 0) return Results.BadRequest("Email or password is empty");
	string email = form["email"]!;
	string password = form["password"]!;
	var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email && u.Password == password);
	if (user == null) //if user not found in database
	{
		return Results.NotFound(new { message = "User is not found" });
	}
	var claims = new List<Claim>
	 {
		 new Claim(ClaimsIdentity.DefaultNameClaimType, email),
		 new Claim(ClaimsIdentity.DefaultRoleClaimType,user.Role) //in database exist 2 roles: Admin and User 2.27.23
	 };
	var claimsIdentity = new ClaimsIdentity(claims, "Cookies");
	var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
	await context.SignInAsync(claimsPrincipal);
	if (user.Role == "Admin")
	{
		return Results.Redirect("/admin");
	}
	return Results.Redirect(returnUrl ?? "/"); //redirect back //TODO redirect to previos url don't work. Cause redirect from authentication options LoginPath?  
});

app.MapGet("/logOut", async (HttpContext context) =>
{
	await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
	return Results.Redirect("/"); //TODO why don't work?

});

#endregion

#region Users CRUD

app.MapGet("/admin/users/{email}", async (string email, EFContext db) => //for search at frontend, //TODO cache
{
	var user = await db.Users.Where(u => u.Email.Contains(email)).Take(15).OrderBy(u => u.Email).ToListAsync();
	if (user is not null)
	{
		return Results.Json(user);
	}
	return Results.NotFound();
});

app.MapGet("/admin/users/{limit}/{offset}", async (int limit, int offset, EFContext db, UserCache cache) =>
{
	var usersID = db.Users.Skip(offset).Take(limit).Select(u => u.Id).OrderBy(u => u).ToList(); //get limit user.id with offset
	List<User> usersToResponse = new();
	foreach (var userID in usersID)
	{
		try
		{
			usersToResponse.Add(await cache.GetUser(userID));
		}
		catch (Exception ex)
		{
			await Console.Out.WriteLineAsync(ex.Message);
		}
	}
	return usersToResponse;
});

app.MapGet("/admin/users/count", (EFContext db) =>
{
	int usersCount = db.Users.Count();
	var usersCountJson = JsonSerializer.Serialize(new { Count = usersCount });
	return Results.Ok(usersCountJson);
	//TODO TRY CATCH ON ALL ENDPOINT ELSE SERVER WILL SHUT DOWN AFTER EACH FRONT ERROR ACCURING END POINTS
});

app.MapPut("/admin/users", async (User? dataFromFront, EFContext db, UserCache cashe) =>
{
	if (dataFromFront == null) return Results.BadRequest(new { message = "Request body is empty" });
	var user = await db.Users.Where(u => u.Id == dataFromFront.Id).FirstOrDefaultAsync();
	if (user == null) return Results.NotFound();
	user.Name = dataFromFront.Name;
	user.Surname = dataFromFront.Surname;
	user.Email = dataFromFront.Email;
	user.Password = dataFromFront.Password;
	user.PhoneNumber = dataFromFront.PhoneNumber;
	user.Role = dataFromFront.Role;
	db.SaveChanges();
	await cashe.RemoveUser(user.Id);
	await cashe.AddUser(user.Id, user);
	return Results.Ok(user);
});

app.MapDelete("/admin/users", async ([FromBody] User? userForDelete, EFContext db, UserCache cache) => //TODO why need attribute FromBody?
{
	if (userForDelete == null) return Results.BadRequest(new { message = "Request body is empty" });
	var user = await db.Users.Where(u => u.Id == userForDelete.Id).FirstOrDefaultAsync();
	if (user == null) return Results.NotFound();
	db.Users.Remove(user);
	db.SaveChanges();
	await cache.RemoveUser(user.Id);
	return Results.Ok();
});

#endregion
#endregion

app.Run();

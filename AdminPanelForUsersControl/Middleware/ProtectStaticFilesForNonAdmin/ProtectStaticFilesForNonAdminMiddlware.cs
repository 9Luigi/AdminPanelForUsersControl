using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using System.Net;

public class ProtectStaticFilesForNonAdminMiddlware
{
	private readonly RequestDelegate next;
	private readonly PathString path;
	private readonly string policyName;

	public ProtectStaticFilesForNonAdminMiddlware(RequestDelegate next, ProtectStaticFilesForNonAdminOptions options)
	{
		this.next = next;
		path = options.Path;
		policyName = options.Policy;
	}

	public async Task Invoke(HttpContext httpContext, IAuthorizationService authorizationService)
	{
		if (httpContext.Request.Path.StartsWithSegments(path, StringComparison.InvariantCultureIgnoreCase))
		{
			var authorized = await authorizationService.AuthorizeAsync(httpContext.User, null, policyName);
			if (!authorized.Succeeded)
			{
				await httpContext.ChallengeAsync(CookieAuthenticationDefaults.AuthenticationScheme);
				return;
			}
			else
			{
				httpContext.Response.Redirect(path);
			}
		}
		await next(httpContext);
	}
}

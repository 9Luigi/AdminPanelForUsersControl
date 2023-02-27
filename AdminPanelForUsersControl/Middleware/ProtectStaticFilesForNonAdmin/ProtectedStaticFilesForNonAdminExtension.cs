using Microsoft.AspNetCore.Builder;

public static class ProtectedStaticFilesForNonAdminExtension
{
  public static IApplicationBuilder ProtectStaticFilesForNonAdminMiddlware(this IApplicationBuilder builder,ProtectStaticFilesForNonAdminOptions options)
	{
		return builder.UseMiddleware<ProtectStaticFilesForNonAdminMiddlware>(options);
	}
}

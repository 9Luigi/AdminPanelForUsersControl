public class ProtectStaticFilesForNonAdminOptions
{
	public PathString Path { get; set; }
	public string Policy { get; set; }
	public ProtectStaticFilesForNonAdminOptions(PathString path, string policy)
	{
		Path = path;
		Policy = policy;
	}
}


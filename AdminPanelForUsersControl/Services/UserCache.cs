using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

public class UserCache
{
	EFContext db;
	IMemoryCache cache;
	public UserCache(EFContext db, IMemoryCache cache)
	{
		this.db = db;
		this.cache = cache;
	}
	public async Task<User?> GetUser(int id)
	{
		cache.TryGetValue(id, out User? user);
		if (user != null) 
		{
            await Console.Out.WriteLineAsync($"{user} cache hit");
            return user;
		}
		user = await db.Users.FirstOrDefaultAsync(u => u.Id == id);
		if (user != null)
		{
			await Console.Out.WriteLineAsync($"{user} cache miss");
			cache.Set(user.Id, user, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(15)));
			return user;
		}
		return null;
	}
}

using Microsoft.AspNetCore.Server.IIS.Core;
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
			cache.Set(user.Id, user, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(15))); //TODO Limit 15 in query == 15 queries to database :)
			return user;
		}
		throw new NullReferenceException($"User with {id} not found in db");
	}
	public async Task RemoveUser(int id)
	{
		cache.Remove(id);
		await Console.Out.WriteLineAsync($"User with id:{id} was removed from cache");
	}
	public async Task AddUser(int id,User user)
	{
		cache.Set(id, user);
		await Console.Out.WriteLineAsync($"User with id:{id} was added to cache");
	}
}

using System;
using Domain;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace Persistence;

public class DbInitializer
{
    public static async Task SeedData(AppDbContext context)
    {
        if (context.Activities.Any()) return;

        var activities = new List<Activity>
            {
            new ()
            {
                Title = "Past Activity 1",
                Date = DateTime.Now.AddMonths(-2),
                Description = "Activity 2 months ago",
                Category = "drinks",
                City = "London",
                Venue = "Pub",
                Latitude = 51.5074,
                Longitude = -0.1278
            },
            new ()
            {
                Title = "Past Activity 2",
                Date = DateTime.Now.AddMonths(-1),
                Description = "Activity 1 month ago",
                Category = "culture",
                City = "Paris",
                Venue = "Louvre",
                Latitude = 48.8566,
                Longitude = 2.3522
            },
            new ()
            {
                Title = "Future Activity 1",
                Date = DateTime.Now.AddMonths(1),
                Description = "Activity 1 month in future",
                Category = "music",
                City = "New York",
                Venue = "Madison Square Garden",
                Latitude = 40.7128,
                Longitude = -74.0060
            },
            new ()
            {
                Title = "Future Activity 2",
                Date = DateTime.Now.AddMonths(2),
                Description = "Activity 2 months in future",
                Category = "travel",
                City = "Tokyo",
                Venue = "Shibuya Crossing",
                Latitude = 35.6895,
                Longitude = 139.6917
            },
            new ()
            {
                Title = "Future Activity 3",
                Date = DateTime.Now.AddMonths(3),
                Description = "Activity 3 months in future",
                Category = "film",
                City = "Los Angeles",
                Venue = "Hollywood Sign",
                Latitude = 34.0522,
                Longitude = -118.2437
            },
            new ()
            {
                Title = "Future Activity 4",
                Date = DateTime.Now.AddMonths(4),
                Description = "Activity 4 months in future",
                Category = "food",
                City = "Rome",
                Venue = "Piazza Navona",
                Latitude = 41.9028,
                Longitude = 12.4964
            },
            new ()
                {
                Title = "Future Activity 5",
                Date = DateTime.Now.AddMonths(5),
                Description = "Activity 5 months in future",
                Category = "drinks",
                City = "Berlin",
                Venue = "Brandenburg Gate",
                Latitude = 52.5200,
                Longitude = 13.4050
            },
            new ()
                {
                Title = "Future Activity 6",
                Date = DateTime.Now.AddMonths(6),
                Description = "Activity 6 months in future",
                Category = "music",
                City = "Sydney",
                Venue = "Sydney Opera House",
                Latitude = -33.8688,
                Longitude = 151.2093
                },
            new ()
                {
                Title = "Future Activity 7",
                Date = DateTime.Now.AddMonths(7),
                Description = "Activity 7 months in future",
                Category = "olympics",
                City = "Harare",
                Venue = "National Sports Stadium",
                Latitude = -133.8688,
                Longitude = 101.2093
                },
            new ()
                {
                Title = "Future Activity 8",
                Date = DateTime.Now.AddMonths(8),
                Description = "Activity 8 months in future",
                Category = "soccer",
                City = "cairo",
                Venue = "Suez Canal",
                Latitude = -102.8688,
                Longitude = 82.2093
                },
             new ()
                {
                Title = "Future Activity 9",
                Date = DateTime.Now.AddMonths(9),
                Description = "Activity 9 months in future",
                Category = "Speech",
                City = "Tel aviv",
                Venue = "Gaza Strip",
                Latitude = -87.8688,
                Longitude = 105.2093
                },
            new ()
                {
                Title = "Future Activity 10",
                Date = DateTime.Now.AddMonths(10),
                Description = "Activity 10 months in future",
                Category = "war games",
                City = "Ukraine",
                Venue = "Kyiv",
                Latitude = -12.8688,
                Longitude = 42.2093
                },
            };

            
            //await 
            context.Activities.AddRange(activities);
            await context.SaveChangesAsync();
    }
}

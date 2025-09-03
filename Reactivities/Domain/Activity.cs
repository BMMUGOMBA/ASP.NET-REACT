using System;

namespace Domain;

public class Activity
{
    public String Id { get; set; } = Guid.NewGuid().ToString();
    public String required Title { get; set; }

    public DateTime Date { get; set; }

    public String Description { get; set; }

    public String Category { get; set; }

    public bool IsCancelled { get; set; }

    //location props
    public String City { get; set; }

    public String Venue { get; set; }

    public double Latitude { get; set; }

    public double Longitude { get; set; }   
}

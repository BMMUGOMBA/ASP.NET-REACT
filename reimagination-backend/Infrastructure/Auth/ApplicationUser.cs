using Microsoft.AspNetCore.Identity;
using System;

namespace Infrastructure.Auth;

public class ApplicationUser : IdentityUser<Guid>
{
    // Extend later (DisplayName, etc.)
}

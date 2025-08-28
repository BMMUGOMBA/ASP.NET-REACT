using Domain;

namespace Api.Services;

public static class StatusTransitionService
{
    public static bool IsAllowed(ProjectStatus from, ProjectStatus to, bool isAdmin)
    {
        if (!isAdmin)
        {
            // Users can only create as Submitted (handled elsewhere), and read.
            return false;
        }

        // Admin transitions:
        return (from, to) switch
        {
            (ProjectStatus.Submitted, ProjectStatus.InReview) => true,
            (ProjectStatus.InReview, ProjectStatus.Approved)  => true,
            (ProjectStatus.InReview, ProjectStatus.Submitted) => true,  // allow back step
            (ProjectStatus.Approved, ProjectStatus.InReview)  => true,  // allow reconsider
            _ => false
        };
    }
}

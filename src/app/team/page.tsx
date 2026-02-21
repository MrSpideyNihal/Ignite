import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Team, TeamMember, Event } from "@/models";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TeamPortalPage() {
    const session = await auth();
    const userEmail = session?.user?.email;

    // Must be signed in
    if (!userEmail) {
        redirect("/auth/signin?callbackUrl=/team");
    }

    await connectToDatabase();
    const emailLower = userEmail.toLowerCase();
    const emailRegex = new RegExp(`^${emailLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");

    // Find all teams where this user is: team lead (by email), registered by (Google email), or a member
    const teamsAsLead = await Team.find({
        $or: [
            { "teamLead.email": { $regex: emailRegex } },
            { registeredByEmail: emailLower },
        ],
    }).lean();
    const leadTeamIds = new Set(teamsAsLead.map((t) => t._id.toString()));

    const memberRecords = await TeamMember.find({
        email: { $regex: emailRegex },
    }).lean();
    const memberTeamIds = memberRecords
        .map((m) => m.teamId)
        .filter((id) => !leadTeamIds.has(id.toString()));

    const teamsAsMember = memberTeamIds.length
        ? await Team.find({ _id: { $in: memberTeamIds } }).lean()
        : [];

    // Combine, deduplicate
    const allTeamsMap = new Map<string, typeof teamsAsLead[0]>();
    for (const t of [...teamsAsLead, ...teamsAsMember]) {
        allTeamsMap.set(t._id.toString(), t);
    }
    const allTeams = Array.from(allTeamsMap.values());

    // Get events for these teams, filter out archived
    const eventIds = Array.from(new Set(allTeams.map((t) => t.eventId.toString())));
    const events = await Event.find({
        _id: { $in: eventIds },
        status: { $ne: "archived" },
    }).lean();
    const activeEventIds = new Set(events.map((e) => e._id.toString()));
    const eventMap = new Map(events.map((e) => [e._id.toString(), e]));

    // Only show teams from non-archived events
    const teams = allTeams.filter((t) => activeEventIds.has(t.eventId.toString()));

    // If exactly one team, go straight to it
    if (teams.length === 1) {
        redirect(`/team/${teams[0].teamCode}`);
    }

    const statusColors: Record<string, "warning" | "success" | "danger"> = {
        pending: "warning",
        approved: "success",
        rejected: "danger",
    };

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom max-w-2xl">
                <div className="page-header text-center">
                    <div className="text-5xl mb-4">🎫</div>
                    <h1 className="page-title">My Teams</h1>
                    <p className="page-subtitle">
                        Signed in as <span className="font-medium">{userEmail}</span>
                    </p>
                </div>

                {teams.length > 0 ? (
                    <div className="space-y-4">
                        {teams.map((team) => {
                            const event = eventMap.get(team.eventId.toString());
                            return (
                                <Link key={team._id.toString()} href={`/team/${team.teamCode}`}>
                                    <Card hover className="transition-all">
                                        <CardContent className="p-5">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">
                                                        {event?.name || "Event"}{" "}
                                                        {event?.date && (
                                                            <span>
                                                                &middot;{" "}
                                                                {new Date(event.date).toLocaleDateString("en-IN", {
                                                                    day: "numeric",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                })}
                                                            </span>
                                                        )}
                                                    </p>
                                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                        {team.projectName}
                                                    </h2>
                                                    <p className="text-sm text-gray-400 mt-0.5 font-mono">
                                                        {team.teamCode}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant={statusColors[team.status] || "neutral"}>
                                                        {team.status}
                                                    </Badge>
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <div className="text-4xl mb-4">📋</div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                No Teams Found
                            </h2>
                            <p className="text-gray-500 mb-6">
                                No team registrations found for {userEmail}.
                            </p>
                            <Link href="/events" className="btn-primary">
                                Register for an Event →
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

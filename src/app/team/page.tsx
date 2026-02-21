import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Team, TeamMember } from "@/models";
import { redirect } from "next/navigation";
import TeamLookupClient from "./TeamLookupClient";

export const dynamic = "force-dynamic";

export default async function TeamPortalPage() {
    // Check if user is signed in with Google
    const session = await auth();
    const userEmail = session?.user?.email;

    // If signed in, look for their team automatically
    if (userEmail) {
        await connectToDatabase();
        const emailLower = userEmail.toLowerCase();

        // 1. Check if they're a team lead (by email)
        let team = await Team.findOne({
            "teamLead.email": { $regex: new RegExp(`^${emailLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") },
        }).lean();

        // 2. If not team lead, check if they're a team member (by email)
        if (!team) {
            const member = await TeamMember.findOne({
                email: emailLower,
            }).lean();
            if (member) {
                team = await Team.findById(member.teamId).lean();
            }
        }

        if (team) {
            // Auto-redirect to their team dashboard
            redirect(`/team/${team.teamCode}`);
        }
    }

    // No auto-match found — show the manual lookup form
    return <TeamLookupClient userEmail={userEmail || undefined} />;
}

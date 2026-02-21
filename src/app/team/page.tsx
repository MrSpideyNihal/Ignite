import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Team } from "@/models";
import { redirect } from "next/navigation";
import TeamLookupClient from "./TeamLookupClient";

export const dynamic = "force-dynamic";

export default async function TeamPortalPage() {
    // Check if user is signed in with Google
    const session = await auth();
    const userEmail = session?.user?.email;

    // If signed in, look for a team where this email is the team lead
    if (userEmail) {
        await connectToDatabase();
        const team = await Team.findOne({
            "teamLead.email": { $regex: new RegExp(`^${userEmail}$`, "i") },
        }).lean();

        if (team) {
            // Auto-redirect to their team dashboard
            redirect(`/team/${team.teamCode}`);
        }
    }

    // No auto-match found — show the manual lookup form
    return <TeamLookupClient userEmail={userEmail || undefined} />;
}

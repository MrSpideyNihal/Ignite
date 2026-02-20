import { requireEventRole } from "@/lib/auth-utils";
import { getEvent } from "@/app/actions/event";
import {
    getEventQuestions,
    getEventJuryMembers,
    getAllSubmissions,
    getTeamScoresSummary,
} from "@/app/actions/jury";
import { getTeamFoodStatus } from "@/app/actions/coupon";
import { getEventTeams } from "@/app/actions/team";
import { Card, CardHeader, CardContent, StatCard } from "@/components/ui";
import { notFound } from "next/navigation";
import Link from "next/link";
import JuryAdminClient from "./JuryAdminClient";

export const dynamic = "force-dynamic";

interface Props {
    params: { eventId: string };
}

export default async function JuryAdminPage({ params }: Props) {
    await requireEventRole(params.eventId, ["jury_admin"]);

    const event = await getEvent(params.eventId);
    if (!event) notFound();

    const [questions, juryMembers, submissions, teams, scores, foodStatus] = await Promise.all([
        getEventQuestions(params.eventId),
        getEventJuryMembers(params.eventId),
        getAllSubmissions(params.eventId),
        getEventTeams(params.eventId, "approved"),
        getTeamScoresSummary(params.eventId),
        getTeamFoodStatus(params.eventId),
    ]);

    const submittedCount = submissions.filter((s) => s.status === "submitted" || s.status === "locked").length;
    const pendingCount = submissions.filter((s) => s.status === "draft" || s.status === "sent_back").length;

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Jury Admin Dashboard
                        </h1>
                        <p className="text-gray-500">{event.name}</p>
                    </div>
                    <div className="flex gap-3">
                        <a
                            href={`/api/export-jury/${params.eventId}`}
                            download
                            className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                            📊 Export Jury Excel
                        </a>
                        <Link href={`/admin/events/${params.eventId}`} className="btn-outline text-sm">
                            ← Back to Event
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Questions" value={questions.length} />
                    <StatCard label="Jury Members" value={juryMembers.length} />
                    <StatCard label="Submitted" value={submittedCount} />
                    <StatCard label="Pending" value={pendingCount} />
                </div>

                {/* Scoreboard */}
                <Card className="mb-8">
                    <CardHeader
                        title="🏆 Team Scoreboard"
                        subtitle="Search, sort, and see food claimed status"
                    />
                    <CardContent>
                        <JuryAdminClient
                            eventId={params.eventId}
                            teams={teams}
                            teamScores={scores}
                            foodStatus={foodStatus}
                            section="scoreboard"
                        />
                    </CardContent>
                </Card>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Questions Management */}
                    <Card>
                        <CardHeader
                            title="Evaluation Questions"
                            subtitle="Define criteria & weightages (must total 100%)"
                        />
                        <CardContent>
                            <JuryAdminClient
                                eventId={params.eventId}
                                questions={questions}
                                section="questions"
                            />
                        </CardContent>
                    </Card>

                    {/* Jury Members */}
                    <Card>
                        <CardHeader
                            title="Jury Members"
                            subtitle="Assign teams to jury members"
                        />
                        <CardContent>
                            <JuryAdminClient
                                eventId={params.eventId}
                                juryMembers={juryMembers}
                                teams={teams}
                                section="jury"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Submissions */}
                <Card className="mt-8">
                    <CardHeader
                        title="All Evaluations"
                        subtitle="Track, send back, or allow re-editing of submitted scores"
                    />
                    <CardContent>
                        <JuryAdminClient
                            eventId={params.eventId}
                            submissions={submissions}
                            section="submissions"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

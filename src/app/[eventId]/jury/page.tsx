import { requireEventRole } from "@/lib/auth-utils";
import { getEvent } from "@/app/actions/event";
import {
    getEventQuestions,
    getEventJuryMembers,
    getAllSubmissions,
    getTeamScoresSummary,
} from "@/app/actions/jury";
import { getEventTeams } from "@/app/actions/team";
import { Card, CardHeader, CardContent, Badge, StatCard } from "@/components/ui";
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

    const [questions, juryMembers, submissions, teams, scores] = await Promise.all([
        getEventQuestions(params.eventId),
        getEventJuryMembers(params.eventId),
        getAllSubmissions(params.eventId),
        getEventTeams(params.eventId, "approved"),
        getTeamScoresSummary(params.eventId),
    ]);

    const submittedCount = submissions.filter(
        (s) => s.status === "submitted" || s.status === "locked"
    ).length;
    const pendingCount = submissions.filter(
        (s) => s.status === "draft" || s.status === "sent_back"
    ).length;

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
                    <Link href={`/admin/events/${params.eventId}`} className="btn-outline text-sm">
                        ← Back to Event
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Questions" value={questions.length} />
                    <StatCard label="Jury Members" value={juryMembers.length} />
                    <StatCard label="Submitted" value={submittedCount} />
                    <StatCard label="Pending" value={pendingCount} />
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Questions Management */}
                    <Card>
                        <CardHeader
                            title="Evaluation Questions"
                            subtitle="Define criteria for team evaluation"
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

                {/* Submissions Overview */}
                <Card className="mt-8">
                    <CardHeader
                        title="Evaluation Progress"
                        subtitle="Track jury submissions"
                    />
                    <CardContent>
                        <JuryAdminClient
                            eventId={params.eventId}
                            submissions={submissions}
                            section="submissions"
                        />
                    </CardContent>
                </Card>

                {/* Leaderboard */}
                {scores.length > 0 && (
                    <Card className="mt-8">
                        <CardHeader title="Team Rankings" subtitle="Based on submitted evaluations" />
                        <CardContent>
                            <div className="space-y-3">
                                {scores.slice(0, 10).map((team, index) => (
                                    <div
                                        key={team.teamCode}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${index === 0
                                                        ? "bg-yellow-500 text-white"
                                                        : index === 1
                                                            ? "bg-gray-400 text-white"
                                                            : index === 2
                                                                ? "bg-amber-600 text-white"
                                                                : "bg-gray-200 dark:bg-gray-700"
                                                    }`}
                                            >
                                                {index + 1}
                                            </span>
                                            <div>
                                                <p className="font-medium">{team.teamCode}</p>
                                                <p className="text-sm text-gray-500">{team.projectName}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">{team.avg.toFixed(1)}</p>
                                            <p className="text-xs text-gray-500">
                                                {team.evaluationCount} evaluations
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

import { requireEventRole } from "@/lib/auth-utils";
import { getEvent } from "@/app/actions/event";
import { getEventQuestions, getJuryAssignments } from "@/app/actions/jury";
import { Card, CardHeader, CardContent, Badge } from "@/components/ui";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
    params: { eventId: string };
}

export default async function JuryEvaluatePage({ params }: Props) {
    await requireEventRole(params.eventId, ["jury_member"]);

    const event = await getEvent(params.eventId);
    if (!event) notFound();

    const assignments = await getJuryAssignments(params.eventId);

    const statusStyles = {
        draft: "bg-gray-100 border-gray-300",
        submitted: "bg-green-50 border-green-500",
        locked: "bg-blue-50 border-blue-500",
        sent_back: "bg-yellow-50 border-yellow-500",
    };

    const statusLabels = {
        draft: "Not Started",
        submitted: "Submitted",
        locked: "Locked",
        sent_back: "Needs Revision",
    };

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom max-w-4xl">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">My Evaluations</h1>
                    <p className="page-subtitle">{event.name}</p>
                </div>

                {/* Assigned Teams */}
                <div className="grid gap-4">
                    {assignments.map((assignment) => (
                        <Card
                            key={assignment._id}
                            className={`border-l-4 ${statusStyles[assignment.status as keyof typeof statusStyles]
                                }`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100">
                                            {assignment.teamCode}
                                        </h3>
                                        <p className="text-gray-500">{assignment.projectName}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <Badge
                                                variant={
                                                    assignment.status === "submitted" || assignment.status === "locked"
                                                        ? "success"
                                                        : assignment.status === "sent_back"
                                                            ? "warning"
                                                            : "neutral"
                                                }
                                            >
                                                {statusLabels[assignment.status as keyof typeof statusLabels]}
                                            </Badge>
                                            {assignment.totalScore > 0 && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Score: {assignment.totalScore}/{assignment.maxPossibleScore}
                                                </p>
                                            )}
                                        </div>
                                        {assignment.status !== "locked" && (
                                            <Link
                                                href={`/${params.eventId}/jury/evaluate/${assignment._id}`}
                                                className="btn-primary text-sm"
                                            >
                                                {assignment.status === "draft" ? "Start" : "Edit"}
                                            </Link>
                                        )}
                                        {assignment.status === "locked" && (
                                            <span className="text-gray-400 text-sm">🔒 Locked</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {assignments.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-500 text-lg">
                                No teams assigned to you yet.
                            </p>
                            <p className="text-gray-400 mt-2">
                                Contact the Jury Admin for team assignments.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

import { getTeamByCode } from "@/app/actions/team";
import { Card, CardHeader, CardContent, Badge } from "@/components/ui";
import { notFound } from "next/navigation";
import Link from "next/link";
import TeamPortalClient from "./TeamPortalClient";

export const dynamic = "force-dynamic";

interface Props {
    params: { teamCode: string };
}

export default async function TeamDetailPage({ params }: Props) {
    const team = await getTeamByCode(params.teamCode);
    if (!team) notFound();

    // Fetch event for dates
    const { Event } = await import("@/models");
    const event = await Event.findById(team.eventId).lean();
    const eventDate = event?.date ? new Date(event.date) : new Date();

    const statusColors = {
        pending: "warning",
        approved: "success",
        rejected: "danger",
    };

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {team.teamCode}
                            </h1>
                            <Badge variant={statusColors[team.status as keyof typeof statusColors] as "warning" | "success" | "danger"}>
                                {team.status}
                            </Badge>
                        </div>
                        <p className="text-gray-500">{team.projectName}</p>
                    </div>
                    <Link href="/team" className="btn-outline text-sm">
                        ← Back
                    </Link>
                </div>

                {/* Status Message */}
                {team.status === "pending" && (
                    <Card className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10">
                        <CardContent className="py-4 text-center text-yellow-800 dark:text-yellow-200">
                            ⏳ Your registration is under review. You&apos;ll be notified once approved.
                        </CardContent>
                    </Card>
                )}

                {team.status === "approved" && (
                    <Card className="mb-6 border-green-500 bg-green-50 dark:bg-green-900/10">
                        <CardContent className="py-4 text-center text-green-800 dark:text-green-200">
                            ✅ Your team has been approved! Food coupons are ready.
                        </CardContent>
                    </Card>
                )}

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Project Info */}
                    <Card>
                        <CardHeader title="Project Details" />
                        <CardContent>
                            <dl className="space-y-3">
                                <div>
                                    <dt className="text-sm text-gray-500">Project Name</dt>
                                    <dd className="font-medium text-gray-900 dark:text-gray-100">
                                        {team.projectName}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Project Code</dt>
                                    <dd className="font-medium text-gray-900 dark:text-gray-100">
                                        {team.projectCode}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    {/* Team Lead */}
                    <Card>
                        <CardHeader title="Team Lead" />
                        <CardContent>
                            <dl className="space-y-3">
                                <div>
                                    <dt className="text-sm text-gray-500">Name</dt>
                                    <dd className="font-medium text-gray-900 dark:text-gray-100">
                                        {team.teamLead.name}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Phone</dt>
                                    <dd className="font-medium text-gray-900 dark:text-gray-100">
                                        {team.teamLead.phone}
                                    </dd>
                                </div>
                                {team.teamLead.email && (
                                    <div>
                                        <dt className="text-sm text-gray-500">Email</dt>
                                        <dd className="font-medium text-gray-900 dark:text-gray-100">
                                            {team.teamLead.email}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </CardContent>
                    </Card>
                </div>

                {/* Guide */}
                {team.guide?.name && (
                    <Card className="mt-6">
                        <CardHeader title="Guide / Mentor" />
                        <CardContent>
                            <div className="flex flex-wrap gap-6">
                                <div>
                                    <dt className="text-sm text-gray-500">Name</dt>
                                    <dd className="font-medium">{team.guide.name}</dd>
                                </div>
                                {team.guide.phone && (
                                    <div>
                                        <dt className="text-sm text-gray-500">Phone</dt>
                                        <dd className="font-medium">{team.guide.phone}</dd>
                                    </div>
                                )}
                                {team.guide.email && (
                                    <div>
                                        <dt className="text-sm text-gray-500">Email</dt>
                                        <dd className="font-medium">{team.guide.email}</dd>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Team Members */}
                <Card className="mt-6">
                    <CardHeader title={`Team Members (${team.members.length})`} />
                    <CardContent>
                        <TeamPortalClient
                            teamCode={team.teamCode}
                            members={team.members}
                            isApproved={team.status === "approved"}
                            eventDate={eventDate.toISOString()}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

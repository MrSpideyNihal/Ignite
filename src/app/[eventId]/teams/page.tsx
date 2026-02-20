import { requireEventRole } from "@/lib/auth-utils";
import { getEvent } from "@/app/actions/event";
import { getEventTeams, getTeamStats } from "@/app/actions/team";
import { Card, CardContent, StatCard } from "@/components/ui";
import { notFound } from "next/navigation";
import Link from "next/link";
import TeamsClient from "./TeamsClient";
import ImportClient from "../import/ImportClient";

export const dynamic = "force-dynamic";

interface Props {
    params: { eventId: string };
}

export default async function TeamsPage({ params }: Props) {
    await requireEventRole(params.eventId, ["registration_committee"]);

    const event = await getEvent(params.eventId);
    if (!event) notFound();

    const teams = await getEventTeams(params.eventId);
    const stats = await getTeamStats(params.eventId);

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Team Registration
                        </h1>
                        <p className="text-gray-500">{event.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/admin/events/${params.eventId}`} className="btn-outline text-sm">
                            ← Back to Event
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total Teams" value={stats.teams.total} />
                    <StatCard
                        label="Pending"
                        value={stats.teams.pending}
                        className={stats.teams.pending > 0 ? "border-yellow-500" : ""}
                    />
                    <StatCard label="Approved" value={stats.teams.approved} />
                    <StatCard label="Total Members" value={stats.members.attending} />
                </div>

                {/* Food Stats */}
                <Card className="mb-8">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-center gap-8">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{stats.food.veg}</p>
                                <p className="text-sm text-gray-500">Vegetarian</p>
                            </div>
                            <div className="w-px h-12 bg-gray-200 dark:bg-gray-700" />
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">{stats.food.nonVeg}</p>
                                <p className="text-sm text-gray-500">Non-Vegetarian</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Teams List + Import (Client Component handles tabs) */}
                <TeamsClient
                    eventId={params.eventId}
                    teams={teams}
                    maxTeamSize={event.settings?.maxTeamSize || 6}
                />
            </div>
        </div>
    );
}

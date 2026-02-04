import { requireSuperAdmin } from "@/lib/auth-utils";
import { getEvents } from "@/app/actions/event";
import { Card, CardHeader, CardContent, Badge } from "@/components/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboard() {
    await requireSuperAdmin();
    const events = await getEvents();

    const activeEvents = events.filter((e) => e.status === "active");
    const draftEvents = events.filter((e) => e.status === "draft");
    const archivedEvents = events.filter((e) => e.status === "archived");

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">Super Admin Dashboard</h1>
                    <p className="page-subtitle">Manage all IGNITE events</p>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <Link href="/admin/events/new" className="btn-primary">
                        + Create New Event
                    </Link>
                    <Link href="/admin/users" className="btn-outline">
                        Manage Global Users
                    </Link>
                </div>

                {/* Active Events */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                        Active Events ({activeEvents.length})
                    </h2>
                    {activeEvents.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeEvents.map((event) => (
                                <EventCard key={event._id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No active events</p>
                    )}
                </section>

                {/* Draft Events */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                        Draft Events ({draftEvents.length})
                    </h2>
                    {draftEvents.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {draftEvents.map((event) => (
                                <EventCard key={event._id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No draft events</p>
                    )}
                </section>

                {/* Archived Events */}
                {archivedEvents.length > 0 && (
                    <section>
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                            Archived Events ({archivedEvents.length})
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
                            {archivedEvents.map((event) => (
                                <EventCard key={event._id} event={event} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

function EventCard({ event }: { event: { _id: string; name: string; year: number; date: string; status: string; settings: { registrationOpen: boolean; evaluationOpen: boolean } } }) {
    const statusColors = {
        draft: "warning",
        active: "success",
        archived: "neutral",
    };

    return (
        <Card hover>
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {event.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {new Date(event.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                    </div>
                    <Badge variant={statusColors[event.status as keyof typeof statusColors] as "warning" | "success" | "neutral"}>
                        {event.status}
                    </Badge>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {event.settings.registrationOpen && (
                        <Badge variant="primary">Registration Open</Badge>
                    )}
                    {event.settings.evaluationOpen && (
                        <Badge variant="primary">Evaluation Open</Badge>
                    )}
                </div>

                <Link
                    href={`/admin/events/${event._id}`}
                    className="block text-center py-2 px-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                    Manage Event →
                </Link>
            </CardContent>
        </Card>
    );
}

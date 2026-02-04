import { requireSuperAdmin } from "@/lib/auth-utils";
import { getEvent, getEventRoles } from "@/app/actions/event";
import { Card, CardHeader, CardContent, Badge } from "@/components/ui";
import { notFound } from "next/navigation";
import Link from "next/link";
import EventManageClient from "./EventManageClient";

export const dynamic = "force-dynamic";

interface Props {
    params: { eventId: string };
}

export default async function EventManagePage({ params }: Props) {
    await requireSuperAdmin();

    const event = await getEvent(params.eventId);
    if (!event) notFound();

    const roles = await getEventRoles(params.eventId);

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                        ← Back
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {event.name}
                        </h1>
                        <p className="text-gray-500">
                            {new Date(event.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                    </div>
                    <Badge variant={event.status === "active" ? "success" : event.status === "draft" ? "warning" : "neutral"}>
                        {event.status}
                    </Badge>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Event Settings */}
                    <Card>
                        <CardHeader title="Event Settings" />
                        <CardContent>
                            <EventManageClient event={event} />
                        </CardContent>
                    </Card>

                    {/* Committee Members */}
                    <Card>
                        <CardHeader title="Committee Members" subtitle="Manage roles for this event" />
                        <CardContent>
                            <EventManageClient event={event} roles={roles} showRoles />
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Links */}
                <div className="mt-8 grid md:grid-cols-4 gap-4">
                    <Link
                        href={`/${params.eventId}/teams`}
                        className="card-hover p-4 text-center"
                    >
                        <span className="text-2xl">👥</span>
                        <p className="font-medium mt-2">Teams</p>
                    </Link>
                    <Link
                        href={`/${params.eventId}/jury`}
                        className="card-hover p-4 text-center"
                    >
                        <span className="text-2xl">⚖️</span>
                        <p className="font-medium mt-2">Jury</p>
                    </Link>
                    <Link
                        href={`/${params.eventId}/food`}
                        className="card-hover p-4 text-center"
                    >
                        <span className="text-2xl">🍽️</span>
                        <p className="font-medium mt-2">Food</p>
                    </Link>
                    <Link
                        href={`/${params.eventId}/logistics`}
                        className="card-hover p-4 text-center"
                    >
                        <span className="text-2xl">📱</span>
                        <p className="font-medium mt-2">QR Scanner</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}

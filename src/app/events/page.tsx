import { getActiveEvents } from "@/app/actions/event";
import { Card, CardContent, Badge } from "@/components/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
    const events = await getActiveEvents();

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                <div className="page-header text-center">
                    <h1 className="page-title">IGNITE Events</h1>
                    <p className="page-subtitle">Select an event to register your team</p>
                </div>

                {events.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {events.map((event) => (
                            <Card key={event._id} hover>
                                <CardContent className="p-6 text-center">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                        {event.name}
                                    </h2>
                                    <p className="text-gray-500 mb-4">
                                        {new Date(event.date).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                    {event.venue && (
                                        <p className="text-sm text-gray-400 mb-4">{event.venue}</p>
                                    )}
                                    <div className="flex flex-col gap-2">
                                        {event.settings.registrationOpen ? (
                                            <Link
                                                href={`/events/${event._id}/register`}
                                                className="btn-primary"
                                            >
                                                Register Team
                                            </Link>
                                        ) : (
                                            <Badge variant="warning">Registration Closed</Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">
                            No active events at the moment.
                        </p>
                        <p className="text-gray-400 mt-2">
                            Check back later for upcoming IGNITE events!
                        </p>
                    </div>
                )}

                {/* Team Portal Link */}
                <div className="mt-12 text-center">
                    <p className="text-gray-500 mb-4">Already registered?</p>
                    <Link href="/team" className="btn-outline">
                        Access Team Portal
                    </Link>
                </div>
            </div>
        </div>
    );
}

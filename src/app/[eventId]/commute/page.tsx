import { checkEventAccess } from "@/lib/auth-utils";
import { connectToDatabase } from "@/lib/mongodb";
import { Event, CommuteSchedule } from "@/models";
import { Card, CardContent, Badge, EmptyState } from "@/components/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
    params: { eventId: string };
}

export default async function CommutePage({ params }: PageProps) {
    const { eventId } = params;

    // Commute page is publicly accessible — no redirect needed
    // Just check for display purposes
    await checkEventAccess(eventId, ["registration_committee", "jury_admin", "jury_member", "logistics_committee", "food_committee"]);

    await connectToDatabase();

    const event = await Event.findById(eventId);
    if (!event) {
        return <div className="container-custom py-8">Event not found</div>;
    }

    // Load actual bus schedules from DB
    const dbSchedules = await CommuteSchedule.find({ isActive: true }).sort({ date: 1, departureTime: 1 }).lean();

    // Convert DB records to display format, grouped by busNumber
    const busMap = new Map<string, { id: string; busNumber: string; color: string; route: string; stops: string[]; departureTimes: string[] }>();
    for (const s of dbSchedules) {
        const key = s.busNumber;
        if (!busMap.has(key)) {
            busMap.set(key, {
                id: s._id.toString(),
                busNumber: s.busNumber,
                color: s.busColor || "Gray",
                route: s.route,
                stops: s.stops || [],
                departureTimes: [],
            });
        }
        const entry = busMap.get(key)!;
        if (s.departureTime && !entry.departureTimes.includes(s.departureTime)) {
            entry.departureTimes.push(s.departureTime);
        }
    }
    const scheduleData = Array.from(busMap.values());

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="page-header">
                    <div className="flex items-center gap-4">
                        <Link href={`/${eventId}/dashboard`} className="text-gray-500 hover:text-gray-700">
                            ← Back
                        </Link>
                        <div>
                            <h1 className="page-title">Commute & Transport</h1>
                            <p className="page-subtitle">{event.name}</p>
                        </div>
                    </div>
                </div>

                {/* Event Date Info */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <span className="text-4xl">🚌</span>
                            <div>
                                <h2 className="text-xl font-semibold">
                                    Event Date: {new Date(event.date).toLocaleDateString("en-IN", {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </h2>
                                <p className="text-gray-500">
                                    Venue: {event.venue || "To be announced"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bus Schedules */}
                <h2 className="text-xl font-semibold mb-4">Bus Schedule</h2>
                {scheduleData.length === 0 ? (
                    <Card className="mb-4">
                        <CardContent className="p-6 text-center text-gray-500">
                            No bus schedules have been added yet. Contact the logistics committee.
                        </CardContent>
                    </Card>
                ) : (
                <div className="space-y-4">
                    {scheduleData.map((bus) => (
                        <Card key={bus.id}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                                            style={{ backgroundColor: bus.color.toLowerCase() }}
                                        >
                                            🚌
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{bus.busNumber}</h3>
                                            <p className="text-sm text-gray-500">{bus.route}</p>
                                        </div>
                                    </div>
                                    <Badge variant="primary">{bus.color} Bus</Badge>
                                </div>

                                {/* Stops */}
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Stops:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {bus.stops.map((stop, idx) => (
                                            <span key={idx} className="flex items-center gap-1">
                                                <span className="text-gray-700 dark:text-gray-300">{stop}</span>
                                                {idx < bus.stops.length - 1 && (
                                                    <span className="text-gray-400">→</span>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Departure Times */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Departure Times:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {bus.departureTimes.map((time, idx) => (
                                            <Badge key={idx} variant="neutral">
                                                {time}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                )}

                {/* Contact Info */}
                <Card className="mt-8">
                    <CardContent className="p-6">
                        <h3 className="font-semibold mb-2">Need Help?</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            For transport-related queries, please contact the logistics team.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

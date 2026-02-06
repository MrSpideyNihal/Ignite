import { requireEventRole } from "@/lib/auth-utils";
import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/models";
import { Card, CardContent, Badge, EmptyState } from "@/components/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
    params: { eventId: string };
}

// Sample bus schedule data (would come from DB in production)
const sampleSchedule = [
    {
        id: "1",
        busNumber: "IGN-01",
        color: "Red",
        route: "Central Station → Venue",
        stops: ["Central Station", "City Center Mall", "Tech Park", "IGNITE Venue"],
        departureTimes: ["08:00", "09:00", "10:00", "14:00", "18:00"],
    },
    {
        id: "2",
        busNumber: "IGN-02",
        color: "Blue",
        route: "Airport → Venue",
        stops: ["Airport Terminal 1", "Airport Terminal 2", "Highway Junction", "IGNITE Venue"],
        departureTimes: ["07:30", "12:00", "17:00"],
    },
    {
        id: "3",
        busNumber: "IGN-03",
        color: "Green",
        route: "College Hub → Venue",
        stops: ["Engineering College", "Arts College", "Business School", "IGNITE Venue"],
        departureTimes: ["08:30", "09:30", "13:30", "17:30"],
    },
];

export default async function CommutePage({ params }: PageProps) {
    const { eventId } = params;

    // Check if user has any event role or is public
    try {
        await requireEventRole(eventId, ["registration_committee", "jury_admin", "jury_member", "logistics_committee", "food_committee"]);
    } catch {
        // Allow public access for commute info
    }

    await connectToDatabase();

    const event = await Event.findById(eventId);
    if (!event) {
        return <div className="container-custom py-8">Event not found</div>;
    }

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
                <div className="space-y-4">
                    {sampleSchedule.map((bus) => (
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

import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/models";
import { Card, CardContent } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AccommodationPage() {
    await connectToDatabase();

    // Get active events
    const events = await Event.find({ status: "active" })
        .sort({ date: 1 })
        .lean();

    return (
        <div className="min-h-screen py-12">
            <div className="container-custom">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <h1 className="text-4xl font-bold gradient-text mb-4">
                        Accommodation
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Book accommodation for IGNITE event participants.
                        Select an event to manage your team&apos;s accommodation.
                    </p>
                </div>

                {events.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No active events at the moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 max-w-2xl mx-auto">
                        {events.map((event) => (
                            <Card key={event._id.toString()} hover>
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-semibold mb-2">{event.name}</h2>
                                    <p className="text-gray-500 mb-4">
                                        {new Date(event.date).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        To manage accommodation, please access your team portal with your team code.
                                    </p>
                                    <Link href="/team" className="btn-primary">
                                        Go to Team Portal
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="text-center mt-8">
                    <p className="text-gray-500 mb-4">
                        Don&apos;t have a team yet?
                    </p>
                    <Link href="/events" className="btn-outline">
                        Register Your Team First
                    </Link>
                </div>
            </div>
        </div>
    );
}

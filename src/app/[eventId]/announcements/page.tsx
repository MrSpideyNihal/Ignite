import { requireEventRole } from "@/lib/auth-utils";
import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/models";
import { Card, CardContent, Badge, EmptyState } from "@/components/ui";
import Link from "next/link";
import AnnouncementsClient from "./AnnouncementsClient";

export const dynamic = "force-dynamic";

interface PageProps {
    params: { eventId: string };
}

// Define Announcement interface since model may not exist
interface Announcement {
    _id: string;
    title: string;
    content: string;
    category: string;
    priority: string;
    createdAt: Date;
}

export default async function AnnouncementsPage({ params }: PageProps) {
    const { eventId } = params;

    // Check if user has any event role
    await requireEventRole(eventId, ["registration_committee", "jury_admin", "jury_member", "logistics_committee", "food_committee"]);
    await connectToDatabase();

    const event = await Event.findById(eventId);
    if (!event) {
        return <div className="container-custom py-8">Event not found</div>;
    }

    // Try to get announcements if model exists
    let announcements: Announcement[] = [];
    try {
        const AnnouncementModel = (await import("@/models")).Announcement;
        if (AnnouncementModel) {
            const docs = await AnnouncementModel.find({ eventId })
                .sort({ createdAt: -1 })
                .lean();
            announcements = docs.map((a: unknown) => {
                const doc = a as { _id: { toString: () => string }; title: string; content: string; category: string; priority: string; createdAt: Date };
                return {
                    _id: doc._id.toString(),
                    title: doc.title,
                    content: doc.content,
                    category: doc.category,
                    priority: doc.priority,
                    createdAt: doc.createdAt,
                };
            });
        }
    } catch {
        // Announcement model doesn't exist yet
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
                            <h1 className="page-title">Announcements</h1>
                            <p className="page-subtitle">{event.name}</p>
                        </div>
                    </div>
                </div>

                <AnnouncementsClient
                    eventId={eventId}
                    initialAnnouncements={announcements}
                />
            </div>
        </div>
    );
}

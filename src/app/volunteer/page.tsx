export const dynamic = "force-dynamic";

import { connectToDatabase } from "@/lib/mongodb";
import { Announcement, CommuteSchedule } from "@/models";
import { Card, CardHeader, CardContent, Badge } from "@/components/ui";
import Link from "next/link";

async function getAnnouncements() {
    await connectToDatabase();
    // Get the latest active event to scope announcements
    const { Event } = await import("@/models");
    const activeEvent = await Event.findOne({ status: "active" }).sort({ year: -1 }).lean();
    const query = activeEvent ? { eventId: activeEvent._id } : {};
    const announcements = await Announcement.find(query)
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
    return announcements.map((a) => ({
        _id: a._id.toString(),
        title: a.title,
        content: a.content,
        category: a.category,
        priority: a.priority,
        createdAt: a.createdAt,
    }));
}

async function getCommuteSchedules() {
    await connectToDatabase();
    const schedules = await CommuteSchedule.find({ isActive: true })
        .sort({ date: 1, departureTime: 1 })
        .lean();
    return schedules.map((s) => ({
        _id: s._id.toString(),
        busNumber: s.busNumber,
        busColor: s.busColor,
        route: s.route,
        stops: s.stops,
        departureTime: s.departureTime,
        arrivalTime: s.arrivalTime,
        date: s.date,
        capacity: s.capacity,
    }));
}

export default async function VolunteerDashboard() {
    const announcements = await getAnnouncements();
    const schedules = await getCommuteSchedules();

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">Volunteer Dashboard</h1>
                    <p className="page-subtitle">Welcome to IGNITE 2026</p>
                </div>

                {/* Event Info */}
                <Card className="mb-8 bg-gradient-to-r from-primary-500 to-secondary-500 text-white border-0">
                    <CardContent className="py-8 text-center">
                        <h2 className="text-3xl font-bold mb-2">IGNITE 2026</h2>
                        <p className="text-white/90 text-lg">February 28, 2026</p>
                        <p className="text-white/80 mt-2">Innovation Hub, Tech Park</p>
                    </CardContent>
                </Card>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Announcements */}
                    <Card>
                        <CardHeader title="📢 Announcements" />
                        <CardContent className="max-h-[500px] overflow-y-auto">
                            {announcements.length > 0 ? (
                                <div className="space-y-4">
                                    {announcements.map((announcement) => (
                                        <div
                                            key={announcement._id}
                                            className={`p-4 rounded-lg border-l-4 ${announcement.priority === "high"
                                                ? "bg-red-50 dark:bg-red-900/20 border-red-500"
                                                : announcement.priority === "medium"
                                                    ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500"
                                                    : "bg-gray-50 dark:bg-gray-800/50 border-gray-300"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {announcement.title}
                                                </h3>
                                                <Badge variant={announcement.priority === "high" ? "danger" : announcement.priority === "medium" ? "warning" : "neutral"}>
                                                    {announcement.priority}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {announcement.content}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(announcement.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">
                                    No announcements yet
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Commute Schedule */}
                    <Card>
                        <CardHeader title="🚌 Commute Schedule" />
                        <CardContent className="max-h-[500px] overflow-y-auto">
                            {schedules.length > 0 ? (
                                <div className="space-y-4">
                                    {schedules.map((schedule) => (
                                        <div
                                            key={schedule._id}
                                            className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                                                    style={{ backgroundColor: schedule.busColor || "#6366f1" }}
                                                >
                                                    {schedule.busNumber}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {schedule.route}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        {schedule.departureTime} → {schedule.arrivalTime}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                Stops: {schedule.stops?.join(" → ")}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">
                                    No schedules available
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Links */}
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                        Quick Links
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href="/events" className="card-hover p-4 text-center">
                            <span className="text-2xl">📝</span>
                            <p className="mt-2 font-medium">Register Team</p>
                        </Link>
                        <Link href="/team" className="card-hover p-4 text-center">
                            <span className="text-2xl">👥</span>
                            <p className="mt-2 font-medium">Team Portal</p>
                        </Link>
                        <Link href="/" className="card-hover p-4 text-center">
                            <span className="text-2xl">🏠</span>
                            <p className="mt-2 font-medium">Home</p>
                        </Link>
                        <Link href="/api/auth/signin" className="card-hover p-4 text-center">
                            <span className="text-2xl">🔐</span>
                            <p className="mt-2 font-medium">Staff Login</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

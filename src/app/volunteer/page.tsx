export const dynamic = "force-dynamic";

import { getAnnouncements } from "@/app/actions/admin";
import { getCommuteSchedules } from "@/app/actions/commute";
import { Card, CardHeader, CardContent, Badge } from "@/components/ui";
import Link from "next/link";

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
                                                ? "border-l-red-500 bg-red-50 dark:bg-red-900/10"
                                                : announcement.priority === "medium"
                                                    ? "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10"
                                                    : "border-l-gray-300 bg-gray-50 dark:bg-gray-800/50"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge
                                                    variant={
                                                        announcement.priority === "high"
                                                            ? "danger"
                                                            : announcement.priority === "medium"
                                                                ? "warning"
                                                                : "neutral"
                                                    }
                                                >
                                                    {announcement.category}
                                                </Badge>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(announcement.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                {announcement.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {announcement.content}
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
                        <CardHeader title="🚌 Bus Schedule" />
                        <CardContent className="max-h-[500px] overflow-y-auto">
                            {schedules.length > 0 ? (
                                <div className="space-y-4">
                                    {schedules.map((schedule) => (
                                        <div
                                            key={schedule._id}
                                            className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div
                                                    className="w-6 h-6 rounded-full"
                                                    style={{ backgroundColor: schedule.busColor.toLowerCase() }}
                                                />
                                                <span className="font-bold text-gray-900 dark:text-gray-100">
                                                    {schedule.busNumber}
                                                </span>
                                                <Badge variant="primary">
                                                    {schedule.departureTime} - {schedule.arrivalTime}
                                                </Badge>
                                            </div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {schedule.route}
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {schedule.stops.map((stop, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                                                    >
                                                        {stop}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">
                                    No schedules available yet
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Venue Info */}
                <Card className="mt-8">
                    <CardHeader title="📍 Venue Information" />
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Main Venue
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Innovation Hub, Tech Park
                                    <br />
                                    123 Technology Avenue
                                    <br />
                                    Innovation District
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Facilities
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="primary">WiFi</Badge>
                                    <Badge variant="primary">Parking</Badge>
                                    <Badge variant="primary">Cafeteria</Badge>
                                    <Badge variant="primary">Rest Rooms</Badge>
                                    <Badge variant="primary">First Aid</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <Link href="/" className="btn-outline">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

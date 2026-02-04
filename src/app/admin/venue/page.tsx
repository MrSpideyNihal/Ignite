import { requireRole } from "@/lib/auth-utils";
import { getAnnouncements } from "@/app/actions/admin";
import { Card, CardHeader, CardContent, Badge } from "@/components/ui";
import Link from "next/link";

export default async function VenueAdminDashboard() {
    await requireRole(["super_admin", "venue_admin"]);
    const announcements = await getAnnouncements();

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">Venue Admin Dashboard</h1>
                    <p className="page-subtitle">Manage venue information and announcements</p>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <Link href="/admin/venue/announcements" className="btn-primary">
                        + Create Announcement
                    </Link>
                </div>

                {/* Venue Info Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardContent className="py-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                Main Venue
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm text-gray-500">Location</span>
                                    <p className="font-medium">Innovation Hub, Tech Park</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Address</span>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        123 Technology Avenue, Innovation District
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Contact</span>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        +91 9876543210
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="py-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                Facilities
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="primary">WiFi</Badge>
                                <Badge variant="primary">Parking</Badge>
                                <Badge variant="primary">Cafeteria</Badge>
                                <Badge variant="primary">Auditorium</Badge>
                                <Badge variant="primary">Labs</Badge>
                                <Badge variant="primary">Rest Rooms</Badge>
                                <Badge variant="primary">First Aid</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Announcements */}
                <Card>
                    <CardHeader
                        title="Recent Announcements"
                        action={
                            <Link
                                href="/admin/venue/announcements"
                                className="text-sm text-primary-500 hover:text-primary-600"
                            >
                                View All →
                            </Link>
                        }
                    />
                    <CardContent>
                        {announcements.length > 0 ? (
                            <div className="space-y-4">
                                {announcements.slice(0, 5).map((announcement) => (
                                    <div
                                        key={announcement._id}
                                        className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {announcement.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {announcement.content.substring(0, 100)}
                                                    {announcement.content.length > 100 && "..."}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <Badge
                                                        variant={
                                                            announcement.priority === "high"
                                                                ? "danger"
                                                                : announcement.priority === "medium"
                                                                    ? "warning"
                                                                    : "neutral"
                                                        }
                                                    >
                                                        {announcement.priority}
                                                    </Badge>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(announcement.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">No announcements yet</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

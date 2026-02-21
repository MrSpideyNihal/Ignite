import { requireEventRole } from "@/lib/auth-utils";
import { connectToDatabase } from "@/lib/mongodb";
import { Team, TeamMember, Coupon, EvaluationSubmission, Event } from "@/models";
import { Card, CardContent, StatCard, Badge } from "@/components/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
    params: { eventId: string };
}

export default async function EventDashboard({ params }: PageProps) {
    const { eventId } = params;

    // Check if user has any event role
    await requireEventRole(eventId, ["registration_committee", "jury_admin", "jury_member", "logistics_committee", "food_committee"]);
    await connectToDatabase();

    const event = await Event.findById(eventId);
    if (!event) {
        return <div className="container-custom py-8">Event not found</div>;
    }

    // Get stats
    const teamsCount = await Team.countDocuments({ eventId });
    const approvedTeams = await Team.countDocuments({ eventId, status: "approved" });
    const pendingTeams = await Team.countDocuments({ eventId, status: "pending" });

    const membersCount = await TeamMember.countDocuments({ eventId, isAttending: { $ne: false } });
    const vegCount = await TeamMember.countDocuments({ eventId, isAttending: { $ne: false }, foodPreference: "veg" });
    const nonVegCount = await TeamMember.countDocuments({ eventId, isAttending: { $ne: false }, foodPreference: "non-veg" });

    const totalCoupons = await Coupon.countDocuments({ eventId });
    const usedCoupons = await Coupon.countDocuments({ eventId, isUsed: true });

    const totalEvaluations = await EvaluationSubmission.countDocuments({ eventId });
    const lockedEvaluations = await EvaluationSubmission.countDocuments({ eventId, status: "locked" });

    const quickLinks = [
        { href: `/${eventId}/teams`, label: "Teams", icon: "👥", description: "Manage team registrations" },
        { href: `/${eventId}/import`, label: "Import Teams", icon: "📥", description: "Bulk import via Excel" },
        { href: `/${eventId}/jury`, label: "Jury", icon: "⚖️", description: "Evaluation management" },
        { href: `/${eventId}/food`, label: "Food", icon: "🍽️", description: "Food preferences & coupons" },
        { href: `/${eventId}/logistics`, label: "Logistics", icon: "📦", description: "QR scanning & attendance" },
        { href: `/${eventId}/accommodation`, label: "Accommodation", icon: "🏨", description: "Room assignments" },
        { href: `/${eventId}/announcements`, label: "Announcements", icon: "📢", description: "Event updates" },
        { href: `/${eventId}/commute`, label: "Commute", icon: "🚌", description: "Bus schedules" },
    ];

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">{event.name}</h1>
                        <p className="page-subtitle">
                            {new Date(event.date).toLocaleDateString("en-IN", {
                                day: "numeric", month: "long", year: "numeric"
                            })}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {event.settings?.registrationOpen && (
                            <Badge variant="success">Registration Open</Badge>
                        )}
                        {event.settings?.evaluationOpen && (
                            <Badge variant="primary">Evaluation Open</Badge>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total Teams" value={teamsCount} />
                    <StatCard label="Approved" value={approvedTeams} />
                    <StatCard label="Pending" value={pendingTeams} />
                    <StatCard label="Attending" value={membersCount} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Veg" value={vegCount} />
                    <StatCard label="Non-Veg" value={nonVegCount} />
                    <StatCard label="Coupons Used" value={`${usedCoupons}/${totalCoupons}`} />
                    <StatCard label="Evaluations Locked" value={`${lockedEvaluations}/${totalEvaluations}`} />
                </div>

                {/* Quick Links */}
                <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {quickLinks.map((link) => (
                        <Link key={link.href} href={link.href}>
                            <Card hover>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl">{link.icon}</span>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                {link.label}
                                            </h3>
                                            <p className="text-sm text-gray-500">{link.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Export Section */}
                <h2 className="text-xl font-semibold mt-8 mb-4">Export Data</h2>
                <Card>
                    <CardContent className="p-6">
                        {/* Export All Button - Prominent */}
                        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <a
                                href={`/api/export-all/${eventId}`}
                                className="btn-primary inline-flex items-center gap-2 text-lg px-6 py-3"
                                download
                            >
                                📦 Export All Data (ZIP)
                            </a>
                            <p className="text-sm text-gray-500 mt-2">
                                Download all event data (teams, food, coupons, accommodation, evaluations, attendance) in one ZIP file
                            </p>
                        </div>

                        {/* Individual Exports */}
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Or export individually:</p>
                        <div className="flex flex-wrap gap-3">
                            <a href={`/api/export/${eventId}/teams`} className="btn-outline" download>
                                Teams
                            </a>
                            <a href={`/api/export/${eventId}/food`} className="btn-outline" download>
                                Food Report
                            </a>
                            <a href={`/api/export/${eventId}/coupons`} className="btn-outline" download>
                                Coupons
                            </a>
                            <a href={`/api/export/${eventId}/accommodation`} className="btn-outline" download>
                                Accommodation
                            </a>
                            <a href={`/api/export/${eventId}/evaluations`} className="btn-outline" download>
                                Evaluations
                            </a>
                            <a href={`/api/export/${eventId}/attendance`} className="btn-outline" download>
                                Attendance
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

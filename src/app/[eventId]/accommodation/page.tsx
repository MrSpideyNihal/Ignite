import { requireEventRole } from "@/lib/auth-utils";
import { connectToDatabase } from "@/lib/mongodb";
import { Team, TeamMember, Event } from "@/models";
import { Card, CardContent, StatCard, Badge } from "@/components/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
    params: { eventId: string };
}

export default async function AccommodationDashboard({ params }: PageProps) {
    const { eventId } = params;

    // Check if user has access (super_admin or logistics role)
    await requireEventRole(eventId, ["logistics_committee", "registration_committee"]);
    await connectToDatabase();

    const event = await Event.findById(eventId);
    if (!event) {
        return <div className="container-custom py-8">Event not found</div>;
    }

    // Get all approved teams
    const teams = await Team.find({ eventId, status: "approved" }).lean();
    const teamIds = teams.map((t) => t._id);

    // Get all members with accommodation
    const members = await TeamMember.find({
        teamId: { $in: teamIds },
        isAttending: true,
    }).lean();

    // Calculate stats
    const needsAccommodation = members.filter((m) => m.accommodation?.type);
    const dormCount = needsAccommodation.filter((m) => m.accommodation?.type === "dorm").length;
    const suiteCount = needsAccommodation.filter((m) => m.accommodation?.type === "suite").length;

    // Gender breakdown (based on prefix)
    const maleCount = needsAccommodation.filter((m) => m.prefix === "Mr").length;
    const femaleCount = needsAccommodation.filter((m) => m.prefix === "Ms").length;
    const otherCount = needsAccommodation.length - maleCount - femaleCount;

    // Date breakdown
    const dateBreakdown: Record<string, number> = {};
    needsAccommodation.forEach((m) => {
        if (m.accommodation?.dates && Array.isArray(m.accommodation.dates)) {
            for (const date of m.accommodation.dates) {
                const dateStr = String(date);
                dateBreakdown[dateStr] = (dateBreakdown[dateStr] || 0) + 1;
            }
        }
    });

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="page-header">
                    <div className="flex items-center gap-4">
                        <Link href={`/admin/events/${eventId}`} className="text-gray-500 hover:text-gray-700">
                            ← Back
                        </Link>
                        <div>
                            <h1 className="page-title">Accommodation Dashboard</h1>
                            <p className="page-subtitle">{event.name}</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total Requests" value={needsAccommodation.length} />
                    <StatCard label="Dorm" value={dormCount} />
                    <StatCard label="Suite" value={suiteCount} />
                    <StatCard label="Teams" value={teams.length} />
                </div>

                {/* Gender Breakdown */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Gender Breakdown</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span>Male (Mr.)</span>
                                    <Badge variant="primary">{maleCount}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Female (Ms.)</span>
                                    <Badge variant="success">{femaleCount}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Other</span>
                                    <Badge variant="neutral">{otherCount}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Date-wise Count</h2>
                            <div className="space-y-3">
                                {Object.entries(dateBreakdown).length > 0 ? (
                                    Object.entries(dateBreakdown)
                                        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                                        .map(([date, count]) => (
                                            <div key={date} className="flex justify-between items-center">
                                                <span>{new Date(date).toLocaleDateString("en-IN", {
                                                    day: "numeric", month: "short", year: "numeric"
                                                })}</span>
                                                <Badge variant="primary">{count}</Badge>
                                            </div>
                                        ))
                                ) : (
                                    <p className="text-gray-500">No date preferences recorded</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Members List */}
                <Card>
                    <CardContent className="p-6">
                        <h2 className="text-lg font-semibold mb-4">
                            Accommodation Requests ({needsAccommodation.length})
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2 px-3">Name</th>
                                        <th className="text-left py-2 px-3">Gender</th>
                                        <th className="text-left py-2 px-3">College</th>
                                        <th className="text-left py-2 px-3">Type</th>
                                        <th className="text-left py-2 px-3">Dates</th>
                                        <th className="text-left py-2 px-3">Room</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {needsAccommodation.map((member) => (
                                        <tr key={member._id.toString()} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="py-2 px-3 font-medium">{member.name}</td>
                                            <td className="py-2 px-3">{member.prefix}</td>
                                            <td className="py-2 px-3">{member.college}</td>
                                            <td className="py-2 px-3">
                                                <Badge variant={member.accommodation?.type === "suite" ? "success" : "primary"}>
                                                    {member.accommodation?.type || "N/A"}
                                                </Badge>
                                            </td>
                                            <td className="py-2 px-3">
                                                {member.accommodation?.dates?.join(", ") || "N/A"}
                                            </td>
                                            <td className="py-2 px-3">
                                                {member.accommodation?.roomAssignment || "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Export Button */}
                <div className="mt-6">
                    <a
                        href={`/api/export/${eventId}/accommodation`}
                        className="btn-primary"
                        download
                    >
                        Export to Excel
                    </a>
                </div>
            </div>
        </div>
    );
}

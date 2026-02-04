import { requireSuperAdmin } from "@/lib/auth-utils";
import { getTeamStats, getAllTeams } from "@/app/actions/team";
import { getBookingStats } from "@/app/actions/accommodation";
import { StatCard, Card, CardHeader, CardContent, Badge } from "@/components/ui";
import Link from "next/link";

export default async function SuperAdminDashboard() {
    await requireSuperAdmin();

    const teamStats = await getTeamStats();
    const bookingStats = await getBookingStats();
    const recentTeams = await getAllTeams();

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">Admin Dashboard</h1>
                    <p className="page-subtitle">Overview of IGNITE 2026 registrations and bookings</p>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <Link href="/admin/users" className="btn-primary">
                        Manage Admins
                    </Link>
                    <Link href="/admin/teams" className="btn-secondary">
                        View All Teams
                    </Link>
                    <Link href="/jury" className="btn-accent">
                        Jury Panel
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        label="Total Teams"
                        value={teamStats.totalTeams}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Total Members"
                        value={teamStats.totalMembers}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Accommodation Bookings"
                        value={bookingStats.totalBookings}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Total Guests"
                        value={bookingStats.totalMembers}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        }
                    />
                </div>

                {/* Additional Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="py-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                Room Distribution
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Dorm Bookings</span>
                                    <Badge variant="primary">{bookingStats.dormBookings}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Suite Bookings</span>
                                    <Badge variant="success">{bookingStats.suiteBookings}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="py-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                Food Preferences
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Vegetarian</span>
                                    <Badge variant="success">{bookingStats.vegCount}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Non-Vegetarian</span>
                                    <Badge variant="warning">{bookingStats.nonVegCount}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="py-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                Quick Links
                            </h3>
                            <div className="space-y-2">
                                <Link
                                    href="/admin/accommodation"
                                    className="block px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                                >
                                    Accommodation Admin →
                                </Link>
                                <Link
                                    href="/admin/food"
                                    className="block px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                                >
                                    Food Admin →
                                </Link>
                                <Link
                                    href="/admin/commute"
                                    className="block px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                                >
                                    Commute Admin →
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Teams */}
                <Card>
                    <CardHeader
                        title="Recent Team Registrations"
                        action={
                            <Link href="/admin/teams" className="text-sm text-primary-500 hover:text-primary-600">
                                View All →
                            </Link>
                        }
                    />
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Team Code</th>
                                    <th>Project Name</th>
                                    <th>Project Code</th>
                                    <th>Members</th>
                                    <th>Registered</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTeams.slice(0, 5).map((team) => (
                                    <tr key={team._id}>
                                        <td className="font-mono font-semibold text-primary-500">
                                            {team.teamCode}
                                        </td>
                                        <td>{team.projectName}</td>
                                        <td>{team.projectCode}</td>
                                        <td>
                                            <Badge variant="neutral">{team.memberCount} members</Badge>
                                        </td>
                                        <td className="text-gray-500">
                                            {new Date(team.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {recentTeams.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-500">
                                            No teams registered yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}

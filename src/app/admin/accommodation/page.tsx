import { requireRole } from "@/lib/auth-utils";
import { getBookingStats, getAllBookings } from "@/app/actions/accommodation";
import { StatCard, Card, CardHeader, Badge } from "@/components/ui";
import Link from "next/link";

export default async function AccommodationAdminDashboard() {
    await requireRole(["super_admin", "accommodation_admin"]);

    const stats = await getBookingStats();
    const bookings = await getAllBookings();

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">Accommodation Dashboard</h1>
                    <p className="page-subtitle">Manage accommodation bookings for IGNITE 2026</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        label="Total Bookings"
                        value={stats.totalBookings}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Total Guests"
                        value={stats.totalMembers}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Dorm Bookings"
                        value={stats.dormBookings}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Suite Bookings"
                        value={stats.suiteBookings}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        }
                    />
                </div>

                {/* Bookings Table */}
                <Card>
                    <CardHeader
                        title="All Bookings"
                        action={
                            <Link href="/admin" className="text-sm text-primary-500 hover:text-primary-600">
                                Back to Dashboard →
                            </Link>
                        }
                    />
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Team Code</th>
                                    <th>Check-in</th>
                                    <th>Check-out</th>
                                    <th>Room Type</th>
                                    <th>Guests</th>
                                    <th>Food</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking) => (
                                    <tr key={booking._id}>
                                        <td className="font-mono font-semibold text-primary-500">
                                            {booking.teamCode}
                                        </td>
                                        <td>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                                        <td>{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                                        <td>
                                            <Badge variant={booking.roomType === "suite" ? "success" : "neutral"}>
                                                {booking.roomType}
                                            </Badge>
                                        </td>
                                        <td>{booking.totalMembers}</td>
                                        <td>
                                            {booking.foodRequired ? (
                                                <Badge variant={booking.foodPreference === "veg" ? "success" : "warning"}>
                                                    {booking.foodPreference}
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td>
                                            <Badge
                                                variant={
                                                    booking.status === "confirmed"
                                                        ? "success"
                                                        : booking.status === "cancelled"
                                                            ? "danger"
                                                            : "warning"
                                                }
                                            >
                                                {booking.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                                {bookings.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-gray-500">
                                            No bookings found
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

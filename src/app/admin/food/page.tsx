import { requireRole } from "@/lib/auth-utils";
import { getCouponStats } from "@/app/actions/coupon";
import { getBookingStats } from "@/app/actions/accommodation";
import { StatCard, Card, CardHeader, CardContent, Badge } from "@/components/ui";
import Link from "next/link";

export default async function FoodAdminDashboard() {
    await requireRole(["super_admin", "food_admin"]);

    const couponStats = await getCouponStats();
    const bookingStats = await getBookingStats();

    const usagePercentage = couponStats.totalCoupons > 0
        ? Math.round((couponStats.usedCoupons / couponStats.totalCoupons) * 100)
        : 0;

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">Food Admin Dashboard</h1>
                    <p className="page-subtitle">Manage food, menu, and coupons for IGNITE 2026</p>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <Link href="/admin/food/coupons" className="btn-primary">
                        Verify Coupon
                    </Link>
                    <Link href="/admin/food/menu" className="btn-secondary">
                        Manage Menu
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        label="Total Coupons"
                        value={couponStats.totalCoupons}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Used Coupons"
                        value={couponStats.usedCoupons}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Pending"
                        value={couponStats.issuedCoupons}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Usage"
                        value={`${usagePercentage}%`}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        }
                    />
                </div>

                {/* Breakdown Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="py-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                Lunch Coupons
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Total</span>
                                    <Badge variant="neutral">{couponStats.lunchTotal}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Used</span>
                                    <Badge variant="success">{couponStats.lunchUsed}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Remaining</span>
                                    <Badge variant="warning">{couponStats.lunchTotal - couponStats.lunchUsed}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="py-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                Tea Coupons
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Total</span>
                                    <Badge variant="neutral">{couponStats.teaTotal}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Used</span>
                                    <Badge variant="success">{couponStats.teaUsed}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Remaining</span>
                                    <Badge variant="warning">{couponStats.teaTotal - couponStats.teaUsed}</Badge>
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
                </div>

                {/* Quick Links */}
                <Card>
                    <CardHeader title="Quick Actions" />
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Link
                                href="/admin/food/coupons"
                                className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
                            >
                                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Verify Coupon</h4>
                                <p className="text-sm text-gray-500 mt-1">Scan and verify coupons</p>
                            </Link>

                            <Link
                                href="/admin/food/menu"
                                className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
                            >
                                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Menu</h4>
                                <p className="text-sm text-gray-500 mt-1">Manage daily menu</p>
                            </Link>

                            <Link
                                href="/admin"
                                className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
                            >
                                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Main Dashboard</h4>
                                <p className="text-sm text-gray-500 mt-1">Back to overview</p>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

import { requireEventRole } from "@/lib/auth-utils";
import { getEvent } from "@/app/actions/event";
import { getTeamStats } from "@/app/actions/team";
import { getCouponStats, getEventCoupons } from "@/app/actions/coupon";
import { Card, CardHeader, CardContent, StatCard, Badge } from "@/components/ui";
import { notFound } from "next/navigation";
import Link from "next/link";
import FoodClient from "./FoodClient";

export const dynamic = "force-dynamic";

interface Props {
    params: { eventId: string };
}

export default async function FoodPage({ params }: Props) {
    await requireEventRole(params.eventId, ["food_committee"]);

    const event = await getEvent(params.eventId);
    if (!event) notFound();

    const teamStats = await getTeamStats(params.eventId);
    const couponStats = await getCouponStats(params.eventId);

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Food Committee Dashboard
                        </h1>
                        <p className="text-gray-500">{event.name}</p>
                    </div>
                    <Link href={`/admin/events/${params.eventId}`} className="btn-outline text-sm">
                        ← Back to Event
                    </Link>
                </div>

                {/* Food Preference Stats */}
                <Card className="mb-8">
                    <CardHeader title="Food Preferences Summary" />
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                <p className="text-4xl font-bold text-green-600">
                                    {teamStats.food.veg}
                                </p>
                                <p className="text-green-700 dark:text-green-300 mt-2">
                                    🥗 Vegetarian
                                </p>
                            </div>
                            <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                <p className="text-4xl font-bold text-red-600">
                                    {teamStats.food.nonVeg}
                                </p>
                                <p className="text-red-700 dark:text-red-300 mt-2">
                                    🍗 Non-Vegetarian
                                </p>
                            </div>
                            <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <p className="text-4xl font-bold text-blue-600">
                                    {teamStats.members.attending}
                                </p>
                                <p className="text-blue-700 dark:text-blue-300 mt-2">
                                    👥 Total Attending
                                </p>
                            </div>
                            <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                <p className="text-4xl font-bold text-purple-600">
                                    {teamStats.teams.approved}
                                </p>
                                <p className="text-purple-700 dark:text-purple-300 mt-2">
                                    ✓ Approved Teams
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Meal-wise Coupon Stats */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Lunch */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">🍽️</span>
                                    <div>
                                        <p className="font-semibold text-lg">Lunch</p>
                                        <p className="text-sm text-gray-500">
                                            {couponStats.lunch.used} / {couponStats.lunch.total} served
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold">
                                        {couponStats.lunch.total > 0
                                            ? ((couponStats.lunch.used / couponStats.lunch.total) * 100).toFixed(0)
                                            : 0}%
                                    </p>
                                </div>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
                                    style={{
                                        width: `${couponStats.lunch.total > 0
                                                ? (couponStats.lunch.used / couponStats.lunch.total) * 100
                                                : 0
                                            }%`,
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tea */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">☕</span>
                                    <div>
                                        <p className="font-semibold text-lg">Tea / Snacks</p>
                                        <p className="text-sm text-gray-500">
                                            {couponStats.tea.used} / {couponStats.tea.total} served
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold">
                                        {couponStats.tea.total > 0
                                            ? ((couponStats.tea.used / couponStats.tea.total) * 100).toFixed(0)
                                            : 0}%
                                    </p>
                                </div>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                                    style={{
                                        width: `${couponStats.tea.total > 0
                                                ? (couponStats.tea.used / couponStats.tea.total) * 100
                                                : 0
                                            }%`,
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Export Options */}
                <Card>
                    <CardHeader title="Export Reports" subtitle="Download data as Excel" />
                    <CardContent>
                        <FoodClient eventId={params.eventId} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

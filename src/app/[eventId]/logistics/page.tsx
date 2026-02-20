import { requireEventRole } from "@/lib/auth-utils";
import { getEvent } from "@/app/actions/event";
import { getCouponStats, getEventCoupons } from "@/app/actions/coupon";
import { Card, CardHeader, CardContent, StatCard, Badge } from "@/components/ui";
import { notFound } from "next/navigation";
import Link from "next/link";
import LogisticsClient from "./LogisticsClient";

export const dynamic = "force-dynamic";

interface Props {
    params: { eventId: string };
}

export default async function LogisticsPage({ params }: Props) {
    await requireEventRole(params.eventId, ["logistics_committee"]);

    const event = await getEvent(params.eventId);
    if (!event) notFound();

    const stats = await getCouponStats(params.eventId);
    const recentCoupons = await getEventCoupons(params.eventId, { isUsed: true });

    const totalCoupons = Object.values(stats).reduce((sum, s) => sum + s.total, 0);
    const usedCoupons = Object.values(stats).reduce((sum, s) => sum + s.used, 0);

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Logistics & QR Scanner
                        </h1>
                        <p className="text-gray-500">{event.name}</p>
                    </div>
                    <Link href={`/admin/events/${params.eventId}`} className="btn-outline text-sm">
                        ← Back to Event
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        label="Total Coupons"
                        value={totalCoupons}
                    />
                    <StatCard
                        label="Used"
                        value={usedCoupons}
                        className="border-green-500"
                    />
                    <StatCard
                        label="Remaining"
                        value={totalCoupons - usedCoupons}
                    />
                    <StatCard
                        label="Usage %"
                        value={totalCoupons > 0 ? `${((usedCoupons / totalCoupons) * 100).toFixed(0)}%` : "0%"}
                    />
                </div>

                {/* Type-wise Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {Object.entries(stats).map(([type, data]) => (
                        <Card key={type}>
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl mb-1">
                                    {type === "lunch" ? "🍽️" : type === "tea" ? "☕" : type === "dinner" ? "🌙" : "🎁"}
                                </p>
                                <p className="font-bold text-lg capitalize">{type}</p>
                                <p className="text-sm text-gray-500">
                                    {data.used} / {data.total}
                                </p>
                                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary-500"
                                        style={{
                                            width: `${data.total > 0 ? (data.used / data.total) * 100 : 0}%`,
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Scanner */}
                <Card className="mb-8">
                    <CardHeader title="📱 QR Scanner" subtitle="Select meal type, then scan coupon" />
                    <CardContent>
                        <LogisticsClient
                            eventId={params.eventId}
                            mealSlots={event.settings?.mealSlots ?? ["lunch", "tea"]}
                        />
                    </CardContent>
                </Card>


                {/* Recent Scans */}
                <Card>
                    <CardHeader title="Recent Scans" subtitle={`Last ${Math.min(recentCoupons.length, 20)} scans`} />
                    <CardContent>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {recentCoupons.slice(0, 20).map((c) => (
                                <div
                                    key={c._id}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">{c.memberName}</p>
                                        <p className="text-sm text-gray-500">{c.couponCode}</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="success">{c.type}</Badge>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {c.usedAt && new Date(c.usedAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {recentCoupons.length === 0 && (
                                <p className="text-center text-gray-500 py-8">No scans yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

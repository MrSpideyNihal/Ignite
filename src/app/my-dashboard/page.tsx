import { redirect } from "next/navigation";
import { getCurrentUser, getUserAllEventRoles } from "@/lib/auth-utils";
import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/models";
import Link from "next/link";
import { Card, CardContent, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

// Map role to the best dashboard page for that role
function getRoleDashboard(eventId: string, role: string): { path: string; label: string } {
    const map: Record<string, { path: string; label: string }> = {
        registration_committee: { path: `/${eventId}/teams`, label: "Teams" },
        logistics_committee: { path: `/${eventId}/logistics`, label: "QR Scanner" },
        food_committee: { path: `/${eventId}/food`, label: "Food" },
        jury_admin: { path: `/${eventId}/jury`, label: "Jury Admin" },
        jury_member: { path: `/${eventId}/jury/evaluate`, label: "Jury Evaluation" },
        commute_admin: { path: `/${eventId}/commute`, label: "Commute" },
    };
    return map[role] || { path: `/${eventId}/dashboard`, label: "Dashboard" };
}

function getRoleColor(role: string): "primary" | "success" | "warning" | "neutral" {
    const colors: Record<string, "primary" | "success" | "warning" | "neutral"> = {
        registration_committee: "primary",
        logistics_committee: "success",
        food_committee: "warning",
        jury_admin: "primary",
        jury_member: "neutral",
        commute_admin: "neutral",
    };
    return colors[role] || "neutral";
}

function formatRole(role: string): string {
    return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function MyDashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/auth/signin");
    }

    // Super admin goes straight to admin
    if (user.globalRole === "super_admin") {
        redirect("/admin");
    }

    // Get all event roles for this user
    const eventRoles = await getUserAllEventRoles();

    if (eventRoles.length === 0) {
        return (
            <div className="min-h-screen py-12">
                <div className="container-custom max-w-2xl">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            No Dashboards Assigned
                        </h1>
                        <p className="text-gray-500 mb-6">
                            You don&apos;t have any committee or jury roles assigned yet.
                            Contact the event admin to get access.
                        </p>
                        <Link href="/" className="btn-primary">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // If only one event role, redirect directly
    if (eventRoles.length === 1) {
        const { eventId, role } = eventRoles[0];
        const { path } = getRoleDashboard(eventId, role);
        redirect(path);
    }

    // Multiple roles — show a selection page
    await connectToDatabase();
    const eventIds = Array.from(new Set(eventRoles.map((r) => r.eventId)));
    const events = await Event.find({ _id: { $in: eventIds } }).lean();
    const eventMap = new Map(events.map((e) => [e._id.toString(), e]));

    // Group roles by event
    const grouped = eventRoles.reduce((acc, { eventId, role }) => {
        if (!acc[eventId]) acc[eventId] = [];
        acc[eventId].push(role);
        return acc;
    }, {} as Record<string, string[]>);

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom max-w-3xl">
                <div className="page-header text-center">
                    <h1 className="page-title">My Dashboards</h1>
                    <p className="page-subtitle">
                        Welcome, {user.name}! Select a dashboard to continue.
                    </p>
                </div>

                <div className="space-y-6">
                    {Object.entries(grouped).map(([eventId, roles]) => {
                        const event = eventMap.get(eventId);
                        return (
                            <Card key={eventId}>
                                <CardContent className="p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        {event?.name || "Event"}
                                    </h2>
                                    {event?.date && (
                                        <p className="text-sm text-gray-500 mb-4">
                                            {new Date(event.date).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-3">
                                        {roles.map((role) => {
                                            const { path, label } = getRoleDashboard(eventId, role);
                                            return (
                                                <Link
                                                    key={role}
                                                    href={path}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl transition-all hover:border-primary-300 dark:hover:border-primary-600 group"
                                                >
                                                    <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                                                        {label}
                                                    </span>
                                                    <Badge variant={getRoleColor(role)}>
                                                        {formatRole(role)}
                                                    </Badge>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

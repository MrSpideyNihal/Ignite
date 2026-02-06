import { requireSuperAdmin } from "@/lib/auth-utils";
import { getAllUsers } from "@/app/actions/user";
import { Card, CardContent, Badge } from "@/components/ui";
import Link from "next/link";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
    await requireSuperAdmin();
    const users = await getAllUsers();

    const superAdmins = users.filter((u) => u.globalRole === "super_admin");
    const regularUsers = users.filter((u) => u.globalRole === "user");

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="page-header">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                            ← Back
                        </Link>
                        <div>
                            <h1 className="page-title">Global Users</h1>
                            <p className="page-subtitle">
                                Manage all users across events
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-ignite-600">{users.length}</p>
                            <p className="text-sm text-gray-500">Total Users</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-red-600">{superAdmins.length}</p>
                            <p className="text-sm text-gray-500">Super Admins</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-blue-600">{regularUsers.length}</p>
                            <p className="text-sm text-gray-500">Regular Users</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-green-600">
                                {users.filter((u) => u.eventRoles.length > 0).length}
                            </p>
                            <p className="text-sm text-gray-500">With Event Roles</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Users Client Component */}
                <UsersClient initialUsers={users} />
            </div>
        </div>
    );
}

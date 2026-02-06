"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, Badge, Button, Input } from "@/components/ui";
import { updateUserGlobalRole, deleteUser, createUser } from "@/app/actions/user";
import { useRouter } from "next/navigation";

interface EventRole {
    eventName: string;
    eventYear: number;
    role: string;
}

interface UserData {
    _id: string;
    email: string;
    name: string;
    image?: string;
    globalRole: "super_admin" | "user";
    createdAt: string;
    eventRoles: EventRole[];
}

interface UsersClientProps {
    initialUsers: UserData[];
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
    const [users, setUsers] = useState(initialUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const filteredUsers = users.filter(
        (u) =>
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRoleChange = (userId: string, newRole: "super_admin" | "user") => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            return;
        }

        startTransition(async () => {
            const result = await updateUserGlobalRole(userId, newRole);
            if (result.success) {
                setUsers((prev) =>
                    prev.map((u) =>
                        u._id === userId ? { ...u, globalRole: newRole } : u
                    )
                );
            } else {
                alert(result.message);
            }
        });
    };

    const handleDelete = (userId: string, email: string) => {
        if (!confirm(`Are you sure you want to delete ${email}? This will also remove all their event roles.`)) {
            return;
        }

        startTransition(async () => {
            const result = await deleteUser(userId);
            if (result.success) {
                setUsers((prev) => prev.filter((u) => u._id !== userId));
            } else {
                alert(result.message);
            }
        });
    };

    return (
        <div>
            {/* Search and Add */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input
                    type="text"
                    placeholder="Search by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                />
                <Button onClick={() => setShowAddModal(true)}>
                    + Add User
                </Button>
            </div>

            {/* Users List */}
            <div className="space-y-4">
                {filteredUsers.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No users found</p>
                ) : (
                    filteredUsers.map((user) => (
                        <UserCard
                            key={user._id}
                            user={user}
                            onRoleChange={handleRoleChange}
                            onDelete={handleDelete}
                            isPending={isPending}
                        />
                    ))
                )}
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <AddUserModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}

function UserCard({
    user,
    onRoleChange,
    onDelete,
    isPending,
}: {
    user: UserData;
    onRoleChange: (userId: string, role: "super_admin" | "user") => void;
    onDelete: (userId: string, email: string) => void;
    isPending: boolean;
}) {
    const roleDisplayNames: Record<string, string> = {
        registration: "Registration",
        jury_admin: "Jury Admin",
        jury_member: "Jury Member",
        logistics: "Logistics",
        food: "Food",
        volunteer: "Volunteer",
        guest: "Guest",
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3 flex-1">
                        {user.image ? (
                            <img
                                src={user.image}
                                alt={user.name}
                                className="w-10 h-10 rounded-full"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                {user.name}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                    </div>

                    {/* Global Role Badge */}
                    <div>
                        <Badge
                            variant={user.globalRole === "super_admin" ? "danger" : "neutral"}
                        >
                            {user.globalRole === "super_admin" ? "Super Admin" : "User"}
                        </Badge>
                    </div>

                    {/* Event Roles */}
                    {user.eventRoles.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {user.eventRoles.map((role, idx) => (
                                <span key={idx} className="text-xs">
                                    <Badge variant="primary">
                                        {role.eventYear}: {roleDisplayNames[role.role] || role.role}
                                    </Badge>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                        {user.globalRole === "user" ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onRoleChange(user._id, "super_admin")}
                                disabled={isPending}
                            >
                                Make Admin
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onRoleChange(user._id, "user")}
                                disabled={isPending}
                            >
                                Remove Admin
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(user._id, user.email)}
                            disabled={isPending}
                            className="text-red-600 hover:bg-red-50"
                        >
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Created Date */}
                <p className="text-xs text-gray-400 mt-2">
                    Joined: {new Date(user.createdAt).toLocaleDateString("en-IN")}
                </p>
            </CardContent>
        </Card>
    );
}

function AddUserModal({
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [globalRole, setGlobalRole] = useState<"super_admin" | "user">("user");
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !name) {
            setError("Email and name are required");
            return;
        }

        startTransition(async () => {
            const result = await createUser(email, name, globalRole);
            if (result.success) {
                onSuccess();
            } else {
                setError(result.message);
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    Add New User
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Full Name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Role</label>
                        <select
                            value={globalRole}
                            onChange={(e) => setGlobalRole(e.target.value as "super_admin" | "user")}
                            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"
                        >
                            <option value="user">Regular User</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>

                    {error && (
                        <p className="text-red-600 text-sm">{error}</p>
                    )}

                    <div className="flex gap-3 justify-end">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Creating..." : "Create User"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

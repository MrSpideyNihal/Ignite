"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addOrUpdateUserRole, AdminActionState, removeUserRole } from "@/app/actions/admin";
import { Input, Select, Button } from "@/components/forms";
import { Card, CardHeader, CardContent, Alert, Badge, Modal } from "@/components/ui";
import toast from "react-hot-toast";

const roleOptions = [
    { value: "super_admin", label: "Super Admin" },
    { value: "accommodation_admin", label: "Accommodation Admin" },
    { value: "food_admin", label: "Food Admin" },
    { value: "commute_admin", label: "Commute Admin" },
    { value: "venue_admin", label: "Venue Admin" },
    { value: "guest", label: "Guest (View Only)" },
    { value: "jury_admin", label: "Jury Admin" },
    { value: "jury_member", label: "Jury Member" },
];

interface User {
    _id: string;
    email: string;
    name: string;
    role: string;
    createdAt: Date;
}

interface AdminUsersClientProps {
    initialUsers: User[];
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" loading={pending}>
            Add/Update User
        </Button>
    );
}

export default function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
    const [users, setUsers] = useState(initialUsers);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const initialState: AdminActionState = { success: false, message: "" };
    const [state, formAction] = useFormState(addOrUpdateUserRole, initialState);

    const handleRemoveRole = async () => {
        if (!selectedUser) return;

        const result = await removeUserRole(selectedUser._id);
        if (result.success) {
            toast.success("Role removed successfully");
            setUsers(users.map(u =>
                u._id === selectedUser._id ? { ...u, role: "guest" } : u
            ));
        } else {
            toast.error(result.message);
        }
        setShowModal(false);
        setSelectedUser(null);
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case "super_admin":
                return "danger";
            case "jury_admin":
                return "warning";
            case "jury_member":
                return "primary";
            default:
                return "neutral";
        }
    };

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">Manage Admin Users</h1>
                    <p className="page-subtitle">Add or update user roles for the system</p>
                </div>

                {/* Add User Form */}
                <Card className="mb-8">
                    <CardHeader title="Add/Update User Role" subtitle="Enter Gmail to assign a role" />
                    <CardContent>
                        {state.message && (
                            <Alert type={state.success ? "success" : "error"} className="mb-4">
                                {state.message}
                            </Alert>
                        )}
                        <form action={formAction} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="user@gmail.com"
                                    label="Gmail Address"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <Select
                                    name="role"
                                    options={roleOptions}
                                    label="Role"
                                    placeholder="Select role"
                                    required
                                />
                            </div>
                            <div className="flex items-end">
                                <SubmitButton />
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Users List */}
                <Card>
                    <CardHeader title="Admin Users" subtitle="Users with special access" />
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Added</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td className="font-medium">{user.name}</td>
                                        <td className="text-gray-500">{user.email}</td>
                                        <td>
                                            <Badge variant={getRoleBadgeVariant(user.role)}>
                                                {user.role.replace("_", " ")}
                                            </Badge>
                                        </td>
                                        <td className="text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowModal(true);
                                                }}
                                                disabled={user.role === "guest"}
                                            >
                                                Remove Role
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-500">
                                            No admin users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Confirmation Modal */}
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title="Confirm Remove Role"
                >
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Are you sure you want to remove the role from{" "}
                        <strong>{selectedUser?.name}</strong>? They will be set to Guest.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button variant="ghost" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleRemoveRole}>
                            Remove Role
                        </Button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

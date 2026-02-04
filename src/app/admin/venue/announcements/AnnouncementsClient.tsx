"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createAnnouncement, AdminActionState, deleteAnnouncement } from "@/app/actions/admin";
import { Input, Select, Textarea, Button } from "@/components/forms";
import { Card, CardHeader, CardContent, Alert, Badge, Modal } from "@/components/ui";
import toast from "react-hot-toast";

interface Announcement {
    _id: string;
    title: string;
    content: string;
    category: string;
    priority: string;
    createdByName: string;
    createdAt: Date;
}

interface AnnouncementsClientProps {
    initialAnnouncements: Announcement[];
}

const categoryOptions = [
    { value: "general", label: "General" },
    { value: "accommodation", label: "Accommodation" },
    { value: "food", label: "Food" },
    { value: "commute", label: "Commute" },
    { value: "venue", label: "Venue" },
    { value: "jury", label: "Jury" },
];

const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
];

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" loading={pending} className="w-full">
            Create Announcement
        </Button>
    );
}

export default function AnnouncementsClient({ initialAnnouncements }: AnnouncementsClientProps) {
    const [announcements, setAnnouncements] = useState(initialAnnouncements);
    const [showForm, setShowForm] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const initialState: AdminActionState = { success: false, message: "" };
    const [state, formAction] = useFormState(createAnnouncement, initialState);

    const handleDelete = async () => {
        if (!deleteId) return;

        const result = await deleteAnnouncement(deleteId);
        if (result.success) {
            toast.success("Announcement deleted");
            setAnnouncements(announcements.filter((a) => a._id !== deleteId));
        } else {
            toast.error(result.message);
        }
        setDeleteId(null);
    };

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">Announcements</h1>
                    <p className="page-subtitle">Create and manage announcements</p>
                </div>

                {/* Toggle Form */}
                <div className="mb-8">
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Hide Form" : "+ New Announcement"}
                    </Button>
                </div>

                {/* Create Form */}
                {showForm && (
                    <Card className="mb-8">
                        <CardHeader title="Create Announcement" />
                        <CardContent>
                            {state.message && (
                                <Alert type={state.success ? "success" : "error"} className="mb-4">
                                    {state.message}
                                </Alert>
                            )}
                            <form action={formAction} className="space-y-4">
                                <Input name="title" label="Title" placeholder="Announcement title" required />
                                <Textarea
                                    name="content"
                                    label="Content"
                                    placeholder="Announcement content..."
                                    required
                                />
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Select
                                        name="category"
                                        label="Category"
                                        options={categoryOptions}
                                        defaultValue="general"
                                        required
                                    />
                                    <Select
                                        name="priority"
                                        label="Priority"
                                        options={priorityOptions}
                                        defaultValue="medium"
                                        required
                                    />
                                </div>
                                <SubmitButton />
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Announcements List */}
                <Card>
                    <CardHeader title="All Announcements" />
                    <CardContent>
                        {announcements.length > 0 ? (
                            <div className="space-y-4">
                                {announcements.map((announcement) => (
                                    <div
                                        key={announcement._id}
                                        className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {announcement.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {announcement.content}
                                                </p>
                                                <div className="flex items-center gap-3 mt-3">
                                                    <Badge variant="primary">{announcement.category}</Badge>
                                                    <Badge
                                                        variant={
                                                            announcement.priority === "high"
                                                                ? "danger"
                                                                : announcement.priority === "medium"
                                                                    ? "warning"
                                                                    : "neutral"
                                                        }
                                                    >
                                                        {announcement.priority}
                                                    </Badge>
                                                    <span className="text-xs text-gray-500">
                                                        By {announcement.createdByName} •{" "}
                                                        {new Date(announcement.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeleteId(announcement._id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">No announcements yet</p>
                        )}
                    </CardContent>
                </Card>

                {/* Delete Modal */}
                <Modal
                    isOpen={!!deleteId}
                    onClose={() => setDeleteId(null)}
                    title="Delete Announcement"
                >
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Are you sure you want to delete this announcement?
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button variant="ghost" onClick={() => setDeleteId(null)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

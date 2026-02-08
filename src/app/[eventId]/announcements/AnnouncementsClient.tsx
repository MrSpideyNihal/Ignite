"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, Badge, EmptyState, Button, Input } from "@/components/ui";
import { createAnnouncement, deleteAnnouncement } from "@/app/actions/announcement";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Announcement {
    _id: string;
    title: string;
    content: string;
    category: string;
    priority: string;
    createdAt: Date;
}

interface AnnouncementsClientProps {
    eventId: string;
    initialAnnouncements: Announcement[];
}

export default function AnnouncementsClient({
    eventId,
    initialAnnouncements
}: AnnouncementsClientProps) {
    const [filter, setFilter] = useState<string>("all");
    const [showAddModal, setShowAddModal] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const categories = ["all", "general", "accommodation", "food", "transport", "venue", "jury"];

    const priorityColors: Record<string, "danger" | "warning" | "neutral"> = {
        high: "danger",
        medium: "warning",
        low: "neutral",
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this announcement?")) return;
        startTransition(async () => {
            const result = await deleteAnnouncement(eventId, id);
            if (result.success) {
                toast.success("Deleted");
                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    };

    const filteredAnnouncements = filter === "all"
        ? initialAnnouncements
        : initialAnnouncements.filter((a) => a.category === filter);

    return (
        <div>
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === cat
                                ? "bg-ignite-600 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                <Button onClick={() => setShowAddModal(true)} size="sm">
                    + New Announcement
                </Button>
            </div>

            {/* Announcements List */}
            {filteredAnnouncements.length === 0 ? (
                <EmptyState
                    icon={<span className="text-4xl">📢</span>}
                    title="No Announcements Found"
                    description={initialAnnouncements.length === 0 ? "Be the first to post an update!" : "Try a different filter."}
                />
            ) : (
                <div className="space-y-4">
                    {filteredAnnouncements.map((announcement) => (
                        <Card key={announcement._id}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {announcement.title}
                                            </h3>
                                            <Badge variant={priorityColors[announcement.priority] || "neutral"}>
                                                {announcement.priority}
                                            </Badge>
                                            <Badge variant="primary">{announcement.category}</Badge>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                            {announcement.content}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(announcement._id)}
                                        disabled={isPending}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        🗑️
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-400 mt-4">
                                    Posted: {new Date(announcement.createdAt).toLocaleString("en-IN")}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <AddAnnouncementModal
                    eventId={eventId}
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

function AddAnnouncementModal({
    eventId,
    onClose,
    onSuccess,
}: {
    eventId: string;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("general");
    const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await createAnnouncement(eventId, {
                title,
                content,
                category,
                priority,
            });
            if (result.success) {
                toast.success("Posted");
                onSuccess();
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    New Announcement
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="Important Update"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            rows={3}
                            className="input w-full"
                            placeholder="Details about the announcement..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="input text-sm w-full"
                            >
                                <option value="general">General</option>
                                <option value="accommodation">Accommodation</option>
                                <option value="food">Food</option>
                                <option value="transport">Transport</option>
                                <option value="venue">Venue</option>
                                <option value="jury">Jury</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as any)}
                                className="input text-sm w-full"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Posting..." : "Post Announcement"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

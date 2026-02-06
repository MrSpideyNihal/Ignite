"use client";

import { useState } from "react";
import { Card, CardContent, Badge, EmptyState } from "@/components/ui";

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

    const categories = ["all", "general", "food", "transport", "venue", "jury"];

    const priorityColors: Record<string, "danger" | "warning" | "neutral"> = {
        high: "danger",
        medium: "warning",
        low: "neutral",
    };

    const filteredAnnouncements = filter === "all"
        ? initialAnnouncements
        : initialAnnouncements.filter((a) => a.category === filter);

    if (initialAnnouncements.length === 0) {
        return (
            <EmptyState
                icon={<span className="text-4xl">📢</span>}
                title="No Announcements Yet"
                description="Check back later for event updates and important information."
            />
        );
    }

    return (
        <div>
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === cat
                                ? "bg-ignite-600 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
                {filteredAnnouncements.map((announcement) => (
                    <Card key={announcement._id}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
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
                            </div>
                            <p className="text-xs text-gray-400 mt-4">
                                Posted: {new Date(announcement.createdAt).toLocaleString("en-IN")}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

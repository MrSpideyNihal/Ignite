"use client";

import { useState } from "react";
import { Button } from "@/components/forms";
import toast from "react-hot-toast";

interface Props {
    eventId: string;
}

export default function FoodClient({ eventId }: Props) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleExport = async (type: string) => {
        setLoading(type);
        try {
            const response = await fetch(`/api/export/${eventId}/${type}`);
            if (!response.ok) throw new Error("Export failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${type}-export-${new Date().toISOString().split("T")[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast.success(`${type} exported successfully`);
        } catch {
            toast.error("Failed to export");
        }
        setLoading(null);
    };

    return (
        <div className="grid md:grid-cols-3 gap-4">
            <Button
                onClick={() => handleExport("teams")}
                loading={loading === "teams"}
                variant="outline"
                className="flex-col h-auto py-4"
            >
                <span className="text-2xl mb-2">📋</span>
                <span>Team List</span>
                <span className="text-xs text-gray-500">All teams & members</span>
            </Button>

            <Button
                onClick={() => handleExport("food")}
                loading={loading === "food"}
                variant="outline"
                className="flex-col h-auto py-4"
            >
                <span className="text-2xl mb-2">🍽️</span>
                <span>Food Report</span>
                <span className="text-xs text-gray-500">Preferences by member</span>
            </Button>

            <Button
                onClick={() => handleExport("coupons")}
                loading={loading === "coupons"}
                variant="outline"
                className="flex-col h-auto py-4"
            >
                <span className="text-2xl mb-2">🎫</span>
                <span>Coupon Report</span>
                <span className="text-xs text-gray-500">All coupon usage</span>
            </Button>

            <Button
                onClick={() => handleExport("accommodation")}
                loading={loading === "accommodation"}
                variant="outline"
                className="flex-col h-auto py-4"
            >
                <span className="text-2xl mb-2">🏨</span>
                <span>Accommodation</span>
                <span className="text-xs text-gray-500">Room requirements</span>
            </Button>

            <Button
                onClick={() => handleExport("evaluations")}
                loading={loading === "evaluations"}
                variant="outline"
                className="flex-col h-auto py-4"
            >
                <span className="text-2xl mb-2">⚖️</span>
                <span>Evaluations</span>
                <span className="text-xs text-gray-500">Jury scores</span>
            </Button>

            <Button
                onClick={() => handleExport("attendance")}
                loading={loading === "attendance"}
                variant="outline"
                className="flex-col h-auto py-4"
            >
                <span className="text-2xl mb-2">✓</span>
                <span>Attendance</span>
                <span className="text-xs text-gray-500">Meal attendance</span>
            </Button>
        </div>
    );
}

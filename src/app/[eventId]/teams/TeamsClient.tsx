"use client";

import { useState, useTransition } from "react";
import { approveTeam, rejectTeam } from "@/app/actions/team";
import { Card, CardContent, Badge, Modal } from "@/components/ui";
import { Button, Textarea } from "@/components/forms";
import toast from "react-hot-toast";

interface TeamInfo {
    _id: string;
    teamCode: string;
    projectName: string;
    projectCode: string;
    status: string;
    teamLead: { name: string; phone: string };
    memberCount: number;
}

interface Props {
    eventId: string;
    teams: TeamInfo[];
}

export default function TeamsClient({ eventId, teams }: Props) {
    const [isPending, startTransition] = useTransition();
    const [filter, setFilter] = useState<string>("all");
    const [rejectModal, setRejectModal] = useState<{ teamId: string; teamCode: string } | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    const filteredTeams =
        filter === "all" ? teams : teams.filter((t) => t.status === filter);

    const handleApprove = async (teamId: string) => {
        startTransition(async () => {
            const result = await approveTeam(eventId, teamId);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleReject = async () => {
        if (!rejectModal) return;
        startTransition(async () => {
            const result = await rejectTeam(eventId, rejectModal.teamId, rejectReason);
            if (result.success) {
                toast.success(result.message);
                setRejectModal(null);
                setRejectReason("");
            } else {
                toast.error(result.message);
            }
        });
    };

    const statusColors = {
        pending: "warning",
        approved: "success",
        rejected: "danger",
    };

    return (
        <>
            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {["all", "pending", "approved", "rejected"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                ? "bg-primary-500 text-white"
                                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        {status === "pending" && teams.filter((t) => t.status === "pending").length > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                {teams.filter((t) => t.status === "pending").length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Teams Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeams.map((team) => (
                    <Card key={team._id}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-gray-100">
                                        {team.teamCode}
                                    </p>
                                    <p className="text-sm text-gray-500">{team.projectCode}</p>
                                </div>
                                <Badge variant={statusColors[team.status as keyof typeof statusColors] as "warning" | "success" | "danger"}>
                                    {team.status}
                                </Badge>
                            </div>

                            <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2 line-clamp-1">
                                {team.projectName}
                            </h3>

                            <div className="text-sm text-gray-500 space-y-1 mb-4">
                                <p>👤 {team.teamLead.name}</p>
                                <p>📱 {team.teamLead.phone}</p>
                                <p>👥 {team.memberCount} members</p>
                            </div>

                            {team.status === "pending" && (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => handleApprove(team._id)}
                                        loading={isPending}
                                        className="flex-1"
                                    >
                                        ✓ Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setRejectModal({ teamId: team._id, teamCode: team.teamCode })}
                                        className="flex-1"
                                    >
                                        ✕ Reject
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredTeams.length === 0 && (
                <p className="text-center text-gray-500 py-12">
                    No teams found for this filter.
                </p>
            )}

            {/* Reject Modal */}
            <Modal
                isOpen={!!rejectModal}
                onClose={() => setRejectModal(null)}
                title={`Reject Team ${rejectModal?.teamCode}`}
            >
                <div className="space-y-4">
                    <Textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Reason for rejection (optional)"
                        rows={3}
                    />
                    <div className="flex gap-2">
                        <Button onClick={handleReject} loading={isPending} variant="primary">
                            Confirm Reject
                        </Button>
                        <Button onClick={() => setRejectModal(null)} variant="outline">
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

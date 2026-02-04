"use client";

import { useState, useTransition } from "react";
import { updateTeamMember } from "@/app/actions/team";
import { Badge } from "@/components/ui";
import { Button, Select } from "@/components/forms";
import toast from "react-hot-toast";

interface Member {
    _id: string;
    prefix: string;
    name: string;
    college: string;
    branch: string;
    yearOfPassing: number;
    isAttending: boolean;
    accommodation?: { required: boolean; type?: string };
    foodPreference: string;
}

interface Props {
    teamCode: string;
    members: Member[];
    isApproved: boolean;
}

export default function TeamPortalClient({ teamCode, members, isApproved }: Props) {
    const [isPending, startTransition] = useTransition();

    const handleToggleAttending = async (memberId: string, isAttending: boolean) => {
        startTransition(async () => {
            const result = await updateTeamMember(teamCode, memberId, { isAttending });
            if (result.success) {
                toast.success("Updated");
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleUpdateFood = async (memberId: string, foodPreference: "veg" | "non-veg") => {
        startTransition(async () => {
            const result = await updateTeamMember(teamCode, memberId, { foodPreference });
            if (result.success) {
                toast.success("Food preference updated");
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleUpdateAccommodation = async (
        memberId: string,
        required: boolean,
        type?: "dorm" | "suite"
    ) => {
        startTransition(async () => {
            const result = await updateTeamMember(teamCode, memberId, {
                accommodation: { required, type },
            });
            if (result.success) {
                toast.success("Accommodation updated");
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <div className="space-y-4">
            {members.map((member, index) => (
                <div
                    key={member._id}
                    className={`p-4 rounded-lg border ${member.isAttending
                            ? "bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                            : "bg-gray-100 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 opacity-60"
                        }`}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Badge variant={member.isAttending ? "success" : "neutral"}>
                                #{index + 1}
                            </Badge>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {member.prefix} {member.name}
                            </h4>
                        </div>

                        {!isApproved && (
                            <button
                                onClick={() => handleToggleAttending(member._id, !member.isAttending)}
                                disabled={isPending}
                                className={`text-sm px-3 py-1 rounded ${member.isAttending
                                        ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"
                                        : "bg-green-100 dark:bg-green-900/30 text-green-700"
                                    }`}
                            >
                                {member.isAttending ? "Mark Not Attending" : "Mark Attending"}
                            </button>
                        )}
                    </div>

                    <div className="text-sm text-gray-500 grid md:grid-cols-3 gap-2">
                        <p>🎓 {member.college}</p>
                        <p>📚 {member.branch}</p>
                        <p>📅 Passing: {member.yearOfPassing}</p>
                    </div>

                    {member.isAttending && !isApproved && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Food Preference */}
                                <div>
                                    <label className="text-sm text-gray-500 block mb-1">
                                        Food Preference
                                    </label>
                                    <select
                                        value={member.foodPreference}
                                        onChange={(e) =>
                                            handleUpdateFood(member._id, e.target.value as "veg" | "non-veg")
                                        }
                                        disabled={isPending}
                                        className="input text-sm"
                                    >
                                        <option value="veg">🥗 Vegetarian</option>
                                        <option value="non-veg">🍗 Non-Vegetarian</option>
                                    </select>
                                </div>

                                {/* Accommodation */}
                                <div>
                                    <label className="text-sm text-gray-500 block mb-1">
                                        Accommodation
                                    </label>
                                    <select
                                        value={
                                            !member.accommodation?.required
                                                ? "none"
                                                : member.accommodation.type || "dorm"
                                        }
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === "none") {
                                                handleUpdateAccommodation(member._id, false);
                                            } else {
                                                handleUpdateAccommodation(member._id, true, val as "dorm" | "suite");
                                            }
                                        }}
                                        disabled={isPending}
                                        className="input text-sm"
                                    >
                                        <option value="none">Not Required</option>
                                        <option value="dorm">🛏️ Dormitory</option>
                                        <option value="suite">🏨 Suite</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Show food badge for approved */}
                    {member.isAttending && isApproved && (
                        <div className="mt-3 flex gap-2">
                            <Badge variant={member.foodPreference === "veg" ? "success" : "danger"}>
                                {member.foodPreference === "veg" ? "🥗 Veg" : "🍗 Non-Veg"}
                            </Badge>
                            {member.accommodation?.required && (
                                <Badge variant="primary">
                                    🏨 {member.accommodation.type === "suite" ? "Suite" : "Dorm"}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

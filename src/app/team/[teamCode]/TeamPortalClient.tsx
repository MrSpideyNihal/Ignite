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
    accommodation?: { required: boolean; type?: string; dates?: string[] };
}

interface Props {
    teamCode: string;
    members: Member[];
    isApproved: boolean;
    eventDate: string;
}

export default function TeamPortalClient({ teamCode, members, isApproved, eventDate }: Props) {
    const [isPending, startTransition] = useTransition();

    // Generate available dates (Event date - 1, Event date, Event date + 1)
    const availableDates = [
        new Date(new Date(eventDate).setDate(new Date(eventDate).getDate() - 1)),
        new Date(eventDate),
        new Date(new Date(eventDate).setDate(new Date(eventDate).getDate() + 1)),
    ].map(d => d.toISOString().split('T')[0]);

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

    const handleUpdateAccommodation = async (
        memberId: string,
        required: boolean,
        type?: "dorm" | "suite",
        dates?: string[]
    ) => {
        startTransition(async () => {
            const result = await updateTeamMember(teamCode, memberId, {
                accommodation: { required, type, dates },
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
            {/* PDF Download button */}
            <div className="flex justify-end">
                <a
                    href={`/team/${teamCode}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    🎟️ Download Food Coupons PDF
                </a>
            </div>
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

                    {member.isAttending && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            {/* Accommodation */}
                            <div className="space-y-3">
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">
                                            Accommodation Type
                                        </label>
                                        <select
                                            value={
                                                !member.accommodation?.required
                                                    ? "none"
                                                    : member.accommodation.type || "dorm"
                                            }
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const currentDates = member.accommodation?.dates || [];
                                                if (val === "none") {
                                                    handleUpdateAccommodation(member._id, false, undefined, []);
                                                } else {
                                                    handleUpdateAccommodation(member._id, true, val as "dorm" | "suite", currentDates);
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

                                    {/* Dates Selection - Only show if accommodation is required */}
                                    {member.accommodation?.required && (
                                        <div>
                                            <label className="text-sm text-gray-500 block mb-1">
                                                Select Dates
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {availableDates.map((date) => {
                                                    const isSelected = member.accommodation?.dates?.includes(date);
                                                    return (
                                                        <button
                                                            key={date}
                                                            onClick={() => {
                                                                const currentDates = member.accommodation?.dates || [];
                                                                const newDates = isSelected
                                                                    ? currentDates.filter(d => d !== date)
                                                                    : [...currentDates, date];

                                                                handleUpdateAccommodation(
                                                                    member._id,
                                                                    true,
                                                                    member.accommodation?.type as "dorm" | "suite",
                                                                    newDates
                                                                );
                                                            }}
                                                            disabled={isPending}
                                                            className={`text-xs px-2 py-1 rounded border ${isSelected
                                                                ? "bg-primary-100 border-primary-500 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                                                                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                                                                }`}
                                                        >
                                                            {new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                        </div>
                    )}


                </div>
            ))}
        </div>
    );
}

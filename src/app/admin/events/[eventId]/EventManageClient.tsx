"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateEventStatus, updateEventSettings, addEventRole, removeEventRole, deleteEvent } from "@/app/actions/event";
import { Input, Select, Button } from "@/components/forms";
import { Badge } from "@/components/ui";
import toast from "react-hot-toast";
import { EventRoleType } from "@/types";

const MEAL_SLOT_OPTIONS = [
    { id: "breakfast", label: "🌅 Breakfast" },
    { id: "lunch", label: "🍱 Lunch" },
    { id: "tea", label: "☕ Tea / Snacks" },
    { id: "dinner", label: "🍛 Dinner" },
];

interface EventInfo {
    _id: string;
    name: string;
    status: string;
    settings: {
        registrationOpen: boolean;
        evaluationOpen: boolean;
        maxTeamSize: number;
        mealSlots?: string[];
        allowJuryEdit?: boolean;
    };
}

interface RoleInfo {
    _id: string;
    userEmail: string;
    userName: string;
    role: EventRoleType;
}

interface Props {
    event: EventInfo;
    roles?: RoleInfo[];
    showRoles?: boolean;
}

const roleOptions = [
    { value: "jury_admin", label: "Jury Admin" },
    { value: "jury_member", label: "Jury Member" },
    { value: "registration_committee", label: "Registration Committee" },
    { value: "food_committee", label: "Food Committee" },
    { value: "logistics_committee", label: "Logistics Committee" },
];

export default function EventManageClient({ event, roles = [], showRoles }: Props) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [newEmail, setNewEmail] = useState("");
    const [newRole, setNewRole] = useState<EventRoleType>("jury_member");
    const [mealSlots, setMealSlots] = useState<string[]>(event.settings.mealSlots ?? ["lunch", "tea"]);

    const handleStatusChange = async (status: "draft" | "active" | "archived") => {
        startTransition(async () => {
            const result = await updateEventStatus(event._id, status);
            if (result.success) toast.success(result.message);
            else toast.error(result.message);
        });
    };

    const handleSettingToggle = async (key: "registrationOpen" | "evaluationOpen", value: boolean) => {
        startTransition(async () => {
            const result = await updateEventSettings(event._id, { [key]: value });
            if (result.success) toast.success(result.message);
            else toast.error(result.message);
        });
    };

    const handleMealSlotToggle = (slotId: string, checked: boolean) => {
        const updated = checked
            ? [...mealSlots, slotId]
            : mealSlots.filter((s) => s !== slotId);
        setMealSlots(updated);
        startTransition(async () => {
            const result = await updateEventSettings(event._id, { mealSlots: updated });
            if (result.success) toast.success("Meal slots updated");
            else toast.error(result.message);
        });
    };

    const handleJuryEditToggle = async (value: boolean) => {
        startTransition(async () => {
            const result = await updateEventSettings(event._id, { allowJuryEdit: value });
            if (result.success) toast.success(value ? "Jury can now edit submitted scores" : "Jury edit locked");
            else toast.error(result.message);
        });
    };

    const handleAddRole = async () => {
        if (!newEmail) return;
        startTransition(async () => {
            const result = await addEventRole(event._id, newEmail, newRole);
            if (result.success) {
                toast.success(result.message);
                setNewEmail("");
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleRemoveRole = async (roleId: string) => {
        if (!confirm("Remove this role?")) return;
        startTransition(async () => {
            const result = await removeEventRole(roleId);
            if (result.success) toast.success(result.message);
            else toast.error(result.message);
        });
    };

    if (showRoles) {
        return (
            <div className="space-y-6">
                <div className="flex gap-2">
                    <Input
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="email@gmail.com"
                        className="flex-1"
                    />
                    <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as EventRoleType)}
                        className="input max-w-[180px]"
                    >
                        {roleOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <Button onClick={handleAddRole} loading={isPending} size="sm">
                        Add
                    </Button>
                </div>

                <div className="space-y-2">
                    {roles.map((role) => (
                        <div
                            key={role._id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                        >
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{role.userName}</p>
                                <p className="text-sm text-gray-500">{role.userEmail}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="primary">{role.role.replace(/_/g, " ")}</Badge>
                                <button
                                    onClick={() => handleRemoveRole(role._id)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    disabled={isPending}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                    {roles.length === 0 && (
                        <p className="text-center text-gray-500 py-4">No committee members assigned</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Status */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Status
                </label>
                <div className="flex gap-2">
                    {(["draft", "active", "archived"] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            disabled={isPending || event.status === status}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${event.status === status
                                ? "bg-primary-500 text-white"
                                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Registration / Evaluation Toggles */}
            <div className="space-y-3">
                <ToggleSwitch
                    label="Registration Open"
                    checked={event.settings.registrationOpen}
                    onChange={(v) => handleSettingToggle("registrationOpen", v)}
                    disabled={isPending}
                />
                <ToggleSwitch
                    label="Evaluation Open"
                    checked={event.settings.evaluationOpen}
                    onChange={(v) => handleSettingToggle("evaluationOpen", v)}
                    disabled={isPending}
                />
                <ToggleSwitch
                    label="Allow Jury to Edit Submitted Scores"
                    checked={event.settings.allowJuryEdit ?? false}
                    onChange={handleJuryEditToggle}
                    disabled={isPending}
                />
            </div>

            {/* Meal Slots */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    🍽️ Food / Meal Slots
                    <span className="text-xs text-gray-400 ml-2 font-normal">Select meals to generate coupons for</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {MEAL_SLOT_OPTIONS.map((slot) => {
                        const isChecked = mealSlots.includes(slot.id);
                        return (
                            <label
                                key={slot.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${isChecked
                                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={isPending}
                                    onChange={(e) => handleMealSlotToggle(slot.id, e.target.checked)}
                                    className="w-4 h-4 accent-primary-500"
                                />
                                <span className="text-sm font-medium">{slot.label}</span>
                            </label>
                        );
                    })}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    Coupons will be generated for each selected meal per team member.
                </p>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 mt-6 border-t border-red-200 dark:border-red-900">
                <label className="block text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                    Danger Zone
                </label>
                <button
                    onClick={() => {
                        const first = confirm(`Are you sure you want to delete "${event.name}"? This will delete ALL teams, members, coupons, evaluations, and roles.`);
                        if (!first) return;
                        const second = confirm("This action is IRREVERSIBLE. Confirm?");
                        if (!second) return;
                        startTransition(async () => {
                            const result = await deleteEvent(event._id);
                            if (result.success) {
                                toast.success(result.message);
                                router.push("/admin");
                            } else {
                                toast.error(result.message);
                            }
                        });
                    }}
                    disabled={isPending}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                    🗑️ Delete Event
                </button>
                <p className="text-xs text-red-400 mt-1">Permanently deletes this event and all associated data.</p>
            </div>
        </div>
    );
}

function ToggleSwitch({
    label,
    checked,
    onChange,
    disabled,
}: {
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg cursor-pointer">
            <span className="text-gray-700 dark:text-gray-300 text-sm">{label}</span>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                disabled={disabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-primary-500" : "bg-gray-300 dark:bg-gray-600"}`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
                />
            </button>
        </label>
    );
}

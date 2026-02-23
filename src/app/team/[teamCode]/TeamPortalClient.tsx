"use client";

import { useState, useTransition, useCallback } from "react";
import { updateTeamMember, updateTeamDetails } from "@/app/actions/team";
import { Badge } from "@/components/ui";
import toast from "react-hot-toast";

/* ──────────────────── Types ──────────────────── */

interface Member {
    _id: string;
    prefix: string;
    name: string;
    college: string;
    branch: string;
    yearOfPassing: number;
    phone?: string;
    email?: string;
    isAttending: boolean;
    accommodation?: { required: boolean; type?: string; dates?: string[] };
}

interface EventProject {
    projectName: string;
    projectCode: string;
}

interface TeamLead {
    name: string;
    email?: string;
    phone: string;
}

interface Guide {
    name?: string;
    email?: string;
    phone?: string;
}

interface EditableMember {
    _id?: string;
    prefix: "Mr" | "Ms" | "Dr" | "NA";
    name: string;
    college: string;
    branch: string;
    yearOfPassing: number;
    phone: string;
    email: string;
}

interface Props {
    teamCode: string;
    members: Member[];
    isApproved: boolean;
    isPending: boolean;
    eventDate: string;
    // For editing (only passed when pending)
    projectName?: string;
    projectCode?: string;
    teamLead?: TeamLead;
    guide?: Guide;
    eventProjects?: EventProject[];
    maxTeamSize?: number;
}

/* ──────────────────── Component ──────────────────── */

export default function TeamPortalClient({
    teamCode,
    members,
    isApproved,
    isPending: statusPending,
    eventDate,
    projectName = "",
    projectCode = "",
    teamLead,
    guide,
    eventProjects = [],
    maxTeamSize = 8,
}: Props) {
    const [isTransitioning, startTransition] = useTransition();

    // ══════════ Edit mode state ══════════
    const [editing, setEditing] = useState(false);
    const [editProjectName, setEditProjectName] = useState(projectName);
    const [editProjectCode, setEditProjectCode] = useState(projectCode);
    const [editTeamLead, setEditTeamLead] = useState<TeamLead>({
        name: teamLead?.name || "",
        email: teamLead?.email || "",
        phone: teamLead?.phone || "",
    });
    const [editGuide, setEditGuide] = useState<Guide>({
        name: guide?.name || "",
        email: guide?.email || "",
        phone: guide?.phone || "",
    });
    const [editMembers, setEditMembers] = useState<EditableMember[]>(
        members.map((m) => ({
            _id: m._id,
            prefix: m.prefix as EditableMember["prefix"],
            name: m.name,
            college: m.college,
            branch: m.branch,
            yearOfPassing: m.yearOfPassing,
            phone: m.phone || "",
            email: m.email || "",
        }))
    );

    // Reset form to original data
    const resetForm = useCallback(() => {
        setEditProjectName(projectName);
        setEditProjectCode(projectCode);
        setEditTeamLead({
            name: teamLead?.name || "",
            email: teamLead?.email || "",
            phone: teamLead?.phone || "",
        });
        setEditGuide({
            name: guide?.name || "",
            email: guide?.email || "",
            phone: guide?.phone || "",
        });
        setEditMembers(
            members.map((m) => ({
                _id: m._id,
                prefix: m.prefix as EditableMember["prefix"],
                name: m.name,
                college: m.college,
                branch: m.branch,
                yearOfPassing: m.yearOfPassing,
                phone: m.phone || "",
                email: m.email || "",
            }))
        );
    }, [projectName, projectCode, teamLead, guide, members]);

    // Handle project selection from dropdown
    const handleProjectSelect = (value: string) => {
        const project = eventProjects.find(
            (p) => `${p.projectCode}|||${p.projectName}` === value
        );
        if (project) {
            setEditProjectName(project.projectName);
            setEditProjectCode(project.projectCode);
        }
    };

    // Add/remove members
    const addMember = () => {
        if (editMembers.length >= maxTeamSize) {
            toast.error(`Maximum ${maxTeamSize} members allowed`);
            return;
        }
        setEditMembers((prev) => [
            ...prev,
            {
                prefix: "Mr",
                name: "",
                college: prev[prev.length - 1]?.college || "",
                branch: "",
                yearOfPassing: new Date().getFullYear() + 1,
                phone: "",
                email: "",
            },
        ]);
    };

    const removeMember = (index: number) => {
        if (editMembers.length <= 1) {
            toast.error("Team must have at least one member");
            return;
        }
        setEditMembers((prev) => prev.filter((_, i) => i !== index));
    };

    const updateMemberField = (
        index: number,
        field: keyof EditableMember,
        value: string | number
    ) => {
        setEditMembers((prev) =>
            prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
        );
    };

    // ══════════ Save all edits ══════════
    const handleSave = () => {
        if (!editProjectName.trim()) {
            toast.error("Project name is required");
            return;
        }
        if (!editProjectCode.trim()) {
            toast.error("Project code is required");
            return;
        }
        if (!editTeamLead.name.trim() || editTeamLead.name.trim().length < 2) {
            toast.error("Team lead name must be at least 2 characters");
            return;
        }
        if (!editTeamLead.phone.trim() || editTeamLead.phone.trim().length < 10) {
            toast.error("Team lead phone must be at least 10 digits");
            return;
        }
        for (let i = 0; i < editMembers.length; i++) {
            const m = editMembers[i];
            if (!m.name.trim() || m.name.trim().length < 2) {
                toast.error(`Member ${i + 1}: Name must be at least 2 characters`);
                return;
            }
            if (!m.college.trim() || m.college.trim().length < 2) {
                toast.error(`Member ${i + 1}: College is required`);
                return;
            }
            if (!m.branch.trim()) {
                toast.error(`Member ${i + 1}: Branch is required`);
                return;
            }
        }

        startTransition(async () => {
            const result = await updateTeamDetails(teamCode, {
                projectName: editProjectName.trim(),
                projectCode: editProjectCode.trim(),
                teamLead: {
                    name: editTeamLead.name.trim(),
                    email: editTeamLead.email?.trim() || undefined,
                    phone: editTeamLead.phone.trim(),
                },
                guide: editGuide.name?.trim()
                    ? {
                          name: editGuide.name.trim(),
                          email: editGuide.email?.trim() || undefined,
                          phone: editGuide.phone?.trim() || undefined,
                      }
                    : null,
                members: editMembers.map((m) => ({
                    _id: m._id,
                    prefix: m.prefix,
                    name: m.name.trim(),
                    college: m.college.trim(),
                    branch: m.branch.trim(),
                    yearOfPassing: Number(m.yearOfPassing),
                    phone: m.phone?.trim() || undefined,
                    email: m.email?.trim() || undefined,
                })),
            });

            if (result.success) {
                toast.success(result.message);
                setEditing(false);
            } else {
                toast.error(result.message);
            }
        });
    };

    // ══════════ Accommodation / Attendance handlers ══════════
    const handleToggleAttending = async (memberId: string, attending: boolean) => {
        startTransition(async () => {
            const result = await updateTeamMember(teamCode, memberId, { isAttending: attending });
            if (result.success) toast.success("Updated");
            else toast.error(result.message);
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
            if (result.success) toast.success("Accommodation updated");
            else toast.error(result.message);
        });
    };

    // Generate available dates
    const availableDates = [
        new Date(new Date(eventDate).setDate(new Date(eventDate).getDate() - 1)),
        new Date(eventDate),
        new Date(new Date(eventDate).setDate(new Date(eventDate).getDate() + 1)),
    ].map((d) => d.toISOString().split("T")[0]);

    const hasProjects = eventProjects.length > 0;
    const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
    const smallInputClass = "w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

    /* ════════════════════════════════════════════
       EDIT MODE
    ════════════════════════════════════════════ */
    if (editing && statusPending) {
        return (
            <div className="space-y-6">
                {/* Header with Save/Cancel */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        ✏️ Edit Team Details
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { resetForm(); setEditing(false); }}
                            disabled={isTransitioning}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isTransitioning}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors"
                        >
                            {isTransitioning ? "Saving..." : "💾 Save Changes"}
                        </button>
                    </div>
                </div>

                {/* Project Details */}
                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">📋 Project Details</h4>
                    {hasProjects ? (
                        <div>
                            <label className="text-sm text-gray-500 block mb-1">Select Project</label>
                            <select
                                value={
                                    eventProjects.some(
                                        (p) => p.projectCode === editProjectCode && p.projectName === editProjectName
                                    )
                                        ? `${editProjectCode}|||${editProjectName}`
                                        : ""
                                }
                                onChange={(e) => handleProjectSelect(e.target.value)}
                                className={inputClass}
                            >
                                <option value="" disabled>-- Select a project --</option>
                                {eventProjects.map((p) => (
                                    <option key={p.projectCode} value={`${p.projectCode}|||${p.projectName}`}>
                                        {p.projectCode} — {p.projectName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm text-gray-500 block mb-1">Project Name *</label>
                                <input type="text" value={editProjectName} onChange={(e) => setEditProjectName(e.target.value)} className={inputClass} placeholder="e.g., Smart Traffic System" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 block mb-1">Project Code *</label>
                                <input type="text" value={editProjectCode} onChange={(e) => setEditProjectCode(e.target.value)} className={inputClass} placeholder="e.g., AI-01" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Team Lead */}
                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">👤 Team Lead</h4>
                    <div className="grid md:grid-cols-3 gap-3">
                        <div>
                            <label className="text-sm text-gray-500 block mb-1">Name *</label>
                            <input type="text" value={editTeamLead.name} onChange={(e) => setEditTeamLead((prev) => ({ ...prev, name: e.target.value }))} className={inputClass} />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 block mb-1">Phone *</label>
                            <input type="tel" value={editTeamLead.phone} onChange={(e) => setEditTeamLead((prev) => ({ ...prev, phone: e.target.value }))} className={inputClass} />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 block mb-1">Email</label>
                            <input type="email" value={editTeamLead.email || ""} onChange={(e) => setEditTeamLead((prev) => ({ ...prev, email: e.target.value }))} className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* Guide / Mentor */}
                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        🎓 Guide / Mentor <span className="text-xs font-normal text-gray-400">(optional — leave blank to remove)</span>
                    </h4>
                    <div className="grid md:grid-cols-3 gap-3">
                        <div>
                            <label className="text-sm text-gray-500 block mb-1">Name</label>
                            <input type="text" value={editGuide.name || ""} onChange={(e) => setEditGuide((prev) => ({ ...prev, name: e.target.value }))} className={inputClass} placeholder="Guide name" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 block mb-1">Phone</label>
                            <input type="tel" value={editGuide.phone || ""} onChange={(e) => setEditGuide((prev) => ({ ...prev, phone: e.target.value }))} className={inputClass} />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 block mb-1">Email</label>
                            <input type="email" value={editGuide.email || ""} onChange={(e) => setEditGuide((prev) => ({ ...prev, email: e.target.value }))} className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* Members */}
                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            👥 Team Members ({editMembers.length}/{maxTeamSize})
                        </h4>
                        {editMembers.length < maxTeamSize && (
                            <button onClick={addMember} type="button" className="text-sm px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 rounded-lg transition-colors">
                                + Add Member
                            </button>
                        )}
                    </div>

                    {editMembers.map((member, index) => (
                        <div key={member._id || `new-${index}`} className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Member #{index + 1}
                                    {!member._id && <span className="ml-2 text-xs text-green-600 dark:text-green-400">(new)</span>}
                                </span>
                                {editMembers.length > 1 && (
                                    <button onClick={() => removeMember(index)} type="button" className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                                        ✕ Remove
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Prefix *</label>
                                    <select value={member.prefix} onChange={(e) => updateMemberField(index, "prefix", e.target.value)} className={smallInputClass}>
                                        <option value="Mr">Mr</option>
                                        <option value="Ms">Ms</option>
                                        <option value="Dr">Dr</option>
                                        <option value="NA">N/A</option>
                                    </select>
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="text-xs text-gray-500 block mb-1">Name *</label>
                                    <input type="text" value={member.name} onChange={(e) => updateMemberField(index, "name", e.target.value)} className={smallInputClass} placeholder="Full name" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">College *</label>
                                    <input type="text" value={member.college} onChange={(e) => updateMemberField(index, "college", e.target.value)} className={smallInputClass} placeholder="College name" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Branch *</label>
                                    <input type="text" value={member.branch} onChange={(e) => updateMemberField(index, "branch", e.target.value)} className={smallInputClass} placeholder="e.g., CSE" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Year of Passing *</label>
                                    <input type="number" value={member.yearOfPassing} onChange={(e) => updateMemberField(index, "yearOfPassing", parseInt(e.target.value) || 0)} className={smallInputClass} min={2020} max={2035} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Phone</label>
                                    <input type="tel" value={member.phone} onChange={(e) => updateMemberField(index, "phone", e.target.value)} className={smallInputClass} placeholder="Optional" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Email</label>
                                    <input type="email" value={member.email} onChange={(e) => updateMemberField(index, "email", e.target.value)} className={smallInputClass} placeholder="Optional" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Save/Cancel */}
                <div className="flex justify-end gap-2 pt-2">
                    <button
                        onClick={() => { resetForm(); setEditing(false); }}
                        disabled={isTransitioning}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isTransitioning}
                        className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors"
                    >
                        {isTransitioning ? "Saving..." : "💾 Save All Changes"}
                    </button>
                </div>
            </div>
        );
    }

    /* ════════════════════════════════════════════
       VIEW MODE (default)
    ════════════════════════════════════════════ */
    return (
        <div className="space-y-4">
            {/* Action buttons row */}
            <div className="flex flex-wrap gap-2 justify-end">
                {statusPending && (
                    <button
                        onClick={() => setEditing(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        ✏️ Edit Team Details
                    </button>
                )}
                <a
                    href={`/team/${teamCode}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    🎟️ Download Food Coupons PDF
                </a>
            </div>

            {/* Lock notice when approved */}
            {isApproved && (
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
                    🔒 Team details are locked after approval. Contact the organizers if you need changes.
                </div>
            )}
            {/* Members list (read-only) */}
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
                                disabled={isTransitioning}
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
                                            disabled={isTransitioning}
                                            className="input text-sm"
                                        >
                                            <option value="none">Not Required</option>
                                            <option value="dorm">🛏️ Dormitory</option>
                                            <option value="suite">🏨 Suite</option>
                                        </select>
                                    </div>

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
                                                            disabled={isTransitioning}
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

"use client";

import { useState, useTransition, useRef } from "react";
import { approveTeam, rejectTeam } from "@/app/actions/team";
import { importTeams, ImportRow } from "@/app/actions/import";
import { Card, CardContent, CardHeader, Badge, Modal, Alert } from "@/components/ui";
import { Button, Textarea } from "@/components/forms";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

interface TeamInfo {
    _id: string;
    teamCode: string;
    projectName: string;
    projectCode: string;
    status: string;
    teamLead: { name: string; phone: string };
    memberCount: number;
}

interface ParsedTeam {
    projectName: string;
    projectCode: string;
    teamLeadName: string;
    teamLeadPhone: string;
    teamLeadEmail: string;
    guideName: string;
    guidePhone: string;
    guideEmail: string;
    members: Array<{
        prefix: string;
        name: string;
        college: string;
        branch: string;
        yearOfPassing: number;
        phone: string;
        email: string;
        foodPreference: string;
    }>;
}

function parseExcelRows(rows: Record<string, string>[]): ParsedTeam[] {
    const teamMap = new Map<string, ParsedTeam>();

    for (const row of rows) {
        const r: Record<string, string> = {};
        for (const [key, val] of Object.entries(row)) {
            r[key.trim().toLowerCase().replace(/\s+/g, "_")] = String(val || "").trim();
        }

        const projectCode = r.project_code || r.projectcode || r.code || "";
        const projectName = r.project_name || r.projectname || r.project || "";

        if (!projectCode && !projectName) continue;

        const key = projectCode || projectName;

        if (!teamMap.has(key)) {
            teamMap.set(key, {
                projectName: projectName || projectCode,
                projectCode: projectCode || projectName,
                teamLeadName: r.team_lead_name || r.teamlead || r.lead_name || "",
                teamLeadPhone: r.team_lead_phone || r.lead_phone || "",
                teamLeadEmail: r.team_lead_email || r.lead_email || "",
                guideName: r.guide_name || r.guide || r.mentor || "",
                guidePhone: r.guide_phone || r.mentor_phone || "",
                guideEmail: r.guide_email || r.mentor_email || "",
                members: [],
            });
        }

        const team = teamMap.get(key)!;
        const memberName = r.member_name || r.name || r.member || "";
        if (memberName) {
            team.members.push({
                prefix: r.prefix || r.title || "Mr",
                name: memberName,
                college: r.college || r.institution || "",
                branch: r.branch || r.department || r.dept || "",
                yearOfPassing: parseInt(r.year_of_passing || r.year || r.yop || "") || new Date().getFullYear(),
                phone: r.phone || r.mobile || r.member_phone || "",
                email: r.email || r.member_email || "",
                foodPreference: (r.food_preference || r.food || r.diet || "veg").toLowerCase().includes("non") ? "non-veg" : "veg",
            });
        }
    }

    return Array.from(teamMap.values());
}

interface Props {
    eventId: string;
    teams: TeamInfo[];
    maxTeamSize: number;
}

export default function TeamsClient({ eventId, teams, maxTeamSize }: Props) {
    const [isPending, startTransition] = useTransition();
    const [filter, setFilter] = useState<string>("all");
    const [rejectModal, setRejectModal] = useState<{ teamId: string; teamCode: string } | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    // Import state
    const [showImport, setShowImport] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const [parsedTeams, setParsedTeams] = useState<ParsedTeam[]>([]);
    const [fileName, setFileName] = useState("");
    const [parseError, setParseError] = useState("");
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<{
        success: boolean;
        message: string;
        errors?: string[];
    } | null>(null);

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

    // Excel import handlers
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setParseError("");
        setImportResult(null);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target!.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

                if (rows.length === 0) {
                    setParseError("No data found in the file");
                    return;
                }

                const parsed = parseExcelRows(rows);
                if (parsed.length === 0) {
                    setParseError("Could not parse any teams. Make sure columns include: project_name, project_code, name, college, branch");
                    return;
                }

                setParsedTeams(parsed);
            } catch (err) {
                setParseError("Failed to parse file. Make sure it's a valid .xlsx or .csv file.");
                console.error(err);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleImport = async () => {
        setImporting(true);
        setImportResult(null);

        try {
            const importRows: ImportRow[] = parsedTeams.map((t) => ({
                projectName: t.projectName,
                projectCode: t.projectCode,
                teamLeadName: t.teamLeadName || t.members[0]?.name || "Team Lead",
                teamLeadPhone: t.teamLeadPhone || t.members[0]?.phone || "0000000000",
                teamLeadEmail: t.teamLeadEmail,
                guideName: t.guideName,
                guidePhone: t.guidePhone,
                guideEmail: t.guideEmail,
                members: t.members,
            }));

            const res = await importTeams(eventId, importRows);
            setImportResult(res);

            if (res.success) {
                setParsedTeams([]);
                if (fileRef.current) fileRef.current.value = "";
                toast.success(res.message);
            } else {
                toast.error(res.message);
            }
        } catch {
            setImportResult({ success: false, message: "Import failed" });
        } finally {
            setImporting(false);
        }
    };

    const statusColors = {
        pending: "warning",
        approved: "success",
        rejected: "danger",
    };

    return (
        <>
            {/* Top Actions Bar */}
            <div className="flex items-center justify-between mb-6">
                {/* Filters */}
                <div className="flex gap-2">
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

                {/* Import Button */}
                <button
                    onClick={() => setShowImport(!showImport)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${showImport
                            ? "bg-primary-500 text-white shadow-lg"
                            : "bg-green-50 text-green-700 border border-green-300 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900/40"
                        }`}
                >
                    📥 {showImport ? "Hide Import" : "Import from Excel"}
                </button>
            </div>

            {/* Excel Import Section (Collapsible) */}
            {showImport && (
                <div className="mb-8 space-y-4 p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-2 border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-green-800 dark:text-green-300 flex items-center gap-2">
                            📥 Bulk Import Teams from Excel
                        </h3>
                        <button
                            onClick={() => setShowImport(false)}
                            className="text-gray-400 hover:text-gray-600 text-xl"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Excel Format Guide */}
                    <Card>
                        <CardHeader title="Excel Format Guide" />
                        <CardContent>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Upload an <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">.xlsx</code> or <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">.csv</code> file. Each row = one member.
                                Rows with the same <strong>project_code</strong> are grouped into one team.
                            </p>
                            <div className="overflow-x-auto">
                                <table className="text-xs border border-gray-200 dark:border-gray-700 w-full">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-800">
                                            {[
                                                "project_name",
                                                "project_code",
                                                "team_lead_name",
                                                "team_lead_phone",
                                                "name",
                                                "college",
                                                "branch",
                                                "year_of_passing",
                                                "phone",
                                                "food_preference",
                                            ].map((col) => (
                                                <th
                                                    key={col}
                                                    className="px-2 py-1 border border-gray-200 dark:border-gray-700 text-left font-medium"
                                                >
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="text-gray-500">
                                            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700">Smart Bin</td>
                                            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700">IOT-01</td>
                                            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700">Rahul</td>
                                            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700">9876543210</td>
                                            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700">Rahul Sharma</td>
                                            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700">IIT Delhi</td>
                                            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700">CSE</td>
                                            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700">2026</td>
                                            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700">9876543210</td>
                                            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700">veg</td>
                                        </tr>
                                        <tr className="text-gray-400">
                                            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700">Smart Bin</td>
                                            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700">IOT-01</td>
                                            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700"></td>
                                            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700"></td>
                                            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700">Priya Patel</td>
                                            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700">IIT Delhi</td>
                                            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700">ECE</td>
                                            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700">2027</td>
                                            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700">9123456789</td>
                                            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700">non-veg</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                Same project_code = same team. Team lead info only in first row.
                            </p>
                        </CardContent>
                    </Card>

                    {/* File Upload */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900/20 dark:file:text-green-400"
                                />
                            </div>
                            {fileName && (
                                <p className="text-sm text-gray-500 mt-2">📄 {fileName}</p>
                            )}
                            {parseError && <Alert type="error">{parseError}</Alert>}
                        </CardContent>
                    </Card>

                    {/* Preview */}
                    {parsedTeams.length > 0 && (
                        <Card>
                            <CardHeader
                                title={`Preview — ${parsedTeams.length} team${parsedTeams.length > 1 ? "s" : ""}`}
                                action={
                                    <Button
                                        onClick={handleImport}
                                        loading={importing}
                                        size="sm"
                                    >
                                        ✓ Import All ({parsedTeams.length} teams)
                                    </Button>
                                }
                            />
                            <CardContent>
                                <div className="space-y-4">
                                    {parsedTeams.map((team, i) => (
                                        <div
                                            key={i}
                                            className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <Badge variant="primary">
                                                    {team.projectCode}
                                                </Badge>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {team.projectName}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    ({team.members.length} member{team.members.length > 1 ? "s" : ""})
                                                </span>
                                                {team.members.length > maxTeamSize && (
                                                    <Badge variant="warning">
                                                        Exceeds max ({maxTeamSize})
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                <span>Lead: {team.teamLeadName || team.members[0]?.name || "—"}</span>
                                                {team.teamLeadPhone && (
                                                    <span className="ml-3">📞 {team.teamLeadPhone}</span>
                                                )}
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {team.members.map((m, mi) => (
                                                    <span
                                                        key={mi}
                                                        className="text-xs px-2 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-600 dark:text-gray-300"
                                                    >
                                                        {m.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Import Result */}
                    {importResult && (
                        <Alert type={importResult.success ? "success" : "error"}>
                            {importResult.message}
                            {importResult.errors && importResult.errors.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {importResult.errors.map((err, i) => (
                                        <p key={i} className="text-xs">• {err}</p>
                                    ))}
                                </div>
                            )}
                        </Alert>
                    )}
                </div>
            )}

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

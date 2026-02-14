"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { importTeams, ImportRow } from "@/app/actions/import";
import { Card, CardHeader, CardContent, Alert, Badge } from "@/components/ui";
import { Button } from "@/components/forms";

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
        // Normalize column names (case-insensitive, trim whitespace)
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

export default function ImportClient({
    eventId,
    maxTeamSize,
}: {
    eventId: string;
    maxTeamSize: number;
}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [teams, setTeams] = useState<ParsedTeam[]>([]);
    const [fileName, setFileName] = useState("");
    const [parseError, setParseError] = useState("");
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        errors?: string[];
    } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setParseError("");
        setResult(null);

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
                    setParseError("Could not parse any teams. Make sure columns include: project_name, project_code, member_name, college, branch");
                    return;
                }

                setTeams(parsed);
            } catch (err) {
                setParseError("Failed to parse file. Make sure it's a valid .xlsx or .csv file.");
                console.error(err);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleImport = async () => {
        setImporting(true);
        setResult(null);

        try {
            const importRows: ImportRow[] = teams.map((t) => ({
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
            setResult(res);

            if (res.success) {
                setTeams([]);
                if (fileRef.current) fileRef.current.value = "";
            }
        } catch {
            setResult({ success: false, message: "Import failed" });
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Template Info */}
            <Card>
                <CardHeader title="Excel Format" />
                <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Upload an <code>.xlsx</code> or <code>.csv</code> file. Each row is one team member.
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
                        Rows with the same project_code are grouped as one team. Team lead only needs to be filled in the first row.
                    </p>
                </CardContent>
            </Card>

            {/* Uploader */}
            <Card>
                <CardHeader title="Upload File" />
                <CardContent>
                    <div className="flex items-center gap-4">
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/20 dark:file:text-primary-400"
                        />
                    </div>
                    {fileName && (
                        <p className="text-sm text-gray-500 mt-2">📄 {fileName}</p>
                    )}
                    {parseError && <Alert type="error">{parseError}</Alert>}
                </CardContent>
            </Card>

            {/* Preview */}
            {teams.length > 0 && (
                <Card>
                    <CardHeader
                        title={`Preview — ${teams.length} team${teams.length > 1 ? "s" : ""}`}
                        action={
                            <Button
                                onClick={handleImport}
                                loading={importing}
                                size="sm"
                            >
                                Import All ({teams.length} teams)
                            </Button>
                        }
                    />
                    <CardContent>
                        <div className="space-y-4">
                            {teams.map((team, i) => (
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

            {/* Result */}
            {result && (
                <Card>
                    <CardContent className="p-6">
                        <Alert type={result.success ? "success" : "error"}>
                            {result.message}
                        </Alert>
                        {result.errors && result.errors.length > 0 && (
                            <div className="mt-4 space-y-1">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Errors:
                                </p>
                                {result.errors.map((err, i) => (
                                    <p key={i} className="text-xs text-red-600 dark:text-red-400">
                                        • {err}
                                    </p>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

import { getFullJuryBreakdown } from "@/app/actions/jury";
import * as XLSX from "xlsx";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { EventRole } from "@/models";

export async function GET(
    request: Request,
    { params }: { params: { eventId: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }

        await connectToDatabase();

        // Check jury_admin role
        const role = await EventRole.findOne({
            eventId: params.eventId,
            userEmail: session.user.email,
            role: "jury_admin",
        });
        if (!role) {
            return new Response(JSON.stringify({ error: "Forbidden: jury_admin required" }), { status: 403, headers: { "Content-Type": "application/json" } });
        }

        const { questions, teams } = await getFullJuryBreakdown(params.eventId);


        const wb = XLSX.utils.book_new();

        // ------ Sheet 1: Full Breakdown (matches the image) ------
        const headerRow1: (string | number)[] = ["Team", "Jury Member"];
        const headerRow2: (string | number)[] = ["", ""];

        for (const q of questions) {
            headerRow1.push(q.question);
            headerRow2.push(`${q.weightage}%`);
        }
        headerRow1.push("Weighted Total");
        headerRow2.push("");

        const rows: (string | number)[][] = [headerRow1, headerRow2];

        for (const team of teams) {
            for (const juryRow of team.juryRows) {
                const row: (string | number)[] = [team.teamCode, juryRow.juryName];
                for (const q of questions) {
                    row.push(juryRow.scores[q._id] ?? "");
                }
                row.push(juryRow.total);
                rows.push(row);
            }

            // Weighted scores row per jury
            for (const juryRow of team.juryRows) {
                const row: (string | number)[] = ["", `${juryRow.juryName} (weighted)`];
                for (const q of questions) {
                    row.push(juryRow.weightedScores[q._id] ?? "");
                }
                row.push(juryRow.total);
                rows.push(row);
            }

            // Average row
            const avgRow: (string | number)[] = [team.projectName, "⭐ Average"];
            for (const q of questions) {
                const avgScore = team.juryRows.length > 0
                    ? Math.round(team.juryRows.reduce((s, r) => s + (r.scores[q._id] ?? 0), 0) / team.juryRows.length * 100) / 100
                    : "";
                avgRow.push(avgScore);
            }
            avgRow.push(team.avgWeightedScore);
            rows.push(avgRow);
            rows.push(["", ""]); // spacing
        }

        const ws1 = XLSX.utils.aoa_to_sheet(rows);

        // Column widths
        ws1["!cols"] = [
            { wch: 14 }, { wch: 20 },
            ...questions.map(() => ({ wch: 14 })),
            { wch: 14 },
        ];

        XLSX.utils.book_append_sheet(wb, ws1, "Full Breakdown");

        // ------ Sheet 2: Scoreboard ------
        const scoreboardRows: (string | number)[][] = [
            ["Rank", "Team Code", "Project Name", "Avg Weighted Score", "# Evaluations"],
        ];
        teams.forEach((t, i) => {
            scoreboardRows.push([i + 1, t.teamCode, t.projectName, t.avgWeightedScore, t.juryRows.length]);
        });

        const ws2 = XLSX.utils.aoa_to_sheet(scoreboardRows);
        ws2["!cols"] = [{ wch: 6 }, { wch: 14 }, { wch: 30 }, { wch: 20 }, { wch: 14 }];
        XLSX.utils.book_append_sheet(wb, ws2, "Scoreboard");

        const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        return new Response(buf, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="jury-scores-${params.eventId}.xlsx"`,
            },
        });
    } catch (error) {
        console.error("Jury export error:", error);
        return new Response(JSON.stringify({ error: "Failed to export" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

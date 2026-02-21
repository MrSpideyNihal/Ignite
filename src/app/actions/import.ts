"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { Event, Team, TeamMember, Coupon } from "@/models";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { ActionState } from "@/types";

// Generate unique team code
function generateTeamCode(year: number): string {
    const prefix = `IGN${year.toString().slice(-2)}`;
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${random}`;
}

export interface ImportRow {
    projectName: string;
    projectCode: string;
    teamLeadName: string;
    teamLeadPhone: string;
    teamLeadEmail?: string;
    guideName?: string;
    guidePhone?: string;
    guideEmail?: string;
    members: Array<{
        prefix: string;
        name: string;
        college: string;
        branch: string;
        yearOfPassing: number;
        phone?: string;
        email?: string;
        foodPreference?: string;
    }>;
}

export async function importTeams(
    eventId: string,
    rows: ImportRow[]
): Promise<ActionState & { imported?: number; errors?: string[] }> {
    try {
        await requireSuperAdmin();
        await connectToDatabase();

        const event = await Event.findById(eventId);
        if (!event) {
            return { success: false, message: "Event not found" };
        }

        const errors: string[] = [];
        let imported = 0;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 1;

            try {
                // Validate required fields
                if (!row.projectName || !row.projectCode || !row.teamLeadName || !row.teamLeadPhone) {
                    errors.push(`Row ${rowNum}: Missing required fields (projectName, projectCode, teamLeadName, teamLeadPhone)`);
                    continue;
                }
                if (!row.members || row.members.length === 0) {
                    errors.push(`Row ${rowNum}: At least one team member is required`);
                    continue;
                }

                // Check for duplicate project code
                const existing = await Team.findOne({ eventId, projectCode: row.projectCode });
                if (existing) {
                    errors.push(`Row ${rowNum}: Project code "${row.projectCode}" already exists`);
                    continue;
                }

                // Generate team code
                let teamCode = generateTeamCode(event.year);
                let codeExists = await Team.findOne({ teamCode });
                while (codeExists) {
                    teamCode = generateTeamCode(event.year);
                    codeExists = await Team.findOne({ teamCode });
                }

                // Create team
                const team = await Team.create({
                    eventId,
                    teamCode,
                    projectName: row.projectName,
                    projectCode: row.projectCode,
                    status: "pending",
                    teamLead: {
                        name: row.teamLeadName,
                        phone: row.teamLeadPhone,
                        email: row.teamLeadEmail || "",
                    },
                    guide: row.guideName
                        ? {
                            name: row.guideName,
                            phone: row.guidePhone || "",
                            email: row.guideEmail || "",
                        }
                        : undefined,
                });

                // Create team members
                const memberDocs = row.members.map((m) => ({
                    teamId: team._id,
                    eventId,
                    prefix: m.prefix || "Mr",
                    name: m.name,
                    college: m.college || "N/A",
                    branch: m.branch || "N/A",
                    yearOfPassing: m.yearOfPassing || new Date().getFullYear(),
                    phone: m.phone || "",
                    email: m.email || "",
                    foodPreference: m.foodPreference === "non-veg" ? "non-veg" : "veg",
                    isAttending: true,
                }));

                await TeamMember.insertMany(memberDocs);
                imported++;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Unknown error";
                errors.push(`Row ${rowNum}: ${message}`);
            }
        }

        return {
            success: true,
            message: `Imported ${imported} of ${rows.length} teams`,
            imported,
            errors: errors.length > 0 ? errors : undefined,
        };
    } catch (error) {
        console.error("Import error:", error);
        return { success: false, message: "Import failed. Check that you have admin access." };
    }
}

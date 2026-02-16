import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireEventRole } from "@/lib/auth-utils";
import { Team, TeamMember, Coupon, EvaluationSubmission, Event } from "@/models";
import * as XLSX from "xlsx";
import JSZip from "jszip";

interface Params {
    params: { eventId: string };
}

// Helper function to generate a single Excel file
async function generateExport(eventId: string, type: string) {
    let data: unknown[] = [];
    let sheetName = "Export";

    switch (type) {
        case "teams": {
            const teams = await Team.find({
                eventId: eventId,
                status: "approved",
            }).lean();

            for (const team of teams) {
                const members = await TeamMember.find({ teamId: team._id }).lean();
                for (const member of members) {
                    data.push({
                        "Team Code": team.teamCode,
                        "Project Name": team.projectName,
                        "Project Code": team.projectCode,
                        "Team Lead": team.teamLead.name,
                        "Team Lead Phone": team.teamLead.phone,
                        "Member Name": member.name,
                        "Prefix": member.prefix,
                        "College": member.college,
                        "Branch": member.branch,
                        "Year": member.yearOfPassing,
                        "Phone": member.phone || "",
                        "Email": member.email || "",
                        "Attending": member.isAttending ? "Yes" : "No",
                        "Food": member.foodPreference,
                        "Accommodation": member.accommodation?.required ? member.accommodation.type : "None",
                    });
                }
            }
            sheetName = "Teams";
            break;
        }

        case "food": {
            const members = await TeamMember.find({
                eventId: eventId,
                isAttending: true,
            }).lean();

            const teams = await Team.find({ eventId: eventId }).lean();
            const teamMap = new Map(teams.map((t) => [t._id.toString(), t.teamCode]));

            for (const member of members) {
                data.push({
                    "Team Code": teamMap.get(member.teamId.toString()) || "",
                    "Name": member.name,
                    "Food Preference": member.foodPreference,
                    "College": member.college,
                });
            }
            sheetName = "Food Preferences";
            break;
        }

        case "coupons": {
            const coupons = await Coupon.find({ eventId: eventId }).lean();

            for (const coupon of coupons) {
                data.push({
                    "Coupon Code": coupon.couponCode,
                    "Member Name": coupon.memberName,
                    "Type": coupon.type,
                    "Status": coupon.isUsed ? "Used" : "Available",
                    "Used At": coupon.usedAt?.toLocaleString() || "",
                    "Scanned By": coupon.scannedByName || "",
                });
            }
            sheetName = "Coupons";
            break;
        }

        case "accommodation": {
            const members = await TeamMember.find({
                eventId: eventId,
                isAttending: true,
                "accommodation.required": true,
            }).lean();

            const teams = await Team.find({ eventId: eventId }).lean();
            const teamMap = new Map(teams.map((t) => [t._id.toString(), t.teamCode]));

            for (const member of members) {
                data.push({
                    "Team Code": teamMap.get(member.teamId.toString()) || "",
                    "Name": member.name,
                    "Room Type": member.accommodation?.type || "",
                    "College": member.college,
                    "Phone": member.phone || "",
                });
            }
            sheetName = "Accommodation";
            break;
        }

        case "evaluations": {
            const submissions = await EvaluationSubmission.find({
                eventId: eventId,
                status: { $in: ["submitted", "locked"] },
            }).lean();

            for (const sub of submissions) {
                data.push({
                    "Team Code": sub.teamCode,
                    "Project Name": sub.projectName,
                    "Jury": sub.juryName,
                    "Status": sub.status,
                    "Total Score": sub.totalScore,
                    "Max Score": sub.maxPossibleScore,
                    "Percentage": sub.maxPossibleScore > 0
                        ? ((sub.totalScore / sub.maxPossibleScore) * 100).toFixed(1) + "%"
                        : "0%",
                    "Submitted At": sub.submittedAt?.toLocaleString() || "",
                });
            }
            sheetName = "Evaluations";
            break;
        }

        case "attendance": {
            const coupons = await Coupon.find({
                eventId: eventId,
                isUsed: true,
            }).lean();

            for (const coupon of coupons) {
                data.push({
                    "Member Name": coupon.memberName,
                    "Meal Type": coupon.type,
                    "Time": coupon.usedAt?.toLocaleString() || "",
                    "Scanned By": coupon.scannedByName || "",
                });
            }
            sheetName = "Attendance";
            break;
        }
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return { buffer, filename: `${type}.xlsx` };
}

export async function GET(request: NextRequest, { params }: Params) {
    try {
        // Check access for committee members
        await requireEventRole(params.eventId, [
            "food_committee",
            "logistics_committee",
            "registration_committee",
            "jury_admin",
        ]);

        await connectToDatabase();

        // Get event name for filename
        const event = await Event.findById(params.eventId).lean();
        const eventName = event?.name.replace(/\s+/g, "_") || "IGNITE";

        // Create ZIP file
        const zip = new JSZip();

        // Generate all exports
        const exportTypes = ["teams", "food", "coupons", "accommodation", "evaluations", "attendance"];

        for (const type of exportTypes) {
            const { buffer, filename } = await generateExport(params.eventId, type);
            zip.file(filename, buffer);
        }

        // Generate ZIP buffer
        const zipBuffer = await zip.generateAsync({ type: "uint8array" });

        // Return ZIP file
        const timestamp = new Date().toISOString().split('T')[0];
        return new NextResponse(Buffer.from(zipBuffer), {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="${eventName}_AllData_${timestamp}.zip"`,
            },
        });
    } catch (error) {
        console.error("Export all error:", error);
        return NextResponse.json({ error: "Export failed" }, { status: 500 });
    }
}

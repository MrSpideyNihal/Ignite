import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireEventRole } from "@/lib/auth-utils";
import { Team, TeamMember, Coupon, EvaluationSubmission } from "@/models";
import * as XLSX from "xlsx";

interface Params {
    params: { eventId: string; type: string };
}

export async function GET(request: NextRequest, { params }: Params) {
    try {
        // Check access for food, logistics, or registration committee
        await requireEventRole(params.eventId, [
            "food_committee",
            "logistics_committee",
            "registration_committee",
        ]);

        await connectToDatabase();

        let data: unknown[] = [];
        let sheetName = "Export";

        switch (params.type) {
            case "teams": {
                const teams = await Team.find({
                    eventId: params.eventId,
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
                    eventId: params.eventId,
                    isAttending: true,
                }).lean();

                const teams = await Team.find({ eventId: params.eventId }).lean();
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
                const coupons = await Coupon.find({ eventId: params.eventId }).lean();

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
                    eventId: params.eventId,
                    isAttending: true,
                    "accommodation.required": true,
                }).lean();

                const teams = await Team.find({ eventId: params.eventId }).lean();
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
                    eventId: params.eventId,
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
                    eventId: params.eventId,
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

            default:
                return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
        }

        // Create workbook
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Generate buffer
        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="${params.type}-${Date.now()}.xlsx"`,
            },
        });
    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json({ error: "Export failed" }, { status: 500 });
    }
}

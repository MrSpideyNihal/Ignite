"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { Event, Team, TeamMember, Coupon } from "@/models";
import { requireEventRole } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionState, TeamStatus } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Generate unique team code
function generateTeamCode(year: number): string {
    const prefix = `IGN${year.toString().slice(-2)}`;
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${random}`;
}

// Generate coupon code
function generateCouponCode(teamCode: string, type: string): string {
    const typePrefix = type.charAt(0).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${teamCode}-${typePrefix}${random}`;
}

const TeamLeadSchema = z.object({
    name: z.string().min(2),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().min(10),
});

const MemberSchema = z.object({
    prefix: z.enum(["Mr", "Ms", "Dr", "NA"]),
    name: z.string().min(2),
    college: z.string().min(2),
    branch: z.string().min(2),
    yearOfPassing: z.number().min(2020).max(2030),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    foodPreference: z.enum(["veg", "non-veg"]),
});

// Public: Register a new team
export async function registerTeam(
    eventId: string,
    data: {
        projectName: string;
        projectCode: string;
        teamLead: { name: string; email?: string; phone: string };
        guide?: { name: string; email?: string; phone?: string };
        members: Array<{
            prefix: "Mr" | "Ms" | "Dr" | "NA";
            name: string;
            college: string;
            branch: string;
            yearOfPassing: number;
            phone?: string;
            email?: string;
            foodPreference: "veg" | "non-veg";
        }>;
    }
): Promise<ActionState & { teamCode?: string }> {
    try {
        await connectToDatabase();

        // Check event exists and registration is open
        const event = await Event.findById(eventId);
        if (!event) {
            return { success: false, message: "Event not found" };
        }
        if (!event.settings.registrationOpen) {
            return { success: false, message: "Registration is currently closed" };
        }
        if (data.members.length > event.settings.maxTeamSize) {
            return {
                success: false,
                message: `Maximum ${event.settings.maxTeamSize} members allowed`,
            };
        }

        // Generate unique team code
        let teamCode = generateTeamCode(event.year);
        while (await Team.findOne({ teamCode })) {
            teamCode = generateTeamCode(event.year);
        }

        // Create team
        const team = await Team.create({
            eventId,
            teamCode,
            projectName: data.projectName,
            projectCode: data.projectCode,
            status: "pending",
            teamLead: data.teamLead,
            guide: data.guide,
            registrationDate: new Date(),
        });

        // Create team members
        for (const member of data.members) {
            await TeamMember.create({
                teamId: team._id,
                eventId,
                ...member,
                isAttending: true,
                accommodation: { required: false },
            });
        }

        return {
            success: true,
            message: "Team registered successfully!",
            teamCode,
        };
    } catch (error) {
        console.error("Error registering team:", error);
        return { success: false, message: "Failed to register team" };
    }
}

// Get teams for an event (for committee)
export async function getEventTeams(eventId: string, status?: TeamStatus) {
    await connectToDatabase();

    const query: Record<string, unknown> = { eventId };
    if (status) query.status = status;

    const teams = await Team.find(query)
        .sort({ registrationDate: -1 })
        .lean();

    // Get member counts
    const teamsWithCounts = await Promise.all(
        teams.map(async (team) => {
            const memberCount = await TeamMember.countDocuments({ teamId: team._id });
            return {
                _id: team._id.toString(),
                eventId: team.eventId.toString(),
                teamCode: team.teamCode,
                projectName: team.projectName,
                projectCode: team.projectCode,
                status: team.status,
                teamLead: team.teamLead,
                guide: team.guide,
                memberCount,
                registrationDate: team.registrationDate,
            };
        })
    );

    return teamsWithCounts;
}

// Get single team by code (public)
export async function getTeamByCode(teamCode: string) {
    await connectToDatabase();

    const team = await Team.findOne({ teamCode: teamCode.toUpperCase() }).lean();
    if (!team) return null;

    const members = await TeamMember.find({ teamId: team._id }).lean();

    return {
        _id: team._id.toString(),
        eventId: team.eventId.toString(),
        teamCode: team.teamCode,
        projectName: team.projectName,
        projectCode: team.projectCode,
        status: team.status,
        teamLead: team.teamLead,
        guide: team.guide,
        members: members.map((m) => ({
            _id: m._id.toString(),
            prefix: m.prefix,
            name: m.name,
            college: m.college,
            branch: m.branch,
            yearOfPassing: m.yearOfPassing,
            phone: m.phone,
            email: m.email,
            isAttending: m.isAttending,
            accommodation: m.accommodation ? {
                required: m.accommodation.required || false,
                type: m.accommodation.type,
                dates: m.accommodation.dates?.map(d => d.toISOString()) || [],
                roomAssignment: m.accommodation.roomAssignment
            } : undefined,
            foodPreference: m.foodPreference,
        })),
    };
}

// Approve team
export async function approveTeam(
    eventId: string,
    teamId: string
): Promise<ActionState> {
    const { user } = await requireEventRole(eventId, [
        "registration_committee",
    ]);

    try {
        await connectToDatabase();

        const team = await Team.findOneAndUpdate(
            { _id: teamId, eventId },
            {
                status: "approved",
                approvedBy: user.id,
                approvedAt: new Date(),
            },
            { new: true }
        );

        if (!team) {
            return { success: false, message: "Team not found" };
        }

        // Generate coupons for approved team members
        const members = await TeamMember.find({ teamId, isAttending: true });
        const event = await Event.findById(eventId);

        for (const member of members) {
            // Generate lunch coupon
            await Coupon.create({
                eventId,
                teamId,
                memberId: member._id,
                memberName: member.name,
                couponCode: generateCouponCode(team.teamCode, "lunch"),
                type: "lunch",
                date: event?.date || new Date(),
                isUsed: false,
            });

            // Generate tea coupon
            await Coupon.create({
                eventId,
                teamId,
                memberId: member._id,
                memberName: member.name,
                couponCode: generateCouponCode(team.teamCode, "tea"),
                type: "tea",
                date: event?.date || new Date(),
                isUsed: false,
            });
        }

        revalidatePath(`/${eventId}/teams`);
        return { success: true, message: "Team approved and coupons generated" };
    } catch (error) {
        console.error("Error approving team:", error);
        return { success: false, message: "Failed to approve team" };
    }
}

// Reject team
export async function rejectTeam(
    eventId: string,
    teamId: string,
    reason: string
): Promise<ActionState> {
    await requireEventRole(eventId, ["registration_committee"]);

    try {
        await connectToDatabase();

        await Team.findOneAndUpdate(
            { _id: teamId, eventId },
            { status: "rejected", rejectionReason: reason }
        );

        revalidatePath(`/${eventId}/teams`);
        return { success: true, message: "Team rejected" };
    } catch (error) {
        console.error("Error rejecting team:", error);
        return { success: false, message: "Failed to reject team" };
    }
}

// Update team member attendance/accommodation
export async function updateTeamMember(
    teamCode: string,
    memberId: string,
    data: {
        isAttending?: boolean;
        accommodation?: {
            required: boolean;
            type?: "dorm" | "suite";
            dates?: string[];
        };
        foodPreference?: "veg" | "non-veg";
    }
): Promise<ActionState> {
    try {
        await connectToDatabase();

        const team = await Team.findOne({ teamCode: teamCode.toUpperCase() });
        if (!team) {
            return { success: false, message: "Team not found" };
        }

        await TeamMember.findOneAndUpdate(
            { _id: memberId, teamId: team._id },
            { $set: data }
        );

        return { success: true, message: "Member updated" };
    } catch (error) {
        console.error("Error updating member:", error);
        return { success: false, message: "Failed to update" };
    }
}

// Get team stats for event
export async function getTeamStats(eventId: string) {
    await connectToDatabase();

    const [total, pending, approved, rejected] = await Promise.all([
        Team.countDocuments({ eventId }),
        Team.countDocuments({ eventId, status: "pending" }),
        Team.countDocuments({ eventId, status: "approved" }),
        Team.countDocuments({ eventId, status: "rejected" }),
    ]);

    const totalMembers = await TeamMember.countDocuments({ eventId });
    const attendingMembers = await TeamMember.countDocuments({
        eventId,
        isAttending: true,
    });

    const vegCount = await TeamMember.countDocuments({
        eventId,
        isAttending: true,
        foodPreference: "veg",
    });
    const nonVegCount = await TeamMember.countDocuments({
        eventId,
        isAttending: true,
        foodPreference: "non-veg",
    });

    return {
        teams: { total, pending, approved, rejected },
        members: { total: totalMembers, attending: attendingMembers },
        food: { veg: vegCount, nonVeg: nonVegCount },
    };
}

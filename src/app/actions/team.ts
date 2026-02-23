"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { Event, Team, TeamMember, Coupon, JuryAssignment, EvaluationSubmission } from "@/models";
import { requireEventRole, getCurrentUser } from "@/lib/auth-utils";
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
    foodPreference: z.enum(["veg", "non-veg"]).optional(),
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
            foodPreference?: "veg" | "non-veg";
        }>;
    }
): Promise<ActionState & { teamCode?: string }> {
    try {
        await connectToDatabase();

        // Require authentication
        const { auth } = await import("@/lib/auth");
        const session = await auth();
        if (!session?.user?.email) {
            return { success: false, message: "You must sign in with Google before registering a team" };
        }

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
            registeredByEmail: session.user.email.toLowerCase(),
            registrationDate: new Date(),
        });

        // Auto-add team lead as first member
        await TeamMember.create({
            teamId: team._id,
            eventId,
            prefix: "Mr",
            name: data.teamLead.name,
            college: "N/A",
            branch: "N/A",
            yearOfPassing: new Date().getFullYear(),
            phone: data.teamLead.phone,
            email: data.teamLead.email?.toLowerCase() || undefined,
            isAttending: true,
            accommodation: { required: false },
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
        registeredByEmail: team.registeredByEmail,
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

// Get team by team lead phone number
export async function getTeamByPhone(phone: string) {
    await connectToDatabase();

    // Clean phone number — only keep digits
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) return null;

    // Search by last 10 digits to handle country code prefix
    const phoneRegex = new RegExp(cleanPhone.slice(-10) + "$");
    const team = await Team.findOne({ "teamLead.phone": { $regex: phoneRegex } }).lean();
    if (!team) return null;

    // Reuse the same format as getTeamByCode
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

        // Generate coupons for approved team members using event's meal slots
        const members = await TeamMember.find({ teamId, isAttending: { $ne: false } });
        const event = await Event.findById(eventId);
        const mealSlots = event?.settings?.mealSlots?.length
            ? event.settings.mealSlots
            : ["lunch", "tea"];

        let generated = 0;
        for (const member of members) {
            for (const slotType of mealSlots) {
                // Skip if coupon already exists (prevents duplicates on re-approval)
                const existing = await Coupon.findOne({
                    memberId: member._id,
                    type: slotType,
                    eventId,
                });
                if (!existing) {
                    await Coupon.create({
                        eventId,
                        teamId,
                        memberId: member._id,
                        memberName: member.name,
                        couponCode: generateCouponCode(team.teamCode, slotType),
                        type: slotType,
                        date: event?.date || new Date(),
                        isUsed: false,
                    });
                    generated++;
                }
            }
        }

        // Generate coupons for guide/mentor if present
        if (team.guide?.name) {
            const guideMemberId = team._id;
            for (const slotType of mealSlots) {
                const existing = await Coupon.findOne({
                    memberId: guideMemberId,
                    type: slotType,
                    eventId,
                });
                if (!existing) {
                    await Coupon.create({
                        eventId,
                        teamId,
                        memberId: guideMemberId,
                        memberName: `${team.guide.name} (Guide)`,
                        couponCode: generateCouponCode(team.teamCode, `G${slotType}`),
                        type: slotType,
                        date: event?.date || new Date(),
                        isUsed: false,
                    });
                    generated++;
                }
            }
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

        // Auth: require Google sign-in and verify user belongs to this team
        const { auth: getAuth } = await import("@/lib/auth");
        const session = await getAuth();
        const email = session?.user?.email?.toLowerCase();
        if (!email) {
            return { success: false, message: "Sign in required" };
        }

        // Allow if user is team lead or a member of this team
        const isLead = team.teamLead?.email?.toLowerCase() === email;
        const isMember = await TeamMember.exists({
            teamId: team._id,
            email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        });
        if (!isLead && !isMember) {
            return { success: false, message: "Not authorized for this team" };
        }

        await TeamMember.findOneAndUpdate(
            { _id: memberId, teamId: team._id },
            { $set: data }
        );

        const { revalidatePath } = await import("next/cache");
        revalidatePath(`/team/${teamCode}`);
        return { success: true, message: "Member updated" };
    } catch (error) {
        console.error("Error updating member:", error);
        return { success: false, message: "Failed to update" };
    }
}

// Update team details (only allowed when status is "pending")
// Called by team owner from Team Portal
export async function updateTeamDetails(
    teamCode: string,
    data: {
        projectName?: string;
        projectCode?: string;
        teamLead?: { name: string; email?: string; phone: string };
        guide?: { name?: string; email?: string; phone?: string } | null;
        members?: Array<{
            _id?: string; // existing member — update; omit for new
            prefix: "Mr" | "Ms" | "Dr" | "NA";
            name: string;
            college: string;
            branch: string;
            yearOfPassing: number;
            phone?: string;
            email?: string;
        }>;
    }
): Promise<ActionState> {
    try {
        await connectToDatabase();

        // Auth check
        const { auth: getAuth } = await import("@/lib/auth");
        const session = await getAuth();
        const email = session?.user?.email?.toLowerCase();
        if (!email) {
            return { success: false, message: "Sign in required" };
        }

        const team = await Team.findOne({ teamCode: teamCode.toUpperCase() });
        if (!team) {
            return { success: false, message: "Team not found" };
        }

        // CRITICAL: Only allow editing when team is pending
        if (team.status !== "pending") {
            return {
                success: false,
                message: "Team details can only be edited while registration is under review (pending status)",
            };
        }

        // Verify user is team owner (registered the team or is team lead)
        const isOwner =
            team.registeredByEmail?.toLowerCase() === email ||
            team.teamLead?.email?.toLowerCase() === email;
        if (!isOwner) {
            return { success: false, message: "Only the person who registered this team can edit it" };
        }

        // Fetch event for validation
        const event = await Event.findById(team.eventId);
        if (!event) {
            return { success: false, message: "Event not found" };
        }

        // Validate project details
        if (data.projectName !== undefined || data.projectCode !== undefined) {
            const projectName = data.projectName ?? team.projectName;
            const projectCode = data.projectCode ?? team.projectCode;

            if (!projectName || projectName.trim().length < 2) {
                return { success: false, message: "Project name must be at least 2 characters" };
            }
            if (!projectCode || projectCode.trim().length < 1) {
                return { success: false, message: "Project code is required" };
            }

            // If event has predefined projects, validate selection
            if (event.projects && event.projects.length > 0) {
                const validProject = event.projects.some(
                    (p) => p.projectCode === projectCode && p.projectName === projectName
                );
                if (!validProject) {
                    return { success: false, message: "Please select a valid project from the list" };
                }
            }

            team.projectName = projectName.trim();
            team.projectCode = projectCode.trim();
        }

        // Validate & update team lead
        if (data.teamLead) {
            if (!data.teamLead.name || data.teamLead.name.trim().length < 2) {
                return { success: false, message: "Team lead name must be at least 2 characters" };
            }
            if (!data.teamLead.phone || data.teamLead.phone.trim().length < 10) {
                return { success: false, message: "Team lead phone must be at least 10 digits" };
            }
            team.teamLead = {
                name: data.teamLead.name.trim(),
                email: data.teamLead.email?.trim() || undefined,
                phone: data.teamLead.phone.trim(),
            };
        }

        // Update guide (null = remove guide)
        if (data.guide !== undefined) {
            if (data.guide === null || !data.guide.name?.trim()) {
                team.guide = undefined;
            } else {
                team.guide = {
                    name: data.guide.name.trim(),
                    email: data.guide.email?.trim() || undefined,
                    phone: data.guide.phone?.trim() || undefined,
                };
            }
        }

        await team.save();

        // Handle member updates
        if (data.members) {
            if (data.members.length === 0) {
                return { success: false, message: "Team must have at least one member" };
            }
            if (data.members.length > event.settings.maxTeamSize) {
                return {
                    success: false,
                    message: `Maximum ${event.settings.maxTeamSize} members allowed`,
                };
            }

            // Validate each member
            for (let i = 0; i < data.members.length; i++) {
                const m = data.members[i];
                if (!m.name || m.name.trim().length < 2) {
                    return { success: false, message: `Member ${i + 1}: Name must be at least 2 characters` };
                }
                if (!m.college || m.college.trim().length < 2) {
                    return { success: false, message: `Member ${i + 1}: College is required` };
                }
                if (!m.branch || m.branch.trim().length < 1) {
                    return { success: false, message: `Member ${i + 1}: Branch is required` };
                }
                if (!m.yearOfPassing || m.yearOfPassing < 2020 || m.yearOfPassing > 2035) {
                    return { success: false, message: `Member ${i + 1}: Year of passing must be between 2020 and 2035` };
                }
            }

            // Get existing member IDs
            const existingMembers = await TeamMember.find({ teamId: team._id }).lean();
            const existingIds = existingMembers.map((m) => m._id.toString());

            // Track which existing members are being kept
            const keptIds = new Set<string>();

            for (const m of data.members) {
                if (m._id && existingIds.includes(m._id)) {
                    // Update existing member
                    keptIds.add(m._id);
                    await TeamMember.findByIdAndUpdate(m._id, {
                        $set: {
                            prefix: m.prefix,
                            name: m.name.trim(),
                            college: m.college.trim(),
                            branch: m.branch.trim(),
                            yearOfPassing: m.yearOfPassing,
                            phone: m.phone?.trim() || undefined,
                            email: m.email?.trim()?.toLowerCase() || undefined,
                        },
                    });
                } else {
                    // Create new member
                    await TeamMember.create({
                        teamId: team._id,
                        eventId: team.eventId,
                        prefix: m.prefix,
                        name: m.name.trim(),
                        college: m.college.trim(),
                        branch: m.branch.trim(),
                        yearOfPassing: m.yearOfPassing,
                        phone: m.phone?.trim() || undefined,
                        email: m.email?.trim()?.toLowerCase() || undefined,
                        isAttending: true,
                        accommodation: { required: false },
                    });
                }
            }

            // Delete removed members
            const toDelete = existingIds.filter((id) => !keptIds.has(id));
            if (toDelete.length > 0) {
                await TeamMember.deleteMany({ _id: { $in: toDelete } });
            }
        }

        revalidatePath(`/team/${teamCode}`);
        return { success: true, message: "Team details updated successfully" };
    } catch (error) {
        console.error("Error updating team details:", error);
        return { success: false, message: "Failed to update team details. Please try again." };
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
        isAttending: { $ne: false },
    });

    const vegCount = await TeamMember.countDocuments({
        eventId,
        isAttending: { $ne: false },
        foodPreference: "veg",
    });
    const nonVegCount = await TeamMember.countDocuments({
        eventId,
        isAttending: { $ne: false },
        foodPreference: "non-veg",
    });

    return {
        teams: { total, pending, approved, rejected },
        members: { total: totalMembers, attending: attendingMembers },
        food: { veg: vegCount, nonVeg: nonVegCount },
    };
}

// Delete a team and ALL related data (super admin or registration committee)
export async function deleteTeam(
    eventId: string,
    teamId: string
): Promise<ActionState> {
    // Allow super admin or registration committee
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated" };

    const isSuperAdmin = user.globalRole === "super_admin";
    if (!isSuperAdmin) {
        await requireEventRole(eventId, ["registration_committee"]);
    }

    try {
        await connectToDatabase();

        const team = await Team.findOne({ _id: teamId, eventId });
        if (!team) return { success: false, message: "Team not found" };

        // Delete all related data
        await Promise.all([
            TeamMember.deleteMany({ teamId }),
            Coupon.deleteMany({ teamId }),
            JuryAssignment.deleteMany({ teamId }),
            EvaluationSubmission.deleteMany({ teamId }),
        ]);

        // Delete the team itself
        await Team.findByIdAndDelete(teamId);

        revalidatePath(`/${eventId}/teams`);
        return { success: true, message: `Team ${team.teamCode} and all related data deleted` };
    } catch (error) {
        console.error("Error deleting team:", error);
        return { success: false, message: "Failed to delete team" };
    }
}

// Reset team status (super admin or registration committee)
export async function resetTeamStatus(
    eventId: string,
    teamId: string,
    newStatus: "pending" | "approved" | "rejected"
): Promise<ActionState> {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated" };

    const isSuperAdmin = user.globalRole === "super_admin";
    if (!isSuperAdmin) {
        await requireEventRole(eventId, ["registration_committee"]);
    }

    try {
        await connectToDatabase();

        const team = await Team.findOne({ _id: teamId, eventId });
        if (!team) return { success: false, message: "Team not found" };

        const updateData: Record<string, unknown> = { status: newStatus };

        if (newStatus === "approved") {
            updateData.approvedBy = user.id;
            updateData.approvedAt = new Date();
            updateData.rejectionReason = undefined;
        } else if (newStatus === "pending") {
            updateData.approvedBy = undefined;
            updateData.approvedAt = undefined;
            updateData.rejectionReason = undefined;
        }

        await Team.findByIdAndUpdate(teamId, { $set: updateData });

        // If approving, generate coupons (including for guide if present)
        if (newStatus === "approved") {
            const event = await Event.findById(eventId);
            const mealSlots = event?.settings?.mealSlots?.length
                ? event.settings.mealSlots
                : ["lunch", "tea"];

            const members = await TeamMember.find({ teamId, isAttending: { $ne: false } });
            for (const member of members) {
                for (const slotType of mealSlots) {
                    const existing = await Coupon.findOne({ memberId: member._id, type: slotType, eventId });
                    if (!existing) {
                        await Coupon.create({
                            eventId, teamId, memberId: member._id, memberName: member.name,
                            couponCode: generateCouponCode(team.teamCode, slotType),
                            type: slotType, date: event?.date || new Date(), isUsed: false,
                        });
                    }
                }
            }

            // Generate coupons for guide if present
            if (team.guide?.name) {
                const guideMemberId = team._id; // Use team ID as guide's "member" ID
                for (const slotType of mealSlots) {
                    const existing = await Coupon.findOne({ memberId: guideMemberId, type: slotType, eventId });
                    if (!existing) {
                        await Coupon.create({
                            eventId, teamId, memberId: guideMemberId,
                            memberName: `${team.guide.name} (Guide)`,
                            couponCode: generateCouponCode(team.teamCode, `G${slotType}`),
                            type: slotType, date: event?.date || new Date(), isUsed: false,
                        });
                    }
                }
            }
        }

        revalidatePath(`/${eventId}/teams`);
        return { success: true, message: `Team status changed to ${newStatus}` };
    } catch (error) {
        console.error("Error resetting team status:", error);
        return { success: false, message: "Failed to update team status" };
    }
}

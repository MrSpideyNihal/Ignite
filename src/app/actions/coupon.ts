"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { Coupon, TeamMember, Event } from "@/models";
import { requireEventRole, getCurrentUser } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { ActionState } from "@/types";

// Get coupons for event
export async function getEventCoupons(eventId: string, filters?: { type?: string; isUsed?: boolean }) {
    await connectToDatabase();

    const query: Record<string, unknown> = { eventId };
    if (filters?.type) query.type = filters.type;
    if (filters?.isUsed !== undefined) query.isUsed = filters.isUsed;

    const coupons = await Coupon.find(query)
        .sort({ type: 1, memberName: 1 })
        .lean();

    return coupons.map((c) => ({
        _id: c._id.toString(),
        couponCode: c.couponCode,
        memberName: c.memberName,
        type: c.type,
        date: c.date.toISOString(),
        isUsed: c.isUsed,
        usedAt: c.usedAt?.toISOString(),
        scannedByName: c.scannedByName,
    }));
}

// Get coupon stats dynamically based on coupon types in the DB
export async function getCouponStats(eventId: string) {
    await connectToDatabase();

    const allTypes = await Coupon.distinct("type", { eventId });
    const stats: Record<string, { total: number; used: number }> = {};

    for (const type of allTypes) {
        const total = await Coupon.countDocuments({ eventId, type });
        const used = await Coupon.countDocuments({ eventId, type, isUsed: true });
        stats[type] = { total, used };
    }

    return stats;
}

// Scan and use coupon — with optional expected type validation
export async function scanCoupon(
    eventId: string,
    couponCode: string,
    expectedType?: string
): Promise<ActionState & { coupon?: { memberName: string; type: string } }> {
    const { user } = await requireEventRole(eventId, ["logistics_committee"]);

    try {
        await connectToDatabase();

        const coupon = await Coupon.findOne({
            eventId,
            couponCode: couponCode.toUpperCase(),
        });

        if (!coupon) {
            return { success: false, message: "❌ Invalid coupon code — not found" };
        }

        // Type mismatch check
        if (expectedType && coupon.type !== expectedType) {
            return {
                success: false,
                message: `❌ Wrong coupon type — this is a ${coupon.type.toUpperCase()} coupon, but you selected ${expectedType.toUpperCase()}`,
            };
        }

        if (coupon.isUsed) {
            return {
                success: false,
                message: `⚠️ Already used by ${coupon.memberName} at ${coupon.usedAt?.toLocaleTimeString("en-IN")}`,
            };
        }

        coupon.isUsed = true;
        coupon.usedAt = new Date();
        coupon.usedBy = user.id as unknown as typeof coupon.usedBy;
        coupon.scannedByName = user.name;
        await coupon.save();

        revalidatePath(`/${eventId}/logistics`);

        return {
            success: true,
            message: `✓ ${coupon.type.toUpperCase()} validated for ${coupon.memberName}`,
            coupon: {
                memberName: coupon.memberName,
                type: coupon.type,
            },
        };
    } catch (error) {
        console.error("Error scanning coupon:", error);
        return { success: false, message: "Failed to scan coupon" };
    }
}

// Get member coupons (for team portal)
export async function getMemberCoupons(teamId: string) {
    await connectToDatabase();

    const coupons = await Coupon.find({ teamId })
        .sort({ memberName: 1, type: 1 })
        .lean();

    return coupons.map((c) => ({
        _id: c._id.toString(),
        couponCode: c.couponCode,
        memberName: c.memberName,
        type: c.type,
        isUsed: c.isUsed,
        memberId: c.memberId.toString(),
    }));
}

// Lazy coupon generation — ensures an approved team has coupons (no auth, called internally)
export async function ensureTeamCoupons(teamId: string, eventId: string): Promise<number> {
    await connectToDatabase();

    const { Team } = await import("@/models");
    const team = await Team.findById(teamId).lean();
    if (!team || team.status !== "approved") return 0;

    const event = await Event.findById(eventId).lean();
    const eventSettings = (event as Record<string, Record<string, unknown>> | null)?.settings;
    const configuredSlots = eventSettings?.mealSlots as string[] | undefined;
    const mealSlots: string[] = configuredSlots?.length ? configuredSlots : ["lunch", "tea"];

    // Use $ne: false to also catch members where isAttending is undefined (legacy/imported data)
    const members = await TeamMember.find({ teamId, isAttending: { $ne: false } }).lean();

    const genCode = (teamCode: string, type: string) => {
        const typePrefix = type.charAt(0).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${teamCode}-${typePrefix}${random}`;
    };

    let generated = 0;
    for (const member of members) {
        for (const slotType of mealSlots) {
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
                    couponCode: genCode(team.teamCode, slotType),
                    type: slotType,
                    date: event?.date || new Date(),
                    isUsed: false,
                });
                generated++;
            }
        }
    }

    return generated;
}

// Manually mark coupon as used
export async function markCouponUsed(
    eventId: string,
    couponId: string
): Promise<ActionState> {
    const { user } = await requireEventRole(eventId, ["logistics_committee", "food_committee"]);

    try {
        await connectToDatabase();

        await Coupon.findByIdAndUpdate(couponId, {
            isUsed: true,
            usedAt: new Date(),
            usedBy: user.id,
            scannedByName: user.name,
        });

        revalidatePath(`/${eventId}/logistics`);
        return { success: true, message: "Coupon marked as used" };
    } catch (error) {
        console.error("Error:", error);
        return { success: false, message: "Failed to update" };
    }
}

// Reset coupon
export async function resetCoupon(
    eventId: string,
    couponId: string
): Promise<ActionState> {
    await requireEventRole(eventId, ["logistics_committee"]);

    try {
        await connectToDatabase();

        await Coupon.findByIdAndUpdate(couponId, {
            isUsed: false,
            usedAt: null,
            usedBy: null,
            scannedByName: null,
        });

        revalidatePath(`/${eventId}/logistics`);
        return { success: true, message: "Coupon reset" };
    } catch (error) {
        console.error("Error:", error);
        return { success: false, message: "Failed to reset" };
    }
}

// Generate coupons for a team — uses event's configured meal slots
export async function generateTeamCoupons(
    eventId: string,
    teamId: string,
    teamCode: string
): Promise<ActionState> {
    await requireEventRole(eventId, ["logistics_committee", "registration_committee"]);

    try {
        await connectToDatabase();

        const event = await Event.findById(eventId);
        if (!event) return { success: false, message: "Event not found" };

        const mealSlots = event.settings?.mealSlots?.length
            ? event.settings.mealSlots
            : ["lunch", "tea"];

        // Use $ne: false to also catch members where isAttending is undefined (legacy/imported data)
        const members = await TeamMember.find({ teamId, isAttending: { $ne: false } });

        let generated = 0;

        for (const member of members) {
            for (const slotType of mealSlots) {
                const existing = await Coupon.findOne({
                    memberId: member._id,
                    type: slotType,
                    eventId,
                });

                if (!existing) {
                    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
                    const typePrefix = slotType.substring(0, 2).toUpperCase();
                    await Coupon.create({
                        eventId,
                        teamId,
                        memberId: member._id,
                        memberName: member.name,
                        couponCode: `${teamCode}-${typePrefix}${random}`,
                        type: slotType,
                        date: event.date || new Date(),
                        isUsed: false,
                    });
                    generated++;
                }
            }
        }

        revalidatePath(`/${eventId}/logistics`);
        return { success: true, message: `Generated ${generated} coupons across ${mealSlots.join(", ")}` };
    } catch (error) {
        console.error("Error:", error);
        return { success: false, message: "Failed to generate coupons" };
    }
}

// Generate coupons for ALL teams in event
export async function generateAllEventCoupons(eventId: string): Promise<ActionState> {
    await requireEventRole(eventId, ["logistics_committee"]);

    try {
        await connectToDatabase();

        const { Team } = await import("@/models");
        const teams = await Team.find({ eventId }).lean();

        let total = 0;
        for (const team of teams) {
            const result = await generateTeamCoupons(eventId, team._id.toString(), team.teamCode);
            if (result.success) {
                const match = result.message.match(/Generated (\d+)/);
                if (match) total += parseInt(match[1]);
            }
        }

        return { success: true, message: `Generated ${total} coupons for ${teams.length} teams` };
    } catch (error) {
        console.error("Error:", error);
        return { success: false, message: "Failed to generate coupons" };
    }
}

// Get food claimed status per team (for jury scoreboard)
export async function getTeamFoodStatus(eventId: string) {
    await connectToDatabase();

    const coupons = await Coupon.find({ eventId }).lean();

    // Group by teamId
    const teamMap: Record<string, { total: number; used: number }> = {};
    for (const c of coupons) {
        const key = c.teamId.toString();
        if (!teamMap[key]) teamMap[key] = { total: 0, used: 0 };
        teamMap[key].total++;
        if (c.isUsed) teamMap[key].used++;
    }

    return teamMap;
}

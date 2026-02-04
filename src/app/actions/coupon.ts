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

// Get coupon stats
export async function getCouponStats(eventId: string) {
    await connectToDatabase();

    const stats = {
        lunch: { total: 0, used: 0 },
        tea: { total: 0, used: 0 },
        dinner: { total: 0, used: 0 },
        kit: { total: 0, used: 0 },
    };

    for (const type of ["lunch", "tea", "dinner", "kit"]) {
        const total = await Coupon.countDocuments({ eventId, type });
        const used = await Coupon.countDocuments({ eventId, type, isUsed: true });
        stats[type as keyof typeof stats] = { total, used };
    }

    return stats;
}

// Scan and use coupon
export async function scanCoupon(
    eventId: string,
    couponCode: string
): Promise<ActionState & { coupon?: { memberName: string; type: string } }> {
    const { user } = await requireEventRole(eventId, ["logistics_committee"]);

    try {
        await connectToDatabase();

        const coupon = await Coupon.findOne({
            eventId,
            couponCode: couponCode.toUpperCase(),
        });

        if (!coupon) {
            return { success: false, message: "Invalid coupon code" };
        }

        if (coupon.isUsed) {
            return {
                success: false,
                message: `Already used at ${coupon.usedAt?.toLocaleTimeString()} by ${coupon.scannedByName}`,
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
            message: `✓ ${coupon.type.toUpperCase()} coupon validated for ${coupon.memberName}`,
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
    }));
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

// Reset coupon (admin only)
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

// Generate missing coupons for a team
export async function generateTeamCoupons(
    eventId: string,
    teamId: string,
    teamCode: string
): Promise<ActionState> {
    await requireEventRole(eventId, ["logistics_committee", "registration_committee"]);

    try {
        await connectToDatabase();

        const event = await Event.findById(eventId);
        const members = await TeamMember.find({ teamId, isAttending: true });

        let generated = 0;

        for (const member of members) {
            for (const type of ["lunch", "tea"] as const) {
                const existing = await Coupon.findOne({
                    memberId: member._id,
                    type,
                });

                if (!existing) {
                    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
                    await Coupon.create({
                        eventId,
                        teamId,
                        memberId: member._id,
                        memberName: member.name,
                        couponCode: `${teamCode}-${type.charAt(0).toUpperCase()}${random}`,
                        type,
                        date: event?.date || new Date(),
                        isUsed: false,
                    });
                    generated++;
                }
            }
        }

        revalidatePath(`/${eventId}/logistics`);
        return { success: true, message: `Generated ${generated} coupons` };
    } catch (error) {
        console.error("Error:", error);
        return { success: false, message: "Failed to generate coupons" };
    }
}

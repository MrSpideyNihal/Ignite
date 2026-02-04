"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { Coupon } from "@/models";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface CouponActionState {
    success: boolean;
    message: string;
    coupon?: {
        code: string;
        memberName: string;
        teamCode: string;
        type: string;
        status: string;
    };
}

// Get coupon by code
export async function getCouponByCode(code: string): Promise<CouponActionState> {
    try {
        await connectToDatabase();

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return { success: false, message: "Coupon not found" };
        }

        return {
            success: true,
            message: "",
            coupon: {
                code: coupon.code,
                memberName: coupon.memberName,
                teamCode: coupon.teamCode,
                type: coupon.type,
                status: coupon.status,
            },
        };
    } catch (error) {
        console.error("Error fetching coupon:", error);
        return { success: false, message: "An error occurred" };
    }
}

// Mark coupon as used
export async function markCouponAsUsed(code: string): Promise<CouponActionState> {
    const session = await auth();
    if (!session?.user) {
        return { success: false, message: "Not authenticated" };
    }

    try {
        await connectToDatabase();

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return { success: false, message: "Coupon not found" };
        }

        if (coupon.status === "used") {
            return { success: false, message: "Coupon has already been used" };
        }

        coupon.status = "used";
        coupon.usedAt = new Date();
        coupon.usedBy = session.user.email || "admin";
        await coupon.save();

        revalidatePath("/admin/food");
        revalidatePath("/admin/food/coupons");

        return {
            success: true,
            message: "Coupon marked as used",
            coupon: {
                code: coupon.code,
                memberName: coupon.memberName,
                teamCode: coupon.teamCode,
                type: coupon.type,
                status: coupon.status,
            },
        };
    } catch (error) {
        console.error("Error marking coupon:", error);
        return { success: false, message: "An error occurred" };
    }
}

// Get coupon stats
export async function getCouponStats() {
    try {
        await connectToDatabase();

        const totalCoupons = await Coupon.countDocuments();
        const usedCoupons = await Coupon.countDocuments({ status: "used" });
        const issuedCoupons = await Coupon.countDocuments({ status: "issued" });

        const lunchTotal = await Coupon.countDocuments({ type: "lunch" });
        const lunchUsed = await Coupon.countDocuments({ type: "lunch", status: "used" });

        const teaTotal = await Coupon.countDocuments({ type: "tea" });
        const teaUsed = await Coupon.countDocuments({ type: "tea", status: "used" });

        return {
            totalCoupons,
            usedCoupons,
            issuedCoupons,
            lunchTotal,
            lunchUsed,
            teaTotal,
            teaUsed,
        };
    } catch (error) {
        console.error("Error fetching coupon stats:", error);
        return {
            totalCoupons: 0,
            usedCoupons: 0,
            issuedCoupons: 0,
            lunchTotal: 0,
            lunchUsed: 0,
            teaTotal: 0,
            teaUsed: 0,
        };
    }
}

// Get all coupons (for admin)
export async function getAllCoupons() {
    try {
        await connectToDatabase();

        const coupons = await Coupon.find().sort({ createdAt: -1 }).limit(100).lean();

        return coupons.map((coupon) => ({
            _id: coupon._id.toString(),
            code: coupon.code,
            teamCode: coupon.teamCode,
            memberName: coupon.memberName,
            type: coupon.type,
            status: coupon.status,
            usedAt: coupon.usedAt,
            createdAt: coupon.createdAt,
        }));
    } catch (error) {
        console.error("Error fetching coupons:", error);
        return [];
    }
}

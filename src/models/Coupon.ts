import mongoose, { Schema, Document, Model } from "mongoose";
import { CouponStatus } from "@/types";

export interface ICouponDocument extends Document {
    code: string;
    teamId: mongoose.Types.ObjectId;
    teamCode: string;
    memberId: mongoose.Types.ObjectId;
    memberName: string;
    type: "lunch" | "tea" | "dinner";
    date: Date;
    status: CouponStatus;
    usedAt?: Date;
    usedBy?: string;
    createdAt: Date;
}

const CouponSchema = new Schema<ICouponDocument>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            index: true,
        },
        teamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: true,
        },
        teamCode: {
            type: String,
            required: true,
            uppercase: true,
        },
        memberId: {
            type: Schema.Types.ObjectId,
            ref: "Member",
            required: true,
        },
        memberName: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["lunch", "tea", "dinner"],
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["issued", "used"],
            default: "issued",
        },
        usedAt: {
            type: Date,
        },
        usedBy: {
            type: String,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Indexes
CouponSchema.index({ teamId: 1 });
CouponSchema.index({ memberId: 1 });
CouponSchema.index({ status: 1 });
CouponSchema.index({ type: 1, date: 1 });
CouponSchema.index({ code: 1, status: 1 });

export const Coupon: Model<ICouponDocument> =
    mongoose.models.Coupon ||
    mongoose.model<ICouponDocument>("Coupon", CouponSchema);

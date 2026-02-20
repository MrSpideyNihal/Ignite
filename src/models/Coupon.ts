import mongoose, { Schema, Document, Model } from "mongoose";

// Type is now a free string (any meal slot name: "breakfast","lunch","tea","dinner", or "kit")
export type CouponType = string;

export interface ICoupon extends Document {
    _id: mongoose.Types.ObjectId;
    eventId: mongoose.Types.ObjectId;
    teamId: mongoose.Types.ObjectId;
    memberId: mongoose.Types.ObjectId;
    memberName: string;
    couponCode: string;
    type: string;
    date: Date;
    isUsed: boolean;
    usedAt?: Date;
    usedBy?: mongoose.Types.ObjectId;
    scannedByName?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: true,
            index: true,
        },
        teamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: true,
            index: true,
        },
        memberId: {
            type: Schema.Types.ObjectId,
            ref: "TeamMember",
            required: true,
            index: true,
        },
        memberName: { type: String, required: true },
        couponCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            index: true,
        },
        type: {
            type: String,
            required: true,
        },
        date: { type: Date, required: true },
        isUsed: { type: Boolean, default: false, index: true },
        usedAt: { type: Date },
        usedBy: { type: Schema.Types.ObjectId, ref: "User" },
        scannedByName: { type: String },
    },
    { timestamps: true }
);

CouponSchema.index({ eventId: 1, type: 1, isUsed: 1 });
CouponSchema.index({ memberId: 1, type: 1, date: 1 });

export const Coupon: Model<ICoupon> =
    mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);

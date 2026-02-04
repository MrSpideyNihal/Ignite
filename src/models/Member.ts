import mongoose, { Schema, Document, Model } from "mongoose";
import { TitlePrefix, EngineeringBranch } from "@/types";

export interface IMemberDocument extends Document {
    fullName: string;
    titlePrefix: TitlePrefix;
    collegeName: string;
    yearOfPassing: number;
    branch: EngineeringBranch;
    email?: string;
    phone?: string;
    teamId: mongoose.Types.ObjectId;
    isTeamLead: boolean;
    couponCode?: string;
    createdAt: Date;
}

const MemberSchema = new Schema<IMemberDocument>(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        titlePrefix: {
            type: String,
            enum: ["Mr", "Ms", "Dr", "NA"],
            required: true,
        },
        collegeName: {
            type: String,
            required: true,
            trim: true,
        },
        yearOfPassing: {
            type: Number,
            required: true,
            min: 2025,
            max: 2030,
        },
        branch: {
            type: String,
            enum: ["CSE", "IT", "ECE", "Mechanical", "Civil", "Electrical", "Others"],
            required: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        teamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: true,
            index: true,
        },
        isTeamLead: {
            type: Boolean,
            default: false,
        },
        couponCode: {
            type: String,
            unique: true,
            sparse: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Indexes
MemberSchema.index({ teamId: 1, isTeamLead: 1 });
MemberSchema.index({ couponCode: 1 });

export const Member: Model<IMemberDocument> =
    mongoose.models.Member ||
    mongoose.model<IMemberDocument>("Member", MemberSchema);

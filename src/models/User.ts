import mongoose, { Schema, Document, Model } from "mongoose";
import { UserRole } from "@/types";

export interface IUserDocument extends Document {
    email: string;
    name: string;
    image?: string;
    role: UserRole;
    phone?: string;
    yearOfPassing?: number;
    branch?: string;
    assignedTeams: string[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
        },
        role: {
            type: String,
            enum: [
                "super_admin",
                "accommodation_admin",
                "food_admin",
                "commute_admin",
                "venue_admin",
                "guest",
                "jury_admin",
                "jury_member",
                "volunteer",
            ],
            default: "guest",
        },
        phone: {
            type: String,
            trim: true,
        },
        yearOfPassing: {
            type: Number,
            min: 2020,
            max: 2035,
        },
        branch: {
            type: String,
            enum: ["CSE", "IT", "ECE", "Mechanical", "Civil", "Electrical", "Others"],
        },
        assignedTeams: [
            {
                type: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
UserSchema.index({ role: 1 });
UserSchema.index({ email: 1, role: 1 });

export const User: Model<IUserDocument> =
    mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

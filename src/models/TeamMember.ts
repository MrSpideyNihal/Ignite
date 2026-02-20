import mongoose, { Schema, Document, Model } from "mongoose";

export type Prefix = "Mr" | "Ms" | "Dr" | "NA";
export type FoodPreference = "veg" | "non-veg";

export interface ITeamMember extends Document {
    _id: mongoose.Types.ObjectId;
    teamId: mongoose.Types.ObjectId;
    eventId: mongoose.Types.ObjectId;
    prefix: Prefix;
    name: string;
    college: string;
    branch: string;
    yearOfPassing: number;
    phone?: string;
    email?: string;
    isAttending: boolean;
    accommodation?: {
        required: boolean;
        type?: "dorm" | "suite";
        dates?: Date[];
        roomAssignment?: string;
    };
    foodPreference?: FoodPreference;
    createdAt: Date;
    updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
    {
        teamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: true,
            index: true,
        },
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: true,
            index: true,
        },
        prefix: {
            type: String,
            enum: ["Mr", "Ms", "Dr", "NA"],
            default: "Mr",
        },
        name: { type: String, required: true },
        college: { type: String, required: true },
        branch: { type: String, required: true },
        yearOfPassing: { type: Number, required: true },
        phone: { type: String },
        email: { type: String, lowercase: true },
        isAttending: { type: Boolean, default: true },
        accommodation: {
            required: { type: Boolean, default: false },
            type: { type: String, enum: ["dorm", "suite"] },
            dates: [{ type: Date }],
            roomAssignment: { type: String },
        },
        foodPreference: {
            type: String,
            enum: ["veg", "non-veg"],
            default: "veg",
        },
    },
    { timestamps: true }
);

// Compound indexes
TeamMemberSchema.index({ eventId: 1, isAttending: 1 });

export const TeamMember: Model<ITeamMember> =
    mongoose.models.TeamMember ||
    mongoose.model<ITeamMember>("TeamMember", TeamMemberSchema);

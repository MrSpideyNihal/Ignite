import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeam extends Document {
    _id: mongoose.Types.ObjectId;
    eventId: mongoose.Types.ObjectId;
    teamCode: string;
    projectName: string;
    projectCode: string;
    status: "pending" | "approved" | "rejected";
    teamLead: {
        name: string;
        email?: string;
        phone: string;
    };
    guide?: {
        name: string;
        email?: string;
        phone?: string;
    };
    registrationDate: Date;
    registeredByEmail?: string;
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: true,
            index: true,
        },
        teamCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            index: true,
        },
        projectName: { type: String, required: true },
        projectCode: { type: String, required: true },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true,
        },
        teamLead: {
            name: { type: String, required: true },
            email: { type: String },
            phone: { type: String, required: true },
        },
        guide: {
            name: { type: String },
            email: { type: String },
            phone: { type: String },
        },
        registrationDate: { type: Date, default: Date.now },
        registeredByEmail: { type: String, index: true },
        approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
        approvedAt: { type: Date },
        rejectionReason: { type: String },
    },
    { timestamps: true }
);

// Compound indexes
TeamSchema.index({ eventId: 1, status: 1 });
TeamSchema.index({ eventId: 1, projectCode: 1 });
TeamSchema.index({ "teamLead.phone": 1 });

export const Team: Model<ITeam> =
    mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

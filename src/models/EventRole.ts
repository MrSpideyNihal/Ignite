import mongoose, { Schema, Document, Model } from "mongoose";

// Event-scoped roles
export type EventRoleType =
    | "jury_admin"
    | "jury_member"
    | "registration_committee"
    | "food_committee"
    | "logistics_committee";

export interface IEventRole extends Document {
    _id: mongoose.Types.ObjectId;
    eventId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    userEmail: string; // For quick lookup
    role: EventRoleType;
    createdAt: Date;
    updatedAt: Date;
}

const EventRoleSchema = new Schema<IEventRole>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        userEmail: { type: String, required: true, lowercase: true },
        role: {
            type: String,
            enum: [
                "jury_admin",
                "jury_member",
                "registration_committee",
                "food_committee",
                "logistics_committee",
            ],
            required: true,
        },
    },
    { timestamps: true }
);

// Compound indexes for role lookups
EventRoleSchema.index({ eventId: 1, userId: 1 }, { unique: true });
EventRoleSchema.index({ eventId: 1, role: 1 });
EventRoleSchema.index({ userEmail: 1, eventId: 1 });

export const EventRole: Model<IEventRole> =
    mongoose.models.EventRole ||
    mongoose.model<IEventRole>("EventRole", EventRoleSchema);

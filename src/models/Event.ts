import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEvent extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    year: number;
    date: Date;
    description?: string;
    venue?: string;
    status: "draft" | "active" | "archived";
    settings: {
        registrationOpen: boolean;
        evaluationOpen: boolean;
        maxTeamSize: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
    {
        name: { type: String, required: true }, // e.g., "IGNITE 2026"
        year: { type: Number, required: true, index: true },
        date: { type: Date, required: true },
        description: { type: String },
        venue: { type: String },
        status: {
            type: String,
            enum: ["draft", "active", "archived"],
            default: "draft",
        },
        settings: {
            registrationOpen: { type: Boolean, default: false },
            evaluationOpen: { type: Boolean, default: false },
            maxTeamSize: { type: Number, default: 8 },
        },
    },
    { timestamps: true }
);

// Compound index for quick lookup
EventSchema.index({ year: 1, status: 1 });

export const Event: Model<IEvent> =
    mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

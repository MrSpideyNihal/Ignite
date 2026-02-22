import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEventProject {
    projectName: string;
    projectCode: string;
}

export interface IEvent extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    year: number;
    date: Date;
    description?: string;
    venue?: string;
    status: "draft" | "active" | "archived";
    projects: IEventProject[]; // predefined projects that teams can select
    settings: {
        registrationOpen: boolean;
        evaluationOpen: boolean;
        maxTeamSize: number;
        mealSlots: string[]; // e.g. ["breakfast","lunch","tea","dinner"]
        allowJuryEdit: boolean; // jury admin can allow re-editing submitted scores
    };
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
    {
        name: { type: String, required: true },
        year: { type: Number, required: true, index: true },
        date: { type: Date, required: true },
        description: { type: String },
        venue: { type: String },
        status: {
            type: String,
            enum: ["draft", "active", "archived"],
            default: "draft",
        },
        projects: {
            type: [{
                projectName: { type: String, required: true },
                projectCode: { type: String, required: true },
            }],
            default: [],
        },
        settings: {
            registrationOpen: { type: Boolean, default: false },
            evaluationOpen: { type: Boolean, default: false },
            maxTeamSize: { type: Number, default: 8 },
            mealSlots: { type: [String], default: ["lunch", "tea"] },
            allowJuryEdit: { type: Boolean, default: false },
        },
    },
    { timestamps: true }
);

EventSchema.index({ year: 1, status: 1 });

export const Event: Model<IEvent> =
    mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

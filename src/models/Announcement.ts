import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnnouncementDocument extends Document {
    title: string;
    content: string;
    category: "general" | "accommodation" | "food" | "commute" | "venue" | "jury";
    priority: "low" | "medium" | "high";
    createdBy: mongoose.Types.ObjectId;
    createdByName: string;
    isActive: boolean;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncementDocument>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        category: {
            type: String,
            enum: ["general", "accommodation", "food", "commute", "venue", "jury"],
            default: "general",
            index: true,
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        createdByName: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        expiresAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
AnnouncementSchema.index({ category: 1, isActive: 1 });
AnnouncementSchema.index({ createdAt: -1 });
AnnouncementSchema.index({ priority: 1 });

export const Announcement: Model<IAnnouncementDocument> =
    mongoose.models.Announcement ||
    mongoose.model<IAnnouncementDocument>("Announcement", AnnouncementSchema);

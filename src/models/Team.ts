import mongoose, { Schema, Document, Model } from "mongoose";
import { ProjectName, ProjectCode, PROJECT_NAMES, PROJECT_CODES } from "@/types";

export interface IGuideSubdoc {
    name: string;
    email: string;
    phone: string;
}

export interface ITeamDocument extends Document {
    teamCode: string;
    projectName: ProjectName;
    projectCode: ProjectCode;
    guide: IGuideSubdoc;
    memberCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const GuideSchema = new Schema<IGuideSubdoc>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { _id: false }
);

const TeamSchema = new Schema<ITeamDocument>(
    {
        teamCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            index: true,
        },
        projectName: {
            type: String,
            enum: PROJECT_NAMES,
            required: true,
        },
        projectCode: {
            type: String,
            enum: PROJECT_CODES,
            required: true,
        },
        guide: {
            type: GuideSchema,
            required: true,
        },
        memberCount: {
            type: Number,
            required: true,
            min: 1,
            max: 8,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
TeamSchema.index({ projectCode: 1 });
TeamSchema.index({ createdAt: -1 });

export const Team: Model<ITeamDocument> =
    mongoose.models.Team || mongoose.model<ITeamDocument>("Team", TeamSchema);

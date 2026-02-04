import mongoose, { Schema, Document, Model } from "mongoose";

export type SubmissionStatus = "draft" | "submitted" | "locked" | "sent_back";

export interface IRating {
    questionId: mongoose.Types.ObjectId;
    questionText: string;
    score: number;
    maxScore: number;
    comment?: string;
}

export interface IEvaluationSubmission extends Document {
    _id: mongoose.Types.ObjectId;
    eventId: mongoose.Types.ObjectId;
    teamId: mongoose.Types.ObjectId;
    teamCode: string;
    projectName: string;
    juryUserId: mongoose.Types.ObjectId;
    juryName: string;
    juryEmail: string;
    status: SubmissionStatus;
    ratings: IRating[];
    overallComment?: string;
    totalScore: number;
    maxPossibleScore: number;
    weightedScore: number;
    submittedAt?: Date;
    lockedAt?: Date;
    sentBackAt?: Date;
    sentBackReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const EvaluationSubmissionSchema = new Schema<IEvaluationSubmission>(
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
        teamCode: { type: String, required: true },
        projectName: { type: String, required: true },
        juryUserId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        juryName: { type: String, required: true },
        juryEmail: { type: String, required: true, lowercase: true },
        status: {
            type: String,
            enum: ["draft", "submitted", "locked", "sent_back"],
            default: "draft",
            index: true,
        },
        ratings: [
            {
                questionId: { type: Schema.Types.ObjectId, ref: "EvaluationQuestion" },
                questionText: { type: String },
                score: { type: Number, default: 0 },
                maxScore: { type: Number, default: 10 },
                comment: { type: String },
            },
        ],
        overallComment: { type: String },
        totalScore: { type: Number, default: 0 },
        maxPossibleScore: { type: Number, default: 0 },
        weightedScore: { type: Number, default: 0 },
        submittedAt: { type: Date },
        lockedAt: { type: Date },
        sentBackAt: { type: Date },
        sentBackReason: { type: String },
    },
    { timestamps: true }
);

// Unique: one submission per jury per team
EvaluationSubmissionSchema.index(
    { juryUserId: 1, teamId: 1 },
    { unique: true }
);
EvaluationSubmissionSchema.index({ eventId: 1, status: 1 });
EvaluationSubmissionSchema.index({ eventId: 1, teamId: 1 });

export const EvaluationSubmission: Model<IEvaluationSubmission> =
    mongoose.models.EvaluationSubmission ||
    mongoose.model<IEvaluationSubmission>(
        "EvaluationSubmission",
        EvaluationSubmissionSchema
    );

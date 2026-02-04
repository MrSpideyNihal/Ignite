import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRatingSubdoc {
    questionId: mongoose.Types.ObjectId;
    questionText: string;
    score: number;
    comment?: string;
}

export interface IEvaluationSubmissionDocument extends Document {
    teamId: mongoose.Types.ObjectId;
    teamCode: string;
    projectName: string;
    projectCode: string;
    juryMemberId: mongoose.Types.ObjectId;
    juryMemberName: string;
    juryMemberEmail: string;
    ratings: IRatingSubdoc[];
    overallComment?: string;
    totalScore: number;
    maxPossibleScore: number;
    isLocked: boolean;
    lockedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const RatingSchema = new Schema<IRatingSubdoc>(
    {
        questionId: {
            type: Schema.Types.ObjectId,
            ref: "EvaluationQuestion",
            required: true,
        },
        questionText: {
            type: String,
            required: true,
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 10,
        },
        comment: {
            type: String,
            trim: true,
        },
    },
    { _id: false }
);

const EvaluationSubmissionSchema = new Schema<IEvaluationSubmissionDocument>(
    {
        teamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: true,
            index: true,
        },
        teamCode: {
            type: String,
            required: true,
            uppercase: true,
        },
        projectName: {
            type: String,
            required: true,
        },
        projectCode: {
            type: String,
            required: true,
        },
        juryMemberId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        juryMemberName: {
            type: String,
            required: true,
        },
        juryMemberEmail: {
            type: String,
            required: true,
        },
        ratings: [RatingSchema],
        overallComment: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
        totalScore: {
            type: Number,
            required: true,
            default: 0,
        },
        maxPossibleScore: {
            type: Number,
            required: true,
            default: 0,
        },
        isLocked: {
            type: Boolean,
            default: false,
        },
        lockedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for unique jury-team combination
EvaluationSubmissionSchema.index(
    { teamId: 1, juryMemberId: 1 },
    { unique: true }
);
EvaluationSubmissionSchema.index({ isLocked: 1 });
EvaluationSubmissionSchema.index({ teamCode: 1 });

export const EvaluationSubmission: Model<IEvaluationSubmissionDocument> =
    mongoose.models.EvaluationSubmission ||
    mongoose.model<IEvaluationSubmissionDocument>(
        "EvaluationSubmission",
        EvaluationSubmissionSchema
    );

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEvaluationQuestionDocument extends Document {
    question: string;
    description?: string;
    maxScore: number;
    order: number;
    category?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const EvaluationQuestionSchema = new Schema<IEvaluationQuestionDocument>(
    {
        question: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        maxScore: {
            type: Number,
            required: true,
            min: 1,
            max: 10,
            default: 10,
        },
        order: {
            type: Number,
            required: true,
            default: 0,
        },
        category: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
EvaluationQuestionSchema.index({ isActive: 1, order: 1 });

export const EvaluationQuestion: Model<IEvaluationQuestionDocument> =
    mongoose.models.EvaluationQuestion ||
    mongoose.model<IEvaluationQuestionDocument>(
        "EvaluationQuestion",
        EvaluationQuestionSchema
    );

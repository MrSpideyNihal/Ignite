import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEvaluationQuestion extends Document {
    _id: mongoose.Types.ObjectId;
    eventId: mongoose.Types.ObjectId;
    question: string;
    description?: string;
    maxScore: number;
    weightage: number;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const EvaluationQuestionSchema = new Schema<IEvaluationQuestion>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: true,
            index: true,
        },
        question: { type: String, required: true },
        description: { type: String },
        maxScore: { type: Number, default: 10 },
        weightage: { type: Number, default: 1 },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

EvaluationQuestionSchema.index({ eventId: 1, isActive: 1, order: 1 });

export const EvaluationQuestion: Model<IEvaluationQuestion> =
    mongoose.models.EvaluationQuestion ||
    mongoose.model<IEvaluationQuestion>("EvaluationQuestion", EvaluationQuestionSchema);

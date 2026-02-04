import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICommuteScheduleDocument extends Document {
    busNumber: string;
    busColor: string;
    route: string;
    stops: string[];
    departureTime: string;
    arrivalTime: string;
    date: Date;
    capacity: number;
    isActive: boolean;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CommuteScheduleSchema = new Schema<ICommuteScheduleDocument>(
    {
        busNumber: {
            type: String,
            required: true,
            trim: true,
        },
        busColor: {
            type: String,
            required: true,
            trim: true,
        },
        route: {
            type: String,
            required: true,
            trim: true,
        },
        stops: [
            {
                type: String,
                trim: true,
            },
        ],
        departureTime: {
            type: String,
            required: true,
        },
        arrivalTime: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
            index: true,
        },
        capacity: {
            type: Number,
            required: true,
            min: 1,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
CommuteScheduleSchema.index({ date: 1, isActive: 1 });
CommuteScheduleSchema.index({ busNumber: 1 });

export const CommuteSchedule: Model<ICommuteScheduleDocument> =
    mongoose.models.CommuteSchedule ||
    mongoose.model<ICommuteScheduleDocument>(
        "CommuteSchedule",
        CommuteScheduleSchema
    );

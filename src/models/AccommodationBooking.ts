import mongoose, { Schema, Document, Model } from "mongoose";
import { RoomType, FoodPreference } from "@/types";

export interface IAccommodationBookingDocument extends Document {
    teamId: mongoose.Types.ObjectId;
    teamCode: string;
    checkInDate: Date;
    checkOutDate: Date;
    roomType: RoomType;
    memberIds: mongoose.Types.ObjectId[];
    foodRequired: boolean;
    foodPreference?: FoodPreference;
    totalMembers: number;
    status: "pending" | "confirmed" | "cancelled";
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AccommodationBookingSchema = new Schema<IAccommodationBookingDocument>(
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
        checkInDate: {
            type: Date,
            required: true,
        },
        checkOutDate: {
            type: Date,
            required: true,
        },
        roomType: {
            type: String,
            enum: ["dorm", "suite"],
            required: true,
        },
        memberIds: [
            {
                type: Schema.Types.ObjectId,
                ref: "Member",
            },
        ],
        foodRequired: {
            type: Boolean,
            default: false,
        },
        foodPreference: {
            type: String,
            enum: ["veg", "non-veg"],
        },
        totalMembers: {
            type: Number,
            required: true,
            min: 1,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled"],
            default: "pending",
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
AccommodationBookingSchema.index({ teamCode: 1 });
AccommodationBookingSchema.index({ checkInDate: 1, checkOutDate: 1 });
AccommodationBookingSchema.index({ status: 1 });
AccommodationBookingSchema.index({ roomType: 1 });

export const AccommodationBooking: Model<IAccommodationBookingDocument> =
    mongoose.models.AccommodationBooking ||
    mongoose.model<IAccommodationBookingDocument>(
        "AccommodationBooking",
        AccommodationBookingSchema
    );

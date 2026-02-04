import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVenueInfoDocument extends Document {
    name: string;
    address: string;
    description: string;
    mapUrl?: string;
    mapEmbedUrl?: string;
    contactPhone?: string;
    contactEmail?: string;
    facilities: string[];
    images: string[];
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const VenueInfoSchema = new Schema<IVenueInfoDocument>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        mapUrl: {
            type: String,
            trim: true,
        },
        mapEmbedUrl: {
            type: String,
            trim: true,
        },
        contactPhone: {
            type: String,
            trim: true,
        },
        contactEmail: {
            type: String,
            trim: true,
            lowercase: true,
        },
        facilities: [
            {
                type: String,
                trim: true,
            },
        ],
        images: [
            {
                type: String,
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
VenueInfoSchema.index({ isActive: 1, order: 1 });

export const VenueInfo: Model<IVenueInfoDocument> =
    mongoose.models.VenueInfo ||
    mongoose.model<IVenueInfoDocument>("VenueInfo", VenueInfoSchema);

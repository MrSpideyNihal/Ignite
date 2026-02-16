import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPasswordResetToken extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    token: string;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            index: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },
        used: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Auto-delete expired tokens after 2 hours
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 7200 });

export const PasswordResetToken: Model<IPasswordResetToken> =
    mongoose.models.PasswordResetToken ||
    mongoose.model<IPasswordResetToken>("PasswordResetToken", PasswordResetTokenSchema);

import mongoose, { Schema, Document, Model } from "mongoose";

export type GlobalRole = "super_admin" | "user";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    name: string;
    image?: string;
    passwordHash?: string; // bcrypt hash, only for email/password users
    globalRole: GlobalRole;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },
        name: { type: String, required: true },
        image: { type: String },
        passwordHash: { type: String }, // Optional, for email/password auth
        globalRole: {
            type: String,
            enum: ["super_admin", "user"],
            default: "user",
        },
    },
    { timestamps: true }
);

export const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

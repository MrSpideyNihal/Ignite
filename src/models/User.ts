import mongoose, { Schema, Document, Model } from "mongoose";

export type GlobalRole = "super_admin" | "user";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    name: string;
    image?: string;
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

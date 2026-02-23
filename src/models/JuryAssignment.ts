import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJuryAssignment extends Document {
    _id: mongoose.Types.ObjectId;
    eventId: mongoose.Types.ObjectId;
    juryUserId: mongoose.Types.ObjectId;
    juryEmail: string;
    juryName: string;
    teamId: mongoose.Types.ObjectId;
    teamCode: string;
    createdAt: Date;
    updatedAt: Date;
}

const JuryAssignmentSchema = new Schema<IJuryAssignment>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: true,
            index: true,
        },
        juryUserId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        juryEmail: { type: String, required: true, lowercase: true },
        juryName: { type: String, required: true },
        teamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: true,
            index: true,
        },
        teamCode: { type: String, required: true },
    },
    { timestamps: true }
);

// Unique: one jury member can only be assigned to a team once
JuryAssignmentSchema.index({ juryUserId: 1, teamId: 1 }, { unique: true });
JuryAssignmentSchema.index({ eventId: 1, juryUserId: 1 });

export const JuryAssignment: Model<IJuryAssignment> =
    mongoose.models.JuryAssignment ||
    mongoose.model<IJuryAssignment>("JuryAssignment", JuryAssignmentSchema);

// Drop stale sole-field unique indexes that block multi-judge assignment.
// Only the compound { juryUserId, teamId } should be unique.
const _jaG = globalThis as Record<string, unknown>;
if (!_jaG.__jaIndexCleaned) {
    _jaG.__jaIndexCleaned = true;
    JuryAssignment.collection.indexes().then((idxs) => {
        for (const idx of idxs) {
            const keys = Object.keys(idx.key);
            if (
                idx.unique &&
                keys.length === 1 &&
                (keys[0] === "teamId" || keys[0] === "juryUserId")
            ) {
                JuryAssignment.collection
                    .dropIndex(idx.name!)
                    .then(() => console.log(`Dropped stale unique index ${idx.name} on juryassignments`))
                    .catch(() => {});
            }
        }
    }).catch(() => {});
}

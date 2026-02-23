"use server";

import { connectToDatabase } from "@/lib/mongodb";
import {
    EvaluationQuestion,
    JuryAssignment,
    EvaluationSubmission,
    Team,
    User,
    EventRole,
} from "@/models";
import { requireEventRole, getCurrentUser } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { ActionState } from "@/types";
import mongoose from "mongoose";

/* ── one-shot stale-index cleanup (per cold-start) ── */
let _indexesCleanedUp = false;

async function _dropStaleIndexesOnce() {
    if (_indexesCleanedUp) return;
    _indexesCleanedUp = true;

    // Known stale index names from previous schema versions
    const staleIndexes: { collection: string; indexName: string }[] = [
        { collection: "evaluationsubmissions", indexName: "teamId_1_juryMemberId_1" },
        { collection: "juryassignments", indexName: "teamId_1_juryMemberId_1" },
        // Also try singular names in case Mongoose used different collection naming
        { collection: "evaluationsubmissions", indexName: "juryMemberId_1_teamId_1" },
        { collection: "juryassignments", indexName: "juryMemberId_1_teamId_1" },
        // Single-field stale indexes
        { collection: "juryassignments", indexName: "teamId_1" },
        { collection: "juryassignments", indexName: "juryUserId_1" },
        { collection: "evaluationsubmissions", indexName: "teamId_1" },
        { collection: "evaluationsubmissions", indexName: "juryUserId_1" },
    ];

    const db = mongoose.connection.db;
    if (!db) return;

    for (const { collection, indexName } of staleIndexes) {
        try {
            await db.collection(collection).dropIndex(indexName);
            console.log(`Dropped stale index ${indexName} from ${collection}`);
        } catch {
            // Index doesn't exist — fine
        }
    }
}

/**
 * Core helper: assign ONE jury user to a list of teams.
 * No auth check — callers must verify permissions.
 * Returns { assigned, failed, lastError }.
 */
async function _assignJuryToTeamIds(
    eventId: string,
    juryUserId: string,
    juryEmail: string,
    juryName: string,
    teamIds: string[]
): Promise<{ assigned: number; failed: number; lastError: string }> {
    await _dropStaleIndexesOnce();

    let assigned = 0;
    let failed = 0;
    let lastError = "";

    for (const teamId of teamIds) {
        try {
            const team = await Team.findById(teamId).lean();
            if (!team) { failed++; lastError = `Team ${teamId} not found`; continue; }

            // Check if assignment already exists (avoids any unique index issues)
            const existingAssignment = await JuryAssignment.findOne({ juryUserId, teamId }).lean();
            if (!existingAssignment) {
                await JuryAssignment.create({
                    eventId,
                    juryUserId,
                    juryEmail,
                    juryName,
                    teamId,
                    teamCode: team.teamCode,
                });
            }

            const existingSubmission = await EvaluationSubmission.findOne({ juryUserId, teamId }).lean();
            if (!existingSubmission) {
                await EvaluationSubmission.create({
                    eventId,
                    teamId,
                    teamCode: team.teamCode,
                    projectName: team.projectName,
                    juryUserId,
                    juryName,
                    juryEmail,
                    status: "draft",
                    ratings: [],
                    totalScore: 0,
                    maxPossibleScore: 0,
                    weightedScore: 0,
                });
            }
            assigned++;
        } catch (err: unknown) {
            failed++;
            const msg = err instanceof Error ? err.message : String(err);
            lastError = msg;
            console.error(`Jury assign error [jury=${juryEmail}, team=${teamId}]: ${msg}`);
        }
    }

    return { assigned, failed, lastError };
}

// Get evaluation questions for an event
export async function getEventQuestions(eventId: string) {
    await connectToDatabase();

    const questions = await EvaluationQuestion.find({ eventId, isActive: true })
        .sort({ order: 1 })
        .lean();

    return questions.map((q) => ({
        _id: q._id.toString(),
        question: q.question,
        description: q.description,
        maxScore: q.maxScore,
        weightage: q.weightage,
        order: q.order,
    }));
}

// Create evaluation question (jury admin)
export async function createQuestion(
    eventId: string,
    data: {
        question: string;
        description?: string;
        maxScore: number;
        weightage: number;
    }
): Promise<ActionState> {
    await requireEventRole(eventId, ["jury_admin"]);

    try {
        await connectToDatabase();

        const lastQuestion = await EvaluationQuestion.findOne({ eventId })
            .sort({ order: -1 })
            .lean();
        const order = (lastQuestion?.order || 0) + 1;

        await EvaluationQuestion.create({
            eventId,
            ...data,
            order,
            isActive: true,
        });

        revalidatePath(`/${eventId}/jury`);
        return { success: true, message: "Question added" };
    } catch (error) {
        console.error("Error creating question:", error);
        return { success: false, message: "Failed to add question" };
    }
}

// Update question
export async function updateQuestion(
    eventId: string,
    questionId: string,
    data: Partial<{
        question: string;
        description: string;
        maxScore: number;
        weightage: number;
    }>
): Promise<ActionState> {
    await requireEventRole(eventId, ["jury_admin"]);

    try {
        await connectToDatabase();
        await EvaluationQuestion.findByIdAndUpdate(questionId, data);
        revalidatePath(`/${eventId}/jury`);
        return { success: true, message: "Question updated" };
    } catch (error) {
        console.error("Error updating question:", error);
        return { success: false, message: "Failed to update" };
    }
}

// Delete question
export async function deleteQuestion(
    eventId: string,
    questionId: string
): Promise<ActionState> {
    await requireEventRole(eventId, ["jury_admin"]);

    try {
        await connectToDatabase();
        await EvaluationQuestion.findByIdAndUpdate(questionId, { isActive: false });
        revalidatePath(`/${eventId}/jury`);
        return { success: true, message: "Question removed" };
    } catch (error) {
        console.error("Error deleting question:", error);
        return { success: false, message: "Failed to remove" };
    }
}

// Get jury members for an event
export async function getEventJuryMembers(eventId: string) {
    await connectToDatabase();

    const juryRoles = await EventRole.find({
        eventId,
        role: "jury_member",
    }).lean();

    const members = await Promise.all(
        juryRoles.map(async (role) => {
            const user = await User.findById(role.userId).lean();
            const assignmentCount = await JuryAssignment.countDocuments({
                eventId,
                juryUserId: role.userId,
            });
            const submittedCount = await EvaluationSubmission.countDocuments({
                eventId,
                juryUserId: role.userId,
                status: { $in: ["submitted", "locked"] },
            });

            return {
                _id: user?._id.toString() || "",
                email: user?.email || role.userEmail,
                name: user?.name || role.userEmail,
                assignmentCount,
                submittedCount,
            };
        })
    );

    return members;
}

// Assign jury member to teams
export async function assignJuryToTeams(
    eventId: string,
    juryUserId: string,
    teamIds: string[]
): Promise<ActionState> {
    await requireEventRole(eventId, ["jury_admin"]);

    try {
        await connectToDatabase();

        const user = await User.findById(juryUserId);
        if (!user) {
            return { success: false, message: "Jury member not found" };
        }

        const { assigned, failed, lastError } = await _assignJuryToTeamIds(
            eventId, juryUserId, user.email, user.name, teamIds
        );

        revalidatePath(`/${eventId}/jury`);
        if (failed > 0) {
            return { success: false, message: `Assigned ${assigned}, ${failed} failed: ${lastError}` };
        }
        return { success: true, message: `Assigned ${assigned} teams` };
    } catch (error) {
        console.error("Error assigning teams:", error);
        return { success: false, message: "Failed to assign teams" };
    }
}

// Assign all jury members to all approved teams
export async function assignAllJuryToAllTeams(eventId: string): Promise<ActionState> {
    await requireEventRole(eventId, ["jury_admin"]);

    try {
        await connectToDatabase();

        const juryRoles = await EventRole.find({ eventId, role: "jury_member" }).lean();
        if (!juryRoles.length) {
            return { success: false, message: "No jury members found for this event" };
        }

        const approvedTeams = await Team.find({ eventId, status: "approved" }).lean();
        if (!approvedTeams.length) {
            return { success: false, message: "No approved teams found for this event" };
        }

        const allTeamIds = approvedTeams.map((t) => t._id.toString());

        let totalAssigned = 0;
        let totalFailed = 0;
        let lastError = "";
        const skippedMembers: string[] = [];

        for (const role of juryRoles) {
            // Use findById (same approach as single-assignment) instead of email lookup
            const user = await User.findById(role.userId).lean();
            if (!user) {
                skippedMembers.push(role.userEmail);
                continue;
            }

            const { assigned, failed, lastError: err } = await _assignJuryToTeamIds(
                eventId, user._id.toString(), user.email, user.name, allTeamIds
            );
            totalAssigned += assigned;
            totalFailed += failed;
            if (err) lastError = err;
        }

        revalidatePath(`/${eventId}/jury`);

        const parts: string[] = [];
        parts.push(`${totalAssigned} pairs assigned`);
        if (totalFailed > 0) parts.push(`${totalFailed} failed`);
        if (skippedMembers.length > 0) parts.push(`${skippedMembers.length} members skipped (user not found)`);
        if (lastError) parts.push(`last error: ${lastError}`);

        const msg = `${juryRoles.length} judges × ${approvedTeams.length} teams — ${parts.join(", ")}`;
        return { success: totalFailed === 0, message: msg };
    } catch (error) {
        console.error("Error assigning all jury to all teams:", error);
        return { success: false, message: `Failed to assign all jury to all teams: ${error instanceof Error ? error.message : String(error)}` };
    }
}

// Get assignments for a jury member
export async function getJuryAssignments(eventId: string) {
    const user = await getCurrentUser();
    if (!user) return [];

    await connectToDatabase();

    const submissions = await EvaluationSubmission.find({
        eventId,
        juryUserId: user.id,
    }).lean();

    return submissions.map((s) => ({
        _id: s._id.toString(),
        teamId: s.teamId.toString(),
        teamCode: s.teamCode,
        projectName: s.projectName,
        status: s.status,
        totalScore: s.totalScore,
        maxPossibleScore: s.maxPossibleScore,
        submittedAt: s.submittedAt?.toISOString(),
    }));
}

// Save evaluation (draft)
export async function saveEvaluation(
    eventId: string,
    submissionId: string,
    ratings: Array<{
        questionId: string;
        questionText: string;
        score: number;
        maxScore: number;
        comment?: string;
    }>,
    overallComment?: string
): Promise<ActionState> {
    await requireEventRole(eventId, ["jury_member"]);
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated" };

    try {
        await connectToDatabase();

        const submission = await EvaluationSubmission.findById(submissionId);
        if (!submission) {
            return { success: false, message: "Submission not found" };
        }

        if (submission.juryUserId.toString() !== user.id) {
            return { success: false, message: "Not authorized" };
        }

        if (submission.status === "locked") {
            return { success: false, message: "Evaluation is locked" };
        }

        const totalScore = ratings.reduce((sum, r) => sum + r.score, 0);
        const maxPossible = ratings.reduce((sum, r) => sum + r.maxScore, 0);

        await EvaluationSubmission.findByIdAndUpdate(submissionId, {
            ratings,
            overallComment,
            totalScore,
            maxPossibleScore: maxPossible,
            status: "draft",
        });

        return { success: true, message: "Saved as draft" };
    } catch (error) {
        console.error("Error saving evaluation:", error);
        return { success: false, message: "Failed to save" };
    }
}

// Submit evaluation
export async function submitEvaluation(
    eventId: string,
    submissionId: string
): Promise<ActionState> {
    await requireEventRole(eventId, ["jury_member"]);
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated" };

    try {
        await connectToDatabase();

        const submission = await EvaluationSubmission.findById(submissionId);
        if (!submission) {
            return { success: false, message: "Submission not found" };
        }

        if (submission.juryUserId.toString() !== user.id) {
            return { success: false, message: "Not authorized" };
        }

        if (submission.status === "locked") {
            return { success: false, message: "Already locked" };
        }

        if (!submission.ratings || submission.ratings.length === 0) {
            return { success: false, message: "Please score all questions first" };
        }

        const hasAnyScore = submission.ratings.some((r: { score: number }) => r.score > 0);
        if (!hasAnyScore) {
            return { success: false, message: "Please add a score for at least one question before submitting" };
        }

        await EvaluationSubmission.findByIdAndUpdate(submissionId, {
            status: "submitted",
            submittedAt: new Date(),
        });

        revalidatePath(`/${eventId}/jury/evaluate`);
        return { success: true, message: "Evaluation submitted" };
    } catch (error) {
        console.error("Error submitting evaluation:", error);
        return { success: false, message: "Failed to submit" };
    }
}

// Lock all evaluations (jury admin)
export async function lockAllEvaluations(eventId: string): Promise<ActionState> {
    await requireEventRole(eventId, ["jury_admin"]);

    try {
        await connectToDatabase();

        await EvaluationSubmission.updateMany(
            { eventId, status: "submitted" },
            { status: "locked", lockedAt: new Date() }
        );

        revalidatePath(`/${eventId}/jury`);
        return { success: true, message: "All evaluations locked" };
    } catch (error) {
        console.error("Error locking:", error);
        return { success: false, message: "Failed to lock" };
    }
}

// Send back evaluation (jury admin)
export async function sendBackEvaluation(
    eventId: string,
    submissionId: string,
    reason: string
): Promise<ActionState> {
    await requireEventRole(eventId, ["jury_admin"]);

    try {
        await connectToDatabase();

        await EvaluationSubmission.findByIdAndUpdate(submissionId, {
            status: "sent_back",
            sentBackAt: new Date(),
            sentBackReason: reason,
        });

        revalidatePath(`/${eventId}/jury`);
        return { success: true, message: "Sent back for revision" };
    } catch (error) {
        console.error("Error sending back:", error);
        return { success: false, message: "Failed to send back" };
    }
}

// Get all submissions for event (jury admin)
export async function getAllSubmissions(eventId: string) {
    await connectToDatabase();

    const submissions = await EvaluationSubmission.find({ eventId })
        .sort({ teamCode: 1 })
        .lean();

    return submissions.map((s) => ({
        _id: s._id.toString(),
        teamCode: s.teamCode,
        projectName: s.projectName,
        juryName: s.juryName,
        juryEmail: s.juryEmail,
        status: s.status,
        totalScore: s.totalScore,
        maxPossibleScore: s.maxPossibleScore,
        submittedAt: s.submittedAt?.toISOString(),
    }));
}

// Get team scores summary
export async function getTeamScoresSummary(eventId: string) {
    await connectToDatabase();

    const submissions = await EvaluationSubmission.find({
        eventId,
        status: { $in: ["submitted", "locked"] },
    }).lean();

    // Group by team
    const teamScores: Record<
        string,
        { teamCode: string; projectName: string; scores: number[]; avg: number }
    > = {};

    for (const s of submissions) {
        const key = s.teamId.toString();
        if (!teamScores[key]) {
            teamScores[key] = {
                teamCode: s.teamCode,
                projectName: s.projectName,
                scores: [],
                avg: 0,
            };
        }
        teamScores[key].scores.push(s.totalScore);
    }

    // Calculate averages
    return Object.values(teamScores)
        .map((t) => ({
            ...t,
            avg: t.scores.reduce((a, b) => a + b, 0) / t.scores.length,
            evaluationCount: t.scores.length,
        }))
        .sort((a, b) => b.avg - a.avg);
}

// Jury admin: reopen a submitted/locked evaluation for jury member to re-edit
export async function allowEditSubmission(
    eventId: string,
    submissionId: string
): Promise<ActionState> {
    await requireEventRole(eventId, ["jury_admin"]);

    try {
        await connectToDatabase();

        const submission = await EvaluationSubmission.findById(submissionId);
        if (!submission) return { success: false, message: "Submission not found" };
        if (submission.status === "draft") return { success: false, message: "Already in draft state" };

        await EvaluationSubmission.findByIdAndUpdate(submissionId, { status: "draft" });

        revalidatePath(`/${eventId}/jury`);
        return { success: true, message: `Reopened for editing: ${submission.juryName} → ${submission.teamCode}` };
    } catch (error) {
        console.error("Error allowing edit:", error);
        return { success: false, message: "Failed to reopen submission" };
    }
}

// Get full per-question jury breakdown for Excel export
export async function getFullJuryBreakdown(eventId: string) {
    await requireEventRole(eventId, ["jury_admin"]);
    await connectToDatabase();

    const questions = await EvaluationQuestion.find({ eventId, isActive: true })
        .sort({ order: 1 })
        .lean();

    const submissions = await EvaluationSubmission.find({
        eventId,
        status: { $in: ["submitted", "locked"] },
    })
        .sort({ teamCode: 1, juryName: 1 })
        .lean();

    // Group by team
    const teamMap: Record<string, {
        teamCode: string;
        projectName: string;
        juryRows: Array<{
            juryName: string;
            scores: Record<string, number>;
            weightedScores: Record<string, number>;
            total: number;
        }>;
        avgWeightedScore: number;
    }> = {};

    for (const sub of submissions) {
        const teamKey = sub.teamId.toString();
        if (!teamMap[teamKey]) {
            teamMap[teamKey] = { teamCode: sub.teamCode, projectName: sub.projectName, juryRows: [], avgWeightedScore: 0 };
        }

        const scores: Record<string, number> = {};
        const weightedScores: Record<string, number> = {};
        let total = 0;

        for (const rating of sub.ratings || []) {
            const q = questions.find((q) => q._id.toString() === rating.questionId?.toString());
            const raw = rating.score ?? 0;
            const weightage = q?.weightage ?? 0;
            const maxScore = q?.maxScore ?? 10;
            const weighted = maxScore > 0 ? (raw / maxScore) * weightage : 0;

            scores[rating.questionId?.toString() ?? ""] = raw;
            weightedScores[rating.questionId?.toString() ?? ""] = Math.round(weighted * 100) / 100;
            total += weighted;
        }

        teamMap[teamKey].juryRows.push({ juryName: sub.juryName, scores, weightedScores, total: Math.round(total * 100) / 100 });
    }

    for (const team of Object.values(teamMap)) {
        if (team.juryRows.length > 0) {
            team.avgWeightedScore = Math.round(
                (team.juryRows.reduce((sum, r) => sum + r.total, 0) / team.juryRows.length) * 100
            ) / 100;
        }
    }

    return {
        questions: questions.map((q) => ({ _id: q._id.toString(), question: q.question, maxScore: q.maxScore, weightage: q.weightage })),
        teams: Object.values(teamMap).sort((a, b) => b.avgWeightedScore - a.avgWeightedScore),
    };
}


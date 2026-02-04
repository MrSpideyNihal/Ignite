"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { EvaluationQuestion, EvaluationSubmission, Team, User } from "@/models";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as XLSX from "xlsx";

const QuestionSchema = z.object({
    question: z.string().min(5, "Question is required"),
    description: z.string().optional(),
    maxScore: z.number().min(1).max(10).default(10),
    order: z.number().default(0),
});

export interface JuryActionState {
    success: boolean;
    message: string;
}

// Add evaluation question
export async function addEvaluationQuestion(
    prevState: JuryActionState,
    formData: FormData
): Promise<JuryActionState> {
    const session = await auth();
    const userRole = (session?.user as { role?: string })?.role;

    if (!session?.user || (userRole !== "super_admin" && userRole !== "jury_admin")) {
        return { success: false, message: "Not authorized" };
    }

    try {
        await connectToDatabase();

        const data = {
            question: (formData.get("question") as string).trim(),
            description: (formData.get("description") as string)?.trim() || "",
            maxScore: parseInt(formData.get("maxScore") as string) || 10,
            order: parseInt(formData.get("order") as string) || 0,
        };

        const validation = QuestionSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, message: validation.error.errors[0].message };
        }

        await EvaluationQuestion.create({
            ...data,
            isActive: true,
        });

        revalidatePath("/jury");
        revalidatePath("/jury/questions");

        return { success: true, message: "Question added successfully" };
    } catch (error) {
        console.error("Error adding question:", error);
        return { success: false, message: "An error occurred" };
    }
}

// Get all evaluation questions
export async function getEvaluationQuestions() {
    try {
        await connectToDatabase();

        const questions = await EvaluationQuestion.find({ isActive: true })
            .sort({ order: 1 })
            .lean();

        return questions.map((q) => ({
            _id: q._id.toString(),
            question: q.question,
            description: q.description,
            maxScore: q.maxScore,
            order: q.order,
        }));
    } catch (error) {
        console.error("Error fetching questions:", error);
        return [];
    }
}

// Delete question
export async function deleteEvaluationQuestion(id: string): Promise<JuryActionState> {
    const session = await auth();
    const userRole = (session?.user as { role?: string })?.role;

    if (!session?.user || (userRole !== "super_admin" && userRole !== "jury_admin")) {
        return { success: false, message: "Not authorized" };
    }

    try {
        await connectToDatabase();
        await EvaluationQuestion.findByIdAndUpdate(id, { isActive: false });
        revalidatePath("/jury/questions");
        return { success: true, message: "Question deleted" };
    } catch (error) {
        console.error("Error deleting question:", error);
        return { success: false, message: "An error occurred" };
    }
}

// Assign team to jury member
export async function assignTeamToJury(
    juryMemberId: string,
    teamCode: string
): Promise<JuryActionState> {
    const session = await auth();
    const userRole = (session?.user as { role?: string })?.role;

    if (!session?.user || (userRole !== "super_admin" && userRole !== "jury_admin")) {
        return { success: false, message: "Not authorized" };
    }

    try {
        await connectToDatabase();

        const jury = await User.findById(juryMemberId);
        if (!jury || jury.role !== "jury_member") {
            return { success: false, message: "Jury member not found" };
        }

        const team = await Team.findOne({ teamCode: teamCode.toUpperCase() });
        if (!team) {
            return { success: false, message: "Team not found" };
        }

        if (!jury.assignedTeams.includes(team.teamCode)) {
            jury.assignedTeams.push(team.teamCode);
            await jury.save();
        }

        revalidatePath("/jury");
        revalidatePath("/jury/evaluate");

        return { success: true, message: `Team ${teamCode} assigned to ${jury.name}` };
    } catch (error) {
        console.error("Error assigning team:", error);
        return { success: false, message: "An error occurred" };
    }
}

// Get jury members
export async function getJuryMembers() {
    try {
        await connectToDatabase();

        const members = await User.find({ role: "jury_member" }).lean();

        return members.map((m) => ({
            _id: m._id.toString(),
            name: m.name,
            email: m.email,
            assignedTeams: m.assignedTeams || [],
        }));
    } catch (error) {
        console.error("Error fetching jury members:", error);
        return [];
    }
}

// Submit evaluation
export async function submitEvaluation(
    prevState: JuryActionState,
    formData: FormData
): Promise<JuryActionState> {
    const session = await auth();
    const userRole = (session?.user as { role?: string })?.role;
    const userId = (session?.user as { id?: string })?.id;

    if (!session?.user || userRole !== "jury_member") {
        return { success: false, message: "Not authorized" };
    }

    try {
        await connectToDatabase();

        const teamCode = formData.get("teamCode") as string;
        const overallComment = formData.get("overallComment") as string;
        const isLock = formData.get("lock") === "true";

        const team = await Team.findOne({ teamCode: teamCode.toUpperCase() });
        if (!team) {
            return { success: false, message: "Team not found" };
        }

        const questions = await EvaluationQuestion.find({ isActive: true }).lean();

        const ratings = questions.map((q) => ({
            questionId: q._id,
            questionText: q.question,
            score: parseInt(formData.get(`rating_${q._id}`) as string) || 0,
            comment: (formData.get(`comment_${q._id}`) as string) || "",
        }));

        const totalScore = ratings.reduce((sum, r) => sum + r.score, 0);
        const maxPossibleScore = questions.reduce((sum, q) => sum + q.maxScore, 0);

        // Check if submission exists
        let submission = await EvaluationSubmission.findOne({
            teamId: team._id,
            juryMemberId: userId,
        });

        if (submission) {
            if (submission.isLocked) {
                return { success: false, message: "This evaluation has been locked" };
            }

            submission.ratings = ratings;
            submission.overallComment = overallComment;
            submission.totalScore = totalScore;
            submission.isLocked = isLock;
            if (isLock) submission.lockedAt = new Date();
            await submission.save();
        } else {
            submission = await EvaluationSubmission.create({
                teamId: team._id,
                teamCode: team.teamCode,
                projectName: team.projectName,
                projectCode: team.projectCode,
                juryMemberId: userId,
                juryMemberName: session.user.name || "Jury",
                juryMemberEmail: session.user.email || "",
                ratings,
                overallComment,
                totalScore,
                maxPossibleScore,
                isLocked: isLock,
                lockedAt: isLock ? new Date() : undefined,
            });
        }

        revalidatePath("/jury/evaluate");
        revalidatePath("/jury/submissions");

        return {
            success: true,
            message: isLock ? "Evaluation submitted and locked" : "Evaluation saved",
        };
    } catch (error) {
        console.error("Error submitting evaluation:", error);
        return { success: false, message: "An error occurred" };
    }
}

// Get submissions for jury admin
export async function getAllSubmissions() {
    try {
        await connectToDatabase();

        const submissions = await EvaluationSubmission.find()
            .sort({ teamCode: 1, juryMemberName: 1 })
            .lean();

        return submissions.map((s) => ({
            _id: s._id.toString(),
            teamCode: s.teamCode,
            projectName: s.projectName,
            juryMemberName: s.juryMemberName,
            totalScore: s.totalScore,
            maxPossibleScore: s.maxPossibleScore,
            isLocked: s.isLocked,
            createdAt: s.createdAt,
        }));
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return [];
    }
}

// Get jury member's evaluations
export async function getMyEvaluations() {
    const session = await auth();
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) return { assignedTeams: [], submissions: [] };

    try {
        await connectToDatabase();

        const user = await User.findById(userId).lean();
        const submissions = await EvaluationSubmission.find({ juryMemberId: userId }).lean();

        // Get team details for assigned teams
        const assignedTeamCodes = user?.assignedTeams || [];
        const teams = await Team.find({ teamCode: { $in: assignedTeamCodes } }).lean();

        return {
            assignedTeams: teams.map((t) => ({
                _id: t._id.toString(),
                teamCode: t.teamCode,
                projectName: t.projectName,
                projectCode: t.projectCode,
            })),
            submissions: submissions.map((s) => ({
                _id: s._id.toString(),
                teamCode: s.teamCode,
                totalScore: s.totalScore,
                maxPossibleScore: s.maxPossibleScore,
                isLocked: s.isLocked,
            })),
        };
    } catch (error) {
        console.error("Error fetching evaluations:", error);
        return { assignedTeams: [], submissions: [] };
    }
}

// Export evaluations to Excel
export async function exportEvaluationsToExcel(): Promise<{ success: boolean; data?: string; message?: string }> {
    const session = await auth();
    const userRole = (session?.user as { role?: string })?.role;

    if (!session?.user || (userRole !== "super_admin" && userRole !== "jury_admin")) {
        return { success: false, message: "Not authorized" };
    }

    try {
        await connectToDatabase();

        const submissions = await EvaluationSubmission.find().lean();

        const data = submissions.map((s) => ({
            "Team Code": s.teamCode,
            "Project Name": s.projectName,
            "Jury Member": s.juryMemberName,
            "Total Score": s.totalScore,
            "Max Score": s.maxPossibleScore,
            "Percentage": `${Math.round((s.totalScore / s.maxPossibleScore) * 100)}%`,
            "Status": s.isLocked ? "Locked" : "Draft",
            "Comment": s.overallComment || "",
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Evaluations");

        const buffer = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

        return { success: true, data: buffer };
    } catch (error) {
        console.error("Error exporting:", error);
        return { success: false, message: "Export failed" };
    }
}

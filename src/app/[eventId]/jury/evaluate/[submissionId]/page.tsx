import { requireEventRole } from "@/lib/auth-utils";
import { getEvent } from "@/app/actions/event";
import { getEventQuestions } from "@/app/actions/jury";
import { EvaluationSubmission } from "@/models";
import { connectToDatabase } from "@/lib/mongodb";
import { notFound, redirect } from "next/navigation";
import EvaluationForm from "./EvaluationForm";

export const dynamic = "force-dynamic";

interface Props {
    params: { eventId: string; submissionId: string };
}

export default async function EvaluateTeamPage({ params }: Props) {
    const { user } = await requireEventRole(params.eventId, ["jury_member"]);

    const event = await getEvent(params.eventId);
    if (!event) notFound();

    await connectToDatabase();
    const submission = await EvaluationSubmission.findById(params.submissionId).lean();

    if (!submission) notFound();

    // Check ownership
    if (submission.juryUserId.toString() !== user.id) {
        redirect("/unauthorized");
    }

    // Check if locked
    if (submission.status === "locked") {
        redirect(`/${params.eventId}/jury/evaluate`);
    }

    const questions = await getEventQuestions(params.eventId);

    // Prepare initial ratings
    const existingRatings = submission.ratings || [];
    const ratings = questions.map((q) => {
        const existing = existingRatings.find(
            (r) => r.questionId?.toString() === q._id
        );
        return {
            questionId: q._id,
            questionText: q.question,
            score: existing?.score || 0,
            maxScore: q.maxScore,
            comment: existing?.comment || "",
        };
    });

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom max-w-3xl">
                {/* Header */}
                <div className="mb-8">
                    <p className="text-sm text-gray-500 mb-2">{event.name} • Evaluation</p>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {submission.teamCode}
                    </h1>
                    <p className="text-gray-500">{submission.projectName}</p>
                </div>

                {submission.status === "sent_back" && submission.sentBackReason && (
                    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-500 rounded-lg">
                        <p className="font-medium text-yellow-800 dark:text-yellow-200">
                            ⚠️ Sent back for revision
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            {submission.sentBackReason}
                        </p>
                    </div>
                )}

                <EvaluationForm
                    eventId={params.eventId}
                    submissionId={params.submissionId}
                    questions={questions}
                    initialRatings={ratings}
                    initialComment={submission.overallComment || ""}
                    status={submission.status}
                />
            </div>
        </div>
    );
}

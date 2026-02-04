"use client";

import { useState, useTransition } from "react";
import { saveEvaluation, submitEvaluation } from "@/app/actions/jury";
import { Button, Textarea } from "@/components/forms";
import { Card, CardHeader, CardContent, Badge } from "@/components/ui";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Question {
    _id: string;
    question: string;
    description?: string;
    maxScore: number;
    weightage: number;
}

interface Rating {
    questionId: string;
    questionText: string;
    score: number;
    maxScore: number;
    comment: string;
}

interface Props {
    eventId: string;
    submissionId: string;
    questions: Question[];
    initialRatings: Rating[];
    initialComment: string;
    status: string;
}

export default function EvaluationForm({
    eventId,
    submissionId,
    questions,
    initialRatings,
    initialComment,
    status,
}: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [ratings, setRatings] = useState<Rating[]>(initialRatings);
    const [overallComment, setOverallComment] = useState(initialComment);

    const updateScore = (questionId: string, score: number) => {
        setRatings(
            ratings.map((r) => (r.questionId === questionId ? { ...r, score } : r))
        );
    };

    const updateComment = (questionId: string, comment: string) => {
        setRatings(
            ratings.map((r) => (r.questionId === questionId ? { ...r, comment } : r))
        );
    };

    const totalScore = ratings.reduce((sum, r) => sum + r.score, 0);
    const maxScore = ratings.reduce((sum, r) => sum + r.maxScore, 0);

    const handleSave = async () => {
        startTransition(async () => {
            const result = await saveEvaluation(eventId, submissionId, ratings, overallComment);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleSubmit = async () => {
        if (!confirm("Submit this evaluation? You won't be able to edit after submission.")) return;

        startTransition(async () => {
            // Save first
            await saveEvaluation(eventId, submissionId, ratings, overallComment);

            // Then submit
            const result = await submitEvaluation(eventId, submissionId);
            if (result.success) {
                toast.success(result.message);
                router.push(`/${eventId}/jury/evaluate`);
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Questions */}
            {questions.map((q, index) => {
                const rating = ratings.find((r) => r.questionId === q._id);
                const score = rating?.score || 0;

                return (
                    <Card key={q._id}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {index + 1}. {q.question}
                                    </p>
                                    {q.description && (
                                        <p className="text-sm text-gray-500 mt-1">{q.description}</p>
                                    )}
                                </div>
                                <Badge variant="primary">Max: {q.maxScore}</Badge>
                            </div>

                            {/* Score Slider */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-500">Score</span>
                                    <span className="text-lg font-bold text-primary-600">
                                        {score} / {q.maxScore}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={q.maxScore}
                                    value={score}
                                    onChange={(e) => updateScore(q._id, parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>0</span>
                                    <span>{q.maxScore / 2}</span>
                                    <span>{q.maxScore}</span>
                                </div>
                            </div>

                            {/* Comment */}
                            <Textarea
                                value={rating?.comment || ""}
                                onChange={(e) => updateComment(q._id, e.target.value)}
                                placeholder="Add a comment (optional)"
                                rows={2}
                            />
                        </CardContent>
                    </Card>
                );
            })}

            {/* Overall Comment */}
            <Card>
                <CardHeader title="Overall Comments" />
                <CardContent>
                    <Textarea
                        value={overallComment}
                        onChange={(e) => setOverallComment(e.target.value)}
                        placeholder="Any overall feedback for this project..."
                        rows={3}
                    />
                </CardContent>
            </Card>

            {/* Summary & Actions */}
            <Card className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-sm text-gray-500">Total Score</p>
                            <p className="text-3xl font-bold gradient-text">
                                {totalScore} / {maxScore}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Percentage</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {maxScore > 0 ? ((totalScore / maxScore) * 100).toFixed(1) : 0}%
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button onClick={handleSave} loading={isPending} variant="outline" className="flex-1">
                            💾 Save Draft
                        </Button>
                        <Button onClick={handleSubmit} loading={isPending} className="flex-1">
                            ✓ Submit Evaluation
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Back Link */}
            <div className="text-center">
                <button
                    onClick={() => router.push(`/${eventId}/jury/evaluate`)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ← Back to My Evaluations
                </button>
            </div>
        </div>
    );
}

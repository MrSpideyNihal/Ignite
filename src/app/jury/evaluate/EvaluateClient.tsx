"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { submitEvaluation, JuryActionState } from "@/app/actions/jury";
import { Input, Textarea, Button } from "@/components/forms";
import { Card, CardHeader, CardContent, Alert, Badge } from "@/components/ui";
import Link from "next/link";

interface Question {
    _id: string;
    question: string;
    description?: string;
    maxScore: number;
}

interface TeamInfo {
    _id: string;
    teamCode: string;
    projectName: string;
    projectCode: string;
}

interface SubmissionInfo {
    _id: string;
    teamCode: string;
    totalScore: number;
    maxPossibleScore: number;
    isLocked: boolean;
}

interface EvaluateClientProps {
    assignedTeams: TeamInfo[];
    submissions: SubmissionInfo[];
    questions: Question[];
}

function SubmitButton({ isLock }: { isLock: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" loading={pending} className="flex-1">
            {isLock ? "Submit & Lock" : "Save Draft"}
        </Button>
    );
}

export default function EvaluateClient({
    assignedTeams,
    submissions,
    questions,
}: EvaluateClientProps) {
    const [selectedTeam, setSelectedTeam] = useState<TeamInfo | null>(null);
    const [lockOnSubmit, setLockOnSubmit] = useState(false);

    const initialState: JuryActionState = { success: false, message: "" };
    const [state, formAction] = useFormState(submitEvaluation, initialState);

    const getSubmissionForTeam = (teamCode: string) =>
        submissions.find((s) => s.teamCode === teamCode);

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">Evaluate Projects</h1>
                    <p className="page-subtitle">Rate and review assigned projects</p>
                </div>

                {!selectedTeam ? (
                    /* Team Selection */
                    <Card>
                        <CardHeader title="Assigned Teams" subtitle="Select a team to evaluate" />
                        <CardContent>
                            {assignedTeams.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {assignedTeams.map((team) => {
                                        const submission = getSubmissionForTeam(team.teamCode);
                                        return (
                                            <button
                                                key={team._id}
                                                onClick={() => !submission?.isLocked && setSelectedTeam(team)}
                                                className={`p-6 text-left rounded-xl border transition-all ${submission?.isLocked
                                                        ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed"
                                                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-primary-500 hover:shadow-lg"
                                                    }`}
                                                disabled={submission?.isLocked}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="font-mono font-bold text-primary-500">
                                                        {team.teamCode}
                                                    </span>
                                                    {submission && (
                                                        <Badge variant={submission.isLocked ? "success" : "warning"}>
                                                            {submission.isLocked ? "Locked" : "Draft"}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {team.projectName}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">{team.projectCode}</p>
                                                {submission && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                        Score: {submission.totalScore}/{submission.maxPossibleScore}
                                                    </p>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 mb-4">
                                        No teams assigned to you yet. Contact the Jury Admin.
                                    </p>
                                    <Link href="/" className="btn-outline">
                                        Back to Home
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    /* Evaluation Form */
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => setSelectedTeam(null)}
                            className="mb-6"
                        >
                            ← Back to Teams
                        </Button>

                        <Card>
                            <CardHeader
                                title={`Evaluating: ${selectedTeam.projectName}`}
                                subtitle={`Team: ${selectedTeam.teamCode} | Project: ${selectedTeam.projectCode}`}
                            />
                            <CardContent>
                                {state.message && (
                                    <Alert
                                        type={state.success ? "success" : "error"}
                                        className="mb-6"
                                    >
                                        {state.message}
                                    </Alert>
                                )}

                                <form action={formAction} className="space-y-6">
                                    <input type="hidden" name="teamCode" value={selectedTeam.teamCode} />
                                    <input
                                        type="hidden"
                                        name="lock"
                                        value={lockOnSubmit.toString()}
                                    />

                                    {/* Questions */}
                                    {questions.map((question, index) => (
                                        <div
                                            key={question._id}
                                            className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                                        >
                                            <div className="flex items-start gap-4 mb-4">
                                                <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-semibold text-primary-600 flex-shrink-0">
                                                    {index + 1}
                                                </span>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                        {question.question}
                                                    </h4>
                                                    {question.description && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {question.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="ml-12 space-y-4">
                                                <div>
                                                    <label className="label">
                                                        Score (0 - {question.maxScore})
                                                    </label>
                                                    <input
                                                        type="range"
                                                        name={`rating_${question._id}`}
                                                        min={0}
                                                        max={question.maxScore}
                                                        defaultValue={5}
                                                        className="w-full"
                                                    />
                                                    <div className="flex justify-between text-xs text-gray-500">
                                                        <span>0</span>
                                                        <span>{question.maxScore}</span>
                                                    </div>
                                                </div>
                                                <Input
                                                    name={`comment_${question._id}`}
                                                    placeholder="Optional comment for this criterion"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {/* Overall Comment */}
                                    <Textarea
                                        name="overallComment"
                                        label="Overall Comments"
                                        placeholder="Your overall feedback for this project..."
                                    />

                                    {/* Submit Options */}
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={lockOnSubmit}
                                                onChange={(e) => setLockOnSubmit(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Lock after submitting (cannot edit after locking)
                                            </span>
                                        </label>
                                    </div>

                                    <div className="flex gap-4">
                                        <SubmitButton isLock={lockOnSubmit} />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setSelectedTeam(null)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}

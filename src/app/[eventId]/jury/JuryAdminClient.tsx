"use client";

import { useState, useTransition } from "react";
import {
    createQuestion,
    deleteQuestion,
    assignJuryToTeams,
    sendBackEvaluation,
    lockAllEvaluations,
} from "@/app/actions/jury";
import { Input, Button, Textarea } from "@/components/forms";
import { Badge, Modal } from "@/components/ui";
import toast from "react-hot-toast";

interface Question {
    _id: string;
    question: string;
    description?: string;
    maxScore: number;
    weightage: number;
}

interface JuryMember {
    _id: string;
    name: string;
    email: string;
    assignmentCount: number;
    submittedCount: number;
}

interface TeamInfo {
    _id: string;
    teamCode: string;
    projectName: string;
}

interface Submission {
    _id: string;
    teamCode: string;
    projectName: string;
    juryName: string;
    status: string;
    totalScore: number;
}

interface Props {
    eventId: string;
    questions?: Question[];
    juryMembers?: JuryMember[];
    teams?: TeamInfo[];
    submissions?: Submission[];
    section: "questions" | "jury" | "submissions";
}

export default function JuryAdminClient({
    eventId,
    questions = [],
    juryMembers = [],
    teams = [],
    submissions = [],
    section,
}: Props) {
    const [isPending, startTransition] = useTransition();
    const [newQuestion, setNewQuestion] = useState({
        question: "",
        description: "",
        maxScore: 10,
        weightage: 1,
    });
    const [assignModal, setAssignModal] = useState<JuryMember | null>(null);
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

    const handleAddQuestion = async () => {
        if (!newQuestion.question) return;
        startTransition(async () => {
            const result = await createQuestion(eventId, newQuestion);
            if (result.success) {
                toast.success(result.message);
                setNewQuestion({ question: "", description: "", maxScore: 10, weightage: 1 });
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleDeleteQuestion = async (id: string) => {
        if (!confirm("Delete this question?")) return;
        startTransition(async () => {
            const result = await deleteQuestion(eventId, id);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleAssignTeams = async () => {
        if (!assignModal || selectedTeams.length === 0) return;
        startTransition(async () => {
            const result = await assignJuryToTeams(eventId, assignModal._id, selectedTeams);
            if (result.success) {
                toast.success(result.message);
                setAssignModal(null);
                setSelectedTeams([]);
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleSendBack = async (submissionId: string) => {
        const reason = prompt("Reason for sending back?");
        if (!reason) return;
        startTransition(async () => {
            const result = await sendBackEvaluation(eventId, submissionId, reason);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleLockAll = async () => {
        if (!confirm("Lock all submitted evaluations? This cannot be undone easily.")) return;
        startTransition(async () => {
            const result = await lockAllEvaluations(eventId);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    if (section === "questions") {
        return (
            <div className="space-y-4">
                {/* Add New Question */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-3">
                    <Input
                        value={newQuestion.question}
                        onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                        placeholder="Question text"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            type="number"
                            value={newQuestion.maxScore}
                            onChange={(e) => setNewQuestion({ ...newQuestion, maxScore: parseInt(e.target.value) })}
                            placeholder="Max Score"
                        />
                        <Input
                            type="number"
                            value={newQuestion.weightage}
                            onChange={(e) => setNewQuestion({ ...newQuestion, weightage: parseFloat(e.target.value) })}
                            placeholder="Weightage"
                        />
                    </div>
                    <Button onClick={handleAddQuestion} loading={isPending} size="sm">
                        Add Question
                    </Button>
                </div>

                {/* Question List */}
                <div className="space-y-2">
                    {questions.map((q, i) => (
                        <div
                            key={q._id}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                            <div>
                                <p className="font-medium">
                                    {i + 1}. {q.question}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Max: {q.maxScore} | Weight: {q.weightage}x
                                </p>
                            </div>
                            <button
                                onClick={() => handleDeleteQuestion(q._id)}
                                className="text-red-500 hover:text-red-700 p-2"
                                disabled={isPending}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (section === "jury") {
        return (
            <>
                <div className="space-y-3">
                    {juryMembers.map((m) => (
                        <div
                            key={m._id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                        >
                            <div>
                                <p className="font-medium">{m.name}</p>
                                <p className="text-sm text-gray-500">{m.email}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="primary">{m.assignmentCount} assigned</Badge>
                                <Badge variant="success">{m.submittedCount} done</Badge>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setAssignModal(m)}
                                >
                                    Assign
                                </Button>
                            </div>
                        </div>
                    ))}
                    {juryMembers.length === 0 && (
                        <p className="text-center text-gray-500 py-4">
                            No jury members. Add them in Event settings.
                        </p>
                    )}
                </div>

                {/* Assign Modal */}
                <Modal
                    isOpen={!!assignModal}
                    onClose={() => setAssignModal(null)}
                    title={`Assign Teams to ${assignModal?.name}`}
                >
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {teams.map((t) => (
                            <label
                                key={t._id}
                                className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTeams.includes(t._id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedTeams([...selectedTeams, t._id]);
                                        } else {
                                            setSelectedTeams(selectedTeams.filter((id) => id !== t._id));
                                        }
                                    }}
                                    className="w-4 h-4"
                                />
                                <div>
                                    <p className="font-medium">{t.teamCode}</p>
                                    <p className="text-sm text-gray-500">{t.projectName}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button onClick={handleAssignTeams} loading={isPending}>
                            Assign ({selectedTeams.length})
                        </Button>
                        <Button variant="outline" onClick={() => setAssignModal(null)}>
                            Cancel
                        </Button>
                    </div>
                </Modal>
            </>
        );
    }

    // Submissions section
    const statusColors = {
        draft: "neutral",
        submitted: "success",
        locked: "primary",
        sent_back: "warning",
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={handleLockAll} loading={isPending} variant="outline" size="sm">
                    🔒 Lock All Submitted
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-2 px-3">Team</th>
                            <th className="text-left py-2 px-3">Jury</th>
                            <th className="text-center py-2 px-3">Status</th>
                            <th className="text-center py-2 px-3">Score</th>
                            <th className="text-right py-2 px-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.map((s) => (
                            <tr key={s._id} className="border-b border-gray-100 dark:border-gray-800">
                                <td className="py-2 px-3">
                                    <p className="font-medium">{s.teamCode}</p>
                                    <p className="text-xs text-gray-500">{s.projectName}</p>
                                </td>
                                <td className="py-2 px-3">{s.juryName}</td>
                                <td className="py-2 px-3 text-center">
                                    <Badge variant={statusColors[s.status as keyof typeof statusColors] as "neutral" | "success" | "primary" | "warning"}>
                                        {s.status}
                                    </Badge>
                                </td>
                                <td className="py-2 px-3 text-center font-medium">{s.totalScore}</td>
                                <td className="py-2 px-3 text-right">
                                    {s.status === "submitted" && (
                                        <button
                                            onClick={() => handleSendBack(s._id)}
                                            className="text-yellow-600 hover:underline text-xs"
                                            disabled={isPending}
                                        >
                                            Send Back
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {submissions.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                    No evaluations yet. Assign teams to jury members first.
                </p>
            )}
        </div>
    );
}

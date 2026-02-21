"use client";

import { useState, useTransition } from "react";
import {
    createQuestion,
    deleteQuestion,
    updateQuestion,
    assignJuryToTeams,
    assignAllJuryToAllTeams,
    sendBackEvaluation,
    lockAllEvaluations,
    allowEditSubmission,
} from "@/app/actions/jury";
import { Input, Button } from "@/components/forms";
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
    juryEmail: string;
    status: string;
    totalScore: number;
    maxPossibleScore: number;
    submittedAt?: string;
}

interface TeamScore {
    teamCode: string;
    projectName: string;
    avg: number;
    evaluationCount: number;
    scores: number[];
}

interface Props {
    eventId: string;
    questions?: Question[];
    juryMembers?: JuryMember[];
    teams?: TeamInfo[];
    submissions?: Submission[];
    teamScores?: TeamScore[];
    foodStatus?: Record<string, { total: number; used: number }>;
    section: "questions" | "jury" | "submissions" | "scoreboard";
}

export default function JuryAdminClient({
    eventId,
    questions = [],
    juryMembers = [],
    teams = [],
    submissions = [],
    teamScores = [],
    foodStatus = {},
    section,
}: Props) {
    const [isPending, startTransition] = useTransition();
    const [newQuestion, setNewQuestion] = useState({ question: "", description: "", maxScore: 10, weightage: 10 });
    const [editingQ, setEditingQ] = useState<Question | null>(null);
    const [assignModal, setAssignModal] = useState<JuryMember | null>(null);
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"score" | "teamCode">("score");

    const handleAddQuestion = async () => {
        if (!newQuestion.question) return;
        startTransition(async () => {
            const result = await createQuestion(eventId, newQuestion);
            if (result.success) { toast.success(result.message); setNewQuestion({ question: "", description: "", maxScore: 10, weightage: 10 }); }
            else toast.error(result.message);
        });
    };

    const handleUpdateQuestion = async () => {
        if (!editingQ) return;
        startTransition(async () => {
            const result = await updateQuestion(eventId, editingQ._id, {
                question: editingQ.question, maxScore: editingQ.maxScore, weightage: editingQ.weightage,
            });
            if (result.success) { toast.success(result.message); setEditingQ(null); }
            else toast.error(result.message);
        });
    };

    const handleDeleteQuestion = async (id: string) => {
        if (!confirm("Delete this question?")) return;
        startTransition(async () => {
            const result = await deleteQuestion(eventId, id);
            if (result.success) toast.success(result.message); else toast.error(result.message);
        });
    };

    const handleAssignTeams = async () => {
        if (!assignModal || selectedTeams.length === 0) return;
        startTransition(async () => {
            const result = await assignJuryToTeams(eventId, assignModal._id, selectedTeams);
            if (result.success) { toast.success(result.message); setAssignModal(null); setSelectedTeams([]); }
            else toast.error(result.message);
        });
    };

    const handleAssignAll = async () => {
        if (!confirm("Are you sure you want to assign ALL jury members to ALL approved teams?")) return;
        startTransition(async () => {
            const result = await assignAllJuryToAllTeams(eventId);
            if (result.success) toast.success(result.message); else toast.error(result.message);
        });
    };

    const handleSendBack = async (submissionId: string) => {
        const reason = prompt("Reason for sending back?");
        if (!reason) return;
        startTransition(async () => {
            const result = await sendBackEvaluation(eventId, submissionId, reason);
            if (result.success) toast.success(result.message); else toast.error(result.message);
        });
    };

    const handleAllowEdit = async (submissionId: string) => {
        if (!confirm("Allow jury to re-edit this submitted score?")) return;
        startTransition(async () => {
            const result = await allowEditSubmission(eventId, submissionId);
            if (result.success) toast.success(result.message); else toast.error(result.message);
        });
    };

    const handleLockAll = async () => {
        if (!confirm("Lock all submitted evaluations?")) return;
        startTransition(async () => {
            const result = await lockAllEvaluations(eventId);
            if (result.success) toast.success(result.message); else toast.error(result.message);
        });
    };

    // ─── QUESTIONS SECTION ────────────────────────────────────
    if (section === "questions") {
        const totalWeight = questions.reduce((s, q) => s + q.weightage, 0);
        return (
            <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-3">
                    <Input value={newQuestion.question} onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })} placeholder="Question text (e.g. Innovation)" />
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Max Score (out of)</label>
                            <Input type="number" value={newQuestion.maxScore} onChange={(e) => setNewQuestion({ ...newQuestion, maxScore: parseInt(e.target.value) || 0 })} placeholder="Max Score" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Weightage % (e.g. 25 means 25%)</label>
                            <Input type="number" value={newQuestion.weightage} onChange={(e) => setNewQuestion({ ...newQuestion, weightage: parseFloat(e.target.value) || 0 })} placeholder="Weightage %" />
                        </div>
                    </div>
                    <Button onClick={handleAddQuestion} loading={isPending} size="sm">Add Question</Button>
                </div>

                {questions.length > 0 && (
                    <div className={`text-sm font-semibold text-center py-1 rounded ${totalWeight === 100 ? "text-green-600 bg-green-50" : "text-amber-600 bg-amber-50"}`}>
                        Total Weightage: {totalWeight}% {totalWeight !== 100 ? "⚠️ (should be 100%)" : "✓"}
                    </div>
                )}

                <div className="space-y-2">
                    {questions.map((q, i) => (
                        <div key={q._id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                            {editingQ?._id === q._id ? (
                                <div className="flex-1 space-y-2 mr-3">
                                    <Input value={editingQ.question} onChange={(e) => setEditingQ({ ...editingQ, question: e.target.value })} />
                                    <div className="flex gap-2">
                                        <Input type="number" value={editingQ.maxScore} onChange={(e) => setEditingQ({ ...editingQ, maxScore: parseInt(e.target.value) || 0 })} placeholder="Max Score" />
                                        <Input type="number" value={editingQ.weightage} onChange={(e) => setEditingQ({ ...editingQ, weightage: parseFloat(e.target.value) || 0 })} placeholder="Weight %" />
                                        <Button size="sm" onClick={handleUpdateQuestion} loading={isPending}>Save</Button>
                                        <Button size="sm" variant="outline" onClick={() => setEditingQ(null)}>Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <p className="font-medium">{i + 1}. {q.question}</p>
                                        <p className="text-sm text-gray-500">Max: {q.maxScore} | Weight: {q.weightage}%</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingQ(q)} className="text-blue-500 hover:text-blue-700 p-2 text-sm">✏️</button>
                                        <button onClick={() => handleDeleteQuestion(q._id)} className="text-red-500 hover:text-red-700 p-2" disabled={isPending}>✕</button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ─── JURY MEMBERS SECTION ────────────────────────────────────
    if (section === "jury") {
        return (
            <>
                {juryMembers.length > 0 && teams.length > 0 && (
                    <div className="flex justify-end mb-4">
                        <Button onClick={handleAssignAll} loading={isPending} variant="outline" size="sm">
                            ⚡ Assign All Judges to All Teams
                        </Button>
                    </div>
                )}
                <div className="space-y-3">
                    {juryMembers.map((m) => (
                        <div key={m._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <div>
                                <p className="font-medium">{m.name}</p>
                                <p className="text-sm text-gray-500">{m.email}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="primary">{m.assignmentCount} assigned</Badge>
                                <Badge variant="success">{m.submittedCount} done</Badge>
                                <Button size="sm" variant="outline" onClick={() => { setSelectedTeams([]); setAssignModal(m); }}>Assign</Button>
                            </div>
                        </div>
                    ))}
                    {juryMembers.length === 0 && <p className="text-center text-gray-500 py-4">No jury members. Add them in Event settings.</p>}
                </div>

                <Modal isOpen={!!assignModal} onClose={() => setAssignModal(null)} title={`Assign Teams to ${assignModal?.name}`}>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {teams.map((t) => (
                            <label key={t._id} className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer">
                                <input type="checkbox" checked={selectedTeams.includes(t._id)} onChange={(e) => {
                                    setSelectedTeams(e.target.checked ? [...selectedTeams, t._id] : selectedTeams.filter((id) => id !== t._id));
                                }} className="w-4 h-4" />
                                <div>
                                    <p className="font-medium">{t.teamCode}</p>
                                    <p className="text-sm text-gray-500">{t.projectName}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button onClick={handleAssignTeams} loading={isPending}>Assign ({selectedTeams.length})</Button>
                        <Button variant="outline" onClick={() => setAssignModal(null)}>Cancel</Button>
                    </div>
                </Modal>
            </>
        );
    }

    // ─── SCOREBOARD SECTION ────────────────────────────────────
    if (section === "scoreboard") {
        const filtered = teamScores
            .filter((t) => !searchQuery || t.teamCode.toLowerCase().includes(searchQuery.toLowerCase()) || t.projectName.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => sortBy === "score" ? b.avg - a.avg : a.teamCode.localeCompare(b.teamCode));

        return (
            <div className="space-y-4">
                <div className="flex gap-3 items-center">
                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="🔍 Search team..." className="flex-1" />
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "score" | "teamCode")} className="input text-sm">
                        <option value="score">Sort: Score ↓</option>
                        <option value="teamCode">Sort: Team Code</option>
                    </select>
                    <a
                        href={`/api/export-jury/${eventId}`}
                        download
                        className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                        📊 Export Excel
                    </a>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-3 px-3 w-10">#</th>
                                <th className="text-left py-3 px-3">Team</th>
                                <th className="text-center py-3 px-3">Avg Score</th>
                                <th className="text-center py-3 px-3">Evaluations</th>
                                <th className="text-center py-3 px-3">🍽️ Food</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((t, i) => {
                                const teamId = teams.find(tm => tm.teamCode === t.teamCode)?._id ?? "";
                                const food = foodStatus[teamId];
                                const foodPct = food ? Math.round((food.used / food.total) * 100) : null;
                                return (
                                    <tr key={t.teamCode} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                        <td className="py-2 px-3 font-bold text-gray-400">
                                            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                                        </td>
                                        <td className="py-2 px-3">
                                            <p className="font-semibold">{t.teamCode}</p>
                                            <p className="text-xs text-gray-500">{t.projectName}</p>
                                        </td>
                                        <td className="py-2 px-3 text-center">
                                            <span className="font-bold text-primary-600">{t.avg.toFixed(2)}</span>
                                        </td>
                                        <td className="py-2 px-3 text-center text-gray-500">{t.evaluationCount}</td>
                                        <td className="py-2 px-3 text-center">
                                            {food ? (
                                                <span className={`text-xs font-medium ${foodPct === 100 ? "text-green-600" : "text-amber-600"}`}>
                                                    {food.used}/{food.total} ({foodPct}%)
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <p className="text-center text-gray-500 py-8">No scored teams yet</p>}
                </div>
            </div>
        );
    }

    // ─── SUBMISSIONS SECTION ────────────────────────────────────
    const statusColors = { draft: "neutral", submitted: "success", locked: "primary", sent_back: "warning" } as const;

    return (
        <div className="space-y-4">
            <div className="flex gap-2 justify-between items-center">
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="🔍 Search team or jury..." className="max-w-xs" />
                <Button onClick={handleLockAll} loading={isPending} variant="outline" size="sm">🔒 Lock All Submitted</Button>
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
                        {submissions
                            .filter((s) => !searchQuery ||
                                s.teamCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                s.juryName.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((s) => (
                                <tr key={s._id} className="border-b border-gray-100 dark:border-gray-800">
                                    <td className="py-2 px-3">
                                        <p className="font-medium">{s.teamCode}</p>
                                        <p className="text-xs text-gray-500">{s.projectName}</p>
                                    </td>
                                    <td className="py-2 px-3 text-sm">{s.juryName}</td>
                                    <td className="py-2 px-3 text-center">
                                        <Badge variant={statusColors[s.status as keyof typeof statusColors] ?? "neutral"}>
                                            {s.status.replace("_", " ")}
                                        </Badge>
                                    </td>
                                    <td className="py-2 px-3 text-center font-medium">{s.totalScore}</td>
                                    <td className="py-2 px-3 text-right">
                                        <div className="flex gap-2 justify-end">
                                            {(s.status === "submitted" || s.status === "locked") && (
                                                <button onClick={() => handleAllowEdit(s._id)} className="text-blue-600 hover:underline text-xs" disabled={isPending}>
                                                    ✏️ Allow Edit
                                                </button>
                                            )}
                                            {s.status === "submitted" && (
                                                <button onClick={() => handleSendBack(s._id)} className="text-yellow-600 hover:underline text-xs" disabled={isPending}>
                                                    ↩ Send Back
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            {submissions.length === 0 && <p className="text-center text-gray-500 py-8">No evaluations yet.</p>}
        </div>
    );
}

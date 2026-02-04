"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
    addEvaluationQuestion,
    deleteEvaluationQuestion,
    JuryActionState,
} from "@/app/actions/jury";
import { Input, Textarea, Button } from "@/components/forms";
import { Card, CardHeader, CardContent, Alert, Badge, Modal } from "@/components/ui";
import toast from "react-hot-toast";

interface Question {
    _id: string;
    question: string;
    description?: string;
    maxScore: number;
    order: number;
}

interface QuestionsClientProps {
    initialQuestions: Question[];
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" loading={pending} className="w-full">
            Add Question
        </Button>
    );
}

export default function QuestionsClient({ initialQuestions }: QuestionsClientProps) {
    const [questions, setQuestions] = useState(initialQuestions);
    const [showForm, setShowForm] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const initialState: JuryActionState = { success: false, message: "" };
    const [state, formAction] = useFormState(addEvaluationQuestion, initialState);

    const handleDelete = async () => {
        if (!deleteId) return;

        const result = await deleteEvaluationQuestion(deleteId);
        if (result.success) {
            toast.success("Question deleted");
            setQuestions(questions.filter((q) => q._id !== deleteId));
        } else {
            toast.error(result.message);
        }
        setDeleteId(null);
    };

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">Evaluation Questions</h1>
                    <p className="page-subtitle">Manage questions for jury evaluation</p>
                </div>

                {/* Toggle Form */}
                <div className="mb-8">
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Hide Form" : "+ Add Question"}
                    </Button>
                </div>

                {/* Add Form */}
                {showForm && (
                    <Card className="mb-8">
                        <CardHeader title="Add New Question" />
                        <CardContent>
                            {state.message && (
                                <Alert type={state.success ? "success" : "error"} className="mb-4">
                                    {state.message}
                                </Alert>
                            )}
                            <form action={formAction} className="space-y-4">
                                <Input
                                    name="question"
                                    label="Question"
                                    placeholder="Enter evaluation question"
                                    required
                                />
                                <Textarea
                                    name="description"
                                    label="Description (Optional)"
                                    placeholder="Additional details for this question"
                                />
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        name="maxScore"
                                        label="Max Score"
                                        type="number"
                                        min={1}
                                        max={10}
                                        defaultValue={10}
                                        required
                                    />
                                    <Input
                                        name="order"
                                        label="Display Order"
                                        type="number"
                                        defaultValue={questions.length + 1}
                                        required
                                    />
                                </div>
                                <SubmitButton />
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Questions List */}
                <Card>
                    <CardHeader title={`Questions (${questions.length})`} />
                    <CardContent>
                        {questions.length > 0 ? (
                            <div className="space-y-4">
                                {questions.map((question, index) => (
                                    <div
                                        key={question._id}
                                        className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-semibold text-primary-600">
                                                    {index + 1}
                                                </span>
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {question.question}
                                                </h4>
                                            </div>
                                            {question.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 ml-11">
                                                    {question.description}
                                                </p>
                                            )}
                                            <div className="ml-11 mt-2">
                                                <Badge variant="primary">Max Score: {question.maxScore}</Badge>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDeleteId(question._id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">
                                No evaluation questions yet. Add your first question above.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Delete Modal */}
                <Modal
                    isOpen={!!deleteId}
                    onClose={() => setDeleteId(null)}
                    title="Delete Question"
                >
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Are you sure you want to delete this question? This will not affect
                        existing evaluations.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button variant="ghost" onClick={() => setDeleteId(null)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createCommuteSchedule, CommuteActionState, deleteCommuteSchedule } from "@/app/actions/commute";
import { Input, Button, Textarea } from "@/components/forms";
import { Card, CardHeader, CardContent, Alert, Badge, Modal } from "@/components/ui";
import toast from "react-hot-toast";

interface Schedule {
    _id: string;
    busNumber: string;
    busColor: string;
    route: string;
    stops: string[];
    departureTime: string;
    arrivalTime: string;
    date: Date;
    capacity: number;
}

interface CommuteClientProps {
    initialSchedules: Schedule[];
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" loading={pending} className="w-full">
            Add Schedule
        </Button>
    );
}

export default function CommuteClient({ initialSchedules }: CommuteClientProps) {
    const [schedules, setSchedules] = useState(initialSchedules);
    const [showForm, setShowForm] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const initialState: CommuteActionState = { success: false, message: "" };
    const [state, formAction] = useFormState(createCommuteSchedule, initialState);

    const handleDelete = async () => {
        if (!deleteId) return;

        const result = await deleteCommuteSchedule(deleteId);
        if (result.success) {
            toast.success("Schedule deleted");
            setSchedules(schedules.filter((s) => s._id !== deleteId));
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
                    <h1 className="page-title">Commute Admin Dashboard</h1>
                    <p className="page-subtitle">Manage bus schedules for IGNITE 2026</p>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Hide Form" : "+ Add Schedule"}
                    </Button>
                </div>

                {/* Add Form */}
                {showForm && (
                    <Card className="mb-8">
                        <CardHeader title="Add Bus Schedule" />
                        <CardContent>
                            {state.message && (
                                <Alert type={state.success ? "success" : "error"} className="mb-4">
                                    {state.message}
                                </Alert>
                            )}
                            <form action={formAction} className="space-y-4">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <Input name="busNumber" label="Bus Number" placeholder="BUS-01" required />
                                    <Input name="busColor" label="Bus Color" placeholder="Red" required />
                                    <Input name="capacity" label="Capacity" type="number" defaultValue={50} required />
                                </div>
                                <Input name="route" label="Route" placeholder="Station → Venue → Hotel" required />
                                <Textarea
                                    name="stops"
                                    label="Stops (comma separated)"
                                    placeholder="Railway Station, Bus Stand, Main Gate, Venue"
                                    required
                                />
                                <div className="grid md:grid-cols-3 gap-4">
                                    <Input name="date" label="Date" type="date" defaultValue="2026-02-28" required />
                                    <Input name="departureTime" label="Departure Time" type="time" required />
                                    <Input name="arrivalTime" label="Arrival Time" type="time" required />
                                </div>
                                <SubmitButton />
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Schedules List */}
                <Card>
                    <CardHeader title="Bus Schedules" />
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Bus</th>
                                    <th>Route</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Capacity</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedules.map((schedule) => (
                                    <tr key={schedule._id}>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-4 h-4 rounded-full"
                                                    style={{ backgroundColor: schedule.busColor.toLowerCase() }}
                                                />
                                                <span className="font-semibold">{schedule.busNumber}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-sm">{schedule.route}</span>
                                            <div className="text-xs text-gray-500">
                                                {schedule.stops.slice(0, 3).join(" → ")}
                                                {schedule.stops.length > 3 && "..."}
                                            </div>
                                        </td>
                                        <td>{new Date(schedule.date).toLocaleDateString()}</td>
                                        <td>
                                            <Badge variant="primary">
                                                {schedule.departureTime} - {schedule.arrivalTime}
                                            </Badge>
                                        </td>
                                        <td>{schedule.capacity}</td>
                                        <td>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeleteId(schedule._id)}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {schedules.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-500">
                                            No schedules found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Delete Modal */}
                <Modal
                    isOpen={!!deleteId}
                    onClose={() => setDeleteId(null)}
                    title="Confirm Delete"
                >
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Are you sure you want to delete this schedule?
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

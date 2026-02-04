"use client";

import { useActionState } from "react";
import { createEvent } from "@/app/actions/event";
import { Input, Select, Button, FormGroup, Textarea } from "@/components/forms";
import { Card, CardHeader, CardContent, Alert } from "@/components/ui";
import Link from "next/link";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    value: String(currentYear + i),
    label: String(currentYear + i),
}));

export default function CreateEventPage() {
    const [state, formAction, isPending] = useActionState(createEvent, {
        success: false,
        message: "",
    });

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom max-w-2xl">
                <div className="page-header">
                    <h1 className="page-title">Create New Event</h1>
                    <p className="page-subtitle">Set up a new IGNITE event</p>
                </div>

                <Card>
                    <CardHeader title="Event Details" />
                    <CardContent>
                        {state.message && (
                            <Alert type={state.success ? "success" : "error"} className="mb-6">
                                {state.message}
                            </Alert>
                        )}

                        <form action={formAction} className="space-y-6">
                            <FormGroup label="Event Name" required>
                                <Input
                                    name="name"
                                    placeholder="IGNITE 2026"
                                    required
                                />
                            </FormGroup>

                            <FormGroup label="Year" required>
                                <Select name="year" options={yearOptions} required />
                            </FormGroup>

                            <FormGroup label="Event Date" required>
                                <Input type="date" name="date" required />
                            </FormGroup>

                            <FormGroup label="Venue">
                                <Input name="venue" placeholder="Innovation Hub, Tech Park" />
                            </FormGroup>

                            <FormGroup label="Description">
                                <Textarea
                                    name="description"
                                    placeholder="Brief description of the event..."
                                    rows={3}
                                />
                            </FormGroup>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" loading={isPending}>
                                    Create Event
                                </Button>
                                <Link href="/admin" className="btn-outline">
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

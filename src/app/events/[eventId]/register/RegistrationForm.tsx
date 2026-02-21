"use client";

import { useState, useTransition } from "react";
import { registerTeam } from "@/app/actions/team";
import { Input, Select, Button, FormGroup, Textarea } from "@/components/forms";
import { Card, CardHeader, CardContent, Alert, Badge } from "@/components/ui";
import Link from "next/link";

interface Props {
    eventId: string;
    eventName: string;
    maxTeamSize: number;
}

const prefixOptions = [
    { value: "Mr", label: "Mr" },
    { value: "Ms", label: "Ms" },
    { value: "Dr", label: "Dr" },
    { value: "NA", label: "N/A" },
];



interface Member {
    id: string;
    prefix: "Mr" | "Ms" | "Dr" | "NA";
    name: string;
    college: string;
    branch: string;
    yearOfPassing: number;
    phone: string;
    email: string;
}

const emptyMember = (): Member => ({
    id: Math.random().toString(36).substring(7),
    prefix: "Mr",
    name: "",
    college: "",
    branch: "",
    yearOfPassing: new Date().getFullYear(),
    phone: "",
    email: "",
});

export default function RegistrationForm({ eventId, eventName, maxTeamSize }: Props) {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ success: boolean; message: string; teamCode?: string } | null>(null);

    const [projectName, setProjectName] = useState("");
    const [projectCode, setProjectCode] = useState("");
    const [teamLead, setTeamLead] = useState({ name: "", email: "", phone: "" });
    const [guide, setGuide] = useState({ name: "", email: "", phone: "" });
    const [members, setMembers] = useState<Member[]>([emptyMember()]);

    const addMember = () => {
        if (members.length < maxTeamSize) {
            setMembers([...members, emptyMember()]);
        }
    };

    const removeMember = (id: string) => {
        if (members.length > 1) {
            setMembers(members.filter((m) => m.id !== id));
        }
    };

    const updateMember = (id: string, field: keyof Member, value: string | number) => {
        setMembers(
            members.map((m) => (m.id === id ? { ...m, [field]: value } : m))
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!projectName || !projectCode) {
            setResult({ success: false, message: "Project name and code are required" });
            return;
        }
        if (!teamLead.name || !teamLead.phone) {
            setResult({ success: false, message: "Team lead name and phone are required" });
            return;
        }
        if (members.some((m) => !m.name || !m.college || !m.branch)) {
            setResult({ success: false, message: "All member fields are required" });
            return;
        }

        startTransition(async () => {
            const res = await registerTeam(eventId, {
                projectName,
                projectCode,
                teamLead,
                guide: guide.name ? guide : undefined,
                members: members.map(({ id, ...m }) => m),
            });
            setResult(res);
        });
    };

    if (result?.success && result.teamCode) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Registration Successful!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Your team has been registered. Save your team code:
                    </p>
                    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-3xl font-bold py-4 px-8 rounded-xl mb-6">
                        {result.teamCode}
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        Use this code to access your team portal and update details.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href={`/team/${result.teamCode}`} className="btn-primary">
                            Go to Team Portal
                        </Link>
                        <Link href="/" className="btn-outline">
                            Back to Home
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {result && !result.success && (
                <Alert type="error">{result.message}</Alert>
            )}

            {/* Project Info */}
            <Card>
                <CardHeader title="Project Information" />
                <CardContent className="space-y-4">
                    <FormGroup label="Project Name" required>
                        <Input
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="Enter project name"
                            required
                        />
                    </FormGroup>
                    <FormGroup label="Project Code" required>
                        <Input
                            value={projectCode}
                            onChange={(e) => setProjectCode(e.target.value)}
                            placeholder="e.g., AI-01, IOT-05"
                            required
                        />
                    </FormGroup>
                </CardContent>
            </Card>

            {/* Team Lead */}
            <Card>
                <CardHeader title="Team Lead Details" />
                <CardContent className="grid md:grid-cols-3 gap-4">
                    <FormGroup label="Name" required>
                        <Input
                            value={teamLead.name}
                            onChange={(e) => setTeamLead({ ...teamLead, name: e.target.value })}
                            placeholder="Full name"
                            required
                        />
                    </FormGroup>
                    <FormGroup label="Phone" required>
                        <Input
                            value={teamLead.phone}
                            onChange={(e) => setTeamLead({ ...teamLead, phone: e.target.value })}
                            placeholder="10-digit mobile"
                            required
                        />
                    </FormGroup>
                    <FormGroup label="Email">
                        <Input
                            type="email"
                            value={teamLead.email}
                            onChange={(e) => setTeamLead({ ...teamLead, email: e.target.value })}
                            placeholder="email@example.com"
                        />
                    </FormGroup>
                </CardContent>
            </Card>

            {/* Guide/Mentor */}
            <Card>
                <CardHeader title="Guide / Mentor (Optional)" />
                <CardContent className="grid md:grid-cols-3 gap-4">
                    <FormGroup label="Name">
                        <Input
                            value={guide.name}
                            onChange={(e) => setGuide({ ...guide, name: e.target.value })}
                            placeholder="Guide name"
                        />
                    </FormGroup>
                    <FormGroup label="Phone">
                        <Input
                            value={guide.phone}
                            onChange={(e) => setGuide({ ...guide, phone: e.target.value })}
                            placeholder="Phone number"
                        />
                    </FormGroup>
                    <FormGroup label="Email">
                        <Input
                            type="email"
                            value={guide.email}
                            onChange={(e) => setGuide({ ...guide, email: e.target.value })}
                            placeholder="email@example.com"
                        />
                    </FormGroup>
                </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
                <CardHeader
                    title={`Team Members (${members.length}/${maxTeamSize})`}
                    action={
                        members.length < maxTeamSize && (
                            <Button type="button" size="sm" onClick={addMember}>
                                + Add Member
                            </Button>
                        )
                    }
                />
                <CardContent className="space-y-6">
                    {members.map((member, index) => (
                        <div
                            key={member.id}
                            className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg relative"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <Badge variant="primary">Member {index + 1}</Badge>
                                {members.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeMember(member.id)}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            <div className="grid md:grid-cols-4 gap-4">
                                <FormGroup label="Prefix" required>
                                    <Select
                                        value={member.prefix}
                                        options={prefixOptions}
                                        onChange={(e) => updateMember(member.id, "prefix", e.target.value)}
                                    />
                                </FormGroup>
                                <FormGroup label="Full Name" required className="md:col-span-3">
                                    <Input
                                        value={member.name}
                                        onChange={(e) => updateMember(member.id, "name", e.target.value)}
                                        placeholder="Full name"
                                        required
                                    />
                                </FormGroup>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 mt-4">
                                <FormGroup label="College" required>
                                    <Input
                                        value={member.college}
                                        onChange={(e) => updateMember(member.id, "college", e.target.value)}
                                        placeholder="College name"
                                        required
                                    />
                                </FormGroup>
                                <FormGroup label="Branch" required>
                                    <Input
                                        value={member.branch}
                                        onChange={(e) => updateMember(member.id, "branch", e.target.value)}
                                        placeholder="e.g., CSE, ECE"
                                        required
                                    />
                                </FormGroup>
                                <FormGroup label="Year of Passing" required>
                                    <Input
                                        type="number"
                                        value={member.yearOfPassing}
                                        onChange={(e) => updateMember(member.id, "yearOfPassing", parseInt(e.target.value))}
                                        min={2020}
                                        max={2030}
                                        required
                                    />
                                </FormGroup>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <FormGroup label="Phone">
                                    <Input
                                        value={member.phone}
                                        onChange={(e) => updateMember(member.id, "phone", e.target.value)}
                                        placeholder="Mobile number"
                                    />
                                </FormGroup>
                                <FormGroup label="Email">
                                    <Input
                                        type="email"
                                        value={member.email}
                                        onChange={(e) => updateMember(member.id, "email", e.target.value)}
                                        placeholder="email@example.com"
                                    />
                                </FormGroup>
                            </div>


                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-center gap-4">
                <Button type="submit" loading={isPending} size="lg">
                    Register Team
                </Button>
                <Link href="/events" className="btn-outline">
                    Cancel
                </Link>
            </div>
        </form>
    );
}

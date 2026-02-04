"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { registerTeam, TeamRegistrationState } from "@/app/actions/team";
import { Input, Select, Button } from "@/components/forms";
import { Card, CardHeader, CardContent, Alert } from "@/components/ui";
import { PROJECT_NAMES, PROJECT_CODES, TitlePrefix, EngineeringBranch } from "@/types";
import Link from "next/link";

const titlePrefixOptions = [
    { value: "Mr", label: "Mr." },
    { value: "Ms", label: "Ms." },
    { value: "Dr", label: "Dr." },
    { value: "NA", label: "N/A" },
];

const branchOptions = [
    { value: "CSE", label: "Computer Science & Engineering" },
    { value: "IT", label: "Information Technology" },
    { value: "ECE", label: "Electronics & Communication" },
    { value: "Mechanical", label: "Mechanical Engineering" },
    { value: "Civil", label: "Civil Engineering" },
    { value: "Electrical", label: "Electrical Engineering" },
    { value: "Others", label: "Others" },
];

const yearOptions = [
    { value: "2025", label: "2025" },
    { value: "2026", label: "2026" },
    { value: "2027", label: "2027" },
    { value: "2028", label: "2028" },
    { value: "2029", label: "2029" },
    { value: "2030", label: "2030" },
];

const projectNameOptions = PROJECT_NAMES.map((name) => ({
    value: name,
    label: name,
}));

const projectCodeOptions = PROJECT_CODES.map((code) => ({
    value: code,
    label: code,
}));

interface MemberFormData {
    fullName: string;
    titlePrefix: TitlePrefix;
    collegeName: string;
    yearOfPassing: string;
    branch: EngineeringBranch;
    email: string;
    phone: string;
}

const emptyMember: MemberFormData = {
    fullName: "",
    titlePrefix: "Mr",
    collegeName: "",
    yearOfPassing: "2026",
    branch: "CSE",
    email: "",
    phone: "",
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" loading={pending} className="w-full">
            Register Team
        </Button>
    );
}

export default function RegisterPage() {
    const initialState: TeamRegistrationState = {
        success: false,
        message: "",
    };

    const [state, formAction] = useFormState(registerTeam, initialState);
    const [members, setMembers] = useState<MemberFormData[]>([{ ...emptyMember }]);

    const addMember = () => {
        if (members.length < 8) {
            setMembers([...members, { ...emptyMember }]);
        }
    };

    const removeMember = (index: number) => {
        if (members.length > 1) {
            setMembers(members.filter((_, i) => i !== index));
        }
    };

    const updateMember = (index: number, field: keyof MemberFormData, value: string) => {
        const updated = [...members];
        updated[index] = { ...updated[index], [field]: value };
        setMembers(updated);
    };

    // Success state
    if (state.success && state.teamCode) {
        return (
            <div className="min-h-screen py-12 hero-gradient">
                <div className="container-custom">
                    <div className="max-w-2xl mx-auto">
                        <Card className="overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center text-white">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                                    <svg
                                        className="w-10 h-10"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <h1 className="text-3xl font-bold mb-2">Registration Successful!</h1>
                                <p className="text-white/90">Your team has been registered for IGNITE 2026</p>
                            </div>

                            <CardContent className="text-center py-8">
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Your Team Code is:
                                </p>
                                <div className="inline-block px-8 py-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                    <p className="text-3xl font-bold font-mono gradient-text">
                                        {state.teamCode}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                                    Please save this code. You&apos;ll need it for accommodation booking.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
                                    <Link href="/accommodation" className="btn-primary">
                                        Book Accommodation
                                    </Link>
                                    <Link href="/" className="btn-outline">
                                        Back to Home
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 hero-gradient">
            <div className="container-custom">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="page-title text-4xl mb-4">Team Registration</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Register your team for IGNITE 2026. Maximum 8 members per team.
                        </p>
                    </div>

                    {/* Form */}
                    <form action={formAction}>
                        {/* Error Display */}
                        {state.message && !state.success && (
                            <Alert type="error" className="mb-6">
                                {state.message}
                            </Alert>
                        )}

                        {/* Project Details */}
                        <Card className="mb-6">
                            <CardHeader title="Project Details" subtitle="Select your project category" />
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <Select
                                        label="Project Name"
                                        name="projectName"
                                        options={projectNameOptions}
                                        placeholder="Select project category"
                                        required
                                    />
                                    <Select
                                        label="Project Code"
                                        name="projectCode"
                                        options={projectCodeOptions}
                                        placeholder="Select project code"
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Guide/Mentor Details */}
                        <Card className="mb-6">
                            <CardHeader title="Guide / Mentor Details" subtitle="Faculty guide information" />
                            <CardContent>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <Input
                                        label="Guide Name"
                                        name="guide[name]"
                                        placeholder="Dr. John Doe"
                                        required
                                    />
                                    <Input
                                        label="Email"
                                        name="guide[email]"
                                        type="email"
                                        placeholder="guide@college.edu"
                                        required
                                    />
                                    <Input
                                        label="Phone"
                                        name="guide[phone]"
                                        type="tel"
                                        placeholder="9876543210"
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Team Members */}
                        <Card className="mb-6">
                            <CardHeader
                                title={`Team Members (${members.length}/8)`}
                                subtitle="First member is the Team Lead"
                                action={
                                    members.length < 8 && (
                                        <Button type="button" variant="outline" size="sm" onClick={addMember}>
                                            + Add Member
                                        </Button>
                                    )
                                }
                            />
                            <CardContent>
                                <div className="space-y-8">
                                    {members.map((member, index) => (
                                        <div
                                            key={index}
                                            className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl relative"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {index === 0 ? (
                                                        <span className="flex items-center gap-2">
                                                            <span className="badge-primary">Team Lead</span>
                                                            Member {index + 1}
                                                        </span>
                                                    ) : (
                                                        `Member ${index + 1}`
                                                    )}
                                                </h4>
                                                {index > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMember(index)}
                                                        className="text-red-500 hover:text-red-600 text-sm font-medium"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <Select
                                                    label="Title"
                                                    name={`members[${index}][titlePrefix]`}
                                                    options={titlePrefixOptions}
                                                    value={member.titlePrefix}
                                                    onChange={(e) => updateMember(index, "titlePrefix", e.target.value)}
                                                    required
                                                />
                                                <Input
                                                    label="Full Name"
                                                    name={`members[${index}][fullName]`}
                                                    placeholder="Enter full name"
                                                    value={member.fullName}
                                                    onChange={(e) => updateMember(index, "fullName", e.target.value)}
                                                    required
                                                    className="md:col-span-2 lg:col-span-2"
                                                />
                                                <Input
                                                    label="College Name"
                                                    name={`members[${index}][collegeName]`}
                                                    placeholder="Enter college name"
                                                    value={member.collegeName}
                                                    onChange={(e) => updateMember(index, "collegeName", e.target.value)}
                                                    required
                                                />
                                                <Select
                                                    label="Year of Passing"
                                                    name={`members[${index}][yearOfPassing]`}
                                                    options={yearOptions}
                                                    value={member.yearOfPassing}
                                                    onChange={(e) => updateMember(index, "yearOfPassing", e.target.value)}
                                                    required
                                                />
                                                <Select
                                                    label="Branch"
                                                    name={`members[${index}][branch]`}
                                                    options={branchOptions}
                                                    value={member.branch}
                                                    onChange={(e) => updateMember(index, "branch", e.target.value)}
                                                    required
                                                />
                                                <Input
                                                    label="Email (Optional)"
                                                    name={`members[${index}][email]`}
                                                    type="email"
                                                    placeholder="email@example.com"
                                                    value={member.email}
                                                    onChange={(e) => updateMember(index, "email", e.target.value)}
                                                />
                                                <Input
                                                    label="Phone (Optional)"
                                                    name={`members[${index}][phone]`}
                                                    type="tel"
                                                    placeholder="9876543210"
                                                    value={member.phone}
                                                    onChange={(e) => updateMember(index, "phone", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <SubmitButton />
                            <Link href="/" className="btn-ghost flex-1 text-center">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

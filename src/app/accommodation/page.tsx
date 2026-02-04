"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
    createAccommodationBooking,
    getTeamMembersForBooking,
    AccommodationBookingState,
} from "@/app/actions/accommodation";
import { Input, Select, Button, Checkbox, Radio } from "@/components/forms";
import { Card, CardHeader, CardContent, Alert } from "@/components/ui";
import Link from "next/link";
import toast from "react-hot-toast";

const roomTypeOptions = [
    { value: "dorm", label: "Dormitory (Shared)" },
    { value: "suite", label: "Suite (Private)" },
];

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" loading={pending} className="w-full">
            Book Accommodation
        </Button>
    );
}

interface TeamMember {
    _id: string;
    fullName: string;
    titlePrefix: string;
    isTeamLead: boolean;
}

interface TeamInfo {
    _id: string;
    teamCode: string;
    projectName: string;
}

export default function AccommodationPage() {
    const initialState: AccommodationBookingState = {
        success: false,
        message: "",
    };

    const [state, formAction] = useFormState(createAccommodationBooking, initialState);
    const [teamCode, setTeamCode] = useState("");
    const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [foodRequired, setFoodRequired] = useState(false);
    const [foodPreference, setFoodPreference] = useState("veg");

    const handleVerifyTeam = async () => {
        if (!teamCode.trim()) {
            toast.error("Please enter a team code");
            return;
        }

        setIsLoading(true);
        try {
            const result = await getTeamMembersForBooking(teamCode);
            if (result) {
                setTeamInfo(result.team);
                setMembers(result.members);
                setSelectedMembers(result.members.map((m) => m._id));
                toast.success("Team verified successfully!");
            } else {
                toast.error("Team not found. Please check the code.");
                setTeamInfo(null);
                setMembers([]);
            }
        } catch {
            toast.error("Error verifying team");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMember = (memberId: string) => {
        setSelectedMembers((prev) =>
            prev.includes(memberId)
                ? prev.filter((id) => id !== memberId)
                : [...prev, memberId]
        );
    };

    // Success state
    if (state.success) {
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
                                <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
                                <p className="text-white/90">
                                    Your accommodation has been booked successfully
                                </p>
                            </div>

                            <CardContent className="text-center py-8">
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    You will receive confirmation details soon. Please carry your team code
                                    during check-in.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href="/" className="btn-primary">
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
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="page-title text-4xl mb-4">Accommodation Booking</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Book accommodation for your team during IGNITE 2026
                        </p>
                    </div>

                    <form action={formAction}>
                        {/* Error Display */}
                        {state.message && !state.success && (
                            <Alert type="error" className="mb-6">
                                {state.message}
                            </Alert>
                        )}

                        {/* Team Verification */}
                        <Card className="mb-6">
                            <CardHeader
                                title="Team Verification"
                                subtitle="Enter your team code to continue"
                            />
                            <CardContent>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <Input
                                            label="Team Code"
                                            name="teamCode"
                                            placeholder="IGN-XXXX"
                                            value={teamCode}
                                            onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleVerifyTeam}
                                            loading={isLoading}
                                        >
                                            Verify
                                        </Button>
                                    </div>
                                </div>

                                {teamInfo && (
                                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <p className="text-sm text-green-800 dark:text-green-200">
                                            <strong>Team Found:</strong> {teamInfo.teamCode} -{" "}
                                            {teamInfo.projectName}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {teamInfo && (
                            <>
                                {/* Dates */}
                                <Card className="mb-6">
                                    <CardHeader
                                        title="Stay Duration"
                                        subtitle="Select your check-in and check-out dates"
                                    />
                                    <CardContent>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <Input
                                                label="Check-in Date"
                                                name="checkInDate"
                                                type="date"
                                                min="2026-02-27"
                                                max="2026-02-28"
                                                defaultValue="2026-02-27"
                                                required
                                            />
                                            <Input
                                                label="Check-out Date"
                                                name="checkOutDate"
                                                type="date"
                                                min="2026-02-28"
                                                max="2026-03-01"
                                                defaultValue="2026-03-01"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Event dates: February 27 - March 1, 2026
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Room Type */}
                                <Card className="mb-6">
                                    <CardHeader title="Room Type" subtitle="Select your preferred accommodation" />
                                    <CardContent>
                                        <Select
                                            label="Room Type"
                                            name="roomType"
                                            options={roomTypeOptions}
                                            placeholder="Select room type"
                                            required
                                        />
                                    </CardContent>
                                </Card>

                                {/* Member Selection */}
                                <Card className="mb-6">
                                    <CardHeader
                                        title="Select Members"
                                        subtitle="Choose members who need accommodation"
                                    />
                                    <CardContent>
                                        <div className="space-y-3">
                                            {members.map((member) => (
                                                <label
                                                    key={member._id}
                                                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        name="memberIds"
                                                        value={member._id}
                                                        checked={selectedMembers.includes(member._id)}
                                                        onChange={() => toggleMember(member._id)}
                                                        className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                                                    />
                                                    <div className="flex-1">
                                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                                            {member.titlePrefix}. {member.fullName}
                                                        </span>
                                                        {member.isTeamLead && (
                                                            <span className="ml-2 badge-primary">Team Lead</span>
                                                        )}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-3">
                                            Selected: {selectedMembers.length} of {members.length} members
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Food Preference */}
                                <Card className="mb-6">
                                    <CardHeader title="Food Preference" subtitle="Optional meal arrangement" />
                                    <CardContent>
                                        <div className="space-y-4">
                                            <Checkbox
                                                label="Food Required"
                                                description="Check if you need food arrangement"
                                                checked={foodRequired}
                                                onChange={(e) => setFoodRequired(e.target.checked)}
                                            />
                                            <input
                                                type="hidden"
                                                name="foodRequired"
                                                value={foodRequired.toString()}
                                            />

                                            {foodRequired && (
                                                <div className="pl-7 space-y-3">
                                                    <Radio
                                                        name="foodPreference"
                                                        value="veg"
                                                        label="Vegetarian"
                                                        checked={foodPreference === "veg"}
                                                        onChange={() => setFoodPreference("veg")}
                                                    />
                                                    <Radio
                                                        name="foodPreference"
                                                        value="non-veg"
                                                        label="Non-Vegetarian"
                                                        checked={foodPreference === "non-veg"}
                                                        onChange={() => setFoodPreference("non-veg")}
                                                    />
                                                </div>
                                            )}
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
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

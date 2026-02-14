"use client";

import { useState } from "react";
import { getTeamByCode, getTeamByPhone } from "@/app/actions/team";
import { Input, Button } from "@/components/forms";
import { Card, CardContent } from "@/components/ui";
import { useRouter } from "next/navigation";

type LookupMode = "code" | "phone";

export default function TeamPortalPage() {
    const router = useRouter();
    const [mode, setMode] = useState<LookupMode>("phone");
    const [teamCode, setTeamCode] = useState("");
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (mode === "code") {
                if (!teamCode.trim()) {
                    setError("Please enter your team code");
                    setLoading(false);
                    return;
                }
                const team = await getTeamByCode(teamCode);
                if (team) {
                    router.push(`/team/${teamCode.toUpperCase()}`);
                } else {
                    setError("Team not found. Please check your team code.");
                }
            } else {
                if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
                    setError("Please enter a valid 10-digit phone number");
                    setLoading(false);
                    return;
                }
                const team = await getTeamByPhone(phone);
                if (team) {
                    router.push(`/team/${team.teamCode}`);
                } else {
                    setError("No team found with this phone number. Make sure to use the team lead's phone number.");
                }
            }
        } catch {
            setError("Something went wrong. Please try again.");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12">
            <div className="container-custom max-w-md">
                <Card>
                    <CardContent className="p-8">
                        <div className="text-center mb-8">
                            <div className="text-5xl mb-4">🎫</div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Team Portal
                            </h1>
                            <p className="text-gray-500 mt-2">
                                Access your team dashboard
                            </p>
                        </div>

                        {/* Mode Toggle */}
                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
                            <button
                                type="button"
                                onClick={() => { setMode("phone"); setError(""); }}
                                className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${mode === "phone"
                                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                📱 Phone Number
                            </button>
                            <button
                                type="button"
                                onClick={() => { setMode("code"); setError(""); }}
                                className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${mode === "code"
                                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                🔑 Team Code
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {mode === "phone" ? (
                                <Input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Enter team lead phone number"
                                    className="text-center text-lg tracking-wider"
                                />
                            ) : (
                                <Input
                                    value={teamCode}
                                    onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                                    placeholder="IGN26-XXXX"
                                    className="text-center text-xl font-bold tracking-widest"
                                />
                            )}

                            {error && (
                                <p className="text-red-500 text-sm text-center">{error}</p>
                            )}

                            <Button type="submit" loading={loading} className="w-full">
                                Access Team
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                            <p className="text-sm text-gray-500 mb-2">Don&apos;t have a team yet?</p>
                            <a href="/events" className="text-primary-500 hover:underline font-medium">
                                Register Now →
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

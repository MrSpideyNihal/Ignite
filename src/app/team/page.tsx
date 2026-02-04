"use client";

import { useState } from "react";
import { getTeamByCode } from "@/app/actions/team";
import { Input, Button } from "@/components/forms";
import { Card, CardContent } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function TeamPortalPage() {
    const router = useRouter();
    const [teamCode, setTeamCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamCode.trim()) {
            setError("Please enter your team code");
            return;
        }

        setLoading(true);
        setError("");

        const team = await getTeamByCode(teamCode);

        if (team) {
            router.push(`/team/${teamCode.toUpperCase()}`);
        } else {
            setError("Team not found. Please check your team code.");
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
                                Enter your team code to access your team dashboard
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                value={teamCode}
                                onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                                placeholder="IGN26-XXXX"
                                className="text-center text-xl font-bold tracking-widest"
                            />

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

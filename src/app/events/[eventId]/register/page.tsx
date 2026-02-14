import { getEvent } from "@/app/actions/event";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import RegistrationForm from "./RegistrationForm";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui";

export const dynamic = "force-dynamic";

interface Props {
    params: { eventId: string };
}

export default async function RegisterPage({ params }: Props) {
    const event = await getEvent(params.eventId);

    if (!event) notFound();

    if (!event.settings.registrationOpen) {
        redirect("/events");
    }

    // Check authentication
    const session = await auth();

    if (!session?.user) {
        return (
            <div className="min-h-screen py-8">
                <div className="container-custom max-w-lg">
                    <Card>
                        <CardContent className="p-8 text-center">
                            <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                Sign In to Register
                            </h1>
                            <p className="text-gray-500 mb-2">
                                <strong>{event.name}</strong>
                            </p>
                            <p className="text-gray-400 text-sm mb-8">
                                You need to sign in with Google before registering your team.
                                This helps us verify participant identity.
                            </p>
                            <Link
                                href={`/auth/signin?callbackUrl=/events/${params.eventId}/register`}
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Sign in with Google
                            </Link>
                            <div className="mt-6">
                                <Link href="/events" className="text-sm text-gray-400 hover:text-gray-600">
                                    ← Back to Events
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom max-w-4xl">
                <div className="page-header text-center">
                    <h1 className="page-title">Team Registration</h1>
                    <p className="page-subtitle">{event.name}</p>
                </div>

                <RegistrationForm
                    eventId={params.eventId}
                    eventName={event.name}
                    maxTeamSize={event.settings.maxTeamSize}
                />
            </div>
        </div>
    );
}

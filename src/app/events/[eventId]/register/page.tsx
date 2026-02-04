import { getEvent } from "@/app/actions/event";
import { notFound, redirect } from "next/navigation";
import RegistrationForm from "./RegistrationForm";

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

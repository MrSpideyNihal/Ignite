import { requireSuperAdmin } from "@/lib/auth-utils";
import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/models";
import { redirect } from "next/navigation";
import Link from "next/link";
import ImportClient from "./ImportClient";

export const dynamic = "force-dynamic";

export default async function ImportPage({
    params,
}: {
    params: { eventId: string };
}) {
    await requireSuperAdmin();
    await connectToDatabase();

    const event = await Event.findById(params.eventId);
    if (!event) redirect("/admin");

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom max-w-5xl">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/${params.eventId}/dashboard`}
                        className="btn-ghost text-sm"
                    >
                        ← Back
                    </Link>
                    <div>
                        <h1 className="page-title">Import Teams</h1>
                        <p className="text-gray-500">
                            {event.name} — Upload an Excel or CSV file to bulk-import teams
                        </p>
                    </div>
                </div>

                <ImportClient
                    eventId={params.eventId}
                    maxTeamSize={event.settings.maxTeamSize}
                />
            </div>
        </div>
    );
}

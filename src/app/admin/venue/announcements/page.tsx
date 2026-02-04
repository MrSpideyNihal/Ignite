import { requireRole } from "@/lib/auth-utils";
import { getAnnouncements } from "@/app/actions/admin";
import AnnouncementsClient from "./AnnouncementsClient";

export default async function AnnouncementsPage() {
    await requireRole(["super_admin", "venue_admin"]);
    const announcements = await getAnnouncements();

    return <AnnouncementsClient initialAnnouncements={announcements} />;
}

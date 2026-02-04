import { requireRole } from "@/lib/auth-utils";
import { getCommuteSchedules } from "@/app/actions/commute";
import CommuteClient from "./CommuteClient";

export default async function CommuteAdminPage() {
    await requireRole(["super_admin", "commute_admin"]);
    const schedules = await getCommuteSchedules();

    return <CommuteClient initialSchedules={schedules} />;
}

import { requireSuperAdmin } from "@/lib/auth-utils";
import { getAdminUsers } from "@/app/actions/admin";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage() {
    await requireSuperAdmin();
    const users = await getAdminUsers();

    return <AdminUsersClient initialUsers={users} />;
}

import { UserRole } from "@/types";
import { auth } from "./auth";
import { redirect } from "next/navigation";
import { getCurrentUserWithRole, syncUserWithDatabase } from "./db-auth";

export async function getSession() {
    return await auth();
}

export async function getCurrentUser() {
    const session = await getSession();
    return session?.user;
}

export async function requireAuth() {
    const session = await getSession();
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    // Sync user with database on protected page access
    const dbUser = await syncUserWithDatabase();

    return { session, dbUser };
}

export async function requireRole(allowedRoles: UserRole[]) {
    const { session, dbUser } = await requireAuth();

    if (!dbUser || !allowedRoles.includes(dbUser.role as UserRole)) {
        redirect("/unauthorized");
    }

    return { session, dbUser };
}

export async function requireAdmin() {
    return requireRole([
        "super_admin",
        "accommodation_admin",
        "food_admin",
        "commute_admin",
        "venue_admin",
    ]);
}

export async function requireSuperAdmin() {
    return requireRole(["super_admin"]);
}

export async function requireJury() {
    return requireRole(["super_admin", "jury_admin", "jury_member"]);
}

export async function requireJuryAdmin() {
    return requireRole(["super_admin", "jury_admin"]);
}

export function hasRole(userRole: UserRole | undefined, allowedRoles: UserRole[]): boolean {
    return !!userRole && allowedRoles.includes(userRole);
}

"use server";

import { auth } from "./auth";
import { connectToDatabase } from "./mongodb";
import { User, EventRole } from "@/models";
import { redirect } from "next/navigation";
import { EventRoleType, GlobalRole } from "@/types";

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    globalRole: GlobalRole;
}

export interface EventRoleInfo {
    eventId: string;
    role: EventRoleType;
}

// Get session
export async function getSession() {
    return await auth();
}

// Get current user with database info
export async function getCurrentUser(): Promise<AuthUser | null> {
    const session = await getSession();
    if (!session?.user?.email) return null;

    await connectToDatabase();

    let dbUser = await User.findOne({ email: session.user.email.toLowerCase() });
    const isSuperAdmin = session.user.email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL?.toLowerCase();

    if (!dbUser) {
        // Create user on first login
        dbUser = await User.create({
            email: session.user.email.toLowerCase(),
            name: session.user.name || "User",
            image: session.user.image,
            globalRole: isSuperAdmin ? "super_admin" : "user",
        });
    } else if (isSuperAdmin && dbUser.globalRole !== "super_admin") {
        // Auto-upgrade super admin if email matches
        dbUser.globalRole = "super_admin";
        await dbUser.save();
    }

    return {
        id: dbUser._id.toString(),
        email: dbUser.email,
        name: dbUser.name,
        globalRole: dbUser.globalRole,
    };
}

// Check if user is super admin
export async function requireSuperAdmin(): Promise<AuthUser> {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/api/auth/signin");
    }

    if (user.globalRole !== "super_admin") {
        redirect("/unauthorized");
    }

    return user;
}

// Check if user has any role for an event
export async function getUserEventRole(
    eventId: string
): Promise<EventRoleType | null> {
    const user = await getCurrentUser();
    if (!user) return null;

    await connectToDatabase();

    const eventRole = await EventRole.findOne({
        eventId,
        userId: user.id,
    });

    return eventRole?.role || null;
}

// Require a specific event role
export async function requireEventRole(
    eventId: string,
    allowedRoles: EventRoleType[]
): Promise<{ user: AuthUser; role: EventRoleType }> {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/api/auth/signin");
    }

    // Super admin always has access
    if (user.globalRole === "super_admin") {
        return { user, role: "jury_admin" }; // Default to jury_admin for super admin
    }

    const role = await getUserEventRole(eventId);

    if (!role || !allowedRoles.includes(role)) {
        redirect("/unauthorized");
    }

    return { user, role };
}

// Check access without redirect (for conditional rendering)
export async function checkEventAccess(
    eventId: string,
    allowedRoles: EventRoleType[]
): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user) return false;

    if (user.globalRole === "super_admin") return true;

    const role = await getUserEventRole(eventId);
    return !!role && allowedRoles.includes(role);
}

// Get all event roles for current user
export async function getUserAllEventRoles(): Promise<EventRoleInfo[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    await connectToDatabase();

    const roles = await EventRole.find({ userId: user.id }).lean();

    return roles.map((r) => ({
        eventId: r.eventId.toString(),
        role: r.role as EventRoleType,
    }));
}

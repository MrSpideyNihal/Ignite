"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { Announcement, EventRole } from "@/models";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface ActionState {
    success: boolean;
    message: string;
}

async function checkPermission(eventId: string) {
    const session = await auth();
    if (!session?.user?.email) {
        return { authorized: false, message: "Not authenticated" };
    }

    // Define user type locally to avoid circular dependencies or type issues
    interface UserWithRole {
        id: string;
        role: string;
        email: string;
        name: string;
    }

    const user = session.user as unknown as UserWithRole;

    if (user.role === "super_admin") {
        return { authorized: true, user };
    }

    await connectToDatabase();
    const role = await EventRole.findOne({
        eventId,
        userId: user.id,
    });

    if (!role) {
        return { authorized: false, message: "Not authorized for this event" };
    }

    // Allow committee members to post announcements
    const allowedRoles = [
        "registration_committee",
        "jury_admin",
        "logistics_committee",
        "food_committee"
    ];

    if (!allowedRoles.includes(role.role)) {
        return { authorized: false, message: "Insufficient permissions" };
    }

    return { authorized: true, user };
}

export async function createAnnouncement(
    eventId: string,
    data: {
        title: string;
        content: string;
        category: string;
        priority: "low" | "medium" | "high";
    }
): Promise<ActionState> {
    try {
        const { authorized, user, message } = await checkPermission(eventId);
        if (!authorized || !user) {
            return { success: false, message: message || "Unauthorized" };
        }

        await connectToDatabase();

        await Announcement.create({
            eventId,
            ...data,
            createdBy: user.id,
            createdByName: user.name,
        });

        revalidatePath(`/${eventId}/announcements`);
        revalidatePath(`/${eventId}/dashboard`);
        return { success: true, message: "Announcement created" };
    } catch (error) {
        console.error("Error creating announcement:", error);
        return { success: false, message: "Failed to create announcement" };
    }
}

export async function deleteAnnouncement(
    eventId: string,
    announcementId: string
): Promise<ActionState> {
    try {
        const { authorized, message } = await checkPermission(eventId);
        if (!authorized) {
            return { success: false, message: message || "Unauthorized" };
        }

        await connectToDatabase();
        await Announcement.findByIdAndDelete(announcementId);

        revalidatePath(`/${eventId}/announcements`);
        return { success: true, message: "Announcement deleted" };
    } catch (error) {
        console.error("Error deleting announcement:", error);
        return { success: false, message: "Failed to delete announcement" };
    }
}

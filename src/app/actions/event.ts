"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { Event, EventRole, User } from "@/models";
import { requireSuperAdmin, getCurrentUser } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionState, EventRoleType } from "@/types";

const CreateEventSchema = z.object({
    name: z.string().min(3),
    year: z.number().min(2024).max(2100),
    date: z.string(),
    description: z.string().optional(),
    venue: z.string().optional(),
});

// Create a new event
export async function createEvent(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    await requireSuperAdmin();

    try {
        await connectToDatabase();

        const data = {
            name: formData.get("name") as string,
            year: parseInt(formData.get("year") as string),
            date: formData.get("date") as string,
            description: formData.get("description") as string,
            venue: formData.get("venue") as string,
        };

        const validation = CreateEventSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, message: validation.error.errors[0].message };
        }

        const existingEvent = await Event.findOne({ year: data.year });
        if (existingEvent) {
            return { success: false, message: `An event for ${data.year} already exists` };
        }

        await Event.create({
            ...data,
            date: new Date(data.date),
            status: "draft",
            settings: {
                registrationOpen: false,
                evaluationOpen: false,
                maxTeamSize: 8,
            },
        });

        revalidatePath("/admin/events");
        return { success: true, message: "Event created successfully" };
    } catch (error) {
        console.error("Error creating event:", error);
        return { success: false, message: "Failed to create event" };
    }
}

// Get all events
export async function getEvents() {
    await connectToDatabase();

    const events = await Event.find()
        .sort({ year: -1 })
        .lean();

    return events.map((e) => ({
        _id: e._id.toString(),
        name: e.name,
        year: e.year,
        date: e.date.toISOString(),
        description: e.description,
        venue: e.venue,
        status: e.status,
        settings: e.settings,
    }));
}

// Get active events
export async function getActiveEvents() {
    await connectToDatabase();

    const events = await Event.find({ status: "active" })
        .sort({ year: -1 })
        .lean();

    return events.map((e) => ({
        _id: e._id.toString(),
        name: e.name,
        year: e.year,
        date: e.date.toISOString(),
        description: e.description,
        venue: e.venue,
        status: e.status,
        settings: e.settings,
    }));
}

// Get single event
export async function getEvent(eventId: string) {
    await connectToDatabase();

    const event = await Event.findById(eventId).lean();
    if (!event) return null;

    return {
        _id: event._id.toString(),
        name: event.name,
        year: event.year,
        date: event.date.toISOString(),
        description: event.description,
        venue: event.venue,
        status: event.status,
        settings: event.settings,
    };
}

// Update event status
export async function updateEventStatus(
    eventId: string,
    status: "draft" | "active" | "archived"
): Promise<ActionState> {
    await requireSuperAdmin();

    try {
        await connectToDatabase();
        await Event.findByIdAndUpdate(eventId, { status });
        revalidatePath("/admin/events");
        return { success: true, message: `Event status updated to ${status}` };
    } catch (error) {
        console.error("Error updating event:", error);
        return { success: false, message: "Failed to update event" };
    }
}

// Update event settings
export async function updateEventSettings(
    eventId: string,
    settings: { registrationOpen?: boolean; evaluationOpen?: boolean; maxTeamSize?: number }
): Promise<ActionState> {
    await requireSuperAdmin();

    try {
        await connectToDatabase();
        await Event.findByIdAndUpdate(eventId, {
            $set: {
                "settings.registrationOpen": settings.registrationOpen,
                "settings.evaluationOpen": settings.evaluationOpen,
                "settings.maxTeamSize": settings.maxTeamSize,
            }
        });
        revalidatePath(`/admin/events/${eventId}`);
        return { success: true, message: "Settings updated" };
    } catch (error) {
        console.error("Error updating settings:", error);
        return { success: false, message: "Failed to update settings" };
    }
}

// Add committee member to event
export async function addEventRole(
    eventId: string,
    email: string,
    role: EventRoleType
): Promise<ActionState> {
    await requireSuperAdmin();

    try {
        await connectToDatabase();

        // Find or create user
        let user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            user = await User.create({
                email: email.toLowerCase(),
                name: email.split("@")[0],
                globalRole: "user",
            });
        }

        // Check if role already exists
        const existing = await EventRole.findOne({
            eventId,
            userId: user._id,
        });

        if (existing) {
            existing.role = role;
            await existing.save();
        } else {
            await EventRole.create({
                eventId,
                userId: user._id,
                userEmail: user.email,
                role,
            });
        }

        revalidatePath(`/admin/events/${eventId}`);
        return { success: true, message: `${email} assigned as ${role.replace("_", " ")}` };
    } catch (error) {
        console.error("Error adding role:", error);
        return { success: false, message: "Failed to add role" };
    }
}

// Get event committee members
export async function getEventRoles(eventId: string) {
    await connectToDatabase();

    const roles = await EventRole.find({ eventId })
        .populate("userId", "name email")
        .lean();

    return roles.map((r) => ({
        _id: r._id.toString(),
        userId: r.userId.toString(),
        userEmail: r.userEmail,
        userName: (r.userId as { name?: string }).name || r.userEmail,
        role: r.role,
    }));
}

// Remove event role
export async function removeEventRole(roleId: string): Promise<ActionState> {
    await requireSuperAdmin();

    try {
        await connectToDatabase();
        const role = await EventRole.findByIdAndDelete(roleId);
        if (role) {
            revalidatePath(`/admin/events/${role.eventId}`);
        }
        return { success: true, message: "Role removed" };
    } catch (error) {
        console.error("Error removing role:", error);
        return { success: false, message: "Failed to remove role" };
    }
}

// Duplicate event (copy structure, not data)
export async function duplicateEvent(
    sourceEventId: string,
    newYear: number
): Promise<ActionState> {
    await requireSuperAdmin();

    try {
        await connectToDatabase();

        const sourceEvent = await Event.findById(sourceEventId);
        if (!sourceEvent) {
            return { success: false, message: "Source event not found" };
        }

        const existingEvent = await Event.findOne({ year: newYear });
        if (existingEvent) {
            return { success: false, message: `Event for ${newYear} already exists` };
        }

        // Create new event
        const newEvent = await Event.create({
            name: `IGNITE ${newYear}`,
            year: newYear,
            date: new Date(`${newYear}-02-28`),
            description: sourceEvent.description,
            venue: sourceEvent.venue,
            status: "draft",
            settings: sourceEvent.settings,
        });

        // Copy roles
        const roles = await EventRole.find({ eventId: sourceEventId });
        for (const role of roles) {
            await EventRole.create({
                eventId: newEvent._id,
                userId: role.userId,
                userEmail: role.userEmail,
                role: role.role,
            });
        }

        revalidatePath("/admin/events");
        return { success: true, message: `Event duplicated for ${newYear}` };
    } catch (error) {
        console.error("Error duplicating event:", error);
        return { success: false, message: "Failed to duplicate event" };
    }
}

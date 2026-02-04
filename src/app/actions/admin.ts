"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { User, Announcement } from "@/models";
import { UserRole } from "@/types";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const AddUserSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum([
        "super_admin",
        "accommodation_admin",
        "food_admin",
        "commute_admin",
        "venue_admin",
        "guest",
        "jury_admin",
        "jury_member",
    ] as const),
});

export interface AdminActionState {
    success: boolean;
    message: string;
}

// Check if user is super admin
async function requireSuperAdmin(): Promise<{ success: boolean; message?: string }> {
    const session = await auth();
    if (!session?.user) {
        return { success: false, message: "Not authenticated" };
    }
    const userRole = (session.user as { role?: string }).role;
    if (userRole !== "super_admin") {
        return { success: false, message: "Not authorized" };
    }
    return { success: true };
}

// Add or update user role
export async function addOrUpdateUserRole(
    prevState: AdminActionState,
    formData: FormData
): Promise<AdminActionState> {
    const check = await requireSuperAdmin();
    if (!check.success) {
        return { success: false, message: check.message || "Not authorized" };
    }

    try {
        await connectToDatabase();

        const email = (formData.get("email") as string).toLowerCase().trim();
        const role = formData.get("role") as UserRole;

        const validation = AddUserSchema.safeParse({ email, role });
        if (!validation.success) {
            return {
                success: false,
                message: validation.error.errors[0].message,
            };
        }

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // Update role
            user.role = role;
            await user.save();
        } else {
            // Create new user with specified role (they'll get full details on login)
            user = await User.create({
                email,
                name: email.split("@")[0],
                role,
            });
        }

        revalidatePath("/admin/users");
        revalidatePath("/admin");

        return {
            success: true,
            message: `User ${email} has been assigned the ${role.replace("_", " ")} role.`,
        };
    } catch (error) {
        console.error("Error adding user:", error);
        return { success: false, message: "An error occurred" };
    }
}

// Remove user role (set to guest)
export async function removeUserRole(userId: string): Promise<AdminActionState> {
    const check = await requireSuperAdmin();
    if (!check.success) {
        return { success: false, message: check.message || "Not authorized" };
    }

    try {
        await connectToDatabase();

        const user = await User.findById(userId);
        if (!user) {
            return { success: false, message: "User not found" };
        }

        // Can't demote yourself
        const session = await auth();
        if (session?.user?.email === user.email) {
            return { success: false, message: "Cannot demote yourself" };
        }

        user.role = "guest";
        await user.save();

        revalidatePath("/admin/users");

        return { success: true, message: "User role removed" };
    } catch (error) {
        console.error("Error removing role:", error);
        return { success: false, message: "An error occurred" };
    }
}

// Get all admin users
export async function getAdminUsers() {
    await connectToDatabase();

    const users = await User.find({
        role: { $nin: ["guest", "volunteer"] },
    })
        .sort({ role: 1, createdAt: -1 })
        .lean();

    return users.map((user) => ({
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
    }));
}

// Create announcement
export async function createAnnouncement(
    prevState: AdminActionState,
    formData: FormData
): Promise<AdminActionState> {
    const session = await auth();
    if (!session?.user) {
        return { success: false, message: "Not authenticated" };
    }

    try {
        await connectToDatabase();

        const title = (formData.get("title") as string).trim();
        const content = (formData.get("content") as string).trim();
        const category = formData.get("category") as string;
        const priority = formData.get("priority") as string;

        if (!title || !content) {
            return { success: false, message: "Title and content are required" };
        }

        await Announcement.create({
            title,
            content,
            category,
            priority,
            createdBy: (session.user as { id?: string }).id,
            createdByName: session.user.name || "Admin",
            isActive: true,
        });

        revalidatePath("/admin/venue");
        revalidatePath("/volunteer");

        return { success: true, message: "Announcement created successfully" };
    } catch (error) {
        console.error("Error creating announcement:", error);
        return { success: false, message: "An error occurred" };
    }
}

// Get announcements
export async function getAnnouncements(category?: string) {
    await connectToDatabase();

    const query: Record<string, unknown> = { isActive: true };
    if (category) {
        query.category = category;
    }

    const announcements = await Announcement.find(query)
        .sort({ priority: -1, createdAt: -1 })
        .lean();

    return announcements.map((a) => ({
        _id: a._id.toString(),
        title: a.title,
        content: a.content,
        category: a.category,
        priority: a.priority,
        createdByName: a.createdByName,
        createdAt: a.createdAt,
    }));
}

// Delete announcement
export async function deleteAnnouncement(id: string): Promise<AdminActionState> {
    const session = await auth();
    if (!session?.user) {
        return { success: false, message: "Not authenticated" };
    }

    try {
        await connectToDatabase();

        await Announcement.findByIdAndUpdate(id, { isActive: false });

        revalidatePath("/admin/venue");
        revalidatePath("/volunteer");

        return { success: true, message: "Announcement deleted" };
    } catch (error) {
        console.error("Error deleting announcement:", error);
        return { success: false, message: "An error occurred" };
    }
}

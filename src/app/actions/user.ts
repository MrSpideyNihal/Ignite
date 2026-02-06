"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { User, EventRole } from "@/models";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { ActionState } from "@/types";

// Get all users with their roles
export async function getAllUsers() {
    await requireSuperAdmin();
    await connectToDatabase();

    const users = await User.find().sort({ createdAt: -1 }).lean();

    // Get event roles for each user
    const usersWithRoles = await Promise.all(
        users.map(async (user) => {
            const roles = await EventRole.find({ userId: user._id })
                .populate("eventId", "name year")
                .lean();

            return {
                _id: user._id.toString(),
                email: user.email,
                name: user.name,
                image: user.image,
                globalRole: user.globalRole,
                createdAt: user.createdAt.toISOString(),
                eventRoles: roles.map((r) => ({
                    eventName: (r.eventId as unknown as { name: string; year: number })?.name || "Unknown",
                    eventYear: (r.eventId as unknown as { name: string; year: number })?.year || 0,
                    role: r.role,
                })),
            };
        })
    );

    return usersWithRoles;
}

// Update user's global role
export async function updateUserGlobalRole(
    userId: string,
    globalRole: "super_admin" | "user"
): Promise<ActionState> {
    await requireSuperAdmin();

    try {
        await connectToDatabase();

        const user = await User.findById(userId);
        if (!user) {
            return { success: false, message: "User not found" };
        }

        user.globalRole = globalRole;
        await user.save();

        revalidatePath("/admin/users");
        return { success: true, message: `User role updated to ${globalRole}` };
    } catch (error) {
        console.error("Error updating user role:", error);
        return { success: false, message: "Failed to update user role" };
    }
}

// Delete a user
export async function deleteUser(userId: string): Promise<ActionState> {
    await requireSuperAdmin();

    try {
        await connectToDatabase();

        // Remove all event roles for this user
        await EventRole.deleteMany({ userId });

        // Delete the user
        await User.findByIdAndDelete(userId);

        revalidatePath("/admin/users");
        return { success: true, message: "User deleted successfully" };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, message: "Failed to delete user" };
    }
}

// Create a new user manually
export async function createUser(
    email: string,
    name: string,
    globalRole: "super_admin" | "user" = "user"
): Promise<ActionState> {
    await requireSuperAdmin();

    try {
        await connectToDatabase();

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return { success: false, message: "User with this email already exists" };
        }

        await User.create({
            email: email.toLowerCase(),
            name,
            globalRole,
        });

        revalidatePath("/admin/users");
        return { success: true, message: "User created successfully" };
    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, message: "Failed to create user" };
    }
}

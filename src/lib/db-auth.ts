"use server";

import { connectToDatabase } from "./mongodb";
import { User } from "@/models";
import { auth } from "./auth";

// User sync function - call this on protected pages
export async function syncUserWithDatabase() {
    const session = await auth();

    if (!session?.user?.email) {
        return null;
    }

    try {
        await connectToDatabase();

        let dbUser = await User.findOne({ email: session.user.email });

        if (!dbUser) {
            // Check if this is the super admin email
            const isSuperAdmin = session.user.email === process.env.SUPER_ADMIN_EMAIL;

            // Create new user
            dbUser = await User.create({
                email: session.user.email,
                name: session.user.name || "Unknown",
                image: session.user.image,
                role: isSuperAdmin ? "super_admin" : "guest",
            });
        } else {
            // Update name and image if changed
            if (dbUser.name !== session.user.name || dbUser.image !== session.user.image) {
                dbUser.name = session.user.name || dbUser.name;
                dbUser.image = session.user.image || dbUser.image;
                await dbUser.save();
            }
        }

        return {
            _id: dbUser._id.toString(),
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            assignedTeams: dbUser.assignedTeams || [],
        };
    } catch (error) {
        console.error("Error syncing user with database:", error);
        return null;
    }
}

// Get current user with role from database
export async function getCurrentUserWithRole() {
    const session = await auth();

    if (!session?.user?.email) {
        return null;
    }

    try {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: session.user.email }).lean();

        if (dbUser) {
            return {
                _id: dbUser._id.toString(),
                email: dbUser.email,
                name: dbUser.name,
                role: dbUser.role,
                assignedTeams: dbUser.assignedTeams || [],
            };
        }

        return null;
    } catch (error) {
        console.error("Error getting user:", error);
        return null;
    }
}

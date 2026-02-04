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

        let dbUser = await User.findOne({ email: session.user.email.toLowerCase() });

        if (!dbUser) {
            // Check if this is the super admin email
            const isSuperAdmin = session.user.email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL?.toLowerCase();

            // Create new user with V2 schema
            dbUser = await User.create({
                email: session.user.email.toLowerCase(),
                name: session.user.name || "Unknown",
                image: session.user.image,
                globalRole: isSuperAdmin ? "super_admin" : "user",
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
            globalRole: dbUser.globalRole,
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
        const dbUser = await User.findOne({ email: session.user.email.toLowerCase() }).lean();

        if (dbUser) {
            return {
                _id: dbUser._id.toString(),
                email: dbUser.email,
                name: dbUser.name,
                globalRole: dbUser.globalRole,
            };
        }

        return null;
    } catch (error) {
        console.error("Error getting user:", error);
        return null;
    }
}

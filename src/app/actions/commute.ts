"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { CommuteSchedule } from "@/models";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CommuteSchema = z.object({
    busNumber: z.string().min(1, "Bus number is required"),
    busColor: z.string().min(1, "Bus color is required"),
    route: z.string().min(1, "Route is required"),
    stops: z.array(z.string()),
    departureTime: z.string().min(1, "Departure time is required"),
    arrivalTime: z.string().min(1, "Arrival time is required"),
    date: z.string(),
    capacity: z.number().min(1, "Capacity must be at least 1"),
});

export interface CommuteActionState {
    success: boolean;
    message: string;
}

// Create commute schedule
export async function createCommuteSchedule(
    prevState: CommuteActionState,
    formData: FormData
): Promise<CommuteActionState> {
    try {
        await requireSuperAdmin();
    } catch {
        return { success: false, message: "Not authorized — super admin only" };
    }

    try {
        await connectToDatabase();

        const stopsRaw = formData.get("stops") as string;
        const stops = stopsRaw.split(",").map((s) => s.trim()).filter(Boolean);

        const data = {
            busNumber: (formData.get("busNumber") as string).trim(),
            busColor: (formData.get("busColor") as string).trim(),
            route: (formData.get("route") as string).trim(),
            stops,
            departureTime: formData.get("departureTime") as string,
            arrivalTime: formData.get("arrivalTime") as string,
            date: formData.get("date") as string,
            capacity: parseInt(formData.get("capacity") as string) || 50,
        };

        const validation = CommuteSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, message: validation.error.errors[0].message };
        }

        await CommuteSchedule.create({
            ...data,
            date: new Date(data.date),
            isActive: true,
        });

        revalidatePath("/volunteer");

        return { success: true, message: "Schedule created successfully" };
    } catch (error) {
        console.error("Error creating schedule:", error);
        return { success: false, message: "An error occurred" };
    }
}

// Get all commute schedules
export async function getCommuteSchedules() {
    try {
        await connectToDatabase();

        const schedules = await CommuteSchedule.find({ isActive: true })
            .sort({ date: 1, departureTime: 1 })
            .lean();

        return schedules.map((s) => ({
            _id: s._id.toString(),
            busNumber: s.busNumber,
            busColor: s.busColor,
            route: s.route,
            stops: s.stops,
            departureTime: s.departureTime,
            arrivalTime: s.arrivalTime,
            date: s.date,
            capacity: s.capacity,
        }));
    } catch (error) {
        console.error("Error fetching schedules:", error);
        return [];
    }
}

// Delete commute schedule
export async function deleteCommuteSchedule(id: string): Promise<CommuteActionState> {
    try {
        await requireSuperAdmin();
    } catch {
        return { success: false, message: "Not authorized — super admin only" };
    }

    try {
        await connectToDatabase();
        await CommuteSchedule.findByIdAndUpdate(id, { isActive: false });
        revalidatePath("/volunteer");
        return { success: true, message: "Schedule deleted" };
    } catch (error) {
        console.error("Error deleting schedule:", error);
        return { success: false, message: "An error occurred" };
    }
}

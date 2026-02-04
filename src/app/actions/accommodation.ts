"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { AccommodationBooking, Team, Member } from "@/models";
import { sanitizeInput } from "@/lib/utils";
import { RoomType, FoodPreference } from "@/types";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const AccommodationSchema = z.object({
    teamCode: z.string().min(3, "Team code is required"),
    checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    roomType: z.enum(["dorm", "suite"] as const),
    memberIds: z.array(z.string()).min(1, "Select at least one member"),
    foodRequired: z.boolean(),
    foodPreference: z.enum(["veg", "non-veg"] as const).optional(),
});

export interface AccommodationBookingState {
    success: boolean;
    message: string;
    bookingId?: string;
    errors?: Record<string, string[]>;
}

export async function createAccommodationBooking(
    prevState: AccommodationBookingState,
    formData: FormData
): Promise<AccommodationBookingState> {
    try {
        await connectToDatabase();

        const teamCode = sanitizeInput(formData.get("teamCode") as string).toUpperCase();
        const memberIds = formData.getAll("memberIds") as string[];
        const foodRequired = formData.get("foodRequired") === "true";

        const data = {
            teamCode,
            checkInDate: formData.get("checkInDate") as string,
            checkOutDate: formData.get("checkOutDate") as string,
            roomType: formData.get("roomType") as RoomType,
            memberIds,
            foodRequired,
            foodPreference: foodRequired
                ? (formData.get("foodPreference") as FoodPreference)
                : undefined,
        };

        // Validate
        const validationResult = AccommodationSchema.safeParse(data);
        if (!validationResult.success) {
            const errors: Record<string, string[]> = {};
            validationResult.error.errors.forEach((err) => {
                const path = err.path.join(".");
                if (!errors[path]) errors[path] = [];
                errors[path].push(err.message);
            });
            return {
                success: false,
                message: "Please fix the validation errors",
                errors,
            };
        }

        // Find team
        const team = await Team.findOne({ teamCode });
        if (!team) {
            return {
                success: false,
                message: "Invalid team code. Please check and try again.",
            };
        }

        // Check if booking already exists for this team
        const existingBooking = await AccommodationBooking.findOne({
            teamId: team._id,
            status: { $ne: "cancelled" },
        });

        if (existingBooking) {
            return {
                success: false,
                message: "A booking already exists for this team.",
            };
        }

        // Validate dates
        const checkIn = new Date(data.checkInDate);
        const checkOut = new Date(data.checkOutDate);
        const eventStart = new Date("2026-02-27");
        const eventEnd = new Date("2026-03-01");

        if (checkIn < eventStart || checkOut > eventEnd) {
            return {
                success: false,
                message: "Dates must be within the event period (Feb 27 - Mar 1, 2026)",
            };
        }

        if (checkIn >= checkOut) {
            return {
                success: false,
                message: "Check-out date must be after check-in date",
            };
        }

        // Create booking
        const booking = await AccommodationBooking.create({
            teamId: team._id,
            teamCode: team.teamCode,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            roomType: data.roomType,
            memberIds: memberIds,
            foodRequired: data.foodRequired,
            foodPreference: data.foodPreference,
            totalMembers: memberIds.length,
            status: "pending",
        });

        revalidatePath("/admin/accommodation");
        revalidatePath("/admin");

        return {
            success: true,
            message: "Accommodation booked successfully!",
            bookingId: booking._id.toString(),
        };
    } catch (error) {
        console.error("Accommodation booking error:", error);
        return {
            success: false,
            message: "An error occurred. Please try again.",
        };
    }
}

// Get team members for accommodation form
export async function getTeamMembersForBooking(teamCode: string) {
    try {
        await connectToDatabase();

        const team = await Team.findOne({ teamCode: teamCode.toUpperCase() });
        if (!team) return null;

        const members = await Member.find({ teamId: team._id }).lean();

        return {
            team: {
                _id: team._id.toString(),
                teamCode: team.teamCode,
                projectName: team.projectName,
            },
            members: members.map((m) => ({
                _id: m._id.toString(),
                fullName: m.fullName,
                titlePrefix: m.titlePrefix,
                isTeamLead: m.isTeamLead,
            })),
        };
    } catch (error) {
        console.error("Error fetching team members:", error);
        return null;
    }
}

// Get all bookings (for admin)
export async function getAllBookings() {
    try {
        await connectToDatabase();

        const bookings = await AccommodationBooking.find()
            .sort({ createdAt: -1 })
            .lean();

        return bookings.map((booking) => ({
            ...booking,
            _id: booking._id.toString(),
            teamId: booking.teamId.toString(),
            memberIds: booking.memberIds.map((id) => id.toString()),
        }));
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return [];
    }
}

// Get booking stats
export async function getBookingStats() {
    try {
        await connectToDatabase();

        const totalBookings = await AccommodationBooking.countDocuments({
            status: { $ne: "cancelled" },
        });

        const dormBookings = await AccommodationBooking.countDocuments({
            roomType: "dorm",
            status: { $ne: "cancelled" },
        });

        const suiteBookings = await AccommodationBooking.countDocuments({
            roomType: "suite",
            status: { $ne: "cancelled" },
        });

        const vegCount = await AccommodationBooking.countDocuments({
            foodRequired: true,
            foodPreference: "veg",
            status: { $ne: "cancelled" },
        });

        const nonVegCount = await AccommodationBooking.countDocuments({
            foodRequired: true,
            foodPreference: "non-veg",
            status: { $ne: "cancelled" },
        });

        const totalMembers = await AccommodationBooking.aggregate([
            { $match: { status: { $ne: "cancelled" } } },
            { $group: { _id: null, total: { $sum: "$totalMembers" } } },
        ]);

        return {
            totalBookings,
            dormBookings,
            suiteBookings,
            vegCount,
            nonVegCount,
            totalMembers: totalMembers[0]?.total || 0,
        };
    } catch (error) {
        console.error("Error fetching booking stats:", error);
        return {
            totalBookings: 0,
            dormBookings: 0,
            suiteBookings: 0,
            vegCount: 0,
            nonVegCount: 0,
            totalMembers: 0,
        };
    }
}

// Update booking status
export async function updateBookingStatus(
    bookingId: string,
    status: "pending" | "confirmed" | "cancelled"
) {
    try {
        await connectToDatabase();

        await AccommodationBooking.findByIdAndUpdate(bookingId, { status });

        revalidatePath("/admin/accommodation");

        return { success: true };
    } catch (error) {
        console.error("Error updating booking status:", error);
        return { success: false, error: "Failed to update booking status" };
    }
}

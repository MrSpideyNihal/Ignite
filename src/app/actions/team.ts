"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { Team, Member, Coupon } from "@/models";
import { generateTeamCode, generateCouponCode, sanitizeInput } from "@/lib/utils";
import {
    TitlePrefix,
    EngineeringBranch,
    ProjectName,
    ProjectCode,
    PROJECT_NAMES,
    PROJECT_CODES
} from "@/types";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Validation schemas
const MemberSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
    titlePrefix: z.enum(["Mr", "Ms", "Dr", "NA"] as const),
    collegeName: z.string().min(2, "College name is required").max(200),
    yearOfPassing: z.number().min(2025).max(2030),
    branch: z.enum(["CSE", "IT", "ECE", "Mechanical", "Civil", "Electrical", "Others"] as const),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    isTeamLead: z.boolean(),
});

const GuideSchema = z.object({
    name: z.string().min(2, "Guide name is required").max(100),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Invalid phone number"),
});

const TeamRegistrationSchema = z.object({
    projectName: z.enum(PROJECT_NAMES),
    projectCode: z.enum(PROJECT_CODES),
    guide: GuideSchema,
    members: z.array(MemberSchema).min(1, "At least one member is required").max(8),
});

export interface TeamRegistrationState {
    success: boolean;
    message: string;
    teamCode?: string;
    errors?: Record<string, string[]>;
}

export async function registerTeam(
    prevState: TeamRegistrationState,
    formData: FormData
): Promise<TeamRegistrationState> {
    try {
        await connectToDatabase();

        // Parse form data
        const membersData: z.infer<typeof MemberSchema>[] = [];
        let memberIndex = 0;

        while (formData.get(`members[${memberIndex}][fullName]`)) {
            const member = {
                fullName: sanitizeInput(formData.get(`members[${memberIndex}][fullName]`) as string),
                titlePrefix: formData.get(`members[${memberIndex}][titlePrefix]`) as TitlePrefix,
                collegeName: sanitizeInput(formData.get(`members[${memberIndex}][collegeName]`) as string),
                yearOfPassing: parseInt(formData.get(`members[${memberIndex}][yearOfPassing]`) as string),
                branch: formData.get(`members[${memberIndex}][branch]`) as EngineeringBranch,
                email: (formData.get(`members[${memberIndex}][email]`) as string) || "",
                phone: (formData.get(`members[${memberIndex}][phone]`) as string) || "",
                isTeamLead: memberIndex === 0,
            };
            membersData.push(member);
            memberIndex++;
        }

        const data = {
            projectName: formData.get("projectName") as ProjectName,
            projectCode: formData.get("projectCode") as ProjectCode,
            guide: {
                name: sanitizeInput(formData.get("guide[name]") as string),
                email: (formData.get("guide[email]") as string).toLowerCase().trim(),
                phone: (formData.get("guide[phone]") as string).trim(),
            },
            members: membersData,
        };

        // Validate
        const validationResult = TeamRegistrationSchema.safeParse(data);
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

        // Generate unique team code
        let teamCode = generateTeamCode();
        let attempts = 0;
        while (await Team.findOne({ teamCode }) && attempts < 5) {
            teamCode = generateTeamCode();
            attempts++;
        }

        // Create team
        const team = await Team.create({
            teamCode,
            projectName: data.projectName,
            projectCode: data.projectCode,
            guide: data.guide,
            memberCount: data.members.length,
        });

        // Create members and coupons
        const eventDate = new Date("2026-02-28");

        for (let i = 0; i < data.members.length; i++) {
            const memberData = data.members[i];
            const lunchCouponCode = generateCouponCode(teamCode, i + 1, "lunch");

            const member = await Member.create({
                ...memberData,
                teamId: team._id,
                couponCode: lunchCouponCode,
            });

            // Create lunch coupon for each member
            await Coupon.create({
                code: lunchCouponCode,
                teamId: team._id,
                teamCode,
                memberId: member._id,
                memberName: memberData.fullName,
                type: "lunch",
                date: eventDate,
                status: "issued",
            });

            // Create tea coupon
            const teaCouponCode = generateCouponCode(teamCode, i + 1, "tea");
            await Coupon.create({
                code: teaCouponCode,
                teamId: team._id,
                teamCode,
                memberId: member._id,
                memberName: memberData.fullName,
                type: "tea",
                date: eventDate,
                status: "issued",
            });
        }

        revalidatePath("/admin/teams");
        revalidatePath("/admin");

        return {
            success: true,
            message: "Team registered successfully!",
            teamCode,
        };
    } catch (error) {
        console.error("Team registration error:", error);
        return {
            success: false,
            message: "An error occurred during registration. Please try again.",
        };
    }
}

// Get team by code
export async function getTeamByCode(teamCode: string) {
    try {
        await connectToDatabase();

        const team = await Team.findOne({ teamCode: teamCode.toUpperCase() }).lean();
        if (!team) return null;

        const members = await Member.find({ teamId: team._id }).lean();

        return {
            ...team,
            members,
            _id: team._id.toString(),
        };
    } catch (error) {
        console.error("Error fetching team:", error);
        return null;
    }
}

// Get all teams (for admin)
export async function getAllTeams() {
    try {
        await connectToDatabase();

        const teams = await Team.find()
            .sort({ createdAt: -1 })
            .lean();

        return teams.map(team => ({
            ...team,
            _id: team._id.toString(),
        }));
    } catch (error) {
        console.error("Error fetching teams:", error);
        return [];
    }
}

// Get team stats
export async function getTeamStats() {
    try {
        await connectToDatabase();

        const totalTeams = await Team.countDocuments();
        const totalMembers = await Member.countDocuments();

        return {
            totalTeams,
            totalMembers,
        };
    } catch (error) {
        console.error("Error fetching stats:", error);
        return { totalTeams: 0, totalMembers: 0 };
    }
}

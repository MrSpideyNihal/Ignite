// User and Auth Types
export type UserRole =
    | "super_admin"
    | "accommodation_admin"
    | "food_admin"
    | "commute_admin"
    | "venue_admin"
    | "guest"
    | "jury_admin"
    | "jury_member"
    | "volunteer";

export interface IUser {
    _id: string;
    email: string;
    name: string;
    image?: string;
    role: UserRole;
    phone?: string;
    yearOfPassing?: number;
    branch?: string;
    assignedTeams?: string[]; // For jury members
    createdAt: Date;
    updatedAt: Date;
}

// Title Prefix
export type TitlePrefix = "Mr" | "Ms" | "Dr" | "NA";

// Engineering Branches
export type EngineeringBranch =
    | "CSE"
    | "IT"
    | "ECE"
    | "Mechanical"
    | "Civil"
    | "Electrical"
    | "Others";

// Member Interface
export interface IMember {
    _id: string;
    fullName: string;
    titlePrefix: TitlePrefix;
    collegeName: string;
    yearOfPassing: number;
    branch: EngineeringBranch;
    email?: string;
    phone?: string;
    teamId: string;
    isTeamLead: boolean;
    couponCode?: string;
    createdAt: Date;
}

// Guide/Mentor Interface
export interface IGuide {
    name: string;
    email: string;
    phone: string;
}

// Projects
export const PROJECT_NAMES = [
    "AI Healthcare",
    "Sustainable Energy",
    "Smart Agriculture",
    "EdTech Platform",
    "FinTech Solution",
    "IoT Smart City",
    "Cybersecurity Tool",
    "AR/VR Experience",
    "Blockchain Supply Chain",
    "Climate Tech Innovation",
] as const;

export type ProjectName = (typeof PROJECT_NAMES)[number];

export const PROJECT_CODES = [
    "PROJ-001",
    "PROJ-002",
    "PROJ-003",
    "PROJ-004",
    "PROJ-005",
    "PROJ-006",
    "PROJ-007",
    "PROJ-008",
    "PROJ-009",
    "PROJ-010",
    "PROJ-011",
    "PROJ-012",
    "PROJ-013",
    "PROJ-014",
    "PROJ-015",
    "PROJ-016",
    "PROJ-017",
    "PROJ-018",
    "PROJ-019",
    "PROJ-020",
] as const;

export type ProjectCode = (typeof PROJECT_CODES)[number];

// Team Interface
export interface ITeam {
    _id: string;
    teamCode: string;
    projectName: ProjectName;
    projectCode: ProjectCode;
    guide: IGuide;
    members: IMember[];
    createdAt: Date;
    updatedAt: Date;
}

// Room Types
export type RoomType = "dorm" | "suite";

// Food Preference
export type FoodPreference = "veg" | "non-veg";

// Accommodation Booking
export interface IAccommodationBooking {
    _id: string;
    teamId: string;
    teamCode: string;
    checkInDate: Date;
    checkOutDate: Date;
    roomType: RoomType;
    memberIds: string[];
    foodRequired: boolean;
    foodPreference?: FoodPreference;
    totalMembers: number;
    status: "pending" | "confirmed" | "cancelled";
    createdAt: Date;
    updatedAt: Date;
}

// Coupon Status
export type CouponStatus = "issued" | "used";

// Coupon Interface
export interface ICoupon {
    _id: string;
    code: string;
    teamId: string;
    memberId: string;
    memberName: string;
    type: "lunch" | "tea" | "dinner";
    status: CouponStatus;
    usedAt?: Date;
    usedBy?: string; // Admin who marked it used
    createdAt: Date;
}

// Announcement Interface
export interface IAnnouncement {
    _id: string;
    title: string;
    content: string;
    category: "general" | "accommodation" | "food" | "commute" | "venue" | "jury";
    priority: "low" | "medium" | "high";
    createdBy: string;
    createdByName: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Commute Schedule
export interface ICommuteSchedule {
    _id: string;
    busNumber: string;
    busColor: string;
    route: string;
    stops: string[];
    departureTime: string;
    arrivalTime: string;
    date: Date;
    capacity: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Venue Info
export interface IVenueInfo {
    _id: string;
    name: string;
    address: string;
    description: string;
    mapUrl?: string;
    contactPhone?: string;
    contactEmail?: string;
    facilities: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Evaluation Question
export interface IEvaluationQuestion {
    _id: string;
    question: string;
    description?: string;
    maxScore: number;
    order: number;
    isActive: boolean;
    createdAt: Date;
}

// Evaluation Submission
export interface IEvaluationSubmission {
    _id: string;
    teamId: string;
    teamCode: string;
    projectName: string;
    juryMemberId: string;
    juryMemberName: string;
    ratings: {
        questionId: string;
        score: number;
        comment?: string;
    }[];
    overallComment?: string;
    totalScore: number;
    isLocked: boolean;
    submittedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Form State Types
export interface FormState {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
    data?: unknown;
}

// Dashboard Stats
export interface DashboardStats {
    totalTeams: number;
    totalMembers: number;
    totalBookings: number;
    totalCoupons: number;
    usedCoupons: number;
    vegFoodCount: number;
    nonVegFoodCount: number;
    dormBookings: number;
    suiteBookings: number;
}

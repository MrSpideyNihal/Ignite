// Global roles
export type GlobalRole = "super_admin" | "user";

// Event-scoped roles
export type EventRoleType =
    | "jury_admin"
    | "jury_member"
    | "registration_committee"
    | "food_committee"
    | "logistics_committee";

// Combined role type for checking
export type AnyRole = GlobalRole | EventRoleType;

// User types
export interface UserInfo {
    id: string;
    email: string;
    name: string;
    image?: string;
    globalRole: GlobalRole;
    eventRoles?: { eventId: string; role: EventRoleType }[];
}

// Event types
export interface EventInfo {
    _id: string;
    name: string;
    year: number;
    date: string;
    description?: string;
    venue?: string;
    status: "draft" | "active" | "archived";
    settings: {
        registrationOpen: boolean;
        evaluationOpen: boolean;
        maxTeamSize: number;
    };
}

// Team types
export type TeamStatus = "pending" | "approved" | "rejected";
export type Prefix = "Mr" | "Ms" | "Dr" | "NA";
export type FoodPreference = "veg" | "non-veg";

export interface TeamInfo {
    _id: string;
    eventId: string;
    teamCode: string;
    projectName: string;
    projectCode: string;
    status: TeamStatus;
    teamLead: {
        name: string;
        email?: string;
        phone: string;
    };
    guide?: {
        name: string;
        email?: string;
        phone?: string;
    };
    memberCount?: number;
}

export interface TeamMemberInfo {
    _id: string;
    teamId: string;
    prefix: Prefix;
    name: string;
    college: string;
    branch: string;
    yearOfPassing: number;
    phone?: string;
    email?: string;
    isAttending: boolean;
    accommodation?: {
        required: boolean;
        type?: "dorm" | "suite";
        dates?: string[];
    };
    foodPreference: FoodPreference;
}

// Coupon types
export type CouponType = "lunch" | "tea" | "dinner" | "kit";

export interface CouponInfo {
    _id: string;
    couponCode: string;
    memberName: string;
    type: CouponType;
    date: string;
    isUsed: boolean;
    usedAt?: string;
}

// Jury types
export type SubmissionStatus = "draft" | "submitted" | "locked" | "sent_back";

export interface EvaluationQuestionInfo {
    _id: string;
    question: string;
    description?: string;
    maxScore: number;
    weightage: number;
    order: number;
}

export interface EvaluationSubmissionInfo {
    _id: string;
    teamCode: string;
    projectName: string;
    juryName: string;
    status: SubmissionStatus;
    totalScore: number;
    maxPossibleScore: number;
    submittedAt?: string;
}

// Action response types
export interface ActionState {
    success: boolean;
    message: string;
    data?: unknown;
}

import { v4 as uuidv4 } from "uuid";

/**
 * Generate a unique team code
 */
export function generateTeamCode(): string {
    const prefix = "IGN";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp.slice(-4)}${random}`;
}

/**
 * Generate a unique coupon code for a team member
 */
export function generateCouponCode(
    teamCode: string,
    memberIndex: number,
    type: "lunch" | "tea" | "dinner"
): string {
    const typePrefix = type === "lunch" ? "L" : type === "tea" ? "T" : "D";
    const random = Math.random().toString(36).substring(2, 4).toUpperCase();
    return `${teamCode}-${typePrefix}${String(memberIndex).padStart(2, "0")}${random}`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

/**
 * Format date to input value
 */
export function formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
}

/**
 * Get days between two dates
 */
export function getDaysBetween(start: Date, end: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((end.getTime() - start.getTime()) / oneDay));
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (Indian format)
 */
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ""));
}

/**
 * Sanitize input string
 */
export function sanitizeInput(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, "")
        .substring(0, 500);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
    return uuidv4();
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(str: string): string {
    return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.substring(0, length - 3) + "...";
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
    return new Intl.NumberFormat("en-IN").format(num);
}

/**
 * Check if date is within event range
 */
export function isWithinEventRange(date: Date): boolean {
    const start = new Date("2026-02-27");
    const end = new Date("2026-03-01");
    return date >= start && date <= end;
}

/**
 * Get event dates
 */
export function getEventDates(): { start: Date; end: Date } {
    return {
        start: new Date("2026-02-27"),
        end: new Date("2026-03-01"),
    };
}

/**
 * Class name helper (like clsx)
 */
export function cn(...classes: unknown[]): string {
    return classes.filter(Boolean).join(" ");
}

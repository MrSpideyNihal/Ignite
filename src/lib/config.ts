// ============================================================
// SITE CONFIGURATION
// Change these values in next.config.js env section or via
// environment variables to customize the event name/year/date.
// ============================================================

const eventName = process.env.NEXT_PUBLIC_EVENT_NAME || "IGNITE";
const eventYear = process.env.NEXT_PUBLIC_EVENT_YEAR || "2026";
const eventDateStr = process.env.NEXT_PUBLIC_EVENT_DATE || "2026-02-28";

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export const SITE = {
    /** Event name without year, e.g. "IGNITE" */
    name: eventName,
    /** Event year, e.g. "2026" */
    year: eventYear,
    /** Full event name, e.g. "IGNITE 2026" */
    fullName: `${eventName} ${eventYear}`,
    /** Raw date string, e.g. "2026-02-28" */
    date: eventDateStr,
    /** Formatted date, e.g. "February 28, 2026" */
    formattedDate: formatDate(eventDateStr),
} as const;

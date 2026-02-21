import { getMemberCoupons } from "@/app/actions/coupon";
import { getEvent } from "@/app/actions/event";
import { connectToDatabase } from "@/lib/mongodb";
import { Team, TeamMember } from "@/models";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import QRCode from "qrcode";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

interface Props {
    params: { teamCode: string };
}

async function fetchQRDataUrl(text: string): Promise<string> {
    return QRCode.toDataURL(text, {
        width: 180,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
    });
}

export default async function CouponPDFPage({ params }: Props) {
    // Require Google sign-in (the team code URL itself is the access key)
    const session = await auth();
    if (!session?.user?.email) redirect("/auth/signin");

    await connectToDatabase();
    const team = await Team.findOne({ teamCode: params.teamCode.toUpperCase() }).lean();
    if (!team) notFound();

    // 3. Fetch data
    const event = await getEvent(team.eventId.toString());
    const coupons = await getMemberCoupons(team._id.toString());

    // Group coupons by memberId → type → {code, qrUrl}
    const memberCouponMap: Record<string, Record<string, { code: string; qrUrl: string }>> = {};
    for (const coupon of coupons) {
        if (!memberCouponMap[coupon.memberId]) memberCouponMap[coupon.memberId] = {};
        const qrUrl = await fetchQRDataUrl(coupon.couponCode);
        memberCouponMap[coupon.memberId][coupon.type] = { code: coupon.couponCode, qrUrl };
    }

    const members = await TeamMember.find({ teamId: team._id }).lean();

    const mealSlots = event?.settings?.mealSlots ?? ["lunch", "tea"];
    const mealEmojis: Record<string, string> = {
        breakfast: "🌅", lunch: "🍱", tea: "☕", dinner: "🍛",
    };

    return (
        <>
            {/* Print-specific CSS */}
            <style>{`
                @media print {
                    .print-hide { display: none !important; }
                    nav, header, footer, .navbar { display: none !important; }
                    body { background: white !important; }
                    .pdf-header { background: #1a1a2e !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .coupon-card-border { border-color: #6366f1 !important; }
                }
            `}</style>

            <div className="min-h-screen" style={{ background: "#f5f5f5", fontFamily: "Arial, sans-serif" }}>
                {/* Header */}
                <div
                    className="pdf-header"
                    style={{
                        textAlign: "center",
                        padding: "20px",
                        background: "#1a1a2e",
                        color: "white",
                    }}
                >
                    <h1 style={{ fontSize: "22px", margin: 0 }}>🎟️ Food Coupons — {team.teamCode}</h1>
                    <p style={{ fontSize: "14px", opacity: 0.7, marginTop: "4px" }}>
                        {event?.name ?? ""} | {team.projectName}
                    </p>
                </div>

                {/* Print Button — client component */}
                <PrintButton />

                {/* No coupons message */}
                {coupons.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                        <p style={{ fontSize: "18px" }}>No food coupons have been generated for this team yet.</p>
                        <p style={{ fontSize: "14px", marginTop: "8px" }}>
                            Contact the logistics committee to generate coupons.
                        </p>
                    </div>
                )}

                {/* Coupons per member */}
                {members.map((member) => {
                    const memberCoupons = memberCouponMap[member._id.toString()] ?? {};
                    return (
                        <div key={member._id.toString()} style={{ padding: "16px" }}>
                            <div
                                style={{
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    color: "#1a1a2e",
                                    padding: "8px 12px",
                                    background: "#e0e7ff",
                                    borderRadius: "8px",
                                    marginBottom: "12px",
                                }}
                            >
                                👤 {member.prefix ? `${member.prefix}. ` : ""}{member.name}
                            </div>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                                    gap: "12px",
                                    marginBottom: "20px",
                                }}
                            >
                                {mealSlots.map((slot) => {
                                    const c = memberCoupons[slot];
                                    if (!c) {
                                        return (
                                            <div
                                                key={slot}
                                                style={{
                                                    background: "#f9fafb",
                                                    border: "2px dashed #d1d5db",
                                                    borderRadius: "12px",
                                                    padding: "16px",
                                                    textAlign: "center",
                                                    color: "#9ca3af",
                                                    fontSize: "13px",
                                                }}
                                            >
                                                {mealEmojis[slot] ?? "🍽️"} {slot.charAt(0).toUpperCase() + slot.slice(1)}
                                                <br />
                                                <span>No coupon</span>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div
                                            key={slot}
                                            className="coupon-card-border"
                                            style={{
                                                background: "white",
                                                border: "2px dashed #6366f1",
                                                borderRadius: "12px",
                                                padding: "16px",
                                                textAlign: "center",
                                                pageBreakInside: "avoid",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: "14px",
                                                    fontWeight: "bold",
                                                    color: "#4338ca",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "1px",
                                                    marginBottom: "8px",
                                                }}
                                            >
                                                {mealEmojis[slot] ?? "🍽️"} {slot.charAt(0).toUpperCase() + slot.slice(1)}
                                            </div>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={c.qrUrl}
                                                alt={`QR for ${c.code}`}
                                                style={{ width: 140, height: 140, display: "block", margin: "0 auto 8px" }}
                                            />
                                            <div
                                                style={{
                                                    fontFamily: "monospace",
                                                    fontSize: "13px",
                                                    color: "#374151",
                                                    background: "#f3f4f6",
                                                    padding: "4px 8px",
                                                    borderRadius: "4px",
                                                }}
                                            >
                                                {c.code}
                                            </div>
                                            <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "6px" }}>
                                                {member.name}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

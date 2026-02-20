import { getMemberCoupons } from "@/app/actions/coupon";
import { getEvent } from "@/app/actions/event";
import { connectToDatabase } from "@/lib/mongodb";
import { Team } from "@/models";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import QRCode from "qrcode";

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
    const session = await auth();
    if (!session?.user?.email) redirect("/auth/signin");

    await connectToDatabase();
    const team = await Team.findOne({ teamCode: params.teamCode.toUpperCase() }).lean();
    if (!team) notFound();

    // Only team lead OR event committee can view
    const isTeamLead = team.teamLead?.email === session.user.email;
    if (!isTeamLead) {
        const { EventRole } = await import("@/models");
        const role = await EventRole.findOne({
            eventId: team.eventId,
            userEmail: session.user.email,
        });
        if (!role) redirect("/unauthorized");
    }

    const event = await getEvent(team.eventId.toString());
    const coupons = await getMemberCoupons(team._id.toString());

    // Group coupons by memberId → type → {code, qrUrl}
    const memberCouponMap: Record<string, Record<string, { code: string; qrUrl: string }>> = {};
    for (const coupon of coupons) {
        if (!memberCouponMap[coupon.memberId]) memberCouponMap[coupon.memberId] = {};
        const qrUrl = await fetchQRDataUrl(coupon.couponCode);
        memberCouponMap[coupon.memberId][coupon.type] = { code: coupon.couponCode, qrUrl };
    }

    const { TeamMember } = await import("@/models");
    const members = await TeamMember.find({ teamId: team._id }).lean();

    const mealSlots = event?.settings?.mealSlots ?? ["lunch", "tea"];
    const mealEmojis: Record<string, string> = {
        breakfast: "🌅", lunch: "🍱", tea: "☕", dinner: "🍛",
    };

    return (
        <html>
            <head>
                <title>{team.teamCode} — Food Coupons</title>
                <style>{`
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: Arial, sans-serif; background: #f5f5f5; }
                    .page-header { text-align: center; padding: 20px; background: #1a1a2e; color: white; }
                    .page-header h1 { font-size: 22px; }
                    .page-header p { font-size: 14px; opacity: 0.7; margin-top: 4px; }
                    .print-btn {
                        display: block; margin: 16px auto; padding: 10px 28px;
                        background: #6366f1; color: white; border: none;
                        border-radius: 8px; font-size: 15px; cursor: pointer;
                    }
                    .member-section { padding: 16px; }
                    .member-name {
                        font-size: 16px; font-weight: bold; color: #1a1a2e;
                        padding: 8px 12px; background: #e0e7ff;
                        border-radius: 8px; margin-bottom: 12px;
                    }
                    .coupons-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                        gap: 12px; margin-bottom: 20px;
                    }
                    .coupon-card {
                        background: white; border: 2px dashed #6366f1;
                        border-radius: 12px; padding: 16px;
                        text-align: center; page-break-inside: avoid;
                    }
                    .coupon-card .meal-label {
                        font-size: 14px; font-weight: bold; color: #4338ca;
                        text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;
                    }
                    .coupon-card img { width: 140px; height: 140px; display: block; margin: 0 auto 8px; }
                    .coupon-card .code {
                        font-family: monospace; font-size: 13px; color: #374151;
                        background: #f3f4f6; padding: 4px 8px; border-radius: 4px;
                    }
                    .coupon-card .member-label { font-size: 11px; color: #9ca3af; margin-top: 6px; }
                    .no-coupon {
                        background: #f9fafb; border: 2px dashed #d1d5db;
                        border-radius: 12px; padding: 16px;
                        text-align: center; color: #9ca3af; font-size: 13px;
                    }
                    @media print {
                        .print-btn { display: none; }
                        body { background: white; }
                        .page-header { background: #1a1a2e !important; -webkit-print-color-adjust: exact; }
                        .coupon-card { border-color: #6366f1 !important; }
                    }
                `}</style>
            </head>
            <body>
                <div className="page-header">
                    <h1>🎟️ Food Coupons — {team.teamCode}</h1>
                    <p>{event?.name ?? ""} | {team.projectName}</p>
                </div>

                {/* Print button via inline JS — safe in server component HTML context */}
                {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
                <button className="print-btn" id="print-btn">🖨️ Print / Save PDF</button>
                <script dangerouslySetInnerHTML={{ __html: `document.getElementById('print-btn').onclick = function(){ window.print(); }` }} />

                {members.map((member) => {
                    const memberCoupons = memberCouponMap[member._id.toString()] ?? {};
                    return (
                        <div key={member._id.toString()} className="member-section">
                            <div className="member-name">👤 {member.prefix}. {member.name}</div>
                            <div className="coupons-grid">
                                {mealSlots.map((slot) => {
                                    const c = memberCoupons[slot];
                                    if (!c) {
                                        return (
                                            <div key={slot} className="no-coupon">
                                                {mealEmojis[slot] ?? "🍽️"} {slot.charAt(0).toUpperCase() + slot.slice(1)}<br />
                                                <span>No coupon</span>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={slot} className="coupon-card">
                                            <div className="meal-label">
                                                {mealEmojis[slot] ?? "🍽️"} {slot.charAt(0).toUpperCase() + slot.slice(1)}
                                            </div>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={c.qrUrl} alt={`QR for ${c.code}`} />
                                            <div className="code">{c.code}</div>
                                            <div className="member-label">{member.name}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </body>
        </html>
    );
}

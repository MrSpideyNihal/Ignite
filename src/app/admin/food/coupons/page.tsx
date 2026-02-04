"use client";

import { useState } from "react";
import { getCouponByCode, markCouponAsUsed, CouponActionState } from "@/app/actions/coupon";
import { Input, Button } from "@/components/forms";
import { Card, CardHeader, CardContent, Alert, Badge } from "@/components/ui";
import toast from "react-hot-toast";

export default function CouponsPage() {
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [couponData, setCouponData] = useState<CouponActionState["coupon"] | null>(null);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const handleLookup = async () => {
        if (!code.trim()) {
            toast.error("Please enter a coupon code");
            return;
        }

        setIsLoading(true);
        setCouponData(null);
        setMessage("");

        try {
            const result = await getCouponByCode(code);
            if (result.success && result.coupon) {
                setCouponData(result.coupon);
            } else {
                setMessage(result.message);
                setIsError(true);
            }
        } catch {
            toast.error("Error looking up coupon");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkUsed = async () => {
        if (!couponData) return;

        setIsLoading(true);
        try {
            const result = await markCouponAsUsed(couponData.code);
            if (result.success) {
                toast.success("Coupon marked as used!");
                setCouponData(result.coupon || null);
                setMessage("Coupon has been marked as used successfully.");
                setIsError(false);
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Error marking coupon");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setCode("");
        setCouponData(null);
        setMessage("");
        setIsError(false);
    };

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="page-header text-center">
                        <h1 className="page-title">Coupon Verification</h1>
                        <p className="page-subtitle">Enter or scan a coupon code to verify</p>
                    </div>

                    {/* Lookup Card */}
                    <Card className="mb-6">
                        <CardHeader title="Lookup Coupon" subtitle="Enter the coupon code from the participant" />
                        <CardContent>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="IGN-XXXX-L01XX"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        className="font-mono"
                                    />
                                </div>
                                <Button onClick={handleLookup} loading={isLoading}>
                                    Lookup
                                </Button>
                                {(couponData || message) && (
                                    <Button variant="ghost" onClick={handleClear}>
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Message */}
                    {message && !couponData && (
                        <Alert type={isError ? "error" : "success"} className="mb-6">
                            {message}
                        </Alert>
                    )}

                    {/* Coupon Details */}
                    {couponData && (
                        <Card className="overflow-hidden">
                            <div
                                className={`p-6 text-center text-white ${couponData.status === "used"
                                        ? "bg-gradient-to-r from-gray-500 to-gray-600"
                                        : "bg-gradient-to-r from-green-500 to-emerald-500"
                                    }`}
                            >
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                                    {couponData.status === "used" ? (
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : (
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold mb-2">
                                    {couponData.status === "used" ? "Already Used" : "Valid Coupon"}
                                </h2>
                                <p className="font-mono text-xl">{couponData.code}</p>
                            </div>

                            <CardContent className="py-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                                        <span className="text-gray-600 dark:text-gray-400">Member Name</span>
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                                            {couponData.memberName}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                                        <span className="text-gray-600 dark:text-gray-400">Team Code</span>
                                        <span className="font-mono font-semibold text-primary-500">
                                            {couponData.teamCode}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                                        <span className="text-gray-600 dark:text-gray-400">Type</span>
                                        <Badge variant="primary">{couponData.type.toUpperCase()}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-gray-600 dark:text-gray-400">Status</span>
                                        <Badge variant={couponData.status === "used" ? "danger" : "success"}>
                                            {couponData.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>

                                {couponData.status === "issued" && (
                                    <div className="mt-6">
                                        <Button
                                            className="w-full"
                                            onClick={handleMarkUsed}
                                            loading={isLoading}
                                        >
                                            Mark as Used
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

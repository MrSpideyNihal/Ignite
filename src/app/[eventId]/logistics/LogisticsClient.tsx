"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { scanCoupon } from "@/app/actions/coupon";
import { Input, Button } from "@/components/forms";
import { Alert } from "@/components/ui";
import toast from "react-hot-toast";

interface Props {
    eventId: string;
}

export default function LogisticsClient({ eventId }: Props) {
    const [isPending, startTransition] = useTransition();
    const [couponCode, setCouponCode] = useState("");
    const [lastResult, setLastResult] = useState<{
        success: boolean;
        message: string;
        memberName?: string;
    } | null>(null);
    const [scanMode, setScanMode] = useState<"manual" | "camera">("manual");
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input for quick scanning
    useEffect(() => {
        inputRef.current?.focus();
    }, [lastResult]);

    const handleScan = async () => {
        if (!couponCode.trim()) return;

        startTransition(async () => {
            const result = await scanCoupon(eventId, couponCode.trim());
            setLastResult({
                success: result.success,
                message: result.message,
                memberName: result.coupon?.memberName,
            });

            if (result.success) {
                toast.success(result.message);
                setCouponCode("");
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleScan();
        }
    };

    return (
        <div className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex gap-2 justify-center">
                <button
                    onClick={() => setScanMode("manual")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${scanMode === "manual"
                            ? "bg-primary-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800"
                        }`}
                >
                    ⌨️ Manual Entry
                </button>
                <button
                    onClick={() => setScanMode("camera")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${scanMode === "camera"
                            ? "bg-primary-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800"
                        }`}
                >
                    📷 Camera Scan
                </button>
            </div>

            {scanMode === "manual" ? (
                <>
                    {/* Manual Entry */}
                    <div className="flex gap-3">
                        <Input
                            ref={inputRef}
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter or scan coupon code"
                            className="flex-1 text-center text-xl font-mono tracking-widest"
                            autoComplete="off"
                        />
                        <Button onClick={handleScan} loading={isPending} size="lg">
                            Validate
                        </Button>
                    </div>

                    {/* Result Display */}
                    {lastResult && (
                        <Alert type={lastResult.success ? "success" : "error"} className="text-center">
                            <p className="text-lg font-medium">{lastResult.message}</p>
                        </Alert>
                    )}

                    {/* Success Animation */}
                    {lastResult?.success && (
                        <div className="text-center py-8">
                            <div className="text-6xl animate-bounce">✓</div>
                            <p className="text-2xl font-bold text-green-600 mt-4">
                                {lastResult.memberName}
                            </p>
                        </div>
                    )}
                </>
            ) : (
                /* Camera Mode */
                <div className="text-center py-8">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8">
                        <p className="text-gray-500 mb-4">
                            Camera-based QR scanning requires the{" "}
                            <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                html5-qrcode
                            </code>{" "}
                            library.
                        </p>
                        <p className="text-sm text-gray-400">
                            Install with: <code>npm install html5-qrcode</code>
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            For now, use manual entry mode or a separate QR scanner app.
                        </p>
                    </div>

                    {/* Fallback to Manual */}
                    <Button
                        onClick={() => setScanMode("manual")}
                        variant="outline"
                        className="mt-4"
                    >
                        Switch to Manual Entry
                    </Button>
                </div>
            )}

            {/* Quick Tips */}
            <div className="text-center text-sm text-gray-500">
                <p>💡 Tip: Use a USB barcode scanner for faster entry</p>
                <p>Press Enter after scanning to validate</p>
            </div>
        </div>
    );
}

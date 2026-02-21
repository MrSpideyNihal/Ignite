"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { scanCoupon } from "@/app/actions/coupon";
import { Input, Button } from "@/components/forms";
import { Alert } from "@/components/ui";
import toast from "react-hot-toast";

const MEAL_EMOJIS: Record<string, string> = {
    breakfast: "🌅",
    lunch: "🍱",
    tea: "☕",
    dinner: "🍛",
    kit: "🎁",
};

interface Props {
    eventId: string;
    mealSlots: string[]; // from event.settings.mealSlots
}

export default function LogisticsClient({ eventId, mealSlots }: Props) {
    const [isPending, startTransition] = useTransition();
    const [couponCode, setCouponCode] = useState("");
    const [selectedType, setSelectedType] = useState<string | null>(
        mealSlots.length > 0 ? mealSlots[0] : null
    );
    const [lastResult, setLastResult] = useState<{
        success: boolean;
        message: string;
        memberName?: string;
    } | null>(null);
    const [scanMode, setScanMode] = useState<"manual" | "camera">("manual");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scanMode === "manual") inputRef.current?.focus();
    }, [lastResult, scanMode]);

    const handleScan = useCallback(async (code?: string) => {
        const codeToScan = code || couponCode.trim();
        if (!codeToScan) return;

        startTransition(async () => {
            const result = await scanCoupon(eventId, codeToScan, selectedType ?? undefined);
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
    }, [couponCode, eventId, selectedType, startTransition]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleScan();
    };

    return (
        <div className="space-y-6">
            {/* Meal Type Selector — MUST be selected before scanning */}
            <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center">
                    📌 Select meal type before scanning
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                    {mealSlots.map((slot) => (
                        <button
                            key={slot}
                            onClick={() => setSelectedType(slot)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border-2 ${selectedType === slot
                                ? "bg-primary-500 text-white border-primary-500 scale-105 shadow"
                                : "border-gray-300 dark:border-gray-600 hover:border-primary-400"
                                }`}
                        >
                            {MEAL_EMOJIS[slot] ?? "🍽️"} {slot.charAt(0).toUpperCase() + slot.slice(1)}
                        </button>
                    ))}
                    <button
                        onClick={() => setSelectedType(null)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border-2 ${selectedType === null
                            ? "bg-gray-700 text-white border-gray-700 scale-105"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                            }`}
                    >
                        🔓 Any Type
                    </button>
                </div>
                {selectedType && (
                    <p className="text-center text-xs text-gray-500 mt-2">
                        Scanner will only accept <strong>{selectedType.toUpperCase()}</strong> coupons
                    </p>
                )}
            </div>

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
                        <Button onClick={() => handleScan()} loading={isPending} size="lg">
                            Validate
                        </Button>
                    </div>

                    {lastResult && (
                        <Alert type={lastResult.success ? "success" : "error"} className="text-center">
                            <p className="text-lg font-medium">{lastResult.message}</p>
                        </Alert>
                    )}

                    {lastResult?.success && (
                        <div className="text-center py-8">
                            <div className="text-6xl animate-bounce">✓</div>
                            <p className="text-2xl font-bold text-green-600 mt-4">{lastResult.memberName}</p>
                        </div>
                    )}
                </>
            ) : (
                <CameraScanner
                    onScan={(code) => handleScan(code)}
                    lastResult={lastResult}
                />
            )}

            <div className="text-center text-sm text-gray-500">
                <p>💡 Tip: Use a USB barcode scanner for faster entry</p>
                <p>Press Enter after typing to validate</p>
            </div>
        </div>
    );
}

function CameraScanner({
    onScan,
    lastResult,
}: {
    onScan: (code: string) => void;
    lastResult: { success: boolean; message: string; memberName?: string } | null;
}) {
    const scannerRef = useRef<HTMLDivElement>(null);
    const html5QrCodeRef = useRef<any>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const lastScannedRef = useRef<string>("");
    const lastScanTimeRef = useRef<number>(0);
    // Use a ref to always have the latest onScan callback (avoids stale closure)
    const onScanRef = useRef(onScan);
    onScanRef.current = onScan;

    const startScanner = useCallback(async () => {
        try {
            setError(null);
            const { Html5Qrcode } = await import("html5-qrcode");

            if (html5QrCodeRef.current) {
                try { await html5QrCodeRef.current.stop(); } catch { }
            }

            html5QrCodeRef.current = new Html5Qrcode("qr-reader");

            await html5QrCodeRef.current.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText: string) => {
                    const now = Date.now();
                    if (decodedText === lastScannedRef.current && now - lastScanTimeRef.current < 3000) return;
                    lastScannedRef.current = decodedText;
                    lastScanTimeRef.current = now;
                    onScanRef.current(decodedText.trim().toUpperCase());
                },
                () => { }
            );

            setIsScanning(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to start camera");
            setIsScanning(false);
        }
    }, []);

    const stopScanner = useCallback(async () => {
        if (html5QrCodeRef.current) {
            try { await html5QrCodeRef.current.stop(); } catch { }
            html5QrCodeRef.current = null;
        }
        setIsScanning(false);
    }, []);

    useEffect(() => {
        startScanner();
        return () => { stopScanner(); };
    }, []);

    return (
        <div className="space-y-4">
            <div className="relative mx-auto max-w-md">
                <div id="qr-reader" ref={scannerRef} className="rounded-xl overflow-hidden border-2 border-primary-500" />
                {!isScanning && !error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-xl">
                        <p className="text-white text-lg">Starting camera...</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="text-center">
                    <Alert type="error">
                        <p className="font-medium">Camera Error</p>
                        <p className="text-sm mt-1">{error}</p>
                    </Alert>
                    <Button onClick={startScanner} className="mt-3" size="sm">🔄 Retry Camera</Button>
                </div>
            )}

            {lastResult && (
                <Alert type={lastResult.success ? "success" : "error"} className="text-center">
                    <p className="text-lg font-medium">{lastResult.message}</p>
                </Alert>
            )}
            {lastResult?.success && (
                <div className="text-center py-4">
                    <div className="text-5xl animate-bounce">✓</div>
                    <p className="text-xl font-bold text-green-600 mt-2">{lastResult.memberName}</p>
                </div>
            )}

            <div className="flex justify-center gap-3">
                {isScanning ? (
                    <Button onClick={stopScanner} variant="outline" size="sm">⏹ Stop Camera</Button>
                ) : (
                    <Button onClick={startScanner} size="sm">📷 Start Camera</Button>
                )}
            </div>
        </div>
    );
}

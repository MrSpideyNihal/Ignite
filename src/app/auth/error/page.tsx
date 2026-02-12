import Link from "next/link";

export default function AuthErrorPage({
    searchParams,
}: {
    searchParams: { error?: string };
}) {
    const errors: Record<string, string> = {
        Configuration: "Server configuration error. Please contact the admin.",
        AccessDenied: "Access denied. You may not have permission.",
        Verification: "Token verification failed. Please try again.",
        Default: "An unexpected error occurred during authentication.",
    };

    const errorMessage = errors[searchParams.error || "Default"] || errors.Default;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
            <div className="max-w-md w-full mx-4">
                <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>

                    <h1 className="text-xl font-bold text-white mb-2">Authentication Error</h1>
                    <p className="text-gray-400 mb-6">{errorMessage}</p>

                    <Link
                        href="/auth/signin"
                        className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-6 rounded-xl transition-colors"
                    >
                        Try Again
                    </Link>
                </div>
            </div>
        </div>
    );
}

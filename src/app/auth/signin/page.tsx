import { signIn } from "@/lib/auth";

export default function SignInPage({
    searchParams,
}: {
    searchParams: { callbackUrl?: string; error?: string };
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
            <div className="max-w-md w-full mx-4">
                <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                            IGNITE
                        </h1>
                        <p className="text-gray-400 mt-2">Sign in to continue</p>
                    </div>

                    {/* Error */}
                    {searchParams.error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm text-center">
                                {searchParams.error === "OAuthSignin"
                                    ? "Error starting sign in. Please try again."
                                    : searchParams.error === "OAuthCallback"
                                        ? "Error during sign in. Please try again."
                                        : "An error occurred. Please try again."}
                            </p>
                        </div>
                    )}

                    {/* Google Sign In */}
                    <form
                        action={async () => {
                            "use server";
                            // Validate callbackUrl to prevent open redirects
                            const callback = searchParams.callbackUrl;
                            const safeRedirect = callback && callback.startsWith("/") ? callback : "/";
                            await signIn("google", {
                                redirectTo: safeRedirect,
                            });
                        }}
                    >
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-white/10"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Sign in with Google
                        </button>
                    </form>

                    <p className="text-gray-500 text-xs text-center mt-6">
                        Only authorized members can access admin features.
                    </p>
                </div>
            </div>
        </div>
    );
}

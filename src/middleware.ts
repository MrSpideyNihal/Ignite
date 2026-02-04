import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/admin", "/jury", "/guest"];

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const session = req.auth;

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (isProtectedRoute && !session?.user) {
        // Not authenticated - redirect to sign in
        const signInUrl = new URL("/api/auth/signin", req.url);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(signInUrl);
    }

    // Role-based access will be checked in each page component
    // since we can't access MongoDB in Edge Runtime
    return NextResponse.next();
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files
         */
        "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*|$).*)",
    ],
};

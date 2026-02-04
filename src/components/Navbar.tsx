"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { UserRole } from "@/types";

const roleNavItems: Record<UserRole, { label: string; href: string }[]> = {
    super_admin: [
        { label: "Dashboard", href: "/admin" },
        { label: "All Admins", href: "/admin/users" },
        { label: "Teams", href: "/admin/teams" },
        { label: "Jury", href: "/jury" },
    ],
    accommodation_admin: [
        { label: "Dashboard", href: "/admin/accommodation" },
        { label: "Bookings", href: "/admin/accommodation/bookings" },
    ],
    food_admin: [
        { label: "Dashboard", href: "/admin/food" },
        { label: "Menu", href: "/admin/food/menu" },
        { label: "Coupons", href: "/admin/food/coupons" },
    ],
    commute_admin: [
        { label: "Dashboard", href: "/admin/commute" },
        { label: "Schedule", href: "/admin/commute/schedule" },
    ],
    venue_admin: [
        { label: "Dashboard", href: "/admin/venue" },
        { label: "Announcements", href: "/admin/venue/announcements" },
    ],
    guest: [
        { label: "Overview", href: "/guest" },
    ],
    jury_admin: [
        { label: "Dashboard", href: "/jury" },
        { label: "Questions", href: "/jury/questions" },
        { label: "Submissions", href: "/jury/submissions" },
    ],
    jury_member: [
        { label: "My Evaluations", href: "/jury/evaluate" },
    ],
    volunteer: [
        { label: "Dashboard", href: "/volunteer" },
    ],
};

export function Navbar() {
    const { data: session, status } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const userRole = (session?.user as { role?: UserRole })?.role;

    return (
        <nav className="sticky top-0 z-50 glass border-b border-gray-200 dark:border-gray-800">
            <div className="container-custom">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                            <span className="text-white font-bold text-xl">🔥</span>
                        </div>
                        <span className="text-xl font-bold gradient-text hidden sm:block">
                            IGNITE 2026
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            href="/"
                            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            href="/register"
                            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                        >
                            Register Team
                        </Link>
                        <Link
                            href="/accommodation"
                            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                        >
                            Accommodation
                        </Link>

                        {/* Role-based navigation */}
                        {session && userRole && roleNavItems[userRole] && (
                            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200 dark:border-gray-800">
                                {roleNavItems[userRole].map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center gap-4">
                        {status === "loading" ? (
                            <div className="w-8 h-8 rounded-full skeleton" />
                        ) : session ? (
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {session.user?.name}
                                    </span>
                                    {userRole && (
                                        <span className="text-xs text-gray-500 capitalize">
                                            {userRole.replace("_", " ")}
                                        </span>
                                    )}
                                </div>
                                {session.user?.image && (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || "User"}
                                        className="w-9 h-9 rounded-full border-2 border-primary-200 dark:border-primary-800"
                                    />
                                )}
                                <button
                                    onClick={() => signOut()}
                                    className="btn-ghost text-sm"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/volunteer" className="btn-ghost text-sm">
                                    Volunteer
                                </Link>
                                <button onClick={() => signIn("google")} className="btn-primary text-sm">
                                    Admin Login
                                </button>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Toggle menu"
                        >
                            <svg
                                className="w-6 h-6 text-gray-600 dark:text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isMobileMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden pb-4 animate-slide-up">
                        <div className="flex flex-col gap-2">
                            <Link
                                href="/"
                                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                href="/register"
                                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Register Team
                            </Link>
                            <Link
                                href="/accommodation"
                                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Accommodation
                            </Link>

                            {/* Role-based mobile navigation */}
                            {session && userRole && roleNavItems[userRole] && (
                                <>
                                    <div className="my-2 border-t border-gray-200 dark:border-gray-800" />
                                    {roleNavItems[userRole].map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

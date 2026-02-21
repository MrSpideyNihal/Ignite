import Link from "next/link";

export default function HomePage() {

    return (
        <div className="min-h-screen" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Hero Section */}
            <section className="relative overflow-hidden hero-gradient">
                <div className="absolute inset-0 animated-bg opacity-5"></div>
                <div className="container-custom py-20 md:py-32 relative">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Event Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur border border-gray-200 dark:border-gray-800 shadow-lg mb-8 animate-fade-in">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                February 28, 2026 • Registration Open
                            </span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-in">
                            <span className="gradient-text">IGNITE</span>
                            <span className="text-gray-900 dark:text-gray-100"> 2026</span>
                        </h1>

                        {/* Tagline */}
                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 animate-fade-in leading-relaxed">
                            Innovation. Technology. Excellence.
                            <br />
                            <span className="text-gray-500 dark:text-gray-500">
                                Where brilliant minds come together to shape the future.
                            </span>
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
                            <Link href="/events" className="btn-primary text-lg px-8 py-4">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                    />
                                </svg>
                                Register Your Team
                            </Link>
                            <Link href="/team" className="btn-outline text-lg px-8 py-4">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    />
                                </svg>
                                Book Accommodation
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl"></div>
            </section>

            {/* Features Section */}
            <section className="section bg-white dark:bg-gray-950">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            What to Expect
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Join us for an unforgettable experience of innovation, learning, and networking.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="card-hover p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                                <svg
                                    className="w-8 h-8 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                Innovative Projects
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Showcase cutting-edge projects in AI, IoT, Blockchain, and more.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="card-hover p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center shadow-lg">
                                <svg
                                    className="w-8 h-8 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                Expert Jury
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Get evaluated by industry experts and academic leaders.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="card-hover p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg">
                                <svg
                                    className="w-8 h-8 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                Amazing Prizes
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Win exciting prizes and recognition for your innovations.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Event Info Section */}
            <section className="section bg-gray-50 dark:bg-gray-900">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                Event Details
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                                        <svg
                                            className="w-6 h-6 text-primary-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                            Date
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            February 28, 2026
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center flex-shrink-0">
                                        <svg
                                            className="w-6 h-6 text-secondary-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                            Venue
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Innovation Hub, Tech Park
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center flex-shrink-0">
                                        <svg
                                            className="w-6 h-6 text-accent-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                            Team Size
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Up to 8 members per team
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="card p-6 text-center animate-pulse-glow">
                                <p className="text-4xl font-bold gradient-text">10+</p>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    Project Categories
                                </p>
                            </div>
                            <div className="card p-6 text-center">
                                <p className="text-4xl font-bold gradient-text">50+</p>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    Expected Teams
                                </p>
                            </div>
                            <div className="card p-6 text-center">
                                <p className="text-4xl font-bold gradient-text">20+</p>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    Industry Experts
                                </p>
                            </div>
                            <div className="card p-6 text-center">
                                <p className="text-4xl font-bold gradient-text">₹1L+</p>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    Prize Pool
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500">
                <div className="container-custom text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Ignite Your Innovation?
                    </h2>
                    <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                        Don&apos;t miss this opportunity to showcase your project and connect with
                        like-minded innovators.
                    </p>
                    <Link
                        href="/events"
                        className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                    >
                        Register Now
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                        </svg>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                <span className="text-white font-bold text-xl">🔥</span>
                            </div>
                            <span className="text-xl font-bold text-white">IGNITE 2026</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                            <Link
                                href="/events"
                                className="hover:text-white transition-colors"
                            >
                                Register
                            </Link>
                            <Link
                                href="/team"
                                className="hover:text-white transition-colors"
                            >
                                Accommodation
                            </Link>
                            <Link
                                href="/volunteer"
                                className="hover:text-white transition-colors"
                            >
                                Volunteers
                            </Link>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
                        © 2026 IGNITE Event. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
    title: "IGNITE 2026 - Innovation & Technology Event",
    description:
        "Join IGNITE 2026, the premier innovation and technology event happening on February 28, 2026. Register your team, explore cutting-edge projects, and ignite your passion for technology.",
    keywords: [
        "IGNITE",
        "technology event",
        "innovation",
        "hackathon",
        "engineering",
        "projects",
    ],
    authors: [{ name: "IGNITE Team" }],
    openGraph: {
        title: "IGNITE 2026 - Innovation & Technology Event",
        description:
            "Join IGNITE 2026, the premier innovation and technology event.",
        type: "website",
        locale: "en_US",
        siteName: "IGNITE 2026",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen bg-white dark:bg-gray-950 antialiased" style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
                <Providers>
                    <Navbar />
                    <main className="min-h-[calc(100vh-4rem)]" style={{ padding: '20px' }}>{children}</main>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: "#1f2937",
                                color: "#f3f4f6",
                                borderRadius: "12px",
                                padding: "16px",
                            },
                            success: {
                                iconTheme: {
                                    primary: "#10b981",
                                    secondary: "#f3f4f6",
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: "#ef4444",
                                    secondary: "#f3f4f6",
                                },
                            },
                        }}
                    />
                </Providers>
            </body>
        </html>
    );
}

import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
    title: `${SITE.fullName} - Innovation & Technology Event`,
    description:
        `Join ${SITE.fullName}, the premier innovation and technology event happening on ${SITE.formattedDate}. Register your team, explore cutting-edge projects, and ignite your passion for technology.`,
    keywords: [
        SITE.name,
        "technology event",
        "innovation",
        "hackathon",
        "engineering",
        "projects",
    ],
    authors: [{ name: `${SITE.name} Team` }],
    openGraph: {
        title: `${SITE.fullName} - Innovation & Technology Event`,
        description:
            `Join ${SITE.fullName}, the premier innovation and technology event.`,
        type: "website",
        locale: "en_US",
        siteName: SITE.fullName,
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {/* Auto-reload on ChunkLoadError (stale cache after deployment) */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.addEventListener('error', function(e) {
                                if (
                                    e.message && (
                                        e.message.indexOf('ChunkLoadError') !== -1 ||
                                        e.message.indexOf('Loading chunk') !== -1
                                    )
                                ) {
                                    if (!sessionStorage.getItem('chunk_reload')) {
                                        sessionStorage.setItem('chunk_reload', '1');
                                        window.location.reload();
                                    }
                                }
                            });
                            window.addEventListener('load', function() {
                                sessionStorage.removeItem('chunk_reload');
                            });
                        `,
                    }}
                />
            </head>
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

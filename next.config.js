/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable server actions
    experimental: {
        serverActions: {
            bodySizeLimit: "2mb",
        },
    },
    // Image optimization
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
        ],
    },
    // Environment variables — change these to rebrand the event
    env: {
        NEXT_PUBLIC_EVENT_NAME: "IGNITE",
        NEXT_PUBLIC_EVENT_YEAR: "2025",
        NEXT_PUBLIC_EVENT_DATE: "2025-02-28",
    },
};

module.exports = nextConfig;

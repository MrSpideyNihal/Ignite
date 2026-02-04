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
    // Environment variables that can be exposed to the browser
    env: {
        NEXT_PUBLIC_APP_NAME: "IGNITE Event",
        NEXT_PUBLIC_EVENT_DATE: "2026-02-28",
    },
};

module.exports = nextConfig;

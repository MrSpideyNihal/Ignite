import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#fef3f2",
                    100: "#fee4e2",
                    200: "#ffcdc9",
                    300: "#fda8a1",
                    400: "#f9756a",
                    500: "#f14a3c",
                    600: "#de2c1d",
                    700: "#bb2114",
                    800: "#9a1f15",
                    900: "#802018",
                    950: "#460c08",
                },
                secondary: {
                    50: "#fdf8ef",
                    100: "#fbeed9",
                    200: "#f6dab1",
                    300: "#f0c080",
                    400: "#e99e4d",
                    500: "#e38429",
                    600: "#d56b1f",
                    700: "#b1521b",
                    800: "#8d421d",
                    900: "#72381b",
                    950: "#3d1a0b",
                },
                accent: {
                    50: "#f0f9ff",
                    100: "#e0f2fe",
                    200: "#bae6fd",
                    300: "#7dd3fc",
                    400: "#38bdf8",
                    500: "#0ea5e9",
                    600: "#0284c7",
                    700: "#0369a1",
                    800: "#075985",
                    900: "#0c4a6e",
                    950: "#082f49",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "hero-pattern": "linear-gradient(135deg, #f14a3c 0%, #e38429 50%, #0ea5e9 100%)",
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-in-out",
                "slide-up": "slideUp 0.3s ease-out",
                "pulse-glow": "pulseGlow 2s ease-in-out infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(10px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                pulseGlow: {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(241, 74, 60, 0.4)" },
                    "50%": { boxShadow: "0 0 40px rgba(241, 74, 60, 0.8)" },
                },
            },
        },
    },
    plugins: [],
};

export default config;

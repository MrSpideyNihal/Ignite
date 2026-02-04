import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Edge-compatible auth config (no MongoDB here)
export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            // On initial sign-in, add user info to token
            if (account && user) {
                token.email = user.email;
                token.name = user.name;
                token.picture = user.image;
                // Role will be fetched from DB on first server component access
                token.needsDbSync = true;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.image = token.picture as string;
                // Add role if available
                if (token.role) {
                    (session.user as { role?: string }).role = token.role as string;
                }
                if (token.userId) {
                    (session.user as { id?: string }).id = token.userId as string;
                }
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    trustHost: true,
});

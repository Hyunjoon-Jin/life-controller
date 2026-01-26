import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "admin" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                const adminUser = process.env.ADMIN_USERNAME;
                const adminPass = process.env.ADMIN_PASSWORD;

                if (credentials?.username === adminUser && credentials?.password === adminPass) {
                    return { id: "1", name: "Admin User", email: "admin@dailyscheduler.com" };
                }
                return null;
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

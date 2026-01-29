import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - login (custom login page)
         * - register (signup page)
         * - api/auth (NextAuth API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!login|register|api/auth|api/register|_next/static|_next/image|favicon.ico).*)",
    ],
};

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // 1. Auth Page Redirect: If User is logged in, redirect away from Login/Register
    if (user && (path.startsWith("/login") || path.startsWith("/register"))) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // 2. Protected Route Redirect: If User is NOT logged in
    if (!user) {
        // Define Public Paths
        const isPublic =
            path === "/" ||
            path.startsWith("/login") ||
            path.startsWith("/register") ||
            path.startsWith("/pricing");

        // If not public, redirect to login
        // if (!isPublic) {
        //     return NextResponse.redirect(new URL("/login", request.url));
        // }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api routes (API) - Usually we don't run middleware on API unless needed
         */
        "/((?!_next/static|_next/image|favicon.ico|api).*)",
    ],
};
// Re-trigger deployment

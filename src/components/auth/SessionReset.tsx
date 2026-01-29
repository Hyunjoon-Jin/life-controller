"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

export function SessionReset() {
    const { data: session } = useSession();

    useEffect(() => {
        // If the user is "Admin User", force logout immediately
        if (session?.user?.name === "Admin User") {
            console.log("Stuck session detected. Forcing logout...");

            // 1. Clear Local Storage
            localStorage.clear();

            // 2. Clear Session Storage
            sessionStorage.clear();

            // 3. Force SignOut with redirect
            signOut({ callbackUrl: "/login", redirect: true });
        }
    }, [session]);

    return null; // Invisible component
}

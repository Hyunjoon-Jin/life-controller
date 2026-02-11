"use client";

import { useAuth } from "@/components/auth/SessionProvider";
import { useEffect } from "react";

export function SessionReset() {
    const { user, signOut } = useAuth();

    useEffect(() => {
        // If the user is "Admin User", force logout immediately
        if (user?.user_metadata?.name === "Admin User") {
            console.log("Stuck session detected. Forcing logout...");
            localStorage.clear();
            sessionStorage.clear();
            signOut();
        }
    }, [user, signOut]);

    return null; // Invisible component
}

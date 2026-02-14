"use client";

import { useAuth } from "@/components/auth/SessionProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface PremiumGateProps {
    children: ReactNode;
    featureName?: string;
    fallback?: ReactNode;
}

export function PremiumGate({ children, featureName = "Premium Feature", fallback }: PremiumGateProps) {
    // In a real app, you'd check a subscription status from context
    // For demo/freemium model, we'll mock this or check a user property
    // const { user } = useAuth();
    // const isPremium = user?.subscription === 'pro'; 
    const isPremium = false; // Default to false for now to show the gate

    if (isPremium) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <Card className="w-full h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 border-dashed">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardHeader>
                <CardTitle className="text-xl">Unlock {featureName}</CardTitle>
                <CardDescription className="max-w-md mx-auto mt-2">
                    This feature is available exclusively to <strong>Pro</strong> plan subscribers.
                    Upgrade now to access advanced tools like {featureName}, AI insights, and unlimited projects.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button asChild size="lg" className="w-full sm:w-auto font-semibold">
                    <Link href="/pricing">
                        Upgrade to Pro
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

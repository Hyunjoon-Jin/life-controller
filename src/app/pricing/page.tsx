"use client";

import { Button } from "@/components/ui/button";
import { PricingTable } from "@/components/subscription/PricingTable";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border p-4">
                <div className="container mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
                        <div className="p-1 bg-primary/10 rounded-md">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        LIFE Controller
                    </Link>
                    <Button variant="ghost" asChild className="gap-2">
                        <Link href="/">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8 flex-1">
                <PricingTable />
            </main>
        </div>
    );
}

'use client';

import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PullToRefreshHandler() {
    const refreshing = usePullToRefresh();

    return (
        <div
            className={cn(
                "fixed top-0 left-0 right-0 z-[100] flex justify-center pt-safe transition-transform duration-300 pointer-events-none",
                refreshing ? "translate-y-12 opacity-100" : "-translate-y-full opacity-0"
            )}
        >
            <div className="bg-background/80 backdrop-blur-md rounded-full p-2 shadow-lg border">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
        </div>
    );
}

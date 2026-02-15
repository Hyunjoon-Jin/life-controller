'use client';

import { useData } from "@/context/DataProvider";
import { Cloud, CloudOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/SessionProvider";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function CloudSyncStatus() {
    const { isSyncing, forceSync } = useData();
    const { user } = useAuth();
    const [status, setStatus] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');

    useEffect(() => {
        if (isSyncing) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStatus('syncing');
        } else {
            // briefly show saved state
            if (status === 'syncing') {
                setStatus('saved');
                setTimeout(() => setStatus('idle'), 3000);
            }
        }
    }, [isSyncing]);

    if (!user) return null;

    const handleForceSync = async () => {
        toast.promise(forceSync(), {
            loading: '클라우드와 동기화 중...',
            success: '동기화 완료!',
            error: '동기화 실패'
        });
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleForceSync}
                        className={cn(
                            "rounded-full transition-all duration-300",
                            isSyncing && "animate-spin text-blue-500",
                            status === 'saved' && "text-green-500",
                            !isSyncing && status !== 'saved' && "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {isSyncing ? (
                            <RefreshCw className="w-4 h-4" />
                        ) : status === 'saved' ? (
                            <CheckCircle2 className="w-4 h-4" />
                        ) : (
                            <Cloud className="w-4 h-4" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>
                        {isSyncing ? '동기화 중...' : status === 'saved' ? '저장됨' : '클라우드 동기화'}
                    </p>
                    <p className="text-xs text-muted-foreground">클릭하여 수동 저장</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

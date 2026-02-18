'use client';

import { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GuideModal } from '@/components/guide/GuideModal';
import { cn } from '@/lib/utils';

export function HelpFAB() {
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    return (
        <>
            <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[100] group">
                <div className="absolute -top-12 right-0 bg-popover text-popover-foreground border border-border text-[10px] px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-bold uppercase tracking-widest">
                    도움말 확인
                </div>
                <Button
                    onClick={() => setIsGuideOpen(true)}
                    className={cn(
                        "w-12 h-12 md:w-14 md:h-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-background p-0 flex items-center justify-center transition-all hover:scale-110 active:scale-95",
                        "bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground"
                    )}
                >
                    <HelpCircle className="w-6 h-6 md:w-7 md:h-7 animate-in fade-in zoom-in duration-500" />
                </Button>
            </div>

            <GuideModal
                isOpen={isGuideOpen}
                onOpenChange={setIsGuideOpen}
            />
        </>
    );
}

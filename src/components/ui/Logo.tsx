import React from 'react';
import { cn } from '@/lib/utils';

export function Logo({ className, variant = 'full' }: { className?: string, variant?: 'full' | 'icon' }) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* Geometric Symbol - Rounded Rectangle + Circle (Abstract 'L' or Connector) */}
            <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/20 rounded-[12px] rotate-[-10deg]"></div>
                <div className="absolute inset-0 bg-primary rounded-[12px] shadow-sm flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {variant === 'full' && (
                <div className="flex flex-col justify-center translate-y-[1px]">
                    <span className="font-extrabold text-xl tracking-tighter leading-none text-[#191F28] dark:text-white logo-title">
                        J들의 <span className="text-primary">놀이터</span>
                    </span>
                </div>
            )}
        </div>
    );
}

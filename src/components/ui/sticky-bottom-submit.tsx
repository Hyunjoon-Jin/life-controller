'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface StickyBottomSubmitProps {
    onSubmit: () => void;
    isLoading?: boolean;
    label?: string;
    className?: string;
    disabled?: boolean;
    children?: React.ReactNode;
}

export function StickyBottomSubmit({
    onSubmit,
    isLoading,
    label = '저장',
    className,
    disabled,
    children
}: StickyBottomSubmitProps) {
    return (
        <div className={cn(
            "sticky bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t mt-auto pb-safe z-20 flex gap-2 justify-end sm:relative sm:bg-transparent sm:border-t-0 sm:p-0 sm:pb-0 sm:backdrop-blur-none",
            className
        )}>
            {children ? children : (
                <Button
                    onClick={onSubmit}
                    disabled={isLoading || disabled}
                    className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm font-medium shadow-lg sm:shadow-none"
                >
                    {isLoading ? '저장 중...' : label}
                </Button>
            )}
        </div>
    );
}

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-16 px-6 text-center",
            className
        )}>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <Icon className="w-8 h-8 text-primary/60" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-slate-500 max-w-xs mb-6 leading-relaxed">{description}</p>
            )}
            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}

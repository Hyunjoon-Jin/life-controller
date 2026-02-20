import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface TabHeaderProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    className?: string;
}

export function TabHeader({ title, description, icon: Icon, className }: TabHeaderProps) {
    return (
        <div className={cn("flex items-center gap-6 mb-10 p-6 rounded-[32px] glass-premium border border-white/5 shadow-2xl relative overflow-hidden", className)}>
            {/* Background Accent Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -z-10" />

            {Icon && (
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <Icon className="w-7 h-7" strokeWidth={1.5} />
                </div>
            )}
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <h2 className="text-3xl font-black text-white leading-tight tracking-tight">
                        {title}
                    </h2>
                </div>
                {description && (
                    <p className="text-sm text-white/30 font-medium ml-4 tracking-wide">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

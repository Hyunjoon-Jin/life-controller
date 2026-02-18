'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Calendar, Target, Activity, DollarSign, Sparkles, Briefcase, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface BentoGridProps {
    className?: string;
    children: React.ReactNode;
}

export function BentoGrid({ className, children }: BentoGridProps) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-4 auto-rows-[160px]", className)}>
            {children}
        </div>
    );
}

interface BentoCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    className?: string;
    iconClassName?: string;
    colorClassName?: string;
    delay?: number;
    visual?: React.ReactNode;
}

export function BentoCard({
    title,
    description,
    icon: Icon,
    className,
    iconClassName,
    colorClassName,
    delay = 0,
    visual
}: BentoCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className={cn(
                "group relative overflow-hidden rounded-[32px] border border-border bg-card text-card-foreground p-6 flex flex-col justify-between transition-all hover:shadow-2xl hover:shadow-primary/10",
                className
            )}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", colorClassName || "bg-indigo-50 dark:bg-indigo-900/30")}>
                    <Icon className={cn("w-6 h-6", iconClassName || "text-indigo-600 dark:text-indigo-400")} />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-2 leading-tight">
                    {title}
                </h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    {description}
                </p>
            </div>

            {visual && (
                <div className="absolute bottom-0 right-0 w-full h-1/2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-500">
                    {visual}
                </div>
            )}

            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                Explore <Zap className="w-3 h-3" />
            </div>
        </motion.div>
    );
}

export function BentoVisuals() {
    return {
        Calendar: (
            <div className="flex gap-1 justify-end items-end p-4">
                {[40, 70, 50, 90, 60, 80].map((h, i) => (
                    <div key={i} className="w-2 bg-blue-500/20 rounded-full" style={{ height: `${h}%` }} />
                ))}
            </div>
        ),
        Target: (
            <div className="relative p-4 flex justify-end">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-4 border-emerald-500" />
                </div>
            </div>
        ),
        Finance: (
            <div className="p-4 flex flex-col gap-1 items-end">
                <div className="w-20 h-1.5 bg-purple-500/20 rounded-full" />
                <div className="w-12 h-1.5 bg-purple-500/40 rounded-full" />
                <div className="w-16 h-1.5 bg-purple-500/60 rounded-full" />
            </div>
        )
    };
}

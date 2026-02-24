'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Calendar, Target, Activity, DollarSign, Sparkles, Briefcase, Zap, GraduationCap, Clock } from 'lucide-react';
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
                둘러보기 <Zap className="w-3 h-3" />
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
        ),
        Health: (
            <div className="grid grid-cols-3 gap-2 p-4">
                <div className="flex flex-col items-center gap-1">
                    <div className="h-16 w-4 bg-rose-400/30 rounded-full relative overflow-hidden">
                        <div className="absolute bottom-0 w-full h-3/4 bg-rose-400 rounded-full" />
                    </div>
                    <span className="text-[8px] text-rose-400">체중</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="h-16 w-4 bg-emerald-400/30 rounded-full relative overflow-hidden">
                        <div className="absolute bottom-0 w-full h-1/2 bg-emerald-400 rounded-full" />
                    </div>
                    <span className="text-[8px] text-emerald-400">근육</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="h-16 w-4 bg-blue-400/30 rounded-full relative overflow-hidden">
                        <div className="absolute bottom-0 w-full h-2/3 bg-blue-400 rounded-full" />
                    </div>
                    <span className="text-[8px] text-blue-400">수분</span>
                </div>
            </div>
        ),
        Study: (
            <div className="flex flex-col gap-2 p-4 justify-end">
                {[
                    { label: '알고리즘', w: 72, color: 'bg-indigo-400' },
                    { label: '영어 단어', w: 55, color: 'bg-violet-400' },
                    { label: '자격증', w: 34, color: 'bg-emerald-400' },
                ].map(s => (
                    <div key={s.label} className="flex items-center gap-2">
                        <span className="text-[7px] font-bold text-slate-400 w-10 shrink-0 text-right">{s.label}</span>
                        <div className="flex-1 h-1.5 bg-slate-200/40 rounded-full overflow-hidden">
                            <div className={cn('h-full rounded-full', s.color)} style={{ width: `${s.w}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        ),
        Project: (
            <div className="p-4 flex flex-col gap-2 justify-end">
                {[
                    { label: '기획', w: '100%', color: 'bg-purple-400' },
                    { label: '디자인', w: '75%', color: 'bg-purple-300' },
                    { label: '개발', w: '45%', color: 'bg-purple-200' },
                ].map(s => (
                    <div key={s.label} className="flex items-center gap-2">
                        <span className="text-[7px] font-bold text-slate-400 w-8 shrink-0 text-right">{s.label}</span>
                        <div className="flex-1 h-2 bg-purple-100/30 rounded-full overflow-hidden">
                            <div className={cn('h-full rounded-full', s.color)} style={{ width: s.w }} />
                        </div>
                    </div>
                ))}
            </div>
        ),
    };
}

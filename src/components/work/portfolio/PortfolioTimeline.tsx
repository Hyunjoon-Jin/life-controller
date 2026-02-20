import React from 'react';
import { Project } from '@/types';
import { format, differenceInDays, addMonths, startOfMonth, endOfMonth, eachMonthOfInterval, isWithinInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { Activity, Shield, Terminal, Zap, ArrowUpRight } from 'lucide-react';

interface PortfolioTimelineProps {
    projects: Project[];
    onOpenProject: (id: string) => void;
}

export function PortfolioTimeline({ projects, onOpenProject }: PortfolioTimelineProps) {
    const today = new Date();
    const startRange = startOfMonth(addMonths(today, -2));
    const endRange = endOfMonth(addMonths(today, 6)); // 6 months ahead
    const months = eachMonthOfInterval({ start: startRange, end: endRange });
    const totalDays = differenceInDays(endRange, startRange);

    const getPositionStyle = (start?: Date, end?: Date) => {
        if (!start && !end) return { left: '0%', width: '0%' };

        const validStart = start ? new Date(start) : new Date();
        const validEnd = end ? new Date(end) : new Date(validStart.getTime() + 86400000 * 30);

        const effectiveStart = validStart < startRange ? startRange : validStart;
        const effectiveEnd = validEnd > endRange ? endRange : validEnd;

        if (effectiveStart > endRange || effectiveEnd < startRange) return { display: 'none' };

        const startOffset = differenceInDays(effectiveStart, startRange);
        const duration = differenceInDays(effectiveEnd, effectiveStart) + 1;

        const leftPct = (startOffset / totalDays) * 100;
        const widthPct = (duration / totalDays) * 100;

        return { left: `${leftPct}%`, width: `${widthPct}%` };
    };

    return (
        <div className="glass-premium rounded-[32px] border border-white/5 shadow-2xl overflow-hidden flex flex-col h-[650px] relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-transparent pointer-events-none" />

            {/* Timeline Header */}
            <div className="flex border-b border-white/5 bg-white/[0.02] relative z-10">
                <div className="w-72 p-6 font-black text-[10px] tracking-[0.2em] uppercase border-r border-white/5 shrink-0 bg-[#0A0B10]/80 backdrop-blur-xl z-20 sticky left-0 text-white/40">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-3 h-3 text-indigo-500" /> MISSION_PROTOCOL
                    </div>
                </div>
                <div className="flex-1 relative h-16">
                    <div className="absolute inset-0 flex">
                        {months.map(month => (
                            <div key={month.toString()} className="flex-1 border-r border-white/5 text-[9px] font-black text-white/20 p-5 tracking-widest uppercase text-center bg-[#0A0B10]/40">
                                {format(month, 'MMM yyyy', { locale: ko })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1 relative z-10">
                <div className="divide-y divide-white/5">
                    {projects.map((project, idx) => {
                        const style = getPositionStyle(project.startDate, project.endDate);

                        return (
                            <div key={project.id} className="flex group/row hover:bg-white/[0.02] transition-colors relative">
                                <div className="w-72 p-5 border-r border-white/5 shrink-0 bg-[#0A0B10]/80 backdrop-blur-xl z-20 sticky left-0 flex items-center gap-4">
                                    <div className="w-1.5 h-10 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.3)]" style={{ backgroundColor: project.color || '#6366f1' }} />
                                    <div className="min-w-0">
                                        <div
                                            className="font-black text-[11px] tracking-widest text-white uppercase truncate w-52 cursor-pointer hover:text-indigo-400 transition-colors"
                                            onClick={() => onOpenProject(project.id)}
                                        >
                                            {project.title}
                                        </div>
                                        <div className="text-[8px] font-black text-white/20 flex items-center gap-2 mt-1 tracking-widest uppercase">
                                            {project.status === 'active' && <span className="text-indigo-400 flex items-center gap-1"><Zap className="w-2 h-2" /> ACTIVE</span>}
                                            {project.status === 'completed' && <span className="text-emerald-400 flex items-center gap-1"><Shield className="w-2 h-2" /> DEPLOYED</span>}
                                            {project.health === 'at-risk' && <span className="text-rose-500 px-1 bg-rose-500/10 rounded leading-none">CAUTION</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 relative h-20 bg-repeat-x" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: `${100 / (totalDays / 30)}% 100%` }}>
                                    {/* Today Marker */}
                                    <div
                                        className="absolute top-0 bottom-0 w-px bg-rose-500/50 z-30 pointer-events-none before:absolute before:inset-0 before:bg-rose-500 before:blur-[4px]"
                                        style={{ left: `${(differenceInDays(today, startRange) / totalDays) * 100}%` }}
                                    >
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_white]" />
                                    </div>

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <motion.div
                                                    initial={{ opacity: 0, scaleX: 0 }}
                                                    animate={{ opacity: 1, scaleX: 1 }}
                                                    transition={{ delay: idx * 0.05, duration: 0.8, ease: "circOut" }}
                                                    className={cn(
                                                        "absolute h-10 top-5 rounded-xl shadow-2xl flex items-center px-4 text-[10px] font-black text-white cursor-pointer hover:brightness-125 transition-all overflow-hidden border border-white/10 group/bar",
                                                        "bg-gradient-to-r from-indigo-600/40 to-indigo-400/40 backdrop-blur-md"
                                                    )}
                                                    style={{
                                                        ...style,
                                                        backgroundColor: `${project.color}22` || 'rgba(99,102,241,0.1)'
                                                    }}
                                                    onClick={() => onOpenProject(project.id)}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                                                    {project.progress !== undefined && (
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${project.progress}%` }}
                                                            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-indigo-500 to-sky-400 opacity-40"
                                                        />
                                                    )}
                                                    <span className="relative z-10 tracking-[0.2em] uppercase truncate drop-shadow-lg">{project.title}</span>
                                                    <ArrowUpRight className="w-3 h-3 ml-auto relative z-10 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                                                </motion.div>
                                            </TooltipTrigger>
                                            <TooltipContent className="glass-premium border-white/10 rounded-2xl p-4 shadow-3xl text-white">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                                        <span className="font-black text-xs uppercase tracking-widest">{project.title}</span>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">
                                                        {format(new Date(project.startDate || new Date()), 'MM.dd.yyyy')} — {format(new Date(project.endDate || new Date()), 'MM.dd.yyyy')}
                                                    </div>
                                                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">DEPLOY_READY</span>
                                                        <span className="text-[10px] font-black text-indigo-400">{project.progress}%</span>
                                                    </div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <ScrollBar orientation="horizontal" className="bg-white/5" />
            </ScrollArea>
        </div>
    );
}

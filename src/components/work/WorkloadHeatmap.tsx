import { useMemo } from 'react';
import { useData } from '@/context/DataProvider';
import { eachDayOfInterval, subDays, format, isSameDay, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Activity, Shield, Terminal, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function WorkloadHeatmap() {
    const { events, tasks, journals } = useData();

    // Generate last 365 days
    const today = new Date();
    const days = useMemo(() => {
        return eachDayOfInterval({
            start: subDays(today, 364),
            end: today
        });
    }, []);

    // Aggregate data
    const activityMap = useMemo(() => {
        const map = new Map<string, number>();

        // 1. Events (count as 2 points)
        events.forEach(e => {
            const dayKey = format(new Date(e.start), 'yyyy-MM-dd');
            map.set(dayKey, (map.get(dayKey) || 0) + 2);
        });

        // 2. Tasks with dueDate (count as 1 point)
        tasks.forEach(t => {
            if (t.dueDate) {
                const dayKey = format(new Date(t.dueDate), 'yyyy-MM-dd');
                map.set(dayKey, (map.get(dayKey) || 0) + 1);
            }
        });

        // 3. Journals (count as 3 points)
        journals.forEach(j => {
            const dayKey = format(new Date(j.date), 'yyyy-MM-dd');
            map.set(dayKey, (map.get(dayKey) || 0) + 3);
        });

        return map;
    }, [events, tasks, journals]);

    const getColor = (count: number) => {
        if (count === 0) return 'bg-white/[0.03]';
        if (count <= 2) return 'bg-indigo-500/20';
        if (count <= 5) return 'bg-indigo-500/40';
        if (count <= 8) return 'bg-indigo-500/70';
        return 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]';
    };

    const totalActivities = Array.from(activityMap.values()).reduce((a, b) => a + b, 0);

    return (
        <div className="glass-premium p-8 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-widest uppercase mb-1">OPERATIONAL INTENSITY MATRIX</h3>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Terminal className="w-3 h-3 text-indigo-500/50" /> {totalActivities} DATA POINTS ACQUIRED // 365D WINDOW
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-[9px] font-black text-white/20 tracking-widest uppercase">
                    <span>LOW</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-[2px] bg-white/[0.03]" />
                        <div className="w-3 h-3 rounded-[2px] bg-indigo-500/20" />
                        <div className="w-3 h-3 rounded-[2px] bg-indigo-500/40" />
                        <div className="w-3 h-3 rounded-[2px] bg-indigo-500/70" />
                        <div className="w-3 h-3 rounded-[2px] bg-indigo-500" />
                    </div>
                    <span>MAX</span>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar pb-6 relative z-10">
                <div className="flex gap-1.5 min-w-max">
                    {Array.from({ length: 53 }).map((_, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1.5 pointer-events-none">
                            {Array.from({ length: 7 }).map((_, dayIndex) => {
                                const dayDate = days[weekIndex * 7 + dayIndex];
                                if (!dayDate || dayDate > today) return <div key={dayIndex} className="w-3 h-3" />;

                                const dateKey = format(dayDate, 'yyyy-MM-dd');
                                const count = activityMap.get(dateKey) || 0;

                                return (
                                    <TooltipProvider key={dateKey}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <motion.div
                                                    whileHover={{ scale: 1.3, zIndex: 50 }}
                                                    className={cn(
                                                        "w-3 h-3 rounded-[2px] transition-all cursor-crosshair pointer-events-auto",
                                                        getColor(count)
                                                    )}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent className="glass-premium border-white/10 rounded-xl p-3 shadow-3xl text-white">
                                                <div className="text-[10px] font-black tracking-widest uppercase mb-1 drop-shadow-md">
                                                    {format(dayDate, 'MMM dd, yyyy')}
                                                </div>
                                                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Zap className="w-3 h-3" /> INTENSITY_INDEX: {count}
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

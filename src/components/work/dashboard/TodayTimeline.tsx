'use client';

import { useData } from '@/context/DataProvider';
import { format, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Clock, Calendar as CalendarIcon, MoreHorizontal, Sparkles, Loader2, Activity, Zap, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { autoScheduleTasks } from '@/lib/scheduler';
import { recommendSmartSchedule } from '@/lib/gemini';
import { toast } from 'sonner';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function TodayTimeline() {
    const { events, tasks, updateTask } = useData();
    const [isScheduling, setIsScheduling] = useState(false);
    const [isAIScheduling, setIsAIScheduling] = useState(false);
    const today = new Date();

    const handleAISmartSchedule = async () => {
        setIsAIScheduling(true);
        try {
            const suggestions = await recommendSmartSchedule(tasks, events);
            if (suggestions.length === 0) {
                toast.info("NO OPTIMAL SCHEDULE COMBINATIONS FOUND.");
                return;
            }

            let count = 0;
            for (const item of suggestions) {
                const task = tasks.find(t => t.id === item.taskId);
                if (task) {
                    await updateTask({
                        ...task,
                        startDate: new Date(item.start),
                        endDate: new Date(item.end)
                    });
                    count++;
                }
            }
            toast.success(`AI STRATEGY APPLIED: ${count} MISSIONS DEPLOYED.`);
        } catch (error) {
            console.error(error);
            toast.error("STRATEGIC ERROR: AI SCHEDULING FAILED.");
        } finally {
            setIsAIScheduling(false);
        }
    };

    const todayEvents = events
        .filter(e => isSameDay(new Date(e.start), today))
        .filter(e => e.type === 'work' || e.isMeeting || e.isWorkLog || !!e.connectedProjectId)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return (
        <div className="glass-premium rounded-[32px] border border-white/5 p-8 shadow-2xl h-full flex flex-col relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white tracking-widest uppercase mb-0.5">TIMELINE ORCHESTRATOR</h3>
                        <p className="text-[8px] font-bold text-white/20 tracking-[0.2em] uppercase">SEQUENTIAL OPS MAP</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500/20 via-indigo-500/40 to-indigo-500/20" />

                {todayEvents.length > 0 ? (
                    <div className="space-y-8 pb-4">
                        {todayEvents.map((event, index) => {
                            const isPast = new Date(event.end) < new Date();
                            const isCurrent = new Date(event.start) <= new Date() && new Date(event.end) >= new Date();

                            return (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={event.id}
                                    className="relative pl-12 group/item"
                                >
                                    {/* Kinetic Dot */}
                                    <div className={cn(
                                        "absolute left-2.5 top-2 w-3 h-3 rounded-full border border-white/20 transition-all duration-500 z-10",
                                        isPast ? "bg-white/10 opacity-30" : "bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]",
                                        isCurrent && "animate-pulse scale-125 bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.8)]"
                                    )} />

                                    {/* Content Card */}
                                    <div className="group-hover/item:translate-x-2 transition-transform duration-300">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={cn(
                                                "text-[10px] font-black tracking-widest uppercase font-mono",
                                                isPast ? "text-white/20" : "text-white/40"
                                            )}>
                                                {format(new Date(event.start), 'HH:mm')} — {format(new Date(event.end), 'HH:mm')}
                                            </span>
                                            {isCurrent && (
                                                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[8px] font-black tracking-widest uppercase animate-pulse">
                                                    IN PROGRESS
                                                </span>
                                            )}
                                        </div>
                                        <div className={cn(
                                            "p-5 rounded-2xl border transition-all duration-300",
                                            isPast
                                                ? "bg-white/[0.01] border-white/5 text-white/20"
                                                : "bg-white/[0.03] border-white/5 hover:border-indigo-500/30 text-white shadow-xl"
                                        )}>
                                            <div className="font-black text-sm uppercase tracking-wide">{event.title}</div>
                                            {event.description && (
                                                <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mt-2 line-clamp-2">
                                                    <Terminal className="w-3 h-3 inline mr-2 text-indigo-500" /> {event.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 py-16 gap-4 border-2 border-dashed border-white/10 rounded-[40px]">
                        <Clock className="w-12 h-12" />
                        <p className="text-[9px] font-black tracking-[0.3em] uppercase text-center leading-relaxed">NO OPERATIONAL<br />TIMELINE DETECTED</p>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
                <Button
                    onClick={handleAISmartSchedule}
                    disabled={isAIScheduling}
                    className="w-full h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white font-black text-[11px] tracking-[0.2em] uppercase transition-all active:scale-95"
                >
                    {isAIScheduling ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <Zap className="w-4 h-4 mr-3" />}
                    INITIATE AI SMART SYNC
                </Button>
            </div>
        </div>
    );
}

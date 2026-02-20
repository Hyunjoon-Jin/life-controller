'use client';

import { useData } from '@/context/DataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isToday, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, Activity, Zap, Shield, Terminal, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BriefingCard } from '../dashboard/BriefingCard';
import { motion } from 'framer-motion';

export function ScheduleSection() {
    const { events, tasks } = useData();
    const today = new Date();

    const todayEvents = events
        .filter(e => isSameDay(new Date(e.start), today))
        .filter(e => e.type === 'work' || e.isMeeting || e.isWorkLog || !!e.connectedProjectId)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    const todayTasks = tasks.filter(t => !t.completed && !!t.projectId && (t.dueDate ? isSameDay(new Date(t.dueDate), today) : false));

    return (
        <div className="space-y-8 pb-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <BriefingCard />
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Today's Meetings/Events */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="glass-premium rounded-[32px] border border-white/5 p-8 shadow-2xl h-full flex flex-col relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent pointer-events-none" />

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white tracking-widest uppercase mb-0.5">OPERATIONAL EVENTS</h3>
                                    <p className="text-[8px] font-bold text-white/20 tracking-[0.2em] uppercase">MEETINGS & ENGAGEMENTS</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {todayEvents.length > 0 ? (
                                todayEvents.map((event, idx) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + idx * 0.05 }}
                                        className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex items-center justify-between group hover:bg-white/[0.04] transition-all"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <span className="font-black text-sm text-white uppercase tracking-tight">{event.title}</span>
                                            <span className="text-[10px] font-bold text-indigo-400/60 flex items-center gap-2 uppercase tracking-widest">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(event.start), 'HH:mm')} — {format(new Date(event.end), 'HH:mm')}
                                            </span>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] group-hover:scale-125 transition-transform" />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-12 px-6 border-2 border-dashed border-white/5 rounded-2xl opacity-10">
                                    <p className="text-[10px] font-black tracking-[0.3em] uppercase">NO SCHEDULED EVENTS</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Today's Priority Tasks */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div className="glass-premium rounded-[32px] border border-white/5 p-8 shadow-2xl h-full flex flex-col relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.03] to-transparent pointer-events-none" />

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-rose-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white tracking-widest uppercase mb-0.5">CRITICAL DEADLINES</h3>
                                    <p className="text-[8px] font-bold text-white/20 tracking-[0.2em] uppercase">EOD MISSION TARGETS</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {todayTasks.length > 0 ? (
                                todayTasks.map((task, idx) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + idx * 0.05 }}
                                        className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex items-center gap-4 group hover:bg-white/[0.04] transition-all"
                                    >
                                        <div className={cn(
                                            "w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_currentColor]",
                                            task.priority === 'high' ? "bg-rose-500 text-rose-500" : "bg-amber-400 text-amber-400"
                                        )} />
                                        <div className="flex flex-col gap-1">
                                            <span className="font-black text-sm text-white uppercase tracking-tight">{task.title}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{task.category}</span>
                                                {task.priority === 'high' && (
                                                    <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter bg-rose-500/10 px-1.5 py-0.5 rounded leading-none">PRIORITY: HIGH</span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-12 px-6 border-2 border-dashed border-white/5 rounded-2xl opacity-10">
                                    <p className="text-[10px] font-black tracking-[0.3em] uppercase">ALL TARGETS CLEARED</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Status Feedback */}
            <div className="flex items-center justify-center gap-8 py-4 opacity-20">
                <div className="flex items-center gap-3">
                    <Zap className="w-3 h-3 text-indigo-400" />
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">SYNC STATUS: NORMAL</span>
                </div>
                <div className="flex items-center gap-3">
                    <Shield className="w-3 h-3 text-indigo-400" />
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">SECURITY: LAYER 4</span>
                </div>
                <div className="flex items-center gap-3">
                    <Terminal className="w-3 h-3 text-indigo-400" />
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">HOST: COGNITIVE_CORE</span>
                </div>
            </div>
        </div>
    );
}

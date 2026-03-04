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
                {/* 오늘의 일정 */}
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
                                    <h3 className="text-base font-semibold text-foreground mb-0.5">오늘의 일정</h3>
                                    <p className="text-xs text-muted-foreground">회의 및 약속</p>
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
                                            <span className="text-sm font-semibold text-foreground">{event.title}</span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(event.start), 'HH:mm')} — {format(new Date(event.end), 'HH:mm')}
                                            </span>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] group-hover:scale-125 transition-transform" />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-12 px-6 border-2 border-dashed border-white/5 rounded-2xl">
                                    <p className="text-sm text-muted-foreground">일정이 없습니다</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* 오늘 마감 업무 */}
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
                                    <h3 className="text-base font-semibold text-foreground mb-0.5">마감 예정</h3>
                                    <p className="text-xs text-muted-foreground">오늘까지</p>
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
                                            <span className="text-sm font-semibold text-foreground">{task.title}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-muted-foreground">{task.category}</span>
                                                {task.priority === 'high' && (
                                                    <span className="text-xs font-medium text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded leading-none">우선순위 높음</span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-12 px-6 border-2 border-dashed border-white/5 rounded-2xl">
                                    <p className="text-sm text-muted-foreground">마감 항목이 없습니다</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* 상태 표시 */}
            <div className="flex items-center justify-center gap-8 py-4 opacity-20">
                <div className="flex items-center gap-3">
                    <Zap className="w-3 h-3 text-indigo-400" />
                    <span className="text-xs text-muted-foreground">동기화 완료</span>
                </div>
                <div className="flex items-center gap-3">
                    <Shield className="w-3 h-3 text-indigo-400" />
                    <span className="text-xs text-muted-foreground">보안 정상</span>
                </div>
                <div className="flex items-center gap-3">
                    <Terminal className="w-3 h-3 text-indigo-400" />
                    <span className="text-xs text-muted-foreground">시스템 연결됨</span>
                </div>
            </div>
        </div>
    );
}

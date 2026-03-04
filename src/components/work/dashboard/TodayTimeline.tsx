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
                toast.info("최적 일정 조합을 찾지 못했습니다.");
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
            toast.success(`AI 일정 배치 완료: ${count}개 할일이 배치되었습니다.`);
        } catch (error) {
            console.error(error);
            toast.error("AI 일정 배치에 실패했습니다.");
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
                        <h3 className="text-base font-semibold text-foreground mb-0.5">오늘의 일정</h3>
                        <p className="text-xs text-muted-foreground">시간순</p>
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
                                                "text-xs font-mono",
                                                isPast ? "text-muted-foreground/40" : "text-muted-foreground"
                                            )}>
                                                {format(new Date(event.start), 'HH:mm')} — {format(new Date(event.end), 'HH:mm')}
                                            </span>
                                            {isCurrent && (
                                                <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 text-xs animate-pulse">
                                                    진행 중
                                                </span>
                                            )}
                                        </div>
                                        <div className={cn(
                                            "p-4 rounded-xl border transition-all duration-300",
                                            isPast
                                                ? "bg-muted/20 border-border/30 text-muted-foreground/40"
                                                : "bg-card border-border hover:border-indigo-500/40 text-foreground"
                                        )}>
                                            <div className="font-medium text-sm">{event.title}</div>
                                            {event.description && (
                                                <div className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                                                    {event.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center py-16 gap-3 border-2 border-dashed border-border rounded-2xl">
                        <Clock className="w-10 h-10 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground text-center">오늘 등록된 일정이 없습니다</p>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
                <Button
                    onClick={handleAISmartSchedule}
                    disabled={isAIScheduling}
                    variant="outline"
                    className="w-full h-11 rounded-xl text-sm font-medium text-indigo-400 border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all"
                >
                    {isAIScheduling ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <Zap className="w-4 h-4 mr-3" />}
                    AI 스마트 일정 자동 배치
                </Button>
            </div>
        </div>
    );
}

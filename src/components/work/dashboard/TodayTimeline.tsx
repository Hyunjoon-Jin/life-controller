'use client';

import { useData } from '@/context/DataProvider';
import { format, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Clock, Calendar as CalendarIcon, MoreHorizontal, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { autoScheduleTasks } from '@/lib/scheduler';
import { recommendSmartSchedule } from '@/lib/gemini';
import { toast } from 'sonner';
import { useState } from 'react';

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
                toast.info("AI가 추천할 만한 스케줄 조합을 찾지 못했습니다.");
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
            toast.success(`AI가 ${count}개의 작업을 지능적으로 배치했습니다!`);
        } catch (error) {
            console.error(error);
            toast.error("AI 스케줄링 중 오류가 발생했습니다.");
        } finally {
            setIsAIScheduling(false);
        }
    };

    const todayEvents = events
        .filter(e => isSameDay(new Date(e.start), today))
        .filter(e => e.type === 'work' || e.isMeeting || e.isWorkLog || !!e.connectedProjectId) // Work Filter
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    const handleAutoSchedule = async () => {
        setIsScheduling(true);
        try {
            // Run scheduler
            const scheduled = autoScheduleTasks(tasks, events);

            if (scheduled.length === 0) {
                toast.info("예상 소요 시간이 입력된 배치할 작업이 없거나, 빈 시간이 부족합니다.");
                return;
            }

            // Update tasks with new dates
            let count = 0;
            for (const item of scheduled) {
                const task = tasks.find(t => t.id === item.taskId);
                if (task) {
                    await updateTask({
                        ...task,
                        startDate: item.startDate,
                        endDate: item.endDate
                    });
                    count++;
                }
            }
            toast.success(`${count}개의 작업을 자동으로 배치했습니다!`);
        } catch (error) {
            console.error(error);
            toast.error("자동 스케줄링 중 오류가 발생했습니다.");
        } finally {
            setIsScheduling(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    오늘의 일정
                </h3>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAISmartSchedule}
                        disabled={isAIScheduling}
                        className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        title="AI가 작업 성격을 분석하여 최적의 시간 추천"
                    >
                        {isAIScheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1 text-purple-500" />}
                        {isAIScheduling ? "AI 분석 중..." : "AI 지능형 배치"}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAutoSchedule}
                        disabled={isScheduling}
                        className="text-xs text-slate-500 hover:bg-slate-50"
                        title="빈 시간에 할 일 단순 배치"
                    >
                        {isScheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4 mr-1" />}
                        {isScheduling ? "배치 중..." : "단순 자동 채우기"}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative">
                {/* Timeline Line */}
                <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-700/50" />

                {todayEvents.length > 0 ? (
                    <div className="space-y-6">
                        {todayEvents.map((event, index) => (
                            <div key={event.id} className="relative pl-10 group">
                                {/* Dot */}
                                <div className={cn(
                                    "absolute left-2 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ring-2 ring-indigo-100 dark:ring-indigo-900 z-10 transition-colors",
                                    new Date(event.end) < new Date() ? "bg-slate-300 ring-slate-100" : "bg-indigo-500"
                                )} />

                                {/* Content */}
                                <div className="group-hover:translate-x-1 transition-transform duration-200">
                                    <div className="text-xs font-medium text-slate-500 mb-0.5 font-mono">
                                        {format(new Date(event.start), 'HH:mm')} ~ {format(new Date(event.end), 'HH:mm')}
                                    </div>
                                    <div className={cn(
                                        "p-3 rounded-xl border transition-all",
                                        new Date(event.end) < new Date()
                                            ? "bg-slate-50 border-slate-100 text-slate-400"
                                            : "bg-indigo-50/50 border-indigo-100 text-slate-800 dark:bg-indigo-900/10 dark:border-indigo-800 dark:text-slate-200"
                                    )}>
                                        <div className="font-bold text-sm">{event.title}</div>
                                        {event.description && (
                                            <div className="text-xs opacity-80 mt-1 line-clamp-1">{event.description}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[200px]">
                        <CalendarIcon className="w-10 h-10 mb-3 opacity-20" />
                        <p className="text-sm">예정된 일정이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

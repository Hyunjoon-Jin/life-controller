'use client';

import { useMemo } from 'react';
import { useData } from '@/context/DataProvider';
import { eachDayOfInterval, subDays, format, isSameDay, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

        // 3. Journals (count as 3 points - meaningful record)
        journals.forEach(j => {
            const dayKey = format(new Date(j.date), 'yyyy-MM-dd');
            map.set(dayKey, (map.get(dayKey) || 0) + 3);
        });

        return map;
    }, [events, tasks, journals]);

    const getColor = (count: number) => {
        if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
        if (count <= 2) return 'bg-green-200 dark:bg-green-900/40';
        if (count <= 5) return 'bg-green-400 dark:bg-green-700/60';
        if (count <= 8) return 'bg-green-600 dark:bg-green-600';
        return 'bg-green-800 dark:bg-green-500';
    };

    // Calculate streaks
    // (Simple logic: approximate)
    const totalActivities = Array.from(activityMap.values()).reduce((a, b) => a + b, 0);


    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold">내 업무 강도 (Workload)</h3>
                    <p className="text-sm text-muted-foreground">지난 1년간의 활동 내역입니다. {totalActivities}개의 기록이 있습니다.</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
                        <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900/40" />
                        <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700/60" />
                        <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-600" />
                        <div className="w-3 h-3 rounded-sm bg-green-800 dark:bg-green-500" />
                    </div>
                    <span>More</span>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar pb-2">
                <div className="flex gap-1 min-w-max">
                    {/* Render grid by weeks for horizontal layout */}
                    {Array.from({ length: 53 }).map((_, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {Array.from({ length: 7 }).map((_, dayIndex) => {
                                const dayDate = days[weekIndex * 7 + dayIndex];
                                if (!dayDate || dayDate > today) return <div key={dayIndex} className="w-3 h-3" />; // Spacer

                                const dateKey = format(dayDate, 'yyyy-MM-dd');
                                const count = activityMap.get(dateKey) || 0;

                                return (
                                    <TooltipProvider key={dateKey}>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <div
                                                    className={cn(
                                                        "w-3 h-3 rounded-[2px] transition-colors hover:ring-1 hover:ring-black dark:hover:ring-white",
                                                        getColor(count)
                                                    )}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <div className="text-xs font-bold">
                                                    {format(dayDate, 'yyyy년 M월 d일')}
                                                </div>
                                                <div className="text-xs">
                                                    활동지수: {count}
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

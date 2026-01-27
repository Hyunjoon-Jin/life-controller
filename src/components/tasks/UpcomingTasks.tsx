'use client';

import { useData } from '@/context/DataProvider';
import { differenceInDays, addDays, isBefore, isAfter, startOfDay, isValid } from 'date-fns';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function UpcomingTasks() {
    const { tasks, updateTask } = useData();

    // Filter Logic
    const today = startOfDay(new Date());
    const nextWeek = addDays(today, 7);

    const upcomingTasks = tasks.filter(task => {
        if (!task.deadline || task.completed) return false;
        const deadlineDate = new Date(task.deadline);
        if (!isValid(deadlineDate)) return false;
        // Is after yesterday (today included) AND before next week?
        return isAfter(deadlineDate, addDays(today, -1)) && isBefore(deadlineDate, nextWeek);
    }).sort((a, b) => {
        const dateA = new Date(a.deadline!);
        const dateB = new Date(b.deadline!);
        // Safe guard sort as well just in case
        return (isValid(dateA) ? dateA.getTime() : 0) - (isValid(dateB) ? dateB.getTime() : 0);
    });

    const toggleTask = (id: string, completed: boolean) => {
        const task = tasks.find(t => t.id === id);
        if (task) updateTask({ ...task, completed });
    };

    if (upcomingTasks.length === 0) return null;

    return (
        <div className="bg-card text-card-foreground rounded-3xl border border-transparent shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-extrabold text-lg">마감 임박 작업 (7일 이내)</h3>
            </div>

            <div className="space-y-2">
                {upcomingTasks.map(task => {
                    const daysLeft = differenceInDays(new Date(task.deadline!), today);

                    return (
                        <div key={task.id} className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl hover:bg-muted/70 transition-colors group">
                            <button
                                onClick={() => toggleTask(task.id, !task.completed)}
                                className={cn(
                                    "w-5 h-5 rounded-md border-2 border-muted-foreground/30 flex items-center justify-center transition-all",
                                    task.completed ? "bg-primary border-primary text-primary-foreground" : "hover:border-primary"
                                )}
                            >
                                {task.completed && <Check className="w-3.5 h-3.5" />}
                            </button>

                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold truncate">{task.title}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    <span>{format(new Date(task.deadline!), 'M월 d일 (eee)', { locale: ko })}</span>
                                </div>
                            </div>

                            <div className={cn(
                                "text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap",
                                daysLeft <= 1 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                            )}>
                                {daysLeft === 0 ? '오늘 마감' : `${daysLeft}일 남음`}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

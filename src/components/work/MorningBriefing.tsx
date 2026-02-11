'use client';

import { useData } from '@/context/DataProvider';
import { format, isSameDay, isPast, isFuture, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CheckCircle2, Circle, Clock, AlertCircle, Calendar as CalendarIcon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/SessionProvider';

export function MorningBriefing() {
    const { tasks, events, userProfile } = useData();
    const { user } = useAuth(); // To get real name if possible

    const today = new Date();
    const userName = userProfile.name || user?.user_metadata?.name || "사용자";

    // 1. Overdue Tasks
    const overdueTasks = tasks.filter(t =>
        !t.completed && t.dueDate && isPast(new Date(t.dueDate)) && !isSameDay(new Date(t.dueDate), today)
    );

    // 2. Today's Tasks (High Priority First)
    const todayTasks = tasks
        .filter(t => !t.completed && (
            (t.dueDate && isSameDay(new Date(t.dueDate), today)) ||
            t.priority === 'high' // Or just high priority generic tasks
        ))
        .sort((a, b) => (a.priority === 'high' ? -1 : 1))
        .slice(0, 3);

    // 3. Upcoming Events (Today)
    const todayEvents = events
        .filter(e => isSameDay(new Date(e.start), today))
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .slice(0, 3);

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-900 dark:to-purple-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Greeting Section */}
                <div>
                    <div className="flex items-center gap-2 mb-2 text-indigo-100">
                        <Sun className="w-5 h-5 text-yellow-300" />
                        <span className="font-medium">{format(today, 'M월 d일 EEEE', { locale: ko })}</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-4">
                        좋은 아침입니다, <br />
                        <span className="text-yellow-300">{userName}</span>님!
                    </h2>

                    <div className="flex gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-1">
                            <div className="text-2xl font-bold mb-1">{tasks.filter(t => !t.completed).length}</div>
                            <div className="text-xs text-indigo-100">남은 할 일</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-1">
                            <div className="text-2xl font-bold mb-1">{todayEvents.length}</div>
                            <div className="text-xs text-indigo-100">오늘 일정</div>
                        </div>
                        {overdueTasks.length > 0 && (
                            <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-2xl p-4 flex-1">
                                <div className="text-2xl font-bold mb-1 text-red-200">{overdueTasks.length}</div>
                                <div className="text-xs text-red-100">지연됨</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Briefing List */}
                <div className="space-y-4">
                    {/* Today's Focus */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                        <h3 className="font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-indigo-100">
                            <CheckCircle2 className="w-4 h-4" /> 오늘의 집중 업무
                        </h3>
                        {todayTasks.length > 0 ? (
                            <div className="space-y-2">
                                {todayTasks.map(task => (
                                    <div key={task.id} className="flex items-center gap-3 text-sm">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            task.priority === 'high' ? "bg-red-400" : "bg-blue-400"
                                        )} />
                                        <span className="line-clamp-1 flex-1">{task.title}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-indigo-200">
                                오늘 예정된 마감 업무가 없습니다.
                            </div>
                        )}
                    </div>

                    {/* Schedule */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                        <h3 className="font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-indigo-100">
                            <CalendarIcon className="w-4 h-4" /> 주요 일정
                        </h3>
                        {todayEvents.length > 0 ? (
                            <div className="space-y-2">
                                {todayEvents.map(event => (
                                    <div key={event.id} className="flex items-center gap-3 text-sm">
                                        <div className="text-xs font-mono bg-white/20 px-1.5 py-0.5 rounded text-indigo-50">
                                            {format(new Date(event.start), 'HH:mm')}
                                        </div>
                                        <span className="line-clamp-1 flex-1">{event.title}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-indigo-200">
                                오늘 남은 일정이 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

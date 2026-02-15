'use client';

import { useData } from '@/context/DataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isToday, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MorningBriefing } from '../MorningBriefing';

export function ScheduleSection() {
    const { events, tasks } = useData();
    const today = new Date();

    const todayEvents = events
        .filter(e => isSameDay(new Date(e.start), today))
        .filter(e => e.type === 'work' || e.isMeeting || e.isWorkLog || !!e.connectedProjectId)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    const todayTasks = tasks.filter(t => !t.completed && !!t.projectId && (t.dueDate ? isSameDay(new Date(t.dueDate), today) : false));

    return (
        <div className="space-y-6">
            <MorningBriefing />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Today's Meetings/Events */}
                <Card className="border-none shadow-sm bg-blue-50/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-700">
                            <CalendarIcon className="w-4 h-4" />
                            오늘의 회의 및 일정
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {todayEvents.length > 0 ? (
                            todayEvents.map(event => (
                                <div key={event.id} className="bg-white p-3 rounded-xl border border-blue-100 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">{event.title}</span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                                        </span>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-sm text-muted-foreground">오늘 일정이 없습니다.</div>
                        )}
                    </CardContent>
                </Card>

                {/* Today's Priority Tasks */}
                <Card className="border-none shadow-sm bg-orange-50/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-orange-700">
                            <CheckCircle2 className="w-4 h-4" />
                            오늘 마감 작업
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {todayTasks.length > 0 ? (
                            todayTasks.map(task => (
                                <div key={task.id} className="bg-white p-3 rounded-xl border border-orange-100 flex items-center gap-3">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        task.priority === 'high' ? "bg-red-500" : "bg-orange-400"
                                    )} />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">{task.title}</span>
                                        <span className="text-xs text-muted-foreground">{task.category}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-sm text-muted-foreground">마감 예정인 작업이 없습니다.</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

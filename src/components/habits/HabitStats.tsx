'use client';

import { Habit } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, CheckCircle, Calendar as CalendarIcon, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HabitStatsProps {
    habit: Habit;
    onClose: () => void;
}

export function HabitStats({ habit, onClose }: HabitStatsProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const today = new Date();

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate stats
    const totalCompleted = habit.completedDates.length;

    // Monthly completion calculation
    const thisMonthCompleted = habit.completedDates.filter(dateStr => {
        const date = new Date(dateStr);
        return isSameMonth(date, currentMonth);
    }).length;

    // Simple completion rate logic (based on total days in month vs completed)
    const completionRate = Math.round((thisMonthCompleted / calendarDays.length) * 100);

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    return (
        <Card className="w-full h-full border-none shadow-none bg-background/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <span className="text-xl">{habit.title}</span>
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Top Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center justify-center p-3 bg-card rounded-xl border shadow-sm">
                        <Flame className="w-5 h-5 text-orange-500 mb-1" />
                        <span className="text-2xl font-bold">{habit.streak}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">Current Streak</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-card rounded-xl border shadow-sm">
                        <CheckCircle className="w-5 h-5 text-green-500 mb-1" />
                        <span className="text-2xl font-bold">{totalCompleted}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">Total Days</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-card rounded-xl border shadow-sm">
                        <CalendarIcon className="w-5 h-5 text-blue-500 mb-1" />
                        <span className="text-2xl font-bold">{completionRate}%</span>
                        <span className="text-[10px] text-muted-foreground uppercase">This Month</span>
                    </div>
                </div>

                {/* Calendar View */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between mb-4">
                        <Button variant="ghost" size="sm" onClick={handlePrevMonth} className="h-7 px-2">Anterior</Button>
                        <span className="text-sm font-bold">{format(currentMonth, 'yyyy년 M월', { locale: ko })}</span>
                        <Button variant="ghost" size="sm" onClick={handleNextMonth} className="h-7 px-2">Next</Button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                            <div key={day} className="text-[10px] font-bold text-muted-foreground">{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {/* Empty cells for start padding */}
                        {Array.from({ length: getDay(monthStart) }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}

                        {calendarDays.map((day, idx) => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const isCompleted = habit.completedDates.includes(dateStr);
                            const isToday = isSameDay(day, today);
                            const isFuture = day > today;

                            return (
                                <div
                                    key={dateStr}
                                    className={cn(
                                        "aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all relative group",
                                        isCompleted
                                            ? "bg-green-500 text-white shadow-sm"
                                            : isToday
                                                ? "bg-primary/20 text-primary border border-primary/50"
                                                : "bg-muted/30 text-muted-foreground",
                                        isFuture && "opacity-30 cursor-not-allowed"
                                    )}
                                    title={dateStr}
                                >
                                    {format(day, 'd')}
                                    {isCompleted && (
                                        <div className="absolute inset-0 bg-white/20 rounded-md animate-pulse opacity-0 group-hover:opacity-100 pointer-events-none" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

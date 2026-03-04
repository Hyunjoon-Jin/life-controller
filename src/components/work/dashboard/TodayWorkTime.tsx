'use client';

import { Clock, Timer, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TodayWorkTimeProps {
    onNavigateToWorkTime?: () => void;
}

const DAYS = ['월', '화', '수', '목', '금', '토', '일'] as const;
type DayKey = typeof DAYS[number];

interface DaySchedule { start: string; end: string; holiday: boolean; }

const DEFAULT: Record<DayKey, DaySchedule> = {
    '월': { start: '09:00', end: '18:00', holiday: false },
    '화': { start: '09:00', end: '18:00', holiday: false },
    '수': { start: '09:00', end: '18:00', holiday: false },
    '목': { start: '09:00', end: '18:00', holiday: false },
    '금': { start: '09:00', end: '18:00', holiday: false },
    '토': { start: '09:00', end: '18:00', holiday: true },
    '일': { start: '09:00', end: '18:00', holiday: true },
};

export function TodayWorkTime({ onNavigateToWorkTime }: TodayWorkTimeProps) {
    const [todaySchedule, setTodaySchedule] = useState<DaySchedule | null>(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('work-week-schedule');
            const schedule = raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
            const dayIdx = (new Date().getDay() + 6) % 7;
            setTodaySchedule(schedule[DAYS[dayIdx]]);
        } catch {
            const dayIdx = (new Date().getDay() + 6) % 7;
            setTodaySchedule(DEFAULT[DAYS[dayIdx]]);
        }
    }, []);

    const isHoliday = todaySchedule?.holiday ?? false;

    return (
        <div className="glass-premium rounded-2xl border border-border p-6 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                        <Timer className="w-4 h-4 text-sky-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">오늘 근무 시간</h3>
                        <p className="text-xs text-muted-foreground">설정된 근무 일정</p>
                    </div>
                </div>
            </div>

            <button
                onClick={onNavigateToWorkTime}
                className="flex-1 p-6 rounded-xl bg-muted/50 border border-border hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group text-left"
            >
                {isHoliday ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 py-4">
                        <Clock className="w-10 h-10 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">오늘은 휴일입니다</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-center gap-8">
                            <div className="text-center">
                                <span className="text-xs text-muted-foreground block mb-1.5">출근</span>
                                <span className="text-3xl font-bold text-foreground tabular-nums">
                                    {todaySchedule?.start ?? '09:00'}
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                <div className="w-px h-8 bg-border" />
                                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                            </div>
                            <div className="text-center">
                                <span className="text-xs text-muted-foreground block mb-1.5">퇴근</span>
                                <span className="text-3xl font-bold text-foreground tabular-nums">
                                    {todaySchedule?.end ?? '18:00'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border">
                            <span className="text-xs text-muted-foreground">근무 관리에서 수정 가능</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-indigo-400 transition-colors" />
                        </div>
                    </div>
                )}
            </button>
        </div>
    );
}

'use client';

import { useData } from '@/context/DataProvider';
import { Clock, Play, Square, Coffee, History, BarChart2, Timer, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, differenceInMinutes, isSameDay } from 'date-fns';
import { generateId, cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'] as const;
type DayKey = typeof DAYS[number];

interface DaySchedule {
    start: string;
    end: string;
    holiday: boolean;
}

type WeekSchedule = Record<DayKey, DaySchedule>;

const DEFAULT_SCHEDULE: WeekSchedule = {
    '월': { start: '09:00', end: '18:00', holiday: false },
    '화': { start: '09:00', end: '18:00', holiday: false },
    '수': { start: '09:00', end: '18:00', holiday: false },
    '목': { start: '09:00', end: '18:00', holiday: false },
    '금': { start: '09:00', end: '18:00', holiday: false },
    '토': { start: '09:00', end: '18:00', holiday: true },
    '일': { start: '09:00', end: '18:00', holiday: true },
};

const SCHEDULE_KEY = 'work-week-schedule';

function loadSchedule(): WeekSchedule {
    try {
        const raw = localStorage.getItem(SCHEDULE_KEY);
        if (raw) return { ...DEFAULT_SCHEDULE, ...JSON.parse(raw) };
    } catch {}
    return DEFAULT_SCHEDULE;
}

function saveSchedule(s: WeekSchedule) {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(s));
}

export function WorkTimeSection() {
    const { workLogs, addWorkLog, updateWorkLog, deleteWorkLog } = useData();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [schedule, setSchedule] = useState<WeekSchedule>(DEFAULT_SCHEDULE);
    const [showSchedule, setShowSchedule] = useState(false);

    useEffect(() => {
        setSchedule(loadSchedule());
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const activeLog = workLogs.find(log => !log.endTime && isSameDay(new Date(log.date), new Date()));

    const handleClockIn = () => {
        addWorkLog({ id: generateId(), date: new Date(), startTime: new Date(), notes: '' });
    };

    const handleClockOut = () => {
        if (activeLog) updateWorkLog({ ...activeLog, endTime: new Date() });
    };

    const calculateDuration = (start: Date, end?: Date) => {
        const endTime = end || currentTime;
        const diff = differenceInMinutes(new Date(endTime), new Date(start));
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        return `${h}시간 ${m}분`;
    };

    const todayLogs = workLogs.filter(log => isSameDay(new Date(log.date), new Date()));
    const totalTodayMinutes = todayLogs.reduce((acc, log) => {
        const end = log.endTime ? new Date(log.endTime) : (isSameDay(new Date(log.date), new Date()) ? currentTime : new Date(log.startTime));
        return acc + differenceInMinutes(end, new Date(log.startTime));
    }, 0);

    // Today's schedule
    const todayDayIdx = (new Date().getDay() + 6) % 7; // 0=월 ... 6=일
    const todayKey = DAYS[todayDayIdx];
    const todaySchedule = schedule[todayKey];

    const updateDay = (day: DayKey, field: keyof DaySchedule, value: string | boolean) => {
        const updated = { ...schedule, [day]: { ...schedule[day], [field]: value } };
        setSchedule(updated);
        saveSchedule(updated);
    };

    // Weekly stats (use real data)
    const weeklyLogs = workLogs.filter(log => {
        const d = new Date(log.date);
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return d >= weekAgo;
    });
    const weeklyMinutes = weeklyLogs.reduce((acc, log) => {
        if (!log.endTime) return acc;
        return acc + differenceInMinutes(new Date(log.endTime), new Date(log.startTime));
    }, 0);

    // Per-day hours for bar chart (Mon-Sun this week)
    const dayMinutes = DAYS.map((_, i) => {
        const target = new Date();
        const dayOfWeek = (target.getDay() + 6) % 7;
        const diff = i - dayOfWeek;
        target.setDate(target.getDate() + diff);
        const dayLogs = workLogs.filter(log => isSameDay(new Date(log.date), target) && log.endTime);
        return dayLogs.reduce((acc, log) => acc + differenceInMinutes(new Date(log.endTime!), new Date(log.startTime)), 0);
    });
    const maxMinutes = Math.max(...dayMinutes, 1);

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Panel */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Clock + Controls */}
                    <div className="glass-premium rounded-[40px] border border-white/5 p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-sky-500/[0.05] pointer-events-none" />

                        <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                            <div className="text-center md:text-left">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                        <Timer className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    {!todaySchedule.holiday ? (
                                        <span className="text-xs font-semibold text-indigo-300/70">
                                            오늘 근무: {todaySchedule.start} ~ {todaySchedule.end}
                                        </span>
                                    ) : (
                                        <span className="text-xs font-semibold text-white/30">오늘은 휴일입니다</span>
                                    )}
                                </div>
                                <div className="text-7xl font-black text-white tracking-tighter tabular-nums leading-none">
                                    {format(currentTime, 'HH:mm')}<span className="text-indigo-500/30 font-light">:</span><span className="text-indigo-400">{format(currentTime, 'ss')}</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center md:items-end gap-6">
                                <AnimatePresence mode="wait">
                                    {activeLog ? (
                                        <motion.div key="active" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center md:text-right">
                                            <div className="flex items-center gap-2 justify-center md:justify-end mb-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-xs font-semibold text-emerald-400">근무 중</span>
                                            </div>
                                            <div className="text-3xl font-black text-white tracking-tighter font-mono">
                                                {calculateDuration(activeLog.startTime)}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="idle" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center md:text-right">
                                            <div className="text-[11px] font-semibold text-white/20 mb-1">오늘 누적</div>
                                            <div className="text-2xl font-black text-white/60 tracking-tight">
                                                {Math.floor(totalTodayMinutes / 60)}시간 {totalTodayMinutes % 60}분
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex gap-4">
                                    {!activeLog ? (
                                        <Button onClick={handleClockIn} className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-[0_12px_24px_-8px_rgba(99,102,241,0.5)] active:scale-95 transition-all">
                                            <Play className="w-4 h-4 mr-2 fill-current" /> 출근
                                        </Button>
                                    ) : (
                                        <>
                                            <Button variant="outline" className="h-14 px-6 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 text-white font-bold text-sm">
                                                <Coffee className="w-4 h-4 mr-2" /> 휴식
                                            </Button>
                                            <Button onClick={handleClockOut} className="h-14 px-10 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-[0_12px_24px_-8px_rgba(225,29,72,0.4)] active:scale-95 transition-all">
                                                <Square className="w-4 h-4 mr-2 fill-current" /> 퇴근
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Work Logs */}
                    <div className="glass-premium rounded-[32px] border border-white/5 p-8 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <History className="w-4 h-4 text-indigo-400" />
                                </div>
                                <h4 className="text-sm font-bold text-white">근무 기록</h4>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {workLogs.length > 0 ? (
                                workLogs.slice(-5).reverse().map(log => (
                                    <div key={log.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all">
                                        <div className="flex items-center gap-8">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-white/30 mb-0.5">날짜</span>
                                                <span className="text-sm font-bold text-white">{format(new Date(log.date), 'MM월 dd일')}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-white/30 mb-0.5">시간</span>
                                                <span className="text-sm text-white/60">
                                                    {format(new Date(log.startTime), 'HH:mm')} — {log.endTime ? format(new Date(log.endTime), 'HH:mm') : <span className="text-emerald-400">근무 중</span>}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-bold text-indigo-400">
                                                {log.endTime ? calculateDuration(log.startTime, log.endTime) : '---'}
                                            </span>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/10 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg" onClick={() => deleteWorkLog(log.id)}>
                                                <Square className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                                    <Clock className="w-8 h-8 text-white/10 mx-auto mb-3" />
                                    <span className="text-sm text-white/20">근무 기록이 없습니다</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Side: Stats + Schedule Settings */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Weekly Stats */}
                    <div className="glass-premium rounded-[32px] border border-white/5 p-8 shadow-2xl relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <BarChart2 className="w-4 h-4 text-indigo-400" />
                            </div>
                            <h4 className="text-sm font-bold text-sky-400">이번 주 현황</h4>
                        </div>

                        <div className="flex items-end gap-2 h-36 mb-6">
                            {DAYS.map((day, i) => {
                                const mins = dayMinutes[i];
                                const heightPct = maxMinutes > 0 ? (mins / maxMinutes) * 100 : 0;
                                const isToday = i === todayDayIdx;
                                return (
                                    <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full">
                                        <div className="w-full bg-white/5 rounded-xl relative h-full overflow-hidden">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${heightPct}%` }}
                                                className={cn(
                                                    "absolute bottom-0 w-full rounded-xl",
                                                    isToday ? "bg-gradient-to-t from-indigo-600 to-sky-400 shadow-[0_0_12px_rgba(99,102,241,0.4)]" : "bg-white/10"
                                                )}
                                            />
                                        </div>
                                        <span className={cn("text-[10px] font-semibold", isToday ? "text-indigo-400" : "text-white/20")}>{day}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="space-y-4 pt-5 border-t border-white/5">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-white/30">주간 합계</span>
                                <span className="font-bold text-white">{Math.floor(weeklyMinutes / 60)}시간 {weeklyMinutes % 60}분</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-white/30">오늘 누적</span>
                                <span className="font-bold text-white">{Math.floor(totalTodayMinutes / 60)}시간 {totalTodayMinutes % 60}분</span>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Settings */}
                    <div className="glass-premium rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
                        <button
                            onClick={() => setShowSchedule(v => !v)}
                            className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Settings className="w-4 h-4 text-indigo-400" />
                                </div>
                                <span className="text-sm font-bold text-white">일별 근무시간 설정</span>
                            </div>
                            <ChevronDown className={cn("w-4 h-4 text-white/30 transition-transform", showSchedule && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                            {showSchedule && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-6 pb-6 space-y-3 border-t border-white/5 pt-4">
                                        {DAYS.map(day => {
                                            const ds = schedule[day];
                                            const isWeekend = day === '토' || day === '일';
                                            return (
                                                <div key={day} className={cn(
                                                    "flex items-center gap-3 p-3 rounded-2xl transition-colors",
                                                    ds.holiday ? "opacity-40" : "bg-white/[0.02]"
                                                )}>
                                                    <span className={cn(
                                                        "w-8 text-center text-sm font-bold shrink-0",
                                                        isWeekend ? "text-rose-400/80" : "text-white/70"
                                                    )}>{day}</span>

                                                    {ds.holiday ? (
                                                        <span className="flex-1 text-xs text-white/30 text-center">휴일</span>
                                                    ) : (
                                                        <div className="flex-1 flex items-center gap-2">
                                                            <input
                                                                type="time"
                                                                value={ds.start}
                                                                onChange={e => updateDay(day, 'start', e.target.value)}
                                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white/70 focus:outline-none focus:border-indigo-500/40 min-w-0"
                                                            />
                                                            <span className="text-white/20 text-xs shrink-0">~</span>
                                                            <input
                                                                type="time"
                                                                value={ds.end}
                                                                onChange={e => updateDay(day, 'end', e.target.value)}
                                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white/70 focus:outline-none focus:border-indigo-500/40 min-w-0"
                                                            />
                                                        </div>
                                                    )}

                                                    <button
                                                        onClick={() => updateDay(day, 'holiday', !ds.holiday)}
                                                        className={cn(
                                                            "shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all",
                                                            ds.holiday
                                                                ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                                                                : "bg-white/5 text-white/30 hover:bg-white/10"
                                                        )}
                                                    >
                                                        휴일
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        <p className="text-[10px] text-white/20 text-center pt-2">변경 시 자동 저장됩니다</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

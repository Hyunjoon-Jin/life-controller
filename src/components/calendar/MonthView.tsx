import { useState, useEffect } from 'react';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    format,
    isValid,
} from 'date-fns';
import { cn, generateId } from '@/lib/utils';
import { useData } from '@/context/DataProvider';
import { Target, CheckCircle, Users, Handshake, Briefcase, Plane } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarEvent } from '@/types';

export function MonthView({ currentDate, onDateClick, showProjectTasks }: { currentDate: Date; onDateClick: (date: Date) => void; showProjectTasks: boolean }) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const { goals, events, addEvent, tasks, projects } = useData();

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; date: Date } | null>(null);
    const [workDialogOpen, setWorkDialogOpen] = useState(false);
    const [vacationDialogOpen, setVacationDialogOpen] = useState(false);

    // Form State
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [workStatus, setWorkStatus] = useState('출근');
    const [workStartTime, setWorkStartTime] = useState('09:00');
    const [workEndTime, setWorkEndTime] = useState('18:00');
    const [vacationType, setVacationType] = useState('연차');

    const handleContextMenu = (e: React.MouseEvent, date: Date) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, date });
        setSelectedDate(date);
    };

    // Global click listener to close context menu
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const handleOpenWorkDialog = () => {
        setWorkDialogOpen(true);
        // context menu closed by global listener mostly, or force close
        setContextMenu(null);
    };

    const handleOpenVacationDialog = () => {
        setVacationDialogOpen(true);
        setContextMenu(null);
    };

    const handleSaveWorkLog = () => {
        if (!selectedDate) return;
        const start = new Date(selectedDate);
        const end = new Date(selectedDate); // All day conceptually, but has hours

        const newLog: CalendarEvent = {
            id: generateId(),
            title: `[${workStatus}]`,
            start,
            end,
            type: 'work',
            isWorkLog: true,
            workDetails: {
                status: workStatus,
                hours: `${workStartTime} - ${workEndTime}`
            },
            color: 'bg-slate-500/10 text-slate-300 border-slate-500/20'
        };
        addEvent(newLog);
        setWorkDialogOpen(false);
    };

    const handleSaveVacation = () => {
        if (!selectedDate) return;
        const start = new Date(selectedDate);
        const end = new Date(selectedDate); // All day

        const newVacation: CalendarEvent = {
            id: generateId(),
            title: vacationType,
            start,
            end,
            type: 'vacation',
            color: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        };
        addEvent(newVacation);
        setVacationDialogOpen(false);
    };

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    return (
        <div className="flex flex-col h-full glass-premium rounded-[32px] border border-white/10 shadow-2xl overflow-hidden relative">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.02]">
                {weekDays.map((day) => (
                    <div
                        key={day}
                        className="py-4 text-center text-[10px] font-black text-white/60 uppercase tracking-[0.2em]"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 auto-rows-fr flex-1 bg-white/[0.01]">
                {days.map((day, dayIdx) => {
                    const daysGoals = goals.filter(g => {
                        if (!g.deadline) return false;
                        const d = new Date(g.deadline);
                        return isValid(d) && isSameDay(d, day);
                    });

                    const daysEvents = events.filter(e => {
                        const d = new Date(e.start);
                        return isValid(d) && isSameDay(d, day) &&
                            (e.isMeeting || e.isAppointment || e.type === 'vacation' || e.isWorkLog);
                    });

                    const daysProjectTasks = showProjectTasks ? tasks.filter(t => {
                        if (!t.projectId) return false;
                        if (t.completed) return false;

                        const targetDate = t.endDate ? new Date(t.endDate) : (t.deadline ? new Date(t.deadline) : (t.startDate ? new Date(t.startDate) : null));
                        if (!targetDate || !isValid(targetDate)) return false;

                        return isSameDay(targetDate, day);
                    }) : [];

                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isTodayDay = isToday(day);

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => onDateClick(day)}
                            onContextMenu={(e) => handleContextMenu(e, day)}
                            className={cn(
                                "min-h-[100px] p-2 border-r border-b border-white/5 relative transition-all duration-300 hover:bg-white/[0.04] cursor-pointer group flex flex-col gap-1.5",
                                (dayIdx + 1) % 7 === 0 && "border-r-0",
                                !isCurrentMonth && "opacity-20",
                                isTodayDay && "bg-emerald-500/[0.03]"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <span
                                    className={cn(
                                        "text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-xl transition-all duration-500",
                                        isTodayDay
                                            ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-110"
                                            : "text-white/40 group-hover:text-white/80"
                                    )}
                                >
                                    {format(day, 'd')}
                                </span>
                                {isTodayDay && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)] mt-2 mr-1" />
                                )}
                            </div>

                            <div className="space-y-1 w-full overflow-hidden flex-1">
                                {/* Mobile View: Minimal Indicators */}
                                <div className="flex md:hidden flex-wrap justify-center gap-1 content-start py-1">
                                    {(daysEvents.length > 0 || daysGoals.length > 0 || daysProjectTasks.length > 0) && (
                                        <div className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                    )}
                                </div>

                                {/* Desktop View: Premium Tags */}
                                <div className="hidden md:block space-y-1">
                                    {daysEvents.map(event => (
                                        <div
                                            key={event.id}
                                            className={cn(
                                                "flex items-center gap-1.5 text-[9px] px-2 py-1 rounded-lg truncate font-bold border transition-all hover:scale-[1.02]",
                                                event.type === 'vacation' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                    event.isWorkLog ? "bg-slate-500/10 text-slate-300 border-slate-500/20" :
                                                        event.type === 'work' ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" :
                                                            "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                                            )}
                                        >
                                            {event.isMeeting && <Users className="w-2.5 h-2.5 opacity-60" />}
                                            {event.isAppointment && <Handshake className="w-2.5 h-2.5 opacity-60" />}
                                            {event.type === 'vacation' && <Plane className="w-2.5 h-2.5 opacity-60" />}
                                            {event.isWorkLog && <Briefcase className="w-2.5 h-2.5 opacity-60" />}
                                            <span className="truncate tracking-tight uppercase">
                                                {event.isWorkLog && event.workDetails ? event.workDetails.status : event.title}
                                            </span>
                                        </div>
                                    ))}

                                    {daysGoals.map(goal => (
                                        <div key={goal.id} className="flex items-center gap-1.5 text-[9px] bg-red-500/10 text-red-400 px-2 py-1 rounded-lg truncate border border-red-500/20 font-bold hover:scale-[1.02] transition-all">
                                            <Target className="w-2.5 h-2.5 opacity-60" />
                                            <span className="truncate uppercase">{goal.title}</span>
                                        </div>
                                    ))}

                                    {daysProjectTasks.map(task => {
                                        const project = projects.find(p => p.id === task.projectId);
                                        return (
                                            <div
                                                key={task.id}
                                                className="flex items-center gap-1.5 text-[9px] px-2 py-1 rounded-lg truncate font-bold border border-white/5 hover:scale-[1.02] transition-all bg-white/5 text-white/70"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: project?.color || '#10b981' }} />
                                                <span className="truncate uppercase">{task.title}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Custom Context Menu */}
            {contextMenu && (
                <div
                    className="fixed z-[100] min-w-[180px] glass-premium rounded-2xl border border-white/10 shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-200"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-3 py-2 text-[10px] font-black text-white/60 border-b border-white/5 mb-1.5 uppercase tracking-widest">
                        {format(contextMenu.date, 'M월 d일')}
                    </div>
                    <button
                        onClick={handleOpenWorkDialog}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-xl text-white/70 hover:bg-emerald-500 hover:text-white transition-all group"
                    >
                        <Briefcase className="w-4 h-4 opacity-40 group-hover:opacity-100" /> 근무 기록 입력
                    </button>
                    <button
                        onClick={handleOpenVacationDialog}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-xl text-white/70 hover:bg-rose-500 hover:text-white transition-all group"
                    >
                        <Plane className="w-4 h-4 opacity-40 group-hover:opacity-100" /> 휴가 등록
                    </button>
                </div>
            )}

            {/* Dialogs Stylized for Premium */}
            <Dialog open={workDialogOpen} onOpenChange={setWorkDialogOpen}>
                <DialogContent className="sm:max-w-[425px] glass-premium border border-white/10 text-white rounded-[32px] p-8 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight mb-4">근무 기록 입력</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right text-xs font-bold text-white/60">상태</Label>
                            <select
                                id="status"
                                className="col-span-3 h-12 bg-white/5 border-white/10 rounded-xl px-4 text-sm font-bold text-white focus:ring-2 ring-emerald-500/50 transition-all outline-none"
                                value={workStatus}
                                onChange={(e) => setWorkStatus(e.target.value)}
                            >
                                <option value="출근" className="bg-slate-900">출근</option>
                                <option value="재택" className="bg-slate-900">재택</option>
                                <option value="외근" className="bg-slate-900">외근</option>
                                <option value="출장" className="bg-slate-900">출장</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="startTime" className="text-right text-xs font-bold text-white/60">시작</Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={workStartTime}
                                onChange={(e) => setWorkStartTime(e.target.value)}
                                className="col-span-3 h-12 bg-white/5 border-white/10 rounded-xl text-white font-bold"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="endTime" className="text-right text-xs font-bold text-white/60">종료</Label>
                            <Input
                                id="endTime"
                                type="time"
                                value={workEndTime}
                                onChange={(e) => setWorkEndTime(e.target.value)}
                                className="col-span-3 h-12 bg-white/5 border-white/10 rounded-xl text-white font-bold"
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button
                            onClick={handleSaveWorkLog}
                            className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black tracking-widest shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                        >
                            기록 저장
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={vacationDialogOpen} onOpenChange={setVacationDialogOpen}>
                <DialogContent className="sm:max-w-[425px] glass-premium border border-white/10 text-white rounded-[32px] p-8 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight mb-4">휴가 등록</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right text-xs font-bold text-white/60">종류</Label>
                            <select
                                id="type"
                                className="col-span-3 h-12 bg-white/5 border-white/10 rounded-xl px-4 text-sm font-bold text-white outline-none"
                                value={vacationType}
                                onChange={(e) => setVacationType(e.target.value)}
                            >
                                <option value="연차" className="bg-slate-900">연차</option>
                                <option value="반차 (오전)" className="bg-slate-900">반차 (오전)</option>
                                <option value="반차 (오후)" className="bg-slate-900">반차 (오후)</option>
                                <option value="병가" className="bg-slate-900">병가</option>
                                <option value="특별휴가" className="bg-slate-900">특별휴가</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button
                            onClick={handleSaveVacation}
                            className="w-full h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black tracking-widest shadow-[0_10px_20px_-5px_rgba(244,63,94,0.3)] transition-all active:scale-95"
                        >
                            휴가 저장
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

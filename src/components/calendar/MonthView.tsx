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
            color: 'bg-slate-100 text-slate-700 border-slate-200'
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
            color: 'bg-rose-100 text-rose-700 border-rose-200'
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
        <div className="flex flex-col h-full bg-white rounded-3xl border border-transparent shadow-sm overflow-hidden relative">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-border/[0.05] bg-gray-50/50">
                {weekDays.map((day) => (
                    <div
                        key={day}
                        className="py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 grid-rows-5 flex-1">
                {days.map((day, dayIdx) => {
                    const daysGoals = goals.filter(g => {
                        if (!g.deadline) return false;
                        const d = new Date(g.deadline);
                        return isValid(d) && isSameDay(d, day);
                    });

                    // Filter Events: ONLY Meeting, Appointment, Vacation, WorkLog
                    const daysEvents = events.filter(e => {
                        const d = new Date(e.start);
                        return isValid(d) && isSameDay(d, day) &&
                            (e.isMeeting || e.isAppointment || e.type === 'vacation' || e.isWorkLog);
                    });

                    // Filter Project Tasks
                    const daysProjectTasks = showProjectTasks ? tasks.filter(t => {
                        if (!t.projectId) return false;
                        if (t.completed) return false; // Optional: Hide completed tasks

                        // Check if task is active on this day (simplified: start <= day <= end/deadline)
                        // Or just show on start date or deadline?
                        // Let's show if 'deadline' matches this day OR 'startDate' matches this day
                        // Common pattern: Show on deadline as "Due"

                        const targetDate = t.endDate ? new Date(t.endDate) : (t.deadline ? new Date(t.deadline) : (t.startDate ? new Date(t.startDate) : null));
                        if (!targetDate || !isValid(targetDate)) return false;

                        return isSameDay(targetDate, day);
                    }) : [];

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => onDateClick(day)}
                            onContextMenu={(e) => handleContextMenu(e, day)}
                            className={cn(
                                "min-h-[100px] p-2 border-r border-b border-border/[0.05] relative transition-colors hover:bg-muted/20 cursor-pointer overflow-hidden flex flex-col gap-1 select-none",
                                (dayIdx + 1) % 7 === 0 && "border-r-0",
                                !isSameMonth(day, monthStart) && "bg-gray-50/30 text-muted-foreground",
                                isToday(day) && "bg-primary/5"
                            )}
                        >
                            <div className="flex justify-between items-start mb-0">
                                <span
                                    className={cn(
                                        "text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full transition-all",
                                        isToday(day)
                                            ? "bg-primary text-primary-foreground shadow-md scale-110"
                                            : "text-foreground group-hover:bg-muted"
                                    )}
                                >
                                    {format(day, 'd')}
                                </span>
                            </div>

                            <div className="space-y-1 w-full overflow-hidden">
                                {/* Mobile View: Dots */}
                                <div className="flex md:hidden flex-wrap gap-0.5 content-start">
                                    {daysEvents.map(event => (
                                        <div key={event.id} className={cn("w-1.5 h-1.5 rounded-full", event.color?.split(' ')[1] || "bg-gray-400")} />
                                    ))}
                                    {daysGoals.map(goal => (
                                        <div key={goal.id} className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                    ))}
                                    {daysProjectTasks.map(task => {
                                        const project = projects.find(p => p.id === task.projectId);
                                        return <div key={task.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: project?.color || '#3b82f6' }} />
                                    })}
                                </div>

                                {/* Desktop View: Details */}
                                <div className="hidden md:block space-y-1">
                                    {daysEvents.map(event => (
                                        <div
                                            key={event.id}
                                            className={cn(
                                                "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium border",
                                                event.type === 'vacation' ? "bg-rose-100 text-rose-700 border-rose-200" :
                                                    event.isWorkLog ? "bg-slate-100 text-slate-700 border-slate-200" :
                                                        event.type === 'work' ? "bg-blue-100 text-blue-700 border-blue-200" :
                                                            event.type === 'personal' ? "bg-green-100 text-green-700 border-green-200" :
                                                                "bg-gray-100 text-gray-700 border-gray-200"
                                            )}
                                        >
                                            {event.isMeeting && <Users className="w-3 h-3 shrink-0" />}
                                            {event.isAppointment && <Handshake className="w-3 h-3 shrink-0" />}
                                            {event.type === 'vacation' && <Plane className="w-3 h-3 shrink-0" />}
                                            {event.isWorkLog && <Briefcase className="w-3 h-3 shrink-0" />}

                                            <span className="truncate">
                                                {event.isWorkLog && event.workDetails
                                                    ? `${event.workDetails.status} (${event.workDetails.hours})`
                                                    : event.title}
                                            </span>
                                        </div>
                                    ))}

                                    {daysGoals.map(goal => (
                                        <div key={goal.id} className="flex items-center gap-1 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full truncate border border-red-200/50 opacity-80">
                                            <Target className="w-3 h-3 shrink-0" />
                                            <span className="truncate">{goal.title}</span>
                                        </div>
                                    ))}

                                    {daysProjectTasks.map(task => {
                                        const project = projects.find(p => p.id === task.projectId);
                                        return (
                                            <div
                                                key={task.id}
                                                className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full truncate border border-transparent opacity-90 text-white shadow-sm"
                                                style={{ backgroundColor: project?.color || '#3b82f6' }}
                                            >
                                                <Briefcase className="w-3 h-3 shrink-0 text-white/80" />
                                                <span className="truncate">{task.title}</span>
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
                    className="fixed z-50 min-w-[160px] bg-popover text-popover-foreground rounded-md border shadow-md p-1 animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()} // Prevent close on self click
                >
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b mb-1">
                        {format(contextMenu.date, 'M월 d일')}
                    </div>
                    <button
                        onClick={handleOpenWorkDialog}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer text-left"
                    >
                        <Briefcase className="w-4 h-4" /> 근무 기록 입력
                    </button>
                    <button
                        onClick={handleOpenVacationDialog}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer text-left"
                    >
                        <Plane className="w-4 h-4" /> 휴가 등록
                    </button>
                </div>
            )}

            {/* Work Log Dialog */}
            <Dialog open={workDialogOpen} onOpenChange={setWorkDialogOpen}>
                <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>근무 기록 입력</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">근무 상태</Label>
                            <select
                                id="status"
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={workStatus}
                                onChange={(e) => setWorkStatus(e.target.value)}
                            >
                                <option value="출근">출근</option>
                                <option value="재택">재택</option>
                                <option value="외근">외근</option>
                                <option value="출장">출장</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="startTime" className="text-right">시작</Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={workStartTime}
                                onChange={(e) => setWorkStartTime(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="endTime" className="text-right">종료</Label>
                            <Input
                                id="endTime"
                                type="time"
                                value={workEndTime}
                                onChange={(e) => setWorkEndTime(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveWorkLog}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Vacation Dialog */}
            <Dialog open={vacationDialogOpen} onOpenChange={setVacationDialogOpen}>
                <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>휴가 등록</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">종류</Label>
                            <select
                                id="type"
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={vacationType}
                                onChange={(e) => setVacationType(e.target.value)}
                            >
                                <option value="연차">연차</option>
                                <option value="반차 (오전)">반차 (오전)</option>
                                <option value="반차 (오후)">반차 (오후)</option>
                                <option value="병가">병가</option>
                                <option value="특별휴가">특별휴가</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveVacation}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

'use client';

import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn, generateId } from '@/lib/utils';
import { Plus, Target, CheckCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useData } from '@/context/DataProvider';
import { CalendarEvent } from '@/types';
import { EventDialog } from './EventDialog';
import { getEventStyle, getEventColors } from '@/lib/calendar';

export function WeekView({ currentDate, showProjectTasks, onDateClick }: { currentDate: Date; showProjectTasks: boolean; onDateClick: (date: Date) => void }) {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday start
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const { events, addEvent, updateEvent, deleteEvent, goals, tasks, projects } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Drag & Resize State
    const [dragState, setDragState] = useState<{
        id: string;
        mode: 'move' | 'resize';
        originalStart: Date;
        originalEnd: Date;
        initialY: number;
    } | null>(null);
    const dragStateRef = useRef(dragState);

    const [tempEvent, setTempEvent] = useState<CalendarEvent | null>(null);
    const tempEventRef = useRef(tempEvent);
    const [now, setNow] = useState(new Date());

    useEffect(() => { dragStateRef.current = dragState; }, [dragState]);
    useEffect(() => { tempEventRef.current = tempEvent; }, [tempEvent]);

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);
    const PIXELS_PER_HOUR = 60;
    const SNAP_MINUTES = 15;

    const handleOpenCreate = (day: Date, hour: number) => {
        if (dragState) return;
        const date = new Date(day);
        date.setHours(hour, 0, 0, 0);
        setSelectedDate(date);
        setSelectedEvent(null);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (event: CalendarEvent) => {
        if (dragState) return;
        setSelectedEvent(event);
        setSelectedDate(null);
        setIsDialogOpen(true);
    };

    const handleSaveEvent = (savedEvent: CalendarEvent) => {
        if (selectedEvent) {
            updateEvent(savedEvent);
        } else {
            addEvent({
                ...savedEvent,
                id: generateId()
            });
        }
    };

    const handleDeleteEvent = (id: string) => {
        deleteEvent(id);
    };

    // --- Interaction Handlers ---

    const startResize = (e: React.MouseEvent, event: CalendarEvent) => {
        e.stopPropagation();
        setDragState({
            id: event.id,
            mode: 'resize',
            originalStart: new Date(event.start),
            originalEnd: new Date(event.end),
            initialY: e.clientY
        });
        setTempEvent(event);
    };

    const startMove = (e: React.MouseEvent, event: CalendarEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setDragState({
            id: event.id,
            mode: 'move',
            originalStart: new Date(event.start),
            originalEnd: new Date(event.end),
            initialY: e.clientY
        });
        setTempEvent(event);
    };

    // Touch handlers for mobile
    const startTouchMove = (e: React.TouchEvent, event: CalendarEvent) => {
        e.stopPropagation();
        const touch = e.touches[0];
        setDragState({
            id: event.id,
            mode: 'move',
            originalStart: new Date(event.start),
            originalEnd: new Date(event.end),
            initialY: touch.clientY
        });
        setTempEvent(event);
    };

    const startTouchResize = (e: React.TouchEvent, event: CalendarEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const touch = e.touches[0];
        setDragState({
            id: event.id,
            mode: 'resize',
            originalStart: new Date(event.start),
            originalEnd: new Date(event.end),
            initialY: touch.clientY
        });
        setTempEvent(event);
    };

    // Handle drop on a different day column
    const handleColumnMouseUp = (day: Date) => {
        if (dragState && dragState.mode === 'move' && tempEvent) {
            // Calculate time difference to preserve hour/minute
            const duration = tempEvent.end.getTime() - tempEvent.start.getTime();

            const newStart = new Date(day);
            newStart.setHours(tempEvent.start.getHours(), tempEvent.start.getMinutes(), 0, 0);

            const newEnd = new Date(newStart.getTime() + duration);

            updateEvent({ ...tempEvent, start: newStart, end: newEnd });
            setDragState(null);
            setTempEvent(null);
        }
    };

    useEffect(() => {
        if (!dragState || !tempEvent) return;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaY = e.clientY - dragState.initialY;
            const deltaMinutes = Math.round((deltaY / PIXELS_PER_HOUR) * 60 / SNAP_MINUTES) * SNAP_MINUTES;

            if (dragState.mode === 'move') {
                const newStart = new Date(dragState.originalStart);
                newStart.setMinutes(newStart.getMinutes() + deltaMinutes);

                const newEnd = new Date(dragState.originalEnd);
                newEnd.setMinutes(newEnd.getMinutes() + deltaMinutes);

                setTempEvent({ ...tempEvent, start: newStart, end: newEnd });
            } else {
                // Resize
                const newEnd = new Date(dragState.originalEnd);
                newEnd.setMinutes(newEnd.getMinutes() + deltaMinutes);

                // Minimum duration check (e.g. 15 mins)
                const start = new Date(dragState.originalStart);
                if (newEnd.getTime() - start.getTime() >= 15 * 60 * 1000) {
                    setTempEvent({ ...tempEvent, end: newEnd });
                }
            }
        };

        const handleMouseUp = () => {
            if (dragState && tempEvent) {
                updateEvent(tempEvent);
                setDragState(null);
                setTempEvent(null);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            const touch = e.touches[0];
            if (!touch) return;
            handleMouseMove({ clientY: touch.clientY } as MouseEvent);
            if (dragStateRef.current && e.cancelable) {
                e.preventDefault();
            }
        };

        const handleTouchEnd = () => {
            handleMouseUp();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [dragState, tempEvent, updateEvent, PIXELS_PER_HOUR]);


    const getEventColors = (event: CalendarEvent) => {
        if ((event as any).isHabit) return {
            bg: 'rgba(251, 146, 60, 0.05)',
            border: 'transparent',
            text: '#ea580c',
            accent: '#fb923c'
        };

        switch (event.type) {
            case 'work':
                return {
                    bg: 'rgba(16, 185, 129, 0.08)',
                    border: 'rgba(16, 185, 129, 0.2)',
                    text: '#059669',
                    accent: '#10b981'
                };
            case 'study':
                return {
                    bg: 'rgba(59, 130, 246, 0.08)',
                    border: 'rgba(59, 130, 246, 0.2)',
                    text: '#2563eb',
                    accent: '#3b82f6'
                };
            case 'hobby':
                return {
                    bg: 'rgba(245, 158, 11, 0.08)',
                    border: 'rgba(245, 158, 11, 0.2)',
                    text: '#d97706',
                    accent: '#f97316'
                };
            case 'health':
                return {
                    bg: 'rgba(239, 68, 68, 0.08)',
                    border: 'rgba(239, 68, 68, 0.2)',
                    text: '#dc2626',
                    accent: '#ef4444'
                };
            case 'finance':
                return {
                    bg: 'rgba(34, 197, 94, 0.08)',
                    border: 'rgba(34, 197, 94, 0.2)',
                    text: '#16a34a',
                    accent: '#22c55e'
                };
            case 'social':
                return {
                    bg: 'rgba(236, 72, 153, 0.08)',
                    border: 'rgba(236, 72, 153, 0.2)',
                    text: '#db2777',
                    accent: '#ec4899'
                };
            case 'travel':
                return {
                    bg: 'rgba(6, 182, 212, 0.08)',
                    border: 'rgba(6, 182, 212, 0.2)',
                    text: '#0891b2',
                    accent: '#06b6d4'
                };
            case 'meal':
                return {
                    bg: 'rgba(249, 115, 22, 0.08)',
                    border: 'rgba(249, 115, 22, 0.2)',
                    text: '#ea580c',
                    accent: '#f97316'
                };
            case 'personal':
                return {
                    bg: 'rgba(99, 102, 241, 0.08)',
                    border: 'rgba(99, 102, 241, 0.2)',
                    text: '#4f46e5',
                    accent: '#6366f1'
                };
            default:
                return {
                    bg: 'rgba(107, 114, 128, 0.08)',
                    border: 'rgba(107, 114, 128, 0.2)',
                    text: '#4b5563',
                    accent: '#6b7280'
                };
        }
    };

    return (
        <div className="flex flex-col h-full glass-premium rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative select-none">
            {/* Header Row (Days) */}
            <div className="flex border-b border-white/5 bg-white/[0.02]">
                <div className="w-20 flex-shrink-0 border-r border-white/5 bg-transparent" />
                {weekDays.map((day) => {
                    const daysGoals = goals.filter(g => {
                        if (!g.deadline) return false;
                        const d = new Date(g.deadline);
                        return isValid(d) && isSameDay(d, day);
                    });

                    const daysProjectTasks = showProjectTasks ? tasks.filter(t => {
                        if (!t.projectId) return false;
                        if (t.completed) return false;
                        const targetDate = t.endDate ? new Date(t.endDate) : (t.deadline ? new Date(t.deadline) : (t.startDate ? new Date(t.startDate) : null));
                        if (!targetDate || !isValid(targetDate)) return false;
                        return isSameDay(targetDate, day);
                    }) : [];

                    const isTodayDay = isToday(day);

                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "flex-1 py-4 px-1 text-center border-r border-white/5 last:border-r-0 flex flex-col gap-2 min-w-[100px] cursor-pointer hover:bg-white/[0.05] transition-all duration-300",
                                isTodayDay ? "bg-emerald-500/[0.03]" : "bg-transparent"
                            )}
                            onClick={() => onDateClick(day)}
                        >
                            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{format(day, 'EEE', { locale: ko })}</div>
                            <div
                                className={cn(
                                    "w-9 h-9 mx-auto flex items-center justify-center rounded-xl text-sm font-black transition-all duration-500",
                                    isTodayDay
                                        ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-110"
                                        : "text-white/40 group-hover:text-white/80"
                                )}
                            >
                                {format(day, 'd')}
                            </div>

                            {/* Indicators in Header */}
                            <div className="flex justify-center gap-1.5 min-h-[4px] mt-1">
                                {daysGoals.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]" />}
                                {daysProjectTasks.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative flex touch-pan-y bg-white/[0.01]">
                {/* Time Labels Column */}
                <div className="w-20 flex-shrink-0 bg-black/20 backdrop-blur-md border-r border-white/5 z-20 sticky left-0">
                    {hours.map((hour) => (
                        <div key={hour} className="h-[60px] relative border-b last:border-b-0 border-white/[0.02]">
                            <span className="absolute -top-2.5 right-3 text-[10px] text-white/20 font-black tracking-tight uppercase">
                                {format(new Date().setHours(hour, 0, 0, 0), 'h aa')}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Day Columns */}
                {weekDays.map(day => {
                    const dayEvents = events.filter(e => {
                        const d = new Date(e.start);
                        return isValid(d) && isSameDay(d, day);
                    });

                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "flex-1 border-r last:border-r-0 border-white/5 relative min-w-[100px]",
                                isToday(day) && "bg-emerald-500/[0.01]"
                            )}
                            onMouseUp={() => handleColumnMouseUp(day)}
                        >
                            {/* Grid Lines */}
                            {hours.map(hour => (
                                <div key={hour} className="h-[60px] border-b border-white/[0.03] w-full relative">
                                    {[0, 15, 30, 45].map(minute => (
                                        <div
                                            key={minute}
                                            className="absolute w-full h-[25%] hover:bg-white/[0.03] cursor-pointer z-0 transition-colors"
                                            style={{ top: `${(minute / 60) * 100}%` }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenCreate(day, hour);
                                            }}
                                        />
                                    ))}
                                </div>
                            ))}

                            {/* Current Time Line */}
                            {isToday(day) && (
                                <div
                                    className="absolute left-0 right-0 border-t border-emerald-500/50 z-50 pointer-events-none flex items-center"
                                    style={{ top: `${(now.getHours() * PIXELS_PER_HOUR) + (now.getMinutes() / 60) * PIXELS_PER_HOUR}px` }}
                                >
                                    <div className="absolute -left-1.5 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                    <div className="h-[1px] w-full bg-emerald-500/30" />
                                </div>
                            )}

                            {/* Events */}
                            {dayEvents.map(event => {
                                const displayEvent = (dragState?.id === event.id && tempEvent) ? tempEvent : event;
                                const isDragging = dragState?.id === event.id;
                                const colors = getEventColors(event);

                                return (
                                    <div
                                        key={event.id}
                                        className={cn(
                                            "absolute inset-x-1.5 rounded-xl text-[10px] cursor-pointer pointer-events-auto overflow-hidden z-10 shadow-lg border-l-[4px] flex flex-col group transition-all duration-300 backdrop-blur-md",
                                            isDragging && "z-50 opacity-90 shadow-2xl scale-[1.02] ring-2 ring-white/20",
                                            !isDragging && "hover:shadow-2xl hover:brightness-110 hover:-translate-y-[1px]"
                                        )}
                                        style={{
                                            ...getEventStyle(displayEvent, PIXELS_PER_HOUR),
                                            backgroundColor: colors.bg.replace('0.08', '0.15'),
                                            borderColor: colors.border.replace('0.2', '0.3'),
                                            borderLeftColor: colors.accent,
                                            color: 'white'
                                        }}
                                        onMouseDown={(e) => startMove(e, event)}
                                        onTouchStart={(e) => startTouchMove(e, event)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isDragging) handleOpenEdit(event);
                                        }}
                                    >
                                        <div className="p-2 flex flex-col h-full gap-0.5">
                                            <div className="font-black truncate uppercase tracking-tight text-white/95">{event.title}</div>
                                            <div className="text-[9px] font-bold text-white/40 group-hover:text-white/60 transition-colors">
                                                {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                                            </div>
                                        </div>

                                        {/* Resize Handle */}
                                        <div className="absolute bottom-0 left-0 right-0 h-4 md:h-2 cursor-ns-resize md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center bg-white/5 active:bg-white/10"
                                            onMouseDown={(e) => startResize(e, event)}
                                            onTouchStart={(e) => startTouchResize(e, event)}
                                        >
                                            <div className="w-8 md:w-6 h-1 bg-white/20 rounded-full" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            <EventDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                event={selectedEvent}
                initialDate={selectedDate || currentDate}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
            />
        </div>
    );
}

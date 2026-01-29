'use client';

import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn, generateId } from '@/lib/utils';
import { Plus, Target, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useData } from '@/context/DataProvider';
import { CalendarEvent } from '@/types';
import { EventDialog } from './EventDialog';
import { getEventStyle, getEventColors } from '@/lib/calendar';

export function WeekView({ currentDate, showProjectTasks }: { currentDate: Date; showProjectTasks: boolean }) {
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

    const [tempEvent, setTempEvent] = useState<CalendarEvent | null>(null);
    const [now, setNow] = useState(new Date());

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
        e.preventDefault(); // Prevent text selection
        setDragState({
            id: event.id,
            mode: 'move',
            originalStart: new Date(event.start),
            originalEnd: new Date(event.end),
            initialY: e.clientY
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

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
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
        <div className="flex flex-col h-full bg-white rounded-3xl border border-transparent shadow-sm overflow-hidden relative select-none">
            {/* Header Row (Days) */}
            <div className="flex border-b border-border/[0.05] bg-gray-50/50">
                <div className="w-16 flex-shrink-0 border-r border-border/[0.05] bg-transparent" />
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

                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "flex-1 py-3 px-1 text-center border-r border-border/[0.05] last:border-r-0 flex flex-col gap-1 min-w-[100px]",
                                isToday(day) ? "bg-primary/5" : "bg-transparent"
                            )}
                        >
                            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{format(day, 'EEE', { locale: ko })}</div>
                            <div
                                className={cn(
                                    "w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-all mt-1",
                                    isToday(day)
                                        ? "bg-primary text-primary-foreground shadow-md scale-110"
                                        : "text-foreground"
                                )}
                            >
                                {format(day, 'd')}
                            </div>

                            {/* Goal Indicators in Header */}
                            {daysGoals.length > 0 && (
                                <div className="mt-1 flex flex-col gap-1 w-full px-1">
                                    {daysGoals.map(goal => (
                                        <div key={goal.id} className="text-[9px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full truncate flex items-center gap-1 border border-red-100 justify-center">
                                            <Target className="w-2.5 h-2.5 shrink-0" />
                                            <span className="truncate">{goal.title}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Project Task Indicators in Header */}
                            {daysProjectTasks.length > 0 && (
                                <div className="mt-1 flex flex-col gap-1 w-full px-1">
                                    {daysProjectTasks.map(task => {
                                        const project = projects.find(p => p.id === task.projectId);
                                        return (
                                            <div
                                                key={task.id}
                                                className="text-[9px] px-1.5 py-0.5 rounded-full truncate flex items-center gap-1 border border-transparent shadow-sm justify-center text-white opacity-90"
                                                style={{ backgroundColor: project?.color || '#3b82f6' }}
                                            >
                                                <span className="truncate">{task.title}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Grid Content - Column Based Layout */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative flex">
                {/* Time Labels Column */}
                <div className="w-16 flex-shrink-0 bg-white border-r border-border/[0.05] z-20 sticky left-0">
                    {hours.map((hour) => (
                        <div key={hour} className="h-[60px] relative border-b last:border-b-0 border-border/[0.05]">
                            <span className="absolute -top-2 right-2 text-[10px] text-gray-400 font-mono">
                                {format(new Date().setHours(hour, 0, 0, 0), 'h aa')}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Day Columns */}
                {weekDays.map(day => {
                    // Filter events for this day
                    const dayEvents = events.filter(e => {
                        const d = new Date(e.start);
                        return isValid(d) && isSameDay(d, day);
                    });

                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "flex-1 border-r last:border-r-0 border-border/[0.05] relative min-w-[100px]",
                                isToday(day) && "bg-primary/[0.01]"
                            )}
                            onMouseUp={() => handleColumnMouseUp(day)}
                        >
                            {/* Background Grid Lines */}
                            {hours.map(hour => (
                                <div key={hour} className="h-[60px] border-b border-border/[0.05] w-full relative">
                                    {/* Click zones for creation */}
                                    {[0, 15, 30, 45].map(minute => (
                                        <div
                                            key={minute}
                                            className="absolute w-full h-[25%] hover:bg-primary/5 cursor-pointer z-0"
                                            style={{ top: `${(minute / 60) * 100}%` }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenCreate(day, hour);
                                            }}
                                            title={`Add event at ${hour}:${minute}`}
                                        />
                                    ))}
                                </div>
                            ))}

                            {/* Current Time Line (Only for Today) */}
                            {isToday(day) && (
                                <div
                                    className="absolute left-0 right-0 border-t-2 border-red-500 z-50 pointer-events-none flex items-center"
                                    style={{ top: `${((now.getHours() * 60 + now.getMinutes()) / 1440) * 100}%` }}
                                >
                                    <div className="absolute -left-1.5 w-3 h-3 bg-red-500 rounded-full shadow-sm" />
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
                                            "absolute inset-x-1 rounded-lg text-[10px] cursor-pointer pointer-events-auto overflow-hidden z-10 leading-tight shadow-sm border border-l-[3px] flex flex-col group transition-all duration-200",
                                            isDragging && "z-50 opacity-80 shadow-lg cursor-move scale-[1.02]",
                                            !isDragging && "hover:shadow-md hover:brightness-[1.02] hover:-translate-y-[1px]"
                                        )}
                                        style={{
                                            ...getEventStyle(displayEvent, PIXELS_PER_HOUR),
                                            backgroundColor: colors.bg,
                                            borderColor: colors.border,
                                            borderLeftColor: colors.accent,
                                            color: colors.text
                                        }}
                                        onMouseDown={(e) => startMove(e, event)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isDragging) handleOpenEdit(event);
                                        }}
                                    >
                                        <div className="flex items-center justify-between p-1 pl-1.5">
                                            <div className="truncate font-bold tracking-tight">{event.title}</div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                {/* Potential icon here if needed */}
                                            </div>
                                        </div>

                                        {/* Resize Handle */}
                                        <div className="hidden group-hover:block absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-black/5 rounded-b-md"
                                            onMouseDown={(e) => startResize(e, event)}
                                        />
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

'use client';

import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn, generateId } from '@/lib/utils';
import { Plus, Target, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useData } from '@/context/DataProvider';
import { CalendarEvent } from '@/types';
import { EventDialog } from './EventDialog';

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


    const getEventStyle = (event: CalendarEvent) => {
        const start = new Date(event.start);
        const end = new Date(event.end);
        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const endMinutes = end.getHours() * 60 + end.getMinutes();
        const durationMins = endMinutes - startMinutes;

        return {
            top: `${(startMinutes / 1440) * 100}%`,
            height: `${(durationMins / 1440) * 100}%`,
            minHeight: '24px'
        };
    };

    return (
        <div className="flex flex-col h-full bg-card rounded-lg border-transparent shadow-sm overflow-hidden relative select-none">
            {/* Header Row (Days) */}
            <div className="flex border-b border-border/20">
                <div className="w-16 flex-shrink-0 border-r border-border/20 bg-muted/30" />
                {weekDays.map((day) => {
                    const daysGoals = goals.filter(g => g.deadline && isSameDay(new Date(g.deadline), day));

                    const daysProjectTasks = showProjectTasks ? tasks.filter(t => {
                        if (!t.projectId) return false;
                        if (t.completed) return false;
                        const targetDate = t.endDate ? new Date(t.endDate) : (t.deadline ? new Date(t.deadline) : (t.startDate ? new Date(t.startDate) : null));
                        if (!targetDate) return false;
                        return isSameDay(targetDate, day);
                    }) : [];

                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "flex-1 p-2 text-center border-r border-border/20 last:border-r-0 flex flex-col gap-1 min-w-[100px]",
                                isToday(day) ? "bg-primary/5" : "bg-card"
                            )}
                        >
                            <div className="text-xs text-muted-foreground uppercase">{format(day, 'EEE', { locale: ko })}</div>
                            <div
                                className={cn(
                                    "w-7 h-7 mx-auto flex items-center justify-center rounded-full text-sm font-medium mt-1",
                                    isToday(day)
                                        ? "bg-primary text-primary-foreground"
                                        : "text-foreground"
                                )}
                            >
                                {format(day, 'd')}
                            </div>

                            {/* Goal Indicators in Header */}
                            {daysGoals.length > 0 && (
                                <div className="mt-1 flex flex-col gap-1 w-full">
                                    {daysGoals.map(goal => (
                                        <div key={goal.id} className="text-[9px] bg-red-100 text-red-700 px-1 rounded-sm truncate flex items-center gap-1 border border-red-200/50 justify-center">
                                            <Target className="w-2.5 h-2.5 shrink-0" />
                                            <span className="truncate">{goal.title}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Project Task Indicators in Header */}
                            {daysProjectTasks.length > 0 && (
                                <div className="mt-1 flex flex-col gap-1 w-full">
                                    {daysProjectTasks.map(task => {
                                        const project = projects.find(p => p.id === task.projectId);
                                        return (
                                            <div
                                                key={task.id}
                                                className="text-[9px] px-1 rounded-sm truncate flex items-center gap-1 border border-transparent shadow-sm justify-center text-white opacity-90"
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
                <div className="w-16 flex-shrink-0 bg-background/50 border-r border-border/20 z-20 sticky left-0">
                    {hours.map((hour) => (
                        <div key={hour} className="h-[60px] relative border-b last:border-b-0 border-border/[0.03]">
                            <span className="absolute -top-2 right-2 text-xs text-muted-foreground/60 font-mono">
                                {format(new Date().setHours(hour, 0, 0, 0), 'h aa')}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Day Columns */}
                {weekDays.map(day => {
                    // Filter events for this day
                    const dayEvents = events.filter(e => isSameDay(new Date(e.start), day));

                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "flex-1 border-r last:border-r-0 border-border/[0.03] relative min-w-[100px]",
                                isToday(day) && "bg-primary/[0.02]"
                            )}
                            onMouseUp={() => handleColumnMouseUp(day)}
                        >
                            {/* Background Grid Lines */}
                            {hours.map(hour => (
                                <div key={hour} className="h-[60px] border-b border-border/[0.03] w-full relative">
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

                                return (
                                    <div
                                        key={event.id}
                                        className={cn(
                                            "absolute inset-x-1 rounded p-1 text-[10px] cursor-pointer pointer-events-auto overflow-hidden z-10 leading-tight shadow-sm border flex flex-col group",
                                            event.type === 'personal' ? 'bg-blue-500/15 text-blue-700 border-blue-500/30' :
                                                event.type === 'work' ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' :
                                                    event.type === 'study' ? 'bg-amber-500/15 text-amber-700 border-amber-500/30' :
                                                        'bg-purple-500/15 text-purple-700 border-purple-500/30',
                                            isDragging && "z-50 opacity-80 shadow-lg cursor-move",
                                            !isDragging && "hover:brightness-110"
                                        )}
                                        style={getEventStyle(displayEvent)}
                                        onMouseDown={(e) => startMove(e, event)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isDragging) handleOpenEdit(event);
                                        }}
                                    >
                                        <div className="truncate font-medium">{event.title}</div>
                                        <div className="hidden group-hover:block absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-white/20 rounded-b-md"
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

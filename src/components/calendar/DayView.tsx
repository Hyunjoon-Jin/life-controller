'use client';

import { format, isSameDay, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn, generateId } from '@/lib/utils';
import { Users, AlertCircle, Briefcase, Handshake } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useData } from '@/context/DataProvider';
import { CalendarEvent, EventType } from '@/types';
import { getEventStyle, getEventColors } from '@/lib/calendar';
import { EventDialog } from './EventDialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function DayView({ currentDate, showProjectTasks, onNext, onPrev }: { currentDate: Date; showProjectTasks: boolean; onNext: () => void; onPrev: () => void }) {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const { events, addEvent, updateEvent, deleteEvent, habits, updateHabit, deleteHabit, tasks, projects } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(undefined);

    // Drag & Resize & Create State
    const [dragState, setDragState] = useState<{
        id?: string;
        mode: 'move' | 'resize' | 'create';
        originalStart: Date;
        originalEnd: Date;
        initialY: number;
        hasMoved: boolean;
    } | null>(null);

    // Temp event
    const [tempEvent, setTempEvent] = useState<CalendarEvent | null>(null);

    // Refs for event listeners to avoid stale closures
    const dragStateRef = useRef(dragState);
    const tempEventRef = useRef(tempEvent);
    const justDraggedRef = useRef(false);


    useEffect(() => {
        dragStateRef.current = dragState;
    }, [dragState]);

    useEffect(() => {
        tempEventRef.current = tempEvent;
    }, [tempEvent]);

    const [now, setNow] = useState(new Date());

    // Font Size State
    const [fontSize, setFontSize] = useState<'xs' | 'sm' | 'base'>('sm');

    // Habit Deletion State
    const [habitToDelete, setHabitToDelete] = useState<{ id: string, date: Date, habitId: string } | null>(null);
    const [showDeleteHabitDialog, setShowDeleteHabitDialog] = useState(false);

    // Habit Modification Choice State
    const [showHabitUpdateChoiceDialog, setShowHabitUpdateChoiceDialog] = useState(false);
    const [pendingHabitUpdate, setPendingHabitUpdate] = useState<CalendarEvent | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isDialogOpen || showDeleteHabitDialog || showHabitUpdateChoiceDialog) return;
            if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

            if (e.key === 'ArrowLeft') onPrev();
            if (e.key === 'ArrowRight') onNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDialogOpen, showDeleteHabitDialog, showHabitUpdateChoiceDialog, onNext, onPrev]);

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    // Helper to get text size classes
    const getTextSizeClass = (size: 'xs' | 'sm' | 'base', type: 'title' | 'time') => {
        if (type === 'title') {
            switch (size) {
                case 'xs': return 'text-[8.5px]';
                case 'sm': return 'text-[9.5px]';
                case 'base': return 'text-[11px]';
            }
        } else {
            switch (size) {
                case 'xs': return 'text-[7.5px]';
                case 'sm': return 'text-[8.5px]';
                case 'base': return 'text-[9.5px]';
            }
        }
    };

    // Generate Habit Instances for this day
    const habitEvents: CalendarEvent[] = habits
        .filter(habit => {
            if (!habit.time || !habit.days) return false;
            // Check start date (simple comparison)
            if (habit.startDate) {
                const s = new Date(habit.startDate);
                s.setHours(0, 0, 0, 0);
                if (s > currentDate) return false;
            }
            // Check end date
            if (habit.endDate) {
                const e = new Date(habit.endDate);
                e.setHours(23, 59, 59, 999);
                if (e < currentDate) return false;
            }
            // Check day of week
            if (!habit.days.includes(currentDate.getDay())) return false;
            // Check skipped dates
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            if (habit.skippedDates?.includes(dateStr)) return false;

            return true;
        })
        .map(habit => {
            const [hours, minutes] = (habit.time || '09:00').split(':').map(Number);
            const start = new Date(currentDate);
            start.setHours(hours, minutes, 0, 0);

            let end = new Date(start);
            if (habit.endTime) {
                const [endH, endM] = habit.endTime.split(':').map(Number);
                end.setHours(endH, endM, 0, 0);
                if (end < start) {
                    end.setDate(end.getDate() + 1); // Next day wrap
                }
            } else {
                end.setMinutes(end.getMinutes() + 30); // Default 30 min
            }

            return {
                id: `habit-${habit.id}-${format(currentDate, 'yyyy-MM-dd')}`,
                title: habit.title,
                start,
                end,
                type: 'personal' as EventType, // Fallback type compatible with types
                color: 'hsla(var(--primary-hsl), 0.1)', // Optimized for premium UI
                isHabit: true,
                habitId: habit.id
            } as CalendarEvent & { isHabit?: boolean, habitId?: string };
        });

    const standardEvents = events
        .filter(event => {
            const d = new Date(event.start);
            return isValid(d) && isSameDay(d, currentDate);
        })
        .map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end)
        }));
    const dayEvents = [...standardEvents, ...habitEvents];

    const dayProjectTasks = showProjectTasks ? tasks.filter(t => {
        if (!t.projectId) return false;
        if (t.completed) return false;
        const targetDate = t.endDate ? new Date(t.endDate) : (t.deadline ? new Date(t.deadline) : (t.startDate ? new Date(t.startDate) : null));
        if (!targetDate || !isValid(targetDate)) return false;
        return isSameDay(targetDate, currentDate);
    }) : [];

    // Zoom State
    const [pixelsPerHour, setPixelsPerHour] = useState(60);
    const timelineRef = useRef<HTMLDivElement>(null);
    const SNAP_MINUTES = 15;

    // --- Interaction Handlers ---

    useEffect(() => {
        const element = timelineRef.current;
        if (!element) return;

        const handleNativeWheel = (e: WheelEvent) => {
            // Only zoom if Ctrl is held, and not dragging
            if (!e.ctrlKey) return;

            // Critical: prevent browser zoom
            e.preventDefault();

            if (dragStateRef.current) return;

            const zoomStep = 8;
            setPixelsPerHour(prev => {
                const newPixels = e.deltaY > 0
                    ? Math.max(40, prev - zoomStep)
                    : Math.min(240, prev + zoomStep);
                return newPixels;
            });
        };

        // Attach native listener with passive: false to allow preventDefault
        element.addEventListener('wheel', handleNativeWheel, { passive: false });

        return () => {
            element.removeEventListener('wheel', handleNativeWheel);
        };
    }, []); // Re-bind if dragState changes to ensure we have latest state in closure (or use ref for dragState)

    const handleGridMouseDown = (e: React.MouseEvent, hour: number, minute: number) => {
        if (e.target !== e.currentTarget) return;
        e.preventDefault();

        const start = new Date(currentDate);
        start.setHours(hour, minute, 0, 0);
        const end = new Date(start);

        const newState = {
            mode: 'create' as const,
            originalStart: start,
            originalEnd: end,
            initialY: e.clientY,
            hasMoved: false
        };

        setDragState(newState);

        const newTemp = {
            id: 'temp-create',
            title: '(새 일정)',
            start: start,
            end: end,
            type: 'work'
        } as CalendarEvent;

        setTempEvent(newTemp);
    };

    const handleOpenCreate = (hour: number, minute: number) => {
        if (dragStateRef.current) return;
        const date = new Date(currentDate);
        date.setHours(hour, minute, 0, 0);
        setSelectedDate(date);
        setSelectedEvent(null);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (event: CalendarEvent) => {
        if (dragStateRef.current) return;
        setSelectedEvent(event);
        setSelectedDate(null);
        setIsDialogOpen(true);
    };

    const confirmDeleteToday = () => {
        if (!habitToDelete) return;
        const habit = habits.find(h => h.id === habitToDelete.habitId);
        if (habit) {
            const dateStr = format(habitToDelete.date, 'yyyy-MM-dd');
            updateHabit({
                ...habit,
                skippedDates: [...(habit.skippedDates || []), dateStr]
            });
        }
        setShowDeleteHabitDialog(false);
        setHabitToDelete(null);
    };

    const confirmDeleteFuture = () => {
        if (!habitToDelete) return;
        // Logic: Deleting the master habit entirely as per user request to "delete that habit"
        deleteHabit(habitToDelete.habitId);
        setShowDeleteHabitDialog(false);
        setHabitToDelete(null);
    };

    const handleSaveEvent = (savedEvent: CalendarEvent) => {
        // Handle Habit Instance Modification
        if (savedEvent.id.startsWith('habit-')) {
            const parts = savedEvent.id.split('-');
            if (parts.length >= 2) {
                const habitId = parts[1];
                const habit = habits.find(h => h.id === habitId);
                if (habit) {
                    const dateStr = format(currentDate, 'yyyy-MM-dd');
                    if (!habit.skippedDates?.includes(dateStr)) {
                        updateHabit({
                            ...habit,
                            skippedDates: [...(habit.skippedDates || []), dateStr]
                        });
                    }
                }
            }
            // Create as new separate event
            addEvent({ ...savedEvent, id: generateId() });
        } else {
            if (selectedEvent) {
                updateEvent(savedEvent);
            } else {
                addEvent({ ...savedEvent, id: generateId() });
            }
        }
    };

    const handleDeleteEvent = (id: string) => {
        if (id.startsWith('habit-')) {
            const evt = dayEvents.find(e => e.id === id);
            if (evt && (evt as any).habitId) {
                setHabitToDelete({
                    id: id,
                    habitId: (evt as any).habitId,
                    date: currentDate
                });
                setShowDeleteHabitDialog(true);
                return;
            }
        }
        deleteEvent(id);
    };

    const startResize = (e: React.MouseEvent, event: CalendarEvent) => {
        e.stopPropagation();
        setDragState({
            id: event.id,
            mode: 'resize',
            originalStart: new Date(event.start),
            originalEnd: new Date(event.end),
            initialY: e.clientY,
            hasMoved: false
        });
        setTempEvent(event);
    };

    const startMove = (e: React.MouseEvent, event: CalendarEvent) => {
        e.stopPropagation();
        setDragState({
            id: event.id,
            mode: 'move',
            originalStart: new Date(event.start),
            originalEnd: new Date(event.end),
            initialY: e.clientY,
            hasMoved: false
        });
        setTempEvent(event);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const currentDragState = dragStateRef.current;
            const currentTempEvent = tempEventRef.current;

            if (!currentDragState || !currentTempEvent) return;

            const deltaY = e.clientY - currentDragState.initialY;
            if (Math.abs(deltaY) < 2) return;

            const deltaMinutes = Math.round((deltaY / pixelsPerHour) * 60 / SNAP_MINUTES) * SNAP_MINUTES;

            if (currentDragState.mode === 'move') {
                const newStart = new Date(currentDragState.originalStart);
                newStart.setMinutes(newStart.getMinutes() + deltaMinutes);

                const newEnd = new Date(currentDragState.originalEnd);
                newEnd.setMinutes(newEnd.getMinutes() + deltaMinutes);

                setTempEvent({ ...currentTempEvent, start: newStart, end: newEnd });
                setDragState(prev => prev ? { ...prev, hasMoved: true } : null);
            } else if (currentDragState.mode === 'resize') {
                const newEnd = new Date(currentDragState.originalEnd);
                newEnd.setMinutes(newEnd.getMinutes() + deltaMinutes);

                const start = new Date(currentDragState.originalStart);
                if (newEnd.getTime() - start.getTime() >= 15 * 60 * 1000) {
                    setTempEvent({ ...currentTempEvent, end: newEnd });
                    setDragState(prev => prev ? { ...prev, hasMoved: true } : null);
                }
            } else if (currentDragState.mode === 'create') {
                const draggedTime = new Date(currentDragState.originalStart);
                draggedTime.setMinutes(draggedTime.getMinutes() + deltaMinutes);

                let newStart = new Date(currentDragState.originalStart);
                let newEnd = new Date(currentDragState.originalStart);

                if (draggedTime < currentDragState.originalStart) {
                    newStart = draggedTime;
                    newEnd = currentDragState.originalStart;
                } else {
                    newEnd = draggedTime;
                    if (deltaMinutes === 0) newEnd = new Date(newStart.getTime() + 15 * 60000);
                }

                if (newEnd.getTime() === newStart.getTime()) {
                    newEnd = new Date(newStart.getTime() + 15 * 60000);
                }

                setTempEvent({ ...currentTempEvent, start: newStart, end: newEnd });
                if (deltaMinutes !== 0) {
                    setDragState(prev => prev ? { ...prev, hasMoved: true } : null);
                }
            }
        };

        const handleMouseUp = () => {
            const currentDragState = dragStateRef.current;
            const currentTempEvent = tempEventRef.current;

            if (currentDragState && currentDragState.mode === 'create' && currentTempEvent) {
                setSelectedDate(currentTempEvent.start);
                setSelectedEndDate(currentTempEvent.end);
                setSelectedEvent(null);
                setIsDialogOpen(true);
            } else if (currentTempEvent && currentDragState && currentDragState.mode !== 'create') {
                if (currentDragState.hasMoved) {
                    justDraggedRef.current = true;
                    // Reset the flag after a short delay to ensure onClick can see it
                    setTimeout(() => { justDraggedRef.current = false; }, 100);

                    if (currentTempEvent.id.startsWith('habit-')) {
                        setPendingHabitUpdate(currentTempEvent);
                        setShowHabitUpdateChoiceDialog(true);
                    } else {
                        updateEvent(currentTempEvent);
                    }
                }
            }
            setDragState(null);
            setTempEvent(null);
        };


        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [updateEvent, pixelsPerHour]); // Removed dragState and tempEvent dependencies!



    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#1C1C1E] rounded-3xl border border-transparent dark:border-gray-800 shadow-sm overflow-hidden relative select-none">
            {/* Header */}
            <div className="p-4 border-b border-border/[0.05] dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex items-center gap-3">
                    <div className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">{format(currentDate, 'd')}</div>
                    <div className="text-xl font-bold text-gray-500 dark:text-gray-400 pt-1">{format(currentDate, 'EEEE', { locale: ko })}</div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Project Tasks Indicator */}
                    {dayProjectTasks.length > 0 && (
                        <div className="flex items-center gap-1">
                            {dayProjectTasks.map(task => {
                                const project = projects.find(p => p.id === task.projectId);
                                return (
                                    <div
                                        key={task.id}
                                        className="text-[10px] px-2 py-1 rounded-full truncate flex items-center gap-1 text-white shadow-sm"
                                        style={{ backgroundColor: project?.color || '#3b82f6' }}
                                    >
                                        <Briefcase className="w-3 h-3 shrink-0" />
                                        <span className="truncate max-w-[100px]">{task.title}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Font Size Control */}
                    <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-border/[1.0]">
                        {(['xs', 'sm', 'base'] as const).map(size => (
                            <button
                                key={size}
                                onClick={() => setFontSize(size)}
                                className={cn(
                                    "px-2 py-1 text-[10px] font-bold rounded transition-all",
                                    fontSize === size
                                        ? "bg-black text-white shadow-sm"
                                        : "text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                                )}
                            >
                                {size.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div
                className="flex-1 overflow-y-auto relative custom-scrollbar touch-none"
                ref={timelineRef}
            >
                {/* Scrollable Container Wrapper */}
                <div
                    className="relative transition-[min-height] duration-200 ease-out"
                    style={{ minHeight: 24 * pixelsPerHour }}
                >

                    {/* Current Time Line */}
                    {isSameDay(currentDate, new Date()) && (
                        <div
                            className="absolute left-16 right-0 border-t-2 border-red-500 z-50 pointer-events-none flex items-center transition-all duration-200"
                            style={{ top: (new Date().getHours() + new Date().getMinutes() / 60) * pixelsPerHour }}
                        >
                            <div className="absolute -left-1.5 w-3 h-3 bg-red-500 rounded-full shadow-sm" />
                        </div>
                    )}

                    {/* Time Grid (Establish Height) */}
                    <div className="flex flex-col">
                        {hours.map((hour) => (
                            <div
                                key={hour}
                                className="flex w-full relative group transition-[height] duration-200 ease-out"
                                style={{ height: pixelsPerHour }}
                            >
                                {/* Time Label */}
                                <div className="absolute -top-2 left-2 text-xs text-muted-foreground/60 font-mono w-12 text-right">
                                    {format(new Date().setHours(hour, 0, 0, 0), 'h aa')}
                                </div>

                                {/* Padding for Time Column */}
                                <div className="w-16 flex-shrink-0 border-r border-border/[0.03] bg-muted/10"></div>

                                {/* Clickable Content Area - 4 slots for 15 min intervals */}
                                <div className="flex-1 flex flex-col h-full relative border-b border-border/[0.03]">
                                    {[0, 15, 30, 45].map((minute) => (
                                        <div
                                            key={minute}
                                            className="flex-1 last:border-b-0 hover:bg-primary/5 transition-colors cursor-pointer relative"
                                            onMouseDown={(e) => handleGridMouseDown(e, hour, minute)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Events Layer - Fixed Positioning */}
                    <div className="absolute top-0 bottom-0 right-0 left-16 z-10 pointer-events-none">
                        {/* Render Temp Event (Drag Creation Preview) */}
                        {dragState?.mode === 'create' && tempEvent && (
                            <div
                                className={cn(
                                    "absolute left-0.5 right-2 rounded-sm p-1.5 border bg-primary/10 border-primary/30 text-primary-foreground z-50 shadow-lg backdrop-blur-[2px] flex items-center gap-1.5",
                                    getTextSizeClass(fontSize, 'title')
                                )}
                                style={getEventStyle(tempEvent, pixelsPerHour)}
                            >
                                <div className="font-bold truncate">{tempEvent.title}</div>
                                <div className={cn("opacity-80 font-mono shrink-0", getTextSizeClass(fontSize, 'time'))}>
                                    {format(tempEvent.start, 'HH:mm')}
                                </div>
                            </div>
                        )}

                        {dayEvents.map(event => {
                            const isHabit = (event as any).isHabit;
                            const displayEvent = (dragState?.id === event.id && tempEvent) ? tempEvent : event;
                            const isDragging = dragState?.id === event.id;
                            const colors = getEventColors(event);

                            const durationMins = (displayEvent.end.getTime() - displayEvent.start.getTime()) / 60000;
                            const isShort = durationMins <= 15;

                            return (
                                <div
                                    key={event.id}
                                    className={cn(
                                        "absolute left-0.5 right-2 rounded-sm transition-all shadow-sm border group overflow-hidden flex backdrop-blur-[2px] pointer-events-auto cursor-pointer",
                                        isDragging && "z-50 opacity-90 shadow-2xl scale-[1.02] cursor-move",
                                        isDragging && "z-50 opacity-90 shadow-2xl scale-[1.02] cursor-move",
                                        !isDragging && !isHabit && "hover:shadow-md hover:brightness-[1.02] active:scale-[0.98]",
                                        !isDragging && isHabit && "hover:bg-orange-50/50", // Subtle hover for habits
                                        isShort ? "p-1 py-0.5 items-center justify-between" : "p-2 flex-col gap-1"
                                    )}
                                    style={{
                                        ...getEventStyle(displayEvent, pixelsPerHour),
                                        backgroundColor: colors.bg,
                                        borderColor: colors.border,
                                        color: colors.text,
                                        borderLeftWidth: '3px',
                                        borderLeftColor: colors.accent,
                                        transition: isDragging ? 'none' : 'all 0.2s ease-out' // Smooth transitions when zooming
                                    }}
                                    onMouseDown={(e) => startMove(e, event)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (justDraggedRef.current) return;
                                        if (!isDragging) handleOpenEdit(event);
                                    }}
                                >
                                    <div className={cn("flex items-center gap-1.5 font-bold tracking-tight min-w-0", isShort ? "flex-1" : "justify-between")}>
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            {isHabit && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: colors.accent }} />}
                                            {!isHabit && event.priority === 'high' && (
                                                <div className="w-1 h-1 rounded-full bg-red-400 animate-pulse shrink-0 shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
                                            )}
                                            {event.isMeeting && <Users className="w-3 h-3 opacity-80 shrink-0 text-blue-600 dark:text-blue-400" strokeWidth={2} />}
                                            {event.isAppointment && <Handshake className="w-3 h-3 opacity-80 shrink-0 text-green-600 dark:text-green-400" strokeWidth={2} />}

                                            {/* Category Tag */}
                                            {!isShort && !isHabit && (
                                                <span className="text-[9px] font-semibold opacity-70 px-1 py-0.5 rounded-sm bg-black/5 dark:bg-white/10 shrink-0">
                                                    {event.type === 'work' ? '업무' :
                                                        event.type === 'study' ? '학습' :
                                                            event.type === 'hobby' ? '취미' :
                                                                event.type === 'health' ? '운동' :
                                                                    event.type === 'finance' ? '금융' :
                                                                        event.type === 'social' ? '약속' :
                                                                            event.type === 'travel' ? '여행' :
                                                                                event.type === 'meal' ? '식사' :
                                                                                    event.type === 'personal' ? '개인' : '기타'}
                                                </span>
                                            )}

                                            <span className={cn("truncate leading-none", getTextSizeClass(fontSize, 'title'))}>
                                                {event.title}
                                            </span>
                                        </div>

                                        {isShort && (
                                            <div className={cn("font-mono font-medium opacity-60 ml-auto shrink-0", getTextSizeClass(fontSize, 'time'))}>
                                                {format(displayEvent.start, 'HH:mm')}
                                            </div>
                                        )}
                                    </div>

                                    {!isShort && (
                                        <div className={cn("font-mono font-medium opacity-60 mt-auto", getTextSizeClass(fontSize, 'time'))}>
                                            {format(displayEvent.start, 'HH:mm')} - {format(displayEvent.end, 'HH:mm')}
                                        </div>
                                    )}

                                    {/* Resize Handle with cleaner UI */}
                                    <div
                                        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
                                        onMouseDown={(e) => startResize(e, event)}
                                    >
                                        <div className="w-4 h-0.5 bg-black/10 rounded-full" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <EventDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                event={selectedEvent}
                initialDate={selectedDate || currentDate}
                initialEndDate={selectedEndDate}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
            />

            <Dialog open={showDeleteHabitDialog} onOpenChange={setShowDeleteHabitDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>습관 일정 삭제</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-sm text-muted-foreground">
                        이 습관 일정을 어떻게 삭제하시겠습니까?
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="secondary" onClick={confirmDeleteToday}>오늘만 삭제</Button>
                        <Button variant="destructive" onClick={confirmDeleteFuture}>모든 일정 삭제</Button>
                        <Button variant="ghost" onClick={() => setShowDeleteHabitDialog(false)}>취소</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Habit Modification Choice Dialog */}
            <Dialog open={showHabitUpdateChoiceDialog} onOpenChange={setShowHabitUpdateChoiceDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>습관 일정 변경</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-sm text-muted-foreground">
                        습관 일정의 시간대가 변경되었습니다. 어떻게 반영할까요?
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="default"
                            onClick={() => {
                                if (!pendingHabitUpdate) return;
                                const habitId = (pendingHabitUpdate as any).habitId;
                                const habit = habits.find(h => h.id === habitId);
                                if (habit) {
                                    updateHabit({
                                        ...habit,
                                        time: format(pendingHabitUpdate.start, 'HH:mm'),
                                        endTime: format(pendingHabitUpdate.end, 'HH:mm')
                                    });
                                }
                                setShowHabitUpdateChoiceDialog(false);
                                setPendingHabitUpdate(null);
                            }}
                        >
                            향후 모든 일정 변경
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                if (!pendingHabitUpdate) return;
                                const habitId = (pendingHabitUpdate as any).habitId;
                                const habit = habits.find(h => h.id === habitId);
                                if (habit) {
                                    const dateStr = format(currentDate, 'yyyy-MM-dd');
                                    updateHabit({
                                        ...habit,
                                        skippedDates: [...(habit.skippedDates || []), dateStr]
                                    });
                                }
                                // Create as new independent event
                                addEvent({ ...pendingHabitUpdate, id: generateId() });
                                setShowHabitUpdateChoiceDialog(false);
                                setPendingHabitUpdate(null);
                            }}
                        >
                            이 일정만 변경
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setShowHabitUpdateChoiceDialog(false);
                                setPendingHabitUpdate(null);
                            }}
                        >
                            취소
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

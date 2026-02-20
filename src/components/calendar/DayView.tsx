'use client';

import { format, isSameDay, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn, generateId } from '@/lib/utils';
import { Users, AlertCircle, Briefcase, Handshake, Plus } from 'lucide-react';
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
    // Fix: Use only standardEvents (which includes provider-generated habit events) to avoid duplicates
    const dayEvents = standardEvents;

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

    // Mobile: Tap on grid cell to open create dialog directly
    const handleGridTap = (hour: number, minute: number) => {
        const date = new Date(currentDate);
        date.setHours(hour, minute, 0, 0);
        const endDate = new Date(date);
        endDate.setMinutes(endDate.getMinutes() + 60);
        setSelectedDate(date);
        setSelectedEndDate(endDate);
        setSelectedEvent(null);
        setIsDialogOpen(true);
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
            if (evt && evt.habitId) {
                setHabitToDelete({
                    id: id,
                    habitId: evt.habitId,
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

    // Touch handlers for mobile
    const startTouchMove = (e: React.TouchEvent, event: CalendarEvent) => {
        e.stopPropagation();
        const touch = e.touches[0];
        setDragState({
            id: event.id,
            mode: 'move',
            originalStart: new Date(event.start),
            originalEnd: new Date(event.end),
            initialY: touch.clientY,
            hasMoved: false
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
            initialY: touch.clientY,
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


        // Touch handlers for mobile
        const handleTouchMove = (e: TouchEvent) => {
            const touch = e.touches[0];
            if (!touch) return;
            handleMouseMove({ clientY: touch.clientY } as MouseEvent);
            if (dragStateRef.current?.hasMoved && e.cancelable) {
                e.preventDefault(); // Prevent scroll during drag
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
    }, [updateEvent, pixelsPerHour]); // Removed dragState and tempEvent dependencies!



    return (
        <div className="flex flex-col h-full glass-premium rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative select-none">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-6">
                    <div className="text-6xl font-black tracking-tighter text-white drop-shadow-2xl">{format(currentDate, 'd')}</div>
                    <div className="flex flex-col">
                        <div className="text-xl font-black text-white/90 uppercase tracking-widest">{format(currentDate, 'EEEE', { locale: ko })}</div>
                        <div className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">{format(currentDate, 'MMMM yyyy', { locale: ko })}</div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Project Tasks Indicator */}
                    {dayProjectTasks.length > 0 && (
                        <div className="hidden md:flex items-center gap-2">
                            {dayProjectTasks.slice(0, 3).map(task => {
                                const project = projects.find(p => p.id === task.projectId);
                                return (
                                    <div
                                        key={task.id}
                                        className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                        style={{ backgroundColor: project?.color || '#10b981' }}
                                        title={task.title}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {/* Font Size Control */}
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-md">
                        {(['xs', 'sm', 'base'] as const).map(size => (
                            <button
                                key={size}
                                onClick={() => setFontSize(size)}
                                className={cn(
                                    "px-3 py-1.5 text-[10px] font-black rounded-xl transition-all duration-300 tracking-wider",
                                    fontSize === size
                                        ? "bg-emerald-500 text-white shadow-[0_5px_15px_rgba(16,185,129,0.4)]"
                                        : "text-white/30 hover:text-white/60"
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
                className="flex-1 overflow-y-auto relative custom-scrollbar touch-pan-y bg-white/[0.01]"
                ref={timelineRef}
            >
                <div
                    className="relative transition-[min-height] duration-500 ease-out"
                    style={{ minHeight: 24 * pixelsPerHour }}
                >

                    {/* Current Time Line */}
                    {isSameDay(currentDate, new Date()) && (
                        <div
                            className="absolute left-20 right-0 border-t border-emerald-500/50 z-50 pointer-events-none flex items-center transition-all duration-300"
                            style={{ top: (new Date().getHours() + new Date().getMinutes() / 60) * pixelsPerHour }}
                        >
                            <div className="absolute -left-1.5 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                            <div className="h-[1px] w-full bg-emerald-500/20" />
                        </div>
                    )}

                    {/* Grid */}
                    <div className="flex flex-col">
                        {hours.map((hour) => (
                            <div
                                key={hour}
                                className="flex w-full relative group transition-[height] duration-300 ease-out"
                                style={{ height: pixelsPerHour }}
                            >
                                {/* Time Label */}
                                <div className="absolute -top-3 left-4 text-[10px] text-white/20 font-black tracking-widest uppercase w-14 text-right">
                                    {format(new Date().setHours(hour, 0, 0, 0), 'h aa')}
                                </div>

                                {/* Padding for Time Column */}
                                <div className="w-20 flex-shrink-0 border-r border-white/[0.03] bg-white/[0.01]"></div>

                                {/* Clickable Content Area */}
                                <div className="flex-1 flex flex-col h-full relative border-b border-white/[0.03]">
                                    {[0, 15, 30, 45].map((minute) => (
                                        <div
                                            key={minute}
                                            className="flex-1 last:border-b-0 hover:bg-white/[0.03] transition-colors cursor-pointer relative md:min-h-0 min-h-[16px]"
                                            onMouseDown={(e) => handleGridMouseDown(e, hour, minute)}
                                            onClick={(e) => {
                                                if (e.target !== e.currentTarget) return;
                                                if (window.innerWidth < 768) {
                                                    handleGridTap(hour, minute);
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Events Layer */}
                    <div className="absolute top-0 bottom-0 right-0 left-20 z-10 pointer-events-none p-1.5">
                        {dragState?.mode === 'create' && tempEvent && (
                            <div
                                className={cn(
                                    "absolute inset-x-2 rounded-xl p-3 border-l-4 bg-emerald-500/20 border-emerald-500/50 text-white z-50 shadow-2xl backdrop-blur-md flex items-center gap-3",
                                    getTextSizeClass(fontSize, 'title')
                                )}
                                style={getEventStyle(tempEvent, pixelsPerHour)}
                            >
                                <div className="font-black truncate uppercase tracking-tight">{tempEvent.title}</div>
                                <div className={cn("opacity-40 font-bold shrink-0", getTextSizeClass(fontSize, 'time'))}>
                                    {format(tempEvent.start, 'HH:mm')}
                                </div>
                            </div>
                        )}

                        {dayEvents.map(event => {
                            const isHabit = event.isHabitEvent;
                            const displayEvent = (dragState?.id === event.id && tempEvent) ? tempEvent : event;
                            const isDragging = dragState?.id === event.id;
                            const colors = getEventColors(event);

                            const durationMins = (displayEvent.end.getTime() - displayEvent.start.getTime()) / 60000;
                            const isShort = durationMins <= 15;

                            return (
                                <div
                                    key={event.id}
                                    className={cn(
                                        "absolute left-1.5 right-3 rounded-xl transition-all shadow-xl border-l-[4px] group overflow-hidden flex backdrop-blur-md pointer-events-auto cursor-pointer",
                                        isDragging && "z-50 opacity-90 shadow-2xl scale-[1.02] ring-2 ring-white/10",
                                        !isDragging && !isHabit && "hover:shadow-2xl hover:brightness-110 active:scale-[0.98]",
                                        !isDragging && isHabit && "hover:bg-orange-500/10",
                                        isShort ? "px-3 py-1 items-center justify-between" : "p-3 flex-col gap-1.5"
                                    )}
                                    style={{
                                        ...getEventStyle(displayEvent, pixelsPerHour),
                                        backgroundColor: colors.bg.replace('0.08', '0.15'),
                                        borderColor: colors.border.replace('0.2', '0.3'),
                                        color: 'white',
                                        borderLeftColor: colors.accent,
                                        transition: isDragging ? 'none' : 'all 0.3s ease-out'
                                    }}
                                    onMouseDown={(e) => startMove(e, event)}
                                    onTouchStart={(e) => startTouchMove(e, event)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (justDraggedRef.current) return;
                                        if (!isDragging) handleOpenEdit(event);
                                    }}
                                >
                                    <div className={cn("flex items-center gap-2 font-black tracking-tight min-w-0", isShort ? "flex-1" : "justify-between")}>
                                        <div className="flex items-center gap-2 min-w-0">
                                            {isHabit && <div className="w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_rgba(251,146,60,0.5)]" style={{ backgroundColor: colors.accent }} />}
                                            {!isHabit && event.priority === 'high' && (
                                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0 shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
                                            )}
                                            {event.isMeeting && <Users className="w-4 h-4 opacity-60 shrink-0 text-white" strokeWidth={2.5} />}
                                            {event.isAppointment && <Handshake className="w-4 h-4 opacity-60 shrink-0 text-white" strokeWidth={2.5} />}

                                            {/* Category Tag */}
                                            {!isShort && !isHabit && (
                                                <span className="text-[10px] font-black opacity-30 px-2 py-0.5 rounded-lg bg-white/10 shrink-0 uppercase tracking-widest leading-none">
                                                    {event.type === 'work' ? 'WORK' :
                                                        event.type === 'study' ? 'STUDY' :
                                                            event.type === 'hobby' ? 'HOBBY' :
                                                                event.type === 'health' ? 'HEALTH' :
                                                                    event.type === 'finance' ? 'FINANCE' :
                                                                        event.type === 'social' ? 'SOCIAL' :
                                                                            event.type === 'travel' ? 'TRAVEL' :
                                                                                event.type === 'meal' ? 'MEAL' :
                                                                                    event.type === 'personal' ? 'PERSONAL' : 'ETC'}
                                                </span>
                                            )}

                                            <span className={cn("truncate leading-tight uppercase", getTextSizeClass(fontSize, 'title'))}>
                                                {event.title}
                                            </span>
                                        </div>

                                        {isShort && (
                                            <div className={cn("font-bold opacity-30 ml-auto shrink-0 tracking-tighter", getTextSizeClass(fontSize, 'time'))}>
                                                {format(displayEvent.start, 'HH:mm')}
                                            </div>
                                        )}
                                    </div>

                                    {!isShort && (
                                        <div className={cn("font-bold opacity-30 mt-auto tracking-tighter", getTextSizeClass(fontSize, 'time'))}>
                                            {format(displayEvent.start, 'HH:mm')} - {format(displayEvent.end, 'HH:mm')}
                                        </div>
                                    )}

                                    {/* Resize Handle */}
                                    <div
                                        className="absolute bottom-0 left-0 right-0 h-4 md:h-2 cursor-ns-resize opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 hover:bg-white/5 active:bg-white/10"
                                        onMouseDown={(e) => startResize(e, event)}
                                        onTouchStart={(e) => startTouchResize(e, event)}
                                    >
                                        <div className="w-10 md:w-6 h-1 bg-white/20 rounded-full" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile FAB */}
                <button
                    className="md:hidden fixed bottom-28 right-6 z-50 w-16 h-16 rounded-3xl bg-emerald-500 text-white shadow-[0_15px_30px_-5px_rgba(16,185,129,0.5)] flex items-center justify-center active:scale-90 transition-all duration-300"
                    onClick={() => {
                        const now = new Date();
                        const start = new Date(currentDate);
                        start.setHours(now.getHours(), Math.floor(now.getMinutes() / 15) * 15, 0, 0);
                        const end = new Date(start);
                        end.setHours(end.getHours() + 1);
                        setSelectedDate(start);
                        setSelectedEndDate(end);
                        setSelectedEvent(null);
                        setIsDialogOpen(true);
                    }}
                >
                    <Plus className="w-8 h-8" strokeWidth={3} />
                </button>
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

            {/* Dialogs Stylized for Premium */}
            <Dialog open={showDeleteHabitDialog} onOpenChange={setShowDeleteHabitDialog}>
                <DialogContent className="glass-premium border border-white/10 text-white rounded-[32px] p-8 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight">습관 일정 삭제</DialogTitle>
                    </DialogHeader>
                    <div className="py-6 text-sm font-bold text-white/40 leading-relaxed uppercase tracking-wide">
                        이 습관 일정을 어떻게 삭제하시겠습니까?
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-3">
                        <Button
                            variant="secondary"
                            onClick={confirmDeleteToday}
                            className="h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black tracking-widest"
                        >
                            오늘만 삭제
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteFuture}
                            className="h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black tracking-widest shadow-[0_8px_16px_rgba(244,63,94,0.3)]"
                        >
                            모든 일정 삭제
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setShowDeleteHabitDialog(false)}
                            className="h-12 rounded-xl text-white/30 hover:text-white font-black tracking-widest"
                        >
                            취소
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showHabitUpdateChoiceDialog} onOpenChange={setShowHabitUpdateChoiceDialog}>
                <DialogContent className="glass-premium border border-white/10 text-white rounded-[32px] p-8 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight">습관 일정 변경</DialogTitle>
                    </DialogHeader>
                    <div className="py-6 text-sm font-bold text-white/40 leading-relaxed uppercase tracking-wide">
                        시간대가 변경되었습니다. 어떻게 반영할까요?
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-3">
                        <Button
                            variant="default"
                            onClick={() => {
                                if (!pendingHabitUpdate) return;
                                const habitId = pendingHabitUpdate.habitId;
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
                            className="h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black tracking-widest shadow-[0_8px_16px_rgba(16,185,129,0.3)]"
                        >
                            향후 모든 일정 변경
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                if (!pendingHabitUpdate) return;
                                const habitId = pendingHabitUpdate.habitId;
                                const habit = habits.find(h => h.id === habitId);
                                if (habit) {
                                    const dateStr = format(currentDate, 'yyyy-MM-dd');
                                    updateHabit({
                                        ...habit,
                                        skippedDates: [...(habit.skippedDates || []), dateStr]
                                    });
                                }
                                addEvent({ ...pendingHabitUpdate, id: generateId() });
                                setShowHabitUpdateChoiceDialog(false);
                                setPendingHabitUpdate(null);
                            }}
                            className="h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black tracking-widest"
                        >
                            이 일정만 변경
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setShowHabitUpdateChoiceDialog(false);
                                setPendingHabitUpdate(null);
                            }}
                            className="h-12 rounded-xl text-white/30 hover:text-white font-black tracking-widest"
                        >
                            취소
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

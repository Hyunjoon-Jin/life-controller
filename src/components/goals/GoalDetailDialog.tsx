'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Goal, Task, CalendarEvent } from '@/types';
import { useData } from '@/context/DataProvider';
import {
    Trophy,
    Calendar as CalendarIcon,
    ListTodo,
    Plus,
    ChevronRight,
    ChevronDown,
    CheckCircle2,
    Circle,
    Clock,
    Tag,
    Target,
    Pencil,
    Trash2,
    Shield,
    Zap,
    Activity,
    Lock,
    Unlock,
    Command,
    Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GoalDetailDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    goal: Goal | null;
}

export function GoalDetailDialog({ isOpen, onOpenChange, goal }: GoalDetailDialogProps) {
    const { goals, tasks, events, updateGoal, updateTask, deleteTask, addTask } = useData();
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'schedule'>('overview');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingTaskTitle, setEditingTaskTitle] = useState('');

    const progressBarRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    if (!goal) return null;

    const linkedTasks = tasks.filter(t => t.connectedGoalId === goal.id);
    const linkedEvents = events.filter(e => e.connectedGoalId === goal.id);

    const getDDay = (date?: Date) => {
        if (!date) return '';
        const today = new Date();
        const target = new Date(date);
        today.setHours(0, 0, 0, 0);
        target.setHours(0, 0, 0, 0);
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 0 ? 'STATUS: CRITICAL (D-DAY)' : diffDays > 0 ? `ETA: T-${diffDays} DAYS` : `OVERDUE: T+${Math.abs(diffDays)}`;
    };

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;
        const newTask: Task = {
            id: crypto.randomUUID(),
            title: newTaskTitle,
            completed: false,
            priority: 'medium',
            connectedGoalId: goal.id,
            type: 'work',
            projectId: '1'
        };
        addTask(newTask);
        setNewTaskTitle('');
    };

    const toggleTask = (task: Task) => {
        updateTask({ ...task, completed: !task.completed });
    };

    const handleDeleteTask = (taskId: string) => {
        if (confirm('이 작업을 아카이브에서 영구 삭제하시겠습니까?')) {
            deleteTask(taskId);
        }
    };

    const startEditingTask = (task: Task) => {
        setEditingTaskId(task.id);
        setEditingTaskTitle(task.title);
    };

    const saveTaskEdit = (task: Task) => {
        if (!editingTaskTitle.trim()) return;
        updateTask({ ...task, title: editingTaskTitle });
        setEditingTaskId(null);
    };

    // Draggable Progress Logic
    const handleProgressInteraction = (e: React.MouseEvent | React.TouchEvent) => {
        if (!progressBarRef.current) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const x = clientX - rect.left;
        const newProgress = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));
        updateGoal({ ...goal, progress: newProgress });
    };

    const onMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        handleProgressInteraction(e);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: any) => {
        if (!isDragging.current) return;
        handleProgressInteraction(e);
    };

    const onMouseUp = () => {
        isDragging.current = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        isDragging.current = true;
        handleProgressInteraction(e);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!isDragging.current) return;
        handleProgressInteraction(e);
    };

    const onTouchEnd = () => {
        isDragging.current = false;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[850px] h-[85vh] flex flex-col p-0 overflow-hidden glass-premium border-white/10 shadow-2xl rounded-[40px] text-white">
                {/* Tactical Header */}
                <div className="relative overflow-hidden p-8 sm:p-10 border-b border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                    {/* Background Tech Decal */}
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                        <Shield className="w-80 h-80 -rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="flex items-start gap-6">
                            <div className="w-16 h-16 bg-white/5 shadow-inner rounded-[24px] border border-white/10 flex items-center justify-center shrink-0 relative group">
                                <Trophy className="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform" />
                                <div className="absolute inset-0 bg-amber-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <DialogTitle className="text-3xl font-black tracking-tighter uppercase italic text-white/90">{goal.title}</DialogTitle>
                                    <div className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-[9px] font-black text-amber-500 uppercase tracking-widest">
                                        Verified Objective
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                    <span className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/5">
                                        <Tag className="w-3.5 h-3.5 text-blue-400" /> {goal.category || 'GENERAL'}
                                    </span>
                                    <span className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/5">
                                        <Command className="w-3.5 h-3.5 text-emerald-400" /> {goal.planType === 'long-term' ? 'STRATEGIC' : 'TACTICAL'}
                                    </span>
                                    {goal.deadline && (
                                        <span className={cn(
                                            "flex items-center gap-2 px-3 py-1 rounded-xl border",
                                            new Date(goal.deadline) < new Date() ? "bg-rose-500/10 border-rose-500/30 text-rose-400" : "bg-white/5 border-white/10 text-white/40"
                                        )}>
                                            <CalendarIcon className="w-3.5 h-3.5" /> {getDDay(goal.deadline)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <div className="relative">
                                <span className={cn(
                                    "text-6xl font-black tracking-tighter tabular-nums italic",
                                    goal.progress === 100 ? "text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "text-white/90"
                                )}>
                                    {goal.progress}<span className="text-xl align-top ml-1 font-black text-white/60">%</span>
                                </span>
                            </div>
                            <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">Resource Allocated</span>
                        </div>
                    </div>

                    {/* Industrial Progress Controller */}
                    <div className="mt-10 space-y-3">
                        <div className="flex justify-between items-end">
                            <h4 className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Terminal className="w-3.5 h-3.5" /> Deployment Manual Override
                            </h4>
                            <span className="text-[10px] font-black text-amber-500/50 italic animate-pulse">DRAG TO SYNC PROGRESS</span>
                        </div>
                        <div
                            ref={progressBarRef}
                            onMouseDown={onMouseDown}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                            className="h-8 w-full bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 shadow-inner relative cursor-pointer touch-none group"
                        >
                            <motion.div
                                className={cn(
                                    "h-full rounded-2xl transition-all duration-300 ease-out relative overflow-hidden",
                                    goal.progress === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-amber-600 to-amber-400"
                                )}
                                style={{ width: `${goal.progress}%` }}
                            >
                                <div className="absolute inset-0 bg-white/10 animate-[shimmer_3s_infinite]" />
                            </motion.div>

                            {/* Kinetic Handle */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-xl shadow-2xl flex items-center justify-center transition-transform group-hover:scale-110 pointer-events-none z-20"
                                style={{ left: `calc(${goal.progress}% - 16px)` }}
                            >
                                <div className="flex gap-1">
                                    <div className="w-1 h-3 bg-slate-900/20 rounded-full" />
                                    <div className="w-1 h-3 bg-slate-900/20 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-10 mt-12 -mb-10 px-2 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'overview', label: 'STRATEGIC MAP', icon: Target },
                            { id: 'tasks', label: 'OPERATIONS', count: linkedTasks.length, icon: ListTodo },
                            { id: 'schedule', label: 'TIMELINE', count: linkedEvents.length, icon: CalendarIcon }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "pb-5 text-[11px] font-black border-b-2 transition-all duration-300 whitespace-nowrap flex items-center gap-3 tracking-[0.2em]",
                                    activeTab === tab.id
                                        ? "border-amber-500 text-amber-500"
                                        : "border-transparent text-white/50 hover:text-white/60"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {tab.count !== undefined && (
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-md text-[9px] font-black transition-colors",
                                        activeTab === tab.id ? "bg-amber-500/20 text-amber-500" : "bg-white/5 text-white/60"
                                    )}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Stream */}
                <div className="flex-1 overflow-y-auto p-8 sm:p-10 custom-scrollbar bg-slate-950/20">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-10"
                            >
                                {/* Briefing Section */}
                                <section className="space-y-4">
                                    <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        In-Brief Context
                                    </h3>
                                    <div className="glass-premium p-6 rounded-[24px] border border-white/5 text-sm font-medium leading-relaxed text-white/70 italic shadow-inner">
                                        {goal.memo ? (
                                            <span className="font-mono">// MISSION LOG: {goal.memo}</span>
                                        ) : (
                                            <span className="text-white/60 font-mono tracking-widest">// NO STRATEGIC DATA LOGGED</span>
                                        )}
                                    </div>
                                </section>

                                {/* Hierarchy Units */}
                                <section className="space-y-4">
                                    <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        Sub-Tactical Units
                                    </h3>
                                    <div className="grid gap-3">
                                        {goal.subGoals && goal.subGoals.length > 0 ? (
                                            goal.subGoals.map(sub => (
                                                <div key={sub.id} className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-[20px] group hover:bg-white/10 transition-all border-l-4 border-l-blue-500/50">
                                                    <div className="flex items-center gap-5">
                                                        <Activity className={cn("w-5 h-5", sub.progress === 100 ? "text-emerald-500" : "text-blue-400")} />
                                                        <span className="font-black text-white/80 uppercase tracking-tight">{sub.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                                                            <div className="h-full bg-blue-500/50 rounded-full transition-all duration-1000" style={{ width: `${sub.progress}%` }} />
                                                        </div>
                                                        <span className="text-xs font-black text-white/40 tabular-nums w-12 text-right">{sub.progress}%</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-16 text-white/40 glass-premium rounded-[32px] border border-dashed border-white/5">
                                                <Lock className="w-12 h-12 mb-4 opacity-40" />
                                                <p className="text-[11px] font-black uppercase tracking-widest">No Sub-Units Initialized</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </motion.div>
                        )}

                        {activeTab === 'tasks' && (
                            <motion.div
                                key="tasks"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className="flex gap-3">
                                    <input
                                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-white"
                                        placeholder="INITIATE NEW OPERATION..."
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                    />
                                    <Button onClick={handleAddTask} className="h-auto px-8 bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl">Deploy</Button>
                                </div>

                                <div className="space-y-3">
                                    {linkedTasks.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-white/40 bg-white/[0.02] rounded-[40px] border border-dashed border-white/5">
                                            <Terminal className="w-16 h-16 mb-4 opacity-40 animate-pulse" />
                                            <p className="font-black uppercase tracking-widest">Active Operations Zero</p>
                                        </div>
                                    ) : (
                                        linkedTasks.map(task => (
                                            <div key={task.id} className="flex items-center gap-5 p-5 bg-white/5 border border-white/5 rounded-2xl group hover:border-amber-500/30 transition-all">
                                                <button
                                                    onClick={() => toggleTask(task)}
                                                    className={cn(
                                                        "transition-all transform active:scale-90 p-1 rounded-lg",
                                                        task.completed ? "bg-amber-500 text-slate-900" : "bg-white/5 text-white/40 hover:text-amber-500"
                                                    )}
                                                >
                                                    {task.completed ? <CheckCircle2 className="w-6 h-6" strokeWidth={3} /> : <Circle className="w-6 h-6" strokeWidth={3} />}
                                                </button>

                                                {editingTaskId === task.id ? (
                                                    <input
                                                        autoFocus
                                                        className="flex-1 bg-white/10 border-none px-3 py-2 rounded-xl text-sm font-black text-white focus:outline-none ring-1 ring-amber-500/50 uppercase"
                                                        value={editingTaskTitle}
                                                        onChange={(e) => setEditingTaskTitle(e.target.value)}
                                                        onBlur={() => saveTaskEdit(task)}
                                                        onKeyDown={(e) => e.key === 'Enter' && saveTaskEdit(task)}
                                                    />
                                                ) : (
                                                    <span
                                                        className={cn("flex-1 font-black uppercase tracking-tight text-white/80 cursor-pointer text-sm", task.completed && "line-through opacity-30")}
                                                        onClick={() => startEditingTask(task)}
                                                    >
                                                        {task.title}
                                                    </span>
                                                )}

                                                <div className="flex items-center gap-3">
                                                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-white/40 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl" onClick={() => startEditingTask(task)}>
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-white/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl" onClick={() => handleDeleteTask(task.id)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'schedule' && (
                            <motion.div
                                key="schedule"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                {linkedEvents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-24 text-white/40">
                                        <Clock className="w-16 h-16 mb-4 opacity-40" />
                                        <p className="font-black uppercase tracking-[0.3em]">Temporal Linking Unavailable</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {linkedEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()).map(event => (
                                            <div key={event.id} className="flex items-center gap-6 group">
                                                <div className="flex flex-col items-center min-w-[70px] py-3 bg-white/5 rounded-2xl border border-white/5">
                                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{format(new Date(event.start), 'MMM')}</span>
                                                    <span className="text-2xl font-black text-white">{format(new Date(event.start), 'd')}</span>
                                                </div>
                                                <div className="flex-1 p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                                    <div className="font-black text-sm uppercase tracking-tight text-white/90 mb-1">{event.title}</div>
                                                    <div className="text-[10px] text-white/60 flex items-center gap-2 font-black tracking-widest">
                                                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                        {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}

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
    CheckCircle2,
    Circle,
    Clock,
    Tag,
    Target,
    Pencil,
    Trash2,
    Lock,
    Command,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GoalDetailDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    goal: Goal | null;
}

export function GoalDetailDialog({ isOpen, onOpenChange, goal }: GoalDetailDialogProps) {
    const { tasks, events, updateGoal, updateTask, deleteTask, addTask } = useData();
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
        const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays === 0 ? 'D-Day' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
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

    const toggleTask = (task: Task) => updateTask({ ...task, completed: !task.completed });

    const handleDeleteTask = (taskId: string) => {
        if (confirm('이 할 일을 삭제하시겠습니까?')) deleteTask(taskId);
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
    const onMouseMove = (e: any) => { if (isDragging.current) handleProgressInteraction(e); };
    const onMouseUp = () => {
        isDragging.current = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };
    const onTouchStart = (e: React.TouchEvent) => { isDragging.current = true; handleProgressInteraction(e); };
    const onTouchMove = (e: React.TouchEvent) => { if (isDragging.current) handleProgressInteraction(e); };
    const onTouchEnd = () => { isDragging.current = false; };

    const tabs = [
        { id: 'overview', label: '개요', count: undefined, icon: Target },
        { id: 'tasks', label: '할 일', count: linkedTasks.length, icon: ListTodo },
        { id: 'schedule', label: '일정', count: linkedEvents.length, icon: CalendarIcon },
    ] as const;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] h-[85vh] flex flex-col p-0 overflow-hidden bg-card border border-border shadow-xl rounded-2xl">
                {/* Header */}
                <div className="p-8 border-b border-border bg-muted/30">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center justify-center shrink-0">
                                <Trophy className="w-6 h-6 text-amber-500" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <DialogTitle className="text-xl font-bold text-foreground">{goal.title}</DialogTitle>
                                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-600">
                                        목표
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border border-border">
                                        <Tag className="w-3 h-3 text-blue-400" /> {goal.category || '일반'}
                                    </span>
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border border-border">
                                        <Command className="w-3 h-3 text-emerald-400" />
                                        {goal.planType === 'long-term' ? '장기 목표' : '단기 목표'}
                                    </span>
                                    {goal.deadline && (
                                        <span className={cn(
                                            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border",
                                            new Date(goal.deadline) < new Date()
                                                ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                                                : "bg-muted border-border text-muted-foreground"
                                        )}>
                                            <CalendarIcon className="w-3 h-3" /> {getDDay(goal.deadline)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={cn(
                                "text-5xl font-bold tabular-nums",
                                goal.progress === 100 ? "text-emerald-500" : "text-foreground"
                            )}>
                                {goal.progress}<span className="text-lg text-muted-foreground ml-1">%</span>
                            </span>
                            <span className="text-xs text-muted-foreground">진행률</span>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-6 space-y-2">
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>진행률 조정</span>
                            <span className="text-amber-500/70">드래그하여 설정</span>
                        </div>
                        <div
                            ref={progressBarRef}
                            onMouseDown={onMouseDown}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                            className="h-7 w-full bg-muted rounded-xl overflow-hidden border border-border relative cursor-pointer touch-none group"
                        >
                            <motion.div
                                className={cn(
                                    "h-full rounded-xl transition-all duration-300",
                                    goal.progress === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-amber-600 to-amber-400"
                                )}
                                style={{ width: `${goal.progress}%` }}
                            />
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-xl shadow-md flex items-center justify-center pointer-events-none z-20"
                                style={{ left: `calc(${goal.progress}% - 14px)` }}
                            >
                                <div className="flex gap-0.5">
                                    <div className="w-0.5 h-3 bg-slate-400 rounded-full" />
                                    <div className="w-0.5 h-3 bg-slate-400 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-6">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    activeTab === tab.id
                                        ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {tab.count !== undefined && (
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded text-xs font-medium",
                                        activeTab === tab.id ? "bg-amber-500/20 text-amber-600" : "bg-muted text-muted-foreground"
                                    )}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                                <section className="space-y-3">
                                    <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> 메모
                                    </h3>
                                    <div className="p-5 rounded-xl border border-border bg-muted/30 text-sm text-foreground leading-relaxed min-h-[80px]">
                                        {goal.memo ? goal.memo : (
                                            <span className="text-muted-foreground">메모가 없습니다.</span>
                                        )}
                                    </div>
                                </section>

                                <section className="space-y-3">
                                    <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> 세부 목표
                                    </h3>
                                    <div className="space-y-2">
                                        {goal.subGoals && goal.subGoals.length > 0 ? (
                                            goal.subGoals.map(sub => (
                                                <div key={sub.id} className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-xl border-l-4 border-l-blue-500/50">
                                                    <span className="text-sm font-medium text-foreground">{sub.title}</span>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${sub.progress}%` }} />
                                                        </div>
                                                        <span className="text-xs text-muted-foreground w-10 text-right">{sub.progress}%</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-xl">
                                                <Lock className="w-8 h-8 text-muted-foreground/30 mb-2" />
                                                <p className="text-sm text-muted-foreground">세부 목표가 없습니다</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </motion.div>
                        )}

                        {activeTab === 'tasks' && (
                            <motion.div key="tasks" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-foreground"
                                        placeholder="새 할 일 추가..."
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                    />
                                    <Button onClick={handleAddTask} className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-5">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {linkedTasks.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-xl">
                                            <ListTodo className="w-10 h-10 text-muted-foreground/30 mb-3" />
                                            <p className="text-sm text-muted-foreground">할 일이 없습니다</p>
                                        </div>
                                    ) : (
                                        linkedTasks.map(task => (
                                            <div key={task.id} className="flex items-center gap-3 p-4 bg-muted/30 border border-border rounded-xl group hover:border-amber-500/30 transition-all">
                                                <button
                                                    onClick={() => toggleTask(task)}
                                                    className={cn(
                                                        "transition-all rounded-lg p-0.5",
                                                        task.completed ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"
                                                    )}
                                                >
                                                    {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                                </button>

                                                {editingTaskId === task.id ? (
                                                    <input
                                                        autoFocus
                                                        className="flex-1 bg-muted border border-border px-3 py-1.5 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                                                        value={editingTaskTitle}
                                                        onChange={(e) => setEditingTaskTitle(e.target.value)}
                                                        onBlur={() => saveTaskEdit(task)}
                                                        onKeyDown={(e) => e.key === 'Enter' && saveTaskEdit(task)}
                                                    />
                                                ) : (
                                                    <span
                                                        className={cn("flex-1 text-sm text-foreground cursor-pointer", task.completed && "line-through text-muted-foreground")}
                                                        onClick={() => startEditingTask(task)}
                                                    >
                                                        {task.title}
                                                    </span>
                                                )}

                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-amber-500" onClick={() => startEditingTask(task)}>
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-rose-500" onClick={() => handleDeleteTask(task.id)}>
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'schedule' && (
                            <motion.div key="schedule" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                                {linkedEvents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-xl">
                                        <Clock className="w-10 h-10 text-muted-foreground/30 mb-3" />
                                        <p className="text-sm text-muted-foreground">연결된 일정이 없습니다</p>
                                    </div>
                                ) : (
                                    linkedEvents
                                        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                                        .map(event => (
                                            <div key={event.id} className="flex items-center gap-4">
                                                <div className="flex flex-col items-center min-w-[60px] py-2.5 bg-muted rounded-xl border border-border text-center">
                                                    <span className="text-xs text-muted-foreground">{format(new Date(event.start), 'M월', { locale: ko })}</span>
                                                    <span className="text-xl font-bold text-foreground">{format(new Date(event.start), 'd')}</span>
                                                </div>
                                                <div className="flex-1 p-4 rounded-xl bg-muted/30 border border-border">
                                                    <div className="text-sm font-medium text-foreground mb-1">{event.title}</div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                        <Clock className="w-3 h-3" />
                                                        {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}

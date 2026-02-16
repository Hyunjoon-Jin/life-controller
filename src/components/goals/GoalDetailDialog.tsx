'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Goal, Task, CalendarEvent } from '@/types';
import { useData } from '@/context/DataProvider'; // Assuming context is available
import { Trophy, Calendar as CalendarIcon, ListTodo, Plus, ChevronRight, ChevronDown, CheckCircle2, Circle, Clock, Tag, Target, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useRef, useEffect } from 'react';

interface GoalDetailDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    goal: Goal | null;
}

export function GoalDetailDialog({ isOpen, onOpenChange, goal }: GoalDetailDialogProps) {
    const { goals, tasks, events, updateGoal, updateTask, deleteTask, addTask } = useData();
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'schedule'>('overview');

    // Local state for adding new task directly
    const [newTaskTitle, setNewTaskTitle] = useState('');

    // Editing task state
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingTaskTitle, setEditingTaskTitle] = useState('');

    // Draggable progress state
    const progressBarRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    if (!goal) return null;

    // Helper to find subgoals
    const getSubGoals = (parentId: string) => {
        // This logic depends on how subGoals are stored. 
        // If they are nested in the goal object, we use goal.subGoals.
        // If flattened, we search by parentId. 
        // Based on previous code, they are nested.
        return goal.subGoals || [];
    };

    const linkedTasks = tasks.filter(t => t.connectedGoalId === goal.id);
    const linkedEvents = events.filter(e => e.connectedGoalId === goal.id);

    // Calculate D-Day
    const getDDay = (date?: Date) => {
        if (!date) return '';
        const today = new Date();
        const target = new Date(date);
        today.setHours(0, 0, 0, 0);
        target.setHours(0, 0, 0, 0);
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
            type: 'work', // Default
            projectId: '1' // Default project? Or maybe optional
        };
        addTask(newTask);
        setNewTaskTitle('');
    };

    const toggleTask = (task: Task) => {
        updateTask({ ...task, completed: !task.completed });
    };

    const handleDeleteTask = (taskId: string) => {
        if (confirm('이 할 일을 삭제하시겠습니까?')) {
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
            <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col p-0 overflow-hidden bg-card text-card-foreground">
                {/* Header Section */}
                {/* Header Section */}
                <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/20 p-6 sm:p-8 border-b border-border/60">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                        <Trophy className="w-64 h-64 -rotate-12" />
                    </div>

                    <div className="relative z-10 flex justify-between items-start mb-8">
                        <div className="flex items-start gap-5">
                            <div className="p-3.5 bg-background shadow-sm rounded-2xl border border-border/50 shrink-0">
                                <Trophy className="w-8 h-8 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <DialogTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{goal.title}</DialogTitle>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground font-medium">
                                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-background border border-border/50 shadow-sm">
                                        <Tag className="w-3.5 h-3.5 text-primary" /> {goal.category || '미분류'}
                                    </span>
                                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-background border border-border/50 shadow-sm">
                                        <Target className="w-3.5 h-3.5 text-blue-500" /> {goal.planType === 'long-term' ? '장기 목표' : '단기 목표'}
                                    </span>
                                    {goal.deadline && (
                                        <span className={cn("flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border shadow-sm", getDDay(goal.deadline) === 'D-Day' ? "bg-red-500 text-white border-red-600" : "bg-red-50 text-red-600 border-red-100")}>
                                            <CalendarIcon className="w-3.5 h-3.5" /> {getDDay(goal.deadline)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <div className="flex flex-col items-end">
                                <span className={cn("text-4xl sm:text-5xl font-black tracking-tighter tabular-nums", goal.progress === 100 ? "text-emerald-500" : "text-primary")}>
                                    {goal.progress}<span className="text-lg align-top ml-0.5 font-bold text-muted-foreground">%</span>
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70 mt-1">Achieved</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar (Draggable) */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">Progress Control</span>
                            <span className="text-xs font-bold text-primary italic">드래그하여 조정 가능</span>
                        </div>
                        <div
                            ref={progressBarRef}
                            onMouseDown={onMouseDown}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                            className="h-6 w-full bg-slate-200 dark:bg-slate-800 backdrop-blur-sm rounded-full overflow-hidden border border-border/20 shadow-inner relative cursor-pointer touch-none group"
                        >
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-300 ease-out shadow-[0_2px_10px_rgba(0,0,0,0.1)] relative overflow-hidden",
                                    goal.progress === 100 ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : "bg-gradient-to-r from-blue-400 to-blue-600"
                                )}
                                style={{ width: `${goal.progress}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-12" />
                            </div>

                            {/* Glow Handle */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-xl border-2 border-primary/50 flex items-center justify-center transition-transform group-hover:scale-110 pointer-events-none"
                                style={{ left: `calc(${goal.progress}% - 12px)` }}
                            >
                                <div className="w-1 h-3 bg-primary/20 rounded-full mx-0.5" />
                                <div className="w-1 h-3 bg-primary/20 rounded-full mx-0.5" />
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-8 mt-10 -mb-8 px-2 overflow-x-auto scrollbar-none">
                        {[
                            { id: 'overview', label: '개요 & 하위목표' },
                            { id: 'tasks', label: '액션 플랜', count: linkedTasks.length },
                            { id: 'schedule', label: '관련 일정', count: linkedEvents.length }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "pb-4 text-sm font-bold border-b-[3px] transition-all duration-200 whitespace-nowrap flex items-center gap-2",
                                    activeTab === tab.id
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab.label}
                                {tab.count !== undefined && (
                                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full transition-colors", activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-card/50 custom-scrollbar">
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Memo Section */}
                            <section className="space-y-3">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <ListTodo className="w-4 h-4" /> 상세 내용
                                </h3>
                                <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 text-sm leading-relaxed min-h-[100px] whitespace-pre-wrap shadow-sm">
                                    {goal.memo || <span className="text-muted-foreground italic">작성된 메모가 없습니다.</span>}
                                </div>
                            </section>

                            {/* Sub-Goals Section */}
                            <section className="space-y-3">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Target className="w-4 h-4" /> 하위 목표
                                </h3>
                                <div className="grid gap-3">
                                    {goal.subGoals && goal.subGoals.length > 0 ? (
                                        goal.subGoals.map(sub => (
                                            <div key={sub.id} className="flex items-center justify-between p-4 bg-background border border-border/60 rounded-xl shadow-sm hover:shadow-md transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("w-2 h-2 rounded-full ring-4 ring-opacity-20", sub.progress === 100 ? "bg-emerald-500 ring-emerald-500" : "bg-primary ring-primary")} />
                                                    <span className="font-semibold text-foreground">{sub.title}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden hidden sm:block">
                                                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${sub.progress}%` }} />
                                                    </div>
                                                    <span className="text-xs font-bold text-muted-foreground w-8 text-right">{sub.progress}%</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 border-2 border-dashed border-border/50 rounded-2xl">
                                            <Target className="w-10 h-10 mb-3 opacity-20" />
                                            <p className="text-sm font-medium">하위 목표가 없습니다.</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Input Area */}
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 bg-background border border-input rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="이 목표를 달성하기 위한 할 일을 입력하세요..."
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                />
                                <Button onClick={handleAddTask} className="rounded-xl px-6 shadow-sm">추가</Button>
                            </div>

                            <div className="space-y-2">
                                {linkedTasks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground opacity-60 bg-muted/10 rounded-3xl border border-dashed border-border/50">
                                        <ListTodo className="w-12 h-12 mb-3 opacity-20" />
                                        <p className="font-medium">등록된 할 일이 없습니다.</p>
                                        <p className="text-xs mt-1">작은 실천부터 시작해보세요!</p>
                                    </div>
                                ) : (
                                    linkedTasks.map(task => (
                                        <div key={task.id} className="flex items-center gap-4 p-4 bg-background border border-border/50 rounded-xl hover:border-primary/30 hover:shadow-md transition-all group">
                                            <button
                                                onClick={() => toggleTask(task)}
                                                className={cn(
                                                    "transition-all transform active:scale-90",
                                                    task.completed ? "text-primary" : "text-muted-foreground hover:text-primary"
                                                )}
                                            >
                                                {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                            </button>

                                            {editingTaskId === task.id ? (
                                                <input
                                                    autoFocus
                                                    className="flex-1 bg-muted/30 border-none px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                                    value={editingTaskTitle}
                                                    onChange={(e) => setEditingTaskTitle(e.target.value)}
                                                    onBlur={() => saveTaskEdit(task)}
                                                    onKeyDown={(e) => e.key === 'Enter' && saveTaskEdit(task)}
                                                />
                                            ) : (
                                                <span
                                                    className={cn("flex-1 font-medium cursor-pointer", task.completed && "line-through text-muted-foreground opacity-70")}
                                                    onClick={() => startEditingTask(task)}
                                                >
                                                    {task.title}
                                                </span>
                                            )}

                                            <div className="flex items-center gap-1.5">
                                                {task.deadline && (
                                                    <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium border", new Date(task.deadline) < new Date() ? "bg-red-50 text-red-600 border-red-100" : "bg-muted text-muted-foreground border-border")}>
                                                        {format(new Date(task.deadline), 'M/d')}
                                                    </span>
                                                )}
                                                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => startEditingTask(task)}>
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTask(task.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {linkedEvents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground opacity-60 bg-muted/10 rounded-3xl border border-dashed border-border/50">
                                    <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
                                    <p className="font-medium">연동된 일정이 없습니다.</p>
                                    <p className="text-xs mt-1">캘린더에서 목표와 관련된 일정을 추가해보세요.</p>
                                </div>
                            ) : (
                                <div className="relative pl-4 space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:to-transparent">
                                    {linkedEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()).map(event => (
                                        <div key={event.id} className="relative flex items-center gap-6 group">
                                            <div className="absolute left-[-5px] w-3 h-3 rounded-full bg-background border-2 border-primary ring-4 ring-background z-10" />

                                            <div className="flex-1 flex items-center gap-4 p-4 bg-background border border-border/60 rounded-xl hover:shadow-md transition-all hover:border-primary/30">
                                                <div className="flex flex-col items-center min-w-[60px] text-center px-2 py-1 bg-muted/30 rounded-lg border border-border/50">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{format(new Date(event.start), 'MMM')}</span>
                                                    <span className="text-xl font-black text-foreground">{format(new Date(event.start), 'd')}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-base mb-1 group-hover:text-primary transition-colors">{event.title}</div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

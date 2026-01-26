'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Goal, Task, CalendarEvent } from '@/types';
import { useData } from '@/context/DataProvider'; // Assuming context is available
import { Trophy, Calendar as CalendarIcon, ListTodo, Plus, ChevronRight, ChevronDown, CheckCircle2, Circle, Clock, Tag, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface GoalDetailDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    goal: Goal | null;
}

export function GoalDetailDialog({ isOpen, onOpenChange, goal }: GoalDetailDialogProps) {
    const { goals, tasks, events, updateGoal, updateTask, addTask } = useData();
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'schedule'>('overview');

    // Local state for adding new task directly
    const [newTaskTitle, setNewTaskTitle] = useState('');

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

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col p-0 overflow-hidden bg-card text-card-foreground">
                {/* Header Section */}
                <div className="bg-muted/30 p-6 border-b border-border">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <Trophy className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <DialogTitle className="text-2xl font-bold">{goal.title}</DialogTitle>
                                    {goal.deadline && (
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                                            {getDDay(goal.deadline)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Tag className="w-3 h-3" /> {goal.category || '미분류'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Target className="w-3 h-3" /> {goal.planType === 'long-term' ? '장기 목표' : '단기 목표'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-black text-primary">{goal.progress}%</div>
                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Achieved</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${goal.progress}%` }}
                        />
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-6 mt-6 border-b border-border/50 -mb-6 px-2">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={cn(
                                "pb-3 text-sm font-bold border-b-2 transition-colors",
                                activeTab === 'overview' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            개요 & 하위목표
                        </button>
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={cn(
                                "pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2",
                                activeTab === 'tasks' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            액션 플랜 <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{linkedTasks.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('schedule')}
                            className={cn(
                                "pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2",
                                activeTab === 'schedule' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            관련 일정 <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{linkedEvents.length}</span>
                        </button>
                    </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-card custom-scrollbar">
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Memo Section */}
                            <section>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">상세 내용</h3>
                                <div className="bg-muted/30 p-4 rounded-xl text-sm leading-relaxed min-h-[100px] whitespace-pre-wrap">
                                    {goal.memo || "작성된 메모가 없습니다."}
                                </div>
                            </section>

                            {/* Sub-Goals Section */}
                            <section>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center justify-between">
                                    <span>하위 목표</span>
                                    <span className="text-xs normal-case bg-primary/10 text-primary px-2 py-0.5 rounded-full">Coming Soon</span>
                                </h3>
                                <div className="space-y-2">
                                    {goal.subGoals && goal.subGoals.length > 0 ? (
                                        goal.subGoals.map(sub => (
                                            <div key={sub.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                    <span className="font-medium">{sub.title}</span>
                                                </div>
                                                <span className="text-xs font-bold text-muted-foreground">{sub.progress}%</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground text-sm bg-muted/10 rounded-xl border border-dashed border-muted-foreground/20">
                                            하위 목표가 없습니다.
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="space-y-4">
                            <div className="flex gap-2 mb-4">
                                <input
                                    className="flex-1 bg-muted border-transparent rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="새로운 할 일 입력..."
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                />
                                <Button onClick={handleAddTask} size="sm">추가</Button>
                            </div>

                            <div className="space-y-2">
                                {linkedTasks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-60">
                                        <ListTodo className="w-10 h-10 mb-2" />
                                        <p>이 목표와 연동된 할 일이 없습니다.</p>
                                    </div>
                                ) : (
                                    linkedTasks.map(task => (
                                        <div key={task.id} className="flex items-center gap-3 p-3 bg-muted/10 rounded-lg group hover:bg-muted/30 transition-colors border border-transparent hover:border-border">
                                            <button onClick={() => toggleTask(task)} className={cn("transition-colors", task.completed ? "text-primary" : "text-muted-foreground hover:text-primary")}>
                                                {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                            </button>
                                            <span className={cn("flex-1 font-medium text-sm", task.completed && "line-through text-muted-foreground opacity-70")}>
                                                {task.title}
                                            </span>
                                            {task.deadline && (
                                                <span className="text-xs text-red-400 bg-red-50 px-2 py-1 rounded">
                                                    {format(new Date(task.deadline), 'M/d')}
                                                </span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="space-y-2">
                            {linkedEvents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-60">
                                    <CalendarIcon className="w-10 h-10 mb-2" />
                                    <p>이 목표와 연동된 일정이 없습니다.</p>
                                </div>
                            ) : (
                                linkedEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()).map(event => (
                                    <div key={event.id} className="flex items-center gap-4 p-4 border border-border rounded-xl hover:bg-muted/5 transition-colors relative overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                        <div className="flex flex-col items-center min-w-[50px] text-center">
                                            <span className="text-xs font-bold text-muted-foreground uppercase">{format(new Date(event.start), 'MMM')}</span>
                                            <span className="text-xl font-bold">{format(new Date(event.start), 'd')}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-sm mb-1">{event.title}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

'use client';

import { useData } from '@/context/DataProvider';
import { isSameDay, isAfter, startOfDay, isPast } from 'date-fns';
import { CheckSquare, Square, Flame, Clock, AlertCircle, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';

const PRIORITY_CONFIG = {
    high:   { label: '높음', color: 'text-red-400',    dot: 'bg-red-500',    icon: Flame },
    medium: { label: '중간', color: 'text-orange-400', dot: 'bg-orange-400', icon: Clock },
    low:    { label: '낮음', color: 'text-slate-400',  dot: 'bg-slate-500',  icon: Clock },
};

export function TodayTasksCard() {
    const { tasks, updateTask, projects } = useData();
    const today = startOfDay(new Date());
    const [completing, setCompleting] = useState<string | null>(null);

    // 오늘 마감 + 미완료 + 업무 관련 태스크
    const todayTasks = tasks
        .filter(t => {
            if (t.completed) return false;
            const due = t.dueDate ? startOfDay(new Date(t.dueDate)) : null;
            if (!due) return false;
            // 오늘 마감 or 이미 지난(overdue) 항목
            return isSameDay(due, today) || isPast(due);
        })
        .sort((a, b) => {
            const pOrder = { high: 0, medium: 1, low: 2 };
            return (pOrder[a.priority as keyof typeof pOrder] ?? 1) - (pOrder[b.priority as keyof typeof pOrder] ?? 1);
        });

    const overdue = todayTasks.filter(t => {
        const due = startOfDay(new Date(t.dueDate!));
        return !isSameDay(due, today) && isPast(due);
    });

    const handleComplete = async (task: typeof tasks[number]) => {
        setCompleting(task.id);
        await updateTask({ ...task, completed: true });
        toast.success(`완료: ${task.title}`);
        setCompleting(null);
    };

    return (
        <div className="glass-premium rounded-[28px] border border-white/5 p-6 shadow-2xl h-full flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <CheckSquare className="w-4.5 h-4.5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground leading-none">오늘 할 일</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {todayTasks.length > 0 ? `${todayTasks.length}건 남음` : '모두 완료'}
                        </p>
                    </div>
                </div>
                {overdue.length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        {overdue.length}건 지연
                    </div>
                )}
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 relative z-10 pr-1">
                {todayTasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-10 gap-2">
                        <Inbox className="w-8 h-8 text-muted-foreground/20" />
                        <p className="text-xs text-muted-foreground">오늘 할 일이 없습니다</p>
                    </div>
                ) : (
                    todayTasks.map((task, idx) => {
                        const pCfg = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium;
                        const proj = projects.find(p => p.id === task.projectId);
                        const isOverdue = task.dueDate && !isSameDay(startOfDay(new Date(task.dueDate)), today) && isPast(startOfDay(new Date(task.dueDate)));

                        return (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-xl border transition-all group",
                                    isOverdue
                                        ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40"
                                        : "bg-white/[0.02] border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.04]"
                                )}
                            >
                                <button
                                    onClick={() => handleComplete(task)}
                                    disabled={completing === task.id}
                                    className="shrink-0 mt-0.5 text-muted-foreground/40 hover:text-emerald-400 transition-colors"
                                >
                                    {completing === task.id
                                        ? <div className="w-4 h-4 rounded border-2 border-emerald-400 animate-spin border-t-transparent" />
                                        : <Square className="w-4 h-4" />
                                    }
                                </button>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground leading-snug truncate">
                                        {task.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {proj && (
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: proj.color }} />
                                                {proj.title}
                                            </span>
                                        )}
                                        <span className={cn("text-xs flex items-center gap-0.5", pCfg.color)}>
                                            <span className={cn("w-1.5 h-1.5 rounded-full", pCfg.dot)} />
                                            {pCfg.label}
                                        </span>
                                        {isOverdue && (
                                            <span className="text-xs text-red-400 font-medium">지연됨</span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

'use client';

import { useData } from '@/context/DataProvider';
import { CheckCircle2, AlertCircle, ArrowRight, Flag, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function PriorityTasks() {
    const { tasks, updateTask, activeTaskId, toggleTaskTimer } = useData();

    // High priority tasks first, then by date (if exists), then by creation
    const priorityTasks = tasks
        .filter(t => !t.completed && (t.category === 'work' || t.projectId)) // Filter Work Only: category is work OR it belongs to a project (assuming projects are work-centric in this view)
        .sort((a, b) => {
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (a.priority !== 'high' && b.priority === 'high') return 1;
            return 0; // Keep original order for same priority for now
        })
        .slice(0, 5);

    const handleComplete = (id: string) => {
        const taskToUpdate = tasks.find(t => t.id === id);
        if (taskToUpdate) {
            updateTask({ ...taskToUpdate, completed: true });
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Flag className="w-5 h-5 text-red-500" />
                    우선 순위 태스크
                </h3>
                <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-slate-600">
                    전체 보기 <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                {priorityTasks.length > 0 ? (
                    priorityTasks.map((task, index) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-200"
                        >
                            <button
                                onClick={() => handleComplete(task.id)}
                                className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                    task.priority === 'high' ? "border-red-200 hover:border-red-500 text-red-500" : "border-slate-200 hover:border-indigo-500 text-indigo-500"
                                )}
                            >
                                <div className="w-2.5 h-2.5 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{task.title}</span>
                                    {task.priority === 'high' && (
                                        <span className="px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider">
                                            High
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    {task.category && <span className="bg-slate-100 px-1.5 py-0.5 rounded">{task.category}</span>}
                                    {task.projectId && <span>• 프로젝트 연동됨</span>}
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleTaskTimer(task.id)}
                                className={cn(
                                    "rounded-full w-8 h-8 transition-colors",
                                    activeTaskId === task.id
                                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                                        : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {activeTaskId === task.id ? (
                                    <Pause className="w-4 h-4 fill-current" />
                                ) : (
                                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                                )}
                            </Button>
                        </motion.div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 pb-10">
                        <CheckCircle2 className="w-12 h-12 mb-3 opacity-20 text-green-500" />
                        <p className="font-medium">모든 중요 업무를 완료했습니다!</p>
                        <p className="text-sm opacity-70">여유를 즐기시거나 새로운 태스크를 등록하세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

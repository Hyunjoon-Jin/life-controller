'use client';

import { useData } from '@/context/DataProvider';
import { Briefcase, ChevronRight, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface MainProjectsProps {
    onOpenProject?: (id: string) => void;
}

export function MainProjects({ onOpenProject }: MainProjectsProps) {
    const { projects, tasks } = useData();
    const activeProjects = projects.filter(p => p.status === 'active' && p.category === 'work').slice(0, 3);

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    주요 프로젝트
                </h3>
            </div>

            <div className="flex-1 space-y-4">
                {activeProjects.length > 0 ? (
                    activeProjects.map(project => {
                        const projectTasks = tasks.filter(t => t.projectId === project.id && !t.completed);
                        const nextTask = projectTasks[0];

                        return (
                            <button
                                key={project.id}
                                onClick={() => onOpenProject?.(project.id)}
                                className="w-full text-left p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                                        {project.title}
                                    </h4>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
                                </div>

                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
                                    {project.description || '설명이 없습니다.'}
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                                        <Calendar className="w-3 h-3" />
                                        {project.startDate && project.endDate ? (
                                            `${format(new Date(project.startDate), 'MM.dd')} ~ ${format(new Date(project.endDate), 'MM.dd')}`
                                        ) : '기간 미설정'}
                                    </div>
                                    {nextTask && (
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 truncate">
                                            <Clock className="w-3 h-3" />
                                            당면 업무: {nextTask.title}
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[150px]">
                        <Briefcase className="w-10 h-10 mb-3 opacity-20" />
                        <p className="text-sm">활성화된 프로젝트가 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { useData } from '@/context/DataProvider';
import { Briefcase, ChevronRight, Calendar, Clock, Target, Layers, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MainProjectsProps {
    onOpenProject?: (id: string) => void;
}

export function MainProjects({ onOpenProject }: MainProjectsProps) {
    const { projects, tasks } = useData();
    const activeProjects = projects.filter(p => p.status === 'active' && p.category === 'work').slice(0, 3);

    return (
        <div className="glass-premium rounded-[32px] border border-white/5 p-8 shadow-2xl h-full flex flex-col relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white tracking-widest uppercase mb-0.5">STRATEGIC OBJECTIVES</h3>
                        <p className="text-[8px] font-bold text-white/20 tracking-[0.2em] uppercase">ACTIVE MISSION PARAMETERS</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-4 relative z-10">
                {activeProjects.length > 0 ? (
                    activeProjects.map((project, idx) => {
                        const projectTasks = tasks.filter(t => t.projectId === project.id && !t.completed);
                        const nextTask = projectTasks[0];

                        return (
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={project.id}
                                onClick={() => onOpenProject?.(project.id)}
                                className="w-full text-left p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight className="w-4 h-4 text-indigo-400" />
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-sm font-black text-white tracking-wide uppercase mb-1">
                                                {project.title}
                                            </h4>
                                            <p className="text-[10px] font-bold text-white/40 line-clamp-1 uppercase tracking-wider">
                                                {project.description || 'NO ADDITIONAL DATA'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3 text-indigo-400/60" />
                                            <span className="text-[9px] font-black text-white/40 tracking-widest uppercase">
                                                {project.startDate && project.endDate ? (
                                                    `${format(new Date(project.startDate), 'MM.dd')} - ${format(new Date(project.endDate), 'MM.dd')}`
                                                ) : 'PERIOD UNDEFINED'}
                                            </span>
                                        </div>
                                        {nextTask && (
                                            <div className="flex items-center gap-2 text-indigo-400">
                                                <Target className="w-3 h-3 animate-pulse" />
                                                <span className="text-[9px] font-black tracking-widest uppercase truncate max-w-[120px]">
                                                    NEXT: {nextTask.title}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 py-12 gap-4 border-2 border-dashed border-white/10 rounded-2xl">
                        <Briefcase className="w-12 h-12" />
                        <p className="text-[9px] font-black tracking-[0.3em] uppercase text-center">NO STRATEGIC TARGETS<br />ASSIGNED</p>
                    </div>
                )}
            </div>
        </div>
    );
}

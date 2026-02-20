import React from 'react';
import { Project } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MoreHorizontal, Calendar, Folder, AlertCircle, CheckCircle2, Clock, PlayCircle, Shield, Target, Activity, ArrowUpRight, ChevronRight, Zap, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from 'framer-motion';

interface GroupedProjectListProps {
    projects: Project[];
    onOpenProject: (id: string) => void;
    viewMode: 'grid' | 'list';
    groupBy: string;
}

export function GroupedProjectList({ projects, onOpenProject, viewMode, groupBy }: GroupedProjectListProps) {
    // Grouping Logic
    const groupedProjects = React.useMemo(() => {
        if (groupBy === 'none') return { 'ALL STRATEGIC OBJECTIVES': projects };

        return projects.reduce((acc, project) => {
            let key = 'RESOURCES_OTHER';
            if (groupBy === 'status') {
                const statusMap: Record<string, string> = { 'active': 'DEPLOYED_ACTIVE', 'completed': 'MISSION_SUCCESS', 'hold': 'OPERATIONAL_HOLD', 'preparation': 'PRE-DEPLOYMENT' };
                key = statusMap[project.status || ''] || 'STATUS_UNDEFINED';
            } else if (groupBy === 'category') {
                key = project.category === 'work' ? 'CORE_OPERATIONS' : project.category === 'personal' ? 'PERSONAL_ASSETS' : 'MISC_RESOURCES';
            } else if (groupBy === 'manager') {
                key = `COMMANDER: ${project.manager || 'UNASSIGNED'}`;
            }
            // Health grouping simplified to status-like headers

            if (!acc[key]) acc[key] = [];
            acc[key].push(project);
            return acc;
        }, {} as Record<string, Project[]>);
    }, [projects, groupBy]);

    const getHealthMetadata = (health?: string) => {
        switch (health) {
            case 'on-track': return { color: 'text-emerald-500', bg: 'bg-emerald-500/20', label: 'OPTIMAL' };
            case 'at-risk': return { color: 'text-rose-500', bg: 'bg-rose-500/20', label: 'CAUTION' };
            case 'off-track': return { color: 'text-slate-500', bg: 'bg-slate-500/20', label: 'OFF-TARGET' };
            default: return { color: 'text-white/20', bg: 'bg-white/5', label: 'PENDING' };
        }
    };

    return (
        <div className="space-y-12">
            {Object.entries(groupedProjects).map(([groupName, groupProjects], groupIdx) => (
                <div key={groupName} className="space-y-6">
                    <div className="flex items-center gap-4 px-2">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-indigo-400" />
                        </div>
                        <h3 className="text-xs font-black text-white/40 tracking-[0.3em] uppercase">
                            {groupName} <span className="ml-2 text-indigo-500">[{groupProjects.length}]</span>
                        </h3>
                        <div className="flex-1 h-px bg-gradient-to-r from-white/5 to-transparent" />
                    </div>

                    <div className={cn(
                        "grid gap-8",
                        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                    )}>
                        {groupProjects.map((project, idx) => {
                            const health = getHealthMetadata(project.health);
                            return (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: (groupIdx * 0.1) + (idx * 0.05) }}
                                >
                                    <div
                                        onClick={() => onOpenProject(project.id)}
                                        className={cn(
                                            "glass-premium rounded-[32px] border border-white/5 p-8 shadow-2xl transition-all cursor-pointer group relative overflow-hidden",
                                            "hover:border-indigo-500/30 hover:bg-white/[0.04] active:scale-[0.98]",
                                            viewMode === 'list' && "flex flex-row items-center p-6 gap-8"
                                        )}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent pointer-events-none" />

                                        {viewMode === 'grid' ? (
                                            <div className="flex flex-col gap-6 relative z-10 h-full">
                                                <div className="flex justify-between items-start">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                                        <Activity className="w-6 h-6 text-indigo-400" />
                                                    </div>
                                                    <div className={cn("px-3 py-1 rounded-full text-[8px] font-black tracking-widest flex items-center gap-2", health.bg, health.color)}>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                                        {health.label}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-lg font-black text-white tracking-widest uppercase mb-2 group-hover:text-indigo-400 transition-colors leading-tight">
                                                        {project.title}
                                                    </h4>
                                                    <p className="text-[10px] font-bold text-white/30 line-clamp-2 h-10 uppercase tracking-wider leading-relaxed">
                                                        {project.description || 'NO ADDITIONAL DATA'}
                                                    </p>
                                                </div>

                                                <div className="space-y-4 pt-6 border-t border-white/5 mt-auto">
                                                    <div className="flex justify-between items-center text-[9px] font-black tracking-widest uppercase mb-1">
                                                        <span className="text-white/20">PROGRESS</span>
                                                        <span className="text-white">{project.progress || 0}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${project.progress || 0}%` }}
                                                            className="h-full bg-gradient-to-r from-indigo-500 to-sky-400"
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2">
                                                        <div className="flex -space-x-2">
                                                            {project.members?.slice(0, 3).map((m, i) => (
                                                                <Avatar key={i} className="w-7 h-7 border-2 border-[#0A0B10] shadow-xl">
                                                                    <AvatarFallback className="text-[10px] font-black bg-white/5 text-white/60">{m[0]}</AvatarFallback>
                                                                </Avatar>
                                                            ))}
                                                            {(project.members?.length || 0) > 3 && (
                                                                <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-400 border-2 border-[#0A0B10]">
                                                                    +{project.members!.length - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-[9px] font-black text-white/40 tracking-widest uppercase flex items-center gap-2">
                                                            <Calendar className="w-3 h-3 text-indigo-400/60" />
                                                            {project.endDate ? format(new Date(project.endDate), 'MMM dd') : '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            // List View Redesign
                                            <>
                                                <div className="w-1.5 h-full absolute left-0 top-0 bg-gradient-to-b from-indigo-500 to-sky-500" />
                                                <div className="flex-1 min-w-0 flex items-center gap-8">
                                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                                        <Activity className="w-6 h-6 text-indigo-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-4 mb-2">
                                                            <h4 className="text-base font-black text-white uppercase tracking-wider truncate">{project.title}</h4>
                                                            <div className={cn("px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase", health.bg, health.color)}>
                                                                {health.label}
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest truncate">{project.description}</p>
                                                    </div>
                                                </div>

                                                <div className="w-64 hidden xl:block px-8 border-x border-white/5">
                                                    <div className="flex justify-between text-[9px] font-black tracking-widest uppercase mb-2">
                                                        <span className="text-white/20">PROGRESS</span>
                                                        <span className="text-white">{project.progress || 0}%</span>
                                                    </div>
                                                    <Progress value={project.progress || 0} className="h-1.5 bg-white/5" />
                                                </div>

                                                <div className="w-40 hidden md:flex flex-col gap-1 items-end px-4 border-r border-white/5">
                                                    <span className="text-[8px] font-black text-white/20 tracking-widest uppercase">DEADLINE</span>
                                                    <div className="flex items-center gap-2 text-[11px] font-black text-white uppercase font-mono">
                                                        <Calendar className="w-3 h-3 text-indigo-400" />
                                                        {project.endDate ? format(new Date(project.endDate), 'yyyy.MM.dd') : '-'}
                                                    </div>
                                                </div>

                                                <div className="flex -space-x-2 w-32 justify-center hidden md:flex">
                                                    {project.members?.slice(0, 3).map((m, i) => (
                                                        <Avatar key={i} className="w-8 h-8 border-2 border-[#0A0B10]">
                                                            <AvatarFallback className="font-black text-[10px] bg-white/5 text-white/40">{m[0]}</AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                </div>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} className="hover:bg-white/5 text-white/20 hover:text-white">
                                                            <MoreHorizontal className="w-5 h-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="glass-premium border-white/10 rounded-2xl p-2 w-48">
                                                        <DropdownMenuLabel className="text-[10px] font-black text-white/20 tracking-widest uppercase px-3 py-2">PROJECT OPS</DropdownMenuLabel>
                                                        <DropdownMenuItem className="rounded-xl text-[11px] font-bold uppercase tracking-wider px-3 py-2.5">
                                                            <Zap className="w-4 h-4 mr-3 text-indigo-400" /> EDIT PARAMETERS
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="rounded-xl text-[11px] font-bold uppercase tracking-wider px-3 py-2.5">
                                                            <Archive className="w-4 h-4 mr-3 text-indigo-400" /> ARCHIVE MISSION
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-white/5" />
                                                        <DropdownMenuItem className="rounded-xl text-[11px] font-bold uppercase tracking-wider px-3 py-2.5 text-rose-500 hover:text-rose-400">
                                                            <AlertCircle className="w-4 h-4 mr-3" /> TERMINATE PROJECT
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

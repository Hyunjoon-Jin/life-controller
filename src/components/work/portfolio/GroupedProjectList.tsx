import React from 'react';
import { Project } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MoreHorizontal, Calendar, AlertCircle, Activity, Zap, Archive, Shield } from 'lucide-react';
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
import { motion } from 'framer-motion';

interface GroupedProjectListProps {
    projects: Project[];
    onOpenProject: (id: string) => void;
    viewMode: 'grid' | 'list';
    groupBy: string;
}

export function GroupedProjectList({ projects, onOpenProject, viewMode, groupBy }: GroupedProjectListProps) {
    const groupedProjects = React.useMemo(() => {
        if (groupBy === 'none') return { '전체 프로젝트': projects };

        return projects.reduce((acc, project) => {
            let key = '기타';
            if (groupBy === 'status') {
                const statusMap: Record<string, string> = { 'active': '진행 중', 'completed': '완료', 'hold': '보류', 'preparation': '준비 중' };
                key = statusMap[project.status || ''] || '미분류';
            } else if (groupBy === 'category') {
                key = project.category === 'work' ? '업무' : project.category === 'personal' ? '개인' : '기타';
            } else if (groupBy === 'manager') {
                key = `담당자: ${project.manager || '미지정'}`;
            }

            if (!acc[key]) acc[key] = [];
            acc[key].push(project);
            return acc;
        }, {} as Record<string, Project[]>);
    }, [projects, groupBy]);

    const getHealthMetadata = (health?: string) => {
        switch (health) {
            case 'on-track': return { color: 'text-emerald-500', bg: 'bg-emerald-500/20', label: '정상' };
            case 'at-risk': return { color: 'text-rose-500', bg: 'bg-rose-500/20', label: '주의' };
            case 'off-track': return { color: 'text-slate-500', bg: 'bg-slate-500/20', label: '지연' };
            default: return { color: 'text-white/20', bg: 'bg-white/5', label: '대기' };
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
                        <h3 className="text-xs font-bold text-white/40 tracking-wide">
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
                                                    <div className={cn("px-3 py-1 rounded-full text-[10px] font-semibold flex items-center gap-2", health.bg, health.color)}>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                                        {health.label}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-lg font-black text-white tracking-tight mb-2 group-hover:text-indigo-400 transition-colors leading-tight">
                                                        {project.title}
                                                    </h4>
                                                    <p className="text-xs text-white/30 line-clamp-2 h-10 leading-relaxed">
                                                        {project.description || '설명 없음'}
                                                    </p>
                                                </div>

                                                <div className="space-y-4 pt-6 border-t border-white/5 mt-auto">
                                                    <div className="flex justify-between items-center text-xs font-bold tracking-wide mb-1">
                                                        <span className="text-white/30">진행률</span>
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
                                                        <div className="text-xs text-white/40 flex items-center gap-2">
                                                            <Calendar className="w-3 h-3 text-indigo-400/60" />
                                                            {project.endDate ? format(new Date(project.endDate), 'MM.dd') : '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-1.5 h-full absolute left-0 top-0 bg-gradient-to-b from-indigo-500 to-sky-500" />
                                                <div className="flex-1 min-w-0 flex items-center gap-8">
                                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                                        <Activity className="w-6 h-6 text-indigo-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-4 mb-2">
                                                            <h4 className="text-base font-black text-white truncate">{project.title}</h4>
                                                            <div className={cn("px-2 py-0.5 rounded text-[10px] font-semibold", health.bg, health.color)}>
                                                                {health.label}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-white/30 truncate">{project.description}</p>
                                                    </div>
                                                </div>

                                                <div className="w-64 hidden xl:block px-8 border-x border-white/5">
                                                    <div className="flex justify-between text-xs font-bold mb-2">
                                                        <span className="text-white/30">진행률</span>
                                                        <span className="text-white">{project.progress || 0}%</span>
                                                    </div>
                                                    <Progress value={project.progress || 0} className="h-1.5 bg-white/5" />
                                                </div>

                                                <div className="w-40 hidden md:flex flex-col gap-1 items-end px-4 border-r border-white/5">
                                                    <span className="text-[10px] font-semibold text-white/30">마감일</span>
                                                    <div className="flex items-center gap-2 text-sm font-bold text-white font-mono">
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
                                                    <DropdownMenuContent align="end" className="glass-premium border-white/10 rounded-2xl p-2 w-44">
                                                        <DropdownMenuLabel className="text-xs font-bold text-white/30 px-3 py-2">프로젝트 관리</DropdownMenuLabel>
                                                        <DropdownMenuItem className="rounded-xl text-sm px-3 py-2.5">
                                                            <Zap className="w-4 h-4 mr-3 text-indigo-400" /> 수정
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="rounded-xl text-sm px-3 py-2.5">
                                                            <Archive className="w-4 h-4 mr-3 text-indigo-400" /> 보관
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-white/5" />
                                                        <DropdownMenuItem className="rounded-xl text-sm px-3 py-2.5 text-rose-500 hover:text-rose-400">
                                                            <AlertCircle className="w-4 h-4 mr-3" /> 삭제
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

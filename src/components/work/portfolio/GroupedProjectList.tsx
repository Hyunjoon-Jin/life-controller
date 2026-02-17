import React from 'react';
import { Project } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MoreHorizontal, Calendar, Folder, AlertCircle, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
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

interface GroupedProjectListProps {
    projects: Project[];
    onOpenProject: (id: string) => void;
    viewMode: 'grid' | 'list';
    groupBy: string;
}

export function GroupedProjectList({ projects, onOpenProject, viewMode, groupBy }: GroupedProjectListProps) {
    // Grouping Logic
    const groupedProjects = React.useMemo(() => {
        if (groupBy === 'none') return { '전체 프로젝트': projects };

        return projects.reduce((acc, project) => {
            let key = '기타';
            if (groupBy === 'status') {
                const statusMap: Record<string, string> = { 'active': '진행 중', 'completed': '완료됨', 'hold': '보류', 'preparation': '준비 중' };
                key = statusMap[project.status || ''] || '상태 없음';
            } else if (groupBy === 'category') {
                key = project.category === 'work' ? '업무' : project.category === 'personal' ? '개인' : '기타';
            } else if (groupBy === 'manager') {
                key = project.manager || '미지정';
            } else if (groupBy === 'health') {
                const healthMap: Record<string, string> = { 'on-track': '🟢 정상', 'at-risk': '🔴 주의', 'off-track': '⚫ 위험' };
                key = healthMap[project.health || ''] || '⚪ 미설정';
            }

            if (!acc[key]) acc[key] = [];
            acc[key].push(project);
            return acc;
        }, {} as Record<string, Project[]>);
    }, [projects, groupBy]);

    const getHealthColor = (health?: string) => {
        switch (health) {
            case 'on-track': return 'bg-green-500';
            case 'at-risk': return 'bg-red-500';
            case 'off-track': return 'bg-gray-800';
            default: return 'bg-gray-300';
        }
    };

    return (
        <div className="space-y-8">
            {Object.entries(groupedProjects).map(([groupName, groupProjects]) => (
                <div key={groupName} className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
                        <Folder className="w-5 h-5 text-muted-foreground" />
                        {groupName}
                        <Badge variant="secondary" className="ml-2">{groupProjects.length}</Badge>
                    </h3>

                    <div className={cn(
                        "grid gap-6",
                        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                    )}>
                        {groupProjects.map(project => (
                            <Card
                                key={project.id}
                                className={cn(
                                    "transition-all cursor-pointer hover:shadow-md border-l-4",
                                    viewMode === 'list' && "flex flex-row items-center p-4 gap-4"
                                )}
                                style={{ borderLeftColor: project.color }}
                                onClick={() => onOpenProject(project.id)}
                            >
                                {viewMode === 'grid' ? (
                                    <>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <Badge variant="outline" className="mb-2 uppercase text-[10px] tracking-wider font-bold">
                                                    {project.category || 'WORK'}
                                                </Badge>
                                                <div className={`w-3 h-3 rounded-full ${getHealthColor(project.health)}`} title={`Health: ${project.health}`} />
                                            </div>
                                            <CardTitle className="text-lg font-bold line-clamp-1">{project.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4">{project.description || '설명 없음'}</p>

                                            <div className="space-y-3">
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>진척도</span>
                                                    <span>{project.progress || 0}%</span>
                                                </div>
                                                <Progress value={project.progress || 0} className="h-2" />

                                                <div className="flex items-center justify-between pt-4 border-t mt-4">
                                                    <div className="flex -space-x-2">
                                                        {project.members?.slice(0, 3).map((m, i) => (
                                                            <Avatar key={i} className="w-6 h-6 border-2 border-background">
                                                                <AvatarFallback className="text-[10px]">{m[0]}</AvatarFallback>
                                                            </Avatar>
                                                        ))}
                                                        {(project.members?.length || 0) > 3 && (
                                                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] border-2 border-background">
                                                                +{project.members!.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {project.endDate ? format(new Date(project.endDate), 'MM.dd') : '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </>
                                ) : (
                                    // List View Layout
                                    <>
                                        <div className="w-[5px] h-full" /> {/* Spacer for border */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-lg truncate">{project.title}</h4>
                                                <div className={`w-2.5 h-2.5 rounded-full ${getHealthColor(project.health)} ml-2`} />
                                                <Badge variant="outline" className="text-xs">{project.status}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{project.description}</p>
                                        </div>

                                        <div className="w-48 hidden md:block">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="font-medium">{project.progress || 0}%</span>
                                            </div>
                                            <Progress value={project.progress || 0} className="h-1.5" />
                                        </div>

                                        <div className="w-32 hidden md:flex items-center text-sm text-muted-foreground">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {project.endDate ? format(new Date(project.endDate), 'yyyy.MM.dd') : '-'}
                                        </div>

                                        <div className="flex -space-x-2 w-24 hidden md:flex">
                                            {project.members?.slice(0, 3).map((m, i) => (
                                                <Avatar key={i} className="w-8 h-8 border-2 border-background">
                                                    <AvatarFallback>{m[0]}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>편집</DropdownMenuItem>
                                                <DropdownMenuItem>보관</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">삭제</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

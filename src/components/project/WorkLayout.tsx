'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, GanttChart as GanttChartIcon, Network, Archive, FolderTree, Plus, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { useData } from '@/context/DataProvider';
import { ProjectDashboard } from './ProjectDashboard';
import { GanttChart } from './GanttChart';
import { ProjectStructure } from './ProjectStructure';
import { ArchiveSystem } from './ArchiveSystem';
import { ProjectKanban } from './ProjectKanban';
import { ProjectDialog } from './ProjectDialog';
import { WorkMainDashboard } from '@/components/work/WorkMainDashboard'; // Import
import { ProjectWiki } from './ProjectWiki';
import { ProjectOKR } from './ProjectOKR';
import { ProjectTeam } from './ProjectTeam';
import { ProjectResources } from './ProjectResources';
import { AutomationRules } from './AutomationRules';
import { FocusSounds } from './FocusSounds';
import { GlobalScratchpad } from './GlobalScratchpad';
import { TimeAnalytics } from './TimeAnalytics'; // Import
import { RetrospectiveDialog } from './RetrospectiveDialog';
import { MeetingMode } from '@/components/work/MeetingMode';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Clock, Book, RotateCw, Target, Users, Link2, Zap, Music } from 'lucide-react'; // Added Music icon
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Import Popover
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Settings, BarChart2 } from 'lucide-react';

type ViewMode = 'dashboard' | 'kanban' | 'timeline' | 'team' | 'resources' | 'automation' | 'analytics' | 'structure' | 'archive' | 'wiki' | 'okr';

export function WorkLayout() {
    const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const { projects, deleteProject } = useData();

    // Dialog State
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
    const [isMeetingModeOpen, setIsMeetingModeOpen] = useState(false);
    const [isRetrospectiveOpen, setIsRetrospectiveOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const handleCreateProject = () => {
        setEditingProject(null);
        setIsProjectDialogOpen(true);
    };

    const handleEditProject = (project: Project) => {
        setEditingProject(project);
        setIsProjectDialogOpen(true);
    };

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full text-foreground">
            {/* Sidebar - Project List */}
            <div className="md:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full">
                <div className="p-6 border-b border-gray-200 font-bold flex items-center justify-between text-lg text-primary">
                    <div className="flex items-center gap-2">
                        <FolderTree className="w-5 h-5" strokeWidth={1.5} />
                        프로젝트
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleCreateProject} className="h-8 w-8 hover:bg-primary/10 text-primary">
                        <Plus className="w-5 h-5" />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1">
                    {/* Project Tree */}
                    {projects.map(project => (
                        <div
                            key={project.id}
                            className="group relative mb-2"
                        >
                            <button
                                onClick={() => setSelectedProjectId(project.id)}
                                className={cn(
                                    "w-full text-left px-4 py-3 rounded-2xl text-sm transition-all flex items-center gap-3 pr-16",
                                    selectedProjectId === project.id
                                        ? "bg-primary text-primary-foreground shadow-md font-bold"
                                        : "text-muted-foreground hover:bg-gray-50 font-medium"
                                )}
                            >
                                <div
                                    className={cn("w-2.5 h-2.5 rounded-full ring-2 ring-white/20", selectedProjectId !== project.id && "ring-transparent")}
                                    style={{ backgroundColor: selectedProjectId === project.id ? '#ffffff' : project.color }}
                                />
                                <span className="truncate flex-1">{project.title}</span>
                            </button>

                            {/* Action Buttons (Visible on Hover) */}
                            <div className={cn(
                                "absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                                selectedProjectId === project.id ? "text-primary-foreground/80" : "text-muted-foreground"
                            )}>
                                <div
                                    onClick={(e) => { e.stopPropagation(); handleEditProject(project); }}
                                    className="p-1.5 rounded-full hover:bg-black/10 cursor-pointer transition-colors"
                                    title="수정"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </div>
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm(`'${project.title}' 프로젝트를 삭제하시겠습니까?\n포함된 모든 작업이 함께 삭제됩니다.`)) {
                                            deleteProject(project.id);
                                            if (selectedProjectId === project.id) setSelectedProjectId(null);
                                        }
                                    }}
                                    className="p-1.5 rounded-full hover:bg-red-500/20 hover:text-red-600 cursor-pointer transition-colors"
                                    title="삭제"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </div>
                    ))}
                    {projects.length === 0 && (
                        <div className="text-sm text-muted-foreground p-4 text-center">
                            프로젝트를 추가해주세요.
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-9 flex flex-col min-w-0 h-full gap-6">
                {/* Header / Tabs */}
                {selectedProject && (
                    <div className="flex gap-2 bg-white p-1.5 rounded-full shadow-sm w-full md:w-fit border border-gray-100 overflow-x-auto no-scrollbar scroll-smooth">
                        <button
                            onClick={() => setViewMode('dashboard')}
                            className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", viewMode === 'dashboard' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-gray-100")}
                        >
                            <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} /> 대시보드
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", viewMode === 'kanban' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-gray-100")}
                        >
                            <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} /> 칸반
                        </button>
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", viewMode === 'timeline' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-gray-100")}
                        >
                            <GanttChartIcon className="w-4 h-4" strokeWidth={1.5} /> 타임라인
                        </button>
                        <button
                            onClick={() => setViewMode('okr')}
                            className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", viewMode === 'okr' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-gray-100")}
                        >
                            <Target className="w-4 h-4" strokeWidth={1.5} /> 목표
                        </button>

                        <div className="w-[1px] h-4 bg-gray-200 mx-1" />

                        {/* Management Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap outline-none",
                                        ['team', 'resources', 'structure', 'archive'].includes(viewMode) ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-gray-100"
                                    )}
                                >
                                    <Settings className="w-4 h-4" strokeWidth={1.5} /> 관리 <ChevronDown className="w-3 h-3 opacity-50" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                                <DropdownMenuLabel>프로젝트 관리</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setViewMode('team')} className="gap-2">
                                    <Users className="w-4 h-4" /> 팀/멤버
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setViewMode('resources')} className="gap-2">
                                    <Link2 className="w-4 h-4" /> 리소스
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setViewMode('structure')} className="gap-2">
                                    <Network className="w-4 h-4" /> 구조 (WBS)
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setViewMode('archive')} className="gap-2 text-muted-foreground">
                                    <Archive className="w-4 h-4" /> 아카이브
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Tools/Analytics Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap outline-none",
                                        ['automation', 'analytics'].includes(viewMode) ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-gray-100"
                                    )}
                                >
                                    <BarChart2 className="w-4 h-4" strokeWidth={1.5} /> 도구 <ChevronDown className="w-3 h-3 opacity-50" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                                <DropdownMenuLabel>도구 및 분석</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setViewMode('automation')} className="gap-2">
                                    <Zap className="w-4 h-4" /> 자동화 규칙
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setViewMode('analytics')} className="gap-2">
                                    <Clock className="w-4 h-4" /> 시간/진척도 분석
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Tools Divider & Buttons */}
                        <div className="w-[1px] h-6 bg-gray-200 mx-2" />

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2 bg-background/50 backdrop-blur-sm border-dashed">
                                    <Music className="w-4 h-4 text-pink-500" />
                                    <span className="hidden md:inline">Focus Sounds</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" align="end">
                                <FocusSounds />
                            </PopoverContent>
                        </Popover>

                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 rounded-full border-dashed border-gray-300 hover:border-primary hover:text-primary hover:bg-primary/5"
                            onClick={() => setIsMeetingModeOpen(true)}
                        >
                            <Clock className="w-4 h-4" /> 회의 모드
                        </Button>
                    </div>
                )}

                {/* Meeting Mode Overlay */}
                {isMeetingModeOpen && selectedProject && (
                    <MeetingMode
                        project={selectedProject}
                        onClose={() => setIsMeetingModeOpen(false)}
                    />
                )}

                {/* Content View */}
                <div className="flex-1 p-6 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-y-auto custom-scrollbar relative">
                    {!selectedProject ? (
                        <div className="h-full">
                            <WorkMainDashboard onOpenProject={setSelectedProjectId} />
                        </div>
                    ) : (
                        <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                            {viewMode === 'dashboard' && <ProjectDashboard project={selectedProject} />}
                            {viewMode === 'kanban' && <ProjectKanban project={selectedProject} />}
                            {viewMode === 'timeline' && <GanttChart project={selectedProject} />}
                            {viewMode === 'okr' && <ProjectOKR project={selectedProject} />}
                            {viewMode === 'team' && <ProjectTeam project={selectedProject} />}
                            {viewMode === 'resources' && <ProjectResources project={selectedProject} />}
                            {viewMode === 'automation' && <AutomationRules project={selectedProject} />}
                            {viewMode === 'analytics' && <TimeAnalytics project={selectedProject} />}
                            {viewMode === 'structure' && <ProjectStructure />}
                            {viewMode === 'archive' && <ArchiveSystem project={selectedProject} />}
                        </div>
                    )}
                </div>
            </div>

            {/* Project Create/Edit Dialog */}
            <ProjectDialog
                isOpen={isProjectDialogOpen}
                onOpenChange={setIsProjectDialogOpen}
                projectToEdit={editingProject}
            />

            {/* Global Features */}
            <GlobalScratchpad />
        </div>
    );
}

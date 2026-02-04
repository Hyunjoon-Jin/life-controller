'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, GanttChart as GanttChartIcon, FolderTree, Plus, Users, Clock, LayoutTemplate, Briefcase, Calendar as CalendarIcon, Edit2, Trash2, Settings, Archive, BarChart2, Link2, Zap, Music, Target } from 'lucide-react';
import { useData } from '@/context/DataProvider';
import { ProjectDashboard } from './ProjectDashboard';
import { GanttChart } from './GanttChart';
import { ProjectDialog } from './ProjectDialog';
import { WorkMainDashboard } from '@/components/work/WorkMainDashboard';
import { TimeAnalytics } from './TimeAnalytics';
import { GlobalScratchpad } from './GlobalScratchpad';
import { FocusSounds } from './FocusSounds';
import { MeetingMode } from '@/components/work/MeetingMode';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// New Imports
import { WorkPeopleSection } from './WorkPeopleSection';
import { WorkTemplateSection } from './WorkTemplateSection';
import { ProjectKanban } from './ProjectKanban'; // Keep for sub-navigation or inside Project?
// We will use ProjectDashboard for 'Project Mgmt' tab, but maybe toggle inside?

type ViewMode = 'schedule' | 'project' | 'personnel' | 'workhours' | 'templates';

export function WorkLayout() {
    const [viewMode, setViewMode] = useState<ViewMode>('project'); // Default to Project Dashboard
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const { projects, deleteProject } = useData();

    // Dialog State
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
    const [isMeetingModeOpen, setIsMeetingModeOpen] = useState(false);
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
                            onClick={() => setViewMode('project')}
                            className={cn("flex items-center gap-2 px-3 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", viewMode === 'project' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-gray-100")}
                        >
                            <LayoutDashboard className="w-4 h-4" /> 프로젝트 관리
                        </button>
                        <button
                            onClick={() => setViewMode('schedule')}
                            className={cn("flex items-center gap-2 px-3 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", viewMode === 'schedule' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-gray-100")}
                        >
                            <CalendarIcon className="w-4 h-4" /> 일정 관리
                        </button>
                        <button
                            onClick={() => setViewMode('personnel')}
                            className={cn("flex items-center gap-2 px-3 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", viewMode === 'personnel' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-gray-100")}
                        >
                            <Users className="w-4 h-4" /> 인력 관리
                        </button>
                        <button
                            onClick={() => setViewMode('workhours')}
                            className={cn("flex items-center gap-2 px-3 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", viewMode === 'workhours' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-gray-100")}
                        >
                            <Clock className="w-4 h-4" /> 근태 관리
                        </button>
                        <button
                            onClick={() => setViewMode('templates')}
                            className={cn("flex items-center gap-2 px-3 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap", viewMode === 'templates' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-gray-100")}
                        >
                            <LayoutTemplate className="w-4 h-4" /> 템플릿
                        </button>


                        {/* Divider & Tools */}
                        <div className="w-[1px] h-6 bg-gray-200 mx-1" />

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full border-dashed border-gray-300 hover:border-pink-500 hover:text-pink-500" title="Focus Sounds">
                                    <Music className="w-4 h-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" align="end">
                                <FocusSounds />
                            </PopoverContent>
                        </Popover>

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full border-dashed border-gray-300 hover:border-primary hover:text-primary hover:bg-primary/5"
                            onClick={() => setIsMeetingModeOpen(true)}
                            title="회의 모드"
                        >
                            <Clock className="w-4 h-4" />
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
                    {!selectedProjectId ? (
                        <div className="h-full">
                            <WorkMainDashboard onOpenProject={setSelectedProjectId} />
                        </div>
                    ) : selectedProject ? (
                        <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                            {viewMode === 'project' && <ProjectDashboard project={selectedProject} />}
                            {viewMode === 'schedule' && <GanttChart project={selectedProject} />}
                            {viewMode === 'personnel' && <WorkPeopleSection project={selectedProject} />}
                            {viewMode === 'workhours' && <TimeAnalytics project={selectedProject} />}
                            {viewMode === 'templates' && <WorkTemplateSection />}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            프로젝트를 찾을 수 없습니다.
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

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, GanttChart as GanttChartIcon, Network, Archive, FolderTree, Plus, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { useData } from '@/context/DataProvider';
import { ProjectDashboard } from './ProjectDashboard';
import { GanttChart } from './GanttChart';
import { ProjectStructure } from './ProjectStructure';
import { ArchiveSystem } from './ArchiveSystem';
import { ProjectDialog } from './ProjectDialog';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';

type ViewMode = 'dashboard' | 'timeline' | 'structure' | 'archive';

export function WorkLayout() {
    const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const { projects, deleteProject } = useData();

    // Dialog State
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
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
                            className={cn("flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap", viewMode === 'dashboard' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50")}
                        >
                            <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} /> 대시보드
                        </button>
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={cn("flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap", viewMode === 'timeline' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50")}
                        >
                            <GanttChartIcon className="w-4 h-4" strokeWidth={1.5} /> 타임라인
                        </button>
                        <button
                            onClick={() => setViewMode('structure')}
                            className={cn("flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap", viewMode === 'structure' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50")}
                        >
                            <Network className="w-4 h-4" strokeWidth={1.5} /> 계층 구조
                        </button>
                        <button
                            onClick={() => setViewMode('archive')}
                            className={cn("flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap", viewMode === 'archive' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-gray-50")}
                        >
                            <Archive className="w-4 h-4" strokeWidth={1.5} /> 아카이브
                        </button>
                    </div>
                )}

                {/* Content View */}
                <div className="flex-1 p-6 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-y-auto custom-scrollbar relative">
                    {!selectedProject ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                            <FolderTree className="w-16 h-16 mb-4 opacity-20" strokeWidth={1} />
                            <p className="text-lg font-medium">프로젝트를 선택하여 작업을 시작하세요</p>
                            <p className="text-sm">왼쪽 목록에서 프로젝트를 클릭하세요.</p>
                        </div>
                    ) : (
                        <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                            {viewMode === 'dashboard' && <ProjectDashboard project={selectedProject} />}
                            {viewMode === 'timeline' && <GanttChart project={selectedProject} />}
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
        </div>
    );
}

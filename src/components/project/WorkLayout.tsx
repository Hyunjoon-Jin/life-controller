'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, GanttChart as GanttChartIcon, FolderTree, Plus, Users, Clock, LayoutTemplate, Briefcase, Calendar as CalendarIcon, Edit2, Trash2, Settings, Archive, BarChart2, Link2, Zap, Music, Target, ArrowRight } from 'lucide-react';
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

export function WorkLayout({ viewMode: propViewMode }: { viewMode?: ViewMode }) {
    const [localViewMode, setLocalViewMode] = useState<ViewMode>('project');
    const { projects, deleteProject, selectedWorkProjectId, setSelectedWorkProjectId } = useData();

    // specific view mode to use
    const activeViewMode = propViewMode || localViewMode;

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

    const selectedProject = projects.find(p => p.id === selectedWorkProjectId);

    return (
        <div className="h-full flex flex-col text-foreground">
            {/* Main Content Area */}
            <div className="flex-1 h-full min-w-0 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {!selectedWorkProjectId ? (
                    <WorkMainDashboard
                        onOpenProject={setSelectedWorkProjectId}
                        viewMode={activeViewMode === 'schedule' || activeViewMode === 'project' ? activeViewMode : 'schedule'}
                    />
                ) : selectedProject ? (
                    <div className="h-full flex flex-col">
                        {/* Project Header / Navigation */}
                        <div className="flex items-center gap-4 p-4 border-b bg-white shrink-0">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedWorkProjectId(null)}>
                                <ArrowRight className="w-5 h-5 rotate-180" />
                            </Button>
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedProject.color }} />
                                    {selectedProject.title}
                                </h2>
                            </div>

                            {/* Project Tabs - Only show if NO prop driven view mode is passed (legacy behavior) OR if we always want to show? 
                                User asked to "keep only Project Management content" in Project Management tab.
                                If we are in 'projects' tab (propViewMode='project'), and we hide tabs, we validly restrict content.
                                If we are in 'calendar' tab (propViewMode='schedule'), we validly restrict content.
                            */}
                            {/* Project Tabs - Removed as per user request to only show Dashboard in this view */}
                            {/* {!propViewMode && ( ... )} */}

                            <div className="ml-auto flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditProject(selectedProject)}>
                                    <Edit2 className="w-4 h-4 mr-2" /> 설정
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setIsMeetingModeOpen(true)}>
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                </Button>
                            </div>
                        </div>

                        {/* Project Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                            {activeViewMode === 'project' && <ProjectDashboard project={selectedProject} />}
                            {activeViewMode === 'schedule' && <GanttChart project={selectedProject} />}
                            {activeViewMode === 'personnel' && <WorkPeopleSection project={selectedProject} />}
                            {activeViewMode === 'workhours' && <TimeAnalytics project={selectedProject} />}
                            {activeViewMode === 'templates' && <WorkTemplateSection />}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <p>프로젝트를 찾을 수 없습니다.</p>
                        <Button variant="link" onClick={() => setSelectedWorkProjectId(null)}>목록으로 돌아가기</Button>
                    </div>
                )}
            </div>

            {/* Project Create/Edit Dialog */}
            <ProjectDialog
                isOpen={isProjectDialogOpen}
                onOpenChange={setIsProjectDialogOpen}
                projectToEdit={editingProject}
            />

            {/* Meeting Mode Overlay */}
            {isMeetingModeOpen && selectedProject && (
                <MeetingMode
                    project={selectedProject}
                    onClose={() => setIsMeetingModeOpen(false)}
                />
            )}

            {/* Global Features */}
            <GlobalScratchpad />
        </div>
    );
}

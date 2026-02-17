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
import { CommandPalette } from '@/components/work/CommandPalette';
import { MeetingMode } from '@/components/work/MeetingMode';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { WorkHeader } from '@/components/work/WorkHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { ZenMode } from '@/components/work/ZenMode';

// New Imports
import { WorkPeopleSection } from './WorkPeopleSection';
import { WorkTemplateSection } from './WorkTemplateSection';
import { WorkSidebar } from '@/components/work/WorkSidebar';
import { ProjectKanban } from './ProjectKanban';
import { ProjectWiki } from './tabs/ProjectWiki';
import { ResourceLibrary } from './tabs/ResourceLibrary';
import { ProjectRisks } from './tabs/ProjectRisks';
import { ProjectStakeholders } from './tabs/ProjectStakeholders';
import { ProjectMilestones } from './tabs/ProjectMilestones';
import { ProjectBudget } from './tabs/ProjectBudget';
import { ProjectRetrospective } from './tabs/ProjectRetrospective';

type ViewMode = 'schedule' | 'project' | 'personnel' | 'workhours' | 'templates' | 'wiki' | 'resources' | 'risks' | 'stakeholders' | 'milestones' | 'budget' | 'retrospective';

export function WorkLayout({ viewMode: propViewMode }: { viewMode?: ViewMode }) {
    const [localViewMode, setLocalViewMode] = useState<ViewMode>('schedule');
    const { projects, deleteProject, selectedWorkProjectId, setSelectedWorkProjectId, goals } = useData();

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

    // Focus Mode State
    const [isFocusMode, setIsFocusMode] = useState(false);

    return (
        <div className={cn(
            "h-full flex text-foreground w-full transition-all duration-500",
            isFocusMode ? "fixed inset-0 z-[100] bg-[#0f1012] overflow-y-auto p-4" : "max-w-7xl mx-auto flex-row gap-0" // Changed to flex-row for sidebar
        )}>
            {/* Smart Sidebar */}
            {!isFocusMode && (
                <WorkSidebar
                    className="hidden md:flex rounded-l-3xl my-6 ml-6 h-[calc(100%-48px)]"
                    currentView={activeViewMode}
                    onViewChange={setLocalViewMode}
                />
            )}

            <div className={cn(
                "flex-1 flex flex-col min-w-0 transition-all duration-500",
                !isFocusMode && "p-6" // Add padding to wrapper instead of container
            )}>
                {!isFocusMode && (
                    <WorkHeader
                        isFocusMode={isFocusMode}
                        onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
                        onOpenMeetingMode={() => setIsMeetingModeOpen(true)}
                    />
                )}

                {/* Main Content Area */}
                <div className={cn(
                    "flex-1 min-w-0 transition-all duration-500 overflow-hidden",
                    isFocusMode
                        ? "rounded-none bg-[#0f172a] text-gray-100 fixed inset-0 z-[100]" // Full screen override
                        : "bg-white rounded-3xl shadow-sm border border-gray-100 h-full"
                )}>
                    <AnimatePresence mode="wait">
                        {isFocusMode ? (
                            <ZenMode key="zen-mode" onExit={() => setIsFocusMode(false)} />
                        ) : (
                            <motion.div
                                key={selectedWorkProjectId ? 'project' : 'dashboard'}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="h-full"
                            >
                                {!selectedWorkProjectId ? (
                                    <WorkMainDashboard
                                        onOpenProject={setSelectedWorkProjectId}
                                        viewMode={activeViewMode === 'schedule' || activeViewMode === 'project' ? activeViewMode : 'schedule'}
                                    />
                                ) : selectedProject ? (
                                    <div className="h-full flex flex-col">
                                        {/* WorkHeader handles top bar, but we needed project nav maybe? 
                                        Actually Sidebar now handles context switching.
                                        We might want to remove the redundant Project Header inside here if Sidebar does it.
                                        But Sidebar is left-nav. Top header usually shows specific project tools or breadcrumbs.
                                        Let's keep the inner header for now but simplify it later if needed.
                                    */}
                                        <div className={cn(
                                            "flex items-center gap-4 p-4 border-b shrink-0 transition-colors",
                                            "bg-white border-gray-100"
                                        )}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedProject.color }} />
                                                <h2 className="text-xl font-bold">{selectedProject.title}</h2>
                                                {selectedProject.connectedGoalId && (
                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium border border-indigo-100 ml-2">
                                                        <Target className="w-3 h-3" />
                                                        {goals.find(g => g.id === selectedProject.connectedGoalId)?.title || 'Unknown Goal'}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="ml-auto flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setIsMeetingModeOpen(true)}
                                                >
                                                    <Zap className="w-4 h-4 text-yellow-500 mr-2" /> 미팅 모드
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditProject(selectedProject)}
                                                >
                                                    <Settings className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Project Content */}
                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                            {activeViewMode === 'project' && <ProjectDashboard project={selectedProject} />}
                                            {activeViewMode === 'schedule' && (
                                                <>
                                                    <div className="hidden md:block h-full">
                                                        <GanttChart project={selectedProject} />
                                                    </div>
                                                    <div className="md:hidden flex flex-col items-center justify-center h-[50vh] text-center p-6 space-y-4 text-muted-foreground">
                                                        <LayoutDashboard className="w-12 h-12 opacity-20" />
                                                        <div>
                                                            <p className="font-semibold">모바일에서는 간트 차트를 지원하지 않습니다.</p>
                                                            <p className="text-xs mt-1">PC 환경에서 접속하거나 프로젝트 대시보드를 이용해 주세요.</p>
                                                        </div>
                                                        <Button variant="outline" size="sm" onClick={() => setLocalViewMode('project')}>
                                                            프로젝트 대시보드로 이동
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                            {activeViewMode === 'personnel' && <WorkPeopleSection project={selectedProject} />}
                                            {activeViewMode === 'workhours' && <TimeAnalytics project={selectedProject} />}
                                            {activeViewMode === 'templates' && <WorkTemplateSection />}


                                            {activeViewMode === 'wiki' && <ProjectWiki project={selectedProject} />}
                                            {activeViewMode === 'resources' && <ResourceLibrary project={selectedProject} />}
                                            {activeViewMode === 'risks' && <ProjectRisks project={selectedProject} />}
                                            {activeViewMode === 'stakeholders' && <ProjectStakeholders project={selectedProject} />}
                                            {activeViewMode === 'milestones' && <ProjectMilestones project={selectedProject} />}
                                            {activeViewMode === 'budget' && <ProjectBudget project={selectedProject} />}
                                            {activeViewMode === 'retrospective' && <ProjectRetrospective project={selectedProject} />}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                        <p>프로젝트를 찾을 수 없습니다.</p>
                                        <Button variant="link" onClick={() => setSelectedWorkProjectId(null)}>목록으로 돌아가기</Button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Project Create/Edit Dialog */}
            <ProjectDialog
                isOpen={isProjectDialogOpen}
                onOpenChange={setIsProjectDialogOpen}
                projectToEdit={editingProject}
            />

            {/* Meeting Mode Overlay */}
            {isMeetingModeOpen && (
                <MeetingMode
                    project={selectedProject}
                    onClose={() => setIsMeetingModeOpen(false)}
                />
            )}

            {/* Global Features */}
            <GlobalScratchpad triggerVisible={!isFocusMode} />
            {!isFocusMode && <CommandPalette />}
        </div>
    );
}

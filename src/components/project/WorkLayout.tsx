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
import { WorkHeader } from '@/components/work/WorkHeader';
import { motion, AnimatePresence } from 'framer-motion';

// New Imports
import { WorkPeopleSection } from './WorkPeopleSection';
import { WorkTemplateSection } from './WorkTemplateSection';
import { ProjectKanban } from './ProjectKanban'; // Keep for sub-navigation or inside Project?
// We will use ProjectDashboard for 'Project Mgmt' tab, but maybe toggle inside?

type ViewMode = 'schedule' | 'project' | 'personnel' | 'workhours' | 'templates';

export function WorkLayout({ viewMode: propViewMode }: { viewMode?: ViewMode }) {
    const [localViewMode, setLocalViewMode] = useState<ViewMode>('schedule');
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

    // Focus Mode State
    const [isFocusMode, setIsFocusMode] = useState(false);

    return (
        <div className={cn(
            "h-full flex flex-col text-foreground w-full transition-all duration-500",
            isFocusMode ? "fixed inset-0 z-40 bg-[#0f1012]" : "max-w-7xl mx-auto"
        )}>
            <WorkHeader
                isFocusMode={isFocusMode}
                onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
            />

            {/* Main Content Area */}
            <div className={cn(
                "flex-1 min-w-0 transition-all duration-500 overflow-hidden",
                isFocusMode
                    ? "rounded-none border-none bg-transparent container mx-auto"
                    : "bg-white rounded-3xl shadow-sm border border-gray-100 h-full"
            )}>
                <AnimatePresence mode="wait">
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
                                {/* Project Header / Navigation */}
                                <div className={cn(
                                    "flex items-center gap-4 p-4 border-b shrink-0 transition-colors",
                                    isFocusMode ? "bg-transparent border-white/10 text-white" : "bg-white border-gray-100"
                                )}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedWorkProjectId(null)}
                                        className={isFocusMode ? "text-gray-300 hover:text-white hover:bg-white/10" : ""}
                                    >
                                        <ArrowRight className="w-5 h-5 rotate-180" />
                                    </Button>
                                    <div>
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedProject.color }} />
                                            {selectedProject.title}
                                        </h2>
                                    </div>

                                    <div className="ml-auto flex gap-2">
                                        <Button
                                            variant={isFocusMode ? "ghost" : "outline"}
                                            size="sm"
                                            onClick={() => handleEditProject(selectedProject)}
                                            className={isFocusMode ? "text-gray-300 hover:text-white hover:bg-white/10" : ""}
                                        >
                                            <Edit2 className="w-4 h-4 mr-2" /> 설정
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsMeetingModeOpen(true)}
                                            className={isFocusMode ? "text-gray-300 hover:text-white hover:bg-white/10" : ""}
                                        >
                                            <Zap className="w-4 h-4 text-yellow-500" />
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
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <p>프로젝트를 찾을 수 없습니다.</p>
                                <Button variant="link" onClick={() => setSelectedWorkProjectId(null)}>목록으로 돌아가기</Button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
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
            {!isFocusMode && <GlobalScratchpad />}
        </div>
    );
}

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Zap, Settings, ArrowLeft, Target, LayoutDashboard, CheckSquare, Calendar, Users, Flag, BookOpen, FolderOpen, AlertTriangle, DollarSign, RotateCcw, MoreHorizontal } from 'lucide-react';
import { useData } from '@/context/DataProvider';
import { ProjectDashboard } from './ProjectDashboard';
import { GanttChart } from './GanttChart';
import { ProjectDialog } from './ProjectDialog';
import { WorkMainDashboard } from '@/components/work/WorkMainDashboard';
import { TimeAnalytics } from './TimeAnalytics';
import { GlobalScratchpad } from './GlobalScratchpad';
import { CommandPalette } from '@/components/work/CommandPalette';
import { MeetingMode } from '@/components/work/MeetingMode';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { WorkHeader } from '@/components/work/WorkHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { ZenMode } from '@/components/work/ZenMode';
import { WorkPeopleSection } from '@/components/work/sections/WorkPeopleSection';
import { ProjectKanban } from './ProjectKanban';
import { ProjectWiki } from './tabs/ProjectWiki';
import { ResourceLibrary } from './tabs/ResourceLibrary';
import { ProjectRisks } from './tabs/ProjectRisks';
import { ProjectStakeholders } from './tabs/ProjectStakeholders';
import { ProjectMilestones } from './tabs/ProjectMilestones';
import { ProjectBudget } from './tabs/ProjectBudget';
import { ProjectRetrospective } from './tabs/ProjectRetrospective';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

type DashboardViewMode = 'schedule' | 'project';

// Primary tabs visible in the project tab bar
type ProjectTab =
    | 'overview'      // 현황 대시보드
    | 'kanban'        // 할 일 (Task Board)
    | 'schedule'      // 일정 (Gantt)
    | 'team'          // 팀원 & 소통
    | 'milestones'    // 마일스톤
    | 'wiki'          // 위키
    | 'resources'     // 자료
    | 'risks'         // 리스크
    | 'stakeholders'  // 이해관계자
    | 'budget'        // 예산
    | 'workhours'     // 업무 시간
    | 'retrospective';// 회고

const PRIMARY_TABS: { id: ProjectTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview',    label: '현황',     icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'kanban',      label: '할 일',    icon: <CheckSquare className="w-3.5 h-3.5" /> },
    { id: 'schedule',    label: '일정',     icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'team',        label: '팀원',     icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'milestones',  label: '마일스톤', icon: <Flag className="w-3.5 h-3.5" /> },
];

const MORE_TABS: { id: ProjectTab; label: string; icon: React.ReactNode }[] = [
    { id: 'wiki',          label: '위키',       icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'resources',     label: '자료',       icon: <FolderOpen className="w-3.5 h-3.5" /> },
    { id: 'risks',         label: '리스크',     icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { id: 'stakeholders',  label: '이해관계자', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'budget',        label: '예산',       icon: <DollarSign className="w-3.5 h-3.5" /> },
    { id: 'workhours',     label: '업무 시간',  icon: <Target className="w-3.5 h-3.5" /> },
    { id: 'retrospective', label: '회고',       icon: <RotateCcw className="w-3.5 h-3.5" /> },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    active:      { label: '진행 중',  color: 'text-blue-400',   bg: 'bg-blue-500/15 border-blue-500/30' },
    preparation: { label: '준비 중',  color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/30' },
    hold:        { label: '보류됨',   color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30' },
    completed:   { label: '완료됨',   color: 'text-green-400',  bg: 'bg-green-500/15 border-green-500/30' },
};

export function WorkLayout({ viewMode: propViewMode }: { viewMode?: DashboardViewMode }) {
    const [localDashboardMode, setLocalDashboardMode] = useState<DashboardViewMode>('schedule');
    const { projects, goals, selectedWorkProjectId, setSelectedWorkProjectId } = useData();

    const activeDashboardMode = propViewMode || localDashboardMode;

    // Dialog State
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
    const [isMeetingModeOpen, setIsMeetingModeOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    // Project-level tab state (independent from dashboard view)
    const [projectTab, setProjectTab] = useState<ProjectTab>('overview');

    const handleEditProject = (project: Project) => {
        setEditingProject(project);
        setIsProjectDialogOpen(true);
    };

    // When opening a project, default to 'overview' tab
    const handleOpenProject = (id: string) => {
        setProjectTab('overview');
        setSelectedWorkProjectId(id);
    };

    const selectedProject = projects.find(p => p.id === selectedWorkProjectId);

    // Focus Mode State
    const [isFocusMode, setIsFocusMode] = useState(false);

    // D-Day & status for header
    const dDay = selectedProject?.endDate
        ? differenceInDays(new Date(selectedProject.endDate), new Date())
        : null;
    const statusCfg = STATUS_CONFIG[selectedProject?.status || ''] || STATUS_CONFIG['preparation'];

    // Determine if current tab is in "more"
    const isMoreTab = MORE_TABS.some(t => t.id === projectTab);

    return (
        <div className={cn(
            "h-full flex text-foreground w-full transition-all duration-500",
            isFocusMode
                ? "fixed inset-0 z-[100] bg-[#0f1012] overflow-y-auto p-4"
                : "max-w-7xl mx-auto flex-col gap-0"
        )}>
            <div className={cn(
                "flex-1 flex flex-col min-w-0 transition-all duration-500",
                !isFocusMode && "p-6"
            )}>
                {!isFocusMode && (
                    <WorkHeader
                        isFocusMode={isFocusMode}
                        onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
                        onOpenMeetingMode={() => setIsMeetingModeOpen(true)}
                    />
                )}

                {/* Main Content */}
                <div className={cn(
                    "flex-1 min-w-0 transition-all duration-500 overflow-hidden",
                    isFocusMode
                        ? "rounded-none bg-[#0f172a] text-gray-100 fixed inset-0 z-[100]"
                        : "bg-card/50 backdrop-blur-xl rounded-xl border border-white/10 h-full"
                )}>
                    <AnimatePresence mode="wait">
                        {isFocusMode ? (
                            <ZenMode key="zen-mode" onExit={() => setIsFocusMode(false)} />
                        ) : !selectedWorkProjectId ? (
                            /* ── Portfolio / Dashboard view ── */
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                                className="h-full"
                            >
                                <WorkMainDashboard
                                    onOpenProject={handleOpenProject}
                                    viewMode={activeDashboardMode}
                                />
                            </motion.div>
                        ) : selectedProject ? (
                            /* ── Project Detail view ── */
                            <motion.div
                                key={`project-${selectedProject.id}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                                className="h-full flex flex-col"
                            >
                                {/* ── Project Header ── */}
                                <div className="shrink-0 border-b border-white/10 bg-card/80">
                                    {/* Top row: breadcrumb + project title + actions */}
                                    <div className="flex items-center gap-3 px-5 pt-4 pb-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-muted-foreground hover:text-foreground -ml-1"
                                            onClick={() => setSelectedWorkProjectId(null)}
                                        >
                                            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                                            전체
                                        </Button>
                                        <span className="text-muted-foreground/40">/</span>

                                        {/* Project identity */}
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div
                                                className="w-3.5 h-3.5 rounded-sm shrink-0"
                                                style={{ backgroundColor: selectedProject.color }}
                                            />
                                            <h2 className="text-base font-semibold truncate">{selectedProject.title}</h2>
                                        </div>

                                        {/* Status badge */}
                                        <span className={cn(
                                            "text-xs font-medium px-2 py-0.5 rounded-full border shrink-0",
                                            statusCfg.color, statusCfg.bg
                                        )}>
                                            {statusCfg.label}
                                        </span>

                                        {/* D-Day */}
                                        {dDay !== null && (
                                            <span className="text-xs text-muted-foreground shrink-0">
                                                {dDay < 0 ? `D+${Math.abs(dDay)}` : dDay === 0 ? 'D-Day' : `D-${dDay}`}
                                            </span>
                                        )}

                                        {/* Connected goal */}
                                        {selectedProject.connectedGoalId && (
                                            <div className="hidden md:flex items-center gap-1 px-2 py-0.5 bg-indigo-500/15 text-indigo-400 rounded-full text-xs border border-indigo-500/25 shrink-0">
                                                <Target className="w-3 h-3" />
                                                {goals.find(g => g.id === selectedProject.connectedGoalId)?.title}
                                            </div>
                                        )}

                                        <div className="ml-auto flex items-center gap-1.5 shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                                onClick={() => setIsMeetingModeOpen(true)}
                                            >
                                                <Zap className="w-3.5 h-3.5 mr-1.5 text-yellow-500" />
                                                미팅 모드
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                                onClick={() => handleEditProject(selectedProject)}
                                            >
                                                <Settings className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* ── Tab Bar ── */}
                                    <div className="flex items-center gap-0.5 px-4 pb-0 overflow-x-auto no-scrollbar">
                                        {PRIMARY_TABS.map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setProjectTab(tab.id)}
                                                className={cn(
                                                    "flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium rounded-t-md transition-all whitespace-nowrap border-b-2 -mb-px",
                                                    projectTab === tab.id
                                                        ? "text-foreground border-primary bg-background/50"
                                                        : "text-muted-foreground border-transparent hover:text-foreground hover:bg-white/5"
                                                )}
                                            >
                                                {tab.icon}
                                                {tab.label}
                                            </button>
                                        ))}

                                        {/* More tabs dropdown */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className={cn(
                                                    "flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium rounded-t-md transition-all whitespace-nowrap border-b-2 -mb-px",
                                                    isMoreTab
                                                        ? "text-foreground border-primary bg-background/50"
                                                        : "text-muted-foreground border-transparent hover:text-foreground hover:bg-white/5"
                                                )}>
                                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                                    {isMoreTab
                                                        ? MORE_TABS.find(t => t.id === projectTab)?.label
                                                        : '더보기'}
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-44">
                                                {MORE_TABS.map(tab => (
                                                    <DropdownMenuItem
                                                        key={tab.id}
                                                        onClick={() => setProjectTab(tab.id)}
                                                        className={cn(
                                                            "gap-2 text-xs",
                                                            projectTab === tab.id && "bg-accent"
                                                        )}
                                                    >
                                                        {tab.icon}
                                                        {tab.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* ── Tab Content ── */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={projectTab}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.18 }}
                                            className="h-full"
                                        >
                                            {projectTab === 'overview' && (
                                                <div className="p-6">
                                                    <ProjectDashboard project={selectedProject} />
                                                </div>
                                            )}
                                            {projectTab === 'kanban' && (
                                                <div className="h-full p-4">
                                                    <ProjectKanban project={selectedProject} />
                                                </div>
                                            )}
                                            {projectTab === 'schedule' && (
                                                <>
                                                    <div className="hidden md:block h-full p-4">
                                                        <GanttChart project={selectedProject} />
                                                    </div>
                                                    <div className="md:hidden flex flex-col items-center justify-center h-[50vh] text-center p-6 space-y-3 text-muted-foreground">
                                                        <Calendar className="w-10 h-10 opacity-20" />
                                                        <p className="text-sm font-medium">모바일에서는 간트 차트를 지원하지 않습니다.</p>
                                                        <Button variant="outline" size="sm" onClick={() => setProjectTab('kanban')}>
                                                            할 일 보드로 이동
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                            {projectTab === 'team' && (
                                                <div className="p-6">
                                                    <WorkPeopleSection />
                                                </div>
                                            )}
                                            {projectTab === 'milestones' && (
                                                <div className="p-6">
                                                    <ProjectMilestones project={selectedProject} />
                                                </div>
                                            )}
                                            {projectTab === 'wiki' && (
                                                <div className="p-6">
                                                    <ProjectWiki project={selectedProject} />
                                                </div>
                                            )}
                                            {projectTab === 'resources' && (
                                                <div className="p-6">
                                                    <ResourceLibrary project={selectedProject} />
                                                </div>
                                            )}
                                            {projectTab === 'risks' && (
                                                <div className="p-6">
                                                    <ProjectRisks project={selectedProject} />
                                                </div>
                                            )}
                                            {projectTab === 'stakeholders' && (
                                                <div className="p-6">
                                                    <ProjectStakeholders project={selectedProject} />
                                                </div>
                                            )}
                                            {projectTab === 'budget' && (
                                                <div className="p-6">
                                                    <ProjectBudget project={selectedProject} />
                                                </div>
                                            )}
                                            {projectTab === 'workhours' && (
                                                <div className="p-6">
                                                    <TimeAnalytics project={selectedProject} />
                                                </div>
                                            )}
                                            {projectTab === 'retrospective' && (
                                                <div className="p-6">
                                                    <ProjectRetrospective project={selectedProject} />
                                                </div>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ) : (
                            /* Project not found */
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                                <p>프로젝트를 찾을 수 없습니다.</p>
                                <Button variant="outline" size="sm" onClick={() => setSelectedWorkProjectId(null)}>
                                    목록으로
                                </Button>
                            </div>
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

            <GlobalScratchpad triggerVisible={!isFocusMode} />
            {!isFocusMode && <CommandPalette />}
        </div>
    );
}

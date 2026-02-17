'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/context/DataProvider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Calendar,
    CheckSquare,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight,
    Briefcase,
    FolderOpen,
    BarChart2,
    BookOpen,
    Link2,
    FolderTree,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkSidebarProps {
    className?: string;
    currentView: string;
    onViewChange: (view: any) => void;
}

export function WorkSidebar({ className, currentView, onViewChange }: WorkSidebarProps) {
    const { projects, selectedWorkProjectId, setSelectedWorkProjectId } = useData();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Load collapsed state from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('work-sidebar-collapsed');
        if (saved) setIsCollapsed(JSON.parse(saved));
    }, []);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('work-sidebar-collapsed', JSON.stringify(newState));
    };

    const selectedProject = projects.find(p => p.id === selectedWorkProjectId);

    const SidebarItem = ({ icon: Icon, label, onClick, isActive, color }: any) => (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 group relative",
                isActive
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
                isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? label : undefined}
        >
            <Icon className={cn("w-5 h-5 shrink-0", color)} />

            {!isCollapsed && (
                <span className="truncate whitespace-nowrap overflow-hidden origin-left">
                    {label}
                </span>
            )}

            {/* Active Indicator Bar */}
            {isActive && (
                <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-r-full"
                />
            )}
        </button>
    );

    return (
        <motion.div
            animate={{ width: isCollapsed ? 72 : 240 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
                "h-full border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col z-20 relative shrink-0",
                className
            )}
        >
            {/* Toggle Button */}
            <button
                onClick={toggleCollapse}
                className="absolute -right-3 top-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-sm text-slate-400 hover:text-slate-600 z-50"
            >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>

            {/* Header / Context Switcher */}
            <div className="p-4 mb-2">
                <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shrink-0">
                        {selectedProject ? <Briefcase className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <h2 className="font-bold text-sm truncate">
                                {selectedProject ? selectedProject.title : "Work Space"}
                            </h2>
                            <p className="text-xs text-slate-400 truncate">
                                {selectedProject ? "Project View" : "Overview"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                {!selectedWorkProjectId ? (
                    // GLOBAL MODE
                    <>
                        <div className={cn("px-2 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider", isCollapsed && "hidden")}>
                            Global
                        </div>
                        <SidebarItem
                            icon={LayoutDashboard}
                            label="대시보드"
                            isActive={currentView === 'schedule'}
                            onClick={() => onViewChange('schedule')}
                        />
                        <SidebarItem
                            icon={CheckSquare}
                            label="내 할 일"
                            isActive={currentView === 'tasks'}
                            onClick={() => onViewChange('tasks')}
                        />

                        <div className={cn("px-2 py-2 mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider", isCollapsed && "hidden")}>
                            Pinned Projects
                        </div>
                        {projects.slice(0, 3).map(p => (
                            <SidebarItem
                                key={p.id}
                                icon={FolderTree}
                                label={p.title}
                                color="text-slate-400"
                                onClick={() => setSelectedWorkProjectId(p.id)}
                            />
                        ))}
                    </>
                ) : (
                    // PROJECT MODE
                    <>
                        <SidebarItem
                            icon={ChevronLeft}
                            label="메인으로 돌아가기"
                            onClick={() => setSelectedWorkProjectId(null)}
                            color="text-slate-400"
                        />
                        <div className="my-2 border-b border-slate-100 dark:border-slate-800" />

                        <div className={cn("px-2 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider", isCollapsed && "hidden")}>
                            Project Tools
                        </div>
                        <SidebarItem
                            icon={LayoutDashboard}
                            label="개요"
                            isActive={currentView === 'project'} // Default view
                            onClick={() => onViewChange('project')}
                        />
                        <SidebarItem
                            icon={BarChart2}
                            label="간트 차트"
                            isActive={currentView === 'schedule'}
                            onClick={() => onViewChange('schedule')}
                        />
                        <SidebarItem
                            icon={Users}
                            label="멤버"
                            isActive={currentView === 'personnel'}
                            onClick={() => onViewChange('personnel')}
                        />
                        <SidebarItem
                            icon={Clock}
                            label="시간 분석"
                            isActive={currentView === 'workhours'}
                            onClick={() => onViewChange('workhours')}
                        />
                        <SidebarItem
                            icon={LayoutDashboard}
                            label="템플릿"
                            isActive={currentView === 'templates'}
                            onClick={() => onViewChange('templates')}
                        />
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                <SidebarItem
                    icon={Settings}
                    label="설정"
                    onClick={() => { }}
                />
            </div>
        </motion.div>
    );
}

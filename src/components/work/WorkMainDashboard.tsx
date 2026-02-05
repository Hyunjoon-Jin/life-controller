'use client';

import { useState } from 'react';
import { Calendar, Briefcase, Users, Clock, Layout } from 'lucide-react';
import { ScheduleSection } from './sections/ScheduleSection';
import { ProjectSection } from './sections/ProjectSection';
import { WorkPeopleSection } from './sections/WorkPeopleSection';
import { WorkTimeSection } from './sections/WorkTimeSection';
import { WorkTemplateSection } from './sections/WorkTemplateSection';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { GanttChart } from '@/components/project/GanttChart';
// Removed ScheduleSection import

interface WorkMainDashboardProps {
    onOpenProject: (id: string) => void;
}

export function WorkMainDashboard({ onOpenProject }: WorkMainDashboardProps) {
    const [activeTab, setActiveTab] = useState<'schedule' | 'project'>('schedule');

    const tabs = [
        { id: 'schedule', label: '일정 관리', icon: Calendar },
        { id: 'project', label: '프로젝트별 관리', icon: Briefcase },
    ] as const;

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex bg-gray-100/50 p-1 rounded-2xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                            activeTab === tab.id
                                ? "bg-white text-primary shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {activeTab === 'schedule' && <GanttChart />}
                {activeTab === 'project' && <ProjectSection onOpenProject={onOpenProject} />}
            </div>
        </div>
    );
}

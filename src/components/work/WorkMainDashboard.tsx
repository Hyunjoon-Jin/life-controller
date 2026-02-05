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

interface WorkMainDashboardProps {
    onOpenProject: (id: string) => void;
    viewMode?: 'schedule' | 'project';
}

export function WorkMainDashboard({ onOpenProject, viewMode = 'schedule' }: WorkMainDashboardProps) {
    // viewMode determines content. 'schedule' -> Overview/Briefing, 'project' -> Project List
    // No internal tabs anymore as per user request.

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {viewMode === 'schedule' && <ScheduleSection />}
                {viewMode === 'project' && <ProjectSection onOpenProject={onOpenProject} />}

                {/* Fallbacks or other modes if needed in future, but distinct paths exist for people/templates */}
            </div>
        </div>
    );
}

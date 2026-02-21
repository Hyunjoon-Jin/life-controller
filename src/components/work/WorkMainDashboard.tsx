'use client';

import { useState } from 'react';
import { Calendar, Briefcase, Users, Clock, Layout } from 'lucide-react';
import { ScheduleSection } from './sections/ScheduleSection';
import { ProjectSection } from './sections/ProjectSection';
import { WorkPeopleSection } from './sections/WorkPeopleSection';
import { WorkTimeSection } from './sections/WorkTimeSection';
import { WorkTemplateSection } from './sections/WorkTemplateSection';
import { WorkDashboard } from './dashboard/WorkDashboard';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface WorkMainDashboardProps {
    onOpenProject: (id: string) => void;
    viewMode?: 'schedule' | 'project';
}

export function WorkMainDashboard({ onOpenProject, viewMode = 'schedule', onNavigate }: WorkMainDashboardProps & { onNavigate?: (tab: string) => void }) {
    return (
        <div className="h-full flex flex-col overflow-hidden p-6">
            {viewMode === 'schedule' ? (
                <WorkDashboard onNavigate={onNavigate} onOpenProject={onOpenProject} />
            ) : (
                <ProjectSection onOpenProject={onOpenProject} />
            )}
        </div>
    );
}

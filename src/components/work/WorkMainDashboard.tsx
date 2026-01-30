'use client';

import { MorningBriefing } from './MorningBriefing';
import { WorkloadHeatmap } from './WorkloadHeatmap';
import { RecentWorkspace } from './RecentWorkspace';

interface WorkMainDashboardProps {
    onOpenProject: (id: string) => void;
}

export function WorkMainDashboard({ onOpenProject }: WorkMainDashboardProps) {
    return (
        <div className="h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar p-1">
            {/* 1. Morning Briefing Section */}
            <section className="shrink-0">
                <MorningBriefing />
            </section>

            {/* 2. Key Metrics & Heatmap */}
            <section className="shrink-0">
                <WorkloadHeatmap />
            </section>

            {/* 3. Recent Workspace */}
            <section className="shrink-0 pb-10">
                <RecentWorkspace onOpenProject={onOpenProject} />
            </section>
        </div>
    );
}

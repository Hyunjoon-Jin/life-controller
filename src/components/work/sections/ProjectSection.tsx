'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/context/DataProvider';
import { ProjectDialog } from '@/components/project/ProjectDialog';
import { PortfolioHeader, PortfolioViewMode } from '../portfolio/PortfolioHeader';
import { PortfolioTimeline } from '../portfolio/PortfolioTimeline';
import { GroupedProjectList } from '../portfolio/GroupedProjectList';
import { WorkloadHeatmap } from '../WorkloadHeatmap';

interface ProjectSectionProps {
    onOpenProject: (id: string) => void;
}

export function ProjectSection({ onOpenProject }: ProjectSectionProps) {
    const { projects } = useData();
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

    // Portfolio State
    const [viewMode, setViewMode] = useState<PortfolioViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [groupBy, setGroupBy] = useState('none');
    const [showArchived, setShowArchived] = useState(false);

    // Filter and Sort Projects
    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            // Archive Filter
            if (!showArchived && project.isArchived) return false;
            if (showArchived && !project.isArchived) return false; // Optional: Show only archived? Or show all including archived? Usually "Show Archived" implies adding them back or switching view. Let's make it a toggle: Hide Archived (default) vs Show All? 
            // Actually, "Archive Vault" usually means a separate view, but a toggle is easier for now.
            // Let's say: if showArchived is true, show ONLY archived. If false, show ONLY active.
            // Or if showArchived is true, show ALL.
            // Let's go with: Toggle between "Active Projects" and "Archived Projects".
            if (showArchived !== !!project.isArchived) return false;

            // Search Filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    project.title.toLowerCase().includes(query) ||
                    project.description?.toLowerCase().includes(query) ||
                    project.manager?.toLowerCase().includes(query)
                );
            }

            return true;
        });
    }, [projects, showArchived, searchQuery]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PortfolioHeader
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                groupBy={groupBy}
                onGroupByChange={setGroupBy}
                onNewProject={() => setIsNewProjectOpen(true)}
                onArchiveToggle={() => setShowArchived(!showArchived)}
                showArchived={showArchived}
            />

            {viewMode === 'timeline' ? (
                <PortfolioTimeline
                    projects={filteredProjects}
                    onOpenProject={onOpenProject}
                />
            ) : (
                <GroupedProjectList
                    projects={filteredProjects}
                    onOpenProject={onOpenProject}
                    viewMode={viewMode === 'list' ? 'list' : 'grid'}
                    groupBy={groupBy}
                />
            )}

            {/* Only show Heatmap in Grid/List view to avoid clutter, or maybe always? */}
            {viewMode !== 'timeline' && <WorkloadHeatmap />}

            <ProjectDialog
                isOpen={isNewProjectOpen}
                onOpenChange={setIsNewProjectOpen}
            />
        </div>
    );
}

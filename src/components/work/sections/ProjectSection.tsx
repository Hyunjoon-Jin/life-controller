'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Plus, MoreHorizontal, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkloadHeatmap } from '../WorkloadHeatmap';
import { RecentWorkspace } from '../RecentWorkspace';
import { ProjectDialog } from '@/components/project/ProjectDialog';

interface ProjectSectionProps {
    onOpenProject: (id: string) => void;
}

export function ProjectSection({ onOpenProject }: ProjectSectionProps) {
    const { projects } = useData();
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

    return (
        <div className="space-y-6">
            {/* Header with New Project Button */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">프로젝트 관리</h3>
                <Button
                    onClick={() => setIsNewProjectOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 font-bold px-5 py-2.5 h-auto rounded-xl"
                >
                    <Plus className="w-5 h-5 mr-2" /> 새 프로젝트
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-sm bg-slate-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-primary" />
                            최근 진행한 프로젝트
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <RecentWorkspace onOpenProject={onOpenProject} />
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm h-fit">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold">프로젝트 통계</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">진행 중</span>
                            <span className="font-bold">{projects.filter(p => !p.isArchived).length}개</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">완료됨</span>
                            <span className="font-bold">{projects.filter(p => p.isArchived).length}개</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary"
                                style={{ width: `${(projects.filter(p => p.isArchived).length / (projects.length || 1)) * 100}%` }}
                            />
                        </div>
                        <Button variant="outline" className="w-full text-xs" onClick={() => { }}>
                            전체 분석 보기 <ArrowRight className="w-3 h-3 ml-2" />
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <WorkloadHeatmap />

            {/* Project Creation Dialog */}
            <ProjectDialog
                isOpen={isNewProjectOpen}
                onOpenChange={setIsNewProjectOpen}
            />
        </div>
    );
}

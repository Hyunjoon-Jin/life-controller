import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutGrid, List, Calendar, Filter, Archive, FolderPlus } from 'lucide-react';

export type PortfolioViewMode = 'grid' | 'list' | 'timeline';

interface PortfolioHeaderProps {
    viewMode: PortfolioViewMode;
    onViewModeChange: (mode: PortfolioViewMode) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    groupBy: string;
    onGroupByChange: (group: string) => void;
    onNewProject: () => void;
    onArchiveToggle: () => void;
    showArchived: boolean;
}

export function PortfolioHeader({
    viewMode,
    onViewModeChange,
    searchQuery,
    onSearchChange,
    groupBy,
    onGroupByChange,
    onNewProject,
    onArchiveToggle,
    showArchived
}: PortfolioHeaderProps) {
    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">프로젝트 포트폴리오</h2>
                    <p className="text-muted-foreground">모든 프로젝트의 현황을 한눈에 파악하고 관리합니다.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant={showArchived ? "secondary" : "outline"} onClick={onArchiveToggle}>
                        <Archive className="w-4 h-4 mr-2" />
                        {showArchived ? '보관됨 숨기기' : '보관된 프로젝트 보기'}
                    </Button>
                    <Button onClick={onNewProject} className="bg-primary text-primary-foreground shadow-md">
                        <FolderPlus className="w-4 h-4 mr-2" /> 새 프로젝트
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-3 bg-card p-2 rounded-lg border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Input
                        placeholder="프로젝트 검색..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 bg-background/50"
                    />
                    <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>

                <div className="h-6 w-px bg-border mx-1" />

                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">그룹화:</span>
                    <Select value={groupBy} onValueChange={onGroupByChange}>
                        <SelectTrigger className="w-[140px] h-9">
                            <SelectValue placeholder="없음" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">없음 (None)</SelectItem>
                            <SelectItem value="status">상태 (Status)</SelectItem>
                            <SelectItem value="category">카테고리 (Category)</SelectItem>
                            <SelectItem value="manager">담당자 (Manager)</SelectItem>
                            <SelectItem value="health">건강 상태 (Health)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="ml-auto flex items-center gap-1 bg-muted/50 p-1 rounded-md">
                    <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => onViewModeChange('grid')}
                    >
                        <LayoutGrid className="w-4 h-4 mr-1" /> 그리드
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => onViewModeChange('list')}
                    >
                        <List className="w-4 h-4 mr-1" /> 리스트
                    </Button>
                    <Button
                        variant={viewMode === 'timeline' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => onViewModeChange('timeline')}
                    >
                        <Calendar className="w-4 h-4 mr-1" /> 타임라인
                    </Button>
                </div>
            </div>
        </div>
    );
}

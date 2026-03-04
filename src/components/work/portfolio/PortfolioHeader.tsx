import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutGrid, List, Calendar, Archive, FolderPlus, Search, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
        <div className="flex flex-col gap-8 mb-10 relative">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-[0_12px_24px_-8px_rgba(99,102,241,0.5)]">
                        <Target className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter leading-none mb-2">프로젝트 관리</h2>
                        <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-semibold text-white/40">
                                {showArchived ? '보관된 프로젝트' : '진행 중인 프로젝트'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={onArchiveToggle}
                        className={cn(
                            "h-12 px-6 rounded-xl font-semibold text-sm transition-all",
                            showArchived
                                ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-400"
                                : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                        )}
                    >
                        <Archive className="w-4 h-4 mr-2" />
                        {showArchived ? '진행 중으로 보기' : '보관함 보기'}
                    </Button>
                    <Button
                        onClick={onNewProject}
                        className="h-12 px-8 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 font-semibold text-sm shadow-xl active:scale-95"
                    >
                        <FolderPlus className="w-4 h-4 mr-2" /> 프로젝트 추가
                    </Button>
                </div>
            </div>

            <div className="glass-premium p-3 rounded-[24px] border border-white/5 shadow-2xl flex items-center gap-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/[0.05] via-transparent to-transparent pointer-events-none" />

                <div className="relative flex-1 group/search">
                    <Input
                        placeholder="프로젝트 검색..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="h-12 pl-12 bg-white/[0.02] border-white/5 rounded-2xl text-sm placeholder:text-white/30 focus:border-indigo-500/30 transition-all"
                    />
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/search:text-indigo-400 transition-colors" />
                </div>

                <div className="h-8 w-px bg-white/5" />

                <div className="flex items-center gap-4 px-2">
                    <span className="text-[11px] font-semibold text-white/30 whitespace-nowrap">묶기:</span>
                    <Select value={groupBy} onValueChange={onGroupByChange}>
                        <SelectTrigger className="w-[140px] h-12 bg-white/[0.02] border-white/5 rounded-2xl text-sm text-white/60">
                            <SelectValue placeholder="없음" />
                        </SelectTrigger>
                        <SelectContent className="glass-premium border-white/10 rounded-2xl p-2">
                            <SelectItem value="none" className="text-sm">없음</SelectItem>
                            <SelectItem value="status" className="text-sm">상태별</SelectItem>
                            <SelectItem value="category" className="text-sm">카테고리별</SelectItem>
                            <SelectItem value="manager" className="text-sm">담당자별</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="ml-auto flex items-center gap-1 bg-white/5 p-1.5 rounded-[18px] border border-white/5">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-9 px-4 rounded-xl font-semibold text-xs transition-all",
                            viewMode === 'grid' ? "bg-white/10 text-white" : "text-white/30 hover:text-white"
                        )}
                        onClick={() => onViewModeChange('grid')}
                    >
                        <LayoutGrid className="w-3 h-3 mr-1.5" /> 그리드
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-9 px-4 rounded-xl font-semibold text-xs transition-all",
                            viewMode === 'list' ? "bg-white/10 text-white" : "text-white/30 hover:text-white"
                        )}
                        onClick={() => onViewModeChange('list')}
                    >
                        <List className="w-3 h-3 mr-1.5" /> 목록
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-9 px-4 rounded-xl font-semibold text-xs transition-all",
                            viewMode === 'timeline' ? "bg-white/10 text-white" : "text-white/30 hover:text-white"
                        )}
                        onClick={() => onViewModeChange('timeline')}
                    >
                        <Calendar className="w-3 h-3 mr-1.5" /> 타임라인
                    </Button>
                </div>
            </div>
        </div>
    );
}

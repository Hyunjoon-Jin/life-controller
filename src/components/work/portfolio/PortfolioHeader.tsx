import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutGrid, List, Calendar, Filter, Archive, FolderPlus, Search, Shield, Target, Activity } from 'lucide-react';
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
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none mb-2">STRATEGIC OBJECTIVE MAP</h2>
                        <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-black text-white/40 tracking-[0.2em] uppercase">ACCESS LEVEL: COMMANDER</span>
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-2">
                                <Shield className="w-3 h-3" /> ENCRYPTED REPOSITORY ACTIVE
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={onArchiveToggle}
                        className={cn(
                            "h-12 px-6 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all",
                            showArchived
                                ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-400"
                                : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                        )}
                    >
                        <Archive className="w-4 h-4 mr-2" />
                        {showArchived ? 'CLOSE ARCHIVE' : 'ACCESS VAULT'}
                    </Button>
                    <Button
                        onClick={onNewProject}
                        className="h-12 px-8 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 font-black text-[10px] tracking-widest uppercase shadow-xl active:scale-95"
                    >
                        <FolderPlus className="w-4 h-4 mr-2" /> INITIALIZE PROJECT
                    </Button>
                </div>
            </div>

            <div className="glass-premium p-3 rounded-[24px] border border-white/5 shadow-2xl flex items-center gap-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/[0.05] via-transparent to-transparent pointer-events-none" />

                <div className="relative flex-1 group/search">
                    <Input
                        placeholder="SCAN MISSION PARAMETERS..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="h-12 pl-12 bg-white/[0.02] border-white/5 rounded-2xl text-[11px] font-bold tracking-wider placeholder:text-white/10 focus:border-indigo-500/30 transition-all uppercase"
                    />
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/search:text-indigo-400 transition-colors" />
                </div>

                <div className="h-8 w-px bg-white/5" />

                <div className="flex items-center gap-4 px-2">
                    <span className="text-[9px] font-black text-white/20 tracking-[0.2em] uppercase whitespace-nowrap">SORT_BY:</span>
                    <Select value={groupBy} onValueChange={onGroupByChange}>
                        <SelectTrigger className="w-[160px] h-12 bg-white/[0.02] border-white/5 rounded-2xl text-[10px] font-black tracking-widest text-white/60 uppercase">
                            <SelectValue placeholder="NONE" />
                        </SelectTrigger>
                        <SelectContent className="glass-premium border-white/10 rounded-2xl p-2">
                            <SelectItem value="none" className="text-[10px] font-black tracking-widest uppercase">NONE</SelectItem>
                            <SelectItem value="status" className="text-[10px] font-black tracking-widest uppercase">STATUS</SelectItem>
                            <SelectItem value="category" className="text-[10px] font-black tracking-widest uppercase">CATEGORY</SelectItem>
                            <SelectItem value="manager" className="text-[10px] font-black tracking-widest uppercase">COMMANDER</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="ml-auto flex items-center gap-1 bg-white/5 p-1.5 rounded-[18px] border border-white/5">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-9 px-4 rounded-xl font-black text-[9px] tracking-widest uppercase transition-all",
                            viewMode === 'grid' ? "bg-white/10 text-white" : "text-white/20 hover:text-white"
                        )}
                        onClick={() => onViewModeChange('grid')}
                    >
                        <LayoutGrid className="w-3 h-3 mr-2" /> GRID
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-9 px-4 rounded-xl font-black text-[9px] tracking-widest uppercase transition-all",
                            viewMode === 'list' ? "bg-white/10 text-white" : "text-white/20 hover:text-white"
                        )}
                        onClick={() => onViewModeChange('list')}
                    >
                        <List className="w-3 h-3 mr-2" /> LIST
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-9 px-4 rounded-xl font-black text-[9px] tracking-widest uppercase transition-all",
                            viewMode === 'timeline' ? "bg-white/10 text-white" : "text-white/20 hover:text-white"
                        )}
                        onClick={() => onViewModeChange('timeline')}
                    >
                        <Calendar className="w-3 h-3 mr-2" /> CHRONO
                    </Button>
                </div>
            </div>
        </div>
    );
}

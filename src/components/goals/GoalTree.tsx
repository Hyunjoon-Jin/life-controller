'use client';

import { useState, useMemo } from 'react';
import { isValid } from 'date-fns';
import { Goal, PlanType, GoalCategory, Priority } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Search,
    Plus,
    ChevronRight,
    ChevronDown,
    Calendar,
    Trophy,
    Pencil,
    Trash2,
    Tag,
    ArrowUpDown,
    Target,
    Zap,
    Shield,
    Activity,
    Compass
} from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import { useData } from '@/context/DataProvider';
import { GoalDetailDialog } from './GoalDetailDialog';
import { motion, AnimatePresence } from 'framer-motion';

function GoalItem({ goal, level = 0, onAddSubGoal, onEdit, onDetail, forceExpand = false }: {
    goal: Goal;
    level?: number;
    onAddSubGoal: (parentId: string) => void;
    onEdit: (goal: Goal) => void;
    onDetail: (goal: Goal) => void;
    forceExpand?: boolean
}) {
    const { deleteGoal } = useData();
    const [expanded, setExpanded] = useState(false);

    const isExpanded = forceExpand || expanded;
    const hasSubGoals = goal.subGoals && goal.subGoals.length > 0;

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('이 전략 목표를 데이터베이스에서 영구 삭제하시겠습니까?')) {
            deleteGoal(goal.id);
        }
    }

    const getPlanTypeLabel = (type?: PlanType) => {
        switch (type) {
            case 'short-term': return '전술';
            case 'long-term': return '전략';
            case 'habit': return '루틴';
            case 'project': return '작업';
            default: return '';
        }
    }

    const getCategoryColor = (cat?: GoalCategory) => {
        switch (cat) {
            case 'financial': return 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5';
            case 'health': return 'border-rose-500/50 text-rose-400 bg-rose-500/5';
            case 'career': return 'border-blue-500/50 text-blue-400 bg-blue-500/5';
            case 'growth': return 'border-violet-500/50 text-violet-400 bg-violet-500/5';
            case 'language': return 'border-amber-500/50 text-amber-400 bg-amber-500/5';
            case 'hobby': return 'border-pink-500/50 text-pink-400 bg-pink-500/5';
            default: return 'border-slate-500/50 text-slate-400 bg-slate-500/5';
        }
    };

    const getCategoryLabel = (cat?: GoalCategory) => {
        switch (cat) {
            case 'financial': return '재정';
            case 'health': return '건강';
            case 'career': return '커리어';
            case 'growth': return '성장';
            case 'language': return '언어';
            case 'hobby': return '취미';
            default: return '기타';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn("space-y-3", level > 0 && "ml-4 pl-4 border-l border-border relative")}
        >
            {/* Connection Line Visual */}
            {level > 0 && (
                <div className="absolute -left-px top-6 w-4 h-px bg-border" />
            )}

            <div
                className={cn(
                    "group relative transition-all duration-300 overflow-hidden",
                    level === 0
                        ? "glass-premium p-5 rounded-2xl border border-white/10 shadow-xl hover:border-white/20"
                        : "p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10"
                )}
            >
                {/* Background Glow for high progress */}
                {goal.progress === 100 && (
                    <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none animate-pulse" />
                )}

                <div className="flex items-start gap-4">
                    {/* Expand/Collapse Button */}
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className={cn(
                            "mt-1 p-1 rounded-lg hover:bg-white/10 transition-all shrink-0 h-8 w-8 flex items-center justify-center",
                            level === 0 ? "text-white/40" : "text-muted-foreground",
                            !hasSubGoals && "invisible pointer-events-none"
                        )}
                    >
                        <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                            <ChevronRight className="w-5 h-5" />
                        </motion.div>
                    </button>

                    <div className="flex-1 min-w-0 space-y-3">
                        {/* Header Area */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 cursor-pointer min-w-0" onClick={() => onDetail(goal)}>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h4 className={cn("font-bold tracking-tight group-hover:text-amber-400 transition-colors truncate", level === 0 ? "text-lg text-white" : "text-sm text-foreground")}>
                                        {goal.title}
                                    </h4>

                                    {goal.priority === 'high' && (
                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-[9px] font-semibold text-rose-400">
                                            <Zap className="w-3 h-3" /> 긴급
                                        </div>
                                    )}

                                    {goal.isHabit && (
                                        <div className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-semibold text-emerald-400">
                                            반복
                                        </div>
                                    )}

                                    <div className={cn("px-2 py-0.5 rounded-md border text-[9px] font-semibold", getCategoryColor(goal.category))}>
                                        {getCategoryLabel(goal.category)}
                                    </div>

                                    <div className={cn("px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-semibold", level === 0 ? "text-white/40" : "text-muted-foreground")}>
                                        {getPlanTypeLabel(goal.planType)}
                                    </div>
                                </div>

                                {level === 0 && goal.memo && (
                                    <p className="text-[11px] text-white/60 font-medium line-clamp-1 mt-1">
                                        {goal.memo}
                                    </p>
                                )}
                            </div>

                            {/* Hexagonal-style Actions */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/5 hover:bg-blue-500/20 text-white/40 hover:text-blue-400 border border-white/5" onClick={() => onAddSubGoal(goal.id)}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/5 hover:bg-amber-500/20 text-white/40 hover:text-amber-400 border border-white/5" onClick={() => onEdit(goal)}>
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 border border-white/5" onClick={handleDelete}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Progress Monitoring */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-1">
                                <div className={cn("flex justify-between text-[9px] font-semibold tracking-wide", level === 0 ? "text-white/60" : "text-muted-foreground")}>
                                    <span>진행 상황</span>
                                    <span className={cn(goal.progress === 100 ? "text-emerald-400" : "text-amber-400")}>
                                        {goal.progress}% 완료
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${goal.progress}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={cn(
                                            "h-full rounded-full relative overflow-hidden",
                                            goal.progress === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-amber-600 to-amber-400"
                                        )}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                    </motion.div>
                                </div>
                            </div>

                            {goal.deadline && (
                                <div className={cn(
                                    "px-3 py-1.5 rounded-xl border flex flex-col items-center justify-center min-w-[70px]",
                                    new Date(goal.deadline) < new Date()
                                        ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                        : level === 0 ? "bg-white/5 border-white/10 text-white/40" : "bg-muted/50 border-border text-muted-foreground"
                                )}>
                                    <span className="text-[8px] font-semibold leading-none">마감</span>
                                    <span className="text-[11px] font-bold mt-1">
                                        {new Date(goal.deadline).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-Strategic Units */}
            <AnimatePresence>
                {hasSubGoals && isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 pt-1"
                    >
                        {goal.subGoals!.map(subGoal => (
                            <GoalItem
                                key={subGoal.id}
                                goal={subGoal}
                                level={level + 1}
                                onAddSubGoal={onAddSubGoal}
                                onEdit={onEdit}
                                onDetail={onDetail}
                                forceExpand={forceExpand}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function GoalTree() {
    const { goals, addGoal, updateGoal, deleteGoal } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<GoalCategory | 'all'>('all');
    const [filterPlanType, setFilterPlanType] = useState<PlanType | 'all'>('all');
    const [sortBy, setSortBy] = useState<'deadline' | 'progress' | 'name'>('deadline');

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [parentId, setParentId] = useState<string | null>(null);
    const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newGoalCategory, setNewGoalCategory] = useState<GoalCategory>('other');
    const [newPlanType, setNewPlanType] = useState<PlanType>('short-term');
    const [newGoalDeadline, setNewGoalDeadline] = useState('');
    const [newGoalMemo, setNewGoalMemo] = useState('');
    const [newGoalProgress, setNewGoalProgress] = useState(0);
    const [newGoalPriority, setNewGoalPriority] = useState<Priority>('medium');
    const [newGoalTags, setNewGoalTags] = useState<string>('');
    const [isHabitGoal, setIsHabitGoal] = useState(false);
    const [habitFreq, setHabitFreq] = useState<'daily' | 'weekly' | 'monthly'>('daily');

    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const filteredGoals = useMemo(() => {
        let result = goals.filter(g => {
            const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'all' || g.category === filterCategory;
            const matchesType = filterPlanType === 'all' || g.planType === filterPlanType;
            return matchesSearch && matchesCategory && matchesType;
        });

        return result.sort((a, b) => {
            switch (sortBy) {
                case 'progress': return b.progress - a.progress;
                case 'deadline':
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                case 'name': return a.title.localeCompare(b.title);
                default: return 0;
            }
        });
    }, [goals, searchTerm, filterCategory, filterPlanType, sortBy]);

    const handleOpenDetail = (goal: Goal) => {
        setSelectedGoal(goal);
        setIsDetailOpen(true);
    };

    const handleOpenCreateDialog = (pid: string | null = null) => {
        setParentId(pid);
        setEditingGoalId(null);
        setNewGoalTitle('');
        setNewGoalProgress(0);
        setNewGoalMemo('');
        setNewGoalDeadline('');
        setNewPlanType('short-term');
        setNewGoalCategory('other');
        setNewGoalPriority('medium');
        setNewGoalTags('');
        setIsHabitGoal(false);
        setHabitFreq('daily');
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (goal: Goal) => {
        setEditingGoalId(goal.id);
        setParentId(null);
        setNewGoalTitle(goal.title);
        setNewGoalProgress(goal.progress || 0);
        setNewGoalMemo(goal.memo || '');
        setNewGoalDeadline(goal.deadline && isValid(new Date(goal.deadline)) ? new Date(goal.deadline).toISOString().split('T')[0] : '');
        setNewPlanType(goal.planType || 'short-term');
        setNewGoalCategory(goal.category || 'other');
        setNewGoalPriority(goal.priority || 'medium');
        setNewGoalTags(goal.tags ? goal.tags.join(', ') : '');
        setIsHabitGoal(goal.isHabit || false);
        setHabitFreq(goal.habitFrequency || 'daily');
        setIsDialogOpen(true);
    };

    const handleSaveGoal = () => {
        if (!newGoalTitle.trim()) return;

        const goalData: Partial<Goal> = {
            title: newGoalTitle,
            progress: newGoalProgress,
            planType: newPlanType,
            category: newGoalCategory,
            deadline: newGoalDeadline ? new Date(newGoalDeadline) : undefined,
            memo: newGoalMemo,
            priority: newGoalPriority,
            tags: newGoalTags ? newGoalTags.split(',').map(t => t.trim()).filter(t => t !== '') : [],
            isHabit: isHabitGoal,
            habitFrequency: isHabitGoal ? habitFreq : undefined,
        };

        if (editingGoalId) {
            const targetGoal = findGoalById(goals, editingGoalId);
            if (targetGoal) {
                updateGoal({ ...targetGoal, ...goalData });
            }
        } else {
            const newGoal: Goal = {
                id: generateId(),
                title: newGoalTitle,
                progress: newGoalProgress,
                planType: newPlanType,
                category: newGoalCategory,
                deadline: newGoalDeadline ? new Date(newGoalDeadline) : undefined,
                memo: newGoalMemo,
                subGoals: [],
                priority: newGoalPriority,
                tags: newGoalTags ? newGoalTags.split(',').map(t => t.trim()).filter(t => t !== '') : [],
                isHabit: isHabitGoal,
                habitFrequency: isHabitGoal ? habitFreq : undefined,
            };

            if (parentId) {
                const findAndAdd = (list: Goal[]) => {
                    for (const g of list) {
                        if (g.id === parentId) {
                            updateGoal({ ...g, subGoals: [...(g.subGoals || []), newGoal] });
                            return true;
                        }
                        if (g.subGoals && findAndAdd(g.subGoals)) return true;
                    }
                    return false;
                };
                findAndAdd(goals);
            } else {
                addGoal(newGoal);
            }
        }
        setIsDialogOpen(false);
    };

    const findGoalById = (list: Goal[], id: string): Goal | null => {
        for (const g of list) {
            if (g.id === id) return g;
            if (g.subGoals) {
                const found = findGoalById(g.subGoals, id);
                if (found) return found;
            }
        }
        return null;
    };

    const isFiltering = searchTerm !== '' || filterCategory !== 'all' || filterPlanType !== 'all';

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Command Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                            <Shield className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-foreground tracking-tight">목표 트리</h2>
                            <p className="text-[10px] font-medium text-muted-foreground mt-0.5">전략적 목표를 계층별로 관리하세요</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 glass-premium px-4 py-2 rounded-2xl border border-white/5">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <div className="text-left">
                            <span className="block text-[8px] font-semibold text-muted-foreground">전체 진행률</span>
                            <span className="text-sm font-bold text-foreground">42.8%</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 glass-premium px-4 py-2 rounded-2xl border border-white/5">
                        <Target className="w-4 h-4 text-amber-500" />
                        <div className="text-left">
                            <span className="block text-[8px] font-semibold text-muted-foreground">활성 목표</span>
                            <span className="text-sm font-bold text-foreground">{goals.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tactical Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2 relative">
                    <Input
                        placeholder="목표 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-12 bg-white/5 border-border text-foreground placeholder:text-muted-foreground pl-12 rounded-2xl focus:ring-amber-500/20"
                    />
                    <Search className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as any)}>
                        <SelectTrigger className="h-12 bg-white/5 border-border text-foreground rounded-2xl text-[11px] font-medium">
                            <SelectValue placeholder="카테고리" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border text-popover-foreground">
                            <SelectItem value="all">전체</SelectItem>
                            <SelectItem value="financial">재정</SelectItem>
                            <SelectItem value="health">건강</SelectItem>
                            <SelectItem value="career">커리어</SelectItem>
                            <SelectItem value="growth">성장</SelectItem>
                            <SelectItem value="language">언어</SelectItem>
                            <SelectItem value="hobby">취미</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                        <SelectTrigger className="h-12 bg-white/5 border-border text-foreground rounded-2xl text-[11px] font-medium">
                            <SelectValue placeholder="정렬" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border text-popover-foreground">
                            <SelectItem value="deadline">마감일순</SelectItem>
                            <SelectItem value="progress">진행률순</SelectItem>
                            <SelectItem value="name">이름순</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    onClick={() => handleOpenCreateDialog()}
                    className="h-12 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-2xl shadow-[0_10px_30px_rgba(217,119,6,0.3)] transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5 mr-2" /> 새 목표 추가
                </Button>
            </div>

            {/* Strategic Map (The Tree) */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredGoals.map(goal => (
                        <GoalItem
                            key={goal.id}
                            goal={goal}
                            onAddSubGoal={handleOpenCreateDialog}
                            onEdit={handleOpenEditDialog}
                            onDetail={handleOpenDetail}
                            forceExpand={isFiltering}
                        />
                    ))}
                </AnimatePresence>

                {filteredGoals.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-24 text-center glass-premium rounded-[40px] border border-white/5"
                    >
                        <Compass className="w-16 h-16 text-white/5 mb-6 animate-spin-slow" />
                        <h3 className="text-xl font-bold text-foreground">등록된 목표가 없습니다</h3>
                        <p className="text-sm text-muted-foreground font-medium mt-2">새 목표를 추가하여 시작하세요</p>
                    </motion.div>
                )}
            </div>

            {/* Deployment Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] glass-premium border-white/10 text-white rounded-[32px] overflow-hidden p-0 shadow-2xl">
                    <div className="p-8 space-y-8">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                                    <Target className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight">
                                        {editingGoalId ? '목표 수정' : '새 목표 추가'}
                                    </h3>
                                    <p className="text-[9px] font-medium text-muted-foreground mt-1">목표 정보를 입력하세요</p>
                                </div>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-semibold text-amber-500 tracking-wide">목표 제목</Label>
                                <Input
                                    value={newGoalTitle}
                                    onChange={(e) => setNewGoalTitle(e.target.value)}
                                    placeholder="목표 이름을 입력하세요..."
                                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-semibold text-amber-500 tracking-wide">우선순위</Label>
                                    <Select value={newGoalPriority} onValueChange={(v) => setNewGoalPriority(v as any)}>
                                        <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-xl font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border text-popover-foreground">
                                            <SelectItem value="high">🔥 긴급</SelectItem>
                                            <SelectItem value="medium">⚡ 보통</SelectItem>
                                            <SelectItem value="low">🌱 낮음</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-semibold text-amber-500 tracking-wide">카테고리</Label>
                                    <Select value={newGoalCategory} onValueChange={(v) => setNewGoalCategory(v as any)}>
                                        <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-xl font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border text-popover-foreground">
                                            <SelectItem value="financial">재정</SelectItem>
                                            <SelectItem value="health">건강</SelectItem>
                                            <SelectItem value="career">커리어</SelectItem>
                                            <SelectItem value="growth">성장</SelectItem>
                                            <SelectItem value="language">언어</SelectItem>
                                            <SelectItem value="hobby">취미</SelectItem>
                                            <SelectItem value="other">기타</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-semibold text-amber-500 tracking-wide">메모</Label>
                                <textarea
                                    className="w-full h-32 bg-white/5 border-white/10 text-white p-4 rounded-xl text-xs font-medium resize-none placeholder:text-white/40 focus:ring-1 focus:ring-amber-500/50"
                                    placeholder="목표에 대한 메모를 입력하세요..."
                                    value={newGoalMemo}
                                    onChange={(e) => setNewGoalMemo(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex bg-white/5 p-8 border-t border-white/10">
                        <Button
                            onClick={handleSaveGoal}
                            className="w-full h-14 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-2xl shadow-xl transition-all"
                        >
                            {editingGoalId ? '수정 완료' : '목표 추가'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <GoalDetailDialog isOpen={isDetailOpen} onOpenChange={setIsDetailOpen} goal={selectedGoal} />
        </div>
    );
}

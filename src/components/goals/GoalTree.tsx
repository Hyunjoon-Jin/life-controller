import { useState } from 'react';
import { isValid } from 'date-fns';
import { Goal, PlanType, GoalCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, ChevronDown, Plus, Trophy, Trash2, Pencil, Calendar, Tag, Filter, Search } from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import { useData } from '@/context/DataProvider';
import { GoalDetailDialog } from './GoalDetailDialog';

function GoalItem({ goal, level = 0, onAddSubGoal, onEdit, onDetail, forceExpand = false }: {
    goal: Goal;
    level?: number;
    onAddSubGoal: (parentId: string) => void;
    onEdit: (goal: Goal) => void;
    onDetail: (goal: Goal) => void;
    forceExpand?: boolean
}) {
    const { deleteGoal } = useData();
    const [expanded, setExpanded] = useState(true);

    const isExpanded = forceExpand || expanded;
    const hasSubGoals = goal.subGoals && goal.subGoals.length > 0;

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('이 목표를 삭제하시겠습니까?')) {
            deleteGoal(goal.id);
        }
    }

    const getPlanTypeLabel = (type?: PlanType) => {
        switch (type) {
            case 'short-term': return '단기';
            case 'long-term': return '장기';
            case 'habit': return '습관';
            case 'project': return '프로젝트';
            default: return '';
        }
    }

    const getCategoryLabel = (cat?: GoalCategory) => {
        switch (cat) {
            case 'financial': return '재테크';
            case 'health': return '건강';
            case 'career': return '커리어';
            case 'growth': return '자기계발';
            case 'language': return '어학';
            case 'hobby': return '취미';
            case 'other': return '기타';
            default: return '기타';
        }
    }

    const getCategoryColor = (cat?: GoalCategory) => {
        switch (cat) {
            case 'financial': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';
            case 'health': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800';
            case 'career': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
            case 'growth': return 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800';
            case 'language': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
            case 'hobby': return 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800';
            default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
        }
    };

    return (
        <div className={cn("space-y-2", level > 0 && "ml-6 pl-4 border-l-2 border-border/40 relative")}>
            {/* Connection Dot for nested items */}
            {level > 0 && (
                <div className="absolute -left-[21px] top-6 w-3 h-3 rounded-full border-2 border-background bg-border/40" />
            )}

            <div
                className={cn(
                    "group relative transition-all duration-200",
                    level === 0
                        ? "p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/20"
                        : "p-3 rounded-lg hover:bg-muted/40 border border-transparent hover:border-border/40"
                )}
            >
                <div className="flex items-start gap-3">
                    {/* Expand/Collapse Button */}
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className={cn(
                            "mt-1 p-0.5 rounded-md hover:bg-muted text-muted-foreground transition-colors shrink-0",
                            !hasSubGoals && "invisible pointer-events-none"
                        )}
                    >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div className="flex-1 min-w-0 space-y-3">
                        {/* Header: Title, Badges, Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="flex-1 cursor-pointer min-w-0" onClick={() => onDetail(goal)}>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h4 className={cn("font-bold text-foreground hover:text-primary transition-colors truncate", level === 0 ? "text-lg" : "text-base")}>
                                        {goal.title}
                                    </h4>
                                    {goal.category && (
                                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider shrink-0", getCategoryColor(goal.category))}>
                                            {getCategoryLabel(goal.category)}
                                        </span>
                                    )}
                                    {goal.planType && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-secondary-foreground/10 font-medium shrink-0">
                                            {getPlanTypeLabel(goal.planType)}
                                        </span>
                                    )}
                                </div>
                                {level === 0 && goal.memo && (
                                    <p className="text-sm text-muted-foreground line-clamp-1">{goal.memo}</p>
                                )}
                            </div>

                            {/* Floating Actions */}
                            <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm p-1 rounded-md shadow-sm border border-border/50 absolute right-2 top-2 sm:static sm:bg-transparent sm:shadow-none sm:border-none">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => onAddSubGoal(goal.id)} title="하위 목표 추가">
                                    <Plus className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onEdit(goal)} title="수정">
                                    <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={handleDelete} title="삭제">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-2.5 bg-secondary/50 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]",
                                        goal.progress === 100 ? "bg-emerald-500" : "bg-primary"
                                    )}
                                    style={{ width: `${goal.progress}%` }}
                                />
                            </div>
                            <span className={cn("text-xs font-bold w-10 text-right", goal.progress === 100 ? "text-emerald-600" : "text-primary")}>
                                {goal.progress}%
                            </span>
                        </div>

                        {/* Footer Info */}
                        {goal.deadline && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded", new Date(goal.deadline) < new Date() ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-muted")}>
                                    <Calendar className="w-3 h-3" />
                                    {new Date(goal.deadline).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Subgoals Render */}
            {hasSubGoals && isExpanded && (
                <div className="space-y-2 pt-1 animate-in slide-in-from-top-2 fade-in duration-300">
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
                </div>
            )}
        </div>
    );
}

export function GoalTree() {
    const { goals, addGoal, updateGoal } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Detail Dialog State
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

    const handleOpenDetail = (goal: Goal) => {
        setSelectedGoal(goal);
        setIsDetailOpen(true);
    };

    // Dialog State
    const [parentId, setParentId] = useState<string | null>(null);
    const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

    // Form State
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newGoalProgress, setNewGoalProgress] = useState(0);
    const [newPlanType, setNewPlanType] = useState<PlanType>('short-term');
    const [newGoalCategory, setNewGoalCategory] = useState<GoalCategory>('other');
    const [newGoalDeadline, setNewGoalDeadline] = useState('');
    const [newGoalMemo, setNewGoalMemo] = useState('');

    const handleOpenCreateDialog = (pid: string | null = null) => {
        setParentId(pid);
        setEditingGoalId(null);

        // Reset Form
        setNewGoalTitle('');
        setNewGoalProgress(0);
        setNewGoalMemo('');
        setNewGoalDeadline('');
        setNewPlanType('short-term');
        setNewGoalCategory('other');

        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (goal: Goal) => {
        setEditingGoalId(goal.id);
        setParentId(null); // Not creating a child

        // Populate Form
        setNewGoalTitle(goal.title);
        setNewGoalProgress(goal.progress || 0);
        setNewGoalMemo(goal.memo || '');
        setNewGoalDeadline(goal.deadline && isValid(new Date(goal.deadline)) ? new Date(goal.deadline).toISOString().split('T')[0] : '');
        setNewPlanType(goal.planType || 'short-term');
        setNewGoalCategory(goal.category || 'other');

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
        };

        if (editingGoalId) {
            // Update Existing Goal
            const targetGoal = findGoalById(goals, editingGoalId);
            if (targetGoal) {
                updateGoal({ ...targetGoal, ...goalData });
            }
        } else {
            // Create New Goal
            const newGoal: Goal = {
                id: generateId(),
                title: newGoalTitle,
                progress: newGoalProgress,
                planType: newPlanType,
                category: newGoalCategory,
                deadline: newGoalDeadline ? new Date(newGoalDeadline) : undefined,
                memo: newGoalMemo,
                subGoals: []
            };

            if (parentId) {
                const findAndAdd = (list: Goal[]) => {
                    for (let g of list) {
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
        for (let g of list) {
            if (g.id === id) return g;
            if (g.subGoals) {
                const found = findGoalById(g.subGoals, id);
                if (found) return found;
            }
        }
        return null;
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<GoalCategory | 'all'>('all');
    const [filterPlanType, setFilterPlanType] = useState<PlanType | 'all'>('all');

    // Recursive filtering logic
    const filterGoals = (goals: Goal[]): Goal[] => {
        return goals.reduce((acc: Goal[], goal) => {
            const matchesTerm = goal.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'all' || goal.category === filterCategory;
            const matchesPlanType = filterPlanType === 'all' || goal.planType === filterPlanType;

            // Check subgoals recursively
            const filteredSubGoals = goal.subGoals ? filterGoals(goal.subGoals) : [];
            const hasMatchingSubGoals = filteredSubGoals.length > 0;

            if ((matchesTerm && matchesCategory && matchesPlanType) || hasMatchingSubGoals) {
                acc.push({
                    ...goal,
                    subGoals: filteredSubGoals
                });
            }
            return acc;
        }, []);
    };

    const filteredGoals = filterGoals(goals);
    const isFiltering = searchTerm !== '' || filterCategory !== 'all' || filterPlanType !== 'all';

    return (
        <div className="border border-border rounded-lg bg-card text-card-foreground p-4 space-y-4">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Input
                            placeholder="목표 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 text-sm pl-9 bg-background shadow-sm transition-shadow focus-visible:ring-primary/20"
                        />
                        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground opacity-50" />
                    </div>
                    <div className="flex flex-wrap sm:flex-nowrap gap-2">
                        <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as any)}>
                            <SelectTrigger className="w-[110px] h-10 text-xs bg-background shadow-sm border-border/60">
                                <SelectValue placeholder="카테고리" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">전체 분류</SelectItem>
                                <SelectItem value="financial">재테크</SelectItem>
                                <SelectItem value="health">건강</SelectItem>
                                <SelectItem value="career">커리어</SelectItem>
                                <SelectItem value="growth">자기계발</SelectItem>
                                <SelectItem value="language">어학</SelectItem>
                                <SelectItem value="hobby">취미</SelectItem>
                                <SelectItem value="other">기타</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterPlanType} onValueChange={(v) => setFilterPlanType(v as any)}>
                            <SelectTrigger className="w-[110px] h-10 text-xs bg-background shadow-sm border-border/60">
                                <SelectValue placeholder="유형" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">전체 유형</SelectItem>
                                <SelectItem value="short-term">단기 목표</SelectItem>
                                <SelectItem value="long-term">장기 목표</SelectItem>
                                <SelectItem value="project">프로젝트</SelectItem>
                                <SelectItem value="habit">습관</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button onClick={() => handleOpenCreateDialog()} className="h-10 px-4 shadow-sm font-semibold btn-glass-primary">
                            <Plus className="w-4 h-4 mr-1.5" />
                            <span className="hidden sm:inline">새 목표</span>
                            <span className="sm:hidden">추가</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
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
                {filteredGoals.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-10" />
                        <p className="text-sm font-medium">
                            {isFiltering ? '검색 결과가 없습니다.' : '아직 등록된 목표가 없습니다.'}
                        </p>
                        {!isFiltering && <p className="text-xs text-muted-foreground mt-1">새로운 목표를 추가하고 계획을 시작해 보세요!</p>}
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {editingGoalId ? <Pencil className="w-5 h-5" /> : (parentId ? <Plus className="w-5 h-5" /> : <Trophy className="w-5 h-5" />)}
                            {editingGoalId ? '목표 수정' : (parentId ? '하위 목표 추가' : '새 목표 추가')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="goal-title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">목표 제목</Label>
                            <Input
                                id="goal-title"
                                value={newGoalTitle}
                                onChange={(e) => setNewGoalTitle(e.target.value)}
                                placeholder="달성하고 싶은 목표를 입력하세요..."
                                className="text-base"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                    <Tag className="w-3 h-3" /> 목표 분류
                                </Label>
                                <Select value={newGoalCategory} onValueChange={(v) => setNewGoalCategory(v as any)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-[99999]">
                                        <SelectItem value="financial">재테크</SelectItem>
                                        <SelectItem value="health">건강</SelectItem>
                                        <SelectItem value="career">커리어</SelectItem>
                                        <SelectItem value="growth">자기계발</SelectItem>
                                        <SelectItem value="language">어학</SelectItem>
                                        <SelectItem value="hobby">취미</SelectItem>
                                        <SelectItem value="other">기타</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> 계획 유형
                                </Label>
                                <Select value={newPlanType} onValueChange={(v) => setNewPlanType(v as any)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-[99999]">
                                        <SelectItem value="short-term">단기 목표</SelectItem>
                                        <SelectItem value="long-term">장기 목표</SelectItem>
                                        <SelectItem value="project">프로젝트</SelectItem>
                                        <SelectItem value="habit">습관</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="goal-deadline" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">마감 기한</Label>
                                <Input
                                    id="goal-deadline"
                                    type="date"
                                    value={newGoalDeadline}
                                    onChange={(e) => setNewGoalDeadline(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="goal-progress" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">현재 진행도 (%)</Label>
                                <Input
                                    id="goal-progress"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={newGoalProgress}
                                    onChange={(e) => setNewGoalProgress(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="goal-memo" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">메모</Label>
                            <textarea
                                id="goal-memo"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                                placeholder="상세한 계획이나 참고 사항을 입력하세요..."
                                value={newGoalMemo}
                                onChange={(e) => setNewGoalMemo(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter className="bg-muted/20 -mx-6 px-6 py-4">
                        <Button onClick={handleSaveGoal} className="w-full sm:w-auto">
                            {editingGoalId ? '수정 완료' : '목표 등록'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <GoalDetailDialog isOpen={isDetailOpen} onOpenChange={setIsDetailOpen} goal={selectedGoal} />
        </div>
    );
}

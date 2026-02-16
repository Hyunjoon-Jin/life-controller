
import { useState, useMemo } from 'react';
import { isValid } from 'date-fns';
import { Goal, PlanType, GoalCategory, Priority } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
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
    Target
} from 'lucide-react';
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
    const [expanded, setExpanded] = useState(false);

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
        <div className={cn("space-y-2", level > 0 && "ml-3 pl-2 md:ml-6 md:pl-4 border-l-2 border-border/40 relative")}>
            {/* Connection Dot for nested items */}
            {level > 0 && (
                <div className="absolute -left-[13px] md:-left-[21px] top-6 w-3 h-3 rounded-full border-2 border-background bg-border/40" />
            )}

            <div
                className={cn(
                    "group relative transition-all duration-200",
                    level === 0
                        ? "p-3 rounded-lg border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/20"
                        : "p-2 rounded-md hover:bg-muted/40 border border-transparent hover:border-border/40"
                )}
            >
                <div className="flex items-start gap-2">
                    {/* Expand/Collapse Button */}
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className={cn(
                            "mt-0.5 p-0.5 rounded-sm hover:bg-muted text-muted-foreground transition-colors shrink-0 h-8 w-8 flex items-center justify-center", // Larger target
                            !hasSubGoals && "invisible pointer-events-none"
                        )}
                    >
                        {isExpanded ? <ChevronDown className="w-4 h-4 ml-0.5" /> : <ChevronRight className="w-4 h-4 ml-0.5" />}
                    </button>

                    <div className="flex-1 min-w-0 space-y-1.5">
                        {/* Header: Title, Badges, Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <div className="flex-1 cursor-pointer min-w-0" onClick={() => onDetail(goal)}>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className={cn("font-bold text-foreground hover:text-primary transition-colors truncate", level === 0 ? "text-base" : "text-sm")}>
                                        {goal.title}
                                    </h4>
                                    {goal.priority && (
                                        <span className={cn(
                                            "text-[10px] px-1.5 py-0 rounded font-black uppercase tracking-wider shrink-0",
                                            goal.priority === 'high' ? "bg-red-500 text-white" :
                                                goal.priority === 'medium' ? "bg-blue-500 text-white" :
                                                    "bg-gray-400 text-white"
                                        )}>
                                            {goal.priority === 'high' ? '높음' : goal.priority === 'medium' ? '보통' : '낮음'}
                                        </span>
                                    )}
                                    {goal.isHabit && (
                                        <span className="text-[10px] px-1.5 py-0 rounded bg-emerald-500 text-white font-black uppercase tracking-wider shrink-0">
                                            습관형
                                        </span>
                                    )}
                                    {goal.tags && goal.tags.map(tag => (
                                        <span key={tag} className="text-[10px] px-1.5 py-0 rounded bg-secondary/10 text-secondary border border-secondary/20 font-bold shrink-0">
                                            #{tag}
                                        </span>
                                    ))}
                                    {goal.category && (
                                        <span className={cn("text-[11px] px-1.5 py-0 rounded border font-bold uppercase tracking-wider shrink-0", getCategoryColor(goal.category))}>
                                            {getCategoryLabel(goal.category)}
                                        </span>
                                    )}
                                    {goal.planType && (
                                        <span className="text-[11px] px-1.5 py-0 rounded bg-secondary text-secondary-foreground border border-secondary-foreground/10 font-medium shrink-0">
                                            {getPlanTypeLabel(goal.planType)}
                                        </span>
                                    )}
                                </div>
                                {level === 0 && goal.memo && (
                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{goal.memo}</p>
                                )}
                            </div>

                            {/* Floating Actions */}
                            <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-background/95 backdrop-blur-sm p-1 rounded shadow-sm border border-border/50 absolute right-1 top-1 sm:static sm:bg-transparent sm:shadow-none sm:border-none z-10">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onAddSubGoal(goal.id)} title="하위 목표 추가">
                                    <Plus className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => onEdit(goal)} title="수정">
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleDelete} title="삭제">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Progress Bar & Footer Inline */}
                        <div className="flex items-center gap-3 text-xs">
                            <div className="flex-1 flex items-center gap-2">
                                <span className={cn("font-bold w-8 text-right tabular-nums", goal.progress === 100 ? "text-emerald-600" : "text-blue-600 dark:text-blue-400")}>
                                    {goal.progress}%
                                </span>
                                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-700 ease-out shadow-sm",
                                            goal.progress === 100 ? "bg-emerald-500" : "bg-blue-500"
                                        )}
                                        style={{ width: `${goal.progress}%` }}
                                    />
                                </div>
                            </div>

                            {goal.deadline && (
                                <span className={cn("flex items-center gap-1 px-1 py-0.5 rounded text-[11px]", new Date(goal.deadline) < new Date() ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-muted text-muted-foreground")}>
                                    <Calendar className="w-3 h-3" />
                                    {new Date(goal.deadline).toLocaleDateString()}
                                </span>
                            )}
                        </div>
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

export default function GoalTree() {
    const { goals, addGoal, updateGoal, deleteGoal } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<GoalCategory | 'all'>('all');
    const [filterPlanType, setFilterPlanType] = useState<PlanType | 'all'>('all');
    const [sortBy, setSortBy] = useState<'deadline' | 'progress' | 'name'>('deadline');


    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [parentId, setParentId] = useState<string | null>(null);
    const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

    // Form states
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

        // Sorting Logic
        return result.sort((a, b) => {
            switch (sortBy) {
                case 'progress':
                    return b.progress - a.progress; // High to Low
                case 'deadline':
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime(); // Ascending
                case 'name':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });
    }, [goals, searchTerm, filterCategory, filterPlanType, sortBy]);

    const handleOpenDetail = (goal: Goal) => {
        setSelectedGoal(goal);
        setIsDetailOpen(true);
    };

    // Dialog State
    // const [parentId, setParentId] = useState<string | null>(null); // Already declared above
    // const [editingGoalId, setEditingGoalId] = useState<string | null>(null); // Already declared above

    // Form State
    // const [newGoalTitle, setNewGoalTitle] = useState(''); // Already declared above
    // const [newGoalProgress, setNewGoalProgress] = useState(0); // Already declared above
    // const [newPlanType, setNewPlanType] = useState<PlanType>('short-term'); // Already declared above
    // const [newGoalCategory, setNewGoalCategory] = useState<GoalCategory>('other'); // Already declared above
    // const [newGoalDeadline, setNewGoalDeadline] = useState(''); // Already declared above
    // const [newGoalMemo, setNewGoalMemo] = useState(''); // Already declared above

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
        setNewGoalPriority('medium');
        setNewGoalTags('');
        setIsHabitGoal(false);
        setHabitFreq('daily');

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
                        {/* Sort Dropdown */}
                        <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'deadline' | 'progress' | 'name')}>
                            <SelectTrigger className="w-[100px] h-10 text-xs bg-background shadow-sm border-border/60">
                                <ArrowUpDown className="w-3 h-3 mr-1.5 opacity-50" />
                                <SelectValue placeholder="정렬" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="deadline">마감순</SelectItem>
                                <SelectItem value="progress">진행률순</SelectItem>
                                <SelectItem value="name">이름순</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Chart Toggle Removed */}

                        <div className="w-px h-6 bg-border/50 my-auto hidden sm:block mx-1" />

                        <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as GoalCategory | 'all')}>
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

                        <Select value={filterPlanType} onValueChange={(v) => setFilterPlanType(v as PlanType | 'all')}>
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
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-5">
                            <Trophy className="w-8 h-8 text-amber-400" />
                        </div>
                        <p className="text-lg font-bold text-slate-800 mb-2">
                            {isFiltering ? '검색 결과가 없습니다' : '아직 등록된 목표가 없어요'}
                        </p>
                        {!isFiltering && (
                            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">새로운 목표를 추가하고 계획을 시작해 보세요!</p>
                        )}
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[450px] max-h-[85vh] overflow-y-auto">
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

                        {/* Priority & Tags */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                    추가 태그
                                </Label>
                                <Input
                                    value={newGoalTags}
                                    onChange={(e) => setNewGoalTags(e.target.value)}
                                    placeholder="쉼표로 구분 (예: 코딩, 운동)"
                                    className="text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                    중요도
                                </Label>
                                <Select value={newGoalPriority} onValueChange={(v) => setNewGoalPriority(v as Priority)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-[99999]">
                                        <SelectItem value="high">🔥 높음</SelectItem>
                                        <SelectItem value="medium">⚡ 보통</SelectItem>
                                        <SelectItem value="low">🌱 낮음</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Habit Toggle */}
                        <div className="space-y-3 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold flex items-center gap-2">
                                        <Target className="w-4 h-4 text-emerald-500" /> 습관형 목표로 설정
                                    </Label>
                                    <p className="text-xs text-muted-foreground">달성률 대신 반복 실천을 중점적으로 관리합니다.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    checked={isHabitGoal}
                                    onChange={(e) => setIsHabitGoal(e.target.checked)}
                                />
                            </div>

                            {isHabitGoal && (
                                <div className="pt-2 animate-in slide-in-from-top-2 duration-200">
                                    <Label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1.5 block">반복 주기</Label>
                                    <div className="flex gap-2">
                                        {['daily', 'weekly', 'monthly'].map((f) => (
                                            <Button
                                                key={f}
                                                type="button"
                                                variant={habitFreq === f ? 'default' : 'outline'}
                                                size="sm"
                                                className={cn(
                                                    "flex-1 text-xs h-8 rounded-lg",
                                                    habitFreq === f && "bg-emerald-500 hover:bg-emerald-600 text-white border-none"
                                                )}
                                                onClick={() => setHabitFreq(f as any)}
                                            >
                                                {f === 'daily' ? '매일' : f === 'weekly' ? '매주' : '매월'}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
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

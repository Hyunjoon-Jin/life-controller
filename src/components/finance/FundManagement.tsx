'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { FinanceGoal } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { TrendingUp, TrendingDown, Target, PiggyBank, Briefcase, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function FundManagement() {
    const { transactions, assets, financeGoals, addFinanceGoal, updateFinanceGoal, deleteFinanceGoal } = useData();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<FinanceGoal | null>(null);

    // Goal Form
    const [goalTitle, setGoalTitle] = useState('');
    const [goalTarget, setGoalTarget] = useState('');
    const [goalCurrent, setGoalCurrent] = useState('');

    // Goals for the month (simplified persistence - could be moved to DataProvider later)
    const [monthlyGoals, setMonthlyGoals] = useState({
        income: 5000000,
        saving: 2500000,
        spending: 1500000,
    });

    const monthlyTransactions = transactions.filter(t =>
        isSameMonth(new Date(t.date), currentDate)
    );

    const actualIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const actualSpending = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const actualSaving = monthlyTransactions
        .filter(t => ['saving', 'investment'].includes(t.type))
        .reduce((sum, t) => sum + t.amount, 0);

    const incomeProgress = Math.min(100, (actualIncome / monthlyGoals.income) * 100);
    const savingProgress = Math.min(100, (actualSaving / monthlyGoals.saving) * 100);
    const spendingProgress = Math.min(100, (actualSpending / monthlyGoals.spending) * 100);

    return (
        <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">중장기 자금 관리 ({format(currentDate, 'yyyy년 MM월')})</h2>
                </div>
            </div>

            {/* Monthly Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                            실제 수입
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{actualIncome.toLocaleString()}원</div>
                        <div className="text-xs text-muted-foreground mt-1">목표: {monthlyGoals.income.toLocaleString()}원</div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
                            <div className="h-full bg-blue-500" style={{ width: `${incomeProgress}%` }}></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                            실제 저축/투자
                            <PiggyBank className="w-4 h-4 text-green-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{actualSaving.toLocaleString()}원</div>
                        <div className="text-xs text-muted-foreground mt-1">목표: {monthlyGoals.saving.toLocaleString()}원</div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
                            <div className="h-full bg-green-500" style={{ width: `${savingProgress}%` }}></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                            실제 소비
                            <TrendingDown className="w-4 h-4 text-orange-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{actualSpending.toLocaleString()}원</div>
                        <div className="text-xs text-muted-foreground mt-1">한도: {monthlyGoals.spending.toLocaleString()}원</div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
                            <div className={cn("h-full", spendingProgress > 90 ? "bg-red-500" : "bg-orange-500")} style={{ width: `${spendingProgress}%` }}></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Future Plan Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            향후 자금 계획
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4">
                            {financeGoals.map(goal => {
                                const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                                return (
                                    <div key={goal.id} className="group relative flex items-center justify-between p-4 bg-slate-50 rounded-xl border hover:shadow-sm transition-all cursor-pointer" onClick={() => {
                                        setEditingGoal(goal);
                                        setGoalTitle(goal.title);
                                        setGoalTarget(goal.targetAmount.toString());
                                        setGoalCurrent(goal.currentAmount.toString());
                                        setIsDialogOpen(true);
                                    }}>
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-slate-400 hover:text-red-500"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteFinanceGoal(goal.id);
                                                }}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <div>
                                            <div className="font-bold">{goal.title}</div>
                                            <div className="text-xs text-muted-foreground">목표: {goal.targetAmount.toLocaleString()}원</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-primary">{progress.toFixed(1)}% 달성</div>
                                            <div className="text-xs text-muted-foreground">현: {goal.currentAmount.toLocaleString()}원</div>
                                        </div>
                                    </div>
                                );
                            })}
                            {financeGoals.length === 0 && (
                                <div className="text-center py-6 text-sm text-slate-400 border border-dashed rounded-xl">
                                    등록된 장기 계획이 없습니다.
                                </div>
                            )}
                        </div>
                        <Button variant="outline" className="w-full dashed border-2" onClick={() => {
                            setEditingGoal(null);
                            setGoalTitle('');
                            setGoalTarget('');
                            setGoalCurrent('0');
                            setIsDialogOpen(true);
                        }}>
                            <Plus className="w-4 h-4 mr-2" /> 새 계획 추가
                        </Button>
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingGoal ? '자금 계획 수정' : '새 자금 계획 추가'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>계획명</Label>
                                <Input
                                    placeholder="예: 주택 마련, 여행 자금 등"
                                    value={goalTitle}
                                    onChange={e => setGoalTitle(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>목표 금액 (원)</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={goalTarget}
                                    onChange={e => setGoalTarget(e.target.value)}
                                />
                            </div>
                            {editingGoal && (
                                <div className="grid gap-2">
                                    <Label>현재 모은 금액 (원)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={goalCurrent}
                                        onChange={e => setGoalCurrent(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={() => {
                                    if (!goalTitle || !goalTarget) return;
                                    if (editingGoal) {
                                        updateFinanceGoal({
                                            ...editingGoal,
                                            title: goalTitle,
                                            targetAmount: parseInt(goalTarget),
                                            currentAmount: parseInt(goalCurrent) || 0,
                                        });
                                    } else {
                                        addFinanceGoal({
                                            id: Math.random().toString(36).substr(2, 9),
                                            title: goalTitle,
                                            targetAmount: parseInt(goalTarget),
                                            currentAmount: parseInt(goalCurrent) || 0,
                                            createdAt: new Date()
                                        });
                                    }
                                    setIsDialogOpen(false);
                                }}
                                disabled={!goalTitle || !goalTarget}
                            >
                                {editingGoal ? '수정하기' : '추가하기'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <PiggyBank className="w-5 h-5 text-primary" />
                            월별 목표 설정
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>월 수입 목표</Label>
                            <Input
                                type="number"
                                value={monthlyGoals.income}
                                onChange={e => setMonthlyGoals({ ...monthlyGoals, income: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>월 저축 목표</Label>
                            <Input
                                type="number"
                                value={monthlyGoals.saving}
                                onChange={e => setMonthlyGoals({ ...monthlyGoals, saving: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>월 소비 예산</Label>
                            <Input
                                type="number"
                                value={monthlyGoals.spending}
                                onChange={e => setMonthlyGoals({ ...monthlyGoals, spending: parseInt(e.target.value) })}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

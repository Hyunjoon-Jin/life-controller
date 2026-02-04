'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { TrendingUp, TrendingDown, Target, PiggyBank, Briefcase, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FundManagement() {
    const { transactions, assets } = useData();
    const [currentDate, setCurrentDate] = useState(new Date());

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
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border">
                                <div>
                                    <div className="font-bold">주택 마련 기금</div>
                                    <div className="text-xs text-muted-foreground">목표: 500,000,000원</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-primary">25% 달성</div>
                                    <div className="text-xs text-muted-foreground">현: 125,000,000원</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border">
                                <div>
                                    <div className="font-bold">노후 자금</div>
                                    <div className="text-xs text-muted-foreground">목표: 1,000,000,000원</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-primary">10% 달성</div>
                                    <div className="text-xs text-muted-foreground">현: 100,000,000원</div>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full dashed border-2">
                            <Plus className="w-4 h-4 mr-2" /> 새 계획 추가
                        </Button>
                    </CardContent>
                </Card>

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

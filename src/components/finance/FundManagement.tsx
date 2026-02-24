'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { FinanceGoal } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, isSameMonth } from 'date-fns';
import {
    TrendingUp, TrendingDown, Target, PiggyBank, Briefcase,
    Plus, Trash2, ArrowUpRight, Activity, Terminal, ShieldCheck,
    Zap, Fingerprint, MousePointer2, Globe
} from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

export function FundManagement() {
    const { transactions, assets, financeGoals, addFinanceGoal, updateFinanceGoal, deleteFinanceGoal } = useData();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<FinanceGoal | null>(null);

    // Goal Form
    const [goalTitle, setGoalTitle] = useState('');
    const [goalTarget, setGoalTarget] = useState('');
    const [goalCurrent, setGoalCurrent] = useState('');

    // Goals for the month
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
        <div className="h-full flex flex-col glass-premium rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] via-transparent to-indigo-500/[0.03] pointer-events-none" />

            {/* Header / Protocol Indicator */}
            <div className="p-8 pb-4 relative z-10">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(16,185,129,0.5)]">
                            <Briefcase className="w-6 h-6 text-white" strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">자금 운용 현황</h2>
                            <p className="text-[10px] font-bold text-white/20 tracking-[0.3em] uppercase mt-2 italic flex items-center gap-2">
                                <Terminal className="w-3 h-3 text-emerald-500" /> 재무 쿼터: 시스템 동기화됨
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[9px] font-black text-white/20 tracking-widest uppercase">현재 필터 주기 (CYCLE)</span>
                        <div className="text-sm font-bold text-white/40 uppercase">{format(currentDate, 'yyyy년 MM월')}</div>
                    </div>
                </div>

                {/* Fiscal Quotas Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                        { label: '주요 수입 (INCOME)', actual: actualIncome, goal: monthlyGoals.income, progress: incomeProgress, icon: TrendingUp, color: 'text-indigo-400', bg: 'from-indigo-500/[0.05]' },
                        { label: '저축 적립액 (SAVINGS)', actual: actualSaving, goal: monthlyGoals.saving, progress: savingProgress, icon: PiggyBank, color: 'text-emerald-400', bg: 'from-emerald-500/[0.05]' },
                        { label: '지출 노출도 (EXPENSE)', actual: actualSpending, goal: monthlyGoals.spending, progress: spendingProgress, icon: TrendingDown, color: spendingProgress > 90 ? 'text-rose-400' : 'text-amber-400', bg: 'from-amber-500/[0.05]' }
                    ].map((item, idx) => (
                        <Card key={idx} className={cn("glass-premium border-white/10 bg-gradient-to-br to-transparent overflow-hidden rounded-[32px]", item.bg)}>
                            <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-white/20 tracking-widest uppercase">{item.label}</span>
                                    <item.icon className={cn("w-4 h-4", item.color)} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-white tracking-tighter">{item.actual.toLocaleString()}</span>
                                        <span className="text-[10px] font-bold text-white/10 uppercase">KRW</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[8px] font-black text-white/20 tracking-widest uppercase mb-1">
                                        <span>배정 쿼터: {item.goal.toLocaleString()}</span>
                                        <span>{Math.round(item.progress)}% 달성</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.progress}%` }}
                                            className={cn("h-full", item.color.replace('text', 'bg'))}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Strategic Plans Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[10px] font-black text-white/20 tracking-[0.4em] uppercase flex items-center gap-3">
                                <Target className="w-3 h-3 text-emerald-500" /> 거시적 재무 목표 (MACRO)
                            </h3>
                            <Button
                                onClick={() => { setEditingGoal(null); setGoalTitle(''); setGoalTarget(''); setGoalCurrent('0'); setIsDialogOpen(true); }}
                                variant="ghost" className="h-8 text-[8px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest gap-2"
                            >
                                <Plus className="w-3 h-3" strokeWidth={3} /> 신규 플랜 초기화
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {financeGoals.map((goal, idx) => {
                                    const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={goal.id}
                                            className="group glass-premium rounded-[32px] border border-white/5 p-6 hover:bg-white/[0.02] transition-all relative overflow-hidden cursor-pointer"
                                            onClick={() => {
                                                setEditingGoal(goal);
                                                setGoalTitle(goal.title);
                                                setGoalTarget(goal.targetAmount.toString());
                                                setGoalCurrent(goal.currentAmount.toString());
                                                setIsDialogOpen(true);
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h4 className="text-lg font-black text-white tracking-tight uppercase mb-1">{goal.title}</h4>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[8px] font-black text-white/20 tracking-widest uppercase">목표 금액: {goal.targetAmount.toLocaleString()} KRW</span>
                                                        <span className="text-[8px] font-black text-emerald-400 tracking-widest uppercase">{progress.toFixed(1)}% 달성</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteFinanceGoal(goal.id); }}
                                                    className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-rose-500 hover:text-white"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                                />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            {financeGoals.length === 0 && (
                                <div className="h-32 flex flex-col items-center justify-center opacity-10 gap-3 border-2 border-dashed border-white/10 rounded-[32px]">
                                    <Target className="w-8 h-8" />
                                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase">등록된 전략적 플랜이 없습니다</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-white/20 tracking-[0.4em] uppercase px-2 flex items-center gap-3">
                            <PiggyBank className="w-3 h-3 text-indigo-400" /> 재무 쿼터 파라미터 보정
                        </h3>
                        <div className="glass-premium rounded-[40px] border border-white/5 p-10 space-y-8 bg-gradient-to-br from-white/[0.02] to-transparent">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2 italic">월 수입 목표 (REVENUE TARGET)</Label>
                                <Input
                                    type="number"
                                    className="h-14 font-black text-xl tracking-tighter bg-white/5 border-white/5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    value={monthlyGoals.income}
                                    onChange={e => setMonthlyGoals({ ...monthlyGoals, income: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2 italic">자산 적립 쿼터 (SAVINGS)</Label>
                                <Input
                                    type="number"
                                    className="h-14 font-black text-xl tracking-tighter bg-white/5 border-white/5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={monthlyGoals.saving}
                                    onChange={e => setMonthlyGoals({ ...monthlyGoals, saving: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2 italic">최대 지출 노출 한도 (SPENDING)</Label>
                                <Input
                                    type="number"
                                    className="h-14 font-black text-xl tracking-tighter bg-white/5 border-white/5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-rose-500/20"
                                    value={monthlyGoals.spending}
                                    onChange={e => setMonthlyGoals({ ...monthlyGoals, spending: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="pt-4 opacity-10 flex items-center gap-3 justify-center">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-[8px] font-black tracking-[0.5em] uppercase">보안 프로토콜 활성화됨 (SECURE ACTIVE)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plan Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass-premium border border-white/10 text-white rounded-[40px] p-0 shadow-2xl sm:max-w-xl overflow-hidden">
                    <DialogHeader className="p-10 pb-0">
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase mb-2">{editingGoal ? '재무 전략 보정' : '신규 전략 초기화'}</DialogTitle>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] italic">장기적인 거시 재무 목표를 보정하고 설정하십시오</p>
                    </DialogHeader>
                    <div className="p-10 pt-4 space-y-8">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">전략 목표 식별자 (NAME)</Label>
                            <Input
                                placeholder="예: 아파트 청약 자금, 비상금 적립..."
                                value={goalTitle}
                                onChange={e => setGoalTitle(e.target.value)}
                                className="h-14 font-black text-[10px] tracking-widest uppercase bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/10"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">목표 금액 (TARGET / KRW)</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={goalTarget}
                                    onChange={e => setGoalTarget(e.target.value)}
                                    className="h-14 font-black text-sm tracking-widest bg-white/5 border-white/5 rounded-2xl text-white"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">현재 적립액 (CURRENT)</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={goalCurrent}
                                    onChange={e => setGoalCurrent(e.target.value)}
                                    className="h-14 font-black text-sm tracking-widest bg-white/5 border-white/5 rounded-2xl text-white"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-10 pt-0">
                        <Button
                            onClick={() => {
                                if (!goalTitle || !goalTarget) return;
                                if (editingGoal) {
                                    updateFinanceGoal({ ...editingGoal, title: goalTitle, targetAmount: parseInt(goalTarget), currentAmount: parseInt(goalCurrent) || 0 });
                                } else {
                                    addFinanceGoal({ id: generateId(), title: goalTitle, targetAmount: parseInt(goalTarget), currentAmount: parseInt(goalCurrent) || 0, createdAt: new Date() });
                                }
                                setIsDialogOpen(false);
                            }}
                            disabled={!goalTitle || !goalTarget}
                            className="w-full h-16 rounded-3xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm tracking-[0.2em] shadow-2xl active:scale-95 transition-all uppercase"
                        >
                            전략 플랜 승인 및 저장
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

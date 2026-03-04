'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from "@/components/ui/progress";
import { format, isSameMonth, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
    Plus, Trash2, Edit2, TrendingUp, TrendingDown, DollarSign,
    CheckSquare, ChevronLeft, ChevronRight, Target, PieChart,
    Settings2, ArrowUpRight, ArrowDownRight, Activity, Terminal,
    ShieldCheck, Calendar, Wallet, Zap, Fingerprint
} from 'lucide-react';
import { Transaction, MonthlyBudget } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export function LedgerView() {
    const { transactions, assets, addTransaction, deleteTransaction, updateTransaction, monthlyBudgets, updateMonthlyBudget } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [currentDate, setCurrentDate] = useState(new Date());

    // Form State
    const [date, setDate] = useState<Date>(new Date());
    const [type, setType] = useState<'income' | 'expense' | 'transfer' | 'investment' | 'saving' | 'repayment' | 'card_bill'>('expense');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [assetId, setAssetId] = useState<string>('');
    const [targetAssetId, setTargetAssetId] = useState<string>('');
    const [cardId, setCardId] = useState<string>('');
    const [tags, setTags] = useState('');

    // Budget Form State
    const [budgetAmount, setBudgetAmount] = useState('');
    const [budgetGoal, setBudgetGoal] = useState('');

    const monthlyTransactions = transactions.filter(t =>
        isSameMonth(new Date(t.date), currentDate)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentBudgetId = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    const currentBudget = monthlyBudgets.find(b => b.id === currentBudgetId);

    const budgetProgress = currentBudget && currentBudget.amount > 0
        ? Math.min((totalExpense / currentBudget.amount) * 100, 100)
        : 0;

    const handleSaveBudget = () => {
        if (!budgetAmount) return;
        const newBudget: MonthlyBudget = {
            id: currentBudgetId, year: currentYear, month: currentMonth,
            amount: parseInt(budgetAmount), goal: budgetGoal
        };
        updateMonthlyBudget(newBudget);
        setIsBudgetDialogOpen(false);
    };

    const openBudgetDialog = () => {
        setBudgetAmount(currentBudget?.amount.toString() || '');
        setBudgetGoal(currentBudget?.goal || '');
        setIsBudgetDialogOpen(true);
    };

    const handleSave = () => {
        if (!category || !amount) return;
        const transaction: Transaction = {
            id: editingId || generateId(),
            date: date, type: type as any, category,
            amount: parseInt(amount), description,
            assetId: assetId || undefined, targetAssetId: targetAssetId || undefined,
            cardId: cardId || undefined,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        };
        if (editingId) updateTransaction(transaction);
        else addTransaction(transaction);
        setIsDialogOpen(false); resetForm();
    };

    const handleEdit = (t: Transaction) => {
        setEditingId(t.id); setDate(new Date(t.date)); setType(t.type as any);
        setCategory(t.category); setAmount(t.amount.toString()); setDescription(t.description);
        setAssetId(t.assetId || ''); setTargetAssetId(t.targetAssetId || '');
        setCardId(t.cardId || ''); setTags(t.tags?.join(', ') || '');
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingId(null); setDate(new Date()); setType('expense'); setCategory('');
        setAmount(''); setDescription(''); setAssetId(''); setTargetAssetId('');
        setCardId(''); setTags('');
    };

    return (
        <div className="h-full flex flex-col glass-premium rounded-[32px] border border-border shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-rose-500/[0.03] pointer-events-none" />

            {/* Header / Month Switcher */}
            <div className="p-8 pb-4 relative z-10">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(99,102,241,0.5)]">
                            <Fingerprint className="w-6 h-6 text-white" strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-semibold text-foreground tracking-tight leading-none">통합 가계부</h2>
                            <p className="text-sm font-medium text-muted-foreground mt-2">
                                월별 수입/지출 내역 관리
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-muted p-1.5 rounded-2xl border border-border flex items-center gap-4">
                            <button
                                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                                className="w-10 h-10 rounded-xl hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="font-semibold text-foreground text-sm min-w-[120px] text-center">
                                {format(currentDate, 'MMMM yyyy', { locale: ko })}
                            </span>
                            <button
                                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                                className="w-10 h-10 rounded-xl hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                        <Button
                            onClick={() => { resetForm(); setIsDialogOpen(true); }}
                            className="h-12 px-6 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm shadow-xl transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4 mr-2" strokeWidth={3} /> 새 내역 추가하기
                        </Button>
                    </div>
                </div>

                {/* Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-card border-border bg-gradient-to-br from-indigo-500/[0.05] to-transparent overflow-hidden rounded-[32px] md:col-span-1">
                        <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">순수입/지출</span>
                                <Activity className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className={cn("text-2xl font-bold", balance >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                    {balance >= 0 ? '+' : ''}{balance.toLocaleString()}
                                </span>
                                <span className="text-xs text-muted-foreground">이번 달 재무 현황</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border bg-gradient-to-br from-emerald-500/[0.05] to-transparent overflow-hidden rounded-[32px] md:col-span-1">
                        <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">총 수입</span>
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-emerald-400">+{totalIncome.toLocaleString()}</span>
                                <span className="text-xs text-muted-foreground">이번 달 수입</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border bg-gradient-to-br from-rose-500/[0.05] to-transparent overflow-hidden rounded-[32px] md:col-span-1">
                        <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">총 지출</span>
                                <TrendingDown className="w-4 h-4 text-rose-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-rose-400">-{totalExpense.toLocaleString()}</span>
                                <span className="text-xs text-muted-foreground">이번 달 지출</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border bg-indigo-500/10 overflow-hidden rounded-[32px] md:col-span-1 cursor-pointer hover:bg-indigo-500/20 transition-all border-dashed" onClick={openBudgetDialog}>
                        <CardContent className="p-6 flex flex-col justify-between h-full gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-indigo-400">예산</span>
                                <Target className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                    <span>소진율</span>
                                    <span>{Math.round(budgetProgress)}%</span>
                                </div>
                                <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden border border-border">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${budgetProgress}%` }}
                                        className={cn("h-full", budgetProgress > 90 ? "bg-rose-500" : budgetProgress > 70 ? "bg-amber-500" : "bg-indigo-500")}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground text-right">클릭하여 예산 설정</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Transaction List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0 relative z-10">
                <div className="max-w-6xl mx-auto space-y-4">
                    <AnimatePresence mode="popLayout">
                        {monthlyTransactions.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center opacity-30 gap-6 border-2 border-dashed border-border rounded-[48px]">
                                <CheckSquare className="w-16 h-16 text-muted-foreground" />
                                <div className="text-center space-y-1">
                                    <h3 className="text-xl font-semibold text-muted-foreground">내역이 없습니다</h3>
                                </div>
                            </div>
                        ) : (
                            monthlyTransactions.map((t, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    key={t.id}
                                    className="group glass-premium rounded-[32px] border border-border p-6 transition-all hover:bg-muted/20 flex items-center justify-between relative overflow-hidden"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-500" />

                                    <div className="flex items-center gap-8">
                                        <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex flex-col items-center justify-center shrink-0">
                                            <span className="text-xs font-medium text-muted-foreground leading-none mb-1">{format(new Date(t.date), 'MMM')}</span>
                                            <span className="text-xl font-bold text-foreground leading-none">{format(new Date(t.date), 'dd')}</span>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "px-3 py-1 rounded-lg text-xs font-medium border",
                                                    t.type === 'income' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                        t.type === 'expense' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                            "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                                )}>
                                                    {t.category}
                                                </div>
                                                <span className="text-xs text-muted-foreground">{format(new Date(t.date), 'HH:mm')}</span>
                                            </div>
                                            <h4 className="text-sm font-semibold text-foreground">{t.description || '내용 없음'}</h4>
                                            {t.tags && t.tags.length > 0 && (
                                                <div className="flex gap-2">
                                                    {t.tags.map(tag => (
                                                        <span key={tag} className="text-xs text-muted-foreground">#{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <div className={cn(
                                                "text-xl font-bold",
                                                t.type === 'income' ? "text-emerald-400" :
                                                    t.type === 'expense' ? "text-rose-400" : "text-foreground"
                                            )}>
                                                {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}{t.amount.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-muted-foreground">원</div>
                                        </div>

                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => handleEdit(t)} className="w-10 h-10 rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center shadow-xl">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => deleteTransaction(t.id)} className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-xl">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Dialogs */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass-premium border border-border rounded-[40px] p-0 shadow-2xl sm:max-w-2xl max-h-[90vh] overflow-hidden">
                    <DialogHeader className="p-10 pb-0">
                        <DialogTitle className="text-2xl font-semibold text-foreground mb-2">{editingId ? '거래 내역 수정' : '새 거래 추가'}</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto custom-scrollbar p-10 pt-4 space-y-8">
                        <div className="grid gap-6">
                            <div className="space-y-3">
                                <Label className="text-xs font-medium text-muted-foreground ml-2">날짜</Label>
                                <DateTimePicker date={date} setDate={setDate} />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-medium text-muted-foreground ml-2">거래 유형</Label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'income', label: '수입', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' },
                                        { id: 'expense', label: '지출', color: 'border-rose-500/20 text-rose-400 bg-rose-500/5' },
                                        { id: 'transfer', label: '이체', color: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5' }
                                    ].map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => setType(item.id as any)}
                                            className={cn(
                                                "h-14 rounded-2xl border text-xs font-medium transition-all active:scale-95",
                                                type === item.id ? item.color : "border-border text-muted-foreground hover:border-border/80"
                                            )}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-xs font-medium text-muted-foreground ml-2">분류</Label>
                                    <Input
                                        placeholder="식비, 월급, 월세 등"
                                        className="h-12 text-sm bg-background border-border rounded-2xl text-foreground"
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-medium text-muted-foreground ml-2">금액 (원)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        className="h-12 text-sm bg-background border-border rounded-2xl text-foreground"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-medium text-muted-foreground ml-2">계좌</Label>
                                <select
                                    className="flex h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none"
                                    value={type === 'expense' && cardId ? cardId : assetId}
                                    onChange={e => {
                                        const val = e.target.value;
                                        const selectedAsset = assets.find(a => a.id === val);
                                        if (type === 'expense' && selectedAsset?.type === 'credit_card') {
                                            setCardId(val); setAssetId('');
                                        } else {
                                            setAssetId(val); setCardId('');
                                        }
                                    }}
                                >
                                    <option value="">선택 안 함</option>
                                    <optgroup label="자산">
                                        {assets.filter(a => a.type !== 'credit_card' && a.type !== 'loan').map(a => (
                                            <option key={a.id} value={a.id}>{a.name} ({a.balance.toLocaleString()})</option>
                                        ))}
                                    </optgroup>
                                    {type === 'expense' && (
                                        <optgroup label="신용카드">
                                            {assets.filter(a => a.type === 'credit_card').map(a => (
                                                <option key={a.id} value={a.id}>{a.name} (지출: {a.balance.toLocaleString()})</option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-medium text-muted-foreground ml-2">상세 내용</Label>
                                <Input
                                    placeholder="거래 상세 정보 입력..."
                                    className="h-12 bg-background border-border rounded-2xl text-foreground placeholder:text-muted-foreground text-sm"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-10 pt-4 bg-muted/30 border-t border-border">
                        <Button
                            onClick={handleSave}
                            disabled={!amount || !category}
                            className="w-full h-16 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm shadow-2xl active:scale-95 transition-all"
                        >
                            가계부에 기록 저장
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Budget Dialog */}
            <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
                <DialogContent className="glass-premium border border-border rounded-[40px] p-0 shadow-2xl sm:max-w-md overflow-hidden">
                    <DialogHeader className="p-10 pb-0">
                        <DialogTitle className="text-2xl font-semibold text-foreground mb-2">예산 목표 설정</DialogTitle>
                    </DialogHeader>
                    <div className="p-10 pt-4 space-y-8">
                        <div className="space-y-3">
                            <Label className="text-xs font-medium text-muted-foreground ml-2">예산 목표</Label>
                            <Input
                                placeholder="예: 저축률 향상, 불필요한 지출 감소..."
                                className="h-14 text-sm border-border bg-background rounded-2xl text-foreground placeholder:text-muted-foreground"
                                value={budgetGoal}
                                onChange={e => setBudgetGoal(e.target.value)}
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-xs font-medium text-muted-foreground ml-2">예산 한도 (원)</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                className="h-14 text-xl border-border bg-background rounded-2xl text-foreground"
                                value={budgetAmount}
                                onChange={e => setBudgetAmount(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter className="p-10 pt-0">
                        <Button onClick={handleSaveBudget} disabled={!budgetAmount} className="w-full h-14 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm shadow-xl transition-all active:scale-95">
                            저장
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

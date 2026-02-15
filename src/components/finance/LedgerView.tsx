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
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown, DollarSign, CheckSquare, ChevronLeft, ChevronRight, Target, PieChart, Settings2 } from 'lucide-react';
import { Transaction, MonthlyBudget } from '@/types';

export function LedgerView() {
    const { transactions, assets, addTransaction, deleteTransaction, updateTransaction, monthlyBudgets, updateMonthlyBudget } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false); // New Dialog State
    const [editingId, setEditingId] = useState<string | null>(null);

    // Filter by month
    const [currentDate, setCurrentDate] = useState(new Date());

    // Form State
    const [date, setDate] = useState<Date>(new Date());
    const [type, setType] = useState<'income' | 'expense' | 'transfer' | 'investment' | 'saving' | 'repayment' | 'card_bill'>('expense');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [assetId, setAssetId] = useState<string>('');
    const [targetAssetId, setTargetAssetId] = useState<string>('');
    const [cardId, setCardId] = useState<string>(''); // New: For Credit Card expense
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

    // Budget Calculation
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
            id: currentBudgetId,
            year: currentYear,
            month: currentMonth,
            amount: parseInt(budgetAmount),
            goal: budgetGoal
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
            date: date,
            type: type as any,
            category,
            amount: parseInt(amount),
            description,
            assetId: assetId || undefined,
            targetAssetId: targetAssetId || undefined,
            cardId: cardId || undefined, // New
            tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        if (editingId) {
            updateTransaction(transaction);
        } else {
            addTransaction(transaction);
        }

        setIsDialogOpen(false);
        resetForm();
    };

    const handleEdit = (t: Transaction) => {
        setEditingId(t.id);
        setDate(new Date(t.date));
        setType(t.type as any);
        setCategory(t.category);
        setAmount(t.amount.toString());
        setDescription(t.description);
        setAssetId(t.assetId || '');
        setTargetAssetId(t.targetAssetId || '');
        setCardId(t.cardId || ''); // New
        setTags(t.tags?.join(', ') || '');
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setDate(new Date());
        setType('expense');
        setCategory('');
        setAmount('');
        setDescription('');
        setAssetId('');
        setTargetAssetId('');
        setCardId(''); // New
        setTags('');
    };

    // ... (Group by Date remains same)

    return (
        <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <CheckSquare className="w-6 h-6 text-primary" /> 가계부
                    </h2>
                    <p className="text-muted-foreground text-sm">이번 달 수입과 지출을 관리하세요.</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-1 rounded-xl border shadow-sm">
                    <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="font-bold text-lg min-w-[100px] text-center">
                        {format(currentDate, 'yyyy년 M월')}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> 내역 추가
                </Button>
            </div>

            {/* Summary Cards - Mobile Horizontal Scroll */}
            <div className="flex overflow-x-auto pb-4 gap-4 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory">
                {/* Monthly Goal & Budget Card */}
                <Card className="min-w-[300px] md:min-w-0 md:col-span-4 bg-gradient-to-r from-slate-50 to-white border-l-4 border-l-primary snap-center">
                    <CardContent className="p-4 md:p-6 flex flex-col md:flex-row gap-6 items-center justify-between h-full">
                        <div className="flex-1 space-y-2 w-full">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                                    <Target className="w-5 h-5 text-primary" />
                                    {currentMonth}월의 목표
                                </h3>
                                <Button variant="ghost" size="sm" onClick={openBudgetDialog} className="h-8 text-muted-foreground hover:text-primary">
                                    <Settings2 className="w-4 h-4 mr-1" /> 설정
                                </Button>
                            </div>

                            {currentBudget ? (
                                <div className="space-y-4">
                                    {currentBudget.goal && <p className="text-lg text-slate-700 font-medium">&quot;{currentBudget.goal}&quot;</p>}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">예산 소진율 ({Math.round(budgetProgress)}%)</span>
                                            <span className="font-bold">
                                                {totalExpense.toLocaleString()} / {currentBudget.amount.toLocaleString()}원
                                            </span>
                                        </div>
                                        <Progress value={budgetProgress} className={cn("h-3", budgetProgress >= 100 ? "bg-red-100 [&>div]:bg-red-500" : budgetProgress >= 80 ? "bg-orange-100 [&>div]:bg-orange-500" : "[&>div]:bg-primary")} />
                                        {currentBudget.amount - totalExpense < 0 ? (
                                            <p className="text-xs text-red-500 text-right font-medium">예산 {Math.abs(currentBudget.amount - totalExpense).toLocaleString()}원 초과!</p>
                                        ) : (
                                            <p className="text-xs text-muted-foreground text-right">남은 예산: {(currentBudget.amount - totalExpense).toLocaleString()}원</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-2 text-muted-foreground">
                                    <p className="mb-2">아직 이번 달 목표와 예산이 설정되지 않았습니다.</p>
                                    <Button variant="outline" size="sm" onClick={openBudgetDialog}>목표 설정하기</Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="min-w-[160px] md:min-w-0 snap-center">
                    <CardContent className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between h-full gap-2 md:gap-0">
                        <div>
                            <p className="text-xs md:text-sm font-medium text-muted-foreground">이번 달 수입</p>
                            <h3 className="text-xl md:text-2xl font-bold text-blue-600">+{totalIncome.toLocaleString()}원</h3>
                        </div>
                        <div className="p-2 md:p-3 bg-blue-50 rounded-full w-fit">
                            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="min-w-[160px] md:min-w-0 snap-center">
                    <CardContent className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between h-full gap-2 md:gap-0">
                        <div>
                            <p className="text-xs md:text-sm font-medium text-muted-foreground">이번 달 지출</p>
                            <h3 className="text-xl md:text-2xl font-bold text-red-600">-{totalExpense.toLocaleString()}원</h3>
                        </div>
                        <div className="p-2 md:p-3 bg-red-50 rounded-full w-fit">
                            <TrendingDown className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="min-w-[160px] md:min-w-0 snap-center">
                    <CardContent className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between h-full gap-2 md:gap-0">
                        <div>
                            <p className="text-xs md:text-sm font-medium text-muted-foreground">남은 금액</p>
                            <h3 className={cn("text-xl md:text-2xl font-bold", balance >= 0 ? "text-green-600" : "text-red-600")}>
                                {balance.toLocaleString()}원
                            </h3>
                        </div>
                        <div className="p-2 md:p-3 bg-green-50 rounded-full w-fit">
                            <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction List */}
            <Card className="flex-1 overflow-hidden flex flex-col">
                <CardContent className="flex-1 overflow-y-auto p-0">
                    {monthlyTransactions.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                            <CheckSquare className="w-12 h-12 mb-4 opacity-20" />
                            <p>이 달의 거래 내역이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {monthlyTransactions.map(t => (
                                <div key={t.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                                            t.type === 'income' ? "bg-blue-500" :
                                                t.type === 'expense' ? "bg-red-500" : "bg-purple-500"
                                        )}>
                                            {t.date ? format(new Date(t.date), 'dd') : ''}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{t.category} <span className="text-xs font-normal text-muted-foreground block md:inline md:ml-2">{t.description}</span></p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(t.date), 'HH:mm')} • {t.type === 'income' ? '수입' : t.type === 'expense' ? '지출' : '이체/기타'}
                                                {t.tags && t.tags.length > 0 && <span className="ml-2 text-blue-500">#{t.tags.join(' #')}</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={cn(
                                            "font-bold text-lg",
                                            t.type === 'income' ? "text-blue-600" :
                                                t.type === 'expense' ? "text-red-600" : "text-purple-600"
                                        )}>
                                            {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}{t.amount.toLocaleString()}원
                                        </span>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => handleEdit(t)}>
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => deleteTransaction(t.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? '내역 수정' : '내역 추가'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>날짜</Label>
                            <DateTimePicker date={date} setDate={setDate} />
                        </div>
                        <div className="grid gap-2">
                            <Label>구분</Label>
                            <div className="flex gap-2 flex-wrap">
                                <Button
                                    type="button"
                                    variant={type === 'income' ? 'default' : 'outline'}
                                    className={cn("flex-1", type === 'income' && "bg-blue-600 hover:bg-blue-700")}
                                    onClick={() => setType('income')}
                                >
                                    수입
                                </Button>
                                <Button
                                    type="button"
                                    variant={type === 'expense' ? 'default' : 'outline'}
                                    className={cn("flex-1", type === 'expense' && "bg-red-600 hover:bg-red-700")}
                                    onClick={() => setType('expense')}
                                >
                                    지출
                                </Button>
                                <Button
                                    type="button"
                                    variant={['transfer', 'investment', 'saving', 'repayment', 'card_bill'].includes(type) ? 'default' : 'outline'}
                                    className={cn("flex-1", ['transfer', 'investment', 'saving', 'repayment', 'card_bill'].includes(type) && "bg-purple-600 hover:bg-purple-700")}
                                    onClick={() => setType('transfer')}
                                >
                                    기타(이체/카드/대출)
                                </Button>
                            </div>
                            {['transfer', 'investment', 'saving', 'repayment', 'card_bill'].includes(type) && (
                                <div className="flex gap-2 mt-1 flex-wrap">
                                    <Button size="sm" variant={type === 'transfer' ? 'secondary' : 'ghost'} onClick={() => setType('transfer')}>이체</Button>
                                    <Button size="sm" variant={type === 'investment' ? 'secondary' : 'ghost'} onClick={() => setType('investment')}>투자</Button>
                                    <Button size="sm" variant={type === 'saving' ? 'secondary' : 'ghost'} onClick={() => setType('saving')}>저축</Button>
                                    <Button size="sm" variant={type === 'repayment' ? 'secondary' : 'ghost'} onClick={() => setType('repayment')}>대출상환</Button>
                                    <Button size="sm" variant={type === 'card_bill' ? 'secondary' : 'ghost'} onClick={() => setType('card_bill')}>카드대금</Button>
                                </div>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label>카테고리</Label>
                            <Input
                                placeholder={type === 'income' ? "예: 월급, 용돈" : (type === 'expense' ? "예: 식비, 쇼핑" : "예: 적금불입, 주식매수")}
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>금액</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>
                                {type === 'expense' ? '결제 수단' :
                                    (['transfer', 'investment', 'saving', 'repayment', 'card_bill'].includes(type) ? '출금 자산 (From)' : '연동 자산 (선택)')}
                            </Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={type === 'expense' && cardId ? cardId : assetId}
                                onChange={e => {
                                    const val = e.target.value;
                                    const selectedAsset = assets.find(a => a.id === val);
                                    if (type === 'expense') {
                                        if (selectedAsset?.type === 'credit_card') {
                                            setCardId(val);
                                            setAssetId('');
                                        } else {
                                            setAssetId(val);
                                            setCardId('');
                                        }
                                    } else {
                                        setAssetId(val);
                                    }
                                }}
                            >
                                <option value="">{['transfer', 'investment', 'saving', 'repayment', 'card_bill'].includes(type) ? '선택 필수' : '선택 안 함'}</option>
                                <optgroup label="계좌 / 현금">
                                    {assets.filter(a => a.type !== 'credit_card' && a.type !== 'loan').map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.name} ({a.balance.toLocaleString()}원)
                                        </option>
                                    ))}
                                </optgroup>
                                {type === 'expense' && (
                                    <optgroup label="신용카드">
                                        {assets.filter(a => a.type === 'credit_card').map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.name} (누적 {a.balance.toLocaleString()}원)
                                            </option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                        </div>
                        {['transfer', 'investment', 'saving', 'repayment'].includes(type) && (
                            <div className="grid gap-2">
                                <Label>{type === 'repayment' ? '상환할 대출 자산' : '입금 자산 (To)'}</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    value={targetAssetId}
                                    onChange={e => setTargetAssetId(e.target.value)}
                                >
                                    <option value="">선택 필수</option>
                                    {assets.filter(a => a.id !== assetId && (type === 'repayment' ? a.type === 'loan' : a.type !== 'loan' && a.type !== 'credit_card')).map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.name} ({a.balance.toLocaleString()}원)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label>내용 (선택)</Label>
                            <Input
                                placeholder="상세 내용 메모"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>태그</Label>
                            <Input
                                placeholder="#식비 #데이트 (콤마로 구분)"
                                value={tags}
                                onChange={e => setTags(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave} disabled={!amount || !category}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Budget Setting Dialog */}
            <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentMonth}월 목표 및 예산 설정</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>이번 달 목표 (다짐)</Label>
                            <Input
                                placeholder="예: 배달 음식 줄이기, 100만원 저축하기"
                                value={budgetGoal}
                                onChange={e => setBudgetGoal(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>월 예산 (목표 지출액)</Label>
                            <Input
                                type="number"
                                placeholder="금액 입력 (원)"
                                value={budgetAmount}
                                onChange={e => setBudgetAmount(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveBudget} disabled={!budgetAmount}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

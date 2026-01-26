'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format, isSameMonth, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Transaction } from '@/types';

export function LedgerView() {
    const { transactions, assets, addTransaction, deleteTransaction, updateTransaction } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Filter by month
    const [currentDate, setCurrentDate] = useState(new Date());

    // Form State
    const [date, setDate] = useState<Date>(new Date());
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [assetId, setAssetId] = useState<string>('');
    const [tags, setTags] = useState('');

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
        setTags('');
    };

    // Group by Date for display
    const groupedTransactions = monthlyTransactions.reduce((acc, t) => {
        const dateKey = format(new Date(t.date), 'yyyy-MM-dd');
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(t);
        return acc;
    }, {} as Record<string, Transaction[]>);

    return (
        <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar">
            {/* Header / Summary */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold">
                            {format(currentDate, 'M월')} 가계부
                        </h2>
                        <div className="flex gap-1 ml-4">
                            <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
                                &lt;
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => setCurrentDate(new Date())}>
                                오늘
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
                                &gt;
                            </Button>
                        </div>
                    </div>
                    <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" /> 내역 추가
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardContent className="p-4 flex flex-col">
                            <span className="text-xs font-semibold text-blue-600 mb-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> 수입
                            </span>
                            <span className="text-lg font-bold text-blue-700">
                                +{totalIncome.toLocaleString()}원
                            </span>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50 border-red-100">
                        <CardContent className="p-4 flex flex-col">
                            <span className="text-xs font-semibold text-red-600 mb-1 flex items-center gap-1">
                                <TrendingDown className="w-3 h-3" /> 지출
                            </span>
                            <span className="text-lg font-bold text-red-700">
                                -{totalExpense.toLocaleString()}원
                            </span>
                        </CardContent>
                    </Card>
                    <Card className={cn("border", balance >= 0 ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-100")}>
                        <CardContent className="p-4 flex flex-col">
                            <span className={cn("text-xs font-semibold mb-1", balance >= 0 ? "text-green-600" : "text-gray-600")}>
                                합계
                            </span>
                            <span className={cn("text-lg font-bold", balance >= 0 ? "text-green-700" : "text-gray-700")}>
                                {balance.toLocaleString()}원
                            </span>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* List */}
            <div className="space-y-6">
                {Object.keys(groupedTransactions).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50">
                        <DollarSign className="w-12 h-12 mb-3" />
                        <p>거래 내역이 없습니다.</p>
                    </div>
                ) : (
                    Object.entries(groupedTransactions)
                        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                        .map(([dateKey, items]) => (
                            <div key={dateKey}>
                                <h3 className="text-sm font-bold text-slate-500 mb-2 border-b pb-1 flex justify-between items-end">
                                    <span>
                                        {format(parseISO(dateKey), 'dd일')} <span className="text-xs font-normal">({format(parseISO(dateKey), 'EE', { locale: ko })})</span>
                                    </span>
                                </h3>
                                <div className="space-y-2">
                                    {items.map(t => (
                                        <div key={t.id} className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm group transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center bg-opacity-10",
                                                    t.type === 'income' ? "bg-blue-500 text-blue-600" : "bg-red-500 text-red-600"
                                                )}>
                                                    {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">{t.category}</div>
                                                    <div className="text-xs text-muted-foreground">{t.description}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={cn(
                                                    "font-bold",
                                                    t.type === 'income' ? "text-blue-600" : "text-red-600"
                                                )}>
                                                    {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}원
                                                </span>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleEdit(t)}>
                                                        <Edit2 className="w-3 h-3 text-slate-400" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 hover:text-red-500" onClick={() => deleteTransaction(t.id)}>
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? '내역 수정' : '내역 추가'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>날짜</Label>
                            <Input
                                type="datetime-local"
                                value={date ? format(date, "yyyy-MM-dd'T'HH:mm") : ''}
                                onChange={e => setDate(new Date(e.target.value))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>구분</Label>
                            <div className="flex gap-2">
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
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>카테고리</Label>
                            <Input
                                placeholder={type === 'income' ? "예: 월급, 용돈, 보너스" : "예: 식비, 교통비, 쇼핑"}
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
                            <Label>연동 자산 (선택)</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={assetId}
                                onChange={e => setAssetId(e.target.value)}
                            >
                                <option value="">선택 안 함</option>
                                {assets.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.name} ({a.balance.toLocaleString()}원)
                                    </option>
                                ))}
                            </select>
                        </div>
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
        </div>
    );
}

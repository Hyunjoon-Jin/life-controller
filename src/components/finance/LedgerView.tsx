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
    const [type, setType] = useState<'income' | 'expense' | 'transfer' | 'investment' | 'saving'>('expense');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [assetId, setAssetId] = useState<string>('');
    const [targetAssetId, setTargetAssetId] = useState<string>(''); // New
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
            targetAssetId: targetAssetId || undefined, // New
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
        setTargetAssetId(t.targetAssetId || ''); // New
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
        setTargetAssetId(''); // New
        setTags('');
    };

    // ... (Group by Date remains same)

    return (
        <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar">
            {/* Header ... */}
            {/* List ... */}

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
                                    variant={['transfer', 'investment', 'saving'].includes(type) ? 'default' : 'outline'}
                                    className={cn("flex-1", ['transfer', 'investment', 'saving'].includes(type) && "bg-purple-600 hover:bg-purple-700")}
                                    onClick={() => setType('transfer')}
                                >
                                    이체/투자
                                </Button>
                            </div>
                            {['transfer', 'investment', 'saving'].includes(type) && (
                                <div className="flex gap-2 mt-1">
                                    <Button size="sm" variant={type === 'transfer' ? 'secondary' : 'ghost'} onClick={() => setType('transfer')}>이체</Button>
                                    <Button size="sm" variant={type === 'investment' ? 'secondary' : 'ghost'} onClick={() => setType('investment')}>투자</Button>
                                    <Button size="sm" variant={type === 'saving' ? 'secondary' : 'ghost'} onClick={() => setType('saving')}>저축</Button>
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
                            <Label>{['transfer', 'investment', 'saving'].includes(type) ? '출금 자산 (From)' : '연동 자산 (선택)'}</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={assetId}
                                onChange={e => setAssetId(e.target.value)}
                            >
                                <option value="">{['transfer', 'investment', 'saving'].includes(type) ? '선택 필수' : '선택 안 함'}</option>
                                {assets.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.name} ({a.balance.toLocaleString()}원)
                                    </option>
                                ))}
                            </select>
                        </div>
                        {['transfer', 'investment', 'saving'].includes(type) && (
                            <div className="grid gap-2">
                                <Label>입금 자산 (To)</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    value={targetAssetId}
                                    onChange={e => setTargetAssetId(e.target.value)}
                                >
                                    <option value="">선택 필수</option>
                                    {assets.filter(a => a.id !== assetId).map(a => (
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
        </div>
    );
}

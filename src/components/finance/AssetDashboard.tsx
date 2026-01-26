'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Edit2, Wallet, Landmark, TrendingUp, CreditCard, Building2, Coins } from 'lucide-react';
import { Asset } from '@/types';

export function AssetDashboard() {
    const { assets, addAsset, deleteAsset, updateAsset } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form
    const [name, setName] = useState('');
    const [type, setType] = useState<Asset['type']>('bank');
    const [balance, setBalance] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [memo, setMemo] = useState('');

    const totalAssets = assets
        .filter(a => !['loan', 'credit_card'].includes(a.type))
        .reduce((sum, a) => sum + a.balance, 0);

    const totalLiabilities = assets
        .filter(a => ['loan', 'credit_card'].includes(a.type))
        .reduce((sum, a) => sum + a.balance, 0);

    const netWorth = totalAssets - totalLiabilities;

    const handleSave = () => {
        if (!name || !balance) return;

        const asset: Asset = {
            id: editingId || generateId(),
            name,
            type,
            balance: parseInt(balance),
            currency: 'KRW',
            color: getTypeColor(type),
            accountNumber,
            interestRate: interestRate ? parseFloat(interestRate) : undefined,
            memo
        };

        if (editingId) {
            updateAsset(asset);
        } else {
            addAsset(asset);
        }

        setIsDialogOpen(false);
        resetForm();
    };

    const handleEdit = (a: Asset) => {
        setEditingId(a.id);
        setName(a.name);
        setType(a.type);
        setBalance(a.balance.toString());
        setAccountNumber(a.accountNumber || '');
        setInterestRate(a.interestRate?.toString() || '');
        setMemo(a.memo || '');
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setType('bank');
        setBalance('');
        setAccountNumber('');
        setInterestRate('');
        setMemo('');
    };

    const getTypeIcon = (type: Asset['type']) => {
        switch (type) {
            case 'bank': return Landmark;
            case 'cash': return Wallet;
            case 'stock': return TrendingUp;
            case 'real_estate': return Building2;
            case 'crypto': return Coins;
            case 'loan': return Landmark;
            case 'credit_card': return CreditCard;
            default: return Wallet;
        }
    };

    const getTypeLabel = (type: Asset['type']) => {
        switch (type) {
            case 'bank': return '예적금';
            case 'cash': return '현금';
            case 'stock': return '투자/주식';
            case 'real_estate': return '부동산';
            case 'crypto': return '가상화폐';
            case 'loan': return '대출';
            case 'credit_card': return '신용카드';
            default: return '기타';
        }
    };

    const getTypeColor = (type: Asset['type']) => {
        switch (type) {
            case 'bank': return 'bg-blue-500';
            case 'cash': return 'bg-green-500';
            case 'stock': return 'bg-red-500';
            case 'real_estate': return 'bg-purple-500';
            case 'crypto': return 'bg-yellow-500';
            case 'loan': return 'bg-slate-700';
            case 'credit_card': return 'bg-orange-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar">
            {/* Header / Net Worth */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Wallet className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">자산 현황</h2>
                </div>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> 자산 추가
                </Button>
            </div>

            <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none shadow-lg">
                <CardContent className="p-8 text-center">
                    <div className="text-sm opacity-70 mb-2">순자산 (Net Worth)</div>
                    <div className="text-4xl font-extrabold mb-6">
                        {netWorth.toLocaleString()}원
                    </div>
                    <div className="flex justify-center gap-12 text-sm">
                        <div className="text-center">
                            <div className="opacity-70 mb-1">총 자산</div>
                            <div className="text-blue-300 font-bold text-lg">{totalAssets.toLocaleString()}원</div>
                        </div>
                        <div className="w-px bg-white/20 h-10"></div>
                        <div className="text-center">
                            <div className="opacity-70 mb-1">총 부채</div>
                            <div className="text-red-300 font-bold text-lg">{totalLiabilities.toLocaleString()}원</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assets Column */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-500 rounded-full"></span> 자산
                    </h3>
                    {assets.filter(a => !['loan', 'credit_card'].includes(a.type)).map(asset => {
                        const Icon = getTypeIcon(asset.type);
                        return (
                            <div key={asset.id} className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white", getTypeColor(asset.type))}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold">{asset.name}</div>
                                        <div className="text-xs text-muted-foreground">{getTypeLabel(asset.type)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-lg">{asset.balance.toLocaleString()}원</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(asset)}>
                                            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-red-500" onClick={() => deleteAsset(asset.id)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {assets.filter(a => !['loan', 'credit_card'].includes(a.type)).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                            등록된 자산이 없습니다.
                        </div>
                    )}
                </div>

                {/* Liabilities Column */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <span className="w-2 h-6 bg-red-500 rounded-full"></span> 부채
                    </h3>
                    {assets.filter(a => ['loan', 'credit_card'].includes(a.type)).map(asset => {
                        const Icon = getTypeIcon(asset.type);
                        return (
                            <div key={asset.id} className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white", getTypeColor(asset.type))}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold">{asset.name}</div>
                                        <div className="text-xs text-muted-foreground">{getTypeLabel(asset.type)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-lg text-red-600">{asset.balance.toLocaleString()}원</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(asset)}>
                                            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-red-500" onClick={() => deleteAsset(asset.id)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {assets.filter(a => ['loan', 'credit_card'].includes(a.type)).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                            등록된 부채가 없습니다.
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? '자산 수정' : '자산 추가'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>자산명</Label>
                            <Input
                                placeholder="예: 국민은행 주거래, 카카오뱅크, 신한카드"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>종류</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={type}
                                onChange={e => setType(e.target.value as any)}
                            >
                                <option value="bank">예적금</option>
                                <option value="cash">현금</option>
                                <option value="stock">투자/주식</option>
                                <option value="real_estate">부동산</option>
                                <option value="crypto">가상화폐</option>
                                <option value="loan">대출 (부채)</option>
                                <option value="credit_card">신용카드 (부채)</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label>잔액 / 금액</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={balance}
                                onChange={e => setBalance(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>계좌번호 / 정보 (선택)</Label>
                            <Input
                                placeholder="계좌번호, 카드번호 등"
                                value={accountNumber}
                                onChange={e => setAccountNumber(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>이자율 (%) (선택)</Label>
                                <Input
                                    type="number"
                                    placeholder="연이율"
                                    step="0.01"
                                    value={interestRate}
                                    onChange={e => setInterestRate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>메모 (선택)</Label>
                            <Input
                                placeholder="추가 메모"
                                value={memo}
                                onChange={e => setMemo(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave} disabled={!name || !balance}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

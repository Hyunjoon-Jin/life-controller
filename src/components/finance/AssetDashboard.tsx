'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import {
    Plus, Trash2, Edit2, Wallet, Landmark, TrendingUp, TrendingDown, CreditCard,
    Building2, Coins, ArrowUpRight, ArrowDownRight, Activity,
    ShieldCheck, Zap, Globe, Fingerprint, Terminal, Sparkles
} from 'lucide-react';
import { Asset } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [limit, setLimit] = useState('');
    const [billingDate, setBillingDate] = useState('');
    const [linkedAssetId, setLinkedAssetId] = useState('');
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
            name, type, balance: parseInt(balance),
            currency: 'KRW', color: getTypeColor(type),
            accountNumber, interestRate: interestRate ? parseFloat(interestRate) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            billingDate: billingDate ? parseInt(billingDate) : undefined,
            linkedAssetId: linkedAssetId || undefined, memo
        };
        if (editingId) updateAsset(asset);
        else addAsset(asset);
        setIsDialogOpen(false); resetForm();
    };

    const handleEdit = (a: Asset) => {
        setEditingId(a.id); setName(a.name); setType(a.type); setBalance(a.balance.toString());
        setAccountNumber(a.accountNumber || ''); setInterestRate(a.interestRate?.toString() || '');
        setLimit(a.limit?.toString() || ''); setBillingDate(a.billingDate?.toString() || '');
        setLinkedAssetId(a.linkedAssetId || ''); setMemo(a.memo || '');
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingId(null); setName(''); setType('bank'); setBalance(''); setAccountNumber('');
        setInterestRate(''); setLimit(''); setBillingDate(''); setLinkedAssetId(''); setMemo('');
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
            case 'cash': return '유동 현금';
            case 'stock': return '주식/자산';
            case 'real_estate': return '부동산';
            case 'crypto': return '가상자산';
            case 'loan': return '대출/부채';
            case 'credit_card': return '신용 한도';
            default: return '기타';
        }
    };

    const getTypeColor = (type: Asset['type']) => {
        switch (type) {
            case 'bank': return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
            case 'cash': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'stock': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
            case 'real_estate': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'crypto': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            case 'loan': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            case 'credit_card': return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    return (
        <div className="h-full flex flex-col glass-premium rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-emerald-500/[0.03] pointer-events-none" />

            {/* Header Area */}
            <div className="p-8 pb-4 relative z-10">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(99,102,241,0.5)]">
                            <Activity className="w-6 h-6 text-white" strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">자산 분석 센터</h2>
                            <p className="text-[10px] font-bold text-white/20 tracking-[0.3em] uppercase mt-2 italic flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3 text-emerald-500" /> 재무 건전성: 최적 (OPTIMAL)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-white/5 p-1.5 rounded-2xl border border-white/5 flex gap-2">
                            <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase">실시간 동기화: 활성화</span>
                            </div>
                        </div>
                        <Button
                            onClick={() => { resetForm(); setIsDialogOpen(true); }}
                            className="h-12 px-6 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-[10px] tracking-widest uppercase shadow-xl transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4 mr-2" strokeWidth={3} /> 자산 추가하기
                        </Button>
                    </div>
                </div>

                {/* Net Worth Hero */}
                <Card className="glass-premium border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent overflow-hidden rounded-[40px] mb-8 relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Globe className="w-32 h-32 text-white" strokeWidth={1} />
                    </div>
                    <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="text-center md:text-left">
                            <h3 className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase mb-4">순자산 총 가치 (NET WORTH)</h3>
                            <div className="flex items-baseline gap-4 justify-center md:justify-start">
                                <span className="text-5xl md:text-7xl font-black text-white tracking-tighter">{netWorth.toLocaleString()}</span>
                                <span className="text-xl font-bold text-white/20 uppercase tracking-widest">KRW</span>
                            </div>
                        </div>

                        <div className="flex gap-4 md:gap-12 w-full md:w-auto">
                            <div className="flex-1 bg-white/5 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
                                <div className="flex items-center gap-2 mb-2">
                                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">총 자산</span>
                                </div>
                                <div className="text-xl font-black text-white tracking-tight">{totalAssets.toLocaleString()}원</div>
                            </div>
                            <div className="flex-1 bg-white/5 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
                                <div className="flex items-center gap-2 mb-2">
                                    <ArrowDownRight className="w-4 h-4 text-rose-400" />
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">총 부채</span>
                                </div>
                                <div className="text-xl font-black text-white tracking-tight">{totalLiabilities.toLocaleString()}원</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Assets List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* ASSETS SECTION */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            <h3 className="text-xl font-black text-white tracking-widest uppercase">자산 포트폴리오</h3>
                        </div>

                        <div className="space-y-4">
                            {assets.filter(a => !['loan', 'credit_card'].includes(a.type)).map((asset, idx) => {
                                const Icon = getTypeIcon(asset.type);
                                const styles = getTypeColor(asset.type);
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={asset.id}
                                        className="group glass-premium rounded-[32px] border border-white/5 p-6 transition-all hover:bg-white/[0.02] flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border", styles)}>
                                                <Icon className="w-7 h-7" strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-white tracking-widest uppercase mb-1">{asset.name}</h4>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{getTypeLabel(asset.type)}</span>
                                                    {asset.interestRate && <span className="text-[9px] font-black text-emerald-400">APY {asset.interestRate}%</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className="text-lg font-black text-white tracking-tight">{asset.balance.toLocaleString()}</div>
                                                <div className="text-[9px] font-bold text-white/10 uppercase tracking-widest">KRW 가치</div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => handleEdit(asset)} className="w-10 h-10 rounded-xl bg-white/5 text-white/20 hover:text-white transition-all flex items-center justify-center">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => deleteAsset(asset.id)} className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            {assets.filter(a => !['loan', 'credit_card'].includes(a.type)).length === 0 && (
                                <div className="h-40 flex flex-col items-center justify-center opacity-10 gap-4 border-2 border-dashed border-white/10 rounded-[32px]">
                                    <Sparkles className="w-8 h-8" />
                                    <p className="text-[10px] font-black tracking-[0.3em] uppercase">포트폴리오가 비어 있습니다</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* LIABILITIES SECTION */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <TrendingDown className="w-5 h-5 text-rose-500" />
                            <h3 className="text-xl font-black text-white tracking-widest uppercase">부채 매트릭스</h3>
                        </div>

                        <div className="space-y-4">
                            {assets.filter(a => ['loan', 'credit_card'].includes(a.type)).map((asset, idx) => {
                                const Icon = getTypeIcon(asset.type);
                                const styles = getTypeColor(asset.type);
                                const progress = asset.limit ? Math.min(100, (asset.balance / asset.limit) * 100) : 0;
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={asset.id}
                                        className="group glass-premium rounded-[32px] border border-white/5 p-6 transition-all hover:bg-white/[0.02]"
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-6">
                                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border", styles)}>
                                                    <Icon className="w-7 h-7" strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-white tracking-widest uppercase mb-1">{asset.name}</h4>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{getTypeLabel(asset.type)}</span>
                                                        {asset.billingDate && <span className="text-[9px] font-black text-rose-400">결제일 D-{asset.billingDate}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <div className="text-lg font-black text-rose-400 tracking-tight">{asset.balance.toLocaleString()}</div>
                                                    <div className="text-[9px] font-bold text-white/10 uppercase tracking-widest text-right">부채 노출액</div>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => handleEdit(asset)} className="w-10 h-10 rounded-xl bg-white/5 text-white/20 hover:text-white transition-all flex items-center justify-center">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => deleteAsset(asset.id)} className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {asset.type === 'credit_card' && asset.limit && (
                                            <div className="space-y-3 px-1">
                                                <div className="flex justify-between text-[8px] font-black tracking-widest uppercase text-white/20">
                                                    <span>한도 대비 이용률</span>
                                                    <span>{progress.toFixed(1)}% / 한도 {asset.limit.toLocaleString()}</span>
                                                </div>
                                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        className={cn("h-full", progress > 80 ? "bg-rose-500" : "bg-orange-500")}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                            {assets.filter(a => ['loan', 'credit_card'].includes(a.type)).length === 0 && (
                                <div className="h-40 flex flex-col items-center justify-center opacity-10 gap-4 border-2 border-dashed border-white/10 rounded-[32px]">
                                    <ShieldCheck className="w-8 h-8" />
                                    <p className="text-[10px] font-black tracking-[0.3em] uppercase">부채 없는 청정 상태</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass-premium border border-white/10 text-white rounded-[40px] p-0 shadow-2xl sm:max-w-xl max-h-[90vh] overflow-hidden">
                    <DialogHeader className="p-10 pb-0">
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase mb-2">{editingId ? '자산 정보 수정' : '신규 자산 초기화'}</DialogTitle>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] italic">시스템 매트릭스 통합을 위한 재무 파라미터를 지정하십시오</p>
                    </DialogHeader>
                    <div className="overflow-y-auto custom-scrollbar p-10 pt-4 space-y-8">
                        <div className="grid gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">자산 식별자 (NAME)</Label>
                                <Input
                                    className="h-14 font-black text-xl border-white/5 bg-white/5 focus-visible:ring-indigo-500/30 rounded-2xl text-white placeholder:text-white/10"
                                    placeholder="예: OO은행 예금, 나스닥 포트폴리오..."
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">자산 분류</Label>
                                    <select
                                        className="flex h-12 w-full rounded-2xl border border-white/5 bg-white/5 px-4 font-black uppercase text-[10px] tracking-widest text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={type}
                                        onChange={e => setType(e.target.value as any)}
                                    >
                                        <option value="bank" className="bg-slate-900">예적금 (SAVINGS)</option>
                                        <option value="cash" className="bg-slate-900">유동 현금 (CASH)</option>
                                        <option value="stock" className="bg-slate-900">주식/투자 (EQUITIES)</option>
                                        <option value="real_estate" className="bg-slate-900">부동산 (PROPERTY)</option>
                                        <option value="crypto" className="bg-slate-900">가상자산 (DIGITAL)</option>
                                        <option value="loan" className="bg-slate-900">대출/부채 (LIABILITY)</option>
                                        <option value="credit_card" className="bg-slate-900">신용 한도 (CREDIT)</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">현재 평가액</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        className="h-12 font-black text-sm bg-white/5 border-white/5 rounded-2xl text-white"
                                        value={balance}
                                        onChange={e => setBalance(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">계좌/식별 번호 (선택)</Label>
                                <Input
                                    placeholder="계좌 번호 또는 시스템 ID"
                                    className="h-12 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/10 text-[10px] font-mono tracking-widest uppercase"
                                    value={accountNumber}
                                    onChange={e => setAccountNumber(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">연간 수익률/이율 (%)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        step="0.01"
                                        className="h-12 font-black text-[10px] bg-white/5 border-white/5 rounded-2xl text-white"
                                        value={interestRate}
                                        onChange={e => setInterestRate(e.target.value)}
                                    />
                                </div>
                                {type === 'credit_card' ? (
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">결제 주기 (일)</Label>
                                        <Input
                                            type="number"
                                            placeholder="1-31"
                                            className="h-12 font-black text-[10px] bg-white/5 border-white/5 rounded-2xl text-white"
                                            value={billingDate}
                                            onChange={e => setBillingDate(e.target.value)}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">부채 임계값/한도</Label>
                                        <Input
                                            type="number"
                                            placeholder="최대 한도액"
                                            className="h-12 font-black text-[10px] bg-white/5 border-white/5 rounded-2xl text-white"
                                            value={limit}
                                            onChange={e => setLimit(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>

                            {type === 'credit_card' && (
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">이용 한도액</Label>
                                        <Input
                                            type="number"
                                            placeholder="MAX LINE"
                                            className="h-12 font-black text-[10px] bg-white/5 border-white/5 rounded-2xl text-white"
                                            value={limit}
                                            onChange={e => setLimit(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">연결 결제 계좌</Label>
                                        <select
                                            className="flex h-12 w-full rounded-2xl border border-white/5 bg-white/5 px-4 font-black uppercase text-[10px] tracking-widest text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            value={linkedAssetId}
                                            onChange={e => setLinkedAssetId(e.target.value)}
                                        >
                                            <option value="" className="bg-slate-900">연결되지 않음</option>
                                            {assets.filter(a => a.type === 'bank').map(a => (
                                                <option key={a.id} value={a.id} className="bg-slate-900">{a.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">시스템 메모 (NOTES)</Label>
                                <Input
                                    placeholder="추가 메타데이터 입력..."
                                    className="h-12 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/10 text-[10px] font-black uppercase tracking-widest"
                                    value={memo}
                                    onChange={e => setMemo(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-10 pt-4 bg-white/[0.02] border-t border-white/5">
                        <Button
                            onClick={handleSave}
                            disabled={!name || !balance}
                            className="w-full h-16 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-sm tracking-[0.2em] shadow-2xl active:scale-95 transition-all uppercase"
                        >
                            매트릭스에 정보 업로드
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

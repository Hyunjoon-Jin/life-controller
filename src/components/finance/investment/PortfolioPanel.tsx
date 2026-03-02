'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/context/DataProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, TrendingUp, TrendingDown, Minus, Loader2, Wallet, Trash2 } from 'lucide-react';
import { generateId, cn } from '@/lib/utils';
import { PortfolioHolding } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface StockPrice {
    currentPrice: number;
    changePercent: number | null;
    currency: string;
}

export function PortfolioPanel() {
    const { portfolioHoldings, addPortfolioHolding, deletePortfolioHolding } = useData();
    const [prices, setPrices] = useState<Record<string, StockPrice>>({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loadingPrices, setLoadingPrices] = useState(false);

    // Form state
    const [symbol, setSymbol] = useState('');
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [avgBuyPrice, setAvgBuyPrice] = useState('');
    const [currency, setCurrency] = useState<'USD' | 'KRW'>('USD');

    // 실시간 주가 가져오기
    useEffect(() => {
        if (portfolioHoldings.length === 0) return;
        const fetchPrices = async () => {
            setLoadingPrices(true);
            const uniqueSymbols = [...new Set(portfolioHoldings.map(h => h.symbol))];
            const results: Record<string, StockPrice> = {};
            await Promise.all(
                uniqueSymbols.map(async (sym) => {
                    try {
                        const res = await fetch(`/api/stock?symbol=${encodeURIComponent(sym)}`);
                        if (res.ok) {
                            const data = await res.json();
                            results[sym] = data;
                        }
                    } catch {}
                })
            );
            setPrices(results);
            setLoadingPrices(false);
        };
        fetchPrices();
    }, [portfolioHoldings.length]);

    const handleSave = () => {
        if (!symbol || !name || !quantity || !avgBuyPrice) return;
        const holding: PortfolioHolding = {
            id: generateId(),
            symbol: symbol.toUpperCase(),
            name,
            quantity: parseFloat(quantity),
            avgBuyPrice: parseFloat(avgBuyPrice),
            currency,
            addedAt: new Date(),
        };
        addPortfolioHolding(holding);
        setIsDialogOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setSymbol(''); setName(''); setQuantity(''); setAvgBuyPrice(''); setCurrency('USD');
    };

    const getPL = (holding: PortfolioHolding) => {
        const price = prices[holding.symbol];
        if (!price?.currentPrice) return null;
        const currentValue = price.currentPrice * holding.quantity;
        const costBasis = holding.avgBuyPrice * holding.quantity;
        const pl = currentValue - costBasis;
        const plPercent = costBasis > 0 ? (pl / costBasis) * 100 : 0;
        return { pl, plPercent, currentValue, currentPrice: price.currentPrice };
    };

    const totalValue = portfolioHoldings.reduce((sum, h) => {
        const pl = getPL(h);
        return sum + (pl?.currentValue ?? h.avgBuyPrice * h.quantity);
    }, 0);

    const totalCost = portfolioHoldings.reduce((sum, h) => sum + h.avgBuyPrice * h.quantity, 0);
    const totalPL = totalValue - totalCost;
    const totalPLPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

    return (
        <div className="space-y-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">보유 종목</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] text-white/40 uppercase tracking-widest">
                                총 평가액 {totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                            {portfolioHoldings.length > 0 && (
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest",
                                    totalPL > 0 ? "text-emerald-400" : totalPL < 0 ? "text-rose-400" : "text-white/40"
                                )}>
                                    {totalPL > 0 ? '+' : ''}{totalPLPercent.toFixed(2)}%
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <Button
                    size="sm"
                    onClick={() => setIsDialogOpen(true)}
                    className="h-9 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 font-black text-[9px] tracking-widest uppercase border border-emerald-500/20 transition-all"
                >
                    <Plus className="w-3 h-3 mr-1" strokeWidth={3} /> 종목 추가
                </Button>
            </div>

            {/* 보유 종목 카드 그리드 */}
            {portfolioHoldings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    <AnimatePresence>
                        {portfolioHoldings.map((holding, idx) => {
                            const pl = getPL(holding);
                            const priceData = prices[holding.symbol];
                            const isLoadingPrice = loadingPrices && !priceData;
                            return (
                                <motion.div
                                    key={holding.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group bg-white/5 rounded-3xl border border-white/5 p-5 relative overflow-hidden hover:bg-white/[0.07] transition-colors"
                                >
                                    {/* 상단 */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                <span className="text-sm font-black text-white">{holding.symbol.slice(0, 1)}</span>
                                            </div>
                                            <div>
                                                <span className="text-[8px] font-black text-white/30 tracking-widest uppercase block">{holding.symbol}</span>
                                                <h4 className="text-xs font-black text-white leading-tight mt-0.5">{holding.name}</h4>
                                            </div>
                                        </div>
                                        {isLoadingPrice ? (
                                            <Loader2 className="w-4 h-4 text-white/20 animate-spin mt-1" />
                                        ) : pl ? (
                                            <div className={cn(
                                                "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg",
                                                pl.plPercent > 0 ? "text-emerald-400 bg-emerald-500/10" :
                                                    pl.plPercent < 0 ? "text-rose-400 bg-rose-500/10" : "text-white/40 bg-white/5"
                                            )}>
                                                {pl.plPercent > 0 ? <TrendingUp className="w-3 h-3" /> :
                                                    pl.plPercent < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                                {pl.plPercent > 0 ? '+' : ''}{pl.plPercent.toFixed(2)}%
                                            </div>
                                        ) : null}
                                    </div>

                                    {/* 데이터 그리드 */}
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                        <div>
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-0.5">현재가</span>
                                            <span className="text-sm font-black text-white">
                                                {pl?.currentPrice != null ? pl.currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-'}
                                                {' '}<span className="text-[9px] text-white/30">{holding.currency}</span>
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-0.5">평균단가</span>
                                            <span className="text-sm font-black text-white">
                                                {holding.avgBuyPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                {' '}<span className="text-[9px] text-white/30">{holding.currency}</span>
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-0.5">수량</span>
                                            <span className="text-sm font-black text-white">{holding.quantity}</span>
                                        </div>
                                        <div>
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-0.5">평가손익</span>
                                            <span className={cn(
                                                "text-sm font-black",
                                                pl && pl.pl > 0 ? "text-emerald-400" : pl && pl.pl < 0 ? "text-rose-400" : "text-white/40"
                                            )}>
                                                {pl ? `${pl.pl > 0 ? '+' : ''}${pl.pl.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '-'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 삭제 버튼 */}
                                    <button
                                        onClick={() => deletePortfolioHolding(holding.id)}
                                        className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-rose-500 hover:text-white"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="h-28 flex flex-col items-center justify-center opacity-20 gap-2 border border-dashed border-white/10 rounded-3xl">
                    <Wallet className="w-7 h-7" />
                    <p className="text-[9px] font-black uppercase tracking-widest">보유 종목을 추가해 실시간 수익률을 확인하세요</p>
                </div>
            )}

            {/* 보유 종목 추가 다이얼로그 */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass-premium border border-white/10 text-white rounded-[40px] p-0 shadow-2xl sm:max-w-lg overflow-hidden">
                    <DialogHeader className="p-8 pb-0">
                        <DialogTitle className="text-2xl font-black tracking-tighter uppercase">보유 종목 추가</DialogTitle>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">실시간 Yahoo Finance 데이터로 수익률 자동 계산</p>
                    </DialogHeader>
                    <div className="p-8 pt-5 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[9px] font-black text-white/40 uppercase tracking-widest">티커 심볼</Label>
                                <Input
                                    placeholder="AAPL, KRX:005930"
                                    className="h-11 bg-white/5 border-white/5 rounded-xl text-white font-black text-xs uppercase tracking-wider placeholder:text-white/10"
                                    value={symbol}
                                    onChange={e => setSymbol(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[9px] font-black text-white/40 uppercase tracking-widest">종목명</Label>
                                <Input
                                    placeholder="Apple Inc."
                                    className="h-11 bg-white/5 border-white/5 rounded-xl text-white font-black text-xs placeholder:text-white/10"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[9px] font-black text-white/40 uppercase tracking-widest">보유 수량</Label>
                                <Input
                                    type="number"
                                    placeholder="10"
                                    className="h-11 bg-white/5 border-white/5 rounded-xl text-white font-black text-sm placeholder:text-white/10"
                                    value={quantity}
                                    onChange={e => setQuantity(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[9px] font-black text-white/40 uppercase tracking-widest">평균 매수가</Label>
                                <Input
                                    type="number"
                                    placeholder="150.00"
                                    className="h-11 bg-white/5 border-white/5 rounded-xl text-white font-black text-sm placeholder:text-white/10"
                                    value={avgBuyPrice}
                                    onChange={e => setAvgBuyPrice(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[9px] font-black text-white/40 uppercase tracking-widest">통화</Label>
                            <select
                                className="flex h-11 w-full rounded-xl border border-white/5 bg-white/5 px-4 font-black text-[10px] tracking-widest text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                                value={currency}
                                onChange={e => setCurrency(e.target.value as 'USD' | 'KRW')}
                            >
                                <option value="USD" className="bg-slate-900">USD (달러)</option>
                                <option value="KRW" className="bg-slate-900">KRW (원화)</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter className="p-8 pt-0">
                        <Button
                            onClick={handleSave}
                            disabled={!symbol || !name || !quantity || !avgBuyPrice}
                            className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl disabled:opacity-30"
                        >
                            보유 종목 추가
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

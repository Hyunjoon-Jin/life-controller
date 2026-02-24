'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
    TrendingUp, Search, Plus, ExternalLink, BarChart3, Star,
    Trash2, ArrowUpRight, ArrowDownRight, Loader2, Sparkles,
    Activity, Globe, Terminal, ShieldCheck, Zap, Fingerprint,
    MousePointer2, Target
} from 'lucide-react';
import { generateId, cn } from '@/lib/utils';
import { StockAnalysis } from '@/types';
import { StockWidget } from '@/components/widgets/StockWidget';
import { motion, AnimatePresence } from 'framer-motion';

export function InvestmentTab() {
    const { stockAnalyses, addStockAnalysis, deleteStockAnalysis } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFetching, setIsFetching] = useState(false);

    // Form
    const [symbol, setSymbol] = useState('');
    const [name, setName] = useState('');
    const [rating, setRating] = useState<'buy' | 'hold' | 'sell'>('buy');
    const [targetPrice, setTargetPrice] = useState('');
    const [content, setContent] = useState('');
    const [url, setUrl] = useState('');
    const [tags, setTags] = useState('');

    const handleSave = () => {
        if (!symbol || !name) return;
        const analysis: StockAnalysis = {
            id: generateId(),
            symbol: symbol.toUpperCase(),
            name, rating,
            targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
            content, url,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            analysisDate: new Date()
        };
        addStockAnalysis(analysis);
        setIsDialogOpen(false); resetForm();
    };

    const handleUrlFetch = async () => {
        if (!url) return;
        setIsFetching(true);
        setTimeout(() => {
            let extractedSymbol = '';
            let extractedName = '';
            try {
                const urlObj = new URL(url);
                if (urlObj.hostname.includes('yahoo.com') && urlObj.pathname.includes('/quote/')) {
                    const parts = urlObj.pathname.split('/');
                    const quoteIndex = parts.indexOf('quote');
                    if (quoteIndex !== -1 && parts[quoteIndex + 1]) {
                        extractedSymbol = parts[quoteIndex + 1].split('?')[0].toUpperCase();
                    }
                } else if (urlObj.hostname.includes('naver.com') && urlObj.searchParams.get('code')) {
                    extractedSymbol = urlObj.searchParams.get('code') || '';
                } else if (urlObj.hostname.includes('investing.com')) {
                    const parts = urlObj.pathname.split('/');
                    if (parts.length > 0) {
                        extractedSymbol = parts[parts.length - 1].replace(/-/g, ' ').toUpperCase();
                    }
                }

                if (extractedSymbol) {
                    setSymbol(extractedSymbol);
                    setName(extractedSymbol);
                    if (extractedSymbol === 'NVDA') { setName("NVIDIA Corp."); setTags("AI, CHIPS"); }
                    else if (extractedSymbol === 'TSLA') { setName("Tesla, Inc."); setTags("EV, AI"); }
                    else if (extractedSymbol === 'AAPL') { setName("Apple Inc."); setTags("TECH, HARDWARE"); }
                    setRating('hold');
                    setContent(`[TRANSMISSION CAPTURED] Analysis linked from ${urlObj.hostname}.`);
                } else {
                    alert("EXTRACTION FAILED. MANUAL INPUT REQUIRED.");
                }
            } catch (e) {
                alert("INVALID SOURCE URL.");
            }
            setIsFetching(false);
        }, 800);
    };

    const resetForm = () => {
        setSymbol(''); setName(''); setRating('buy'); setTargetPrice(''); setContent(''); setUrl(''); setTags('');
    };

    const handleExternalSearch = () => {
        if (!searchQuery) return;
        window.open(`https://finance.yahoo.com/quote/${searchQuery}`, '_blank');
    };

    return (
        <div className="h-full flex flex-col glass-premium rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-amber-500/[0.03] pointer-events-none" />

            {/* Header / Search */}
            <div className="p-8 pb-4 relative z-10">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(99,102,241,0.5)]">
                            <TrendingUp className="w-6 h-6 text-white" strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">투자 분석 센터</h2>
                            <p className="text-[10px] font-bold text-white/20 tracking-[0.3em] uppercase mt-2 italic flex items-center gap-2">
                                <Zap className="w-3 h-3 text-amber-500" /> 시장 변동성: 모니터링 중 (MONITORED)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="group relative w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                                placeholder="글로벌 티커 검색 (예: NVDA)..."
                                className="h-12 pl-12 bg-white/5 border-white/5 rounded-2xl text-white font-black text-[10px] tracking-widest uppercase placeholder:text-white/10 focus-visible:ring-indigo-500/30"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleExternalSearch()}
                            />
                        </div>
                        <Button
                            onClick={() => setIsDialogOpen(true)}
                            className="h-12 px-6 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-[10px] tracking-widest uppercase shadow-xl transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4 mr-2" strokeWidth={3} /> 새 분석 추가
                        </Button>
                    </div>
                </div>

                {/* Watchlist Widgets */}
                {stockAnalyses.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {Array.from(new Set(stockAnalyses.map(a => a.symbol))).slice(0, 3).map((symbol, idx) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                key={symbol}
                                className="glass-premium rounded-[32px] border border-white/10 p-2 overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent shadow-xl"
                            >
                                <StockWidget symbol={symbol} height="180px" />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Analysis Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AnimatePresence mode="popLayout">
                        {stockAnalyses.map((analysis, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={analysis.id}
                                className="group glass-premium rounded-[40px] border border-white/5 p-8 transition-all hover:bg-white/[0.02] relative overflow-hidden flex flex-col gap-6"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <BarChart3 className="w-24 h-24 text-white" strokeWidth={1} />
                                </div>

                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                            <span className="text-xl font-black text-white tracking-widest">{analysis.symbol.slice(0, 1)}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white tracking-tight uppercase leading-none mb-1">{analysis.name}</h3>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-black text-white/40 tracking-widest uppercase">{analysis.symbol}</span>
                                                <div className={cn(
                                                    "px-2 py-0.5 rounded-lg text-[8px] font-black tracking-widest uppercase",
                                                    analysis.rating === 'buy' ? "bg-emerald-500/20 text-emerald-400" :
                                                        analysis.rating === 'sell' ? "bg-rose-500/20 text-rose-400" : "bg-white/10 text-white/40"
                                                )}>
                                                    {analysis.rating}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteStockAnalysis(analysis.id)}
                                        className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-rose-500 hover:text-white"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center px-2">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-white/20 tracking-widest uppercase mb-1">목표 가격 (TARGET)</span>
                                            <span className="text-lg font-black text-white">{analysis.targetPrice ? `${analysis.targetPrice.toLocaleString()} USD` : '미설정'}</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[8px] font-black text-white/20 tracking-widest uppercase mb-1">기록일</span>
                                            <span className="text-[10px] font-bold text-white/40 uppercase">{new Date(analysis.analysisDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 p-6 rounded-[32px] border border-white/5 relative group/content">
                                        <div className="absolute top-4 right-4 group-hover/content:text-indigo-400 transition-colors">
                                            <Terminal className="w-3 h-3 opacity-20" />
                                        </div>
                                        <p className="text-xs font-bold text-white/60 leading-relaxed italic line-clamp-3">
                                            &quot;{analysis.content}&quot;
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2">
                                            {analysis.tags?.map(tag => (
                                                <span key={tag} className="text-[8px] font-black text-indigo-400/60 uppercase tracking-widest">#{tag}</span>
                                            ))}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            className="h-10 px-4 rounded-xl hover:bg-white/5 text-[9px] font-black text-white/20 hover:text-white tracking-widest uppercase gap-2 transition-all"
                                            onClick={() => window.open(analysis.url || `https://finance.yahoo.com/quote/${analysis.symbol}`, '_blank')}
                                        >
                                            출처 원문 보기 <ExternalLink className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {stockAnalyses.length === 0 && (
                        <div className="col-span-full h-80 flex flex-col items-center justify-center opacity-10 gap-6 border-2 border-dashed border-white/10 rounded-[48px]">
                            <BarChart3 className="w-20 h-20" />
                            <div className="text-center space-y-1">
                                <h3 className="text-2xl font-black tracking-[0.2em] uppercase">분석 기록이 없습니다</h3>
                                <p className="text-[10px] font-bold tracking-[0.5em] uppercase">기록된 전략적 통찰이 발견되지 않았습니다</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass-premium border border-white/10 text-white rounded-[40px] p-0 shadow-2xl sm:max-w-3xl max-h-[90vh] overflow-hidden">
                    <DialogHeader className="p-10 pb-0">
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase mb-2">신규 투자 분석 초기화</DialogTitle>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] italic">전략적 분석을 위해 시장 센서 데이터를 암호화합니다</p>
                    </DialogHeader>
                    <div className="overflow-y-auto custom-scrollbar p-10 pt-4 space-y-8">
                        <div className="grid gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">정보 출처 피드 (URL)</Label>
                                <div className="flex gap-4">
                                    <Input
                                        placeholder="YAHOO, NAVER FINANCE 등 URL 입력..."
                                        className="h-14 font-black text-[10px] tracking-widest uppercase bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/10"
                                        value={url}
                                        onChange={e => setUrl(e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-14 w-14 rounded-2xl border-white/5 bg-white/5 hover:bg-indigo-500/20 transition-all shadow-xl"
                                        onClick={handleUrlFetch}
                                        disabled={isFetching || !url}
                                    >
                                        {isFetching ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 text-amber-500" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">시스템 티커 (SYMBOL)</Label>
                                    <Input
                                        placeholder="예: NVDA, 005930"
                                        className="h-12 font-black text-sm tracking-widest uppercase bg-white/5 border-white/5 rounded-2xl text-white"
                                        value={symbol} onChange={e => setSymbol(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">엔티티 식별명 (NAME)</Label>
                                    <Input
                                        placeholder="예: NVIDIA CORP, 삼성전자"
                                        className="h-12 font-black text-sm tracking-widest uppercase bg-white/5 border-white/5 rounded-2xl text-white"
                                        value={name} onChange={e => setName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">전략적 투자의견 (RATING)</Label>
                                    <select
                                        className="flex h-12 w-full rounded-2xl border border-white/5 bg-white/5 px-4 font-black uppercase text-[10px] tracking-widest text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={rating}
                                        onChange={e => setRating(e.target.value as any)}
                                    >
                                        <option value="buy" className="bg-slate-900">매수 (BUY / ACCUMULATE)</option>
                                        <option value="hold" className="bg-slate-900">중립 (HOLD / RETAIN)</option>
                                        <option value="sell" className="bg-slate-900">매도 (SELL / LIQUIDATE)</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">목표 가격 (TARGET PRICE)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        className="h-12 font-black text-sm tracking-widest bg-white/5 border-white/5 rounded-2xl text-white"
                                        value={targetPrice} onChange={e => setTargetPrice(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">지능형 내러티브 (MARKDOWN 분석)</Label>
                                <textarea
                                    className="min-h-[200px] w-full rounded-3xl border border-white/5 bg-white/5 p-6 text-xs font-bold text-white placeholder:text-white/10 leading-relaxed resize-none focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="시장 센서, 위험 요소, 그리고 촉매제에 대한 분석 내용을 입력하십시오..."
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">메타데이터 태그 (TAGS)</Label>
                                <Input
                                    placeholder="#반도체, #성장주, #AI 등..."
                                    className="h-12 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/10 text-[10px] font-black uppercase tracking-widest"
                                    value={tags} onChange={e => setTags(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-10 pt-4 bg-white/[0.02] border-t border-white/5">
                        <Button
                            onClick={handleSave}
                            disabled={!symbol || !name}
                            className="w-full h-16 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-sm tracking-[0.2em] shadow-2xl active:scale-95 transition-all uppercase"
                        >
                            분석 피드에 기록 업로드
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

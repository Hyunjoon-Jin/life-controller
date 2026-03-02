'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
    TrendingUp, Search, Plus, ExternalLink, BarChart3,
    Trash2, Loader2, Sparkles, Terminal, Zap, PenLine,
    ShieldCheck, ShieldAlert, Flame, CircleDot
} from 'lucide-react';
import { generateId, cn } from '@/lib/utils';
import { StockAnalysis } from '@/types';
import { StockWidget } from '@/components/widgets/StockWidget';
import { PortfolioPanel } from '@/components/finance/investment/PortfolioPanel';
import { AIInsightPanel } from '@/components/finance/investment/AIInsightPanel';
import { motion, AnimatePresence } from 'framer-motion';

const SENTIMENT_DOT = {
    bullish: 'text-emerald-400',
    neutral: 'text-amber-400',
    bearish: 'text-rose-400',
} as const;

const SENTIMENT_LABEL = { bullish: '강세', neutral: '중립', bearish: '약세' } as const;

const RISK_ICON = {
    low: <ShieldCheck className="w-3 h-3 text-emerald-400" />,
    medium: <ShieldAlert className="w-3 h-3 text-amber-400" />,
    high: <Flame className="w-3 h-3 text-rose-400" />,
} as const;

export function InvestmentTab() {
    const { stockAnalyses, addStockAnalysis, deleteStockAnalysis, portfolioHoldings } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [isWriting, setIsWriting] = useState(false);

    // Form state
    const [symbol, setSymbol] = useState('');
    const [name, setName] = useState('');
    const [rating, setRating] = useState<'buy' | 'hold' | 'sell'>('buy');
    const [targetPrice, setTargetPrice] = useState('');
    const [content, setContent] = useState('');
    const [url, setUrl] = useState('');
    const [tags, setTags] = useState('');

    // AI-generated form metadata (not persisted to form inputs but to analysis object)
    const [aiAssisted, setAiAssisted] = useState(false);
    const [aiSentiment, setAiSentiment] = useState<'bullish' | 'neutral' | 'bearish' | undefined>();
    const [aiKeyPoints, setAiKeyPoints] = useState<string[]>([]);
    const [aiRiskLevel, setAiRiskLevel] = useState<'low' | 'medium' | 'high' | undefined>();

    const handleSave = () => {
        if (!symbol || !name) return;
        const analysis: StockAnalysis = {
            id: generateId(),
            symbol: symbol.toUpperCase(),
            name,
            rating,
            targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
            content,
            url,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            analysisDate: new Date(),
            aiAssisted: aiAssisted || undefined,
            sentiment: aiSentiment,
            keyPoints: aiKeyPoints.length ? aiKeyPoints : undefined,
            riskLevel: aiRiskLevel,
        };
        addStockAnalysis(analysis);
        setIsDialogOpen(false);
        resetForm();
    };

    // AI URL 분석: URL 스크래핑 + Gemini 분석 → 폼 자동 완성
    const handleAIAnalysis = async () => {
        if (!url) return;
        setIsFetching(true);
        setAiAssisted(false);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'analyze_investment_url',
                    payload: { url, symbol, name },
                }),
            });
            if (!res.ok) throw new Error('AI 분석 요청 실패');
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // 폼 자동 완성
            if (data.symbol && !symbol) setSymbol(data.symbol);
            if (data.name && !name) setName(data.name);
            if (data.rating) setRating(data.rating);
            if (data.targetPrice != null) setTargetPrice(String(data.targetPrice));
            if (data.analysis) setContent(data.analysis);
            if (data.tags?.length) setTags(data.tags.join(', '));

            // AI 메타데이터 저장
            setAiSentiment(data.sentiment);
            setAiKeyPoints(data.keyPoints || []);
            setAiRiskLevel(data.riskLevel);
            setAiAssisted(true);
        } catch (e: any) {
            alert(`AI 분석 실패: ${e.message}`);
        } finally {
            setIsFetching(false);
        }
    };

    // AI 분석문 작성: 심볼 + 의견 → Gemini가 전문 분석문 작성
    const handleAIWrite = async () => {
        if (!symbol && !name) return;
        setIsWriting(true);
        try {
            // 실시간 주가 데이터 가져오기 (선택적)
            let stockData = null;
            if (symbol) {
                try {
                    const res = await fetch(`/api/stock?symbol=${encodeURIComponent(symbol)}`);
                    if (res.ok) stockData = await res.json();
                } catch {}
            }

            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'write_investment_analysis',
                    payload: { symbol, name, rating, targetPrice, notes: content, stockData },
                }),
            });
            if (!res.ok) throw new Error('작성 실패');
            const data = await res.json();
            setContent(data.text);
            setAiAssisted(true);
        } catch (e: any) {
            alert(`AI 작성 실패: ${e.message}`);
        } finally {
            setIsWriting(false);
        }
    };

    const resetForm = () => {
        setSymbol(''); setName(''); setRating('buy'); setTargetPrice('');
        setContent(''); setUrl(''); setTags('');
        setAiAssisted(false); setAiSentiment(undefined); setAiKeyPoints([]); setAiRiskLevel(undefined);
    };

    const handleExternalSearch = () => {
        if (!searchQuery) return;
        window.open(`https://finance.yahoo.com/quote/${searchQuery}`, '_blank');
    };

    return (
        <div className="h-full flex flex-col glass-premium rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-amber-500/[0.03] pointer-events-none" />

            {/* 헤더 */}
            <div className="p-8 pb-4 relative z-10">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(99,102,241,0.5)]">
                            <TrendingUp className="w-6 h-6 text-white" strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">투자 분석 센터</h2>
                            <p className="text-[10px] font-bold text-white/20 tracking-[0.3em] uppercase mt-2 italic flex items-center gap-2">
                                <Zap className="w-3 h-3 text-amber-500" /> AI 강화 인텔리전스 플랫폼
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="group relative w-[280px]">
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

                {/* 보유 종목 패널 */}
                <div className="mb-6">
                    <PortfolioPanel />
                </div>

                {/* AI 포트폴리오 진단 패널 */}
                <div className="mb-8">
                    <AIInsightPanel holdings={portfolioHoldings as any} />
                </div>

                {/* TradingView 위젯 */}
                {stockAnalyses.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {Array.from(new Set(stockAnalyses.map(a => a.symbol))).slice(0, 3).map((sym, idx) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                key={sym}
                                className="glass-premium rounded-[32px] border border-white/10 p-2 overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent shadow-xl"
                            >
                                <StockWidget symbol={sym} height="180px" />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* 분석 기록 피드 */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0 relative z-10">
                {stockAnalyses.length > 0 && (
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-4">
                        분석 기록 — {stockAnalyses.length}건
                    </p>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AnimatePresence mode="popLayout">
                        {stockAnalyses.map((analysis, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                key={analysis.id}
                                className="group glass-premium rounded-[40px] border border-white/5 p-8 transition-all hover:bg-white/[0.02] relative overflow-hidden flex flex-col gap-6"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <BarChart3 className="w-24 h-24 text-white" strokeWidth={1} />
                                </div>

                                {/* 카드 헤더 */}
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative">
                                            <span className="text-xl font-black text-white tracking-widest">{analysis.symbol.slice(0, 1)}</span>
                                            {/* AI 배지 */}
                                            {analysis.aiAssisted && (
                                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg">
                                                    <Sparkles className="w-2.5 h-2.5 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white tracking-tight uppercase leading-none mb-1">{analysis.name}</h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[9px] font-black text-white/40 tracking-widest uppercase">{analysis.symbol}</span>
                                                {/* 투자의견 배지 */}
                                                <div className={cn(
                                                    "px-2 py-0.5 rounded-lg text-[8px] font-black tracking-widest uppercase",
                                                    analysis.rating === 'buy' ? "bg-emerald-500/20 text-emerald-400" :
                                                        analysis.rating === 'sell' ? "bg-rose-500/20 text-rose-400" : "bg-white/10 text-white/40"
                                                )}>
                                                    {analysis.rating === 'buy' ? '매수' : analysis.rating === 'sell' ? '매도' : '중립'}
                                                </div>
                                                {/* sentiment 표시 */}
                                                {analysis.sentiment && (
                                                    <div className={cn("flex items-center gap-1 text-[8px] font-black tracking-widest uppercase", SENTIMENT_DOT[analysis.sentiment])}>
                                                        <CircleDot className="w-2.5 h-2.5" />
                                                        {SENTIMENT_LABEL[analysis.sentiment]}
                                                    </div>
                                                )}
                                                {/* 리스크 레벨 */}
                                                {analysis.riskLevel && (
                                                    <div className="flex items-center gap-1">
                                                        {RISK_ICON[analysis.riskLevel]}
                                                    </div>
                                                )}
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

                                {/* 데이터 행 */}
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center px-2">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-white/20 tracking-widest uppercase mb-1">목표 가격</span>
                                            <span className="text-lg font-black text-white">
                                                {analysis.targetPrice ? `${analysis.targetPrice.toLocaleString()} USD` : '미설정'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[8px] font-black text-white/20 tracking-widest uppercase mb-1">기록일</span>
                                            <span className="text-[10px] font-bold text-white/40 uppercase">{new Date(analysis.analysisDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* AI 핵심 포인트 */}
                                    {analysis.keyPoints && analysis.keyPoints.length > 0 && (
                                        <div className="bg-indigo-500/5 rounded-2xl border border-indigo-500/10 p-4 space-y-1.5">
                                            <span className="text-[8px] font-black text-indigo-400/60 uppercase tracking-widest">AI 핵심 포인트</span>
                                            {analysis.keyPoints.slice(0, 3).map((point, i) => (
                                                <p key={i} className="text-[10px] font-bold text-white/60 leading-snug">• {point}</p>
                                            ))}
                                        </div>
                                    )}

                                    {/* 분석 내용 */}
                                    <div className="bg-white/5 p-6 rounded-[32px] border border-white/5 relative group/content">
                                        <div className="absolute top-4 right-4 group-hover/content:text-indigo-400 transition-colors">
                                            <Terminal className="w-3 h-3 opacity-20" />
                                        </div>
                                        <p className="text-xs font-bold text-white/60 leading-relaxed italic line-clamp-3">
                                            &quot;{analysis.content}&quot;
                                        </p>
                                    </div>

                                    {/* 하단: 태그 + 출처 */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2 flex-wrap">
                                            {analysis.tags?.map(tag => (
                                                <span key={tag} className="text-[8px] font-black text-indigo-400/60 uppercase tracking-widest">#{tag}</span>
                                            ))}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            className="h-10 px-4 rounded-xl hover:bg-white/5 text-[9px] font-black text-white/20 hover:text-white tracking-widest uppercase gap-2 transition-all"
                                            onClick={() => window.open(analysis.url || `https://finance.yahoo.com/quote/${analysis.symbol}`, '_blank')}
                                        >
                                            출처 원문 <ExternalLink className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {stockAnalyses.length === 0 && (
                        <div className="col-span-full h-72 flex flex-col items-center justify-center opacity-10 gap-6 border-2 border-dashed border-white/10 rounded-[48px]">
                            <BarChart3 className="w-20 h-20" />
                            <div className="text-center space-y-1">
                                <h3 className="text-2xl font-black tracking-[0.2em] uppercase">분석 기록이 없습니다</h3>
                                <p className="text-[10px] font-bold tracking-[0.5em] uppercase">URL을 붙여넣으면 AI가 자동으로 분석해 드립니다</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 분석 추가 다이얼로그 */}
            <Dialog open={isDialogOpen} onOpenChange={open => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="glass-premium border border-white/10 text-white rounded-[40px] p-0 shadow-2xl sm:max-w-3xl max-h-[90vh] overflow-hidden">
                    <DialogHeader className="p-10 pb-0">
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase mb-2">신규 투자 분석 초기화</DialogTitle>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] italic">
                            URL을 붙여넣고 AI 분석 버튼을 누르면 전체 분석이 자동으로 완성됩니다
                        </p>
                    </DialogHeader>

                    <div className="overflow-y-auto custom-scrollbar p-10 pt-5 space-y-6">
                        {/* URL + AI 분석 버튼 */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">
                                정보 출처 URL
                            </Label>
                            <div className="flex gap-3">
                                <Input
                                    placeholder="Yahoo Finance, Naver Finance, 뉴스 기사 URL..."
                                    className={cn(
                                        "h-14 font-black text-[10px] tracking-widest bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/10 transition-all",
                                        aiAssisted && "border-indigo-500/30 ring-1 ring-indigo-500/20"
                                    )}
                                    value={url}
                                    onChange={e => { setUrl(e.target.value); setAiAssisted(false); }}
                                />
                                <Button
                                    type="button"
                                    onClick={handleAIAnalysis}
                                    disabled={isFetching || !url}
                                    className="h-14 px-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-black text-[9px] tracking-widest uppercase shadow-xl transition-all active:scale-95 disabled:opacity-30 whitespace-nowrap gap-2"
                                >
                                    {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    {isFetching ? '분석중...' : 'AI 분석'}
                                </Button>
                            </div>
                            {aiAssisted && (
                                <p className="text-[9px] font-black text-indigo-400 ml-2 flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" /> AI가 아래 필드를 자동으로 채웠습니다. 수정 후 저장하세요.
                                </p>
                            )}
                        </div>

                        {/* 심볼 + 이름 */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">시스템 티커 (SYMBOL)</Label>
                                <Input
                                    placeholder="예: NVDA, KRX:005930"
                                    className={cn(
                                        "h-12 font-black text-sm tracking-widest uppercase bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/10 transition-all",
                                        aiAssisted && symbol && "border-indigo-500/20"
                                    )}
                                    value={symbol}
                                    onChange={e => setSymbol(e.target.value)}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">엔티티 식별명 (NAME)</Label>
                                <Input
                                    placeholder="예: NVIDIA Corp., 삼성전자"
                                    className={cn(
                                        "h-12 font-black text-sm bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/10 transition-all",
                                        aiAssisted && name && "border-indigo-500/20"
                                    )}
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* 의견 + 목표가 */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">전략적 투자의견</Label>
                                <select
                                    className={cn(
                                        "flex h-12 w-full rounded-2xl border border-white/5 bg-white/5 px-4 font-black uppercase text-[10px] tracking-widest text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all",
                                        aiAssisted && "border-indigo-500/20"
                                    )}
                                    value={rating}
                                    onChange={e => setRating(e.target.value as 'buy' | 'hold' | 'sell')}
                                >
                                    <option value="buy" className="bg-slate-900">매수 (BUY)</option>
                                    <option value="hold" className="bg-slate-900">중립 (HOLD)</option>
                                    <option value="sell" className="bg-slate-900">매도 (SELL)</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">목표 가격 (USD)</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    className={cn(
                                        "h-12 font-black text-sm tracking-widest bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/10 transition-all",
                                        aiAssisted && targetPrice && "border-indigo-500/20"
                                    )}
                                    value={targetPrice}
                                    onChange={e => setTargetPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* AI 메타 정보 (AI 분석 후 표시) */}
                        {aiAssisted && (aiSentiment || aiRiskLevel || aiKeyPoints.length > 0) && (
                            <div className="bg-indigo-500/5 rounded-2xl border border-indigo-500/10 p-4 space-y-3">
                                <span className="text-[8px] font-black text-indigo-400/60 uppercase tracking-widest flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" /> AI 추출 인사이트
                                </span>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {aiSentiment && (
                                        <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", {
                                            'text-emerald-400 bg-emerald-500/10 border-emerald-500/20': aiSentiment === 'bullish',
                                            'text-amber-400 bg-amber-500/10 border-amber-500/20': aiSentiment === 'neutral',
                                            'text-rose-400 bg-rose-500/10 border-rose-500/20': aiSentiment === 'bearish',
                                        })}>
                                            {SENTIMENT_LABEL[aiSentiment]} 심리
                                        </span>
                                    )}
                                    {aiRiskLevel && (
                                        <span className="flex items-center gap-1 text-[9px] font-black text-white/40 uppercase tracking-widest">
                                            {RISK_ICON[aiRiskLevel]}
                                            {aiRiskLevel === 'low' ? '저' : aiRiskLevel === 'medium' ? '중' : '고'}위험
                                        </span>
                                    )}
                                </div>
                                {aiKeyPoints.length > 0 && (
                                    <div className="space-y-1.5">
                                        {aiKeyPoints.slice(0, 3).map((point, i) => (
                                            <p key={i} className="text-[10px] text-white/50 font-medium">• {point}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 분석 내용 + AI 작성 버튼 */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between ml-2 mr-0">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest">분석 내러티브 (MARKDOWN)</Label>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleAIWrite}
                                    disabled={isWriting || (!symbol && !name)}
                                    className="h-8 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 font-black text-[8px] tracking-widest uppercase border border-amber-500/20 transition-all active:scale-95 disabled:opacity-30 gap-1.5"
                                >
                                    {isWriting ? <Loader2 className="w-3 h-3 animate-spin" /> : <PenLine className="w-3 h-3" />}
                                    {isWriting ? 'AI 작성중...' : 'AI 작성'}
                                </Button>
                            </div>
                            <textarea
                                className={cn(
                                    "min-h-[180px] w-full rounded-3xl border border-white/5 bg-white/5 p-6 text-xs font-bold text-white placeholder:text-white/10 leading-relaxed resize-none focus:ring-2 focus:ring-indigo-500/20 transition-all",
                                    aiAssisted && content && "border-indigo-500/20"
                                )}
                                placeholder="시장 센서, 위험 요소, 촉매제에 대한 분석 내용을 입력하거나 AI 작성 버튼을 눌러보세요..."
                                value={content}
                                onChange={e => setContent(e.target.value)}
                            />
                        </div>

                        {/* 태그 */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">메타데이터 태그</Label>
                            <Input
                                placeholder="반도체, 성장주, AI, 배당주..."
                                className={cn(
                                    "h-12 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/10 text-[10px] font-black uppercase tracking-widest transition-all",
                                    aiAssisted && tags && "border-indigo-500/20"
                                )}
                                value={tags}
                                onChange={e => setTags(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-10 pt-4 bg-white/[0.02] border-t border-white/5">
                        <Button
                            onClick={handleSave}
                            disabled={!symbol || !name}
                            className="w-full h-16 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-sm tracking-[0.2em] shadow-2xl active:scale-95 transition-all uppercase disabled:opacity-30"
                        >
                            분석 피드에 업로드
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

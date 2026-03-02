'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronDown, ChevronUp, Loader2, Brain, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioHolding } from '@/types';

interface PortfolioInsight {
    overallSentiment: 'bullish' | 'neutral' | 'bearish';
    diversificationScore: number;
    riskLevel: 'conservative' | 'moderate' | 'aggressive';
    strengths: string[];
    risks: string[];
    recommendations: string[];
    summary: string;
}

interface AIInsightPanelProps {
    holdings: (PortfolioHolding & { currentPrice?: number })[];
}

const SENTIMENT_STYLE = {
    bullish: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    neutral: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    bearish: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
} as const;

const SENTIMENT_LABEL = { bullish: '강세', neutral: '중립', bearish: '약세' } as const;
const RISK_COLOR = { conservative: 'text-emerald-400', moderate: 'text-amber-400', aggressive: 'text-rose-400' } as const;
const RISK_LABEL = { conservative: '안정형', moderate: '중립형', aggressive: '공격형' } as const;

export function AIInsightPanel({ holdings }: AIInsightPanelProps) {
    const { stockAnalyses } = useData();
    const [insight, setInsight] = useState<PortfolioInsight | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'analyze_portfolio',
                    payload: { holdings, analyses: stockAnalyses },
                }),
            });
            if (!res.ok) throw new Error('AI 분석 요청 실패');
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setInsight(data);
            setIsExpanded(true);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white/5 rounded-3xl border border-white/5 p-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">AI 포트폴리오 진단</h3>
                        <p className="text-[9px] text-white/30 uppercase tracking-widest">Gemini 2.0 Flash 기반 분석</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {insight && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                        >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    )}
                    <Button
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        className="h-9 px-5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-black text-[9px] tracking-widest uppercase shadow-lg active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isLoading ? (
                            <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> 분석중</>
                        ) : (
                            <><Sparkles className="w-3 h-3 mr-1.5" /> AI 분석</>
                        )}
                    </Button>
                </div>
            </div>

            {error && (
                <p className="mt-3 text-[10px] text-rose-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {error}
                </p>
            )}

            <AnimatePresence>
                {insight && isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="mt-6 space-y-5">
                            {/* 주요 지표 */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className={cn("rounded-2xl border p-4 text-center", SENTIMENT_STYLE[insight.overallSentiment])}>
                                    <span className="text-[8px] font-black uppercase tracking-widest block mb-1 opacity-60">시장 심리</span>
                                    <span className="text-sm font-black">{SENTIMENT_LABEL[insight.overallSentiment]}</span>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                                    <span className="text-[8px] font-black uppercase tracking-widest block mb-1 text-white/40">분산 점수</span>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-sm font-black text-white">{insight.diversificationScore}</span>
                                        <span className="text-[9px] text-white/30">/10</span>
                                    </div>
                                    <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all"
                                            style={{ width: `${insight.diversificationScore * 10}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                                    <span className="text-[8px] font-black uppercase tracking-widest block mb-1 text-white/40">리스크</span>
                                    <span className={cn("text-sm font-black", RISK_COLOR[insight.riskLevel])}>
                                        {RISK_LABEL[insight.riskLevel]}
                                    </span>
                                </div>
                            </div>

                            {/* 총평 */}
                            <div className="bg-indigo-500/10 rounded-2xl border border-indigo-500/20 p-5">
                                <p className="text-xs text-white/80 leading-relaxed font-medium italic">
                                    &quot;{insight.summary}&quot;
                                </p>
                            </div>

                            {/* 강점 / 리스크 / 추천 */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2.5">
                                    <h4 className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <CheckCircle className="w-3 h-3" /> 강점
                                    </h4>
                                    {insight.strengths.map((s, i) => (
                                        <p key={i} className="text-[10px] text-white/60 font-medium leading-snug">• {s}</p>
                                    ))}
                                </div>
                                <div className="space-y-2.5">
                                    <h4 className="text-[9px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <AlertTriangle className="w-3 h-3" /> 리스크
                                    </h4>
                                    {insight.risks.map((r, i) => (
                                        <p key={i} className="text-[10px] text-white/60 font-medium leading-snug">• {r}</p>
                                    ))}
                                </div>
                                <div className="space-y-2.5">
                                    <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Zap className="w-3 h-3" /> 추천 액션
                                    </h4>
                                    {insight.recommendations.map((rec, i) => (
                                        <p key={i} className="text-[10px] text-white/60 font-medium leading-snug">• {rec}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

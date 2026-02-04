'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { TrendingUp, Search, Plus, ExternalLink, BarChart3, Star, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { generateId, cn } from '@/lib/utils';
import { StockAnalysis } from '@/types';

export function InvestmentTab() {
    const { stockAnalyses, addStockAnalysis, deleteStockAnalysis } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form
    const [symbol, setSymbol] = useState('');
    const [name, setName] = useState('');
    const [rating, setRating] = useState<'buy' | 'hold' | 'sell'>('buy');
    const [targetPrice, setTargetPrice] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');

    const handleSave = () => {
        if (!symbol || !name) return;

        const analysis: StockAnalysis = {
            id: generateId(),
            symbol: symbol.toUpperCase(),
            name,
            rating,
            targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
            content,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            analysisDate: new Date()
        };

        addStockAnalysis(analysis);
        setIsDialogOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setSymbol('');
        setName('');
        setRating('buy');
        setTargetPrice('');
        setContent('');
        setTags('');
    };

    const handleExternalSearch = () => {
        const query = searchQuery || 'NVDA';
        window.open(`https://finance.yahoo.com/quote/${query}`, '_blank');
    };

    return (
        <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">투자 분석</h2>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> 새 분석 작성
                </Button>
            </div>

            {/* Stock Search Bar */}
            <Card className="bg-slate-900 border-none text-white">
                <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold">실시간 종목 검색</h3>
                            <span className="text-xs opacity-50">Powered by Alpha Vantage / Yahoo Finance</span>
                        </div>
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="티커(Ticker) 검색 (예: TSLA, AAPL, NVDA)"
                                    className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleExternalSearch()}
                                />
                            </div>
                            <Button onClick={handleExternalSearch} variant="secondary" className="bg-white text-slate-900 hover:bg-slate-200">
                                시세/재무 조회
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Analysis List */}
            <div className="space-y-4 pb-10">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    내 투자 인사이트
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stockAnalyses.map(analysis => (
                        <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xl font-bold">
                                    {analysis.name} <span className="text-sm font-normal text-muted-foreground ml-2">({analysis.symbol})</span>
                                </CardTitle>
                                <div className={cn(
                                    "px-2 py-1 rounded text-xs font-bold uppercase",
                                    analysis.rating === 'buy' ? "bg-red-100 text-red-600" :
                                        analysis.rating === 'sell' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                                )}>
                                    {analysis.rating}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="text-sm text-muted-foreground">목표가: <span className="text-slate-900 font-bold">{analysis.targetPrice?.toLocaleString()} USD</span></div>
                                        <div className="text-xs text-muted-foreground">{new Date(analysis.analysisDate).toLocaleDateString()}</div>
                                    </div>
                                    <p className="text-sm line-clamp-3 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                                        {analysis.content}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.tags?.map(tag => (
                                            <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">#{tag}</span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button variant="outline" className="flex-1 h-9" onClick={() => window.open(`https://finance.yahoo.com/quote/${analysis.symbol}`, '_blank')}>
                                            <ExternalLink className="w-3 h-3 mr-2" /> 상세 조회
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-600" onClick={() => deleteStockAnalysis(analysis.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {stockAnalyses.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground bg-slate-50 rounded-2xl border-2 border-dashed">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>작성된 투자 분석이 없습니다. 첫 번째 인사이트를 기록해 보세요.</p>
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>새 투자 분석</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>티커 (Symbol)</Label>
                                <Input placeholder="예: TSLA" value={symbol} onChange={e => setSymbol(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>종목명</Label>
                                <Input placeholder="예: 테슬라" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>의견 (Rating)</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    value={rating}
                                    onChange={e => setRating(e.target.value as any)}
                                >
                                    <option value="buy">BUY (매수)</option>
                                    <option value="hold">HOLD (보유)</option>
                                    <option value="sell">SELL (매도)</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label>목표가</Label>
                                <Input type="number" placeholder="예: 300" value={targetPrice} onChange={e => setTargetPrice(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>분석 내용 (Markdown 지원)</Label>
                            <textarea
                                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="재무 상태, 뉴스, 차트 분석 내용 등을 기록하세요."
                                value={content}
                                onChange={e => setContent(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>태그 (쉼표 구분)</Label>
                            <Input placeholder="#빅테크 #AI #성장주" value={tags} onChange={e => setTags(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave} disabled={!symbol || !name}>분석 저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

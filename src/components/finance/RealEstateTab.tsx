'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
    Building2, Search, Plus, ExternalLink, MapPin, Trash2, Home,
    Loader2, Sparkles, Map, Globe, Compass, Terminal, Target,
    ShieldCheck, Activity, ArrowUpRight, Zap
} from 'lucide-react';
import { generateId, cn } from '@/lib/utils';
import { RealEstateScrap } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export function RealEstateTab() {
    const { realEstateScraps, addRealEstateScrap, deleteRealEstateScrap } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFetching, setIsFetching] = useState(false);

    // Form
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState('');
    const [url, setUrl] = useState('');
    const [memo, setMemo] = useState('');

    const handleSave = () => {
        if (!title || !url) return;
        const scrap: RealEstateScrap = {
            id: generateId(),
            title, location, price, url, memo,
            scrapedAt: new Date()
        };
        addRealEstateScrap(scrap);
        setIsDialogOpen(false); resetForm();
    };

    const resetForm = () => {
        setTitle(''); setLocation(''); setPrice(''); setUrl(''); setMemo('');
    };

    const handleExternalSearch = () => {
        const query = searchQuery || '아파트';
        window.open(`https://land.naver.com/search/search.naver?query=${encodeURIComponent(query)}`, '_blank');
    };

    const handleUrlFetch = async () => {
        if (!url || !url.includes('naver.com')) return;
        setIsFetching(true);
        setTimeout(() => {
            let extractedTitle = "PROPERTY ASSET";
            let extractedMemo = "";
            let extractedLocation = "";
            let extractedPrice = "";
            try {
                const urlObj = new URL(url);
                if (urlObj.hostname.includes('naver.com')) {
                    const articleNo = urlObj.searchParams.get('articleNo');
                    const complexNo = urlObj.pathname.split('/')[2];
                    if (articleNo) {
                        extractedTitle = `NAVER REALTY [${articleNo}]`;
                        extractedMemo = `IDENTIFIER: ${articleNo}`;
                        extractedPrice = "TBC";
                    } else if (complexNo) {
                        extractedTitle = `COMPLEX [${complexNo}]`;
                        extractedMemo = `COMPLEX_ID: ${complexNo}`;
                    }
                    extractedLocation = "G-COORDS REQUIRED";
                }
            } catch (e) { console.error("URL Parse error", e); }
            setTitle(extractedTitle); setLocation(extractedLocation); setPrice(extractedPrice); setMemo(extractedMemo);
            setIsFetching(false);
        }, 800);
    };

    return (
        <div className="h-full flex flex-col glass-premium rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] via-transparent to-emerald-500/[0.03] pointer-events-none" />

            {/* Header / Remote Engine */}
            <div className="p-8 pb-4 relative z-10">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(245,158,11,0.5)]">
                            <Map className="w-6 h-6 text-white" strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">부동산 매물 저장소</h2>
                            <p className="text-[10px] font-bold text-white/60 tracking-[0.3em] uppercase mt-2 italic flex items-center gap-2">
                                <Compass className="w-3 h-3 text-amber-500" /> 지형 스캔: 활성화 (ACTIVE)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="group relative w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-amber-500 transition-colors" />
                            <Input
                                placeholder="지역 또는 아파트 단지명 검색..."
                                className="h-12 pl-12 bg-white/5 border-white/5 rounded-2xl text-white font-black text-[10px] tracking-widest uppercase placeholder:text-white/30 focus-visible:ring-amber-500/30"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleExternalSearch()}
                            />
                        </div>
                        <Button
                            onClick={() => setIsDialogOpen(true)}
                            className="h-12 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] tracking-widest uppercase shadow-xl transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4 mr-2" strokeWidth={3} /> 매물 스크랩하기
                        </Button>
                    </div>
                </div>
            </div>

            {/* Property Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {realEstateScraps.map((scrap, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={scrap.id}
                                className="group glass-premium rounded-[40px] border border-white/5 transition-all hover:bg-white/[0.02] relative overflow-hidden flex flex-col"
                            >
                                <div className="h-44 bg-gradient-to-br from-white/[0.05] to-transparent relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-all duration-700">
                                        <Globe className="w-full h-full scale-150 -translate-y-1/4" strokeWidth={0.5} />
                                    </div>
                                    <Home className="w-16 h-16 text-white/5 group-hover:scale-110 transition-transform duration-700" />

                                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                        <button
                                            onClick={() => deleteRealEstateScrap(scrap.id)}
                                            className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-xl"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="absolute bottom-6 left-6">
                                        <div className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/20 backdrop-blur-md text-[8px] font-black text-amber-500 tracking-[0.2em] uppercase">
                                            매물 정보 데이터 (ARTIFACT)
                                        </div>
                                    </div>
                                </div>

                                <CardContent className="p-8 flex flex-col gap-6">
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tight uppercase leading-tight mb-2 truncate">{scrap.title}</h3>
                                        <div className="flex items-center gap-2 text-white/60 whitespace-nowrap overflow-hidden">
                                            <MapPin className="w-3 h-3 text-amber-500/40" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest truncate">{scrap.location || 'COORD_UNDEFINED'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-baseline gap-3">
                                        <span className="text-2xl font-black text-amber-500 tracking-tighter">{scrap.price || 'P_TBC'}</span>
                                        <span className="text-[9px] font-bold text-white/40 tracking-widest uppercase">평가액 (VALUATION)</span>
                                    </div>

                                    {scrap.memo && (
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <p className="text-[10px] font-bold text-white/40 leading-relaxed italic uppercase tracking-tighter line-clamp-2">
                                                &quot;{scrap.memo}&quot;
                                            </p>
                                        </div>
                                    )}

                                    <Button
                                        variant="ghost"
                                        className="w-full h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-[10px] font-black text-white tracking-[0.2em] uppercase gap-3 mt-4 border border-white/5 transition-all active:scale-95 group/btn"
                                        onClick={() => window.open(scrap.url, '_blank')}
                                    >
                                        원격 상세 정보 보기 <ExternalLink className="w-4 h-4 group-hover/btn:text-amber-500" />
                                    </Button>
                                </CardContent>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {realEstateScraps.length === 0 && (
                        <div className="col-span-full h-80 flex flex-col items-center justify-center opacity-10 gap-6 border-2 border-dashed border-white/10 rounded-[48px]">
                            <Building2 className="w-20 h-20" />
                            <div className="text-center space-y-1">
                                <h3 className="text-2xl font-black tracking-[0.2em] uppercase">매물 정보가 없습니다</h3>
                                <p className="text-[10px] font-bold tracking-[0.5em] uppercase">스크랩된 지형 자산 정보가 발견되지 않았습니다</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass-premium border border-white/10 text-white rounded-[40px] p-0 shadow-2xl sm:max-w-xl max-h-[90vh] overflow-hidden">
                    <DialogHeader className="p-10 pb-0">
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase mb-2">지능형 매물 스크랩</DialogTitle>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] italic">부동산 자산 데이터를 시스템 저장소(VAULT)로 통합합니다</p>
                    </DialogHeader>
                    <div className="overflow-y-auto custom-scrollbar p-10 pt-4 space-y-8">
                        <div className="grid gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-2">정보 출처 (URL / NAVER REALTY)</Label>
                                <div className="flex gap-4">
                                    <Input
                                        placeholder="매물 또는 단지 URL 입력..."
                                        className="h-14 font-black text-[10px] tracking-widest uppercase bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/30"
                                        value={url}
                                        onChange={e => setUrl(e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-14 w-14 rounded-2xl border-white/5 bg-white/5 hover:bg-amber-500/20 transition-all shadow-xl"
                                        onClick={handleUrlFetch}
                                        disabled={isFetching || !url}
                                    >
                                        {isFetching ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 text-amber-500" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-2">매물 식별자 (NAME)</Label>
                                <Input placeholder="예: 반포 자이 84㎡, 판교 푸르지오..." className="h-12 font-black text-sm tracking-widest uppercase bg-white/5 border-white/5 rounded-2xl text-white" value={title} onChange={e => setTitle(e.target.value)} />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-2">지리적 위치 (LOCATION)</Label>
                                    <Input placeholder="서울시 서초구..." className="h-12 font-black text-[10px] tracking-widest uppercase bg-white/5 border-white/5 rounded-2xl text-white" value={location} onChange={e => setLocation(e.target.value)} />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-2">평가 가치 (KRW)</Label>
                                    <Input placeholder="예: 35억, 5억/200" className="h-12 font-black text-[10px] tracking-widest bg-white/5 border-white/5 rounded-2xl text-white" value={price} onChange={e => setPrice(e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-2">현장 관찰 기록 (MEMO)</Label>
                                <textarea
                                    className="min-h-[150px] w-full rounded-3xl border border-white/5 bg-white/5 p-6 text-xs font-bold text-white placeholder:text-white/30 leading-relaxed resize-none focus:ring-2 focus:ring-amber-500/20"
                                    placeholder="학군, 교통, 주변 인프라 및 단지 특징 입력..."
                                    value={memo}
                                    onChange={e => setMemo(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-10 pt-4 bg-white/[0.02] border-t border-white/5">
                        <Button
                            onClick={handleSave}
                            disabled={!title || !url}
                            className="w-full h-16 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm tracking-[0.2em] shadow-2xl active:scale-95 transition-all uppercase"
                        >
                            저장소에 정보 승인 및 기록
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

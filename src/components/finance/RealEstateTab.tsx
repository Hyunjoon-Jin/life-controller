'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Building2, Search, Plus, ExternalLink, MapPin, Trash2, Home, Loader2, Sparkles } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { RealEstateScrap } from '@/types';

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
            title,
            location,
            price,
            url,
            memo,
            scrapedAt: new Date()
        };

        addRealEstateScrap(scrap);
        setIsDialogOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setTitle('');
        setLocation('');
        setPrice('');
        setUrl('');
        setMemo('');
    };

    const handleExternalSearch = () => {
        const query = searchQuery || '아파트';
        window.open(`https://land.naver.com/search/search.naver?query=${encodeURIComponent(query)}`, '_blank');
    };

    const handleUrlFetch = async () => {
        if (!url || !url.includes('naver.com')) return;

        setIsFetching(true);
        // Parse URL for basic info
        setTimeout(() => {
            let extractedTitle = "부동산 매물";
            let extractedMemo = "";
            let extractedLocation = "";

            try {
                const urlObj = new URL(url);
                if (urlObj.hostname.includes('naver.com')) {
                    // Try to extract some ID or just indicate it's from Naver
                    if (url.includes('articleNo') || url.includes('articleDetail')) {
                        extractedTitle = "네이버 부동산 매물 (정보 입력 필요)";
                        extractedMemo = `링크: ${urlObj.origin}${urlObj.pathname}...`;
                    } else {
                        extractedTitle = "네이버 부동산 Link";
                    }
                    extractedLocation = "위치 정보 직접 입력";
                }
            } catch (e) {
                console.error("URL Parse error", e);
            }

            setTitle(extractedTitle);
            setLocation(extractedLocation);
            // setPrice(""); // Leave empty for user to fill
            setMemo(extractedMemo);

            setIsFetching(false);
        }, 800);
    };

    return (
        <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">부동산 관리</h2>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> 새 물건 스크랩
                </Button>
            </div>

            {/* External Search Bar */}
            <Card className="bg-slate-50 border-none">
                <CardContent className="p-4 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="아파트, 지역명 검색 (네이버 부동산 연동)"
                            className="pl-10 bg-white"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleExternalSearch()}
                        />
                    </div>
                    <Button onClick={handleExternalSearch} variant="secondary">시세 검색</Button>
                </CardContent>
            </Card>

            {/* Scrap Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                {realEstateScraps.map(scrap => (
                    <Card key={scrap.id} className="group hover:shadow-lg transition-all border-slate-100 overflow-hidden">
                        <div className="h-32 bg-slate-100 flex items-center justify-center relative">
                            <Home className="w-12 h-12 text-slate-300" />
                            <div className="absolute top-2 right-2 flex gap-2">
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => deleteRealEstateScrap(scrap.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <CardContent className="p-4">
                            <h3 className="font-bold text-lg mb-1 truncate">{scrap.title}</h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                                <MapPin className="w-3 h-3" /> {scrap.location || '위치 정보 없음'}
                            </div>
                            <div className="text-primary font-bold text-lg mb-4">{scrap.price || '가격 확인 필요'}</div>

                            <div className="space-y-3">
                                {scrap.memo && (
                                    <p className="text-sm text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg italic">
                                        "{scrap.memo}"
                                    </p>
                                )}
                                <Button
                                    variant="outline"
                                    className="w-full flex items-center justify-center gap-2"
                                    onClick={() => window.open(scrap.url, '_blank')}
                                >
                                    <ExternalLink className="w-4 h-4" /> 온라인 임장 가기
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {realEstateScraps.length === 0 && (
                    <div className="col-span-full py-20 text-center text-muted-foreground bg-slate-50 rounded-2xl border-2 border-dashed">
                        <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>관심 있는 부동산 매물을 스크랩해 보세요.</p>
                        <p className="text-xs">네이버 부동산 등 플랫폼에서 복사한 URL을 등록할 수 있습니다.</p>
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>관심 매물 스크랩</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>URL (매뉴얼 스크랩)</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="네이버 부동산 매물 주소"
                                    value={url}
                                    onChange={e => setUrl(e.target.value)}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    title="정보 가져오기"
                                    onClick={handleUrlFetch}
                                    disabled={isFetching || !url}
                                >
                                    {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-500" />}
                                </Button>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>매물명</Label>
                            <Input placeholder="예: 반포자이 84㎡" value={title} onChange={e => setTitle(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>위치</Label>
                            <Input placeholder="예: 서울시 서초구 반포동" value={location} onChange={e => setLocation(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>희망가/시세</Label>
                            <Input placeholder="예: 35억 (매매)" value={price} onChange={e => setPrice(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>임장 메모 / 체크리스트</Label>
                            <Input placeholder="학군, 역세권 여부 등" value={memo} onChange={e => setMemo(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave} disabled={!title || !url}>스크랩하기</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Book, BookStatus } from '@/types';
import { useData } from '@/context/DataProvider';
import { generateId, cn } from '@/lib/utils';
import { Link2, Search, Loader2, BookOpen, Star, Quote, Sparkles } from 'lucide-react';
import { analyzeBookNote } from '@/lib/gemini';
import Image from 'next/image';

interface BookSearchDialogProps {
    isOpen: boolean;
    onClose: () => void;
    bookToEdit?: Book | null;
}

export function BookSearchDialog({ isOpen, onClose, bookToEdit }: BookSearchDialogProps) {
    const { addBook, updateBook } = useData();
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAIAnalyze = async () => {
        if (!review.trim()) return;
        setIsAnalyzing(true);
        try {
            const { summary, insights, actionItems } = await analyzeBookNote(review, title);
            const formattedResult = `
[AI 독서 분석]
💡 핵심 요약: ${summary}

✨ 주요 인사이트:
${insights.map(i => `- ${i}`).join('\n')}

🚀 실천 가이드:
${actionItems.map(a => `- ${a}`).join('\n')}
`;
            setReview(prev => `${prev}\n\n${formattedResult}`);
        } catch (error) {
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Tab State
    const [activeTab, setActiveTab] = useState<'search' | 'url'>('search');
    const [selectedStore, setSelectedStore] = useState<'yes24' | 'kyobo' | 'aladin'>('yes24');
    const [keywords, setKeywords] = useState('');

    // Form State
    const [link, setLink] = useState('');
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [totalPages, setTotalPages] = useState('0');
    const [status, setStatus] = useState<BookStatus>('toread');
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');

    useEffect(() => {
        if (bookToEdit) {
            setLink(bookToEdit.link || '');
            setTitle(bookToEdit.title);
            setAuthor(bookToEdit.author);
            setCoverUrl(bookToEdit.coverUrl || '');
            setTotalPages(bookToEdit.totalPages.toString());
            setStatus(bookToEdit.status);
            setRating(bookToEdit.rating || 0);
            setReview(bookToEdit.review || '');
        } else {
            resetForm();
        }
    }, [bookToEdit, isOpen]);

    const resetForm = () => {
        setLink('');
        setTitle('');
        setAuthor('');
        setCoverUrl('');
        setTotalPages('0');
        setStatus('toread');
        setRating(0);
        setReview('');
        setKeywords('');
    };

    const handleSearch = () => {
        if (!keywords) return;

        let searchUrl = '';
        if (selectedStore === 'yes24') {
            searchUrl = `http://www.yes24.com/Product/Search?domain=ALL&query=${encodeURIComponent(keywords)}`;
        } else if (selectedStore === 'kyobo') {
            searchUrl = `https://search.kyobobook.co.kr/search?keyword=${encodeURIComponent(keywords)}`;
        } else if (selectedStore === 'aladin') {
            searchUrl = `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=${encodeURIComponent(keywords)}`;
        }

        if (searchUrl) {
            window.open(searchUrl, '_blank');
        }
    };

    const handleUrlScrape = async () => {
        if (!link) return;
        setIsLoading(true);

        try {
            const res = await fetch(`/api/books/scrape?url=${encodeURIComponent(link)}`);
            const data = await res.json();

            if (res.ok) {
                if (data.title) setTitle(data.title);
                if (data.author) setAuthor(data.author);
                if (data.coverUrl) setCoverUrl(data.coverUrl);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (!title.trim()) return;

        const bookData: Book = {
            id: bookToEdit ? bookToEdit.id : generateId(),
            title,
            author,
            totalPages: parseInt(totalPages) || 0,
            currentPage: bookToEdit?.currentPage || 0,
            status,
            coverUrl,
            link,
            rating: rating || undefined,
            review: review || undefined,
            startDate: bookToEdit?.startDate || (status === 'reading' ? new Date() : undefined),
            endDate: bookToEdit?.endDate || (status === 'completed' ? new Date() : undefined),
            quotes: bookToEdit?.quotes || []
        };

        if (bookToEdit) {
            updateBook(bookData);
        } else {
            addBook(bookData);
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>{bookToEdit ? '책 정보 수정' : '새 책 추가'}</DialogTitle>
                    <DialogDescription>
                        책 정보를 입력하거나 링크를 통해 자동으로 불러오세요.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full">
                        <div className="md:col-span-12 flex flex-col gap-4">
                            {/* Tabs Header */}
                            {!bookToEdit && (
                                <div className="flex border-b mb-4">
                                    <button
                                        className={cn(
                                            "flex-1 pb-3 text-sm font-bold border-b-2 transition-colors",
                                            activeTab === 'search' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                                        )}
                                        onClick={() => setActiveTab('search')}
                                    >
                                        <Search className="w-4 h-4 mr-2 inline-block" /> 키워드 검색
                                    </button>
                                    <button
                                        className={cn(
                                            "flex-1 pb-3 text-sm font-bold border-b-2 transition-colors",
                                            activeTab === 'url' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                                        )}
                                        onClick={() => setActiveTab('url')}
                                    >
                                        <Link2 className="w-4 h-4 mr-2 inline-block" /> URL로 가져오기
                                    </button>
                                </div>
                            )}

                            {/* SEARCH TAB CONTENT */}
                            {!bookToEdit && activeTab === 'search' && (
                                <div className="space-y-4 p-4 bg-muted/20 rounded-xl border border-border/50">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="font-bold flex items-center gap-2">
                                                도서 검색
                                            </Label>
                                            <div className="flex bg-muted p-1 rounded-lg">
                                                {(['yes24', 'kyobo', 'aladin'] as const).map((s) => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setSelectedStore(s)}
                                                        className={cn(
                                                            "px-3 py-1 text-xs font-bold rounded-md transition-all",
                                                            selectedStore === s ? "bg-card shadow text-primary" : "text-muted-foreground hover:text-foreground"
                                                        )}
                                                    >
                                                        {s === 'yes24' ? 'Yes24' : s === 'kyobo' ? '교보문고' : '알라딘'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    placeholder={`${selectedStore === 'yes24' ? 'Yes24' : selectedStore === 'kyobo' ? '교보문고' : '알라딘'}에서 검색...`}
                                                    className="pl-9"
                                                    value={keywords}
                                                    onChange={(e) => setKeywords(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                                />
                                            </div>
                                            <Button onClick={handleSearch} disabled={!keywords}>
                                                검색
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="text-xs text-muted-foreground bg-blue-500/10 p-3 rounded-lg flex gap-2 items-start mt-2">
                                        <div className="w-5 h-5 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">?</div>
                                        <div>
                                            <p className="font-bold text-blue-400 mb-1">사용 방법</p>
                                            <ol className="list-decimal pl-4 space-y-1">
                                                <li>위 검색창에 책 제목을 입력하고 <strong>검색</strong>을 누르세요.</li>
                                                <li>새 창에 뜨는 서점 사이트에서 원하는 책을 찾으세요.</li>
                                                <li>그 책의 <strong>상세 페이지 URL(주소)</strong>을 복사하세요.</li>
                                                <li>그 책의 <strong>&apos;URL로 가져오기&apos;</strong> 탭으로 이동하여 주소를 붙여넣으세요.</li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* URL TAB CONTENT */}
                            {!bookToEdit && activeTab === 'url' && (
                                <div className="space-y-4 p-4 bg-muted/20 rounded-xl border border-border/50">
                                    <div className="flex flex-col gap-2">
                                        <Label className="font-bold flex items-center gap-2">
                                            <Link2 className="w-4 h-4 text-primary" /> URL로 정보 가져오기
                                        </Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Yes24, 교보문고, 알라딘 도서 상세 페이지 URL"
                                                    className="pl-9"
                                                    value={link}
                                                    onChange={(e) => setLink(e.target.value)}
                                                />
                                            </div>
                                            <Button onClick={handleUrlScrape} disabled={isLoading || !link}>
                                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "불러오기"}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            * 도서 상세 페이지 주소를 입력하면 제목, 저자, 표지를 자동으로 채워줍니다.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Separator if needed */}
                            {!bookToEdit && <div className="border-t border-dashed my-2 relative">
                                <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-2 text-xs text-muted-foreground">또는 직접 입력</span>
                            </div>}

                            {/* Edit Form */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                <div className="md:col-span-4 flex flex-col items-center gap-4">
                                    <div className="w-full aspect-[2/3] bg-muted rounded-lg border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center relative overflow-hidden group">
                                        {coverUrl ? (
                                            <Image src={coverUrl} alt="Cover" fill className="object-cover" unoptimized />
                                        ) : (
                                            <div className="text-center p-4">
                                                <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                                                <span className="text-xs text-muted-foreground">표지 이미지 미리보기</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Input
                                                placeholder="이미지 URL 직접 입력"
                                                className="w-[90%] bg-white/90 text-xs"
                                                value={coverUrl}
                                                onChange={(e) => setCoverUrl(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    <div className="flex flex-col items-center gap-2">
                                        <Label className="text-xs text-muted-foreground">나의 평점</Label>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={cn(
                                                        "w-6 h-6 cursor-pointer transition-colors",
                                                        star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30 hover:text-yellow-200"
                                                    )}
                                                    onClick={() => setRating(star)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Inputs */}
                                <div className="md:col-span-8 flex flex-col gap-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 col-span-2">
                                            <Label htmlFor="book-title">제목 <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="book-title"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="font-bold text-lg"
                                                placeholder="책 제목"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="book-author">저자</Label>
                                            <Input
                                                id="book-author"
                                                value={author}
                                                onChange={(e) => setAuthor(e.target.value)}
                                                placeholder="지은이"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="book-pages">총 페이지</Label>
                                            <Input
                                                id="book-pages"
                                                type="number"
                                                value={totalPages}
                                                onChange={(e) => setTotalPages(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="book-status">상태</Label>
                                            <select
                                                id="book-status"
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value as BookStatus)}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            >
                                                <option value="toread">읽을 책 (To Read)</option>
                                                <option value="reading">읽고 있는 책 (Reading)</option>
                                                <option value="completed">완독 (Completed)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2 flex-1 flex flex-col">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="book-review">서평 / 메모</Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleAIAnalyze}
                                                disabled={!review.trim() || isAnalyzing}
                                                className="h-6 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 px-2"
                                            >
                                                {isAnalyzing ? (
                                                    <>
                                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                        분석 중...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-3 h-3 mr-1" />
                                                        AI 독서 분석
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        <Textarea
                                            id="book-review"
                                            value={review}
                                            onChange={(e) => setReview(e.target.value)}
                                            placeholder="책에 대한 감상이나 메모를 남겨주세요..."
                                            className="flex-1 min-h-[100px] resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t bg-muted/10">
                    <Button variant="outline" onClick={onClose}>취소</Button>
                    <Button onClick={handleSave} className="px-8">저장</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

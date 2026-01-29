import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Scrap } from '@/types';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Bookmark, Plus, Trash2, ExternalLink, Globe, Pencil, X, Search,
    Filter, SortAsc, ArrowUpDown, Check, RotateCcw
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function ScrapManager() {
    const { scraps, addScrap, updateScrap, deleteScrap } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        memo: '',
        tags: [] as string[],
        currentTag: ''
    });
    const [searchQuery, setSearchQuery] = useState(''); // Naver Search
    const [filterQuery, setFilterQuery] = useState(''); // Local Search
    const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'title'>('newest');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingScrap, setEditingScrap] = useState<Scrap | null>(null);

    const handleSave = async () => {
        if (!formData.url) return;
        setIsSubmitting(true);

        let url = formData.url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        let fetchedTitle = formData.title;
        let fetchedImage = '';

        try {
            const res = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`);
            if (res.ok) {
                const data = await res.json();
                if (!fetchedTitle && data.title) fetchedTitle = data.title;
                if (data.image) fetchedImage = data.image;
            }
        } catch (error) {
            console.error(error);
        }

        if (editingScrap) {
            updateScrap({
                ...editingScrap,
                title: fetchedTitle || formData.title || editingScrap.title,
                url,
                memo: formData.memo,
                tags: formData.tags,
                image: fetchedImage || editingScrap.image
            });
        } else {
            addScrap({
                id: generateId(),
                title: fetchedTitle || url,
                url,
                memo: formData.memo,
                tags: formData.tags,
                image: fetchedImage,
                createdAt: new Date()
            });
        }

        setIsDialogOpen(false);
        setFormData({ title: '', url: '', memo: '', tags: [], currentTag: '' });
        setEditingScrap(null);
        setIsSubmitting(false);
    };

    const handleAddTag = () => {
        if (!formData.currentTag.trim()) return;
        if (formData.tags.includes(formData.currentTag.trim())) {
            setFormData({ ...formData, currentTag: '' });
            return;
        }
        setFormData({
            ...formData,
            tags: [...formData.tags, formData.currentTag.trim()],
            currentTag: ''
        });
    };

    const handleRemoveTag = (tag: string) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(t => t !== tag)
        });
    };

    const handleOpenEdit = (scrap: Scrap) => {
        setEditingScrap(scrap);
        setFormData({
            title: scrap.title,
            url: scrap.url,
            memo: scrap.memo || '',
            tags: scrap.tags || [],
            currentTag: ''
        });
        setIsDialogOpen(true);
    };

    const handleOpenCreate = () => {
        setEditingScrap(null);
        setFormData({ title: '', url: '', memo: '', tags: [], currentTag: '' });
        setIsDialogOpen(true);
    };

    const filteredScraps = scraps
        .filter(scrap => {
            const query = filterQuery.toLowerCase();
            const matchText =
                scrap.title.toLowerCase().includes(query) ||
                scrap.memo?.toLowerCase().includes(query) ||
                scrap.tags?.some(tag => tag.toLowerCase().includes(query));

            const matchTag = selectedTag ? scrap.tags?.includes(selectedTag) : true;

            return matchText && matchTag;
        })
        .sort((a, b) => {
            if (sortOption === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortOption === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sortOption === 'title') return a.title.localeCompare(b.title);
            return 0;
        });

    const allTags = Array.from(new Set(scraps.flatMap(s => s.tags || []))).sort();

    const handleSearchNews = () => {
        if (!searchQuery.trim()) return;
        window.open(`https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(searchQuery)}`, '_blank');
        setSearchQuery('');
    };

    return (
        <div className="h-full flex flex-col bg-card text-card-foreground rounded-3xl border border-transparent shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bookmark className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold">스크랩</h2>
                    </div>
                    <Button onClick={handleOpenCreate} size="sm" className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" /> 추가
                    </Button>
                </div>
            </div>

            {/* Naver News Search Bar */}
            <div className="px-6 pb-2 pt-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-green-500">N</span>
                        <Input
                            placeholder="네이버 뉴스 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchNews()}
                            className="pl-8 bg-green-50/50 border-green-200 focus-visible:ring-green-500/30"
                        />
                    </div>
                    <Button onClick={handleSearchNews} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        검색
                    </Button>
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 ml-1 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    검색 시 네이버 뉴스 페이지가 새 창으로 열립니다.
                </div>
            </div>

            {/* Filter & Toolbar */}
            <div className="px-6 py-2 flex flex-col gap-3 border-b border-border/50 pb-4">
                {/* Local Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="저장된 스크랩 검색 (제목, 메모, 태그)..."
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        className="pl-9 bg-muted/50 border-transparent focus:bg-background transition-colors"
                    />
                </div>

                {/* Tags & Tools */}
                <div className="flex items-center justify-between gap-2 overflow-hidden">
                    {/* Tag List */}
                    <div className="flex-1 overflow-x-auto custom-scrollbar flex items-center gap-1.5 pb-1">
                        <div
                            onClick={() => setSelectedTag(null)}
                            className={cn(
                                "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all whitespace-nowrap borderSelect",
                                selectedTag === null
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                            )}
                        >
                            <RotateCcw className="w-3 h-3" />
                            전체
                        </div>
                        {allTags.map(tag => (
                            <div
                                key={tag}
                                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                                className={cn(
                                    "px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all whitespace-nowrap border",
                                    selectedTag === tag
                                        ? "bg-primary/20 text-primary border-primary/20"
                                        : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                )}
                            >
                                #{tag}
                            </div>
                        ))}
                    </div>

                    {/* Sort Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSortOption('newest')}>
                                <div className="flex items-center w-full">
                                    <span className="flex-1">최신순</span>
                                    {sortOption === 'newest' && <Check className="w-4 h-4 ml-2" />}
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortOption('oldest')}>
                                <div className="flex items-center w-full">
                                    <span className="flex-1">오래된순</span>
                                    {sortOption === 'oldest' && <Check className="w-4 h-4 ml-2" />}
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortOption('title')}>
                                <div className="flex items-center w-full">
                                    <span className="flex-1">이름순</span>
                                    {sortOption === 'title' && <Check className="w-4 h-4 ml-2" />}
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                {filteredScraps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground opacity-50">
                        <Bookmark className="w-10 h-10 mb-2 opacity-50" />
                        <p>{scraps.length === 0 ? "저장된 기사가 없습니다." : "검색 결과가 없습니다."}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredScraps.map(scrap => (
                            <div key={scrap.id} className="group relative bg-white border border-border rounded-2xl p-0 hover:shadow-md transition-all flex flex-col gap-2 overflow-hidden">
                                {scrap.image && (
                                    <div className="w-full aspect-video bg-gray-100 overflow-hidden">
                                        <img src={scrap.image} alt={scrap.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                )}
                                <div className="p-4 pt-2 flex flex-col gap-2 flex-1">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                            <Globe className="w-3 h-3" />
                                            {new URL(scrap.url).hostname.replace('www.', '')}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenEdit(scrap)}
                                                className="h-6 w-6 text-muted-foreground hover:text-primary"
                                            >
                                                <Pencil className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteScrap(scrap.id)}
                                                className="h-6 w-6 text-muted-foreground hover:text-red-400"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    <a
                                        href={scrap.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium hover:text-primary transition-colors line-clamp-2 block mb-1"
                                    >
                                        {scrap.title}
                                        <ExternalLink className="w-3 h-3 inline-block ml-1 opacity-50" />
                                    </a>

                                    {scrap.memo && (
                                        <p className="text-sm text-muted-foreground line-clamp-3 bg-muted p-2 rounded-lg">
                                            {scrap.memo}
                                        </p>
                                    )}

                                    {scrap.tags && scrap.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {scrap.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setFilterQuery(tag);
                                                    }}
                                                    className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-md cursor-pointer hover:bg-primary/20"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-auto pt-2 text-[10px] text-muted-foreground text-right border-t border-border">
                                        {format(new Date(scrap.createdAt), 'yyyy.MM.dd', { locale: ko })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingScrap ? '스크랩 수정' : '기사/링크 스크랩'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>URL (필수)</Label>
                            <Input
                                placeholder="https://..."
                                value={formData.url}
                                onChange={e => setFormData({ ...formData, url: e.target.value })}
                                className="bg-muted border-transparent focus-visible:ring-primary/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>제목 (선택, 비워두면 자동 수집)</Label>
                            <Input
                                placeholder="기사 제목 (자동 입력됨)"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="bg-muted border-transparent focus-visible:ring-primary/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>메모 (선택)</Label>
                            <textarea
                                className="w-full bg-muted border-transparent rounded-xl p-3 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="내용 요약이나 생각..."
                                value={formData.memo}
                                onChange={e => setFormData({ ...formData, memo: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>태그</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="태그 입력 (Enter로 추가)"
                                    value={formData.currentTag}
                                    onChange={e => setFormData({ ...formData, currentTag: e.target.value })}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddTag();
                                        }
                                    }}
                                    className="bg-muted border-transparent focus-visible:ring-primary/30"
                                />
                                <Button type="button" onClick={handleAddTag} size="sm" variant="secondary">추가</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.tags.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-bold">
                                        #{tag}
                                        <button onClick={() => handleRemoveTag(tag)} className="hover:bg-primary/20 rounded-full p-0.5">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>취소</Button>
                        <Button onClick={handleSave} disabled={!formData.url || isSubmitting}>
                            {isSubmitting ? '저장 중...' : '저장'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}

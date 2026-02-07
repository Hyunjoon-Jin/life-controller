'use client';

import { useState, useRef, useMemo } from 'react';
import { useData } from '@/context/DataProvider';
import { Memo } from '@/types';
import { generateId, cn, safeFormat } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, X, Trash2, Image as ImageIcon, Tag, Paperclip, Sparkles, Star, Target, Briefcase, Eye, Edit3, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = [
    { name: 'yellow', value: 'bg-yellow-200 text-yellow-900 border-yellow-300' },
    { name: 'blue', value: 'bg-blue-200 text-blue-900 border-blue-300' },
    { name: 'pink', value: 'bg-pink-200 text-pink-900 border-pink-300' },
    { name: 'green', value: 'bg-green-200 text-green-900 border-green-300' },
    { name: 'purple', value: 'bg-purple-200 text-purple-900 border-purple-300' },
];

const MAX_PREVIEW_LENGTH = 150;

export function IdeaBoard() {
    const { memos, addMemo, updateMemo, deleteMemo, projects, goals } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
    const [editMode, setEditMode] = useState<'edit' | 'preview'>('edit');
    const [searchQuery, setSearchQuery] = useState('');

    // Form States
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [attachments, setAttachments] = useState<string[]>([]);
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [connectedProjectId, setConnectedProjectId] = useState<string | undefined>(undefined);
    const [connectedGoalId, setConnectedGoalId] = useState<string | undefined>(undefined);
    const [isFavorite, setIsFavorite] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter memos based on search query
    const filteredMemos = useMemo(() => {
        if (!searchQuery.trim()) return memos;

        const query = searchQuery.toLowerCase();
        return memos.filter(memo => {
            const titleMatch = memo.title?.toLowerCase().includes(query);
            const contentMatch = memo.content.toLowerCase().includes(query);
            const tagsMatch = memo.tags?.some(tag => tag.toLowerCase().includes(query));
            const projectMatch = memo.connectedProjectId &&
                projects.find(p => p.id === memo.connectedProjectId)?.title.toLowerCase().includes(query);
            const goalMatch = memo.connectedGoalId &&
                goals.find(g => g.id === memo.connectedGoalId)?.title.toLowerCase().includes(query);

            return titleMatch || contentMatch || tagsMatch || projectMatch || goalMatch;
        });
    }, [memos, searchQuery, projects, goals]);

    // Truncate content for preview
    const truncateContent = (text: string, maxLength: number = MAX_PREVIEW_LENGTH) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const handleOpen = (memo?: Memo) => {
        setEditMode('edit');
        if (memo) {
            setEditingMemo(memo);
            setTitle(memo.title || '');
            setContent(memo.content);
            setTags(memo.tags || []);
            setTagInput('');
            setAttachments(memo.attachments || []);
            setSelectedColor(COLORS.find(c => c.value.includes(memo.color.split(' ')[0])) || COLORS[0]);
            setConnectedProjectId(memo.connectedProjectId);
            setConnectedGoalId(memo.connectedGoalId);
            setIsFavorite(memo.isFavorite || false);
        } else {
            setEditingMemo(null);
            setTitle('');
            setContent('');
            setTags([]);
            setTagInput('');
            setAttachments([]);
            setSelectedColor(COLORS[0]);
            setConnectedProjectId(undefined);
            setConnectedGoalId(undefined);
            setIsFavorite(false);
        }
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!content.trim() && !title.trim()) return;

        if (editingMemo) {
            updateMemo({
                ...editingMemo,
                title,
                content,
                tags,
                attachments,
                color: selectedColor.value,
                connectedProjectId,
                connectedGoalId,
                isFavorite
            });
        } else {
            addMemo({
                id: generateId(),
                title,
                content,
                tags,
                attachments,
                color: selectedColor.value,
                createdAt: new Date(),
                connectedProjectId,
                connectedGoalId,
                isFavorite
            });
        }
        setIsDialogOpen(false);
    };

    const handleDelete = () => {
        if (editingMemo) {
            deleteMemo(editingMemo.id);
            setIsDialogOpen(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setAttachments(prev => [...prev, reader.result as string]);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="h-full flex flex-col bg-card text-card-foreground rounded-3xl border border-transparent shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold">아이디어 보드</h2>
                    </div>
                    <Button onClick={() => handleOpen()} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl">
                        <Plus className="w-4 h-4 mr-2" />
                        새 메모
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="제목, 내용, 태그, 프로젝트, 목표로 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-muted/50 border-transparent focus-visible:ring-primary/20"
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                            onClick={() => setSearchQuery('')}
                        >
                            <X className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                {filteredMemos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground opacity-50">
                        <span className="text-4xl mb-4">{searchQuery ? '🔍' : '📝'}</span>
                        <p>{searchQuery ? '검색 결과가 없습니다.' : '떠오르는 영감을 기록해보세요!'}</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                        <AnimatePresence>
                            {(filteredMemos || []).sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0)).map(memo => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={memo.id}
                                    onClick={() => handleOpen(memo)}
                                    className={cn(
                                        "break-inside-avoid mb-4 p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 relative group flex flex-col gap-3 border border-black/5 overflow-hidden",
                                        memo.color
                                    )}
                                >
                                    {memo.isFavorite && (
                                        <div className="absolute top-3 right-3 text-yellow-500">
                                            <Star className="w-4 h-4 fill-current" />
                                        </div>
                                    )}

                                    {memo.title && (
                                        <div className="font-bold text-lg border-b border-black/5 pb-2">
                                            {memo.title}
                                        </div>
                                    )}

                                    <div className="text-sm whitespace-pre-wrap leading-relaxed opacity-90 min-h-[60px] line-clamp-4">
                                        {truncateContent(memo.content)}
                                    </div>

                                    {(memo.connectedProjectId || memo.connectedGoalId) && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {memo.connectedProjectId && (
                                                <div className="flex items-center gap-1 text-[10px] font-bold bg-black/5 px-2 py-1 rounded-md">
                                                    <Briefcase className="w-3 h-3" /> {projects.find(p => p.id === memo.connectedProjectId)?.title || '연결됨'}
                                                </div>
                                            )}
                                            {memo.connectedGoalId && (
                                                <div className="flex items-center gap-1 text-[10px] font-bold bg-black/5 px-2 py-1 rounded-md">
                                                    <Target className="w-3 h-3" /> {goals.find(g => g.id === memo.connectedGoalId)?.title || '연결됨'}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-auto flex flex-col gap-2 pt-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-wrap gap-1">
                                                {memo.tags?.map(tag => (
                                                    <span key={tag} className="text-[10px] px-2 py-0.5 bg-black/10 rounded-full font-bold">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="text-[10px] opacity-60 font-mono">
                                                {safeFormat(memo.createdAt, 'yy.MM.dd')}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteMemo(memo.id); }}
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity p-1 rounded-full hover:bg-black/10"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal={false}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <DialogTitle className="text-xl font-bold">
                            {editingMemo ? '메모 수정' : '새 메모'}
                        </DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 hover:text-yellow-500", isFavorite && "text-yellow-500")}
                            onClick={() => setIsFavorite(!isFavorite)}
                        >
                            <Star className={cn("w-5 h-5", isFavorite && "fill-current")} />
                        </Button>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <Input
                            className="bg-muted border-transparent text-lg font-bold placeholder:text-muted-foreground/50 focus-visible:ring-primary/20"
                            placeholder="제목 (선택)"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />

                        <div className="flex items-center justify-between border-b pb-2 mb-2">
                            <Tabs value={editMode} onValueChange={(v) => setEditMode(v as any)} className="w-auto">
                                <TabsList className="bg-muted/50 h-8 p-1">
                                    <TabsTrigger value="edit" className="text-xs gap-1.5 h-6">
                                        <Edit3 className="w-3.5 h-3.5" /> 편집
                                    </TabsTrigger>
                                    <TabsTrigger value="preview" className="text-xs gap-1.5 h-6">
                                        <Eye className="w-3.5 h-3.5" /> 미리보기
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {editMode === 'edit' ? (
                            <textarea
                                className="w-full h-48 bg-muted border-transparent rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none custom-scrollbar font-mono"
                                placeholder="내용을 입력하세요... (Markdown 지원)"
                                value={content}
                                onChange={e => setContent(e.target.value)}
                            />
                        ) : (
                            <div className="w-full h-48 bg-muted/30 border rounded-xl p-4 text-sm overflow-y-auto prose prose-sm dark:prose-invert">
                                {content ? (
                                    <div className="whitespace-pre-wrap">{content}</div>
                                ) : (
                                    <span className="text-muted-foreground italic">내용이 없습니다.</span>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-muted-foreground font-bold uppercase">연관 프로젝트</Label>
                                <Select value={connectedProjectId || "none"} onValueChange={(value) => setConnectedProjectId(value === "none" ? undefined : value)}>
                                    <SelectTrigger className="h-9 bg-muted/50 border-transparent text-xs">
                                        <SelectValue placeholder="프로젝트 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">없음</SelectItem>
                                        {projects.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-muted-foreground font-bold uppercase">하위 목표</Label>
                                <Select value={connectedGoalId || "none"} onValueChange={(value) => setConnectedGoalId(value === "none" ? undefined : value)}>
                                    <SelectTrigger className="h-9 bg-muted/50 border-transparent text-xs">
                                        <SelectValue placeholder="목표 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">없음</SelectItem>
                                        {goals.map(g => (
                                            <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="flex flex-wrap gap-1">
                                    {tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-bold">
                                            #{tag}
                                            <button
                                                onClick={() => setTags(tags.filter(t => t !== tag))}
                                                className="hover:bg-primary/20 rounded-full p-0.5"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <Input
                                    className="bg-muted border-transparent text-sm"
                                    placeholder="태그 입력 (Enter로 추가)"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                                                setTags([...tags, tagInput.trim()]);
                                                setTagInput('');
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                                title="이미지 첨부"
                            >
                                <ImageIcon className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Attachments Preview */}
                        {attachments.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto py-2">
                                {attachments.map((src, idx) => (
                                    <div key={idx} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border">
                                        <img src={src} alt="attachment" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeAttachment(idx)}
                                            className="absolute top-0 right-0 bg-black/50 text-white p-0.5 hover:bg-red-500 rounded-bl"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            {COLORS.map(color => (
                                <button
                                    key={color.name}
                                    onClick={() => setSelectedColor(color)}
                                    className={cn(
                                        "w-8 h-8 rounded-full border-2 transition-all",
                                        color.value,
                                        selectedColor.name === color.name ? "border-white scale-110 shadow-md ring-2 ring-primary/20" : "border-transparent opacity-80 hover:opacity-100"
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="flex justify-between sm:justify-between w-full">
                        {editingMemo ? (
                            <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={handleDelete}>
                                <Trash2 className="w-4 h-4 mr-2" /> 삭제
                            </Button>
                        ) : <div></div>}
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>취소</Button>
                            <Button onClick={handleSave}>저장</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

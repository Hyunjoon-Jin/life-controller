'use client';

import { useState, useRef } from 'react';
import { useData } from '@/context/DataProvider';
import { Memo } from '@/types';
import { generateId, cn, safeFormat } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, X, Trash2, Image as ImageIcon, Tag, Paperclip, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const COLORS = [
    { name: 'yellow', value: 'bg-yellow-200 text-yellow-900 border-yellow-300' },
    { name: 'blue', value: 'bg-blue-200 text-blue-900 border-blue-300' },
    { name: 'pink', value: 'bg-pink-200 text-pink-900 border-pink-300' },
    { name: 'green', value: 'bg-green-200 text-green-900 border-green-300' },
    { name: 'purple', value: 'bg-purple-200 text-purple-900 border-purple-300' },
];

export function IdeaBoard() {
    const { memos, addMemo, updateMemo, deleteMemo } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMemo, setEditingMemo] = useState<Memo | null>(null);

    // Form States
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [attachments, setAttachments] = useState<string[]>([]);
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOpen = (memo?: Memo) => {
        if (memo) {
            setEditingMemo(memo);
            setTitle(memo.title || '');
            setContent(memo.content);
            setTags(memo.tags || []);
            setTagInput('');
            setAttachments(memo.attachments || []);
            setSelectedColor(COLORS.find(c => c.value.includes(memo.color.split(' ')[0])) || COLORS[0]);
        } else {
            setEditingMemo(null);
            setTitle('');
            setContent('');
            setTags([]);
            setTagInput('');
            setAttachments([]);
            setSelectedColor(COLORS[0]);
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
                color: selectedColor.value
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
            <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold">아이디어 보드</h2>
                </div>
                <Button onClick={() => handleOpen()} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    새 메모
                </Button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                {memos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground opacity-50">
                        <span className="text-4xl mb-4">📝</span>
                        <p>떠오르는 영감을 기록해보세요!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {memos.map(memo => (
                            <div
                                key={memo.id}
                                onClick={() => handleOpen(memo)}
                                className={cn(
                                    "aspect-square p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1 relative group flex flex-col gap-2 border border-transparent/10",
                                    memo.color
                                )}
                            >
                                {memo.title && (
                                    <div className="font-bold text-lg truncate border-b border-black/10 pb-1 mb-1">
                                        {memo.title}
                                    </div>
                                )}
                                <div className={cn(
                                    "text-sm whitespace-pre-wrap overflow-hidden leading-relaxed opacity-90",
                                    memo.title ? "line-clamp-4" : "line-clamp-[8]"
                                )}>
                                    {memo.content}
                                </div>

                                <div className="mt-auto flex flex-col gap-1">
                                    {memo.attachments && memo.attachments.length > 0 && (
                                        <div className="flex items-center gap-1 text-xs opacity-70">
                                            <Paperclip className="w-3 h-3" /> {memo.attachments.length}개의 첨부파일
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-1">
                                        {memo.tags?.map(tag => (
                                            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-black/5 rounded-full font-medium">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="text-[10px] opacity-60 text-right mt-1">
                                        {safeFormat(memo.createdAt, 'yy.MM.dd')}
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteMemo(memo.id); }}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity p-1 rounded-full hover:bg-black/10"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground">
                    <DialogHeader>
                        <DialogTitle>{editingMemo ? '메모 수정' : '새 메모'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <Input
                            className="bg-muted border-transparent text-lg font-bold placeholder:text-muted-foreground/50 focus-visible:ring-primary/20"
                            placeholder="제목 (선택)"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />

                        <textarea
                            className="w-full h-40 bg-muted border-transparent rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none custom-scrollbar"
                            placeholder="내용을 입력하세요..."
                            value={content}
                            onChange={e => setContent(e.target.value)}
                        />

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

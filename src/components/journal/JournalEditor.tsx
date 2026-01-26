'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Only if we want a title, but plan said Date + Content
import { Label } from '@/components/ui/label';
import { Smile, Image as ImageIcon, Save, X } from 'lucide-react';
import { useData } from '@/context/DataProvider';
import { generateId } from '@/lib/utils';
import { JournalEntry } from '@/types';

const MOODS = ['😊', '😐', '😔', '😡', '😴', '🤩', '🤔', '🤒'];

export function JournalEditor({ onClose, journal }: { onClose: () => void; journal?: JournalEntry }) {
    const { addJournal, updateJournal } = useData();
    const [content, setContent] = useState(journal?.content || '');
    const [mood, setMood] = useState(journal?.mood || '😊');
    const [images, setImages] = useState<string[]>(journal?.images || []);
    const [tags, setTags] = useState<string[]>(journal?.tags || []);
    const [tagInput, setTagInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 500 * 1024) {
            alert("이미지 크기가 너무 큽니다. 500KB 이하의 이미지를 사용해주세요.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                setImages([...images, reader.result]);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!content.trim()) return;
        setIsSubmitting(true);

        if (journal) {
            // Update mode
            const updatedEntry: JournalEntry = {
                ...journal,
                content,
                mood,
                images,
                tags,
                updatedAt: new Date()
            };
            updateJournal(updatedEntry);
        } else {
            // Create mode
            const newEntry: JournalEntry = {
                id: generateId(),
                date: new Date(),
                content,
                mood,
                images,
                tags,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            addJournal(newEntry);
        }

        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>오늘 하루는 어땠나요?</Label>
                <div className="flex gap-2 mb-2 p-2 bg-muted/20 rounded-lg overflow-x-auto">
                    {MOODS.map(m => (
                        <button
                            key={m}
                            onClick={() => setMood(m)}
                            className={`text-2xl hover:scale-110 transition-transform p-1 rounded ${mood === m ? 'bg-background shadow-sm ring-1 ring-primary' : ''}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
                <textarea
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    placeholder="생각을 기록해보세요..."
                    value={content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                    autoFocus
                />
            </div>

            <div className="space-y-2">
                <Label>태그</Label>
                <div className="flex flex-wrap gap-1 mb-2">
                    {tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-bold">
                            #{tag}
                            <button
                                onClick={() => setTags(tags.filter(t => t !== tag))}
                                className="hover:bg-black/10 rounded-full p-0.5"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
                <Input
                    placeholder="태그 입력 (Enter로 추가)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                                setTags([...tags, tagInput.trim()]);
                                setTagInput('');
                            }
                        }
                    }}
                    className="text-sm"
                />
            </div>

            <div className="space-y-2">
                <Label className="flex items-center gap-2 cursor-pointer w-fit text-muted-foreground hover:text-foreground transition-colors">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-xs">이미지 첨부</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </Label>

                {images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto py-2">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative group flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border">
                                <img src={img} alt="attachment" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => handleRemoveImage(idx)}
                                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={onClose}>취소</Button>
                <Button onClick={handleSave} disabled={!content.trim() || isSubmitting}>
                    <Save className="w-4 h-4 mr-2" />
                    저장
                </Button>
            </div>
        </div>
    );
}

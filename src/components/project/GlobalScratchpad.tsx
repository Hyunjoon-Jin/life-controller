"use client"

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote, X, RefreshCw, Paperclip, FileText, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataProvider';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';

interface GlobalScratchpadProps {
    triggerVisible?: boolean;
}

interface MemoAttachment {
    id: string;
    name: string;
    url: string;
    size: number;
    uploadedAt: string;
}

const STORAGE_KEY = 'memo_attachments';
const BUCKET_NAME = 'memo-pdfs';

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function GlobalScratchpad({ triggerVisible = true }: GlobalScratchpadProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { globalMemo: note, setGlobalMemo: setNote } = useData();
    const [isMinimized, setIsMinimized] = useState(false);
    const [attachments, setAttachments] = useState<MemoAttachment[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load attachments from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setAttachments(JSON.parse(saved));
        } catch {}
    }, []);

    const persistAttachments = (atts: MemoAttachment[]) => {
        setAttachments(atts);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(atts));
        } catch {}
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.code === 'KeyQ') {
                setIsOpen(prev => !prev);
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast.error('PDF 파일만 첨부할 수 있습니다.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('파일 크기는 10MB 이하여야 합니다.');
            return;
        }

        setIsUploading(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('로그인이 필요합니다.');
                return;
            }

            const timestamp = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const path = `${user.id}/${timestamp}_${safeName}`;

            let { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(path, file);

            // 버킷이 없으면 생성 후 재시도
            if (uploadError) {
                if (uploadError.message?.toLowerCase().includes('bucket')) {
                    await supabase.storage.createBucket(BUCKET_NAME, { public: true });
                    const retry = await supabase.storage.from(BUCKET_NAME).upload(path, file);
                    uploadError = retry.error;
                }
                if (uploadError) throw uploadError;
            }

            const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

            const attachment: MemoAttachment = {
                id: String(timestamp),
                name: file.name,
                url: urlData.publicUrl,
                size: file.size,
                uploadedAt: new Date().toISOString(),
            };

            persistAttachments([...attachments, attachment]);
            toast.success(`"${file.name}" 첨부 완료`);
        } catch (err) {
            console.error('PDF upload error:', err);
            toast.error('PDF 업로드에 실패했습니다.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemoveAttachment = async (attachment: MemoAttachment) => {
        persistAttachments(attachments.filter(a => a.id !== attachment.id));
        try {
            const supabase = createClient();
            const url = new URL(attachment.url);
            const afterBucket = url.pathname.split(`/${BUCKET_NAME}/`)[1];
            if (afterBucket) {
                await supabase.storage.from(BUCKET_NAME).remove([decodeURIComponent(afterBucket)]);
            }
        } catch {}
    };

    if (!isOpen) {
        if (!triggerVisible) return null;
        return (
            <Button
                variant="outline"
                size="icon"
                className="fixed bottom-6 right-6 md:bottom-28 md:right-8 h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg z-50 bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-500"
                onClick={() => setIsOpen(true)}
                title="글로벌 메모장"
            >
                <StickyNote className="w-6 h-6" />
            </Button>
        );
    }

    if (isMinimized) {
        return (
            <div className="fixed bottom-6 right-6 md:bottom-28 md:right-8 z-50 flex items-center gap-2 bg-card border border-yellow-400/50 rounded-full p-1 pl-3 shadow-lg animate-in fade-in slide-in-from-bottom-2">
                <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 cursor-pointer" onClick={() => setIsMinimized(false)}>메모장</span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-yellow-400/20 text-yellow-600 dark:text-yellow-400"
                    onClick={() => setIsMinimized(false)}
                >
                    <StickyNote className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500"
                    onClick={() => setIsOpen(false)}
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 md:bottom-28 md:right-8 w-80 bg-card border-2 border-yellow-400 rounded-xl shadow-2xl z-50 flex flex-col animate-in fade-in slide-in-from-bottom-4 zoom-in-95 max-h-[500px]">
            {/* 숨겨진 파일 입력 */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-yellow-400/30 bg-yellow-400/10 rounded-t-xl handle cursor-move flex-shrink-0">
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-bold">
                    <StickyNote className="w-4 h-4" />
                    <span className="text-sm">Quick Memo</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-400/20"
                        onClick={() => fileInputRef.current?.click()}
                        title="PDF 첨부"
                        disabled={isUploading}
                    >
                        {isUploading
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Paperclip className="w-3 h-3" />
                        }
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-400/20"
                        onClick={() => setNote('')}
                        title="지우기"
                    >
                        <RefreshCw className="w-3 h-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-400/20"
                        onClick={() => setIsMinimized(true)}
                    >
                        <span className="mb-2">_</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-400/20 hover:text-red-500"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Textarea */}
            <div className="flex-1 p-0 min-h-0">
                <Textarea
                    className="w-full h-48 resize-none border-0 focus-visible:ring-0 bg-transparent p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground"
                    placeholder="여기에 빠른 메모를 남기세요..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    autoFocus
                />
            </div>

            {/* 첨부 파일 목록 */}
            {attachments.length > 0 && (
                <div className="px-3 pb-1 flex-shrink-0 max-h-28 overflow-y-auto border-t border-yellow-400/20">
                    <p className="text-[10px] text-yellow-600 dark:text-yellow-400/60 font-bold uppercase tracking-wider pt-2 pb-1">
                        첨부 파일 ({attachments.length})
                    </p>
                    <div className="space-y-1">
                        {attachments.map((att) => (
                            <div key={att.id} className="flex items-center gap-2 group">
                                <FileText className="w-3 h-3 text-red-500 flex-shrink-0" />
                                <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-foreground/80 hover:text-primary truncate flex-1 min-w-0"
                                    title={att.name}
                                >
                                    {att.name}
                                </a>
                                <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                    {formatFileSize(att.size)}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 flex-shrink-0"
                                    onClick={() => handleRemoveAttachment(att)}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="p-2 text-[10px] text-yellow-600 dark:text-yellow-400/50 text-right bg-yellow-400/5 rounded-b-xl flex-shrink-0 flex items-center justify-between">
                <span className="text-muted-foreground/50">
                    {attachments.length > 0 && `PDF ${attachments.length}개`}
                </span>
                <span>Autosaved</span>
            </div>
        </div>
    );
}

'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { useData } from '@/context/DataProvider';
import { Memo } from '@/types';
import { generateId, cn, safeFormat } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
    Plus, X, Trash2, Image as ImageIcon, Paperclip, Sparkles, Star, Target, Briefcase,
    Eye, Edit3, Search, FileText, Loader2, LayoutGrid, List, LayoutDashboard,
    ChevronLeft, ChevronRight, Copy, ListTodo,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

// ─── Constants ────────────────────────────────────────────────────────────────

const BUCKET_NAME = 'memo-pdfs';

const COLORS = [
    { name: 'yellow', glass: 'bg-yellow-500/10 border-yellow-500/20', accent: 'bg-yellow-500', dot: 'bg-yellow-400' },
    { name: 'blue',   glass: 'bg-blue-500/10 border-blue-500/20',     accent: 'bg-blue-500',   dot: 'bg-blue-400' },
    { name: 'pink',   glass: 'bg-pink-500/10 border-pink-500/20',     accent: 'bg-pink-500',   dot: 'bg-pink-400' },
    { name: 'green',  glass: 'bg-green-500/10 border-green-500/20',   accent: 'bg-green-500',  dot: 'bg-green-400' },
    { name: 'purple', glass: 'bg-purple-500/10 border-purple-500/20', accent: 'bg-purple-500', dot: 'bg-purple-400' },
    { name: 'orange', glass: 'bg-orange-500/10 border-orange-500/20', accent: 'bg-orange-500', dot: 'bg-orange-400' },
    { name: 'red',    glass: 'bg-red-500/10 border-red-500/20',       accent: 'bg-red-500',    dot: 'bg-red-400' },
    { name: 'teal',   glass: 'bg-teal-500/10 border-teal-500/20',     accent: 'bg-teal-500',   dot: 'bg-teal-400' },
    { name: 'indigo', glass: 'bg-indigo-500/10 border-indigo-500/20', accent: 'bg-indigo-500', dot: 'bg-indigo-400' },
    { name: 'gray',   glass: 'bg-white/5 border-white/10',            accent: 'bg-slate-500',  dot: 'bg-slate-400' },
] as const;

const STATUSES = [
    { value: 'idea',        label: '아이디어', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
    { value: 'reviewing',   label: '검토중',   color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { value: 'in-progress', label: '실행중',   color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { value: 'done',        label: '완료',     color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { value: 'on-hold',     label: '보류',     color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
] as const;

const TEMPLATES = [
    { name: '빈 메모',      icon: '📝', title: '',          content: '' },
    { name: '브레인스토밍', icon: '🧠', title: '브레인스토밍', content: '## 문제\n\n## 아이디어\n- \n\n## 액션 아이템\n- [ ] ' },
    { name: 'PRD',          icon: '📋', title: 'PRD',        content: '## 목적\n\n## 기능 요구사항\n- \n\n## 비기능 요구사항\n- ' },
    { name: '코드 스니펫',  icon: '💻', title: '',           content: '```\n\n```' },
    { name: '독서 메모',    icon: '📚', title: '독서 메모',  content: '## 핵심 인사이트\n\n## 인용구\n> \n\n## 적용 방법\n' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Backward-compat: converts old 'bg-yellow-200 text-...' format → color name */
function normalizeColor(raw: string): string {
    if (!raw) return 'gray';
    if (!raw.includes('bg-')) return raw; // already a name
    for (const c of COLORS) {
        if (c.name === 'gray') continue;
        if (raw.includes(`${c.name}-`)) return c.name;
    }
    return 'gray';
}

function getColorConfig(raw: string) {
    const name = normalizeColor(raw);
    return COLORS.find(c => c.name === name) ?? COLORS[COLORS.length - 1];
}

function getStatusConfig(value: string) {
    return STATUSES.find(s => s.value === value) ?? STATUSES[0];
}

function stripMarkdown(text: string): string {
    return text
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/^[-*>] /gm, '')
        .replace(/\n{2,}/g, '\n')
        .trim();
}

function getPdfFileName(url: string): string {
    try {
        const decoded = decodeURIComponent(url.split('/').pop() || url);
        return decoded.replace(/^\d+_/, '');
    } catch {
        return url.split('/').pop() || 'file.pdf';
    }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CtxMenuItem({
    icon: Icon, label, danger, onClick,
}: {
    icon: React.ElementType; label: string; danger?: boolean; onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex items-center gap-2 w-full px-3 py-2 text-xs font-bold rounded-lg transition-colors text-left',
                danger ? 'text-rose-400 hover:bg-rose-500/10' : 'text-foreground/70 hover:bg-white/5 hover:text-foreground',
            )}
        >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            {label}
        </button>
    );
}

interface MemoCardProps {
    memo: Memo;
    variant: 'grid' | 'kanban';
    cardSize?: 'sm' | 'md' | 'lg';
    projects: { id: string; title: string }[];
    goals: { id: string; title: string }[];
    onOpen: (memo: Memo) => void;
    onDelete: (id: string) => void;
    onToggleFavorite: (memo: Memo) => void;
    onStatusChange?: (memo: Memo, status: string) => void;
    onContextMenu: (e: React.MouseEvent, memo: Memo) => void;
}

function MemoCard({
    memo, variant, cardSize = 'md', projects, goals,
    onOpen, onDelete, onToggleFavorite, onStatusChange, onContextMenu,
}: MemoCardProps) {
    const color = getColorConfig(memo.color);
    const statusCfg = memo.status ? getStatusConfig(memo.status) : null;
    const preview = stripMarkdown(memo.content);
    const connectedProject = projects.find(p => p.id === memo.connectedProjectId);
    const connectedGoal = goals.find(g => g.id === memo.connectedGoalId);
    const statusIndex = STATUSES.findIndex(s => s.value === (memo.status || 'idea'));

    const paddingCls = cardSize === 'sm' ? 'p-3' : cardSize === 'lg' ? 'p-6' : 'p-4';
    const titleCls = cardSize === 'sm' ? 'text-xs' : cardSize === 'lg' ? 'text-base' : 'text-sm';
    const previewLines = cardSize === 'sm' ? 'line-clamp-2' : cardSize === 'lg' ? 'line-clamp-6' : 'line-clamp-4';
    const previewSize = cardSize === 'sm' ? 'text-[10px]' : 'text-xs';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => onOpen(memo)}
            onContextMenu={e => onContextMenu(e, memo)}
            className={cn(
                'relative group flex flex-col gap-2 rounded-2xl border backdrop-blur-sm cursor-pointer',
                'transition-all hover:-translate-y-0.5 hover:shadow-lg overflow-hidden',
                paddingCls,
                color.glass,
            )}
        >
            {/* 상단 컬러 바 */}
            <div className={cn('absolute top-0 left-0 right-0 h-0.5 opacity-60', color.accent)} />

            {/* 즐겨찾기 */}
            {memo.isFavorite && (
                <Star className="absolute top-2.5 right-2.5 w-3 h-3 text-yellow-400 fill-current" />
            )}

            {/* 상태 배지 (idea 제외) */}
            {memo.status && memo.status !== 'idea' && statusCfg && (
                <span className={cn('self-start text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest', statusCfg.color)}>
                    {statusCfg.label}
                </span>
            )}

            {/* 제목 */}
            {memo.title && (
                <div className={cn('font-black text-foreground leading-tight', titleCls)}>{memo.title}</div>
            )}

            {/* 내용 미리보기 */}
            {preview && (
                <div className={cn('text-foreground/60 leading-relaxed', previewSize, previewLines)}>{preview}</div>
            )}

            {/* 이미지 썸네일 */}
            {memo.attachments?.some(a => !a.startsWith('pdf::')) && (
                <div className="flex gap-1.5 flex-wrap">
                    {memo.attachments.filter(a => !a.startsWith('pdf::')).slice(0, 3).map((src, i) => (
                        <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                            <Image src={src} alt="attachment" fill className="object-cover" unoptimized />
                        </div>
                    ))}
                </div>
            )}

            {/* PDF 표시 */}
            {memo.attachments?.some(a => a.startsWith('pdf::')) && (
                <div className="flex items-center gap-1 text-[9px] text-foreground/40 font-bold">
                    <FileText className="w-3 h-3" />
                    {memo.attachments.filter(a => a.startsWith('pdf::')).length}개 PDF
                </div>
            )}

            {/* 연결 배지 */}
            {(connectedProject || connectedGoal) && (
                <div className="flex flex-wrap gap-1">
                    {connectedProject && (
                        <span className="flex items-center gap-1 text-[9px] font-bold bg-white/5 px-1.5 py-0.5 rounded-md text-foreground/50">
                            <Briefcase className="w-2.5 h-2.5" />{connectedProject.title}
                        </span>
                    )}
                    {connectedGoal && (
                        <span className="flex items-center gap-1 text-[9px] font-bold bg-white/5 px-1.5 py-0.5 rounded-md text-foreground/50">
                            <Target className="w-2.5 h-2.5" />{connectedGoal.title}
                        </span>
                    )}
                </div>
            )}

            {/* 태그 + 날짜 */}
            <div className="flex items-end justify-between gap-2 mt-auto pt-1">
                <div className="flex flex-wrap gap-1">
                    {memo.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-full font-bold text-foreground/50">
                            #{tag}
                        </span>
                    ))}
                </div>
                <span className="text-[9px] text-foreground/30 font-mono flex-shrink-0">
                    {safeFormat(memo.createdAt, 'yy.MM.dd')}
                </span>
            </div>

            {/* hover 액션 버튼 */}
            <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                <button
                    onClick={e => { e.stopPropagation(); onToggleFavorite(memo); }}
                    className={cn(
                        'w-6 h-6 rounded-lg flex items-center justify-center transition-colors bg-black/20',
                        memo.isFavorite ? 'text-yellow-400' : 'text-foreground/30 hover:text-yellow-400',
                    )}
                >
                    <Star className={cn('w-3 h-3', memo.isFavorite && 'fill-current')} />
                </button>
                <button
                    onClick={e => { e.stopPropagation(); onDelete(memo.id); }}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-foreground/30 hover:text-rose-400 transition-colors bg-black/20"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>

            {/* 칸반 전용: 상태 이동 버튼 */}
            {variant === 'kanban' && onStatusChange && (
                <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            if (statusIndex > 0) onStatusChange(memo, STATUSES[statusIndex - 1].value);
                        }}
                        disabled={statusIndex <= 0}
                        className="flex-1 h-5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                        <ChevronLeft className="w-3 h-3 text-foreground/50" />
                    </button>
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            if (statusIndex < STATUSES.length - 1) onStatusChange(memo, STATUSES[statusIndex + 1].value);
                        }}
                        disabled={statusIndex >= STATUSES.length - 1}
                        className="flex-1 h-5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                        <ChevronRight className="w-3 h-3 text-foreground/50" />
                    </button>
                </div>
            )}
        </motion.div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function IdeaBoard() {
    const { memos, addMemo, updateMemo, deleteMemo, projects, goals, addTask } = useData();

    // View
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
    const [cardSize, setCardSize] = useState<'sm' | 'md' | 'lg'>('md');

    // Filter
    const [searchQuery, setSearchQuery] = useState('');
    const [filterColor, setFilterColor] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    const [filterTag, setFilterTag] = useState<string | null>(null);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'favorites'>('newest');

    // Quick create
    const [quickText, setQuickText] = useState('');

    // Context menu
    const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; memo: Memo } | null>(null);

    // Dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
    const [editMode, setEditMode] = useState<'edit' | 'preview'>('edit');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [attachments, setAttachments] = useState<string[]>([]);
    const [selectedColor, setSelectedColor] = useState<typeof COLORS[number]>(COLORS[0]);
    const [connectedProjectId, setConnectedProjectId] = useState<string | undefined>(undefined);
    const [connectedGoalId, setConnectedGoalId] = useState<string | undefined>(undefined);
    const [isFavorite, setIsFavorite] = useState(false);
    const [memoStatus, setMemoStatus] = useState<string>('idea');
    const [isDragging, setIsDragging] = useState(false);

    // Upload
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // ─── Derived state ─────────────────────────────────────────────────────────

    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        memos.forEach(m => m.tags?.forEach(t => tagSet.add(t)));
        return Array.from(tagSet);
    }, [memos]);

    const filteredMemos = useMemo(() => {
        let result = [...memos];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(m =>
                m.title?.toLowerCase().includes(q) ||
                m.content.toLowerCase().includes(q) ||
                m.tags?.some(t => t.toLowerCase().includes(q)) ||
                projects.find(p => p.id === m.connectedProjectId)?.title.toLowerCase().includes(q) ||
                goals.find(g => g.id === m.connectedGoalId)?.title.toLowerCase().includes(q),
            );
        }
        if (filterColor) result = result.filter(m => normalizeColor(m.color) === filterColor);
        if (filterStatus) result = result.filter(m => (m.status || 'idea') === filterStatus);
        if (filterTag) result = result.filter(m => m.tags?.includes(filterTag));
        if (showFavoritesOnly) result = result.filter(m => m.isFavorite);
        result.sort((a, b) => {
            if (sortBy === 'favorites') return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
            if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        return result;
    }, [memos, searchQuery, filterColor, filterStatus, filterTag, showFavoritesOnly, sortBy, projects, goals]);

    const memosByStatus = useMemo(() => {
        const grouped: Record<string, Memo[]> = {};
        STATUSES.forEach(s => { grouped[s.value] = []; });
        filteredMemos.forEach(m => {
            const s = m.status || 'idea';
            if (grouped[s]) grouped[s].push(m);
        });
        return grouped;
    }, [filteredMemos]);

    const hasActiveFilters = !!(filterColor || filterStatus || filterTag || showFavoritesOnly);

    // ─── Keyboard shortcuts ────────────────────────────────────────────────────

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const tag = (document.activeElement as HTMLElement)?.tagName;
            const inInput = tag === 'INPUT' || tag === 'TEXTAREA';
            if (inInput || isDialogOpen) return;
            if (e.key === 'n' || e.key === 'N') { e.preventDefault(); handleOpen(); }
            if (e.key === '/') { e.preventDefault(); searchRef.current?.focus(); }
            if (e.key === 'Escape') setCtxMenu(null);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isDialogOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleOpen = (memo?: Memo, defaultStatus?: string) => {
        setEditMode('edit');
        if (memo) {
            setEditingMemo(memo);
            setTitle(memo.title || '');
            setContent(memo.content);
            setTags(memo.tags || []);
            setTagInput('');
            setAttachments(memo.attachments || []);
            setSelectedColor(COLORS.find(c => c.name === normalizeColor(memo.color)) ?? COLORS[0]);
            setConnectedProjectId(memo.connectedProjectId);
            setConnectedGoalId(memo.connectedGoalId);
            setIsFavorite(memo.isFavorite || false);
            setMemoStatus(memo.status || 'idea');
        } else {
            setEditingMemo(null);
            setTitle(''); setContent(''); setTags([]); setTagInput(''); setAttachments([]);
            setSelectedColor(COLORS[0]); setConnectedProjectId(undefined); setConnectedGoalId(undefined);
            setIsFavorite(false); setMemoStatus(defaultStatus || 'idea');
        }
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!content.trim() && !title.trim()) return;
        const memoData = {
            title, content, tags, attachments,
            color: selectedColor.name,
            connectedProjectId, connectedGoalId,
            isFavorite,
            status: memoStatus as Memo['status'],
        };
        if (editingMemo) {
            updateMemo({ ...editingMemo, ...memoData });
        } else {
            addMemo({ id: generateId(), ...memoData, createdAt: new Date() });
        }
        setIsDialogOpen(false);
    };

    const handleDelete = () => {
        if (editingMemo) { deleteMemo(editingMemo.id); setIsDialogOpen(false); }
    };

    const handleQuickCreate = () => {
        if (!quickText.trim()) return;
        addMemo({
            id: generateId(), title: '', content: quickText,
            color: COLORS[0].name, tags: [], attachments: [],
            createdAt: new Date(), status: 'idea', isFavorite: false,
        });
        setQuickText('');
        toast.success('메모가 저장되었습니다!');
    };

    const handleToggleFavorite = (memo: Memo) => updateMemo({ ...memo, isFavorite: !memo.isFavorite });

    const handleStatusChange = (memo: Memo, status: string) =>
        updateMemo({ ...memo, status: status as Memo['status'] });

    const handleConvertToTask = (memo: Memo) => {
        const taskTitle = memo.title || stripMarkdown(memo.content).split('\n')[0].slice(0, 50) || '새 태스크';
        addTask({
            id: generateId(), title: taskTitle, completed: false, priority: 'medium',
            remarks: memo.content, tags: memo.tags || [],
            projectId: memo.connectedProjectId, connectedGoalId: memo.connectedGoalId,
        });
        toast.success('태스크로 변환되었습니다!');
        setCtxMenu(null);
        if (isDialogOpen) setIsDialogOpen(false);
    };

    const handleContextMenu = (e: React.MouseEvent, memo: Memo) => {
        e.preventDefault();
        setCtxMenu({ x: e.clientX, y: e.clientY, memo });
    };

    const applyTemplate = (tpl: typeof TEMPLATES[number]) => {
        setTitle(tpl.title);
        setContent(tpl.content);
    };

    const clearAllFilters = () => {
        setFilterColor(null); setFilterStatus(null); setFilterTag(null);
        setShowFavoritesOnly(false); setSearchQuery('');
    };

    // ─── Upload handlers ──────────────────────────────────────────────────────

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') setAttachments(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
    };

    const uploadPdfFile = async (file: File) => {
        if (file.type !== 'application/pdf') { toast.error('PDF 파일만 첨부할 수 있습니다.'); return; }
        if (file.size > 10 * 1024 * 1024) { toast.error('파일 크기는 10MB 이하여야 합니다.'); return; }
        setIsUploading(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { toast.error('로그인이 필요합니다.'); return; }
            const timestamp = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const path = `${user.id}/${timestamp}_${safeName}`;
            let { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(path, file);
            if (uploadError) {
                if (uploadError.message?.toLowerCase().includes('bucket')) {
                    await supabase.storage.createBucket(BUCKET_NAME, { public: true });
                    const retry = await supabase.storage.from(BUCKET_NAME).upload(path, file);
                    uploadError = retry.error;
                }
                if (uploadError) throw uploadError;
            }
            const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
            setAttachments(prev => [...prev, `pdf::${urlData.publicUrl}`]);
            toast.success(`"${file.name}" 첨부 완료`);
        } catch (err) {
            console.error('PDF upload error:', err);
            toast.error('PDF 업로드에 실패했습니다.');
        } finally {
            setIsUploading(false);
            if (pdfInputRef.current) pdfInputRef.current.value = '';
        }
    };

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) await uploadPdfFile(file);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (!file) return;
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') setAttachments(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        } else if (file.type === 'application/pdf') {
            await uploadPdfFile(file);
        }
    };

    const removeAttachment = async (index: number) => {
        const att = attachments[index];
        if (att.startsWith('pdf::')) {
            try {
                const url = att.replace('pdf::', '');
                const supabase = createClient();
                const afterBucket = new URL(url).pathname.split(`/${BUCKET_NAME}/`)[1];
                if (afterBucket) await supabase.storage.from(BUCKET_NAME).remove([decodeURIComponent(afterBucket)]);
            } catch {}
        }
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="h-full flex flex-col bg-card text-card-foreground rounded-3xl border border-transparent shadow-sm overflow-hidden">

            {/* ── 헤더 ── */}
            <div className="p-5 border-b border-border space-y-3 flex-shrink-0">

                {/* 첫째 줄: 타이틀 + 뷰 토글 + 새 메모 */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-black">아이디어 보드</h2>
                        <span className="text-xs text-muted-foreground font-bold">({filteredMemos.length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* 뷰 모드 */}
                        <div className="flex bg-muted/50 rounded-xl p-1 gap-0.5">
                            {([['grid', LayoutGrid], ['list', List], ['kanban', LayoutDashboard]] as const).map(([mode, Icon]) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={cn(
                                        'p-1.5 rounded-lg transition-colors',
                                        viewMode === mode
                                            ? 'bg-background shadow-sm text-foreground'
                                            : 'text-muted-foreground hover:text-foreground',
                                    )}
                                    title={mode}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                </button>
                            ))}
                        </div>
                        {/* 카드 크기 (격자 전용) */}
                        {viewMode === 'grid' && (
                            <div className="flex bg-muted/50 rounded-xl p-1 gap-0.5">
                                {(['sm', 'md', 'lg'] as const).map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setCardSize(size)}
                                        className={cn(
                                            'px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors',
                                            cardSize === size
                                                ? 'bg-background shadow-sm text-foreground'
                                                : 'text-muted-foreground hover:text-foreground',
                                        )}
                                    >
                                        {size === 'sm' ? '소' : size === 'md' ? '중' : '대'}
                                    </button>
                                ))}
                            </div>
                        )}
                        <Button
                            onClick={() => handleOpen()}
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-widest rounded-xl h-8 px-3"
                        >
                            <Plus className="w-3.5 h-3.5 mr-1" strokeWidth={3} /> 새 메모
                        </Button>
                    </div>
                </div>

                {/* 둘째 줄: 필터 바 */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* 검색 */}
                    <div className="relative flex-1 min-w-[140px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                            ref={searchRef}
                            placeholder="검색... (/ 단축키)"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-8 h-8 text-xs bg-muted/50 border-transparent focus-visible:ring-primary/20"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* 색상 필터 닷 */}
                    <div className="flex items-center gap-1">
                        {COLORS.map(c => (
                            <button
                                key={c.name}
                                onClick={() => setFilterColor(filterColor === c.name ? null : c.name)}
                                className={cn(
                                    'w-4 h-4 rounded-full transition-all',
                                    c.dot,
                                    filterColor === c.name
                                        ? 'ring-2 ring-offset-1 ring-foreground/50 scale-125'
                                        : 'opacity-50 hover:opacity-100',
                                )}
                                title={c.name}
                            />
                        ))}
                    </div>

                    {/* 상태 */}
                    <Select value={filterStatus || 'all'} onValueChange={v => setFilterStatus(v === 'all' ? null : v)}>
                        <SelectTrigger className="h-8 text-xs bg-muted/50 border-transparent w-24">
                            <SelectValue placeholder="상태" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">전체 상태</SelectItem>
                            {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    {/* 즐겨찾기 */}
                    <button
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={cn(
                            'h-8 px-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors border flex items-center gap-1',
                            showFavoritesOnly
                                ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
                                : 'bg-muted/50 border-transparent text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <Star className={cn('w-3 h-3', showFavoritesOnly && 'fill-current')} /> 즐겨찾기
                    </button>

                    {/* 정렬 */}
                    <Select value={sortBy} onValueChange={v => setSortBy(v as typeof sortBy)}>
                        <SelectTrigger className="h-8 text-xs bg-muted/50 border-transparent w-24">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">최신순</SelectItem>
                            <SelectItem value="oldest">오래된순</SelectItem>
                            <SelectItem value="favorites">즐겨찾기순</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* 태그 필터 */}
                    {allTags.length > 0 && (
                        <Select value={filterTag || 'all'} onValueChange={v => setFilterTag(v === 'all' ? null : v)}>
                            <SelectTrigger className="h-8 text-xs bg-muted/50 border-transparent w-24">
                                <SelectValue placeholder="태그" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">전체 태그</SelectItem>
                                {allTags.map(t => <SelectItem key={t} value={t}>#{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}

                    {/* 필터 초기화 */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="h-8 px-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors border border-rose-500/20 flex items-center gap-1"
                        >
                            <X className="w-3 h-3" /> 초기화
                        </button>
                    )}
                </div>
            </div>

            {/* ── 본문 ── */}
            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">

                {/* 인라인 퀵 생성 (격자/목록 뷰) */}
                {viewMode !== 'kanban' && (
                    <div className="mb-4 relative">
                        <textarea
                            placeholder="💡 아이디어를 입력하고 Ctrl+Enter로 저장..."
                            className="w-full bg-muted/30 border border-dashed border-border rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/40 transition-all"
                            rows={quickText ? 3 : 2}
                            value={quickText}
                            onChange={e => setQuickText(e.target.value)}
                            onKeyDown={e => {
                                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                    e.preventDefault();
                                    handleQuickCreate();
                                }
                            }}
                        />
                        {quickText && (
                            <Button size="sm" className="absolute bottom-3 right-3 h-7 text-xs rounded-lg" onClick={handleQuickCreate}>
                                저장
                            </Button>
                        )}
                    </div>
                )}

                {/* 빈 상태 */}
                {filteredMemos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                            <span className="text-3xl">{searchQuery || hasActiveFilters ? '🔍' : '💡'}</span>
                        </div>
                        <p className="text-lg font-black text-foreground mb-2">
                            {searchQuery || hasActiveFilters ? '검색 결과가 없습니다' : '아이디어가 아직 없어요'}
                        </p>
                        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                            {searchQuery || hasActiveFilters
                                ? '필터를 변경하거나 초기화해 보세요.'
                                : '위 입력창에 아이디어를 적거나 "새 메모"를 눌러보세요!'}
                        </p>
                    </div>

                ) : viewMode === 'grid' ? (
                    /* ── 격자 뷰 (Masonry) ── */
                    <div className={cn(
                        'gap-4',
                        cardSize === 'sm' ? 'columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5' :
                        cardSize === 'lg' ? 'columns-1 md:columns-2 lg:columns-3' :
                        'columns-1 md:columns-2 lg:columns-3 xl:columns-4',
                    )}>
                        <AnimatePresence>
                            {filteredMemos.map(memo => (
                                <div key={memo.id} className="break-inside-avoid mb-4">
                                    <MemoCard
                                        memo={memo}
                                        variant="grid"
                                        cardSize={cardSize}
                                        projects={projects}
                                        goals={goals}
                                        onOpen={handleOpen}
                                        onDelete={deleteMemo}
                                        onToggleFavorite={handleToggleFavorite}
                                        onContextMenu={handleContextMenu}
                                    />
                                </div>
                            ))}
                        </AnimatePresence>
                    </div>

                ) : viewMode === 'list' ? (
                    /* ── 목록 뷰 ── */
                    <div className="flex flex-col gap-2">
                        <AnimatePresence>
                            {filteredMemos.map(memo => {
                                const color = getColorConfig(memo.color);
                                const statusCfg = memo.status ? getStatusConfig(memo.status) : null;
                                const preview = stripMarkdown(memo.content);
                                return (
                                    <motion.div
                                        key={memo.id}
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        onClick={() => handleOpen(memo)}
                                        onContextMenu={e => handleContextMenu(e, memo)}
                                        className={cn(
                                            'flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors group',
                                            color.glass,
                                        )}
                                    >
                                        <div className={cn('w-1.5 h-10 rounded-full flex-shrink-0', color.accent)} />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-black text-sm text-foreground truncate">
                                                {memo.title || preview.slice(0, 60) || '(내용 없음)'}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate mt-0.5">{preview.slice(0, 80)}</div>
                                        </div>
                                        {statusCfg && memo.status !== 'idea' && (
                                            <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest flex-shrink-0', statusCfg.color)}>
                                                {statusCfg.label}
                                            </span>
                                        )}
                                        {memo.tags?.slice(0, 2).map(tag => (
                                            <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-full font-bold text-foreground/50 hidden sm:block flex-shrink-0">
                                                #{tag}
                                            </span>
                                        ))}
                                        {memo.isFavorite && <Star className="w-3.5 h-3.5 text-yellow-400 fill-current flex-shrink-0" />}
                                        <span className="text-[9px] text-muted-foreground font-mono flex-shrink-0">{safeFormat(memo.createdAt, 'yy.MM.dd')}</span>
                                        <button
                                            onClick={e => { e.stopPropagation(); deleteMemo(memo.id); }}
                                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-400 transition-all flex-shrink-0"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                ) : (
                    /* ── 칸반 뷰 ── */
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {STATUSES.map(st => (
                            <div key={st.value} className="flex-shrink-0 w-72">
                                <div className={cn('text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl mb-3 border flex items-center gap-2', st.color)}>
                                    <span>{st.label}</span>
                                    <span className="opacity-60">({memosByStatus[st.value].length})</span>
                                    <button
                                        onClick={() => handleOpen(undefined, st.value)}
                                        className="ml-auto opacity-60 hover:opacity-100 transition-opacity"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {memosByStatus[st.value].map(memo => (
                                            <MemoCard
                                                key={memo.id}
                                                memo={memo}
                                                variant="kanban"
                                                projects={projects}
                                                goals={goals}
                                                onOpen={handleOpen}
                                                onDelete={deleteMemo}
                                                onToggleFavorite={handleToggleFavorite}
                                                onStatusChange={handleStatusChange}
                                                onContextMenu={handleContextMenu}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── 컨텍스트 메뉴 ── */}
            <AnimatePresence>
                {ctxMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setCtxMenu(null)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{ top: ctxMenu.y, left: ctxMenu.x }}
                            className="fixed z-50 bg-card border border-border rounded-2xl shadow-2xl p-1.5 min-w-[160px]"
                        >
                            <CtxMenuItem
                                icon={Star}
                                label={ctxMenu.memo.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                                onClick={() => { handleToggleFavorite(ctxMenu.memo); setCtxMenu(null); }}
                            />
                            <CtxMenuItem
                                icon={ListTodo}
                                label="태스크로 변환"
                                onClick={() => handleConvertToTask(ctxMenu.memo)}
                            />
                            <CtxMenuItem
                                icon={Copy}
                                label="내용 복사"
                                onClick={() => {
                                    navigator.clipboard.writeText(ctxMenu.memo.content);
                                    toast.success('복사되었습니다');
                                    setCtxMenu(null);
                                }}
                            />
                            <CtxMenuItem
                                icon={Edit3}
                                label="수정"
                                onClick={() => { handleOpen(ctxMenu.memo); setCtxMenu(null); }}
                            />
                            <hr className="my-1 border-border" />
                            <CtxMenuItem
                                icon={Trash2}
                                label="삭제"
                                danger
                                onClick={() => { deleteMemo(ctxMenu.memo.id); setCtxMenu(null); }}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── 메모 다이얼로그 ── */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-2xl bg-card text-foreground p-0 rounded-3xl overflow-hidden border border-border shadow-2xl">
                    {/* 선택 색상 accent 바 */}
                    <div className={cn('absolute top-0 left-0 right-0 h-1 rounded-t-3xl opacity-70', selectedColor.accent)} />

                    <div className="p-6 space-y-4 overflow-y-auto max-h-[90vh] custom-scrollbar">

                        {/* 다이얼로그 헤더: 컬러 피커 + 제목 + 즐겨찾기 + 닫기 */}
                        <div className="flex items-start gap-3">
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {COLORS.map(c => (
                                    <button
                                        key={c.name}
                                        onClick={() => setSelectedColor(c)}
                                        className={cn(
                                            'w-5 h-5 rounded-full transition-all',
                                            c.dot,
                                            selectedColor.name === c.name
                                                ? 'ring-2 ring-offset-1 ring-foreground/50 scale-125'
                                                : 'opacity-60 hover:opacity-100 hover:scale-110',
                                        )}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                            <div className="flex-1 text-lg font-black text-foreground leading-tight">
                                {editingMemo ? '메모 수정' : '새 메모'}
                            </div>
                            <button
                                onClick={() => setIsFavorite(!isFavorite)}
                                className={cn('p-1.5 rounded-lg transition-colors', isFavorite ? 'text-yellow-400' : 'text-muted-foreground hover:text-yellow-400')}
                            >
                                <Star className={cn('w-4 h-4', isFavorite && 'fill-current')} />
                            </button>
                            <button onClick={() => setIsDialogOpen(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* 템플릿 (새 메모 시만) */}
                        {!editingMemo && (
                            <div className="flex gap-2 flex-wrap">
                                {TEMPLATES.map(tpl => (
                                    <button
                                        key={tpl.name}
                                        onClick={() => applyTemplate(tpl)}
                                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                    >
                                        <span>{tpl.icon}</span> {tpl.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* 제목 */}
                        <input
                            className="w-full bg-transparent text-xl font-black text-foreground placeholder:text-muted-foreground/40 focus:outline-none border-b border-border pb-2"
                            placeholder="제목 (선택)"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />

                        {/* 상태 선택 */}
                        <div className="flex flex-wrap gap-2">
                            {STATUSES.map(s => (
                                <button
                                    key={s.value}
                                    onClick={() => setMemoStatus(s.value)}
                                    className={cn(
                                        'text-[9px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest transition-all',
                                        memoStatus === s.value
                                            ? s.color + ' scale-105'
                                            : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        {/* 편집 / 미리보기 탭 */}
                        <div className="flex items-center gap-2 border-b border-border pb-2">
                            <button
                                onClick={() => setEditMode('edit')}
                                className={cn(
                                    'flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-lg transition-colors',
                                    editMode === 'edit' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                <Edit3 className="w-3 h-3" /> 편집
                            </button>
                            <button
                                onClick={() => setEditMode('preview')}
                                className={cn(
                                    'flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-lg transition-colors',
                                    editMode === 'preview' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                <Eye className="w-3 h-3" /> 미리보기
                            </button>
                        </div>

                        {/* 에디터 / 마크다운 미리보기 */}
                        {editMode === 'edit' ? (
                            <textarea
                                className="w-full h-52 bg-muted/30 border border-border rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none custom-scrollbar font-mono"
                                placeholder="내용을 입력하세요... (Markdown 지원)"
                                value={content}
                                onChange={e => setContent(e.target.value)}
                            />
                        ) : (
                            <div className="w-full min-h-[13rem] bg-muted/20 border border-border rounded-xl p-4 overflow-y-auto prose prose-sm dark:prose-invert max-w-none text-foreground custom-scrollbar">
                                {content
                                    ? <ReactMarkdown>{content}</ReactMarkdown>
                                    : <span className="text-muted-foreground italic text-sm">내용이 없습니다.</span>
                                }
                            </div>
                        )}

                        {/* 연관 프로젝트 / 목표 */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">연관 프로젝트</Label>
                                <Select value={connectedProjectId || 'none'} onValueChange={v => setConnectedProjectId(v === 'none' ? undefined : v)}>
                                    <SelectTrigger className="h-9 bg-muted/50 border-border text-xs">
                                        <SelectValue placeholder="프로젝트 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">없음</SelectItem>
                                        {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">연관 목표</Label>
                                <Select value={connectedGoalId || 'none'} onValueChange={v => setConnectedGoalId(v === 'none' ? undefined : v)}>
                                    <SelectTrigger className="h-9 bg-muted/50 border-border text-xs">
                                        <SelectValue placeholder="목표 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">없음</SelectItem>
                                        {goals.map(g => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* 태그 */}
                        <div className="space-y-2">
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold border border-primary/20">
                                            #{tag}
                                            <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-rose-400 transition-colors">
                                                <X className="w-2.5 h-2.5" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <Input
                                className="bg-muted/50 border-border text-sm"
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

                        {/* 파일 첨부 (드래그앤드롭 영역) */}
                        <div
                            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className={cn(
                                'border-2 border-dashed rounded-xl p-4 transition-colors',
                                isDragging ? 'border-primary/50 bg-primary/5' : 'border-border',
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <p className="text-xs text-muted-foreground flex-1">
                                    이미지나 PDF를 드래그하거나 버튼으로 첨부하세요
                                </p>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                                <Button variant="outline" size="sm" className="h-8 text-xs flex-shrink-0" onClick={() => fileInputRef.current?.click()}>
                                    <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> 이미지
                                </Button>
                                <input type="file" ref={pdfInputRef} className="hidden" accept=".pdf" onChange={handlePdfUpload} />
                                <Button variant="outline" size="sm" className="h-8 text-xs flex-shrink-0" onClick={() => pdfInputRef.current?.click()} disabled={isUploading}>
                                    {isUploading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5 mr-1.5" />}
                                    PDF
                                </Button>
                            </div>

                            {/* 첨부 미리보기 */}
                            {attachments.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {attachments.some(a => !a.startsWith('pdf::')) && (
                                        <div className="flex gap-2 flex-wrap">
                                            {attachments.filter(a => !a.startsWith('pdf::')).map((src, idx) => (
                                                <div key={idx} className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border border-border">
                                                    <Image src={src} alt="attachment" fill className="object-cover" unoptimized />
                                                    <button
                                                        onClick={() => removeAttachment(attachments.indexOf(src))}
                                                        className="absolute top-0 right-0 bg-black/60 text-white p-0.5 hover:bg-rose-500 rounded-bl-xl transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {attachments.filter(a => a.startsWith('pdf::')).map((att, idx) => {
                                        const url = att.replace('pdf::', '');
                                        const name = getPdfFileName(url);
                                        return (
                                            <div key={idx} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 group">
                                                <FileText className="w-4 h-4 text-rose-400 flex-shrink-0" />
                                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-foreground/70 hover:text-primary truncate flex-1">{name}</a>
                                                <button onClick={() => removeAttachment(attachments.indexOf(att))} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-400 transition-all">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 푸터 */}
                        <div className="flex items-center justify-between pt-1">
                            <div className="flex gap-2">
                                {editingMemo && (
                                    <>
                                        <Button variant="ghost" className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs h-9" onClick={handleDelete}>
                                            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> 삭제
                                        </Button>
                                        <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 text-xs h-9" onClick={() => handleConvertToTask(editingMemo)}>
                                            <ListTodo className="w-3.5 h-3.5 mr-1.5" /> 태스크로 변환
                                        </Button>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-xs h-9">취소</Button>
                                <Button onClick={handleSave} disabled={!content.trim() && !title.trim()} className="text-xs h-9 px-5">저장</Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

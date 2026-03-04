'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    Palette, Plus, Trash2, Calendar as CalendarIcon, Tag, Star,
    ArrowLeft, Image as ImageIcon, ExternalLink, MoreVertical,
    Sparkles, Camera, Book, Music, Ghost, Heart, Trophy, Edit3,
    X, ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Image from 'next/image';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

export function HobbyLog() {
    const { hobbies, addHobby, deleteHobby, hobbyPosts, addHobbyPost, deleteHobbyPost } = useData();

    // UI State
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [selectedHobbyId, setSelectedHobbyId] = useState<string | null>(null);

    // Dialog States
    const [isHobbyDialogOpen, setIsHobbyDialogOpen] = useState(false);
    const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

    // Hobby Form
    const [newHobbyTitle, setNewHobbyTitle] = useState('');
    const [newHobbyDesc, setNewHobbyDesc] = useState('');
    const [newHobbyCover, setNewHobbyCover] = useState('');

    // Post Form
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [postDate, setPostDate] = useState<Date>(new Date());
    const [postImages, setPostImages] = useState<string[]>([]);
    const [postTags, setPostTags] = useState('');
    const [postLink, setPostLink] = useState('');

    const selectedHobby = hobbies.find(h => h.id === selectedHobbyId);
    const currentPosts = hobbyPosts
        .filter(p => p.hobbyId === selectedHobbyId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleCreateHobby = () => {
        if (!newHobbyTitle) return;
        const id = generateId();
        addHobby({
            id,
            title: newHobbyTitle,
            description: newHobbyDesc,
            coverImage: newHobbyCover || undefined,
            startDate: new Date(),
            tags: []
        });
        setNewHobbyTitle(''); setNewHobbyDesc(''); setNewHobbyCover(''); setIsHobbyDialogOpen(false);
    };

    const handleDeleteHobby = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('이 취미 저장소를 종료하시겠습니까? 모든 기록이 삭제됩니다.')) {
            deleteHobby(id);
            if (selectedHobbyId === id) { setView('list'); setSelectedHobbyId(null); }
        }
    };

    const handleCreatePost = () => {
        if (!selectedHobbyId || !postTitle) return;
        addHobbyPost({
            id: generateId(),
            hobbyId: selectedHobbyId,
            title: postTitle,
            content: postContent,
            date: postDate,
            images: postImages,
            tags: postTags ? postTags.split(',').map(t => t.trim()) : [],
            link: postLink
        });
        resetPostForm();
        setIsPostDialogOpen(false);
    };

    const handleDeletePost = (id: string) => {
        if (confirm('이 기록을 삭제하시겠습니까?')) {
            deleteHobbyPost(id);
        }
    };

    const resetPostForm = () => {
        setPostTitle(''); setPostContent(''); setPostDate(new Date()); setPostImages([]); setPostTags(''); setPostLink('');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { setter(reader.result as string); };
            reader.readAsDataURL(file);
        }
    };

    const handlePostImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPostImages(prev => [...prev, reader.result as string].slice(0, 4));
                };
                reader.readAsDataURL(file);
            });
        }
    };

    if (view === 'list') {
        return (
            <div className="h-full flex flex-col glass-premium rounded-[32px] border border-border shadow-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] via-transparent to-rose-500/[0.03] pointer-events-none" />

                <div className="p-8 pb-4 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(245,158,11,0.5)]">
                                <Palette className="w-6 h-6 text-white" strokeWidth={3} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground leading-none">취미 저장소</h2>
                                <p className="text-xs text-muted-foreground mt-1">취미 &amp; 관심사 기록</p>
                            </div>
                        </div>

                        <Dialog open={isHobbyDialogOpen} onOpenChange={setIsHobbyDialogOpen}>
                            <DialogTrigger asChild>
                                <button className="w-12 h-12 rounded-2xl bg-amber-500 hover:bg-amber-600 flex items-center justify-center transition-all text-white shadow-[0_10px_20px_-5px_rgba(245,158,11,0.4)] active:scale-95 group">
                                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" strokeWidth={3} />
                                </button>
                            </DialogTrigger>
                            <DialogContent className="glass-premium border border-border text-foreground rounded-[40px] p-0 shadow-2xl sm:max-w-[550px] overflow-hidden">
                                <DialogHeader className="p-10 pb-0">
                                    <DialogTitle className="text-2xl font-bold mb-1">새 취미 추가</DialogTitle>
                                </DialogHeader>
                                <div className="p-10 pt-4 space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold text-muted-foreground ml-1">취미 이름</label>
                                        <Input
                                            className="h-14 font-semibold text-xl border-border bg-background focus-visible:ring-amber-500/30 rounded-2xl text-foreground placeholder:text-muted-foreground"
                                            placeholder="예: 아날로그 사진, 베이킹..."
                                            value={newHobbyTitle}
                                            onChange={e => setNewHobbyTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold text-muted-foreground ml-1">설명</label>
                                        <Input
                                            className="h-12 bg-background border-border rounded-2xl text-foreground placeholder:text-muted-foreground"
                                            placeholder="핵심 추진 동력을 설명하세요"
                                            value={newHobbyDesc}
                                            onChange={e => setNewHobbyDesc(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold text-muted-foreground ml-1">커버 이미지</label>
                                        <div className="flex items-center gap-6 p-6 rounded-3xl bg-muted/50 border border-border">
                                            <div className="w-24 h-24 bg-muted rounded-2xl overflow-hidden border border-border flex items-center justify-center relative hover:bg-muted/80 transition-all cursor-pointer group">
                                                {newHobbyCover ? (
                                                    <Image src={newHobbyCover} alt="Cover" fill className="object-cover" unoptimized />
                                                ) : (
                                                    <Camera className="w-8 h-8 text-muted-foreground group-hover:scale-110 transition-all" />
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={(e) => handleImageUpload(e, setNewHobbyCover)}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-amber-500">커버 업로드</p>
                                                <p className="text-xs text-muted-foreground mt-1">커버 이미지를 업로드하세요.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="p-10 pt-0">
                                    <Button
                                        onClick={handleCreateHobby}
                                        disabled={!newHobbyTitle}
                                        className="w-full h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm shadow-xl transition-all active:scale-95"
                                    >
                                        취미 추가
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10">
                    {hobbies.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-4">
                            <Palette className="w-20 h-20 text-muted-foreground" />
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-foreground">취미가 없습니다</h3>
                                <p className="text-sm text-muted-foreground">새 취미를 추가해 보세요</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-12">
                            <AnimatePresence mode="popLayout">
                                {hobbies.map((hobby, idx) => {
                                    const count = hobbyPosts.filter(p => p.hobbyId === hobby.id).length;
                                    return (
                                        <motion.div
                                            key={hobby.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group cursor-pointer"
                                            onClick={() => { setSelectedHobbyId(hobby.id); setView('detail'); }}
                                        >
                                            <div className="relative h-[320px] rounded-[40px] overflow-hidden border border-border bg-muted/50 transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-2 shadow-2xl">
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />

                                                {hobby.coverImage ? (
                                                    <Image src={hobby.coverImage} alt={hobby.title} fill className="object-cover grayscale-[0.2] transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0" unoptimized />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/10 to-transparent">
                                                        <Palette className="w-16 h-16 text-muted-foreground/20" />
                                                    </div>
                                                )}

                                                <div className="absolute inset-x-0 bottom-0 p-8 z-20">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="px-4 h-6 rounded-lg bg-amber-500/20 text-xs font-semibold text-amber-500 flex items-center border border-amber-500/20 backdrop-blur-md">
                                                            {count}개의 기록
                                                        </div>
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-white leading-none mb-2 group-hover:text-amber-400 transition-colors">{hobby.title}</h3>
                                                    <p className="text-xs text-white/50 line-clamp-1">
                                                        {hobby.description || '설명 없음'}
                                                    </p>

                                                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                                                        <div className="flex items-center gap-2">
                                                            <CalendarIcon className="w-3 h-3 text-white/40" />
                                                            <span className="text-xs text-white/40">시작 {format(new Date(hobby.startDate), 'yyyy', { locale: ko })}</span>
                                                        </div>
                                                        <button
                                                            className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-xl active:scale-90"
                                                            onClick={(e) => handleDeleteHobby(hobby.id, e)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!selectedHobby) return null;

    return (
        <div className="h-full flex flex-col glass-premium rounded-[32px] border border-border shadow-2xl overflow-hidden relative">
            <div className="shrink-0 relative h-80 group overflow-hidden">
                {selectedHobby.coverImage ? (
                    <Image src={selectedHobby.coverImage} fill className="object-cover transition-all duration-1000 group-hover:scale-110" alt="cover" unoptimized />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-900 to-black" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />

                <div className="relative z-20 h-full p-10 flex flex-col justify-end">
                    <div className="flex flex-col gap-6">
                        <button
                            className="w-fit flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-white/10 border border-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all font-semibold text-xs active:scale-95"
                            onClick={() => setView('list')}
                        >
                            <ArrowLeft className="w-4 h-4" /> 취미 목록으로
                        </button>
                        <div className="flex items-end justify-between gap-12">
                            <div className="max-w-2xl">
                                <h2 className="text-5xl font-bold text-white leading-none drop-shadow-2xl mb-3">{selectedHobby.title}</h2>
                                <p className="text-xs text-white/50 leading-relaxed max-w-xl">
                                    {selectedHobby.description || '설명 없음'}
                                </p>
                            </div>
                            <Button
                                onClick={() => setIsPostDialogOpen(true)}
                                className="h-14 px-8 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm shadow-2xl transition-all active:scale-95 shrink-0"
                            >
                                <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} /> 기록 추가
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-10">
                <div className="max-w-5xl mx-auto space-y-12 pb-20">
                    {currentPosts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 opacity-30 gap-4">
                            <Book className="w-20 h-20 text-muted-foreground" />
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-semibold text-foreground">기록이 없습니다</h3>
                                <p className="text-sm text-muted-foreground">아직 기록이 없습니다</p>
                            </div>
                        </div>
                    ) : (
                        currentPosts.map((post, idx) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                viewport={{ once: true }}
                                className="glass-premium rounded-[40px] p-10 border border-border relative group/post hover:border-border/80 transition-all"
                            >
                                <div className="absolute top-10 right-10 flex gap-2 opacity-0 group-hover/post:opacity-100 transition-all">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-95 shadow-xl">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="glass-premium border border-border min-w-[180px]">
                                            <DropdownMenuItem className="text-sm gap-3 py-3 text-rose-500" onClick={() => handleDeletePost(post.id)}>
                                                <Trash2 className="w-4 h-4" /> 항목 삭제
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="flex items-center gap-6 mb-8">
                                    <div className="rounded-[28px] bg-muted/50 border border-border flex flex-col items-center justify-center shrink-0 px-4 py-3">
                                        <span className="text-xs font-semibold text-muted-foreground">{format(new Date(post.date), 'MMM')}</span>
                                        <span className="text-2xl font-bold text-foreground leading-none">{format(new Date(post.date), 'dd')}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-semibold text-amber-500">#{idx + 1}</span>
                                            <span className="w-1 h-1 rounded-full bg-white/20" />
                                            <span className="text-xs text-muted-foreground">{format(new Date(post.date), 'aa hh:mm', { locale: ko })}</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-foreground leading-tight">{post.title}</h3>
                                    </div>
                                </div>

                                <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground mb-8 text-sm leading-relaxed bg-muted/30 p-6 rounded-[28px] border border-border">
                                    {post.content}
                                </div>

                                {post.images && post.images.length > 0 && (
                                    <div className={cn("grid gap-4 mb-8",
                                        post.images.length === 1 ? "grid-cols-1" :
                                            post.images.length === 2 ? "grid-cols-2" :
                                                "grid-cols-2 lg:grid-cols-4"
                                    )}>
                                        {post.images.map((img, i) => (
                                            <div key={i} className="rounded-2xl overflow-hidden border border-border bg-muted/40 relative aspect-square group/img">
                                                <Image src={img} alt="post-img" fill className="object-cover transition-all duration-700 group-hover/img:scale-110" unoptimized />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    {post.tags?.map(tag => (
                                        <div key={tag} className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-xs font-medium text-muted-foreground hover:text-amber-500 hover:border-amber-400/30 transition-all">
                                            #{tag}
                                        </div>
                                    ))}
                                    {post.link && (
                                        <a href={post.link} target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-2 group/link">
                                            <span className="text-xs text-muted-foreground group-hover/link:text-amber-500 transition-colors">링크 열기</span>
                                            <div className="w-7 h-7 rounded-lg bg-muted/50 border border-border flex items-center justify-center group-hover/link:bg-amber-500 transition-all">
                                                <ArrowUpRight className="w-3.5 h-3.5 text-foreground group-hover/link:text-white transition-colors" />
                                            </div>
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
                <DialogContent className="glass-premium border border-border text-foreground rounded-[40px] p-0 shadow-2xl sm:max-w-3xl max-h-[90vh] overflow-hidden">
                    <DialogHeader className="p-10 pb-0">
                        <DialogTitle className="text-2xl font-bold mb-1">새 기록 추가</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto custom-scrollbar p-10 pt-4 space-y-8">
                        <div className="grid gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-muted-foreground ml-1">제목</label>
                                <Input
                                    className="h-14 font-semibold text-xl border-border bg-background focus-visible:ring-amber-500/30 rounded-2xl text-foreground placeholder:text-muted-foreground"
                                    placeholder="기록 제목..."
                                    value={postTitle}
                                    onChange={e => setPostTitle(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-muted-foreground ml-1">날짜</label>
                                    <Input
                                        type="datetime-local"
                                        className="h-12 bg-background border-border rounded-2xl text-foreground cursor-pointer"
                                        value={format(postDate, "yyyy-MM-dd'T'HH:mm")}
                                        onChange={e => setPostDate(new Date(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-muted-foreground ml-1">참고 링크</label>
                                    <Input
                                        className="h-12 bg-background border-border rounded-2xl text-foreground placeholder:text-muted-foreground"
                                        placeholder="https://..."
                                        value={postLink}
                                        onChange={e => setPostLink(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-muted-foreground ml-1">내용</label>
                                <Textarea
                                    placeholder="이번 활동에 대해 기록해 보세요..."
                                    className="min-h-[200px] rounded-2xl border border-border bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground leading-relaxed resize-none focus:ring-2 focus:ring-amber-500/20"
                                    value={postContent}
                                    onChange={e => setPostContent(e.target.value)}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-muted-foreground ml-1">이미지 (최대 4장)</label>
                                <div className="flex gap-4 flex-wrap p-4 bg-muted/30 rounded-2xl border border-border">
                                    <AnimatePresence>
                                        {postImages.map((img, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.8, opacity: 0 }}
                                                className="w-24 h-24 relative rounded-2xl overflow-hidden border border-border group shadow-lg"
                                            >
                                                <Image src={img} alt="preview" fill className="object-cover" unoptimized />
                                                <button
                                                    onClick={() => setPostImages(prev => prev.filter((_, i) => i !== idx))}
                                                    className="absolute top-2 right-2 bg-rose-500 text-white w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl active:scale-75"
                                                >
                                                    <X className="w-3 h-3" strokeWidth={4} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {postImages.length < 4 && (
                                        <div className="w-24 h-24 border-2 border-dashed border-border rounded-2xl flex items-center justify-center relative hover:bg-muted/50 transition-all group overflow-hidden">
                                            <Plus className="w-8 h-8 text-muted-foreground group-hover:scale-125 group-hover:text-amber-500/70 transition-all" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={handlePostImageUpload}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-muted-foreground ml-1">태그 (쉼표로 구분)</label>
                                <Input
                                    className="h-12 bg-background border-border rounded-2xl text-foreground placeholder:text-muted-foreground"
                                    placeholder="여행, 사진, 일상..."
                                    value={postTags}
                                    onChange={e => setPostTags(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-10 pt-4 bg-muted/20 border-t border-border">
                        <Button
                            onClick={handleCreatePost}
                            disabled={!postTitle}
                            className="w-full h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm shadow-2xl active:scale-95 transition-all"
                        >
                            기록 저장
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Palette, Plus, Trash2, Calendar as CalendarIcon, Tag, Star, ArrowLeft, Image as ImageIcon, ExternalLink, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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

    // --- Hobby Actions ---
    const handleCreateHobby = () => {
        if (!newHobbyTitle) return;
        const id = generateId();
        addHobby({
            id,
            title: newHobbyTitle,
            description: newHobbyDesc,
            coverImage: newHobbyCover || undefined, // Todo: Handle image upload
            startDate: new Date(),
            tags: []
        });
        setNewHobbyTitle('');
        setNewHobbyDesc('');
        setNewHobbyCover('');
        setIsHobbyDialogOpen(false);
    };

    const handleDeleteHobby = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('이 취미와 모든 기록을 삭제하시겠습니까?')) {
            deleteHobby(id);
            if (selectedHobbyId === id) {
                setView('list');
                setSelectedHobbyId(null);
            }
        }
    };

    // --- Post Actions ---
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
        setPostTitle('');
        setPostContent('');
        setPostDate(new Date());
        setPostImages([]);
        setPostTags('');
        setPostLink('');
    };

    // Helper: Image Upload (Base64)
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setter(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Helper: Multiple Image Upload for Post
    const handlePostImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPostImages(prev => [...prev, reader.result as string].slice(0, 4)); // Max 4
                };
                reader.readAsDataURL(file);
            });
        }
    };

    // --- Render: List View ---
    if (view === 'list') {
        return (
            <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Palette className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold">나의 취미 생활</h2>
                    </div>
                    <Button onClick={() => setIsHobbyDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" /> 새 취미 만들기
                    </Button>
                </div>

                {hobbies.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50 min-h-[400px]">
                        <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                            <Palette className="w-10 h-10" />
                        </div>
                        <p className="text-lg font-medium">새로운 취미를 시작해보세요!</p>
                        <p className="text-sm">상단의 버튼을 눌러 취미 공간을 만들 수 있습니다.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hobbies.map(hobby => {
                            // Get stats
                            const count = hobbyPosts.filter(p => p.hobbyId === hobby.id).length;
                            const lastPost = hobbyPosts.filter(p => p.hobbyId === hobby.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

                            return (
                                <Card
                                    key={hobby.id}
                                    className="group cursor-pointer hover:shadow-lg transition-all overflow-hidden border-muted/60"
                                    onClick={() => { setSelectedHobbyId(hobby.id); setView('detail'); }}
                                >
                                    {/* Cover Image Area */}
                                    <div className="h-32 bg-muted/30 relative overflow-hidden">
                                        {hobby.coverImage ? (
                                            <img src={hobby.coverImage} alt={hobby.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                                                <Palette className="w-8 h-8 text-indigo-200" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/80 hover:bg-white text-red-500" onClick={(e) => handleDeleteHobby(hobby.id, e)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <CardContent className="p-5">
                                        <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{hobby.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                                            {hobby.description || '설명이 없습니다.'}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-dashed">
                                            <span className="flex items-center gap-1">
                                                <CalendarIcon className="w-3 h-3" />
                                                {format(new Date(hobby.startDate), 'yy.MM.dd')} 시작
                                            </span>
                                            <span className="bg-primary/5 text-primary px-2 py-0.5 rounded-full font-medium">
                                                기록 {count}개
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Create Hobby Dialog */}
                <Dialog open={isHobbyDialogOpen} onOpenChange={setIsHobbyDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>새로운 취미 공간 만들기</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>취미 이름</Label>
                                <Input
                                    placeholder="예: 필름 사진, 베이킹, 독서 등"
                                    value={newHobbyTitle}
                                    onChange={e => setNewHobbyTitle(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>설명 (선택)</Label>
                                <Input
                                    placeholder="이 취미에 대한 간단한 설명"
                                    value={newHobbyDesc}
                                    onChange={e => setNewHobbyDesc(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>커버 이미지 (선택)</Label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0 border flex items-center justify-center relative">
                                        {newHobbyCover ? (
                                            <img src={newHobbyCover} alt="Cover" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => handleImageUpload(e, setNewHobbyCover)}
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        <p>이미지를 클릭하여 대표 사진을 설정하세요.</p>
                                        <p>설정하지 않으면 기본 이미지가 적용됩니다.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateHobby} disabled={!newHobbyTitle}>만들기</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    // --- Render: Detail View ---
    if (!selectedHobby) return null;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="shrink-0 relative h-48 bg-slate-900 flex items-end">
                {selectedHobby.coverImage && (
                    <>
                        <div className="absolute inset-0 bg-black/40 z-10" />
                        <img src={selectedHobby.coverImage} className="absolute inset-0 w-full h-full object-cover" alt="cover" />
                    </>
                )}
                <div className="relative z-20 w-full p-6 text-white flex justify-between items-end">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/70 hover:text-white hover:bg-white/10 mb-2 pl-0 gap-1"
                            onClick={() => setView('list')}
                        >
                            <ArrowLeft className="w-4 h-4" /> 목록으로
                        </Button>
                        <h2 className="text-3xl font-bold mb-1">{selectedHobby.title}</h2>
                        <p className="text-white/80 text-sm max-w-xl">{selectedHobby.description}</p>
                    </div>
                    <Button onClick={() => setIsPostDialogOpen(true)} className="bg-white text-slate-900 hover:bg-white/90 font-bold border-none">
                        <Plus className="w-4 h-4 mr-2" /> 기록 남기기
                    </Button>
                </div>
            </div>

            {/* Post Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/50">
                <div className="max-w-3xl mx-auto space-y-8">
                    {currentPosts.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            <p className="mb-2 text-lg">아직 기록이 없습니다.</p>
                            <p className="text-sm">첫 번째 이야기를 기록해보세요!</p>
                        </div>
                    ) : (
                        currentPosts.map(post => (
                            <div key={post.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Post Options */}
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => handleDeletePost(post.id)}>
                                                <Trash2 className="w-4 h-4 mr-2" /> 삭제
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground border-b pb-4 border-dashed">
                                    <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                        {format(new Date(post.date), 'yyyy년 MM월 dd일', { locale: ko })}
                                    </span>
                                    {post.link && (
                                        <a href={post.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                                            <ExternalLink className="w-3 h-3" /> 관련 링크
                                        </a>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-4">{post.title}</h3>

                                <div className="prose prose-sm max-w-none text-slate-600 mb-6 whitespace-pre-wrap leading-relaxed">
                                    {post.content}
                                </div>

                                {/* Images Grid */}
                                {post.images && post.images.length > 0 && (
                                    <div className={cn("grid gap-2 mb-4",
                                        post.images.length === 1 ? "grid-cols-1" :
                                            post.images.length === 2 ? "grid-cols-2" :
                                                "grid-cols-2 md:grid-cols-3"
                                    )}>
                                        {post.images.map((img, idx) => (
                                            <div key={idx} className="rounded-lg overflow-hidden border bg-slate-50 relative aspect-video">
                                                <img src={img} alt={`post-img-${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-zoom-in" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {post.tags && post.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {post.tags.map(tag => (
                                            <span key={tag} className="text-xs text-primary bg-primary/5 px-2 py-1 rounded-full font-medium">#{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Post Dialog */}
            <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>기록 남기기</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>제목</Label>
                            <Input
                                placeholder="제목을 입력하세요"
                                value={postTitle}
                                onChange={e => setPostTitle(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>날짜</Label>
                            <Input
                                type="datetime-local"
                                value={format(postDate, "yyyy-MM-dd'T'HH:mm")}
                                onChange={e => setPostDate(new Date(e.target.value))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>내용 (Markdown 지원)</Label>
                            <Textarea
                                placeholder="자유롭게 내용을 작성하세요..."
                                className="min-h-[200px] resize-y font-sans text-base leading-relaxed"
                                value={postContent}
                                onChange={e => setPostContent(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>사진 추가 (최대 4장)</Label>
                            <div className="flex gap-2 flex-wrap">
                                {postImages.map((img, idx) => (
                                    <div key={idx} className="w-20 h-20 relative rounded-md overflow-hidden border group">
                                        <img src={img} alt="preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setPostImages(prev => prev.filter((_, i) => i !== idx))}
                                            className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                {postImages.length < 4 && (
                                    <div className="w-20 h-20 border-2 border-dashed rounded-md flex items-center justify-center relative hover:bg-muted/50 transition-colors">
                                        <Plus className="w-6 h-6 text-muted-foreground" />
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>태그 (쉼표로 구분)</Label>
                                <Input
                                    placeholder="여행, 맛집, 기록"
                                    value={postTags}
                                    onChange={e => setPostTags(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>관련 링크</Label>
                                <Input
                                    placeholder="https://..."
                                    value={postLink}
                                    onChange={e => setPostLink(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreatePost} disabled={!postTitle}>저장하기</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

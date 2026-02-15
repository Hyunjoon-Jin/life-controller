'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Trash2, ExternalLink, Bookmark, CheckCircle2, PlayCircle, BookOpen, MonitorPlay, Search, Filter } from 'lucide-react';
import { LanguageResource } from '@/types';
import { format } from 'date-fns';
import Image from 'next/image';

const RECOMMENDED_RESOURCES = [
    // English
    { language: 'English', title: 'TED Talks', type: 'video', url: 'https://www.ted.com/talks', category: 'Listening', thumbnail: 'https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/05710609-b467-4286-9dc4-c9233621458f/TED_Banner.jpg' },
    { language: 'English', title: 'BBC Learning English', type: 'article', url: 'https://www.bbc.co.uk/learningenglish/', category: 'Grammar', thumbnail: 'https://ichef.bbci.co.uk/images/ic/1200x675/p09txt56.jpg' },
    { language: 'English', title: 'Coursera (English)', type: 'lecture', url: 'https://www.coursera.org/browse/language-learning/learning-english', category: 'Lecture', thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/fa/6938b0e9a311e68b5a075c31756543/Specialization_Logo_Color.png' },

    // Japanese
    { language: 'Japanese', title: 'JLPT Sensei', type: 'article', url: 'https://jlptsensei.com/', category: 'Grammar', thumbnail: 'https://jlptsensei.com/wp-content/uploads/2018/10/jlpt-sensei-logo-icon.png' },
    { language: 'Japanese', title: 'NHK News Web Easy', type: 'article', url: 'https://www3.nhk.or.jp/news/easy/', category: 'Reading', thumbnail: 'https://www3.nhk.or.jp/news/easy/images/logo.png' },

    // Chinese
    { language: 'Chinese', title: 'ChinesePod', type: 'video', url: 'https://chinesepod.com/', category: 'Listening', thumbnail: 'https://s3.amazonaws.com/chinesepod.com/blog/wp-content/uploads/2019/04/CPod-Logo-Square.jpg' },

    // Spanish
    { language: 'Spanish', title: 'StudySpanish.com', type: 'article', url: 'https://studyspanish.com/', category: 'Grammar', thumbnail: 'https://studyspanish.com/assets/images/logo.png' },
];

export function LanguageResources({ language }: { language: string }) {
    const { languageResources, addLanguageResource, updateLanguageResource, deleteLanguageResource } = useData();
    const [activeTab, setActiveTab] = useState('library');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form
    const [newTitle, setNewTitle] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newType, setNewType] = useState<LanguageResource['type']>('video');
    const [newCategory, setNewCategory] = useState('');
    const [newMemo, setNewMemo] = useState('');

    // My Library Logic
    const myResources = languageResources.filter(r => r.language === language);
    const inProgress = myResources.filter(r => r.status === 'studying');
    const toStudy = myResources.filter(r => r.status === 'tostudy');
    const completed = myResources.filter(r => r.status === 'completed');

    // Recommendations Logic
    const recommendations = RECOMMENDED_RESOURCES.filter(r => r.language === language);

    const handleSave = () => {
        if (!newTitle || !newUrl) return;

        // Auto thumbnail for YouTube
        let thumb = '';
        if (newUrl.includes('youtube.com') || newUrl.includes('youtu.be')) {
            const videoId = newUrl.split('v=')[1]?.split('&')[0] || newUrl.split('/').pop();
            if (videoId) thumb = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        }

        addLanguageResource({
            id: generateId(),
            title: newTitle,
            url: newUrl,
            type: newType,
            category: newCategory || 'General',
            language: language,
            status: 'tostudy',
            thumbnail: thumb,
            createdAt: new Date(),
            memo: newMemo
        });

        setIsDialogOpen(false);
        setNewTitle('');
        setNewUrl('');
        setNewMemo('');
    };

    const handleAddRecommendation = (rec: any) => {
        addLanguageResource({
            id: generateId(),
            title: rec.title,
            url: rec.url,
            type: rec.type as any,
            category: rec.category,
            language: language,
            status: 'tostudy',
            thumbnail: rec.thumbnail,
            createdAt: new Date(),
            isRecommended: true
        });
        setActiveTab('library');
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return <PlayCircle className="w-4 h-4 text-red-500" />;
            case 'article': return <BookOpen className="w-4 h-4 text-blue-500" />;
            case 'lecture': return <MonitorPlay className="w-4 h-4 text-purple-500" />;
            default: return <ExternalLink className="w-4 h-4 text-slate-500" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
                    <TabsList>
                        <TabsTrigger value="library">내 서재</TabsTrigger>
                        <TabsTrigger value="recommendations">추천 콘텐츠</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> 새 자료 추가
                </Button>
            </div>

            {activeTab === 'library' && (
                <div className="space-y-8">
                    {/* Currently Studying */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <MonitorPlay className="w-5 h-5 text-indigo-500" /> 학습 중 ({inProgress.length})
                        </h3>
                        {inProgress.length === 0 ? (
                            <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed text-muted-foreground text-sm">
                                학습 중인 자료가 없습니다.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {inProgress.map(resource => (
                                    <ResourceCard key={resource.id} resource={resource} onUpdate={updateLanguageResource} onDelete={deleteLanguageResource} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* To Study */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Bookmark className="w-5 h-5 text-yellow-500" /> 나중에 볼 ({toStudy.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {toStudy.map(resource => (
                                <ResourceCard key={resource.id} resource={resource} onUpdate={updateLanguageResource} onDelete={deleteLanguageResource} />
                            ))}
                        </div>
                    </div>

                    {/* Completed */}
                    {completed.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg flex items-center gap-2 opacity-70">
                                <CheckCircle2 className="w-5 h-5 text-green-500" /> 학습 완료 ({completed.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70 hover:opacity-100 transition-opacity">
                                {completed.map(resource => (
                                    <ResourceCard key={resource.id} resource={resource} onUpdate={updateLanguageResource} onDelete={deleteLanguageResource} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'recommendations' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.length > 0 ? recommendations.map((rec, idx) => (
                        <Card key={idx} className="overflow-hidden hover:shadow-lg transition-all group">
                            <div className="h-40 bg-slate-100 relative overflow-hidden">
                                {rec.thumbnail ? (
                                    <Image src={rec.thumbnail} alt={rec.title} fill className="object-cover transition-transform group-hover:scale-105" unoptimized />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <BookOpen className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                                    {rec.category}
                                </div>
                            </div>
                            <CardContent className="p-4">
                                <h4 className="font-bold text-lg mb-1 line-clamp-1">{rec.title}</h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                    {getTypeIcon(rec.type)}
                                    <span className="capitalize">{rec.type}</span>
                                </div>
                                <Button className="w-full" variant="secondary" onClick={() => handleAddRecommendation(rec)}>
                                    <Plus className="w-4 h-4 mr-2" /> 내 서재에 추가
                                </Button>
                            </CardContent>
                        </Card>
                    )) : (
                        <div className="col-span-full py-20 text-center text-muted-foreground">
                            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>이 언어에 대한 추천 콘텐츠가 아직 준비되지 않았습니다.</p>
                        </div>
                    )}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>새 학습 자료 추가</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>제목</Label>
                            <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="자료 제목..." />
                        </div>
                        <div className="space-y-2">
                            <Label>URL</Label>
                            <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..." />
                            <p className="text-[10px] text-muted-foreground">유튜브 링크 입력 시 썸네일이 자동으로 생성됩니다.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>유형</Label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                    value={newType}
                                    onChange={e => setNewType(e.target.value as any)}
                                >
                                    <option value="video">영상</option>
                                    <option value="article">아티클</option>
                                    <option value="lecture">강의</option>
                                    <option value="book">도서</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>카테고리</Label>
                                <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="예: 문법, 회화" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>메모 (선택)</Label>
                            <Input value={newMemo} onChange={e => setNewMemo(e.target.value)} placeholder="간단한 메모..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave} disabled={!newTitle || !newUrl}>저장하기</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ResourceCard({ resource, onUpdate, onDelete }: { resource: LanguageResource, onUpdate: (r: LanguageResource) => void, onDelete: (id: string) => void }) {
    const handleStatusChange = (status: LanguageResource['status']) => {
        onUpdate({ ...resource, status });
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return <PlayCircle className="w-3.5 h-3.5" />;
            case 'article': return <BookOpen className="w-3.5 h-3.5" />;
            case 'lecture': return <MonitorPlay className="w-3.5 h-3.5" />;
            default: return <ExternalLink className="w-3.5 h-3.5" />;
        }
    };

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="h-32 bg-slate-100 relative group overflow-hidden">
                {resource.thumbnail ? (
                    <Image src={resource.thumbnail} alt={resource.title} fill className="object-cover transition-transform group-hover:scale-105" unoptimized />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                        {resource.type === 'video' ? <PlayCircle className="w-10 h-10" /> : <BookOpen className="w-10 h-10" />}
                    </div>
                )}
                <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                    <ExternalLink className="text-white w-8 h-8 drop-shadow-md" />
                </a>
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    {getTypeIcon(resource.type)} {resource.category}
                </div>
            </div>
            <CardContent className="flex-1 p-3">
                <h4 className="font-semibold text-sm line-clamp-2 leading-tight mb-2 min-h-[2.5em]">{resource.title}</h4>
                {resource.memo && <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{resource.memo}</p>}

                <div className="flex gap-2 mt-auto pt-2 border-t">
                    {resource.status !== 'studying' && (
                        <Button variant="ghost" size="sm" className="flex-1 h-7 text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700" onClick={() => handleStatusChange('studying')}>
                            학습 시작
                        </Button>
                    )}
                    {resource.status === 'studying' && (
                        <Button variant="ghost" size="sm" className="flex-1 h-7 text-xs bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700" onClick={() => handleStatusChange('completed')}>
                            완료
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500" onClick={() => onDelete(resource.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

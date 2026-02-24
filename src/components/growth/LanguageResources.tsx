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
import {
    Plus, Trash2, ExternalLink, Bookmark, CheckCircle2,
    PlayCircle, BookOpen, MonitorPlay, Search, Filter,
    Cpu, Globe, Terminal, Link as LinkIcon, Sparkles,
    Database, Binary, LayoutGrid, Zap, Clock
} from 'lucide-react';
import { LanguageResource } from '@/types';
import { format } from 'date-fns';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

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
    const { languageResources = [], addLanguageResource, updateLanguageResource, deleteLanguageResource } = useData();
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
        setNewTitle(''); setNewUrl(''); setNewMemo('');
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

    return (
        <div className="space-y-10 pb-12">
            {/* Control Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-[450px]">
                    <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/5 h-12 w-full grid grid-cols-2">
                        <TabsTrigger value="library" className="rounded-xl font-black text-[9px] tracking-widest uppercase data-[state=active]:bg-indigo-500 data-[state=active]:text-white">학습 아카이브</TabsTrigger>
                        <TabsTrigger value="recommendations" className="rounded-xl font-black text-[9px] tracking-widest uppercase data-[state=active]:bg-indigo-500 data-[state=active]:text-white">추천 리소스</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="h-12 px-6 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-[9px] tracking-widest uppercase shadow-xl transition-all active:scale-95 w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4 mr-2" strokeWidth={3} /> 새로운 리소스 등록
                </Button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'library' && (
                    <motion.div
                        key="library"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-12"
                    >
                        {/* Currently Studying */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-indigo-400 tracking-[0.4em] uppercase flex items-center gap-3 italic px-4">
                                <Zap className="w-3 h-3" /> 학습 중 ({inProgress.length})
                            </h3>
                            {inProgress.length === 0 ? (
                                <div className="px-4">
                                    <div className="h-24 flex items-center justify-center bg-white/[0.02] border border-dashed border-white/5 rounded-[32px] text-[9px] font-black text-white/10 tracking-widest uppercase">
                                        현재 학습 중인 리소스가 없습니다
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                                    {inProgress.map(resource => (
                                        <ResourceCard key={resource.id} resource={resource} onUpdate={updateLanguageResource} onDelete={deleteLanguageResource} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* To Study */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-amber-500/60 tracking-[0.4em] uppercase flex items-center gap-3 italic px-4">
                                <Bookmark className="w-3 h-3" /> 대기 중인 리소스 ({toStudy.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                                {toStudy.map(resource => (
                                    <ResourceCard key={resource.id} resource={resource} onUpdate={updateLanguageResource} onDelete={deleteLanguageResource} />
                                ))}
                            </div>
                        </div>

                        {/* Completed */}
                        {completed.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-white/20 tracking-[0.4em] uppercase flex items-center gap-3 italic px-4">
                                    <CheckCircle2 className="w-3 h-3" /> 아카이브된 리소스 ({completed.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 opacity-40 hover:opacity-100 transition-opacity">
                                    {completed.map(resource => (
                                        <ResourceCard key={resource.id} resource={resource} onUpdate={updateLanguageResource} onDelete={deleteLanguageResource} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'recommendations' && (
                    <motion.div
                        key="recommendations"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 p-4"
                    >
                        {recommendations.length > 0 ? recommendations.map((rec, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="group glass-premium border border-white/5 rounded-[40px] overflow-hidden hover:bg-white/[0.03] transition-all h-full flex flex-col">
                                    <div className="h-44 bg-white/5 relative overflow-hidden">
                                        {rec.thumbnail ? (
                                            <Image src={rec.thumbnail} alt={rec.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/5">
                                                <Binary className="w-12 h-12" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute top-4 right-4 bg-indigo-500/80 backdrop-blur-md text-white text-[8px] font-black px-3 py-1 rounded-lg tracking-widest uppercase">
                                            {rec.category}
                                        </div>
                                    </div>
                                    <CardContent className="p-8 flex-1 flex flex-col">
                                        <h4 className="font-black text-white text-lg tracking-widest uppercase mb-2 line-clamp-1">{rec.title}</h4>
                                        <div className="flex items-center gap-3 text-[9px] font-bold text-white/20 tracking-widest uppercase mb-6">
                                            {getTypeIcon(rec.type)}
                                            {rec.type}
                                        </div>
                                        <Button
                                            className="w-full h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[9px] tracking-widest uppercase border border-white/5 mt-auto"
                                            variant="secondary"
                                            onClick={() => handleAddRecommendation(rec)}
                                        >
                                            <Plus className="w-3 h-3 mr-2" strokeWidth={3} /> 아카이브에 연결
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-40 text-center flex flex-col items-center justify-center opacity-10 gap-6">
                                <Globe className="w-16 h-16" />
                                <p className="text-[10px] font-black tracking-[0.4em] uppercase">추천 리소스가 없습니다</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass-premium border border-white/10 text-white rounded-[40px] p-0 shadow-2xl sm:max-w-3xl">
                    <DialogHeader className="p-10 pb-0">
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase mb-2">새로운 소스 등록</DialogTitle>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] italic">언어 습득을 위한 데이터링크 보정</p>
                    </DialogHeader>

                    <div className="p-10 pt-4 space-y-8">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">소스 식별자</Label>
                            <Input
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                placeholder="예: BBC 뉴스, TED TALK..."
                                className="h-14 font-black text-xl border-white/5 bg-white/5 rounded-2xl text-white placeholder:text-white/10"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">데이터링크 (URL)</Label>
                            <div className="relative">
                                <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                                <Input
                                    value={newUrl}
                                    onChange={e => setNewUrl(e.target.value)}
                                    placeholder="HTTPS://..."
                                    className="h-14 pl-14 bg-white/5 border-white/5 rounded-2xl text-white text-[10px] font-black tracking-widest uppercase"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">소스 유형</Label>
                                <select
                                    className="flex h-12 w-full rounded-2xl border border-white/5 bg-white/5 px-4 font-black uppercase text-[10px] tracking-widest text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={newType}
                                    onChange={e => setNewType(e.target.value as any)}
                                >
                                    <option value="video" className="bg-slate-900">영상 데이터</option>
                                    <option value="article" className="bg-slate-900">학술 텍스트</option>
                                    <option value="lecture" className="bg-slate-900">프로토콜 강의</option>
                                    <option value="book" className="bg-slate-900">물리적 원고</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">카테고리 태그</Label>
                                <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="예: 문법, 리스닝" className="h-12 bg-white/5 border-white/5 rounded-2xl text-white text-[10px] font-black tracking-widest uppercase" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">메모 (선택사항)</Label>
                            <Textarea
                                value={newMemo}
                                onChange={e => setNewMemo(e.target.value)}
                                placeholder="프로토콜 세부 정보를 입력하세요..."
                                className="min-h-[100px] bg-white/5 border-white/5 rounded-2xl p-6 text-[11px] font-bold text-white/60 leading-relaxed italic placeholder:text-white/10 resize-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-10 pt-4 bg-white/[0.02] border-t border-white/5">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDialogOpen(false)}
                            className="h-16 px-8 rounded-2xl text-[10px] font-black text-white/20 hover:text-white hover:bg-white/5 uppercase tracking-widest"
                        >
                            ABORT
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!newTitle || !newUrl}
                            className="flex-1 h-16 rounded-3xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-sm tracking-[0.2em] shadow-2xl active:scale-95 transition-all uppercase"
                        >
                            소스 등록
                        </Button>
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

    return (
        <Card className="group glass-premium border border-white/5 rounded-[40px] overflow-hidden hover:bg-white/[0.03] transition-all flex flex-col h-full relative">
            <div className="h-40 bg-white/5 relative group/thumb overflow-hidden">
                {resource.thumbnail ? (
                    <Image src={resource.thumbnail} alt={resource.title} fill className="object-cover transition-transform duration-700 group-hover/thumb:scale-110" unoptimized />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/5">
                        {resource.type === 'video' ? <PlayCircle className="w-12 h-12" /> : <BookOpen className="w-12 h-12" />}
                    </div>
                )}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                    <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-slate-950 shadow-2xl scale-75 group-hover/thumb:scale-100 transition-transform"
                    >
                        <ExternalLink className="w-6 h-6" />
                    </a>
                </div>
                <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-xl border border-white/10 text-[8px] px-3 py-1 rounded-lg font-black tracking-widest uppercase text-white/60 flex items-center gap-2">
                    {getTypeIcon(resource.type)} {resource.category}
                </div>
            </div>

            <CardContent className="p-8 flex-1 flex flex-col">
                <h4 className="font-black text-white text-md tracking-wider uppercase mb-3 line-clamp-2 min-h-[3em]">{resource.title}</h4>
                {resource.memo && (
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest italic line-clamp-1 mb-6 flex items-center gap-2">
                        <Terminal className="w-3 h-3 text-indigo-500" /> {resource.memo}
                    </p>
                )}

                <div className="flex gap-3 mt-auto pt-6 border-t border-white/5">
                    {resource.status !== 'studying' && (
                        <Button
                            variant="ghost"
                            className="flex-1 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 text-[9px] font-black tracking-widest uppercase border border-indigo-500/20 hover:bg-indigo-500 hover:text-white"
                            onClick={() => handleStatusChange('studying')}
                        >
                            <Zap className="w-3 h-3 mr-2" /> 학습 시작
                        </Button>
                    )}
                    {resource.status === 'studying' && (
                        <Button
                            variant="ghost"
                            className="flex-1 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 text-[9px] font-black tracking-widest uppercase border border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                            onClick={() => handleStatusChange('completed')}
                        >
                            <CheckCircle2 className="w-3 h-3 mr-2" /> 아카이브
                        </Button>
                    )}
                    <button
                        onClick={() => onDelete(resource.id)}
                        className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'video': return <PlayCircle className="w-4 h-4" />;
        case 'article': return <BookOpen className="w-4 h-4" />;
        case 'lecture': return <MonitorPlay className="w-4 h-4" />;
        default: return <ExternalLink className="w-4 h-4" />;
    }
};

import { Textarea } from '@/components/ui/textarea';

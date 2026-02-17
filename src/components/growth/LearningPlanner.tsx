'use client';

import { useData } from '@/context/DataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Award, Target, Calendar, Plus, ChevronRight, CheckCircle2, Clock, Edit2, GraduationCap, Flame, TrendingUp, AlertCircle, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { format, differenceInDays, isAfter } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { generateId, cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Certificate, LanguageResource } from '@/types';
import { generateStudyPlan } from '@/lib/gemini';

export interface LearningPlannerProps {
    onNavigate?: (tab: string) => void;
}

export function LearningPlanner({ onNavigate }: LearningPlannerProps) {
    const {
        certificates = [], languageResources = [], tasks = [],
        addCertificate, updateCertificate, deleteCertificate,
        addLanguageResource, updateLanguageResource, deleteLanguageResource
    } = useData();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCertId, setEditingCertId] = useState<string | null>(null);
    const [editingLangId, setEditingLangId] = useState<string | null>(null);

    // Form State
    const [goalType, setGoalType] = useState<'certificate' | 'language'>('certificate');
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [issuer, setIssuer] = useState('');
    const [langType, setLangType] = useState('English');
    const [langResourceType, setLangResourceType] = useState<LanguageResource['type']>('book');
    const [langUrl, setLangUrl] = useState('');
    const [langCategory, setLangCategory] = useState('General');
    const [memo, setMemo] = useState('');

    const [isPlanning, setIsPlanning] = useState(false);

    const handleGeneratePlan = async () => {
        if (!title) return;
        setIsPlanning(true);
        try {
            const { weeklyPlan } = await generateStudyPlan(title, goalType);
            const formattedPlan = weeklyPlan.map(w => `[${w.week}주차] ${w.topic}\n- ${w.details}`).join('\n\n');
            setMemo(prev => prev ? `${prev}\n\n[AI 학습 플랜]\n${formattedPlan}` : `[AI 학습 플랜]\n${formattedPlan}`);
        } catch (error) {
            console.error(error);
        } finally {
            setIsPlanning(false);
        }
    };

    // --- Computed Values ---
    const totalCerts = certificates.length;
    const acquiredCerts = certificates.filter(c => c.status === 'acquired').length;
    const studyingCerts = certificates.filter(c => c.status === 'studying');

    const totalLangResources = languageResources.length;
    const completedLangResources = languageResources.filter(r => r.status === 'completed').length;
    const studyingLangResources = languageResources.filter(r => r.status === 'studying').length;

    // Growth Gauge: weighted completion across all learning activities
    const totalItems = totalCerts + totalLangResources;
    const completedItems = acquiredCerts + completedLangResources;
    const inProgressItems = studyingCerts.length + studyingLangResources;
    const growthPercentage = totalItems > 0
        ? Math.round(((completedItems * 1.0 + inProgressItems * 0.3) / totalItems) * 100)
        : 0;
    const growthLevel = Math.max(1, Math.floor(growthPercentage / 8) + 1);

    // D-Day calculation
    const getDDay = (targetDate?: Date | string) => {
        if (!targetDate) return null;
        const diff = differenceInDays(new Date(targetDate), new Date());
        if (diff < 0) return `D+${Math.abs(diff)}`;
        if (diff === 0) return 'D-Day';
        return `D-${diff}`;
    };

    // Upcoming exams
    const upcomingExams = [
        ...certificates.filter(c => c.status === 'studying' && c.date && isAfter(new Date(c.date), new Date())),
        ...tasks.filter(t => (t.title.includes('시험') || t.title.includes('Test')) && !t.completed && t.dueDate)
    ].sort((a: any, b: any) => new Date(a.date || a.dueDate).getTime() - new Date(b.date || b.dueDate).getTime());

    // Language resource progress
    const getLangProgress = (resource: LanguageResource) => {
        if (resource.status === 'completed') return 100;
        if (resource.status === 'studying') return 50;
        return 0;
    };

    // --- Handlers ---
    const handleSave = () => {
        if (!title) return;
        if (goalType === 'certificate') {
            const certData: Certificate = {
                id: editingCertId || generateId(),
                name: title,
                issuer: issuer || '-',
                date: date ? new Date(date) : new Date(),
                status: 'studying',
                memo
            };
            if (editingCertId) {
                const existing = certificates.find(c => c.id === editingCertId);
                updateCertificate({ ...certData, status: existing?.status || 'studying' });
            } else {
                addCertificate(certData);
            }
        } else {
            const langData: LanguageResource = {
                id: editingLangId || generateId(),
                title,
                type: langResourceType,
                language: langType,
                status: 'tostudy',
                url: langUrl,
                category: langCategory,
                createdAt: new Date(),
                memo
            };
            if (editingLangId) {
                const existing = languageResources.find(r => r.id === editingLangId);
                addLanguageResource({ ...langData, status: existing?.status || 'tostudy' });
            } else {
                addLanguageResource(langData);
            }
        }
        resetForm();
        setIsDialogOpen(false);
    };

    const resetForm = () => {
        setTitle('');
        setDate('');
        setIssuer('');
        setLangType('English');
        setLangResourceType('book');
        setLangUrl('');
        setLangCategory('General');
        setMemo('');
        setEditingCertId(null);
        setEditingLangId(null);
    };

    const openNew = () => { resetForm(); setIsDialogOpen(true); };

    const handleEditCert = (c: Certificate) => {
        setGoalType('certificate');
        setEditingCertId(c.id);
        setTitle(c.name);
        setIssuer(c.issuer);
        setDate(c.date ? format(new Date(c.date), 'yyyy-MM-dd') : '');
        setMemo(c.memo || '');
        setIsDialogOpen(true);
    };

    const handleEditLang = (r: LanguageResource) => {
        setGoalType('language');
        setEditingLangId(r.id);
        setTitle(r.title);
        setLangType(r.language);
        setLangResourceType(r.type);
        setLangUrl(r.url);
        setLangCategory(r.category);
        setMemo(r.memo || '');
        setIsDialogOpen(true);
    };

    const cycleCertStatus = (c: Certificate) => {
        const nextStatus: Record<Certificate['status'], Certificate['status']> = {
            'studying': 'acquired', 'acquired': 'expired', 'expired': 'studying'
        };
        updateCertificate({ ...c, status: nextStatus[c.status] });
    };

    const cycleLangStatus = (r: LanguageResource) => {
        const nextStatus: Record<LanguageResource['status'], LanguageResource['status']> = {
            'tostudy': 'studying', 'studying': 'completed', 'completed': 'tostudy'
        };
        updateLanguageResource({ ...r, status: nextStatus[r.status] });
    };

    const getStatusColor = (status: Certificate['status']) => {
        switch (status) {
            case 'acquired': return 'bg-green-100 text-green-700 border-green-200';
            case 'studying': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'expired': return 'bg-red-100 text-red-700 border-red-200';
        }
    };

    const getStatusLabel = (status: Certificate['status']) => {
        switch (status) {
            case 'acquired': return '취득 완료';
            case 'studying': return '준비 중';
            case 'expired': return '만료됨';
        }
    };

    const getLangStatusColor = (status: LanguageResource['status']) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'studying': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'tostudy': return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    const getLangStatusLabel = (status: LanguageResource['status']) => {
        switch (status) {
            case 'completed': return '완료';
            case 'studying': return '학습 중';
            case 'tostudy': return '학습 예정';
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">학습 플래너</h2>
                    <p className="text-muted-foreground text-sm">목표 달성을 위한 체계적인 학습 관리</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onNavigate?.('calendar')}>
                        <Calendar className="w-4 h-4 mr-2" /> 스케줄러
                    </Button>
                    <Button size="sm" onClick={openNew}>
                        <Plus className="w-4 h-4 mr-2" /> 새 목표 추가
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Growth Gauge */}
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg">
                    <CardContent className="p-5 md:p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
                                Lv. {growthLevel}
                            </span>
                        </div>
                        <div className="text-xl md:text-2xl font-bold mb-1">성장 게이지</div>
                        <div className="text-indigo-100 text-sm mb-4">
                            {totalItems > 0
                                ? `전체 학습 목표의 ${growthPercentage}%를 달성했습니다.`
                                : '새 학습 목표를 추가해보세요!'}
                        </div>
                        <Progress value={growthPercentage} className="h-2.5 bg-indigo-900/30 [&>div]:bg-white/80" />
                        <div className="flex justify-between mt-2 text-xs text-indigo-200">
                            <span>완료 {completedItems}개</span>
                            <span>진행 중 {inProgressItems}개</span>
                            <span>전체 {totalItems}개</span>
                        </div>
                    </CardContent>
                </Card>

                {/* D-Day Countdown */}
                <Card className="md:col-span-2 border-none shadow-sm bg-slate-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-500" /> D-Day 카운트다운
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
                        {upcomingExams.length > 0 ? (
                            upcomingExams.slice(0, 5).map((exam: any, idx) => {
                                const examDate = exam.date || exam.dueDate;
                                const dDay = getDDay(examDate);
                                const diff = differenceInDays(new Date(examDate), new Date());
                                return (
                                    <div key={idx} className={cn(
                                        "p-4 rounded-xl min-w-[180px] shadow-sm border",
                                        diff <= 7 ? "bg-red-50 border-red-100" : diff <= 30 ? "bg-orange-50 border-orange-100" : "bg-white border-slate-100"
                                    )}>
                                        <div className="text-xs text-muted-foreground font-medium mb-1 truncate">{exam.title || exam.name}</div>
                                        <div className={cn(
                                            "text-2xl font-black",
                                            diff <= 7 ? "text-red-600" : diff <= 30 ? "text-orange-600" : "text-slate-800"
                                        )}>
                                            {dDay}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground font-bold mt-1">
                                            {format(new Date(examDate), 'MM월 dd일 (eee)', { locale: ko })}
                                        </div>
                                        {diff <= 7 && (
                                            <div className="flex items-center gap-1 mt-2 text-[10px] text-red-500 font-bold">
                                                <AlertCircle className="w-3 h-3" /> 임박!
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-sm text-muted-foreground italic py-4 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> 예정된 시험 일정이 없습니다. 자격증 목표를 추가해보세요.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Main Content: Language + Certificates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Language Learning Track */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="font-bold flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" /> 외국어 학습 현황
                        </h3>
                        <span className="text-xs text-muted-foreground">
                            {completedLangResources}/{totalLangResources} 완료
                        </span>
                    </div>
                    <div className="space-y-3">
                        {languageResources.length > 0 ? (
                            languageResources.map(resource => (
                                <Card key={resource.id} className="group hover:border-blue-200 transition-colors">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    {resource.title[0]}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-sm truncate">{resource.title}</div>
                                                    <div className="text-xs text-muted-foreground">{resource.language} · {resource.type}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 ml-2">
                                                <button
                                                    onClick={() => cycleLangStatus(resource)}
                                                    className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer transition-colors", getLangStatusColor(resource.status))}
                                                >
                                                    {getLangStatusLabel(resource.status)}
                                                </button>
                                                <div className="text-right hidden sm:block">
                                                    <div className="text-xs font-bold text-blue-600">{getLangProgress(resource)}%</div>
                                                    <Progress value={getLangProgress(resource)} className="w-16 h-1.5 mt-1" />
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => handleEditLang(resource)}>
                                                    <Edit2 className="w-3 h-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => deleteLanguageResource(resource.id)}>
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                                    아직 등록된 외국어 학습 자료가 없습니다.
                                    <Button variant="link" className="block mx-auto mt-2" onClick={() => { setGoalType('language'); openNew(); }}>
                                        학습 자료 추가하기
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Certification Track */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="font-bold flex items-center gap-2">
                            <Award className="w-5 h-5 text-orange-600" /> 자격증 취득 로드맵
                        </h3>
                        <span className="text-xs text-muted-foreground">
                            {acquiredCerts}/{totalCerts} 취득
                        </span>
                    </div>
                    <div className="space-y-3">
                        {certificates.length > 0 ? (
                            certificates.map(cert => {
                                const dDay = cert.status === 'studying' ? getDDay(cert.date) : null;
                                return (
                                    <Card key={cert.id} className="group hover:border-orange-200 transition-colors">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                                        cert.status === 'acquired'
                                                            ? "bg-green-100 text-green-600"
                                                            : cert.status === 'studying'
                                                                ? "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white"
                                                                : "bg-gray-100 text-gray-400"
                                                    )}>
                                                        {cert.status === 'acquired'
                                                            ? <CheckCircle2 className="w-5 h-5" />
                                                            : cert.status === 'studying'
                                                                ? <GraduationCap className="w-5 h-5" />
                                                                : <AlertCircle className="w-5 h-5" />
                                                        }
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className={cn("font-bold text-sm truncate", cert.status === 'acquired' && "line-through text-muted-foreground")}>{cert.name}</div>
                                                        <div className="text-xs text-muted-foreground">{cert.issuer}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                                    {dDay && (
                                                        <span className="text-xs font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg hidden sm:inline">{dDay}</span>
                                                    )}
                                                    <button
                                                        onClick={() => cycleCertStatus(cert)}
                                                        className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer transition-colors", getStatusColor(cert.status))}
                                                    >
                                                        {getStatusLabel(cert.status)}
                                                    </button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => handleEditCert(cert)}>
                                                        <Edit2 className="w-3 h-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => deleteCertificate(cert.id)}>
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                                    <Award className="w-8 h-8 mx-auto mb-2 text-orange-300" />
                                    아직 등록된 자격증 목표가 없습니다.
                                    <Button variant="link" className="block mx-auto mt-2" onClick={() => { setGoalType('certificate'); openNew(); }}>
                                        자격증 목표 추가하기
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCertId || editingLangId ? '학습 목표 수정' : '새 학습 목표 추가'}
                        </DialogTitle>
                    </DialogHeader>

                    <Tabs value={goalType} onValueChange={(v: any) => setGoalType(v)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="certificate">자격증</TabsTrigger>
                            <TabsTrigger value="language">외국어</TabsTrigger>
                        </TabsList>

                        <div className="py-4 space-y-4">
                            <div className="grid gap-2">
                                <Label>목표 명칭</Label>
                                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={goalType === 'certificate' ? '예: 정보처리기사' : '예: 비즈니스 회화 마스터'} />
                            </div>

                            {goalType === 'certificate' && (
                                <>
                                    <div className="grid gap-2">
                                        <Label>시행 기관</Label>
                                        <Input value={issuer} onChange={e => setIssuer(e.target.value)} placeholder="예: 한국산업인력공단" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>시험 예정일 (선택)</Label>
                                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                                    </div>
                                </>
                            )}

                            {goalType === 'language' && (
                                <>
                                    <div className="grid gap-2">
                                        <Label>언어 종류</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={langType}
                                            onChange={e => setLangType(e.target.value)}
                                        >
                                            <option value="English">영어</option>
                                            <option value="Japanese">일본어</option>
                                            <option value="Chinese">중국어</option>
                                            <option value="Spanish">스페인어</option>
                                            <option value="French">프랑스어</option>
                                            <option value="German">독일어</option>
                                            <option value="Other">기타</option>
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>자료 유형</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={langResourceType}
                                            onChange={e => setLangResourceType(e.target.value as LanguageResource['type'])}
                                        >
                                            <option value="book">교재</option>
                                            <option value="video">영상</option>
                                            <option value="lecture">강의</option>
                                            <option value="article">기사/글</option>
                                            <option value="other">기타</option>
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>URL (선택)</Label>
                                        <Input value={langUrl} onChange={e => setLangUrl(e.target.value)} placeholder="https://..." />
                                    </div>
                                </>
                            )}
                            <div className="grid gap-2">
                                <div className="flex justify-between items-center">
                                    <Label>학습 메모 / AI 로드맵</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleGeneratePlan}
                                        disabled={!title || isPlanning}
                                        className="h-6 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2"
                                    >
                                        {isPlanning ? (
                                            <>
                                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                계획 생성 중...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-3 h-3 mr-1" />
                                                AI 학습 플랜 생성
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <Textarea
                                    value={memo}
                                    onChange={e => setMemo(e.target.value)}
                                    placeholder="세부 목표나 학습 계획을 입력하거나, AI로 자동 생성해보세요."
                                    className="min-h-[120px] resize-none"
                                />
                            </div>
                        </div>
                    </Tabs>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
                        <Button onClick={handleSave}>
                            {editingCertId || editingLangId ? '수정' : '추가'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

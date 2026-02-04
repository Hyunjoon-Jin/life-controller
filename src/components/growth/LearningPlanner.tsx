'use client';

import { useData } from '@/context/DataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Award, Target, Calendar, Plus, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { format, addDays, isAfter } from 'date-fns';
import { ko } from 'date-fns/locale';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { generateId } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export interface LearningPlannerProps {
    onNavigate?: (tab: string) => void;
}

export function LearningPlanner({ onNavigate }: LearningPlannerProps) {
    const { certificates = [], languageResources = [], tasks = [], addCertificate, addLanguageResource } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [goalType, setGoalType] = useState<'certificate' | 'language'>('certificate');
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [issuer, setIssuer] = useState(''); // for cert
    const [langType, setLangType] = useState('English'); // for language

    // Upcoming exams (certificates and language tests from tasks/certificates)
    const upcomingExams = [
        ...certificates.filter(c => c.date && isAfter(new Date(c.date), new Date())),
        ...tasks.filter(t => (t.title.includes('시험') || t.title.includes('Test')) && !t.completed && t.dueDate)
    ].sort((a: any, b: any) => new Date(a.date || a.dueDate).getTime() - new Date(b.date || b.dueDate).getTime());

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">학습 플래너</h2>
                    <p className="text-muted-foreground">목표 달성을 위한 체계적인 학습 관리</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => onNavigate?.('calendar')}>
                        <Calendar className="w-4 h-4 mr-2" /> 스케줄러
                    </Button>
                    <Button onClick={() => {
                        setTitle('');
                        setDate('');
                        setIssuer('');
                        setIsDialogOpen(true);
                    }}>
                        <Plus className="w-4 h-4 mr-2" /> 새 목표 추가
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Global Progress */}
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Target className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">Lv. 12</span>
                        </div>
                        <div className="text-2xl font-bold mb-1">성장 게이지</div>
                        <div className="text-indigo-100 text-sm mb-4">이번 달 목표의 65%를 달성했습니다.</div>
                        <Progress value={65} className="h-2 bg-indigo-900/20" />
                    </CardContent>
                </Card>

                {/* Exam Countdown */}
                <Card className="md:col-span-2 border-none shadow-sm bg-slate-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-500" /> D-Day 카운트다운
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
                        {upcomingExams.length > 0 ? (
                            upcomingExams.slice(0, 3).map((exam: any, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl min-w-[200px] shadow-sm border border-slate-100">
                                    <div className="text-xs text-muted-foreground font-medium mb-1">{exam.title || exam.name}</div>
                                    <div className="text-2xl font-black text-slate-800">D-7</div>
                                    <div className="text-[10px] text-orange-500 font-bold mt-1">
                                        {format(new Date(exam.date || exam.dueDate), 'MM월 dd일 (eee)', { locale: ko })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-muted-foreground italic py-4">예정된 시험 일정이 없습니다.</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Language Learning Track */}
                <div className="space-y-4">
                    <h3 className="font-bold flex items-center gap-2 px-1">
                        <BookOpen className="w-5 h-5 text-blue-600" /> 외국어 학습 현황
                    </h3>
                    <div className="space-y-3">
                        {languageResources.slice(0, 4).map(resource => (
                            <Card key={resource.id} className="group hover:border-blue-200 transition-colors cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                {resource.title[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">{resource.title}</div>
                                                <div className="text-xs text-muted-foreground">{resource.type}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-blue-600">진행도 40%</div>
                                            <Progress value={40} className="w-20 h-1.5 mt-1" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Certification Track */}
                <div className="space-y-4">
                    <h3 className="font-bold flex items-center gap-2 px-1">
                        <Award className="w-5 h-5 text-orange-600" /> 자격증 취득 로드맵
                    </h3>
                    <div className="space-y-3">
                        {certificates.slice(0, 4).map(cert => (
                            <Card key={cert.id} className="group hover:border-orange-200 transition-colors cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">{cert.name}</div>
                                                <div className="text-xs text-muted-foreground">{cert.issuer}</div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>새 학습 목표 추가</DialogTitle>
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
                            )}
                        </div>
                    </Tabs>

                    <DialogFooter>
                        <Button onClick={() => {
                            if (!title) return;
                            if (goalType === 'certificate') {
                                addCertificate({
                                    id: generateId(),
                                    name: title,
                                    issuer: issuer || 'Self',
                                    date: date ? new Date(date) : new Date(),
                                    status: 'studying'
                                });
                            } else {
                                addLanguageResource({
                                    id: generateId(),
                                    title: title,
                                    type: 'book', // Default to book or add selector if needed
                                    language: langType,
                                    status: 'tostudy',
                                    url: '',
                                    category: 'General',
                                    createdAt: new Date()
                                });
                            }
                            setIsDialogOpen(false);
                        }}>
                            목표 추가
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

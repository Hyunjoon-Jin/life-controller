'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/context/DataProvider';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dumbbell, Plus, Trash2, Calendar as CalendarIcon, Timer, Trophy, Footprints, Target, Activity, TrendingUp, Search, ChevronDown, Check, Flower2 } from 'lucide-react';
import { format } from 'date-fns';
import { ExerciseCategory, ExerciseSession } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ExerciseAnalysis } from './ExerciseAnalysis';
import { ActiveSessionCard } from './ActiveSessionCard';

const EXERCISE_TYPES = [
    // Weight / Fitness
    { name: '벤치프레스', category: 'weight' },
    { name: '스쿼트', category: 'weight' },
    { name: '데드리프트', category: 'weight' },
    { name: '오버헤드 프레스', category: 'weight' },
    { name: '덤벨 컬', category: 'weight' },
    { name: '바벨 컬', category: 'weight' },
    { name: '레그 익스텐션', category: 'weight' },
    { name: '레그 컬', category: 'weight' },
    { name: '레그 프레스', category: 'weight' },
    { name: '랫 풀 다운', category: 'weight' },
    { name: '시티드 로우', category: 'weight' },
    { name: '풀업 (턱걸이)', category: 'weight' },
    { name: '딥스', category: 'weight' },
    { name: '사이드 레터럴 레이즈', category: 'weight' },
    { name: '런지', category: 'weight' },
    { name: '크로스핏', category: 'weight' },
    { name: '맨몸운동', category: 'weight' },
    { name: '케틀벨 스윙', category: 'weight' },
    // Fitness (Yoga/Pilates)
    { name: '요가', category: 'fitness' },
    { name: '필라테스', category: 'fitness' },
    { name: '스트레칭', category: 'fitness' },
    { name: '플랭크', category: 'fitness' },
    { name: '버피 테스트', category: 'fitness' },
    { name: '폼롤러', category: 'fitness' },
    // Cardio
    { name: '러닝', category: 'cardio' },
    { name: '트레드밀 (러닝머신)', category: 'cardio' },
    { name: '인터벌 러닝', category: 'cardio' },
    { name: '수영', category: 'cardio' },
    { name: '자전거 (라이딩)', category: 'cardio' },
    { name: '실내 자전거 (사이클)', category: 'cardio' },
    { name: '등산', category: 'cardio' },
    { name: '계단 오르기 (천국의 계단)', category: 'cardio' },
    { name: '줄넘기', category: 'cardio' },
    { name: '산책 / 걷기', category: 'cardio' },
    // Sport
    { name: '축구', category: 'sport' },
    { name: '풋살', category: 'sport' },
    { name: '농구', category: 'sport' },
    { name: '야구', category: 'sport' },
    { name: '배구', category: 'sport' },
    { name: '배드민턴', category: 'sport' },
    { name: '테니스', category: 'sport' },
    { name: '탁구', category: 'sport' },
    { name: '스쿼시', category: 'sport' },
    { name: '골프', category: 'sport' },
    { name: '볼링', category: 'sport' },
    { name: '양궁', category: 'sport' },
    { name: '복싱/격투기', category: 'sport' },
    { name: '주짓수', category: 'sport' },
    { name: '클라이밍', category: 'sport' },
    { name: '스키 / 보드', category: 'sport' },
    { name: '서핑', category: 'sport' },
] as const;

const TARGET_PARTS = ['가슴', '등', '하체', '어깨', '팔', '복근', '전신'];

export function ExerciseLog() {
    const { exerciseSessions, addExerciseSession, deleteExerciseSession } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Active Workout State
    const [isWorkoutActive, setIsWorkoutActive] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Form State
    const [type, setType] = useState('');
    const [category, setCategory] = useState<ExerciseCategory>('weight');
    const [memo, setMemo] = useState('');
    const [targetPart, setTargetPart] = useState('');

    // Duration Split State
    const [durationMin, setDurationMin] = useState('');
    const [durationSec, setDurationSec] = useState('');

    // Specialized State
    const [distance, setDistance] = useState(''); // km
    const [result, setResult] = useState(''); // Text Result
    const [score, setScore] = useState(''); // Numeric Score
    const [count, setCount] = useState(''); // Laps/Count

    // Sets State (Weight)
    const [sets, setSets] = useState<{ id: string; setNumber: number; weight: number; reps: number; completed: boolean }[]>([]);
    const [tempWeight, setTempWeight] = useState('');
    const [tempReps, setTempReps] = useState('');

    // Batch Entry State for Active Mode
    const [pendingSessions, setPendingSessions] = useState<ExerciseSession[]>([]);

    // Timer Logic
    useMemo(() => {
        let interval: NodeJS.Timeout;
        if (isWorkoutActive && startTime) {
            interval = setInterval(() => {
                const now = new Date();
                setElapsedTime(Math.floor((now.getTime() - startTime.getTime()) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isWorkoutActive, startTime]);

    const formatElapsedTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const startWorkout = () => {
        setIsWorkoutActive(true);
        setStartTime(new Date());
        setElapsedTime(0);
        setPendingSessions([]);
    };

    const finishWorkout = () => {
        if (pendingSessions.length === 0) {
            if (!confirm('기록된 운동이 없습니다. 운동을 종료하시겠습니까?')) return;
        }

        pendingSessions.forEach(session => addExerciseSession(session));

        setIsWorkoutActive(false);
        setStartTime(null);
        setPendingSessions([]);
        alert('운동이 기록되었습니다! 오늘도 고생하셨습니다. 💪');
    };

    const updatePendingSession = (updatedSession: ExerciseSession) => {
        setPendingSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    };

    const handleDeletePending = (id: string) => {
        setPendingSessions(pendingSessions.filter(s => s.id !== id));
    };


    // Add Dialog Logic
    const [addStep, setAddStep] = useState<'category' | 'type' | 'input'>('category');

    const openAddDialog = () => {
        setAddStep('category');
        resetForm();
        setIsDialogOpen(true);
    };

    const handleCategorySelect = (cat: ExerciseCategory) => {
        setCategory(cat);
        setAddStep('type');
    };

    const handleTypeChoose = (t: string) => {
        setType(t);
        setAddStep('input');
    };

    const handleQuickAdd = () => {
        handleAddToPending(true); // pass true to skip validation (allow empty sets)
        setIsDialogOpen(false);
    };

    const handleAddToPending = (skipSetValidation = false) => {
        if (!type) return;

        const mins = parseInt(durationMin) || 0;
        const secs = parseInt(durationSec) || 0;
        const totalDuration = mins + (secs / 60);

        const session: ExerciseSession = {
            id: generateId(),
            date: new Date(),
            type,
            category,
            duration: totalDuration,
            memo
        };

        if (category === 'weight') {
            session.sets = sets;
            if (targetPart) session.targetPart = targetPart;
            // validation skipped or check if needed
        } else if (category === 'cardio') {
            session.distance = parseFloat(distance) || 0;
            if (count) session.count = parseInt(count);
        } else if (category === 'sport') {
            session.result = result;
            if (score) session.score = parseFloat(score);
        }

        setPendingSessions([...pendingSessions, session]);
        resetForm();
    };

    const handleSaveAll = () => {
        pendingSessions.forEach(session => addExerciseSession(session));
        setPendingSessions([]);
        setIsDialogOpen(false);
    };

    const handleAddSet = () => {
        if (!tempWeight || !tempReps) return;
        setSets([
            ...sets,
            {
                id: generateId(),
                setNumber: sets.length + 1,
                weight: parseFloat(tempWeight) || 0,
                reps: parseInt(tempReps) || 0,
                completed: true
            }
        ]);
        setTempReps('');
    };

    const handleDeleteSet = (id: string) => {
        const newSets = sets.filter(s => s.id !== id).map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        setSets(newSets);
    };

    const resetForm = () => {
        setType('');
        setCategory('weight');
        setMemo('');
        setTargetPart('');
        setDurationMin('');
        setDurationSec('');
        setDistance('');
        setResult('');
        setScore('');
        setCount('');
        setSets([]);
        setTempWeight('');
        setTempReps('');
        setSearchQuery('');
    };

    const resetAll = () => {
        resetForm();
        setPendingSessions([]);
    };

    // Filter Logic
    const categoryTypes = useMemo(() => {
        return EXERCISE_TYPES.filter(t => t.category === category);
    }, [category]);

    const filteredCategoryTypes = useMemo(() => {
        if (!searchQuery) return categoryTypes;
        return categoryTypes.filter(t => t.name.includes(searchQuery));
    }, [categoryTypes, searchQuery]);

    const filteredTypes = useMemo(() => {
        if (!searchQuery) return EXERCISE_TYPES;
        return EXERCISE_TYPES.filter(t => t.name.includes(searchQuery));
    }, [searchQuery]);


    const sortedSessions = exerciseSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const availableTypes = Array.from(new Set(exerciseSessions.map(s => s.type)));
    // Trend Logic
    const mostRecentType = sortedSessions[0]?.type || '웨이트 트레이닝';
    const [trendType, setTrendType] = useState(mostRecentType);

    useMemo(() => {
        if (!exerciseSessions.find(s => s.type === trendType) && sortedSessions.length > 0) {
            setTrendType(sortedSessions[0].type);
        }
    }, [exerciseSessions, trendType, sortedSessions]);

    const trendData = useMemo(() => {
        return exerciseSessions
            .filter(s => s.type === trendType)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(s => {
                const pt: any = { date: format(new Date(s.date), 'MM/dd') };
                if (s.category === 'weight') {
                    const max = s.sets?.reduce((m, c) => Math.max(m, c.weight), 0) || 0;
                    pt.value = max;
                    pt.label = '최대 무게(kg)';
                } else if (s.category === 'cardio') {
                    if (s.distance) { pt.value = s.distance; pt.label = '거리(km)'; }
                    else if (s.count) { pt.value = s.count; pt.label = '횟수/랩'; }
                    else { pt.value = s.duration; pt.label = '시간(분)'; }
                } else if (s.category === 'sport') {
                    if (s.score !== undefined) { pt.value = s.score; pt.label = '점수'; }
                    else { pt.value = s.duration || 0; pt.label = '시간(분)'; }
                } else {
                    pt.value = s.duration || 0; pt.label = '시간(분)';
                }
                return pt;
            });
    }, [exerciseSessions, trendType]);

    const formatDuration = (min: number) => {
        const m = Math.floor(min);
        const s = Math.round((min - m) * 60);
        if (m > 0 && s > 0) return `${m}분 ${s}초`;
        if (m > 0) return `${m}분`;
        if (s > 0) return `${s}초`;
        return '0분';
    };

    return (
        <div className="h-full flex flex-col p-6 overflow-hidden max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <Tabs defaultValue="log" className="w-[300px]">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="log">기록 & 추이</TabsTrigger>
                        <TabsTrigger value="analysis">상세 분석</TabsTrigger>
                    </TabsList>
                </Tabs>
                {!isWorkoutActive && (
                    <Button onClick={() => { resetAll(); setIsDialogOpen(true); }} variant="outline" className="hidden md:flex">
                        <Plus className="w-4 h-4 mr-2" /> 수동 기록
                    </Button>
                )}
            </div>

            <Tabs defaultValue="log" className="flex-1 overflow-hidden flex flex-col">
                <TabsContent value="log" className="flex-1 overflow-hidden flex flex-col mt-0">
                    {isWorkoutActive ? (
                        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="bg-primary/5 p-6 flex flex-col items-center justify-center shrink-0 border-b">
                                <div className="text-sm font-bold text-primary mb-1 tracking-wider uppercase">Workout in Progress</div>
                                <div className="text-5xl font-mono font-bold text-foreground tabular-nums tracking-tight">
                                    {formatElapsedTime(elapsedTime)}
                                </div>
                                <div className="mt-4 flex gap-3 w-full max-w-md">
                                    <Button onClick={openAddDialog} className="flex-1 bg-primary hover:bg-primary/90 py-6 text-lg shadow-md transition-transform active:scale-95">
                                        <Plus className="w-5 h-5 mr-2" /> 운동 추가
                                    </Button>
                                    <Button onClick={finishWorkout} variant="destructive" className="flex-1 py-6 text-lg shadow-md transition-transform active:scale-95">
                                        종료
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-muted/10">
                                {pendingSessions.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-40">
                                        <Dumbbell className="w-20 h-20 mb-4" />
                                        <p className="text-lg font-medium">운동을 추가해주세요</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-w-3xl mx-auto">
                                        {pendingSessions.map((session, idx) => (
                                            <ActiveSessionCard
                                                key={session.id}
                                                index={idx}
                                                session={session}
                                                onUpdate={updatePendingSession}
                                                onDelete={handleDeletePending}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">오늘도 성장해볼까요? 🔥</h2>
                                    <p className="text-blue-100 opacity-90">꾸준함이 가장 빠른 지름길입니다.</p>
                                </div>
                                <Button onClick={startWorkout} size="lg" className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-bold px-8 py-6 text-lg shadow-xl transition-all hover:scale-105 rounded-xl">
                                    <Timer className="w-6 h-6 mr-2" /> 운동 시작하기
                                </Button>
                            </div>

                            {availableTypes.length > 0 && trendData.length >= 2 && (
                                <Card className="border-none shadow-md bg-white overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="p-6 border-b flex justify-between items-center bg-muted/5">
                                            <h3 className="font-bold text-lg flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                                성장 그래프
                                            </h3>
                                            <select
                                                className="bg-transparent border-none text-sm font-medium cursor-pointer focus:ring-0 outline-none text-muted-foreground hover:text-foreground"
                                                value={trendType}
                                                onChange={(e) => setTrendType(e.target.value)}
                                            >
                                                {availableTypes.map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="h-[250px] w-full p-4">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={trendData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                                                    <YAxis fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} width={30} />
                                                    <RechartsTooltip />
                                                    <Line type="monotone" dataKey="value" name={trendData[0]?.label || '기록'} stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <div>
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-green-600" /> 최근 활동
                                </h3>
                                {sortedSessions.length === 0 ? (
                                    <div className="text-center py-10 text-muted-foreground bg-muted/10 rounded-xl border-dashed border-2">
                                        기록된 활동이 없습니다.
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {sortedSessions.slice(0, 5).map(session => (
                                            <Card key={session.id} className="hover:shadow-md transition-all cursor-pointer border-l-4" style={{ borderLeftColor: session.category === 'weight' ? '#22c55e' : session.category === 'cardio' ? '#3b82f6' : '#f97316' }}>
                                                <CardContent className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-muted-foreground font-medium">{format(new Date(session.date), 'MM.dd HH:mm')}</span>
                                                            <span className="font-bold text-lg">{session.type}</span>
                                                        </div>
                                                        <div className="h-8 w-px bg-muted" />
                                                        <div className="text-sm text-muted-foreground">
                                                            {session.category === 'weight' ? `${session.sets?.length || 0} Sets` : `${Math.floor(session.duration || 0)} mins`}
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" onClick={() => deleteExerciseSession(session.id)} className="text-muted-foreground hover:text-red-500">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="analysis" className="flex-1 overflow-y-auto custom-scrollbar mt-0">
                    <ExerciseAnalysis sessions={exerciseSessions} />
                </TabsContent>
            </Tabs>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {addStep === 'category' && "어떤 운동을 하셨나요?"}
                            {addStep === 'type' && "세부 종목 선택"}
                            {addStep === 'input' && `${type} 기록`}
                        </DialogTitle>
                    </DialogHeader>

                    {addStep === 'category' && (
                        <div className="grid grid-cols-2 gap-4 py-4">
                            {[
                                { id: 'weight', label: '웨이트', icon: Dumbbell, color: 'bg-green-100 text-green-700 hover:bg-green-200' },
                                { id: 'cardio', label: '유산소', icon: Footprints, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
                                { id: 'sport', label: '스포츠', icon: Trophy, color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
                                { id: 'fitness', label: '피트니스/맨몸', icon: Activity, color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleCategorySelect(item.id as ExerciseCategory)}
                                    className={cn("flex flex-col items-center justify-center p-6 rounded-2xl transition-all", item.color)}
                                >
                                    <item.icon className="w-10 h-10 mb-2" />
                                    <span className="font-bold text-lg">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {addStep === 'type' && (
                        <div className="py-2 h-[300px] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-2">
                                {filteredCategoryTypes.map(t => (
                                    <Button key={t.name} variant="outline" onClick={() => handleTypeChoose(t.name)} className="justify-start h-auto py-3">
                                        {t.name}
                                    </Button>
                                ))}
                            </div>
                            <Button variant="ghost" className="w-full mt-4" onClick={() => setAddStep('category')}>
                                <ChevronDown className="rotate-90 mr-2 w-4 h-4" /> 뒤로가기
                            </Button>
                        </div>
                    )}

                    {addStep === 'input' && (
                        <div className="py-4 space-y-4">
                            {category === 'weight' && (
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-1">
                                        {TARGET_PARTS.map(part => (
                                            <button key={part} onClick={() => setTargetPart(part)} className={cn("text-xs px-2 py-1 rounded border transition-colors", targetPart === part ? "bg-green-500 text-white border-green-500" : "bg-white hover:bg-gray-50")}>
                                                {part}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="text-sm text-muted-foreground p-3 bg-muted/40 rounded-lg">
                                        세부 세트 기록은 목록에서 <b>카드</b>를 통해 추가할 수 있습니다.
                                    </div>
                                </div>
                            )}

                            {category !== 'weight' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label>시간(분)</Label>
                                            <Input type="number" value={durationMin} onChange={e => setDurationMin(e.target.value)} placeholder="0" />
                                        </div>
                                        {category === 'cardio' && (
                                            <div className="space-y-1">
                                                <Label>거리(km)</Label>
                                                <Input type="number" value={distance} onChange={e => setDistance(e.target.value)} placeholder="0" />
                                            </div>
                                        )}
                                    </div>

                                    {category === 'sport' && (
                                        <div className="space-y-1">
                                            <Label>점수 / 결과</Label>
                                            <Input value={result} onChange={e => setResult(e.target.value)} placeholder="승리 / 3:1 / 100점 등" />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2 justify-end mt-4 pt-4 border-t">
                                <Button variant="ghost" onClick={() => setAddStep('type')}>뒤로</Button>
                                <Button onClick={handleQuickAdd} className="bg-primary">
                                    추가하기
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

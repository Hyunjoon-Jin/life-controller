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

// Expanded Types with Detailed Weight Training
const EXERCISE_TYPES = [
    // Weight / Fitness
    { name: '벤치프레스', category: 'weight' },
    { name: '스쿼트', category: 'weight' },
    { name: '데드리프트', category: 'weight' },
    { name: '오버헤드 프레스', category: 'weight' },
    { name: '덤벨 컬', category: 'weight' },
    { name: '레그 익스텐션', category: 'weight' },
    { name: '랫 풀 다운', category: 'weight' },
    { name: '풀업 (턱걸이)', category: 'weight' },
    { name: '크로스핏', category: 'weight' },
    { name: '맨몸운동', category: 'weight' },
    // Fitness (Yoga/Pilates)
    { name: '요가', category: 'fitness' },
    { name: '필라테스', category: 'fitness' },
    { name: '스트레칭', category: 'fitness' },
    // Cardio
    { name: '러닝', category: 'cardio' },
    { name: '수영', category: 'cardio' },
    { name: '자전거', category: 'cardio' },
    { name: '등산', category: 'cardio' },
    { name: '줄넘기', category: 'cardio' },
    // Sport
    { name: '축구', category: 'sport' },
    { name: '농구', category: 'sport' },
    { name: '배드민턴', category: 'sport' },
    { name: '테니스', category: 'sport' },
    { name: '탁구', category: 'sport' },
    { name: '야구', category: 'sport' },
    { name: '골프', category: 'sport' },
    { name: '볼링', category: 'sport' },
    { name: '양궁', category: 'sport' },
    { name: '복싱/격투기', category: 'sport' },
] as const;

const TARGET_PARTS = ['가슴', '등', '하체', '어깨', '팔', '복근', '전신'];

export function ExerciseLog() {
    const { exerciseSessions, addExerciseSession, deleteExerciseSession } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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

    const filteredTypes = useMemo(() => {
        if (!searchQuery) return EXERCISE_TYPES;
        return EXERCISE_TYPES.filter(t => t.name.includes(searchQuery));
    }, [searchQuery]);

    const handleTypeSelect = (t: string, cat: string) => {
        setType(t);
        setCategory(cat as ExerciseCategory);
        setIsTypeOpen(false);
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

    const handleSave = () => {
        if (!type) return;

        // Calculate total minutes (float)
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
        } else if (category === 'cardio') {
            session.distance = parseFloat(distance) || 0;
            if (count) session.count = parseInt(count);
        } else if (category === 'sport') {
            session.result = result;
            if (score) session.score = parseFloat(score);
        }
        // fitness falls through (just duration & memo)

        addExerciseSession(session);
        setIsDialogOpen(false);
        resetForm();
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

    const sortedSessions = exerciseSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
                    // Start with Max Weight, but maybe Total Volume is better for some? Default to Max Weight
                    const max = s.sets?.reduce((m, c) => Math.max(m, c.weight), 0) || 0;
                    pt.value = max;
                    pt.label = '최대 무게(kg)';
                } else if (s.category === 'cardio') {
                    if (s.distance) {
                        pt.value = s.distance;
                        pt.label = '거리(km)';
                    } else if (s.count) {
                        pt.value = s.count;
                        pt.label = '횟수/랩';
                    } else {
                        pt.value = s.duration;
                        pt.label = '시간(분)';
                    }
                } else if (s.category === 'sport') {
                    if (s.score !== undefined) {
                        pt.value = s.score;
                        pt.label = '점수';
                    } else {
                        pt.value = s.duration || 0;
                        pt.label = '시간(분)';
                    }
                } else { // fitness
                    pt.value = s.duration || 0;
                    pt.label = '시간(분)';
                }
                return pt;
            });
    }, [exerciseSessions, trendType]);

    const availableTypes = Array.from(new Set(exerciseSessions.map(s => s.type)));

    // Formatting duration
    const formatDuration = (min: number) => {
        const m = Math.floor(min);
        const s = Math.round((min - m) * 60);
        if (m > 0 && s > 0) return `${m}분 ${s}초`;
        if (m > 0) return `${m}분`;
        if (s > 0) return `${s}초`;
        return '0분';
    };

    return (
        <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-end mb-2">
                <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> 운동 기록하기
                </Button>
            </div>

            {/* Growth Chart */}
            {availableTypes.length > 0 && trendData.length >= 2 && (
                <Card className="border-none shadow-sm bg-gradient-to-br from-white to-blue-50/30">
                    <CardContent className="p-4 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                <select
                                    className="bg-transparent border-none font-bold text-lg cursor-pointer focus:ring-0 outline-none hover:text-blue-600 transition-colors"
                                    value={trendType}
                                    onChange={(e) => setTrendType(e.target.value)}
                                >
                                    {availableTypes.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                                <span className="text-muted-foreground text-sm font-normal">성장 추이</span>
                            </h3>
                        </div>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
                                    <YAxis fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} width={30} domain={['auto', 'auto']} />
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ color: '#64748b', marginBottom: '0.25rem' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        name={trendData[0]?.label || '기록'}
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                        isAnimationActive={true}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* List */}
            {sortedSessions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                    <Dumbbell className="w-16 h-16 mb-4" />
                    <p>아직 운동 기록이 없습니다. 시작해볼까요?</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedSessions.map(session => (
                        <Card key={session.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CalendarIcon className="w-3 h-3" />
                                        {format(new Date(session.date), 'yyyy.MM.dd HH:mm')}
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-muted-foreground hover:text-red-400" onClick={() => deleteExerciseSession(session.id)}>
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded text-white",
                                        session.category === 'cardio' ? "bg-blue-400" :
                                            session.category === 'sport' ? "bg-orange-400" :
                                                session.category === 'fitness' ? "bg-purple-400" : "bg-green-400"
                                    )}>
                                        {session.category === 'cardio' ? '유산소' :
                                            session.category === 'sport' ? '스포츠' :
                                                session.category === 'fitness' ? '피트니스' : '웨이트'}
                                    </span>
                                    <h3 className="text-xl font-bold text-primary">{session.type}</h3>
                                </div>

                                {session.targetPart && (
                                    <div className="text-xs font-bold text-green-600 mb-2 bg-green-50 inline-block px-1.5 py-0.5 rounded">
                                        타겟: {session.targetPart}
                                    </div>
                                )}

                                {session.category === 'weight' && session.sets && (
                                    <div className="space-y-1 mb-3">
                                        <div className="text-xs font-medium text-muted-foreground flex justify-between border-b pb-1">
                                            <span>Set</span>
                                            <span>kg</span>
                                            <span>Reps</span>
                                        </div>
                                        {session.sets.slice(0, 5).map((set) => (
                                            <div key={set.id} className="flex justify-between text-sm">
                                                <span className="text-muted-foreground font-mono w-4">{set.setNumber}</span>
                                                <span className="font-bold">{set.weight}</span>
                                                <span>{set.reps}</span>
                                            </div>
                                        ))}
                                        {session.sets.length > 5 && (
                                            <div className="text-xs text-center text-muted-foreground pt-1">
                                                + {session.sets.length - 5} more sets
                                            </div>
                                        )}
                                        <div className="border-t pt-1 mt-1 text-xs text-right font-medium text-blue-600">
                                            Total: {session.sets.reduce((acc, curr) => acc + (curr.weight * curr.reps), 0).toLocaleString()} kg
                                        </div>
                                    </div>
                                )}

                                {(session.category === 'cardio' || session.category === 'fitness') && (
                                    <div className={cn(
                                        "grid gap-2 mb-3",
                                        session.category === 'cardio' ? "grid-cols-2" : "grid-cols-1"
                                    )}>
                                        <div className="bg-blue-50 p-2 rounded-lg text-center">
                                            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                                <Timer className="w-3 h-3" /> 시간
                                            </div>
                                            <div className="font-bold text-blue-700">{formatDuration(session.duration)}</div>
                                        </div>
                                        {session.category === 'cardio' && (
                                            <div className="bg-blue-50 p-2 rounded-lg text-center">
                                                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                                    {session.type === '수영' ? <Activity className="w-3 h-3" /> : <Footprints className="w-3 h-3" />}
                                                    {session.type === '수영' ? '랩/횟수' : '거리'}
                                                </div>
                                                <div className="font-bold text-blue-700">
                                                    {session.type === '수영' && session.count
                                                        ? `${session.count} laps`
                                                        : `${session.distance || 0} km`
                                                    }
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {session.category === 'sport' && (
                                    <div className="space-y-2 mb-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Timer className="w-4 h-4 text-orange-500" />
                                            <span>{formatDuration(session.duration)} 플레이</span>
                                        </div>
                                        {(session.score !== undefined && session.score !== null) && (
                                            <div className="flex items-center gap-2 text-sm font-bold bg-orange-50 p-2 rounded text-orange-700">
                                                <Target className="w-4 h-4" />
                                                <span>점수: {session.score}</span>
                                            </div>
                                        )}
                                        {session.result && !session.score && (
                                            <div className="flex items-center gap-2 text-sm font-bold bg-orange-50 p-2 rounded text-orange-700">
                                                <Trophy className="w-4 h-4" />
                                                {session.result}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {session.memo && (
                                    <p className="text-sm bg-muted/40 p-2 rounded-md text-muted-foreground">
                                        {session.memo}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>운동 기록 추가</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>운동 종류</Label>
                            <Popover open={isTypeOpen} onOpenChange={setIsTypeOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={isTypeOpen}
                                        className="justify-between w-full"
                                    >
                                        {type || "운동 종목을 선택하세요"}
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-[460px]" align="start">
                                    <div className="p-2 border-b">
                                        <div className="flex items-center px-3 py-1 border rounded-md">
                                            <Search className="mr-2 h-4 w-4 opacity-50" />
                                            <input
                                                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                                                placeholder="운동 검색..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto p-2">
                                        {['weight', 'fitness', 'cardio', 'sport'].map(cat => {
                                            const items = filteredTypes.filter(t => t.category === cat);
                                            if (items.length === 0) return null;
                                            return (
                                                <div key={cat} className="mb-2 last:mb-0">
                                                    <div className={cn(
                                                        "px-2 py-1.5 text-xs font-bold rounded mb-1",
                                                        cat === 'weight' ? "text-green-600 bg-green-50" :
                                                            cat === 'fitness' ? "text-purple-600 bg-purple-50" :
                                                                cat === 'cardio' ? "text-blue-600 bg-blue-50" : "text-orange-600 bg-orange-50"
                                                    )}>
                                                        {cat === 'weight' ? '웨이트 트레이닝' :
                                                            cat === 'fitness' ? '요가 / 필라테스 / 맨몸' :
                                                                cat === 'cardio' ? '유산소 / 아웃도어' : '구기 / 스포츠'}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-1">
                                                        {items.map(t => (
                                                            <div
                                                                key={t.name}
                                                                className={cn(
                                                                    "flex items-center px-2 py-2 text-sm rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
                                                                    type === t.name && "bg-accent/50 text-accent-foreground"
                                                                )}
                                                                onClick={() => handleTypeSelect(t.name, t.category)}
                                                            >
                                                                <Check className={cn("mr-2 h-4 w-4", type === t.name ? "opacity-100" : "opacity-0")} />
                                                                {t.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {filteredTypes.length === 0 && (
                                            <div className="py-6 text-center text-sm text-muted-foreground">
                                                검색 결과가 없습니다.
                                            </div>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>
                            {!(EXERCISE_TYPES.map(t => t.name) as readonly string[]).includes(type) && type && (
                                <div className="text-xs text-muted-foreground mt-1 px-1">
                                    * 직접 입력 모드
                                </div>
                            )}
                        </div>

                        {/* Category Selector (Hidden or disabled if locked) */}
                        <div className="grid gap-2">
                            {!(EXERCISE_TYPES.map(t => t.name) as readonly string[]).includes(type) && (
                                <select
                                    className="border rounded-md text-sm px-2 py-1 w-full bg-background"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
                                >
                                    <option value="weight">분류: 웨이트</option>
                                    <option value="fitness">분류: 요가/피트니스</option>
                                    <option value="cardio">분류: 유산소</option>
                                    <option value="sport">분류: 스포츠</option>
                                </select>
                            )}
                        </div>

                        {/* Dynamic Inputs based on Category */}
                        {category === 'weight' && (
                            <div className="space-y-3 p-3 bg-muted/20 rounded-lg border">
                                <div className="flex items-center justify-between mb-2">
                                    <Label className="text-sm font-bold text-green-600">💪 세트 & 타겟</Label>
                                    <div className="flex gap-1">
                                        {TARGET_PARTS.map(part => (
                                            <button
                                                key={part}
                                                onClick={() => setTargetPart(part)}
                                                className={cn(
                                                    "text-[10px] px-2 py-1 rounded border transition-colors",
                                                    targetPart === part
                                                        ? "bg-green-500 text-white border-green-500"
                                                        : "bg-white text-muted-foreground hover:border-green-400"
                                                )}
                                            >
                                                {part}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-end gap-2">
                                    <div className="grid gap-1 flex-1">
                                        <Label className="text-xs">무게 (kg)</Label>
                                        <Input
                                            type="number"
                                            value={tempWeight}
                                            onChange={e => setTempWeight(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && document.getElementById('reps-input')?.focus()}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="grid gap-1 flex-1">
                                        <Label className="text-xs">횟수 (Reps)</Label>
                                        <Input
                                            id="reps-input"
                                            type="number"
                                            value={tempReps}
                                            onChange={e => setTempReps(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleAddSet()}
                                            placeholder="0"
                                        />
                                    </div>
                                    <Button onClick={handleAddSet} size="icon" className="shrink-0 bg-green-600 hover:bg-green-700">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="grid gap-2 mt-2">
                                    <Label className="text-xs">총 소요 시간 (선택)</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                type="number"
                                                value={durationMin}
                                                onChange={e => setDurationMin(e.target.value)}
                                                placeholder="0"
                                                className="pr-8"
                                            />
                                            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">분</span>
                                        </div>
                                        <div className="relative flex-1">
                                            <Input
                                                type="number"
                                                value={durationSec}
                                                onChange={e => setDurationSec(e.target.value)}
                                                placeholder="0"
                                                className="pr-8"
                                                max={59}
                                            />
                                            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">초</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Sets List */}
                                {sets.length > 0 && (
                                    <div className="max-h-[120px] overflow-y-auto custom-scrollbar border rounded-md bg-background">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted text-xs text-muted-foreground sticky top-0">
                                                <tr>
                                                    <th className="py-1 px-2 text-center w-10">Set</th>
                                                    <th className="py-1 px-2 text-center">kg</th>
                                                    <th className="py-1 px-2 text-center">Reps</th>
                                                    <th className="py-1 px-2 text-center w-8"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sets.map((s) => (
                                                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/10">
                                                        <td className="py-1 text-center font-mono opacity-60">{s.setNumber}</td>
                                                        <td className="py-1 text-center font-medium">{s.weight}</td>
                                                        <td className="py-1 text-center">{s.reps}</td>
                                                        <td className="py-1 text-center">
                                                            <button onClick={() => handleDeleteSet(s.id)} className="text-red-400 hover:text-red-600">
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {category === 'fitness' && (
                            <div className="space-y-3 p-3 bg-muted/20 rounded-lg border">
                                <Label className="text-sm font-bold text-purple-600 flex items-center gap-2">
                                    <Flower2 className="w-4 h-4" /> 피트니스 / 요가 상세
                                </Label>
                                <div className="grid gap-2">
                                    <Label>운동 시간</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                type="number"
                                                value={durationMin}
                                                onChange={e => setDurationMin(e.target.value)}
                                                placeholder="0"
                                                className="pr-6"
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">분</span>
                                        </div>
                                        <div className="relative flex-1">
                                            <Input
                                                type="number"
                                                value={durationSec}
                                                onChange={e => setDurationSec(e.target.value)}
                                                placeholder="0"
                                                className="pr-6"
                                                max={59}
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">초</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {category === 'cardio' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>운동 시간</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                type="number"
                                                value={durationMin}
                                                onChange={e => setDurationMin(e.target.value)}
                                                placeholder="0"
                                                className="pr-6"
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">분</span>
                                        </div>
                                        <div className="relative flex-1">
                                            <Input
                                                type="number"
                                                value={durationSec}
                                                onChange={e => setDurationSec(e.target.value)}
                                                placeholder="0"
                                                className="pr-6"
                                                max={59}
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">초</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>
                                        {type === '수영' ? '랩 / 횟수' : '이동 거리 (km)'}
                                    </Label>
                                    {type === '수영' ? (
                                        <Input
                                            type="number"
                                            value={count}
                                            onChange={e => setCount(e.target.value)}
                                            placeholder="0 laps"
                                        />
                                    ) : (
                                        <Input
                                            type="number"
                                            value={distance}
                                            onChange={e => setDistance(e.target.value)}
                                            placeholder="0.0"
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {category === 'sport' && (
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label>플레이 시간</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                type="number"
                                                value={durationMin}
                                                onChange={e => setDurationMin(e.target.value)}
                                                placeholder="0"
                                                className="pr-6"
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">분</span>
                                        </div>
                                        <div className="relative flex-1">
                                            <Input
                                                type="number"
                                                value={durationSec}
                                                onChange={e => setDurationSec(e.target.value)}
                                                placeholder="0"
                                                className="pr-6"
                                                max={59}
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">초</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>
                                        {(['골프', '볼링', '양궁'].includes(type)) ? '점수 / 스코어' : '경기 결과 / 내용'}
                                    </Label>
                                    {(['골프', '볼링', '양궁'].includes(type) || !result) ? (
                                        <Input
                                            type="number"
                                            value={score}
                                            onChange={e => setScore(e.target.value)}
                                            placeholder="점수 입력 (숫자)"
                                            className="mb-2"
                                        />
                                    ) : null}
                                    {(!['골프', '볼링', '양궁'].includes(type) || !score) && (
                                        <Input
                                            value={result}
                                            onChange={e => setResult(e.target.value)}
                                            placeholder={(['골프', '볼링'].includes(type)) ? "추가 메모 (선택)" : "예: 3:1 승리"}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label>메모 / 상세 내용</Label>
                            <Input
                                placeholder="특이사항..."
                                value={memo}
                                onChange={e => setMemo(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave} disabled={!type}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

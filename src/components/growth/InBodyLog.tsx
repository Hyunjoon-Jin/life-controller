'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/context/DataProvider';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { format, differenceInDays } from 'date-fns';
import { Plus, Trash2, Scale, Activity, TrendingUp, Ruler, Zap, Heart, Target, Calendar as CalendarIcon, ArrowRight, Camera, ScanLine, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { createWorker } from 'tesseract.js';

export function InBodyLog() {
    const { inBodyEntries, addInBodyEntry, deleteInBodyEntry, bodyCompositionGoal, setBodyCompositionGoal } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);

    // Entry Form State
    const [date, setDate] = useState<Date>(new Date());
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [skeletalMuscle, setSkeletalMuscle] = useState('');
    const [bodyFat, setBodyFat] = useState('');
    const [bodyFatPercent, setBodyFatPercent] = useState('');
    const [bmi, setBmi] = useState('');
    const [bmr, setBmr] = useState('');
    const [visceralFat, setVisceralFat] = useState('');
    const [memo, setMemo] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    // Goal Form State
    const [goalDate, setGoalDate] = useState<Date>(new Date());
    const [goalWeight, setGoalWeight] = useState('');
    const [goalMuscle, setGoalMuscle] = useState('');
    const [goalFatPercent, setGoalFatPercent] = useState('');

    const handleOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        try {
            const worker = await createWorker('kor');
            const { data: { text } } = await worker.recognize(file);
            console.log("OCR Result:", text);

            // Simple Regex Parsing (Can be improved based on actual InBody formats)
            // Weight
            const weightMatch = text.match(/(체중|Weight)\s*[:]?\s*([\d.]+)/i) || text.match(/([\d.]+)\s*(kg|Kg)\s*(체중)/); // Pattern varies
            // Let's try to find numbers near keywords.
            // Helper to find value next to keyword
            const findValue = (keywords: string[]) => {
                const lines = text.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (keywords.some(k => line.includes(k))) {
                        // Look in this line or next few
                        const context = [line, lines[i + 1], lines[i + 2]].join(' ');
                        const numbers = context.match(/[\d.]+/g);
                        if (numbers) {
                            // Find the number that looks like a value (not date or crazy high)
                            // This is heuristic.
                            // For now, let's use a simpler approach: regex on full text
                        }
                    }
                }
                return null;
            };

            // Improved Regex for standard InBody Sheet
            // Often: "체중 70.5" or "Weight 70.5 kg"
            // Use broader match: Keyword... (Number)
            const parse = (patterns: RegExp[]) => {
                for (let p of patterns) {
                    const m = text.match(p);
                    if (m && m[1]) return m[1];
                    if (m && m[2]) return m[2]; // specific group
                }
                return '';
            };

            const w = parse([/(?:체중|Weight)\s*([\d.]+)/i, /([\d.]+)\s*(?:kg)?\s*(?:체중)/]);
            const m = parse([/(?:골격근량|Skeletal Muscle Mass)\s*([\d.]+)/i]);
            const f = parse([/(?:체지방량|Body Fat Mass)\s*([\d.]+)/i]); // Fat Mass
            const p = parse([/(?:체지방률|Percent Body Fat)\s*([\d.]+)/i]); // Percent
            const b = parse([/(?:BMI|Body Mass Index)\s*([\d.]+)/i]);
            const meta = parse([/(?:기초대사량|Basal Metabolic Rate)\s*([\d]+)/i]);
            const v = parse([/(?:내장지방레벨|Visceral Fat Level)\s*([\d]+)/i]);

            if (w) setWeight(w);
            if (m) setSkeletalMuscle(m);
            if (f) setBodyFat(f);
            if (p) setBodyFatPercent(p);
            if (b) setBmi(b);
            if (meta) setBmr(meta);
            if (v) setVisceralFat(v);

            alert('이미지에서 데이터를 읽어왔습니다. 정확한지 확인해주세요!');
            await worker.terminate();
        } catch (error) {
            console.error(error);
            alert('OCR 스캔에 실패했습니다. 다시 시도하거나 직접 입력해주세요.');
        } finally {
            setIsScanning(false);
        }
    };

    const sortedEntries = (inBodyEntries || []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latestEntry = sortedEntries[sortedEntries.length - 1];

    // Initialize Goal Form
    useEffect(() => {
        if (isGoalDialogOpen && bodyCompositionGoal) {
            if (bodyCompositionGoal.targetDate) setGoalDate(new Date(bodyCompositionGoal.targetDate));
            if (bodyCompositionGoal.targetWeight) setGoalWeight(bodyCompositionGoal.targetWeight.toString());
            if (bodyCompositionGoal.targetMuscle) setGoalMuscle(bodyCompositionGoal.targetMuscle.toString());
            if (bodyCompositionGoal.targetFatPercent) setGoalFatPercent(bodyCompositionGoal.targetFatPercent.toString());
        } else if (isGoalDialogOpen && !bodyCompositionGoal) {
            // Default target date to 1 month from now
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            setGoalDate(nextMonth);
        }
    }, [isGoalDialogOpen, bodyCompositionGoal]);

    // Pre-fill height/weight for Entry Form
    useEffect(() => {
        if (isDialogOpen && latestEntry) {
            if (!height && latestEntry.height) setHeight(latestEntry.height.toString());
            // Optional: pre-fill weight or leave empty to force measurement? Let's leave weight empty.
        }
    }, [isDialogOpen, latestEntry, height]);

    // Auto-calculate BMI
    useEffect(() => {
        if (height && weight) {
            const h = parseFloat(height) / 100; // cm to m
            const w = parseFloat(weight);
            if (h > 0 && w > 0) {
                const calculatedBmi = w / (h * h);
                setBmi(calculatedBmi.toFixed(1));
            }
        }
    }, [height, weight]);

    const handleSaveEntry = () => {
        if (!weight) return;
        addInBodyEntry({
            id: generateId(),
            date: date,
            height: parseFloat(height) || undefined,
            weight: parseFloat(weight) || 0,
            skeletalMuscleMass: parseFloat(skeletalMuscle) || 0,
            bodyFatMass: parseFloat(bodyFat) || 0,
            bodyFatPercent: parseFloat(bodyFatPercent) || 0,
            bmi: parseFloat(bmi) || undefined,
            basalMetabolicRate: parseFloat(bmr) || undefined,
            visceralFatLevel: parseFloat(visceralFat) || undefined,
            memo
        });
        setIsDialogOpen(false);
        resetEntryForm();
    };

    const handleSaveGoal = () => {
        setBodyCompositionGoal({
            targetDate: goalDate,
            targetWeight: parseFloat(goalWeight) || undefined,
            targetMuscle: parseFloat(goalMuscle) || undefined,
            targetFatPercent: parseFloat(goalFatPercent) || undefined,
            startDate: new Date(),
            startWeight: latestEntry?.weight
        });
        setIsGoalDialogOpen(false);
    };

    const resetEntryForm = () => {
        setDate(new Date());
        setWeight('');
        setSkeletalMuscle('');
        setBodyFat('');
        setBodyFatPercent('');
        setBmi('');
        setBmr('');
        setVisceralFat('');
        setMemo('');
    };

    // Prepare Data for Chart
    const chartData = sortedEntries.map(entry => ({
        name: format(new Date(entry.date), 'MM/dd'),
        weight: entry.weight,
        muscle: entry.skeletalMuscleMass,
        fat: entry.bodyFatMass,
        score: entry.weight + entry.skeletalMuscleMass // Dummy formulation
    }));

    // Goal Summary Calculation
    let goalSummary = null;
    if (bodyCompositionGoal) {
        const daysLeft = bodyCompositionGoal.targetDate ? differenceInDays(new Date(bodyCompositionGoal.targetDate), new Date()) : 0;

        // Default values if no entry exists
        const currentWeight = latestEntry?.weight || 0;
        const currentMuscle = latestEntry?.skeletalMuscleMass || 0;
        const currentFat = latestEntry?.bodyFatPercent || 0;

        const weightDiff = bodyCompositionGoal.targetWeight && latestEntry ? bodyCompositionGoal.targetWeight - latestEntry.weight : 0;

        goalSummary = {
            daysLeft,
            weightDiff,
            targetWeight: bodyCompositionGoal.targetWeight,
            currentWeight,
            targetMuscle: bodyCompositionGoal.targetMuscle,
            currentMuscle,
            targetFat: bodyCompositionGoal.targetFatPercent,
            currentFat
        };
    }

    const listEntries = [...sortedEntries].reverse();

    return (
        <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Scale className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">InBody 상세 기록</h2>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsGoalDialogOpen(true)} variant="outline" className="gap-2 border-dashed border-primary/50 text-primary hover:bg-primary/5">
                        <Target className="w-4 h-4" /> 목표 설정
                    </Button>
                    <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" /> 기록 추가
                    </Button>
                </div>
            </div>

            {/* Goal Progerss Card */}
            {goalSummary && (
                <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100">
                    <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <h3 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                                <Target className="w-4 h-4 text-indigo-600" /> 나의 목표 달성 현황
                            </h3>
                            <p className="text-xs text-indigo-600/80 mt-1">
                                목표일 ({format(new Date(bodyCompositionGoal!.targetDate), 'yyyy.MM.dd')})까지
                                <span className="font-bold text-indigo-700 mx-1">{goalSummary.daysLeft > 0 ? `${goalSummary.daysLeft}일` : 'D-Day'}</span>
                                남았습니다.
                            </p>
                        </div>

                        <div className="flex items-center gap-6">
                            {goalSummary.targetWeight && (
                                <div className="flex flex-col items-center">
                                    <span className="text-xs text-muted-foreground">체중</span>
                                    <div className="flex items-center gap-2">
                                        {latestEntry ? (
                                            <>
                                                <span className="font-bold text-lg">{goalSummary.currentWeight}</span>
                                                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                            </>
                                        ) : (
                                            <span className="text-xs text-muted-foreground mr-1">목표</span>
                                        )}
                                        <span className="font-bold text-lg text-primary">{goalSummary.targetWeight}</span>
                                        {latestEntry && (
                                            <span className="text-xs font-medium bg-white px-1.5 py-0.5 rounded border ml-1">
                                                {goalSummary.weightDiff > 0 ? '+' : ''}{goalSummary.weightDiff.toFixed(1)}kg
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                            {goalSummary.targetMuscle && (
                                <div className="flex flex-col items-center hidden sm:flex">
                                    <span className="text-xs text-muted-foreground">골격근량</span>
                                    <div className="flex items-center gap-2">
                                        {latestEntry ? (
                                            <>
                                                <span className="font-bold text-lg">{goalSummary.currentMuscle}</span>
                                                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                            </>
                                        ) : (
                                            <span className="text-xs text-muted-foreground mr-1">목표</span>
                                        )}
                                        <span className="font-bold text-lg text-primary">{goalSummary.targetMuscle}</span>
                                    </div>
                                </div>
                            )}
                            {goalSummary.targetFat && (
                                <div className="flex flex-col items-center hidden sm:flex">
                                    <span className="text-xs text-muted-foreground">체지방률</span>
                                    <div className="flex items-center gap-2">
                                        {latestEntry ? (
                                            <>
                                                <span className="font-bold text-lg">{goalSummary.currentFat}%</span>
                                                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                            </>
                                        ) : (
                                            <span className="text-xs text-muted-foreground mr-1">목표</span>
                                        )}
                                        <span className="font-bold text-lg text-primary">{goalSummary.targetFat}%</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Chart Section */}
            {sortedEntries.length >= 2 ? (
                <Card className="border-none shadow-sm bg-gradient-to-br from-white to-gray-50/50">
                    <CardContent className="p-0 pt-6 pr-6 pb-2 h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorMuscle" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                                <YAxis fontSize={11} tickLine={false} axisLine={false} padding={{ top: 20, bottom: 20 }} tick={{ fill: '#94a3b8' }} domain={['auto', 'auto']} width={30} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <Tooltip
                                    cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white/95 backdrop-blur-sm border border-border/50 shadow-xl rounded-xl p-4 text-xs">
                                                    <p className="font-bold text-gray-700 mb-2">{label}</p>
                                                    {payload.map((p: any) => (
                                                        <div key={p.name} className="flex items-center gap-2 mb-1 last:mb-0">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.stroke }} />
                                                            <span className="text-muted-foreground min-w-[60px]">{p.name}</span>
                                                            <span className="font-bold font-mono text-foreground">{p.value}kg</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                                <Area type="monotone" dataKey="weight" name="체중" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" activeDot={{ r: 6, strokeWidth: 0 }} />
                                <Area type="monotone" dataKey="muscle" name="골격근량" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMuscle)" activeDot={{ r: 6, strokeWidth: 0 }} />
                                <Area type="monotone" dataKey="fat" name="체지방량" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorFat)" activeDot={{ r: 6, strokeWidth: 0 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-muted/10 border-2 border-dashed border-muted-foreground/10 rounded-xl p-12 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-3">
                    <div className="p-3 bg-muted/20 rounded-full">
                        <TrendingUp className="w-6 h-6 opacity-50" />
                    </div>
                    <p>기록이 2개 이상 쌓이면 변화 그래프가 나타납니다.</p>
                </div>
            )}

            {/* List */}
            <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Activity className="w-4 h-4" /> 상세 기록
                </h3>
                {listEntries.length === 0 ? (
                    <div className="text-center text-muted-foreground opacity-50 py-10">
                        기록이 없습니다. 첫 측정을 기록해보세요!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {listEntries.map(entry => (
                            <Card key={entry.id} className="hover:shadow-md transition-shadow relative group">
                                <CardContent className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                                                {format(new Date(entry.date), 'yyyy.MM.dd')}
                                            </span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteInBodyEntry(entry.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Main Stats Grid */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                        {/* Weight */}
                                        <div className="flex flex-col p-3 bg-violet-50 rounded-xl border border-violet-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Scale className="w-4 h-4 text-violet-500" />
                                                <span className="text-xs font-semibold text-violet-600">체중</span>
                                            </div>
                                            <span className="text-xl font-bold text-violet-700">{entry.weight} <span className="text-xs font-medium">kg</span></span>
                                        </div>

                                        {/* Muscle */}
                                        <div className="flex flex-col p-3 bg-green-50 rounded-xl border border-green-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Activity className="w-4 h-4 text-green-500" />
                                                <span className="text-xs font-semibold text-green-600">골격근량</span>
                                            </div>
                                            <span className="text-xl font-bold text-green-700">{entry.skeletalMuscleMass} <span className="text-xs font-medium">kg</span></span>
                                        </div>

                                        {/* Fat */}
                                        <div className="flex flex-col p-3 bg-red-50 rounded-xl border border-red-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Activity className="w-4 h-4 text-red-500" />
                                                <span className="text-xs font-semibold text-red-600">체지방량</span>
                                            </div>
                                            <span className="text-xl font-bold text-red-700">{entry.bodyFatMass} <span className="text-xs font-medium">kg</span></span>
                                            <div className="text-xs text-red-500 font-medium">({entry.bodyFatPercent}%)</div>
                                        </div>

                                        {/* Detailed Stats Group */}
                                        <div className="flex flex-col justify-center gap-1 p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                                            {entry.height && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground flex items-center gap-1"><Ruler className="w-3 h-3" /> 신장</span>
                                                    <span className="font-medium">{entry.height}cm</span>
                                                </div>
                                            )}
                                            {entry.bmi && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground flex items-center gap-1"><Activity className="w-3 h-3" /> BMI</span>
                                                    <span className="font-medium">{entry.bmi}</span>
                                                </div>
                                            )}
                                            {entry.basalMetabolicRate && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground flex items-center gap-1"><Zap className="w-3 h-3" /> 기초대사</span>
                                                    <span className="font-medium">{entry.basalMetabolicRate} kcal</span>
                                                </div>
                                            )}
                                            {entry.visceralFatLevel && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground flex items-center gap-1"><Heart className="w-3 h-3" /> 내장지방</span>
                                                    <span className="font-medium">Lv.{entry.visceralFatLevel}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {entry.memo && (
                                        <div className="bg-yellow-50/50 p-3 rounded-lg text-sm text-yellow-800/80 border border-yellow-100/50">
                                            <span className="font-bold mr-2">Memo:</span>
                                            {entry.memo}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Goal Setting Dialog */}
            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>목표 설정</DialogTitle>
                        <DialogDescription>
                            도달하고자 하는 목표 체중과 골격근량, 그리고 날짜를 설정하세요.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>목표 날짜</Label>
                            <Input
                                type="date"
                                value={format(goalDate, 'yyyy-MM-dd')}
                                onChange={(e) => setGoalDate(new Date(e.target.value))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>목표 체중 (kg)</Label>
                                <Input
                                    type="number"
                                    value={goalWeight}
                                    onChange={e => setGoalWeight(e.target.value)}
                                    placeholder={latestEntry?.weight?.toString() || "0.0"}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>목표 골격근량 (kg)</Label>
                                <Input
                                    type="number"
                                    value={goalMuscle}
                                    onChange={e => setGoalMuscle(e.target.value)}
                                    placeholder={latestEntry?.skeletalMuscleMass?.toString() || "0.0"}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>목표 체지방률 (%)</Label>
                            <Input
                                type="number"
                                value={goalFatPercent}
                                onChange={e => setGoalFatPercent(e.target.value)}
                                placeholder={latestEntry?.bodyFatPercent?.toString() || "0.0"}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveGoal}>목표 저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Entry Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>InBody 정밀 측정 기록</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>측정 날짜</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="datetime-local"
                                    value={format(date, "yyyy-MM-dd'T'HH:mm")}
                                    onChange={(e) => setDate(new Date(e.target.value))}
                                    className="flex-1"
                                />
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="ocr-upload"
                                        className="hidden"
                                        onChange={handleOCR}
                                        disabled={isScanning}
                                    />
                                    <Label
                                        htmlFor="ocr-upload"
                                        className={cn(
                                            "flex items-center gap-2 h-10 px-4 rounded-md border text-sm font-medium cursor-pointer transition-colors hover:bg-muted",
                                            isScanning ? "opacity-50 cursor-not-allowed" : "bg-white"
                                        )}
                                    >
                                        {isScanning ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <ScanLine className="w-4 h-4 text-primary" />}
                                        {isScanning ? '스캔 중...' : 'InBody 스캔'}
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>신장 (cm)</Label>
                                <Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="0.0" />
                            </div>
                            <div className="grid gap-2">
                                <Label>체중 (kg) <span className="text-red-500">*</span></Label>
                                <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0.0" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>골격근량 (kg)</Label>
                                <Input type="number" value={skeletalMuscle} onChange={e => setSkeletalMuscle(e.target.value)} placeholder="0.0" />
                            </div>
                            <div className="grid gap-2">
                                <Label>기초대사량 (kcal)</Label>
                                <Input type="number" value={bmr} onChange={e => setBmr(e.target.value)} placeholder="0" />
                            </div>
                        </div>

                        <div className="border-t pt-2 mt-2">
                            <Label className="text-xs text-muted-foreground mb-2 block">체지방 상세</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>체지방량 (kg)</Label>
                                    <Input
                                        type="number"
                                        value={bodyFat}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setBodyFat(val);
                                            if (weight && parseFloat(weight) > 0 && val) {
                                                const mass = parseFloat(val);
                                                const w = parseFloat(weight);
                                                const pct = (mass / w) * 100;
                                                setBodyFatPercent(pct.toFixed(1));
                                            }
                                        }}
                                        placeholder="0.0"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>체지방률 (%)</Label>
                                    <Input
                                        type="number"
                                        value={bodyFatPercent}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setBodyFatPercent(val);
                                            if (weight && parseFloat(weight) > 0 && val) {
                                                const pct = parseFloat(val);
                                                const w = parseFloat(weight);
                                                const mass = w * (pct / 100);
                                                setBodyFat(mass.toFixed(1));
                                            }
                                        }}
                                        placeholder="0.0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>BMI (자동계산)</Label>
                                <Input type="number" value={bmi} onChange={e => setBmi(e.target.value)} placeholder="0.0" className="bg-muted/50" />
                            </div>
                            <div className="grid gap-2">
                                <Label>내장지방레벨 (Lv)</Label>
                                <Input type="number" value={visceralFat} onChange={e => setVisceralFat(e.target.value)} placeholder="1~20" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>메모 / 피드백</Label>
                            <Input placeholder="오늘의 상태 검사 결과..." value={memo} onChange={e => setMemo(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveEntry} disabled={!weight}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

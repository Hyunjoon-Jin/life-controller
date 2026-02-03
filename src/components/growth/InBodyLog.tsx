'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/context/DataProvider';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Plus, Trash2, Scale, Activity, TrendingUp, Ruler, Zap, Heart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function InBodyLog() {
    const { inBodyEntries, addInBodyEntry, deleteInBodyEntry } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
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

    // Pre-fill height from last entry if available
    useEffect(() => {
        if (isDialogOpen && inBodyEntries && inBodyEntries.length > 0 && !height) {
            const lastEntry = inBodyEntries[inBodyEntries.length - 1]; // Assuming sorted? Or check logic
            // Actually sortedEntries is sorted by date ascending in render, but inBodyEntries might be arbitrary.
            // Let's find the latest entry.
            const latest = [...inBodyEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            if (latest?.height) {
                setHeight(latest.height.toString());
            }
        }
    }, [isDialogOpen, inBodyEntries]);

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

    const handleSave = () => {
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
        resetForm();
    };

    const resetForm = () => {
        setDate(new Date());
        setWeight('');
        setSkeletalMuscle('');
        setBodyFat('');
        setBodyFatPercent('');
        setBmi('');
        setBmr('');
        setVisceralFat('');
        setMemo('');
        // Keep height? maybe
    };

    const sortedEntries = (inBodyEntries || []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Prepare Data for Chart
    const chartData = sortedEntries.map(entry => ({
        name: format(new Date(entry.date), 'MM/dd'),
        weight: entry.weight,
        muscle: entry.skeletalMuscleMass,
        fat: entry.bodyFatMass,
        score: entry.weight + entry.skeletalMuscleMass // Dummy formulation, just to trigger updates if needed
    }));

    // Reverse for list view (Newest first)
    const listEntries = [...sortedEntries].reverse();

    return (
        <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Scale className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">InBody 상세 기록</h2>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> 기록 추가
                </Button>
            </div>

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

            {/* Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>InBody 정밀 측정 기록</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>측정 날짜</Label>
                            <Input
                                type="datetime-local"
                                value={format(date, "yyyy-MM-dd'T'HH:mm")}
                                onChange={(e) => setDate(new Date(e.target.value))}
                            />
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
                        <Button onClick={handleSave} disabled={!weight}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

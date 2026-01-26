'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Plus, Trash2, Scale, Activity, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function InBodyLog() {
    const { inBodyEntries, addInBodyEntry, deleteInBodyEntry } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [weight, setWeight] = useState('');
    const [skeletalMuscle, setSkeletalMuscle] = useState('');
    const [bodyFat, setBodyFat] = useState('');
    const [bodyFatPercent, setBodyFatPercent] = useState('');
    const [memo, setMemo] = useState('');

    const handleSave = () => {
        if (!weight) return;

        addInBodyEntry({
            id: generateId(),
            date: new Date(),
            weight: parseFloat(weight) || 0,
            skeletalMuscleMass: parseFloat(skeletalMuscle) || 0,
            bodyFatMass: parseFloat(bodyFat) || 0,
            bodyFatPercent: parseFloat(bodyFatPercent) || 0,
            memo
        });

        setIsDialogOpen(false);
        setWeight('');
        setSkeletalMuscle('');
        setBodyFat('');
        setBodyFatPercent('');
        setMemo('');
    };

    const sortedEntries = (inBodyEntries || []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Prepare Data for Chart
    const chartData = sortedEntries.map(entry => ({
        name: format(new Date(entry.date), 'MM/dd'),
        weight: entry.weight,
        muscle: entry.skeletalMuscleMass,
        fat: entry.bodyFatMass
    }));

    // Reverse for list view (Newest first)
    const listEntries = [...sortedEntries].reverse();

    return (
        <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Scale className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">InBody 기록</h2>
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
                                <XAxis
                                    dataKey="name"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#94a3b8' }}
                                    dy={10}
                                />
                                <YAxis
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    padding={{ top: 20, bottom: 20 }}
                                    tick={{ fill: '#94a3b8' }}
                                    domain={['dataMin - 5', 'dataMax + 5']}
                                    width={30}
                                />
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
                                <Legend
                                    iconType="circle"
                                    wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="weight"
                                    name="체중"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorWeight)"
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="muscle"
                                    name="골격근량"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorMuscle)"
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="fat"
                                    name="체지방량"
                                    stroke="#f43f5e"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorFat)"
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {listEntries.map(entry => (
                            <Card key={entry.id} className="hover:shadow-md transition-shadow relative group">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-bold bg-muted px-2 py-1 rounded">
                                            {format(new Date(entry.date), 'yyyy.MM.dd')}
                                        </span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteInBodyEntry(entry.id)}>
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                                        <div className="flex flex-col p-2 bg-blue-50/50 rounded-lg">
                                            <span className="text-[10px] text-muted-foreground">체중</span>
                                            <span className="font-bold text-blue-700">{entry.weight}kg</span>
                                        </div>
                                        <div className="flex flex-col p-2 bg-green-50/50 rounded-lg">
                                            <span className="text-[10px] text-muted-foreground">골격근</span>
                                            <span className="font-bold text-green-700">{entry.skeletalMuscleMass}kg</span>
                                        </div>
                                        <div className="flex flex-col p-2 bg-red-50/50 rounded-lg">
                                            <span className="text-[10px] text-muted-foreground">체지방</span>
                                            <span className="font-bold text-red-700">{entry.bodyFatMass}kg</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <div className="text-xs text-muted-foreground">
                                            체지방률: <span className="font-medium text-foreground">{entry.bodyFatPercent}%</span>
                                        </div>
                                        {entry.bmi && (
                                            <div className="text-xs text-muted-foreground">
                                                BMI: <span className="font-medium text-foreground">{entry.bmi}</span>
                                            </div>
                                        )}
                                    </div>
                                    {entry.memo && (
                                        <p className="border-t mt-3 pt-2 text-sm text-muted-foreground">
                                            {entry.memo}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>InBody 측정 기록</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>체중 (kg) <span className="text-red-500">*</span></Label>
                                <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0.0" />
                            </div>
                            <div className="grid gap-2">
                                <Label>골격근량 (kg)</Label>
                                <Input type="number" value={skeletalMuscle} onChange={e => setSkeletalMuscle(e.target.value)} placeholder="0.0" />
                            </div>
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
                        <div className="grid gap-2">
                            <Label>메모 / 피드백</Label>
                            <Input placeholder="오늘의 상태..." value={memo} onChange={e => setMemo(e.target.value)} />
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

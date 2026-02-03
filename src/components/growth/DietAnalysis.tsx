'use client';

import { useMemo, useState } from 'react';
import { useData } from '@/context/DataProvider';
import { DietEntry, InBodyEntry, ExerciseSession } from '@/types';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, subWeeks, addWeeks, subMonths, addMonths, closestIndexTo, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Utensils, Flame, Pizza, Droplet, Wheat, Award, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Line, ComposedChart } from 'recharts';

interface DietAnalysisProps {
    entries: DietEntry[];
    inBodyEntries: InBodyEntry[];
    exerciseSessions: ExerciseSession[];
}

export function DietAnalysis({ entries, inBodyEntries, exerciseSessions }: DietAnalysisProps) {
    const { bodyCompositionGoal } = useData();
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());

    const MACRO_COLORS = { carbs: '#60a5fa', protein: '#f87171', fat: '#fbbf24' }; // Blue, Red, Yellow
    const MACRO_COLORS_ARRAY = ['#60a5fa', '#f87171', '#fbbf24'];

    // Date Range Logic
    const dateRange = useMemo(() => {
        if (viewMode === 'week') {
            return {
                start: startOfWeek(currentDate, { weekStartsOn: 1 }),
                end: endOfWeek(currentDate, { weekStartsOn: 1 })
            };
        } else {
            return {
                start: startOfMonth(currentDate),
                end: endOfMonth(currentDate)
            };
        }
    }, [viewMode, currentDate]);

    const navigate = (direction: 'prev' | 'next') => {
        if (viewMode === 'week') {
            setCurrentDate(d => direction === 'prev' ? subWeeks(d, 1) : addWeeks(d, 1));
        } else {
            setCurrentDate(d => direction === 'prev' ? subMonths(d, 1) : addMonths(d, 1));
        }
    };

    // Filter Data
    const filteredEntries = useMemo(() => {
        return entries.filter(e => {
            const d = new Date(e.date);
            return d >= dateRange.start && d <= dateRange.end;
        });
    }, [entries, dateRange]);

    // Stats Calculation
    const stats = useMemo(() => {
        const totalCalories = filteredEntries.reduce((acc, e) => acc + (e.totalCalories || (e as any).calories || 0), 0);
        const totalMacros = filteredEntries.reduce((acc, e) => ({
            carbs: acc.carbs + (e.totalMacros?.carbs || (e as any).macros?.carbs || 0),
            protein: acc.protein + (e.totalMacros?.protein || (e as any).macros?.protein || 0),
            fat: acc.fat + (e.totalMacros?.fat || (e as any).macros?.fat || 0),
        }), { carbs: 0, protein: 0, fat: 0 });

        const uniqueDays = new Set(filteredEntries.map(e => format(new Date(e.date), 'yyyy-MM-dd'))).size;

        // Top Foods
        const foodCounts: Record<string, number> = {};
        filteredEntries.forEach(entry => {
            if (entry.items) {
                entry.items.forEach(item => {
                    foodCounts[item.name] = (foodCounts[item.name] || 0) + 1;
                });
            } else if ((entry as any).menu) {
                foodCounts[(entry as any).menu] = (foodCounts[(entry as any).menu] || 0) + 1;
            }
        });

        const topFoods = Object.entries(foodCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        return { totalCalories, totalMacros, uniqueDays, topFoods };
    }, [filteredEntries]);

    // Target & Net Calculation
    const chartData = useMemo(() => {
        const days = eachDayOfInterval(dateRange);
        const sortedInBody = [...inBodyEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');

            // 1. Intake
            const dailyEntries = filteredEntries.filter(e => isSameDay(new Date(e.date), day));
            const calories = dailyEntries.reduce((acc, e) => acc + (e.totalCalories || (e as any).calories || 0), 0);
            const macros = dailyEntries.reduce((acc, e) => ({
                carbs: acc.carbs + (e.totalMacros?.carbs || (e as any).macros?.carbs || 0),
                protein: acc.protein + (e.totalMacros?.protein || (e as any).macros?.protein || 0),
                fat: acc.fat + (e.totalMacros?.fat || (e as any).macros?.fat || 0),
            }), { carbs: 0, protein: 0, fat: 0 });

            // Convert macros to kcal for stacked bar
            const carbsKcal = macros.carbs * 4;
            const proteinKcal = macros.protein * 4;
            const fatKcal = macros.fat * 9;

            // 2. Output (Exercise)
            const dailyExercise = exerciseSessions.filter(e => isSameDay(new Date(e.date), day));
            const exerciseBurn = dailyExercise.reduce((acc, s) => {
                let met = 5; // Default moderate
                if (s.category === 'cardio') met = 8;
                if (s.category === 'sport') met = 7;
                return acc + (s.duration * met);
            }, 0);

            // 3. BMR (Basal)
            let bmr = 0;
            const closestIdx = closestIndexTo(day, sortedInBody.map(i => new Date(i.date)));
            if (closestIdx !== undefined && sortedInBody[closestIdx]) {
                bmr = sortedInBody[closestIdx].basalMetabolicRate || 0;
            }
            if (bmr === 0) bmr = 1500; // Fallback

            // 4. Target Calculation (BMR + Exercise + GoalAdjustment)
            let dailyGoalAdj = 0;
            if (bodyCompositionGoal && bodyCompositionGoal.targetWeight && bodyCompositionGoal.targetDate) {
                // Find latest weight *before* this day to calc diff?
                // Or just use the global goal calc.
                // Let's use the start weight of the goal vs target weight.
                // But better: Dynamic adjustment based on current status?
                // For simplicity: Linear path from Goal Start Date to Target Date.
                // Required Daily Deficit = Total Calorie Diff / Total Days.

                const startWeight = bodyCompositionGoal.startWeight || 70; // fallback
                const targetWeight = bodyCompositionGoal.targetWeight;
                const weightDiff = targetWeight - startWeight; // e.g. -5kg
                const totalCalorieDiff = weightDiff * 7700; // -38500 kcal

                const goalStartDate = new Date(bodyCompositionGoal.startDate || new Date());
                const goalTargetDate = new Date(bodyCompositionGoal.targetDate);
                const totalDays = differenceInDays(goalTargetDate, goalStartDate) || 1;

                dailyGoalAdj = totalCalorieDiff / totalDays; // e.g. -38500/30 = -1283 kcal/day

                // Cap adjustment to avoid starvation targets
                if (dailyGoalAdj < -1000) dailyGoalAdj = -1000;
                if (dailyGoalAdj > 1000) dailyGoalAdj = 1000;
            }

            let target = bmr + exerciseBurn + dailyGoalAdj;
            if (target < 1200) target = 1200; // Minimum safety floor

            return {
                name: format(day, viewMode === 'week' ? 'EEE' : 'dd', { locale: ko }),
                date: dateStr,
                calories, // Total intake
                carbsKcal,
                proteinKcal,
                fatKcal,
                target,
                bmr,
                exerciseBurn
            };
        });
    }, [dateRange, filteredEntries, viewMode, inBodyEntries, exerciseSessions, bodyCompositionGoal]);

    // Macro Ratio
    const macroRatioData = useMemo(() => {
        const { carbs, protein, fat } = stats.totalMacros;
        const total = carbs + protein + fat;
        if (total === 0) return [];
        return [
            { name: '탄수화물', value: carbs },
            { name: '단백질', value: protein },
            { name: '지방', value: fat },
        ];
    }, [stats]);

    // Insights
    const insights = useMemo(() => {
        const list = [];
        const validDays = chartData.filter(d => d.calories > 0);
        const avgIntake = validDays.reduce((acc, d) => acc + d.calories, 0) / (validDays.length || 1);
        const avgTarget = chartData.reduce((acc, d) => acc + d.target, 0) / (chartData.length || 1);

        if (validDays.length > 0) {
            const ratio = avgIntake / avgTarget;
            if (ratio > 1.1) list.push({ type: 'warning', text: '목표보다 많이 드셨어요! 운동량을 늘려보세요. 🏃‍♂️' });
            else if (ratio < 0.8) list.push({ type: 'warning', text: '섭취량이 부족해요. 건강한 다이어트를 위해 챙겨드세요! 🥗' });
            else list.push({ type: 'success', text: '목표 칼로리를 완벽하게 지키고 계세요! 👏' });
        }

        const { carbs, protein, fat } = stats.totalMacros;
        const totalWeight = carbs + protein + fat;
        if (totalWeight > 0) {
            const pRatio = protein / totalWeight;
            if (pRatio < 0.2) list.push({ type: 'info', text: '근육 합성을 위해 단백질 비중을 높여보세요. 🍗' });
        }

        if (bodyCompositionGoal?.targetWeight) {
            list.push({ type: 'info', text: `목표 체중 ${bodyCompositionGoal.targetWeight}kg 달성을 위해 화이팅하세요!` });
        }

        if (stats.uniqueDays === 0) list.push({ type: 'neutral', text: '기록이 없어요. 오늘 식단을 기록해보세요!' });

        return list;
    }, [stats, chartData, bodyCompositionGoal]);

    return (
        <div className="space-y-6 animate-in fade-in pb-10">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-[200px]">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="week">주간</TabsTrigger>
                        <TabsTrigger value="month">월간</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-4 bg-muted/30 p-1 rounded-lg">
                    <Button variant="ghost" size="icon" onClick={() => navigate('prev')}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <span className="font-bold min-w-[140px] text-center text-lg">
                        {viewMode === 'week'
                            ? `${format(dateRange.start, 'MM.dd')} - ${format(dateRange.end, 'MM.dd')}`
                            : format(currentDate, 'yyyy년 MM월')
                        }
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => navigate('next')}>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-red-50 to-white border-red-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-600">평균 칼로리</CardTitle>
                        <Flame className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">
                            {stats.uniqueDays > 0 ? Math.round(stats.totalCalories / stats.uniqueDays).toLocaleString() : 0}
                            <span className="text-xs font-normal text-muted-foreground ml-1">kcal</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600">총 탄수화물</CardTitle>
                        <Wheat className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">
                            {Math.round(stats.totalMacros.carbs).toLocaleString()}
                            <span className="text-xs font-normal text-muted-foreground ml-1">g</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-white border-red-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-600">총 단백질</CardTitle>
                        <Pizza className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">
                            {Math.round(stats.totalMacros.protein).toLocaleString()}
                            <span className="text-xs font-normal text-muted-foreground ml-1">g</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-600">총 지방</CardTitle>
                        <Droplet className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-700">
                            {Math.round(stats.totalMacros.fat).toLocaleString()}
                            <span className="text-xs font-normal text-muted-foreground ml-1">g</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Chart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Macro Ratio */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>탄단지 비율</CardTitle>
                        <CardDescription>섭취 영양소 비율</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center min-h-[250px]">
                        {macroRatioData.length > 0 ? (
                            <div className="w-full h-[200px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={macroRatioData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {macroRatioData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={MACRO_COLORS_ARRAY[index]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="text-muted-foreground text-sm">데이터 부족</div>
                        )}

                        {/* Insights List */}
                        <div className="w-full mt-4 space-y-2">
                            {insights.slice(0, 3).map((insight, idx) => (
                                <div key={idx} className={`p-3 rounded-lg text-xs flex items-center gap-2 ${insight.type === 'warning' ? 'bg-orange-50 text-orange-700' :
                                        insight.type === 'success' ? 'bg-green-50 text-green-700' :
                                            'bg-blue-50 text-blue-700'
                                    }`}>
                                    <AlertCircle className="w-3 h-3 shrink-0" />
                                    <span>{insight.text}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Daily Calories Trend (The Main Feature Update) */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>일별 칼로리 및 목표 달성</CardTitle>
                        <CardDescription>막대: 섭취 칼로리 (탄/단/지) vs 점선: 목표 칼로리</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    label={{ value: 'kcal', position: 'insideLeft', angle: -90, offset: 10, fill: '#94a3b8' }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white/95 backdrop-blur-sm border border-border/50 shadow-xl rounded-xl p-4 text-xs font-sans">
                                                    <p className="font-bold text-gray-700 mb-2 border-b pb-1">{label}</p>
                                                    {payload.map((p: any) => (
                                                        <div key={p.name} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.stroke || p.fill }} />
                                                                <span className="text-muted-foreground">{p.name}</span>
                                                            </div>
                                                            <span className="font-bold font-mono">{Math.round(p.value)} kcal</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />

                                {/* Stacked Bars for Intake converted to Kcal */}
                                <Bar dataKey="carbsKcal" stackId="a" fill={MACRO_COLORS.carbs} name="탄수화물" maxBarSize={50} />
                                <Bar dataKey="proteinKcal" stackId="a" fill={MACRO_COLORS.protein} name="단백질" maxBarSize={50} />
                                <Bar dataKey="fatKcal" stackId="a" fill={MACRO_COLORS.fat} name="지방" radius={[4, 4, 0, 0]} maxBarSize={50} />

                                {/* Target Line */}
                                <Line type="step" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" name="목표 칼로리" dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Top Foods */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-yellow-500" /> 자주 먹은 음식 Top 5
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {stats.topFoods.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {stats.topFoods.map((food, idx) => (
                                <div key={idx} className="flex flex-col items-center justify-center p-3 bg-muted/20 rounded-xl border border-dashed hover:bg-muted/30 transition-colors">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-xs mb-1 shadow-sm ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-400' : 'bg-slate-300'
                                        }`}>
                                        {idx + 1}
                                    </div>
                                    <span className="font-bold text-center text-xs line-clamp-1">{food.name}</span>
                                    <span className="text-[10px] text-muted-foreground">{food.count}회</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-xs text-muted-foreground">데이터가 충분하지 않아요.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

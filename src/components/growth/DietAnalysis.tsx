'use client';

import { useMemo, useState } from 'react';
import { DietEntry, InBodyEntry, ExerciseSession } from '@/types';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, subMonths, subWeeks, addMonths, addWeeks, closestIndexTo } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Utensils, Flame, Pizza, Droplet, Wheat, TrendingUp, Award, AlertCircle, Target, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, ComposedChart } from 'recharts';
import { Progress } from '@/components/ui/progress';

interface DietAnalysisProps {
    entries: DietEntry[];
    inBodyEntries: InBodyEntry[];
    exerciseSessions: ExerciseSession[];
}

export function DietAnalysis({ entries, inBodyEntries, exerciseSessions }: DietAnalysisProps) {
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());

    const COLORS = ['#fbbf24', '#f97316', '#3b82f6', '#4ade80']; // Breakfast(Y), Lunch(O), Dinner(B), Snack(G)
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

        // Detailed Item Analysis for "Top Foods"
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

        // Sort InBody for finding closest
        const sortedInBody = [...inBodyEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');

            // 1. Intake
            const dailyEntries = filteredEntries.filter(e => isSameDay(new Date(e.date), day));
            const intake = dailyEntries.reduce((acc, e) => acc + (e.totalCalories || (e as any).calories || 0), 0);
            const macros = dailyEntries.reduce((acc, e) => ({
                carbs: acc.carbs + (e.totalMacros?.carbs || (e as any).macros?.carbs || 0),
                protein: acc.protein + (e.totalMacros?.protein || (e as any).macros?.protein || 0),
                fat: acc.fat + (e.totalMacros?.fat || (e as any).macros?.fat || 0),
            }), { carbs: 0, protein: 0, fat: 0 });

            // 2. Output (Exercise)
            const dailyExercise = exerciseSessions.filter(e => isSameDay(new Date(e.date), day));
            // Simple calc: Use stored duration/intensity if calories not available. 
            // Since we don't have direct calories in ExerciseSession yet, let's estimate or assume user puts it in memo?
            // Actually, for now let's use a rough estimate based on duration * 5kcal (moderate) - 10kcal (high).
            // Better: Just use duration for "Activity Level" indication if no explicit calories.
            // *Wait*, did I add calories to ExerciseSession? No.
            // Let's estimate: Weight Training ~ 5kcal/min, Cardio ~ 8kcal/min, Sport ~ 7kcal/min.
            const exerciseBurn = dailyExercise.reduce((acc, s) => {
                let met = 5;
                if (s.category === 'cardio') met = 8;
                if (s.category === 'sport') met = 7;
                return acc + (s.duration * met);
            }, 0);

            // 3. BMR (Basal)
            // Find closest InBody before or on this day
            let bmr = 0;
            const closestIdx = closestIndexTo(day, sortedInBody.map(i => new Date(i.date)));
            if (closestIdx !== undefined && sortedInBody[closestIdx]) {
                bmr = sortedInBody[closestIdx].basalMetabolicRate || 0;
            }
            // Fallback BMR if 0 (Average Male/Female? Let's say 1500)
            if (bmr === 0) bmr = 1500;

            // 4. Target (TDEE = BMR + ExerciseBurn + TEF(10% of Intake))
            // Simple: Target = BMR + Exercise
            const target = bmr + exerciseBurn;

            return {
                name: format(day, viewMode === 'week' ? 'EEE' : 'dd', { locale: ko }),
                date: dateStr,
                calories: intake,
                exerciseBurn,
                target,
                bmr,
                net: intake - exerciseBurn,
                ...macros
            };
        });
    }, [dateRange, filteredEntries, viewMode, inBodyEntries, exerciseSessions]);

    // Macro Ratio Data for Pie Chart
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

    // Simple Insights Generation
    const insights = useMemo(() => {
        const list = [];

        // Calculate averages from chartData instead of raw stats to align with BMR logic
        const validDays = chartData.filter(d => d.calories > 0);
        const avgIntake = validDays.reduce((acc, d) => acc + d.calories, 0) / (validDays.length || 1);
        const avgTarget = chartData.reduce((acc, d) => acc + d.target, 0) / (chartData.length || 1);

        if (validDays.length > 0) {
            const ratio = avgIntake / avgTarget;
            if (ratio > 1.2) list.push({ type: 'warning', text: '목표 섭취량보다 많이 드시고 있어요! 😮 운동을 늘려보세요.' });
            else if (ratio < 0.7) list.push({ type: 'warning', text: '목표보다 너무 적게 드셨어요. 근손실이 올 수 있어요! 🥗' });
            else list.push({ type: 'success', text: '목표 섭취량을 아주 잘 지키고 계세요! 👏' });
        }

        const { carbs, protein, fat } = stats.totalMacros;
        const totalWeight = carbs + protein + fat;
        if (totalWeight > 0) {
            const pRatio = protein / totalWeight;
            if (pRatio < 0.2) list.push({ type: 'info', text: '단백질 비중을 높여 근육 성장을 도모해보세요. 🍗' });
            if (pRatio > 0.4) list.push({ type: 'success', text: '단백질 섭취가 아주 훌륭합니다! 근육맨! 💪' });
        }

        if (stats.uniqueDays === 0) list.push({ type: 'neutral', text: '아직 데이터가 없어요. 오늘 식단을 기록해보세요!' });

        return list;
    }, [stats, chartData]);

    return (
        <div className="space-y-6 animate-in fade-in pb-10">
            {/* Controls */}
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

            {/* Quick Stats Row */}
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

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Macro Ratio & Insights */}
                <div className="space-y-6">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>탄단지 비율</CardTitle>
                            <CardDescription>섭취한 영양소의 비율입니다.</CardDescription>
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
                                <div className="text-muted-foreground text-sm">데이터가 부족합니다.</div>
                            )}

                            {/* Insights Box */}
                            <div className="w-full mt-4 space-y-2">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">분석 피드백</h4>
                                {insights.map((insight, idx) => (
                                    <div key={idx} className={`p-3 rounded-lg text-sm flex items-start gap-2 ${insight.type === 'warning' ? 'bg-orange-50 text-orange-700' :
                                        insight.type === 'success' ? 'bg-green-50 text-green-700' :
                                            insight.type === 'info' ? 'bg-blue-50 text-blue-700' :
                                                'bg-gray-50 text-gray-700'
                                        }`}>
                                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                        <p>{insight.text}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 2. Daily Trends Chart */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>일별 섭취 추이</CardTitle>
                        <CardDescription>일일 칼로리 및 영양소 섭취량 변화</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'g', position: 'insideLeft', offset: 10, fill: '#94a3b8' }} />
                                <YAxis yAxisId="right" orientation="right" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'kcal', position: 'insideRight', offset: 10, fill: '#94a3b8' }} />

                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Legend />

                                <Bar yAxisId="left" dataKey="carbs" stackId="a" fill={MACRO_COLORS.carbs} name="탄수화물" maxBarSize={50} />
                                <Bar yAxisId="left" dataKey="protein" stackId="a" fill={MACRO_COLORS.protein} name="단백질" maxBarSize={50} />
                                <Bar yAxisId="left" dataKey="fat" stackId="a" fill={MACRO_COLORS.fat} name="지방" radius={[4, 4, 0, 0]} maxBarSize={50} />

                                {/* Target Line */}
                                <Line yAxisId="right" type="step" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="목표(TDEE)" dot={false} />
                                <Line yAxisId="right" type="monotone" dataKey="calories" stroke="#ef4444" strokeWidth={3} name="섭취 칼로리" dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Top Foods Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-500" /> 자주 먹은 음식 Top 5
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {stats.topFoods.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                            {stats.topFoods.map((food, idx) => (
                                <div key={idx} className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-xl border border-dashed">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white mb-2 shadow-sm ${idx === 0 ? 'bg-yellow-400' :
                                        idx === 1 ? 'bg-gray-400' :
                                            idx === 2 ? 'bg-orange-400' : 'bg-slate-300'
                                        }`}>
                                        {idx + 1}
                                    </div>
                                    <span className="font-bold text-center text-sm line-clamp-1">{food.name}</span>
                                    <span className="text-xs text-muted-foreground mt-1">{food.count}회 섭취</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-muted-foreground">아직 충분한 데이터가 없습니다.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

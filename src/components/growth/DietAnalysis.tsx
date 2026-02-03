'use client';

import { useMemo, useState } from 'react';
import { DietEntry } from '@/types';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, subMonths, subWeeks, addMonths, addWeeks } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Utensils, Flame, Pizza, Droplet, Wheat } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface DietAnalysisProps {
    entries: DietEntry[];
}

export function DietAnalysis({ entries }: DietAnalysisProps) {
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());

    const COLORS = ['#fbbf24', '#f97316', '#3b82f6', '#4ade80']; // Breakfast(Y), Lunch(O), Dinner(B), Snack(G)
    const MACRO_COLORS = { carbs: '#60a5fa', protein: '#f87171', fat: '#fbbf24' }; // Blue, Red, Yellow

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

    // Stats
    const stats = useMemo(() => {
        const totalCalories = filteredEntries.reduce((acc, e) => acc + (e.totalCalories || (e as any).calories || 0), 0);
        const totalMacros = filteredEntries.reduce((acc, e) => ({
            carbs: acc.carbs + (e.totalMacros?.carbs || (e as any).macros?.carbs || 0),
            protein: acc.protein + (e.totalMacros?.protein || (e as any).macros?.protein || 0),
            fat: acc.fat + (e.totalMacros?.fat || (e as any).macros?.fat || 0),
        }), { carbs: 0, protein: 0, fat: 0 });

        const uniqueDays = new Set(filteredEntries.map(e => format(new Date(e.date), 'yyyy-MM-dd'))).size;

        return { totalCalories, totalMacros, uniqueDays };
    }, [filteredEntries]);

    // Chart Data
    const chartData = useMemo(() => {
        const days = eachDayOfInterval(dateRange);
        return days.map(day => {
            const dailyEntries = filteredEntries.filter(e => isSameDay(new Date(e.date), day));
            const calories = dailyEntries.reduce((acc, e) => acc + (e.totalCalories || (e as any).calories || 0), 0);
            const macros = dailyEntries.reduce((acc, e) => ({
                carbs: acc.carbs + (e.totalMacros?.carbs || (e as any).macros?.carbs || 0),
                protein: acc.protein + (e.totalMacros?.protein || (e as any).macros?.protein || 0),
                fat: acc.fat + (e.totalMacros?.fat || (e as any).macros?.fat || 0),
            }), { carbs: 0, protein: 0, fat: 0 });

            return {
                name: format(day, viewMode === 'week' ? 'EEE' : 'dd', { locale: ko }),
                date: format(day, 'yyyy-MM-dd'),
                calories,
                ...macros
            };
        });
    }, [dateRange, filteredEntries, viewMode]);

    // Meal Type Breakdown
    const mealTypeData = useMemo(() => {
        const counts = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
        filteredEntries.forEach(e => {
            if (counts[e.mealType] !== undefined) counts[e.mealType]++;
        });
        return [
            { name: '아침', value: counts.breakfast },
            { name: '점심', value: counts.lunch },
            { name: '저녁', value: counts.dinner },
            { name: '간식', value: counts.snack },
        ].filter(d => d.value > 0);
    }, [filteredEntries]);

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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
                    <span className="font-bold min-w-[120px] text-center">
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

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">총 섭취 칼로리</CardTitle>
                        <Flame className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(stats.totalCalories).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">kcal</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">일 평균 칼로리</CardTitle>
                        <Utensils className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.uniqueDays > 0 ? Math.round(stats.totalCalories / stats.uniqueDays).toLocaleString() : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">kcal / day</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">탄단지 비율</CardTitle>
                        <div className="flex gap-1">
                            <Wheat className="w-3 h-3 text-blue-400" />
                            <Pizza className="w-3 h-3 text-red-400" />
                            <Droplet className="w-3 h-3 text-yellow-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 text-sm font-bold">
                            <span className="text-blue-500">{Math.round(stats.totalMacros.carbs)}g</span>
                            <span className="text-red-500">{Math.round(stats.totalMacros.protein)}g</span>
                            <span className="text-yellow-500">{Math.round(stats.totalMacros.fat)}g</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">기록 일수</CardTitle>
                        <Utensils className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.uniqueDays}일</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Calories & Macro Stacked Bar */}
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>일별 영양 섭취 (탄/단/지)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Legend />
                                <Bar dataKey="carbs" stackId="a" fill={MACRO_COLORS.carbs} name="탄수화물" />
                                <Bar dataKey="protein" stackId="a" fill={MACRO_COLORS.protein} name="단백질" />
                                <Bar dataKey="fat" stackId="a" fill={MACRO_COLORS.fat} name="지방" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Meal Type Pie Chart */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>끼니별 비율</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {mealTypeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={mealTypeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {mealTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                데이터가 없습니다.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

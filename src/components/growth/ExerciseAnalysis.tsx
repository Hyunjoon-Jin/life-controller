'use client';

import { useMemo, useState } from 'react';
import { ExerciseSession, InBodyEntry } from '@/types';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, subMonths, subWeeks, addMonths, addWeeks } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Activity, Timer, Dumbbell, Flame } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

interface ExerciseAnalysisProps {
    sessions: ExerciseSession[];
    inBodyEntries?: InBodyEntry[];
}

export function ExerciseAnalysis({ sessions, inBodyEntries = [] }: ExerciseAnalysisProps) {
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());

    const COLORS = ['#4ade80', '#60a5fa', '#f472b6', '#fbbf24']; // Green, Blue, Pink, Orange

    // Date Range Logic
    const dateRange = useMemo(() => {
        if (viewMode === 'week') {
            return {
                start: startOfWeek(currentDate, { weekStartsOn: 1 }), // Monday start
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
    const filteredSessions = useMemo(() => {
        return sessions.filter(s => {
            const d = new Date(s.date);
            return d >= dateRange.start && d <= dateRange.end;
        });
    }, [sessions, dateRange]);

    // Stats
    const stats = useMemo(() => {
        const totalDuration = filteredSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
        const totalCount = filteredSessions.length;
        const totalVolume = filteredSessions.reduce((acc, s) => {
            if (s.category === 'weight' && s.sets) {
                return acc + s.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
            }
            return acc;
        }, 0);

        // Days Active
        const uniqueDays = new Set(filteredSessions.map(s => format(new Date(s.date), 'yyyy-MM-dd'))).size;

        return { totalDuration, totalCount, totalVolume, uniqueDays };
    }, [filteredSessions]);

    const [dailyChartMetric, setDailyChartMetric] = useState<'duration' | 'volume' | 'sets'>('duration');

    // ... (existing date/filter logic)

    // Chart Data
    const chartData = useMemo(() => {
        const days = eachDayOfInterval(dateRange);
        return days.map(day => {
            const dailySessions = filteredSessions.filter(s => isSameDay(new Date(s.date), day));
            return {
                name: format(day, viewMode === 'week' ? 'EEE' : 'dd', { locale: ko }),
                date: format(day, 'yyyy-MM-dd'),
                duration: dailySessions.reduce((acc, s) => acc + (s.duration || 0), 0),
                count: dailySessions.length,
                volume: dailySessions.reduce((acc, s) => {
                    if (s.category === 'weight' && s.sets) {
                        return acc + s.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
                    }
                    return acc;
                }, 0),
                sets: dailySessions.reduce((acc, s) => acc + (s.sets?.length || 0), 0)
            };
        });
    }, [dateRange, filteredSessions, viewMode]);

    // Breakdown Data
    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredSessions.forEach(s => {
            const cat = s.category === 'weight' ? '웨이트' :
                s.category === 'cardio' ? '유산소' :
                    s.category === 'fitness' ? '피트니스' : '스포츠';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filteredSessions]);

    // Body Part Data
    const partData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredSessions.forEach(s => {
            if (s.category === 'weight' && s.targetPart) {
                counts[s.targetPart] = (counts[s.targetPart] || 0) + (s.sets?.length || 1);
            }
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredSessions]);

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header Controls */}
            {/* ... controls ... */}

            {/* ... Stats Cards ... */}

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Duration/Volume/Sets Bar Chart */}
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle>일별 운동 통계</CardTitle>
                        <Tabs value={dailyChartMetric} onValueChange={(v) => setDailyChartMetric(v as any)} className="w-[300px]">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="duration">시간(분)</TabsTrigger>
                                <TabsTrigger value="volume">볼륨(kg)</TabsTrigger>
                                <TabsTrigger value="sets">세트(수)</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => dailyChartMetric === 'duration' ? `${value}분` : dailyChartMetric === 'volume' ? `${value / 1000}t` : `${value}회`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'transparent' }}
                                    formatter={(value: any) => [
                                        dailyChartMetric === 'duration' ? `${value}분` : dailyChartMetric === 'volume' ? `${value.toLocaleString()}kg` : `${value}회`,
                                        dailyChartMetric === 'duration' ? '운동 시간' : dailyChartMetric === 'volume' ? '총 볼륨' : '세트 수'
                                    ]}
                                />
                                <Bar
                                    dataKey={dailyChartMetric}
                                    fill={dailyChartMetric === 'duration' ? '#3b82f6' : dailyChartMetric === 'volume' ? '#8b5cf6' : '#f59e0b'}
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Category Pie Chart */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>운동 종류 비율</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
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

                {/* Body Part Pie Chart (NEW) */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>부위별 운동 비중 (세트 기준)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {partData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={partData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {partData.map((entry, index) => (
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

            {/* InBody Analysis Section */}
            {inBodyEntries.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-pink-500" /> 신체 변화 (Body Composition)
                    </h3>
                    <Card>
                        <CardHeader>
                            <CardTitle>체중 및 골격근량 변화</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={inBodyEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(date) => format(new Date(date), 'MM.dd')}
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis yAxisId="left" domain={['auto', 'auto']} fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip labelFormatter={(label) => format(new Date(label), 'yyyy.MM.dd')} />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="weight" name="체중(kg)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                                    <Line yAxisId="left" type="monotone" dataKey="skeletalMuscleMass" name="골격근량(kg)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                                    <Line yAxisId="right" type="monotone" dataKey="bodyFatPercent" name="체지방률(%)" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

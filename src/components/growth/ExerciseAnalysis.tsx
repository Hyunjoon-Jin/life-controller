'use client';

import { useMemo, useState } from 'react';
import { ExerciseSession, InBodyEntry } from '@/types';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, subMonths, subWeeks, addMonths, addWeeks } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ChevronLeft, ChevronRight, Activity, Timer, Dumbbell,
    Flame, BarChart3, PieChart as PieChartIcon, TrendingUp, Sparkles, Zap, Brain
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ExerciseAnalysisProps {
    sessions: ExerciseSession[];
    inBodyEntries?: InBodyEntry[];
}

export function ExerciseAnalysis({ sessions, inBodyEntries = [] }: ExerciseAnalysisProps) {
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());

    const COLORS = ['#f43f5e', '#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'];

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
        const uniqueDays = new Set(filteredSessions.map(s => format(new Date(s.date), 'yyyy-MM-dd'))).size;

        return { totalDuration, totalCount, totalVolume, uniqueDays };
    }, [filteredSessions]);

    const [dailyChartMetric, setDailyChartMetric] = useState<'duration' | 'volume' | 'sets'>('duration');

    // Chart Data
    const chartData = useMemo(() => {
        const days = eachDayOfInterval(dateRange);
        return days.map(day => {
            const dailySessions = filteredSessions.filter(s => isSameDay(new Date(s.date), day));
            return {
                name: format(day, viewMode === 'week' ? 'EEE' : 'dd', { locale: ko }).toUpperCase(),
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

    const customTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-premium border border-white/10 p-5 rounded-2xl shadow-2xl backdrop-blur-xl">
                    <p className="text-[10px] font-black tracking-widest text-white/40 mb-2 uppercase">{label}</p>
                    <p className="text-lg font-black text-white uppercase tracking-tighter">
                        {payload[0].value.toLocaleString()}
                        <small className="text-[9px] ml-1 opacity-40">
                            {dailyChartMetric === 'duration' ? '분' : dailyChartMetric === 'volume' ? 'kg' : '세트'}
                        </small>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-full flex flex-col gap-10">
            {/* Header / Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center border border-sky-500/30">
                        <Brain className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-widest uppercase mb-1">운동 분석</h3>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] italic">운동 성과에 대한 심층 분석</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
                    <Button variant="ghost" size="icon" onClick={() => navigate('prev')} className="h-10 w-10 text-white/40 hover:text-white hover:bg-white/5">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="px-6 text-sm font-black text-white tracking-widest uppercase">
                        {viewMode === 'week'
                            ? `${format(dateRange.start, 'M월 dd일', { locale: ko })} - ${format(dateRange.end, 'M월 dd일', { locale: ko })}`
                            : format(currentDate, 'yyyy년 M월', { locale: ko }).toUpperCase()
                        }
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => navigate('next')} className="h-10 w-10 text-white/40 hover:text-white hover:bg-white/5">
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="bg-transparent border-none">
                        <TabsList className="bg-white/5 p-1 rounded-xl">
                            <TabsTrigger value="week" className="px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase data-[state=active]:bg-rose-500 data-[state=active]:text-white">주간</TabsTrigger>
                            <TabsTrigger value="month" className="px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase data-[state=active]:bg-rose-500 data-[state=active]:text-white">월간</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: '운동 횟수', value: stats.totalCount, icon: Zap, color: 'rose' },
                    { label: '활동 일수', value: stats.uniqueDays, icon: Activity, color: 'emerald' },
                    { label: '총 운동 시간', value: `${Math.floor(stats.totalDuration)}분`, icon: Timer, color: 'sky' },
                    { label: '총 중량', value: `${(stats.totalVolume / 1000).toFixed(1)}T`, icon: Flame, color: 'amber' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-premium rounded-[32px] border border-white/5 p-6 hover:bg-white/[0.03] transition-all"
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-xl mb-4 flex items-center justify-center",
                            stat.color === 'rose' ? "bg-rose-500/20 text-rose-400" :
                                stat.color === 'emerald' ? "bg-emerald-500/20 text-emerald-400" :
                                    stat.color === 'sky' ? "bg-sky-500/20 text-sky-400" : "bg-amber-500/20 text-amber-400"
                        )}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{stat.label}</div>
                        <div className="text-3xl font-black text-white tracking-tighter">{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                {/* Time Series Bar Chart */}
                <Card className="lg:col-span-2 glass-premium rounded-[40px] border border-white/5 bg-transparent overflow-hidden">
                    <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black text-white tracking-widest uppercase">일별 운동 기록</CardTitle>
                            <p className="text-[9px] font-bold text-white/20 uppercase mt-1 tracking-widest">운동 성과 로그</p>
                        </div>
                        <Tabs value={dailyChartMetric} onValueChange={(v: any) => setDailyChartMetric(v)} className="bg-white/5 p-1 rounded-xl border border-white/5">
                            <TabsList className="bg-transparent border-none p-0 flex h-auto">
                                <TabsTrigger value="duration" className="px-3 py-1.5 rounded-lg text-[8px] font-black tracking-widest uppercase data-[state=active]:bg-sky-500 data-[state=active]:text-white">시간</TabsTrigger>
                                <TabsTrigger value="volume" className="px-3 py-1.5 rounded-lg text-[8px] font-black tracking-widest uppercase data-[state=active]:bg-rose-500 data-[state=active]:text-white">중량</TabsTrigger>
                                <TabsTrigger value="sets" className="px-3 py-1.5 rounded-lg text-[8px] font-black tracking-widest uppercase data-[state=active]:bg-amber-500 data-[state=active]:text-white">세트</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardHeader>
                    <CardContent className="p-10 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontWeight: '900' }} tickMargin={10} />
                                <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontWeight: '900' }} />
                                <Tooltip content={customTooltip} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar
                                    dataKey={dailyChartMetric}
                                    fill={dailyChartMetric === 'duration' ? '#0ea5e9' : dailyChartMetric === 'volume' ? '#f43f5e' : '#f59e0b'}
                                    radius={[8, 8, 8, 8]}
                                    barSize={viewMode === 'week' ? 40 : 12}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Distribution Pie Chart */}
                <Card className="glass-premium rounded-[40px] border border-white/5 bg-transparent overflow-hidden">
                    <CardHeader className="p-10 pb-0">
                        <CardTitle className="text-xl font-black text-white tracking-widest uppercase text-center">카테고리 분포</CardTitle>
                        <p className="text-[9px] font-bold text-white/20 uppercase mt-1 tracking-widest text-center">운동 카테고리 분포</p>
                    </CardHeader>
                    <CardContent className="p-10 h-[350px]">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                                        ))}
                                    </Pie>
                                    <Tooltip content={({ active, payload }: any) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="glass-premium border border-white/10 p-4 rounded-2xl shadow-2xl">
                                                    <p className="text-[10px] font-black tracking-widest text-white uppercase">{payload[0].name}</p>
                                                    <p className="text-lg font-black text-white">{payload[0].value} <small className="text-[9px] opacity-40">회</small></p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }} />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={60}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-[10px] font-black tracking-widest text-white/40 uppercase ml-2">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-10 gap-4">
                                <PieChartIcon className="w-12 h-12" />
                                <p className="text-[10px] font-black tracking-widest uppercase">데이터가 없습니다</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Body Part Heatmap (Simulated via Bar Chart for clarity) */}
                <Card className="glass-premium rounded-[40px] border border-white/5 bg-transparent overflow-hidden">
                    <CardHeader className="p-10 pb-0">
                        <CardTitle className="text-xl font-black text-white tracking-widest uppercase">부위별 운동량</CardTitle>
                        <p className="text-[9px] font-bold text-white/20 uppercase mt-1 tracking-widest">근육 그룹 강도 (세트)</p>
                    </CardHeader>
                    <CardContent className="p-10 h-[350px]">
                        {partData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={partData} layout="vertical" margin={{ left: 10, right: 30 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        fontSize={10}
                                        width={60}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: 'rgba(255,255,255,0.4)', fontWeight: '900' }}
                                    />
                                    <Tooltip content={({ active, payload }: any) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="glass-premium border border-white/10 p-4 rounded-xl shadow-2xl">
                                                    <p className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-1">{payload[0].payload.name}</p>
                                                    <p className="text-lg font-black text-white">{payload[0].value} <small className="text-[9px] opacity-40">세트</small></p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }} />
                                    <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                                        {partData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-10 gap-4">
                                <Dumbbell className="w-12 h-12" />
                                <p className="text-[10px] font-black tracking-widest uppercase">웨이트 기록 없음</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* InBody Long-term Trends */}
                {inBodyEntries.length > 0 && (
                    <Card className="lg:col-span-2 glass-premium rounded-[40px] border border-white/5 bg-transparent overflow-hidden">
                        <CardHeader className="p-10 pb-0">
                            <div>
                                <CardTitle className="text-xl font-black text-white tracking-widest uppercase">체성분 변화</CardTitle>
                                <p className="text-[9px] font-bold text-white/20 uppercase mt-1 tracking-widest">체성분 기록</p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10 h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={inBodyEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}>
                                    <defs>
                                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorMuscle" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: 'rgba(255,255,255,0.2)', fontWeight: '900' }}
                                        tickMargin={10}
                                    />
                                    <YAxis yAxisId="left" domain={['auto', 'auto']} fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.2)' }} />
                                    <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.2)' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }}
                                        labelClassName="text-[10px] font-black uppercase tracking-widest mb-3 border-b border-white/5 pb-2 block"
                                    />
                                    <Legend
                                        verticalAlign="top"
                                        align="right"
                                        iconType="circle"
                                        formatter={(value) => <span className="text-[10px] font-black tracking-widest text-white/40 uppercase ml-2">{value}</span>}
                                    />
                                    <Area yAxisId="left" type="monotone" dataKey="weight" name="체중 (kg)" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorWeight)" dot={{ r: 4, fill: '#0ea5e9', stroke: '#000', strokeWidth: 2 }} />
                                    <Area yAxisId="left" type="monotone" dataKey="skeletalMuscleMass" name="근육량 (kg)" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorMuscle)" dot={{ r: 4, fill: '#8b5cf6', stroke: '#000', strokeWidth: 2 }} />
                                    <Line yAxisId="right" type="monotone" dataKey="bodyFatPercent" name="체지방 (%)" stroke="#f43f5e" strokeWidth={4} dot={{ r: 4, fill: '#f43f5e', stroke: '#000', strokeWidth: 2 }} strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

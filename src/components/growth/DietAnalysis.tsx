'use client';

import { useMemo, useState } from 'react';
import { useData } from '@/context/DataProvider';
import { DietEntry, InBodyEntry, ExerciseSession } from '@/types';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, subWeeks, addWeeks, subMonths, addMonths, closestIndexTo, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ChevronLeft, ChevronRight, Utensils, Flame, Pizza, Droplet,
    Wheat, Award, AlertCircle, TrendingUp, Zap, Activity, Brain, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend, Line, ComposedChart, Area, AreaChart
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DietAnalysisProps {
    entries: DietEntry[];
    inBodyEntries: InBodyEntry[];
    exerciseSessions: ExerciseSession[];
}

export function DietAnalysis({ entries, inBodyEntries, exerciseSessions }: DietAnalysisProps) {
    const { bodyCompositionGoal } = useData();
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());

    const MACRO_COLORS = { carbs: '#0ea5e9', protein: '#f43f5e', fat: '#f59e0b' };
    const COLORS = ['#10b981', '#f43f5e', '#0ea5e9', '#f59e0b', '#8b5cf6'];

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

        const foodCounts: Record<string, number> = {};
        filteredEntries.forEach(entry => {
            if (entry.items) {
                entry.items.forEach(item => { foodCounts[item.name] = (foodCounts[item.name] || 0) + 1; });
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
            const dailyEntries = filteredEntries.filter(e => isSameDay(new Date(e.date), day));
            const calories = dailyEntries.reduce((acc, e) => acc + (e.totalCalories || (e as any).calories || 0), 0);
            const macros = dailyEntries.reduce((acc, e) => ({
                carbs: acc.carbs + (e.totalMacros?.carbs || (e as any).macros?.carbs || 0),
                protein: acc.protein + (e.totalMacros?.protein || (e as any).macros?.protein || 0),
                fat: acc.fat + (e.totalMacros?.fat || (e as any).macros?.fat || 0),
            }), { carbs: 0, protein: 0, fat: 0 });

            const carbsKcal = macros.carbs * 4;
            const proteinKcal = macros.protein * 4;
            const fatKcal = macros.fat * 9;

            const dailyExercise = exerciseSessions.filter(e => isSameDay(new Date(e.date), day));
            const exerciseBurn = dailyExercise.reduce((acc, s) => {
                let met = 5;
                if (s.category === 'cardio') met = 8;
                if (s.category === 'sport') met = 7;
                return acc + (s.duration * met);
            }, 0);

            let bmr = 0;
            const closestIdx = closestIndexTo(day, sortedInBody.map(i => new Date(i.date)));
            if (closestIdx !== undefined && sortedInBody[closestIdx]) {
                bmr = sortedInBody[closestIdx].basalMetabolicRate || 0;
            }
            if (bmr === 0) bmr = 1500;

            let dailyGoalAdj = 0;
            if (bodyCompositionGoal && bodyCompositionGoal.targetWeight && bodyCompositionGoal.targetDate) {
                const startWeight = bodyCompositionGoal.startWeight || 70;
                const targetWeight = bodyCompositionGoal.targetWeight;
                const weightDiff = targetWeight - startWeight;
                const totalCalorieDiff = weightDiff * 7700;
                const goalStartDate = new Date(bodyCompositionGoal.startDate || new Date());
                const goalTargetDate = new Date(bodyCompositionGoal.targetDate);
                const totalDays = differenceInDays(goalTargetDate, goalStartDate) || 1;
                dailyGoalAdj = totalCalorieDiff / totalDays;
                if (dailyGoalAdj < -1000) dailyGoalAdj = -1000;
                if (dailyGoalAdj > 1000) dailyGoalAdj = 1000;
            }

            let target = bmr + exerciseBurn + dailyGoalAdj;
            if (target < 1200) target = 1200;

            return {
                name: format(day, viewMode === 'week' ? 'EEE' : 'dd', { locale: ko }).toUpperCase(),
                date: dateStr,
                calories,
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
            { name: 'CARBS', value: carbs, color: '#0ea5e9' },
            { name: 'PROT', value: protein, color: '#f43f5e' },
            { name: 'LIPID', value: fat, color: '#f59e0b' },
        ];
    }, [stats]);

    return (
        <div className="h-full flex flex-col gap-10">
            {/* Header / Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Activity className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-widest uppercase mb-1">METABOLIC ANALYSIS</h3>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] italic">DIGESTIVE CHRONICLE & ENERGY BALANCE</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
                    <Button variant="ghost" size="icon" onClick={() => navigate('prev')} className="h-10 w-10 text-white/40 hover:text-white hover:bg-white/5">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="px-6 text-sm font-black text-white tracking-widest uppercase">
                        {viewMode === 'week'
                            ? `${format(dateRange.start, 'MMM dd')} - ${format(dateRange.end, 'MMM dd')}`
                            : format(currentDate, 'MMMM yyyy').toUpperCase()
                        }
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => navigate('next')} className="h-10 w-10 text-white/40 hover:text-white hover:bg-white/5">
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="bg-transparent border-none">
                        <TabsList className="bg-white/5 p-1 rounded-xl">
                            <TabsTrigger value="week" className="px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase data-[state=active]:bg-emerald-500 data-[state=active]:text-white">WEEK</TabsTrigger>
                            <TabsTrigger value="month" className="px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase data-[state=active]:bg-emerald-500 data-[state=active]:text-white">MONTH</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'AVG CALORIES', value: stats.uniqueDays > 0 ? Math.round(stats.totalCalories / stats.uniqueDays) : 0, icon: Flame, color: 'rose' },
                    { label: 'TOTAL CARBS', value: `${Math.round(stats.totalMacros.carbs)}G`, icon: Wheat, color: 'sky' },
                    { label: 'TOTAL PROTEIN', value: `${Math.round(stats.totalMacros.protein)}G`, icon: Pizza, color: 'rose' },
                    { label: 'TOTAL LIPIDS', value: `${Math.round(stats.totalMacros.fat)}G`, icon: Droplet, color: 'amber' },
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
                                stat.color === 'sky' ? "bg-sky-500/20 text-sky-400" : "bg-amber-500/20 text-amber-400"
                        )}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{stat.label}</div>
                        <div className="text-3xl font-black text-white tracking-tighter">{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Daily Energy Consumption Chart */}
                <Card className="lg:col-span-2 glass-premium rounded-[40px] border border-white/5 bg-transparent overflow-hidden">
                    <CardHeader className="p-10 pb-0">
                        <CardTitle className="text-xl font-black text-white tracking-widest uppercase">ENERGY DYNAMICS</CardTitle>
                        <p className="text-[9px] font-bold text-white/20 uppercase mt-1 tracking-widest">INTAKE VS METABOLIC TARGET</p>
                    </CardHeader>
                    <CardContent className="p-10 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontWeight: '900' }} tickMargin={10} />
                                <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontWeight: '900' }} />
                                <Tooltip
                                    content={({ active, payload, label }: any) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="glass-premium border border-white/10 p-5 rounded-2xl shadow-2xl backdrop-blur-xl">
                                                    <p className="text-[10px] font-black tracking-widest text-white/40 mb-3 uppercase border-b border-white/5 pb-2">{label}</p>
                                                    {payload.map((p: any) => (
                                                        <div key={p.name} className="flex items-center justify-between gap-6 mb-2 last:mb-0">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill || p.stroke }} />
                                                                <span className="text-[9px] font-black text-white/40 uppercase">{p.name}</span>
                                                            </div>
                                                            <span className="text-xs font-black text-white">{Math.round(p.value)} <small className="text-[8px] opacity-40">KCAL</small></span>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="carbsKcal" stackId="a" fill="#0ea5e9" name="CARBS" barSize={30} />
                                <Bar dataKey="proteinKcal" stackId="a" fill="#f43f5e" name="PROT" barSize={30} />
                                <Bar dataKey="fatKcal" stackId="a" fill="#f59e0b" name="LIPID" barSize={30} radius={[6, 6, 0, 0]} />
                                <Line type="step" dataKey="target" stroke="#10b981" strokeWidth={4} strokeDasharray="8 8" name="TARGET" dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Macro Ratio Breakdown */}
                <Card className="glass-premium rounded-[40px] border border-white/5 bg-transparent overflow-hidden">
                    <CardHeader className="p-10 pb-0 text-center">
                        <CardTitle className="text-xl font-black text-white tracking-widest uppercase">RATIO VARIANCE</CardTitle>
                        <p className="text-[9px] font-bold text-white/20 uppercase mt-1 tracking-widest">MACRONUTRIENT DISTRIBUTION</p>
                    </CardHeader>
                    <CardContent className="p-10 h-[400px] flex flex-col justify-between">
                        {macroRatioData.length > 0 ? (
                            <div className="flex-1">
                                <ResponsiveContainer width="100%" height="250px">
                                    <PieChart>
                                        <Pie
                                            data={macroRatioData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={10}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {macroRatioData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="grid grid-cols-3 gap-2 mt-4">
                                    {macroRatioData.map(item => (
                                        <div key={item.name} className="flex flex-col items-center p-3 bg-white/5 rounded-2xl border border-white/5">
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">{item.name}</span>
                                            <span className="text-sm font-black text-white">{Math.round((item.value / stats.totalMacros.carbs + stats.totalMacros.protein + stats.totalMacros.fat) * 100) || 0}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-10 gap-4">
                                <PieChartIcon className="w-12 h-12" />
                                <p className="text-[10px] font-black tracking-widest uppercase">DATA AWAITING CALIBRATION</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Top Entities Heatmap */}
            <Card className="glass-premium rounded-[40px] border border-white/5 bg-transparent overflow-hidden">
                <CardHeader className="p-10 pb-0">
                    <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-amber-500" />
                        <CardTitle className="text-xl font-black text-white tracking-widest uppercase">RECURRING ENTITIES</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-10">
                    {stats.topFoods.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            {stats.topFoods.map((food, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={idx}
                                    className="relative group p-6 glass-premium border border-white/5 rounded-[32px] overflow-hidden hover:bg-white/5 transition-all text-center"
                                >
                                    <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 rounded-bl-3xl flex items-center justify-center font-black text-xs text-white/10 group-hover:text-amber-500/40 transition-colors">
                                        0{idx + 1}
                                    </div>
                                    <div className="text-sm font-black text-white uppercase tracking-tighter mb-2 truncate px-4">{food.name}</div>
                                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{food.count} OCCURRENCES</div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center opacity-10 font-black text-[10px] tracking-[0.3em] uppercase border-2 border-dashed border-white/5 rounded-3xl text-white">NO LOG HISTORY DETECTED</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

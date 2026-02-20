'use client';

import { useData } from '@/context/DataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { eachDayOfInterval, format, isSameDay, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
    BookOpen, Clock, Trophy, Activity, Zap,
    Target, TrendingUp, BarChart3, Fingerprint, Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LanguageStatsProps {
    language: string;
}

export function LanguageStats({ language }: LanguageStatsProps) {
    const { languageEntries = [] } = useData();

    // Filter entries for this language
    const entries = languageEntries.filter(e => e.language === language);

    // Calculate totals
    const totalTime = entries.reduce((acc, curr) => acc + (curr.studyTime || 0), 0);
    const totalVocab = entries.reduce((acc, curr) => acc + (curr.vocabulary?.length || 0), 0);
    const totalDays = new Set(entries.map(e => format(new Date(e.date), 'yyyy-MM-dd'))).size;

    // Prepare chart data (Last 7 days)
    const today = new Date();
    const last7Days = eachDayOfInterval({
        start: subDays(today, 6),
        end: today
    });

    const chartData = last7Days.map(day => {
        const dayEntries = entries.filter(e => isSameDay(new Date(e.date), day));
        const minutes = dayEntries.reduce((acc, curr) => acc + (curr.studyTime || 0), 0);
        return {
            name: format(day, 'E', { locale: ko }).toUpperCase(),
            minutes: minutes,
            date: format(day, 'MM.dd')
        };
    });

    return (
        <div className="space-y-8 pb-12">
            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'TOTAL ACQUISITION', value: `${Math.floor(totalTime / 60)}H ${totalTime % 60}M`, icon: Clock, color: 'text-indigo-400', sub: 'ACCUMULATED TEMPORAL DATA' },
                    { label: 'LEXICAL COUNT', value: `${totalVocab} WORDS`, icon: BookOpen, color: 'text-emerald-400', sub: 'SECURED NEURAL ENTRIES' },
                    { label: 'ACTIVE STREAK', value: `${totalDays} DAYS`, icon: Trophy, color: 'text-amber-400', sub: 'CONSISTENCY PROTOCOL' },
                ].map((stat, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx}
                    >
                        <Card className="glass-premium border-white/5 bg-white/[0.02] overflow-hidden rounded-[32px] group relative h-full">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                <stat.icon className="w-16 h-16 text-white" strokeWidth={1} />
                            </div>
                            <CardContent className="p-8 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center", stat.color)}>
                                        <stat.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[9px] font-black text-white/20 tracking-[0.3em] uppercase">{stat.label}</span>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-white tracking-tighter uppercase">{stat.value}</div>
                                    <p className="text-[9px] font-bold text-white/10 tracking-widest uppercase mt-1 italic">{stat.sub}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Cinematic Chart */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="glass-premium border-white/5 bg-white/[0.01] overflow-hidden rounded-[40px] relative">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                        <Activity className="w-32 h-32 text-indigo-500" />
                    </div>
                    <CardHeader className="p-10 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                                    <BarChart3 className="w-5 h-5 text-indigo-400" /> TEMPORAL FLUCTUATION
                                </CardTitle>
                                <p className="text-[10px] font-bold text-white/20 tracking-[0.2em] uppercase italic">SESSION INTENSITY: LAST 7 CYCLES</p>
                            </div>
                            <div className="hidden sm:flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                    <span className="text-[8px] font-black text-white/40 tracking-widest uppercase">MINUTES ACQUIRED</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 pt-0">
                        <div className="h-[300px] w-full mt-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="rgba(255,255,255,0.1)"
                                        fontSize={9}
                                        fontWeight={900}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={15}
                                    />
                                    <YAxis
                                        stroke="rgba(255,255,255,0.1)"
                                        fontSize={9}
                                        fontWeight={900}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}M`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="glass-premium border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                                                        <p className="text-[9px] font-black text-white/20 tracking-widest uppercase mb-1">{payload[0].payload.date}</p>
                                                        <p className="text-xl font-black text-indigo-400 tracking-tighter">{payload[0].value} MIN</p>
                                                        <p className="text-[8px] font-bold text-white/10 tracking-widest uppercase mt-1 italic">INTENSITY VERIFIED</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar
                                        dataKey="minutes"
                                        fill="url(#barGradient)"
                                        radius={[12, 12, 0, 0]}
                                        animationDuration={1500}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fillOpacity={entry.minutes === 0 ? 0.1 : 1}
                                                stroke={entry.minutes > 0 ? 'rgba(99,102,241,0.3)' : 'transparent'}
                                                strokeWidth={1}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

import { cn } from '@/lib/utils';

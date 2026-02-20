'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/context/DataProvider';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { format, differenceInDays } from 'date-fns';
import {
    Plus, Trash2, Scale, Activity, TrendingUp, Ruler, Zap, Heart,
    Target, Calendar as CalendarIcon, ArrowRight, Camera, ScanLine,
    Loader2, Sparkles, Brain, Fingerprint, ShieldCheck, ChevronRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { createWorker } from 'tesseract.js';
import { motion, AnimatePresence } from 'framer-motion';

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

            const parse = (patterns: RegExp[]) => {
                for (let p of patterns) {
                    const m = text.match(p);
                    if (m && m[1]) return m[1];
                    if (m && m[2]) return m[2];
                }
                return '';
            };

            const w = parse([/(?:체중|Weight)\s*([\d.]+)/i, /([\d.]+)\s*(?:kg)?\s*(?:체중)/]);
            const m = parse([/(?:골격근량|Skeletal Muscle Mass)\s*([\d.]+)/i]);
            const f = parse([/(?:체지방량|Body Fat Mass)\s*([\d.]+)/i]);
            const p = parse([/(?:체지방률|Percent Body Fat)\s*([\d.]+)/i]);
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

            await worker.terminate();
        } catch (error) {
            console.error(error);
        } finally {
            setIsScanning(false);
        }
    };

    const sortedEntries = (inBodyEntries || []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latestEntry = sortedEntries[sortedEntries.length - 1];

    useEffect(() => {
        if (isGoalDialogOpen && bodyCompositionGoal) {
            if (bodyCompositionGoal.targetDate) setGoalDate(new Date(bodyCompositionGoal.targetDate));
            if (bodyCompositionGoal.targetWeight) setGoalWeight(bodyCompositionGoal.targetWeight.toString());
            if (bodyCompositionGoal.targetMuscle) setGoalMuscle(bodyCompositionGoal.targetMuscle.toString());
            if (bodyCompositionGoal.targetFatPercent) setGoalFatPercent(bodyCompositionGoal.targetFatPercent.toString());
        } else if (isGoalDialogOpen && !bodyCompositionGoal) {
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            setGoalDate(nextMonth);
        }
    }, [isGoalDialogOpen, bodyCompositionGoal]);

    useEffect(() => {
        if (isDialogOpen && latestEntry) {
            if (!height && latestEntry.height) setHeight(latestEntry.height.toString());
        }
    }, [isDialogOpen, latestEntry, height]);

    useEffect(() => {
        if (height && weight) {
            const h = parseFloat(height) / 100;
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
        setDate(new Date()); setWeight(''); setSkeletalMuscle(''); setBodyFat(''); setBodyFatPercent(''); setBmi(''); setBmr(''); setVisceralFat(''); setMemo('');
    };

    const chartData = sortedEntries.map(entry => ({
        name: format(new Date(entry.date), 'MM.dd'),
        weight: entry.weight,
        muscle: entry.skeletalMuscleMass,
        fat: entry.bodyFatMass,
    }));

    let goalSummary = null;
    if (bodyCompositionGoal) {
        const daysLeft = bodyCompositionGoal.targetDate ? differenceInDays(new Date(bodyCompositionGoal.targetDate), new Date()) : 0;
        const currentWeight = latestEntry?.weight || 0;
        const currentMuscle = latestEntry?.skeletalMuscleMass || 0;
        const currentFat = latestEntry?.bodyFatPercent || 0;
        const weightDiff = bodyCompositionGoal.targetWeight && latestEntry ? bodyCompositionGoal.targetWeight - latestEntry.weight : 0;

        goalSummary = {
            daysLeft, weightDiff, targetWeight: bodyCompositionGoal.targetWeight,
            currentWeight, targetMuscle: bodyCompositionGoal.targetMuscle,
            currentMuscle, targetFat: bodyCompositionGoal.targetFatPercent, currentFat
        };
    }

    const listEntries = [...sortedEntries].reverse();

    return (
        <div className="h-full flex flex-col glass-premium rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-emerald-500/[0.03] pointer-events-none" />

            {/* Header Area */}
            <div className="p-8 pb-4 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(99,102,241,0.5)]">
                            <Fingerprint className="w-6 h-6 text-white" strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">BIOMETRIC EVOLUTION</h2>
                            <p className="text-[10px] font-bold text-white/20 tracking-[0.3em] uppercase mt-2 italic flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3 text-indigo-500" /> PHYSIOLOGICAL INTEGRITY: VERIFIED
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => setIsGoalDialogOpen(true)}
                            variant="outline"
                            className="h-12 px-6 rounded-2xl border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-black text-[10px] tracking-widest uppercase hover:bg-indigo-500/20"
                        >
                            <Target className="w-4 h-4 mr-2" /> SET OBJECTIVE
                        </Button>
                        <Button
                            onClick={() => { resetEntryForm(); setIsDialogOpen(true); }}
                            className="h-12 px-6 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-[10px] tracking-widest uppercase shadow-xl transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4 mr-2" strokeWidth={3} /> NEW SCAN
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0 space-y-10 relative z-10">
                {/* Goal Progress Banner */}
                {goalSummary && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-premium rounded-[40px] border border-indigo-500/20 p-10 flex flex-col md:flex-row items-center justify-between gap-10 bg-indigo-500/[0.03] shadow-inner"
                    >
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-black text-white tracking-widest uppercase">TRAJECTORY ANALYSIS</h3>
                            </div>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                TARGET HORIZON: <span className="text-white ml-2">{format(new Date(bodyCompositionGoal!.targetDate), 'MMM dd, yyyy').toUpperCase()}</span>
                                <span className="mx-4 font-black text-indigo-500">{goalSummary.daysLeft > 0 ? `T-MINUS ${goalSummary.daysLeft} DAYS` : 'CRITICAL THRESHOLD'}</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-16">
                            {goalSummary.targetWeight && (
                                <div className="text-center">
                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-2">MASS PKAL</span>
                                    <div className="flex items-end gap-3 justify-center">
                                        <span className="text-2xl font-black text-white tracking-tighter">{goalSummary.currentWeight}</span>
                                        <ChevronRight className="w-4 h-4 text-white/10 mb-1" />
                                        <span className="text-2xl font-black text-indigo-500 tracking-tighter">{goalSummary.targetWeight}</span>
                                    </div>
                                    <div className="mt-1 text-[9px] font-black uppercase text-indigo-400/60">{goalSummary.weightDiff > 0 ? '+' : ''}{goalSummary.weightDiff.toFixed(1)} KG VARIANCE</div>
                                </div>
                            )}
                            {goalSummary.targetMuscle && (
                                <div className="text-center">
                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-2">MUSCLE LOAD</span>
                                    <div className="flex items-end gap-3 justify-center">
                                        <span className="text-2xl font-black text-white tracking-tighter">{goalSummary.currentMuscle}</span>
                                        <ChevronRight className="w-4 h-4 text-white/10 mb-1" />
                                        <span className="text-2xl font-black text-emerald-500 tracking-tighter">{goalSummary.targetMuscle}</span>
                                    </div>
                                </div>
                            )}
                            {goalSummary.targetFat && (
                                <div className="text-center">
                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-2">FAT RATIO</span>
                                    <div className="flex items-end gap-3 justify-center">
                                        <span className="text-2xl font-black text-white tracking-tighter">{goalSummary.currentFat}%</span>
                                        <ChevronRight className="w-4 h-4 text-white/10 mb-1" />
                                        <span className="text-2xl font-black text-rose-500 tracking-tighter">{goalSummary.targetFat}%</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Evolution Chart */}
                {sortedEntries.length >= 2 ? (
                    <Card className="glass-premium rounded-[40px] border border-white/5 bg-transparent overflow-hidden">
                        <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black text-white tracking-widest uppercase">CHRONOLOGICAL EVOLUTION</CardTitle>
                                <p className="text-[9px] font-bold text-white/20 uppercase mt-1 tracking-widest">SKELETAL & TISSUE MATURATION</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">MASS</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">MUSCLE</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">FAT</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10 h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorMuscle" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontWeight: '900' }} tickMargin={15} />
                                    <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontWeight: '900' }} domain={['auto', 'auto']} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <Tooltip
                                        content={({ active, payload, label }: any) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="glass-premium border border-white/10 p-5 rounded-2xl shadow-2xl backdrop-blur-xl">
                                                        <p className="text-[10px] font-black tracking-widest text-white/40 mb-3 uppercase border-b border-white/5 pb-2">{label}</p>
                                                        {payload.map((p: any) => (
                                                            <div key={p.name} className="flex items-center justify-between gap-6 mb-2 last:mb-0">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.stroke }} />
                                                                    <span className="text-[9px] font-black text-white/40 uppercase">{p.name}</span>
                                                                </div>
                                                                <span className="text-xs font-black text-white">{p.value} <small className="text-[8px] opacity-40 uppercase">kg</small></span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area type="monotone" dataKey="weight" name="MASS" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorWeight)" dot={{ r: 4, fill: '#6366f1', stroke: '#000', strokeWidth: 2 }} />
                                    <Area type="monotone" dataKey="muscle" name="MUSCLE" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorMuscle)" dot={{ r: 4, fill: '#10b981', stroke: '#000', strokeWidth: 2 }} />
                                    <Area type="monotone" dataKey="fat" name="FAT" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorFat)" dot={{ r: 4, fill: '#f43f5e', stroke: '#000', strokeWidth: 2 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center opacity-10 gap-4 border-2 border-dashed border-white/10 rounded-[40px]">
                        <TrendingUp className="w-12 h-12" />
                        <p className="text-[10px] font-black tracking-[0.3em] uppercase">SYSTEM REQUIRES DUAL DATA POINTS FOR TREND CALIMBRATION</p>
                    </div>
                )}

                {/* Scanned Entries Feed */}
                <div className="space-y-6 pb-12">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-xl font-black text-white tracking-widest uppercase">SCAN CHRONICLE</h3>
                        </div>
                    </div>

                    {listEntries.length === 0 ? (
                        <div className="py-20 text-center opacity-5 font-black text-[12px] tracking-[0.5em] uppercase">VOID DATA SET</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {listEntries.map((entry, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={entry.id}
                                    className="group glass-premium rounded-[40px] border border-white/5 p-8 hover:bg-white/[0.03] transition-all relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-[80px] -mr-8 -mt-8 flex items-center justify-center pointer-events-none">
                                        <div className="text-[10px] font-black text-white/5 transform rotate-45 mt-4 ml-4">SCAN ID: {entry.id.slice(0, 4)}</div>
                                    </div>

                                    <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8 relative z-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                                                <span className="text-[10px] font-black text-white/20 uppercase leading-none mb-1">{format(new Date(entry.date), 'MMM').toUpperCase()}</span>
                                                <span className="text-2xl font-black text-white tracking-tighter leading-none">{format(new Date(entry.date), 'dd')}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-white tracking-widest uppercase">SCAN PROTOCOL {listEntries.length - idx}</h4>
                                                <p className="text-[10px] font-bold text-white/20 uppercase mt-1 italic">{format(new Date(entry.date), 'yyyy.MM.dd | HH:mm')}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 flex-1 lg:max-w-2xl">
                                            <div className="flex flex-col bg-indigo-500/10 p-4 rounded-3xl border border-indigo-500/20 shadow-inner">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Scale className="w-3.5 h-3.5 text-indigo-400" />
                                                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">MASS</span>
                                                </div>
                                                <span className="text-xl font-black text-white tracking-tighter">{entry.weight} <small className="text-[10px] opacity-40">KG</small></span>
                                            </div>

                                            <div className="flex flex-col bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/20 shadow-inner">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Brain className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">MUSCLE</span>
                                                </div>
                                                <span className="text-xl font-black text-white tracking-tighter">{entry.skeletalMuscleMass} <small className="text-[10px] opacity-40">KG</small></span>
                                            </div>

                                            <div className="flex flex-col bg-rose-500/10 p-4 rounded-3xl border border-rose-500/20 shadow-inner">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Droplet className="w-3.5 h-3.5 text-rose-400" />
                                                    <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest">FAT</span>
                                                </div>
                                                <div className="flex items-end gap-2">
                                                    <span className="text-xl font-black text-white tracking-tighter">{entry.bodyFatMass} <small className="text-[10px] opacity-40">KG</small></span>
                                                    <span className="text-[10px] font-black text-rose-500 mb-1">{entry.bodyFatPercent}%</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col bg-amber-500/10 p-4 rounded-3xl border border-amber-500/20 shadow-inner">
                                                <div className="flex items-center gap-2 mb-2 focus:outline-none">
                                                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                                                    <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest">BASAL</span>
                                                </div>
                                                <span className="text-xl font-black text-white tracking-tighter">{entry.basalMetabolicRate} <small className="text-[9px] opacity-40">KCAL</small></span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="hidden xl:flex flex-col text-right">
                                                <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">METRIC CLASSIFICATION</div>
                                                <div className="flex gap-2">
                                                    <span className="px-2 py-0.5 rounded-lg bg-white/5 text-[9px] font-black text-sky-500 border border-sky-500/20 uppercase tracking-widest">BMI {entry.bmi}</span>
                                                    <span className="px-2 py-0.5 rounded-lg bg-white/5 text-[9px] font-black text-amber-500 border border-amber-500/20 uppercase tracking-widest">VISC Lv.{entry.visceralFatLevel}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deleteInBodyEntry(entry.id)}
                                                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 hover:bg-rose-500 hover:text-white transition-all transform hover:rotate-6 active:scale-90"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {entry.memo && (
                                        <div className="mt-8 pt-6 border-t border-white/5">
                                            <p className="text-[10px] font-bold text-white/30 italic uppercase tracking-widest flex items-center gap-3">
                                                <Sparkles className="w-3 h-3 text-amber-500" /> OBSERVATION LOG: {entry.memo}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Goal Setting Dialog */}
            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                <DialogContent className="glass-premium border border-indigo-500/20 text-white rounded-[40px] p-10 max-w-md shadow-2xl backdrop-blur-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase mb-2">CALIBRATE OBJECTIVE</DialogTitle>
                        <DialogDescription className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] italic leading-relaxed">
                            DEFINE PHYSIOLOGICAL TARGET PARAMETERS AND TEMPORAL DEADLINES FOR EVOLUTIONARY TRACKING.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-8 mt-10">
                        <div className="space-y-3">
                            <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest">TARGET DATE HORIZON</Label>
                            <Input
                                type="date"
                                value={format(goalDate, 'yyyy-MM-dd')}
                                onChange={(e) => setGoalDate(new Date(e.target.value))}
                                className="h-14 font-black text-sm bg-white/5 border-white/5 rounded-2xl text-white focus:ring-indigo-500/30"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest">DESIRED MASS (KG)</Label>
                                <Input
                                    type="number"
                                    value={goalWeight}
                                    onChange={e => setGoalWeight(e.target.value)}
                                    placeholder={latestEntry?.weight?.toString() || "0.0"}
                                    className="h-14 font-black text-sm bg-white/5 border-white/5 rounded-2xl text-white"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest">MUSCLE TARGET (KG)</Label>
                                <Input
                                    type="number"
                                    value={goalMuscle}
                                    onChange={e => setGoalMuscle(e.target.value)}
                                    placeholder={latestEntry?.skeletalMuscleMass?.toString() || "0.0"}
                                    className="h-14 font-black text-sm bg-white/5 border-white/5 rounded-2xl text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest">OPTIMAL FAT PERCENT (%)</Label>
                            <Input
                                type="number"
                                value={goalFatPercent}
                                onChange={e => setGoalFatPercent(e.target.value)}
                                placeholder={latestEntry?.bodyFatPercent?.toString() || "0.0"}
                                className="h-14 font-black text-sm bg-white/5 border-white/5 rounded-2xl text-white"
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-12">
                        <Button
                            onClick={handleSaveGoal}
                            className="w-full h-14 rounded-2xl bg-indigo-500 hover:bg-indigo-600 font-black text-sm tracking-widest uppercase shadow-xl"
                        >
                            COMMIT TARGET
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Entry Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass-premium border border-white/10 text-white rounded-[40px] p-0 shadow-2xl sm:max-w-[600px] overflow-hidden">
                    <DialogHeader className="p-10 pb-0">
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase mb-2">INITIALIZE SCAN</DialogTitle>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] italic">CAPTURING HIGH-FIDELITY BIOMETRIC INPUT FOR ANALYTICAL PROCESSING</p>
                    </DialogHeader>

                    <div className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        <div className="space-y-3">
                            <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest">TIMESTAMP & OCR SCAN</Label>
                            <div className="flex gap-4">
                                <Input
                                    type="datetime-local"
                                    value={format(date, "yyyy-MM-dd'T'HH:mm")}
                                    onChange={(e) => setDate(new Date(e.target.value))}
                                    className="h-14 flex-1 font-black text-xs bg-white/5 border-white/5 rounded-2xl text-white"
                                />
                                <div className="relative">
                                    <input type="file" accept="image/*" id="ocr-upload" className="hidden" onChange={handleOCR} disabled={isScanning} />
                                    <Label
                                        htmlFor="ocr-upload"
                                        className={cn(
                                            "flex items-center justify-center gap-3 h-14 px-6 rounded-2xl border font-black text-[10px] tracking-widest uppercase cursor-pointer transition-all shadow-xl",
                                            isScanning ? "bg-white/5 border-white/5 opacity-50 cursor-not-allowed" : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20"
                                        )}
                                    >
                                        {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
                                        {isScanning ? 'SCANNING...' : 'SCAN SHEET'}
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-[32px] border border-white/5 p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-2">HEIGHT (CM)</Label>
                                    <Input value={height} onChange={e => setHeight(e.target.value)} className="h-12 bg-white/5 border-none text-xl font-black rounded-xl text-center" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[8px] font-black text-rose-500 uppercase tracking-widest ml-2">MASS PKAL (KG) *</Label>
                                    <Input value={weight} onChange={e => setWeight(e.target.value)} className="h-12 bg-white/5 border-none text-xl font-black rounded-xl text-center text-rose-500" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-2">MUSCLE (KG)</Label>
                                    <Input value={skeletalMuscle} onChange={e => setSkeletalMuscle(e.target.value)} className="h-12 bg-white/5 border-none text-xl font-black rounded-xl text-center text-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-2">BASAL BMR (KCAL)</Label>
                                    <Input value={bmr} onChange={e => setBmr(e.target.value)} className="h-12 bg-white/5 border-none text-xl font-black rounded-xl text-center text-amber-500" />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-2">BODY FAT MASS (KG)</Label>
                                        <Input
                                            value={bodyFat}
                                            onChange={e => {
                                                const val = e.target.value; setBodyFat(val);
                                                if (weight && parseFloat(weight) > 0 && val) {
                                                    const pct = (parseFloat(val) / parseFloat(weight)) * 100;
                                                    setBodyFatPercent(pct.toFixed(1));
                                                }
                                            }}
                                            className="h-12 bg-white/5 border-none text-xl font-black rounded-xl text-center"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-2">FAT RATIO (%)</Label>
                                        <Input
                                            value={bodyFatPercent}
                                            onChange={e => {
                                                const val = e.target.value; setBodyFatPercent(val);
                                                if (weight && parseFloat(weight) > 0 && val) {
                                                    const mass = parseFloat(weight) * (parseFloat(val) / 100);
                                                    setBodyFat(mass.toFixed(1));
                                                }
                                            }}
                                            className="h-12 bg-white/5 border-none text-xl font-black rounded-xl text-center text-rose-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-2">BMI RATIO</Label>
                                    <Input value={bmi} readOnly className="h-12 bg-white/2 border-none text-xl font-black rounded-xl text-center text-sky-500 cursor-default" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-2">VISCERAL LEVEL</Label>
                                    <Input value={visceralFat} onChange={e => setVisceralFat(e.target.value)} className="h-12 bg-white/5 border-none text-xl font-black rounded-xl text-center" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest">OBSERVATION MEMO</Label>
                            <Input
                                className="h-14 bg-white/5 border-white/5 rounded-2xl font-bold text-xs"
                                placeholder="ENTER NEURAL FEEDBACK..."
                                value={memo}
                                onChange={e => setMemo(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-10 pt-0">
                        <div className="flex gap-4 items-center">
                            <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 text-white/40 font-black text-[10px] tracking-widest uppercase hover:text-white" onClick={() => setIsDialogOpen(false)}>ABORT</Button>
                            <Button
                                onClick={handleSaveEntry}
                                disabled={!weight}
                                className="flex-1 h-14 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-sm tracking-widest uppercase shadow-xl"
                            >
                                TRANSMIT DATA
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

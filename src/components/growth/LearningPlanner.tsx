'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, differenceInDays, isAfter } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
    BookOpen, Award, Target, Calendar, Plus, ChevronRight,
    CheckCircle2, Clock, Edit2, GraduationCap, Flame, TrendingUp,
    AlertCircle, Trash2, Sparkles, Loader2, Terminal, Activity,
    ShieldCheck, Zap, Fingerprint, MousePointer2, Globe, Cpu,
    BrainCircuit, Radar
} from 'lucide-react';
import { generateId, cn } from '@/lib/utils';
import { Certificate, LanguageResource } from '@/types';
import { generateStudyPlan } from '@/lib/gemini';
import { motion, AnimatePresence } from 'framer-motion';

export interface LearningPlannerProps {
    onNavigate?: (tab: string) => void;
}

export function LearningPlanner({ onNavigate }: LearningPlannerProps) {
    const {
        certificates = [], languageResources = [], tasks = [],
        addCertificate, updateCertificate, deleteCertificate,
        addLanguageResource, updateLanguageResource, deleteLanguageResource
    } = useData();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCertId, setEditingCertId] = useState<string | null>(null);
    const [editingLangId, setEditingLangId] = useState<string | null>(null);

    // Form State
    const [goalType, setGoalType] = useState<'certificate' | 'language'>('certificate');
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [issuer, setIssuer] = useState('');
    const [langType, setLangType] = useState('English');
    const [langResourceType, setLangResourceType] = useState<LanguageResource['type']>('book');
    const [langUrl, setLangUrl] = useState('');
    const [langCategory, setLangCategory] = useState('General');
    const [memo, setMemo] = useState('');

    const [isPlanning, setIsPlanning] = useState(false);

    const handleGeneratePlan = async () => {
        if (!title) return;
        setIsPlanning(true);
        try {
            const { weeklyPlan } = await generateStudyPlan(title, goalType);
            const formattedPlan = weeklyPlan.map(w => `[${w.week}주차] ${w.topic}\n- ${w.details}`).join('\n\n');
            setMemo(prev => prev ? `${prev}\n\n[AI 학습 플랜]\n${formattedPlan}` : `[AI 학습 플랜]\n${formattedPlan}`);
        } catch (error) {
            console.error(error);
        } finally {
            setIsPlanning(false);
        }
    };

    // --- Computed Values ---
    const totalCerts = certificates.length;
    const acquiredCerts = certificates.filter(c => c.status === 'acquired').length;
    const studyingCerts = certificates.filter(c => c.status === 'studying');

    const totalLangResources = languageResources.length;
    const completedLangResources = languageResources.filter(r => r.status === 'completed').length;
    const studyingLangResources = languageResources.filter(r => r.status === 'studying').length;

    const totalItems = totalCerts + totalLangResources;
    const completedItems = acquiredCerts + completedLangResources;
    const inProgressItems = studyingCerts.length + studyingLangResources;
    const growthPercentage = totalItems > 0
        ? Math.round(((completedItems * 1.0 + inProgressItems * 0.3) / totalItems) * 100)
        : 0;
    const growthLevel = Math.max(1, Math.floor(growthPercentage / 8) + 1);

    const getDDay = (targetDate?: Date | string) => {
        if (!targetDate) return null;
        const diff = differenceInDays(new Date(targetDate), new Date());
        if (diff < 0) return `D+${Math.abs(diff)}`;
        if (diff === 0) return 'D-Day';
        return `D-${diff}`;
    };

    const upcomingExams = [
        ...certificates.filter(c => c.status === 'studying' && c.date && isAfter(new Date(c.date), new Date())),
        ...tasks.filter(t => (t.title.includes('시험') || t.title.includes('Test')) && !t.completed && t.dueDate)
    ].sort((a: any, b: any) => new Date(a.date || a.dueDate).getTime() - new Date(b.date || b.dueDate).getTime());

    const getLangProgress = (resource: LanguageResource) => {
        if (resource.status === 'completed') return 100;
        if (resource.status === 'studying') return 50;
        return 0;
    };

    // --- Handlers ---
    const handleSave = () => {
        if (!title) return;
        if (goalType === 'certificate') {
            const certData: Certificate = {
                id: editingCertId || generateId(),
                name: title,
                issuer: issuer || '-',
                date: date ? new Date(date) : new Date(),
                status: 'studying',
                memo
            };
            if (editingCertId) {
                const existing = certificates.find(c => c.id === editingCertId);
                updateCertificate({ ...certData, status: existing?.status || 'studying' });
            } else {
                addCertificate(certData);
            }
        } else {
            const langData: LanguageResource = {
                id: editingLangId || generateId(),
                title,
                type: langResourceType,
                language: langType,
                status: 'tostudy',
                url: langUrl,
                category: langCategory,
                createdAt: new Date(),
                memo
            };
            if (editingLangId) {
                const existing = languageResources.find(r => r.id === editingLangId);
                updateLanguageResource({ ...langData, status: existing?.status || 'tostudy' });
            } else {
                addLanguageResource(langData);
            }
        }
        resetForm();
        setIsDialogOpen(false);
    };

    const resetForm = () => {
        setTitle(''); setDate(''); setIssuer(''); setLangType('English');
        setLangResourceType('book'); setLangUrl(''); setLangCategory('General');
        setMemo(''); setEditingCertId(null); setEditingLangId(null);
    };

    const openNew = () => { resetForm(); setIsDialogOpen(true); };

    const handleEditCert = (c: Certificate) => {
        setGoalType('certificate'); setEditingCertId(c.id); setTitle(c.name); setIssuer(c.issuer);
        setDate(c.date ? format(new Date(c.date), 'yyyy-MM-dd') : ''); setMemo(c.memo || '');
        setIsDialogOpen(true);
    };

    const handleEditLang = (r: LanguageResource) => {
        setGoalType('language'); setEditingLangId(r.id); setTitle(r.title); setLangType(r.language);
        setLangResourceType(r.type); setLangUrl(r.url); setLangCategory(r.category); setMemo(r.memo || '');
        setIsDialogOpen(true);
    };

    const cycleCertStatus = (c: Certificate) => {
        const nextStatus: Record<Certificate['status'], Certificate['status']> = {
            'studying': 'acquired', 'acquired': 'expired', 'expired': 'studying'
        };
        updateCertificate({ ...c, status: nextStatus[c.status] });
    };

    const cycleLangStatus = (r: LanguageResource) => {
        const nextStatus: Record<LanguageResource['status'], LanguageResource['status']> = {
            'tostudy': 'studying', 'studying': 'completed', 'completed': 'tostudy'
        };
        updateLanguageResource({ ...r, status: nextStatus[r.status] });
    };

    const getStatusColor = (status: Certificate['status']) => {
        switch (status) {
            case 'acquired': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'studying': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
            default: return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
        }
    };

    const getStatusLabel = (status: Certificate['status']) => {
        switch (status) {
            case 'acquired': return 'ACQUIRED';
            case 'studying': return 'IN PROGRESS';
            default: return 'EXPIRED';
        }
    };

    const getLangStatusColor = (status: LanguageResource['status']) => {
        switch (status) {
            case 'completed': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'studying': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
            default: return 'text-slate-400 bg-white/5 border-white/5';
        }
    };

    const getLangStatusLabel = (status: LanguageResource['status']) => {
        switch (status) {
            case 'completed': return 'COMPLETED';
            case 'studying': return 'ACTIVE';
            default: return 'QUEUED';
        }
    };

    return (
        <div className="h-full flex flex-col glass-premium rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-indigo-500/[0.03] pointer-events-none" />

            {/* Header / Command Center */}
            <div className="p-8 pb-4 relative z-10">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(6,182,212,0.5)]">
                            <BrainCircuit className="w-6 h-6 text-white" strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">COGNITIVE COMMAND</h2>
                            <p className="text-[10px] font-bold text-white/20 tracking-[0.3em] uppercase mt-2 italic flex items-center gap-2">
                                <Terminal className="w-3 h-3 text-cyan-500" /> NEURAL ACQUISITION: OPTIMIZED
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => onNavigate?.('calendar')}
                            className="h-12 px-6 rounded-2xl bg-white/5 text-[10px] font-black text-white/40 hover:text-white tracking-widest uppercase border border-white/5 transition-all"
                        >
                            <Calendar className="w-4 h-4 mr-2 opacity-50" /> CHRONO VIEW
                        </Button>
                        <Button
                            onClick={openNew}
                            className="h-12 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-black text-[10px] tracking-widest uppercase shadow-xl transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4 mr-2" strokeWidth={3} /> INITIALIZE GOAL
                        </Button>
                    </div>
                </div>

                {/* Stats Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <Card className="glass-premium border-white/10 bg-gradient-to-br from-cyan-500/[0.05] to-transparent overflow-hidden rounded-[32px] md:col-span-1 border-l-4 border-l-cyan-500">
                        <CardContent className="p-8 flex flex-col justify-between h-full gap-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-white/20 tracking-widest uppercase italic">SYNAPTIC GROWTH</span>
                                <div className="px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[8px] font-black text-cyan-400 tracking-widest">
                                    LVL {growthLevel}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-white tracking-tighter">{growthPercentage}%</span>
                                    <span className="text-[10px] font-bold text-white/10 tracking-widest uppercase italic">EFFICIENCY</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${growthPercentage}%` }}
                                        className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                    />
                                </div>
                                <div className="flex justify-between text-[8px] font-black text-white/20 tracking-widest uppercase">
                                    <span>ACQUIRED: {completedItems}</span>
                                    <span>ACTIVE: {inProgressItems}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-premium border-white/10 bg-white/[0.02] overflow-hidden rounded-[32px] md:col-span-2 relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Radar className="w-32 h-32 text-white" strokeWidth={1} />
                        </div>
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-[9px] font-black text-white/20 tracking-[0.4em] uppercase flex items-center gap-3 italic">
                                <Clock className="w-3 h-3 text-rose-500" /> TEMPORAL DEADLINES
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 flex gap-6 overflow-x-auto custom-scrollbar pb-6 scroll-smooth">
                            {upcomingExams.length > 0 ? (
                                upcomingExams.map((exam: any, idx) => {
                                    const examDate = exam.date || exam.dueDate;
                                    const dDay = getDDay(examDate);
                                    const diff = differenceInDays(new Date(examDate), new Date());
                                    const isCritical = diff <= 7;
                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            key={idx}
                                            className={cn(
                                                "p-6 rounded-[24px] min-w-[220px] border relative overflow-hidden group/exam",
                                                isCritical ? "bg-rose-500/5 border-rose-500/20" : "bg-white/5 border-white/5"
                                            )}
                                        >
                                            <div className="absolute top-2 right-2 opacity-10 group-hover/exam:opacity-30 transition-opacity">
                                                <Zap className={cn("w-3 h-3", isCritical ? "text-rose-500" : "text-cyan-500")} />
                                            </div>
                                            <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-3 truncate">{exam.title || exam.name}</div>
                                            <div className={cn(
                                                "text-4xl font-black tracking-tighter mb-1",
                                                isCritical ? "text-rose-400" : "text-white"
                                            )}>
                                                {dDay}
                                            </div>
                                            <div className="text-[9px] font-bold text-white/10 uppercase tracking-widest">
                                                {format(new Date(examDate), 'MM. dd (eee)', { locale: ko })}
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="h-24 flex items-center gap-4 text-white/10 italic">
                                    <Target className="w-6 h-6 opacity-20" />
                                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase">NO CRITICAL DEADLINES SCANNED</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Main Protocols Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Language Hub */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[10px] font-black text-white/20 tracking-[0.4em] uppercase flex items-center gap-3 italic font-black">
                                <Cpu className="w-3 h-3 text-cyan-400" /> LINGUISTIC PROCESSOR
                            </h3>
                            <span className="text-[9px] font-black text-cyan-400/40 tracking-widest uppercase">
                                SYNC: {completedLangResources}/{totalLangResources}
                            </span>
                        </div>
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {languageResources.length > 0 ? (
                                    languageResources.map((resource, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.03 }}
                                            key={resource.id}
                                            className="group glass-premium rounded-[32px] border border-white/5 p-6 transition-all hover:bg-white/[0.03] relative overflow-hidden flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden shrink-0">
                                                    <span className="text-xl font-black text-white/40 group-hover:text-cyan-400 transition-colors uppercase">{resource.title[0]}</span>
                                                    <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-white tracking-widest uppercase mb-1">{resource.title}</h4>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{resource.language}</span>
                                                        <span className="text-[9px] font-black text-cyan-500/60 uppercase">{resource.type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="text-right hidden sm:block">
                                                    <div className="text-[10px] font-black text-cyan-400 tracking-tighter mb-1">{getLangProgress(resource)}% COMPLETED</div>
                                                    <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                        <div className="h-full bg-cyan-500" style={{ width: `${getLangProgress(resource)}%` }} />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => cycleLangStatus(resource)}
                                                        className={cn("px-3 py-1 rounded-lg text-[8px] font-black tracking-widest border transition-all active:scale-95 uppercase", getLangStatusColor(resource.status))}
                                                    >
                                                        {getLangStatusLabel(resource.status)}
                                                    </button>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button onClick={() => handleEditLang(resource)} className="w-10 h-10 rounded-xl bg-white/5 text-white/20 hover:text-white flex items-center justify-center">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => deleteLanguageResource(resource.id)} className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="h-40 flex flex-col items-center justify-center opacity-10 gap-4 border-2 border-dashed border-white/10 rounded-[32px]">
                                        <BookOpen className="w-10 h-10" />
                                        <p className="text-[10px] font-black tracking-[0.3em] uppercase">SYSTEM LIBRARY VACANT</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Certificate Roadmap */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[10px] font-black text-white/20 tracking-[0.4em] uppercase flex items-center gap-3 italic font-black">
                                <Award className="w-3 h-3 text-emerald-400" /> CREDENTIAL VAULT
                            </h3>
                            <span className="text-[9px] font-black text-emerald-400/40 tracking-widest uppercase">
                                ARCHIVED: {acquiredCerts}/{totalCerts}
                            </span>
                        </div>
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {certificates.length > 0 ? (
                                    certificates.map((cert, idx) => {
                                        const dDay = cert.status === 'studying' ? getDDay(cert.date) : null;
                                        return (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={cert.id}
                                                className="group glass-premium rounded-[32px] border border-white/5 p-6 transition-all hover:bg-white/[0.03] flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className={cn(
                                                        "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all shrink-0",
                                                        cert.status === 'acquired' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-white/40"
                                                    )}>
                                                        {cert.status === 'acquired' ? <CheckCircle2 strokeWidth={3} /> : <GraduationCap strokeWidth={2.5} />}
                                                    </div>
                                                    <div>
                                                        <h4 className={cn("text-sm font-black uppercase tracking-widest mb-1", cert.status === 'acquired' ? "text-white/40 line-through" : "text-white")}>{cert.name}</h4>
                                                        <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest italic">{cert.issuer}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {dDay && (
                                                        <div className="px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[9px] font-black text-rose-400 uppercase tracking-tighter">
                                                            {dDay}
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => cycleCertStatus(cert)}
                                                        className={cn("px-3 py-1 rounded-lg text-[8px] font-black tracking-widest border transition-all active:scale-95 uppercase", getStatusColor(cert.status))}
                                                    >
                                                        {getStatusLabel(cert.status)}
                                                    </button>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button onClick={() => handleEditCert(cert)} className="w-10 h-10 rounded-xl bg-white/5 text-white/20 hover:text-white flex items-center justify-center">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => deleteCertificate(cert.id)} className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <div className="h-40 flex flex-col items-center justify-center opacity-10 gap-4 border-2 border-dashed border-white/10 rounded-[48px]">
                                        <Award className="w-10 h-10" />
                                        <p className="text-[10px] font-black tracking-[0.3em] uppercase">NO CREDENTIALS SECURED</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass-premium border border-white/10 text-white rounded-[40px] p-0 shadow-2xl sm:max-w-3xl max-h-[90vh] overflow-hidden">
                    <DialogHeader className="p-10 pb-0">
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase mb-2">{editingCertId || editingLangId ? 'RECALIBRATE GOAL' : 'INITIALIZE GOAL'}</DialogTitle>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] italic">CALIBRATING NEURAL PARAMETERS FOR COGNITIVE ACQUISITION</p>
                    </DialogHeader>

                    <div className="p-10 pt-4 overflow-y-auto custom-scrollbar space-y-8">
                        <Tabs value={goalType} onValueChange={(v: any) => setGoalType(v)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 h-16">
                                <TabsTrigger value="certificate" className="rounded-xl font-black text-[10px] tracking-widest uppercase data-[state=active]:bg-cyan-500 data-[state=active]:text-white">CERTIFICATION</TabsTrigger>
                                <TabsTrigger value="language" className="rounded-xl font-black text-[10px] tracking-widest uppercase data-[state=active]:bg-cyan-500 data-[state=active]:text-white">LINGUISTICS</TabsTrigger>
                            </TabsList>

                            <div className="py-8 space-y-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">GOAL IDENTIFIER</Label>
                                    <Input
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="EX: CLOUD ARCHITECT, LEVEL C1..."
                                        className="h-14 font-black text-xl border-white/5 bg-white/5 rounded-2xl text-white placeholder:text-white/10"
                                    />
                                </div>

                                {goalType === 'certificate' && (
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">ISSUING SECTOR</Label>
                                            <Input value={issuer} onChange={e => setIssuer(e.target.value)} placeholder="EX: AWS, GOOGLE..." className="h-12 font-black text-[10px] uppercase tracking-widest bg-white/5 border-white/5 rounded-2xl text-white" />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">CHRONO-TARGET</Label>
                                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-12 font-black text-[10px] bg-white/5 border-white/5 rounded-2xl text-white" />
                                        </div>
                                    </div>
                                )}

                                {goalType === 'language' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">LINGUAL VECTOR</Label>
                                                <select
                                                    className="flex h-12 w-full rounded-2xl border border-white/5 bg-white/5 px-4 font-black uppercase text-[10px] tracking-center text-white outline-none focus:ring-2 focus:ring-cyan-500/20"
                                                    value={langType}
                                                    onChange={e => setLangType(e.target.value)}
                                                >
                                                    <option value="English" className="bg-slate-900">ENGLISH</option>
                                                    <option value="Japanese" className="bg-slate-900">JAPANESE</option>
                                                    <option value="Chinese" className="bg-slate-900">CHINESE</option>
                                                    <option value="Other" className="bg-slate-900">OTHER</option>
                                                </select>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">MEDIUM TYPE</Label>
                                                <select
                                                    className="flex h-12 w-full rounded-2xl border border-white/5 bg-white/5 px-4 font-black uppercase text-[10px] tracking-widest text-white outline-none focus:ring-2 focus:ring-cyan-500/20"
                                                    value={langResourceType}
                                                    onChange={e => setLangResourceType(e.target.value as any)}
                                                >
                                                    <option value="book" className="bg-slate-900">ACADEMIC TEXT</option>
                                                    <option value="video" className="bg-slate-900">VISUAL DATA</option>
                                                    <option value="lecture" className="bg-slate-900">PROTOCOL LECTURE</option>
                                                    <option value="other" className="bg-slate-900">OTHER</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">EXTERNAL DATALINK (URL)</Label>
                                            <Input value={langUrl} onChange={e => setLangUrl(e.target.value)} placeholder="HTTPS://..." className="h-12 bg-white/5 border-white/5 rounded-2xl text-white text-[10px] font-black tracking-widest uppercase" />
                                        </div>
                                    </>
                                )}

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center ml-2">
                                        <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest">COGNITIVE BLUEPRINT / AI ROADMAP</Label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleGeneratePlan}
                                            disabled={!title || isPlanning}
                                            className="h-8 text-[9px] font-black text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 px-3 uppercase tracking-widest gap-2"
                                        >
                                            {isPlanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                            AI SYNTHESIS
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={memo}
                                        onChange={e => setMemo(e.target.value)}
                                        placeholder="SPECIFY SUB-OBJECTIVES OR GENERATE VIA AI..."
                                        className="min-h-[160px] bg-white/5 border-white/5 rounded-3xl p-6 text-[11px] font-bold text-white/60 leading-relaxed italic placeholder:text-white/10 resize-none focus:ring-2 focus:ring-cyan-500/20"
                                    />
                                </div>
                            </div>
                        </Tabs>
                    </div>

                    <DialogFooter className="p-10 pt-4 bg-white/[0.02] border-t border-white/5">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDialogOpen(false)}
                            className="h-16 px-8 rounded-2xl text-[10px] font-black text-white/20 hover:text-white hover:bg-white/5 uppercase tracking-widest"
                        >
                            ABORT
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!title}
                            className="flex-1 h-16 rounded-3xl bg-cyan-500 hover:bg-cyan-600 text-white font-black text-sm tracking-[0.2em] shadow-2xl active:scale-95 transition-all uppercase"
                        >
                            ENCRYPT GOAL
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

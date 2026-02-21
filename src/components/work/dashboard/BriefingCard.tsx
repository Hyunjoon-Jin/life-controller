'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/context/DataProvider';
import { useAuth } from '@/components/auth/SessionProvider';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Sun, Cloud, Moon, Sparkles, RefreshCw, Loader2, ChevronDown, ChevronUp, Terminal, Zap, Shield, Target, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateMorningBriefing } from '@/lib/gemini';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

export function BriefingCard() {
    const { userProfile, tasks, events, projects } = useData();
    const { user } = useAuth();

    const userName = userProfile.name || user?.user_metadata?.name || "사용자";
    const today = new Date();
    const hour = today.getHours();

    let greeting = "시스템 대기 중";
    let statusLabel = "입력 준비 완료";
    let Icon = Sun;
    let accentColor = "text-amber-400";

    if (hour < 12) {
        greeting = "오전 지령";
        statusLabel = "최상의 컨디션으로 시작하자";
        Icon = Sun;
        accentColor = "text-amber-400";
    } else if (hour < 18) {
        greeting = "오후 루틴";
        statusLabel = "절정의 퍼포먼스 중";
        Icon = Cloud;
        accentColor = "text-sky-400";
    } else {
        greeting = "야간 정리";
        statusLabel = "오늘 하루 마무리 중";
        Icon = Moon;
        accentColor = "text-indigo-400";
    }

    const incompleteTasks = tasks.filter(t => !t.completed).length;
    const todayEventsCount = events.filter(e => new Date(e.start).toDateString() === today.toDateString()).length;

    // AI Briefing State
    const [briefing, setBriefing] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const savedDate = localStorage.getItem('morning_briefing_date');
        const savedContent = localStorage.getItem('morning_briefing_content');
        const todayStr = new Date().toISOString().split('T')[0];

        if (savedDate === todayStr && savedContent) {
            setBriefing(savedContent);
            setExpanded(true);
        }
    }, []);

    const handleGenerate = async () => {
        setLoading(true);
        setExpanded(true);
        try {
            const now = new Date();
            const todaysEvents = events.filter(e => {
                const eventDate = new Date(e.start);
                return eventDate.getFullYear() === now.getFullYear() &&
                    eventDate.getMonth() === now.getMonth() &&
                    eventDate.getDate() === now.getDate() &&
                    (e.type === 'work' || e.isMeeting || e.isWorkLog || !!e.connectedProjectId);
            });

            const relevantTasks = tasks.filter(t => {
                const isWork = t.category === 'work' || t.projectId;
                const isHighPriority = t.priority === 'high';
                const isDueToday = t.dueDate && (() => {
                    const due = new Date(t.dueDate);
                    return due.getFullYear() === now.getFullYear() &&
                        due.getMonth() === now.getMonth() &&
                        due.getDate() === now.getDate();
                })();

                return !t.completed && isWork && (isHighPriority || isDueToday);
            });

            const activeProjects = projects.filter(p => p.status === 'active' && p.category === 'work');

            const result = await generateMorningBriefing(
                userName,
                relevantTasks,
                activeProjects,
                todaysEvents
            );
            const todayStr = now.toISOString().split('T')[0];
            setBriefing(result);
            localStorage.setItem('morning_briefing_date', todayStr);
            localStorage.setItem('morning_briefing_content', result);
        } catch (error) {
            console.error(error);
            setBriefing("OPERATIONAL ERROR: FAILED TO GENERATE BRIEFING.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-premium rounded-[32px] border border-white/5 p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-sky-500/[0.05] pointer-events-none" />

            {/* AI Scanning Animation */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent -translate-y-full group-hover:animate-scan pointer-events-none" />

            <div className="flex flex-col xl:flex-row items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-indigo-500/10 animate-pulse" />
                        <Icon className={cn("w-10 h-10 relative z-10", accentColor)} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[8px] font-black tracking-widest uppercase">
                                레벨: ALPHA
                            </span>
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                • {statusLabel}
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-tight">
                            {greeting}, <span className="text-indigo-400">{userName}</span>
                        </h2>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                                <Target className="w-3 h-3 text-rose-500" />
                                <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">{incompleteTasks} 개 미완료 할일</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                                <CalendarIcon className="w-3 h-3 text-sky-500" />
                                <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">{todayEventsCount} 개 오늘 일정</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full xl:w-auto">
                    <div className="hidden xl:flex flex-col items-end gap-1 px-4 border-r border-white/5">
                        <span className="text-[8px] font-black text-white/20 tracking-widest uppercase">날짜</span>
                        <span className="text-sm font-black text-white">{format(today, 'EEEE, MMM dd', { locale: ko })}</span>
                    </div>

                    <Button
                        onClick={briefing ? () => setExpanded(!expanded) : handleGenerate}
                        className={cn(
                            "h-14 px-8 rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase transition-all active:scale-95 shadow-xl relative overflow-hidden group/btn",
                            briefing
                                ? "bg-white/5 text-white/60 hover:text-white border border-white/10"
                                : "bg-indigo-600 text-white hover:bg-indigo-500 border-0"
                        )}
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-3 text-indigo-400" />
                        ) : (
                            <Sparkles className="w-4 h-4 mr-3 text-indigo-400 group-hover/btn:rotate-12 transition-transform" />
                        )}
                        {briefing ? (expanded ? "브리핑 닫기" : "브리핑 열기") : "AI 브리핑 시작"}
                        {briefing && (expanded ? <ChevronUp className="w-4 h-4 ml-2 opacity-40" /> : <ChevronDown className="w-4 h-4 ml-2 opacity-40" />)}

                        {!briefing && !loading && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                        )}
                    </Button>
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-8 border-t border-white/5 relative"
                    >
                        <div className="pt-8 relative z-10">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-6">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20" />
                                        <div className="w-16 h-16 rounded-full border-2 border-t-indigo-500 border-transparent animate-spin absolute top-0 left-0" />
                                        <Activity className="w-6 h-6 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase mb-2">AI 분석 진행 중</p>
                                        <p className="text-sm font-bold text-white animate-pulse">브리핑 생성 중...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 p-4 opacity-5 pointer-events-none">
                                        <Terminal className="w-24 h-24" />
                                    </div>

                                    <div className="prose prose-sm prose-invert max-w-none text-white/60">
                                        <ReactMarkdown components={{
                                            h1: (props: any) => <h3 className="text-xl font-black text-indigo-400 mt-6 mb-4 tracking-tight flex items-center gap-3 uppercase" {...props}><Shield className="w-5 h-5" /> {props.children}</h3>,
                                            h2: (props: any) => <h4 className="text-sm font-black text-white mt-8 mb-4 tracking-widest border-l-2 border-indigo-500 pl-4 uppercase" {...props}>{props.children}</h4>,
                                            ul: (props: any) => <ul className="space-y-3 my-6 list-none" {...props} />,
                                            li: (props: any) => (
                                                <li className="flex items-start gap-4" {...props}>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                                                    <span className="text-[13px] font-semibold leading-relaxed tracking-wide text-white/70">{props.children}</span>
                                                </li>
                                            ),
                                            p: (props: any) => <p className="mb-4 leading-relaxed text-[13px] font-semibold tracking-wide" {...props} />,
                                            strong: (props: any) => <span className="text-white font-black" {...props} />
                                        }}>
                                            {briefing || ''}
                                        </ReactMarkdown>

                                        <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/5">
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-2 grayscale brightness-200 opacity-20">
                                                    <Zap className="w-4 h-4" />
                                                    <span className="text-[8px] font-bold tracking-widest">신경망 코어</span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    localStorage.removeItem('morning_briefing_content');
                                                    handleGenerate();
                                                }}
                                                className="text-[9px] font-black tracking-widest text-indigo-400/60 hover:text-indigo-400 hover:bg-indigo-500/10 h-8 uppercase"
                                            >
                                                <RefreshCw className="w-3 h-3 mr-2" /> 브리핑 재생성
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const CalendarIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
);


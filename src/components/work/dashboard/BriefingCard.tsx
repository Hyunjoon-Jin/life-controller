'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/context/DataProvider';
import { useAuth } from '@/components/auth/SessionProvider';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Sun, Cloud, Moon, Sparkles, RefreshCw, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateMorningBriefing } from '@/lib/gemini';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

export function BriefingCard() {
    const { userProfile, tasks, events, projects } = useData();
    const { user } = useAuth();

    const userName = userProfile.name || user?.user_metadata?.name || "사용자";
    const today = new Date();
    const hour = today.getHours();

    let greeting = "좋은 하루 되세요";
    let Icon = Sun;

    if (hour < 12) {
        greeting = "좋은 아침입니다";
        Icon = Sun;
    } else if (hour < 18) {
        greeting = "활기찬 오후입니다";
        Icon = Cloud;
    } else {
        greeting = "수고 많으셨습니다";
        Icon = Moon;
    }

    const incompleteTasks = tasks.filter(t => !t.completed).length;
    const todayEventsCount = events.filter(e => new Date(e.start).toDateString() === today.toDateString()).length;

    // AI Briefing State
    const [briefing, setBriefing] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        // Restore if generated today
        const savedDate = localStorage.getItem('morning_briefing_date');
        const savedContent = localStorage.getItem('morning_briefing_content');
        const todayStr = new Date().toISOString().split('T')[0];

        if (savedDate === todayStr && savedContent) {
            setBriefing(savedContent);
            setExpanded(true); // Auto-expand if already generated today
        }
    }, []);

    const handleGenerate = async () => {
        setLoading(true);
        setExpanded(true);
        try {
            console.log("Generating AI Briefing with key:", "starts with AQ.***");
            const todayStr = new Date().toISOString().split('T')[0];
            // Filter Work: Type is work/meeting OR linked to a project (assuming projects are work or filtered)
            const todaysEvents = events.filter(e =>
                new Date(e.start).toISOString().startsWith(todayStr) &&
                (e.type === 'work' || e.isMeeting || e.isWorkLog || !!e.connectedProjectId)
            );

            // Filter Work: Category is work OR belongs to a project
            const relevantTasks = tasks.filter(t =>
                !t.completed &&
                (t.category === 'work' || t.projectId) &&
                (t.priority === 'high' || (t.dueDate && new Date(t.dueDate).toISOString().startsWith(todayStr)))
            );

            // Filter Work: Category is work
            const activeProjects = projects.filter(p => p.status === 'active' && p.category === 'work');

            const result = await generateMorningBriefing(
                userName,
                relevantTasks,
                activeProjects,
                todaysEvents
            );
            setBriefing(result);
            localStorage.setItem('morning_briefing_date', todayStr);
            localStorage.setItem('morning_briefing_content', result);
        } catch (error) {
            console.error(error);
            setBriefing("브리핑을 생성하는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col gap-6 relative overflow-hidden transition-all duration-300">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                        <Icon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {greeting}, <span className="text-indigo-600 dark:text-indigo-400">{userName}</span>님!
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            오늘 할 일 <span className="font-bold text-slate-900 dark:text-slate-200">{incompleteTasks}개</span>와 일정 <span className="font-bold text-slate-900 dark:text-slate-200">{todayEventsCount}개</span>가 있습니다.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 w-full md:w-auto items-center">
                    {/* Weather/Time Placeholders */}
                    <div className="hidden md:flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl min-w-[80px]">
                        <span className="text-xs text-slate-400 font-medium">오늘 날짜</span>
                        <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
                            {format(today, 'd일', { locale: ko })}
                        </span>
                    </div>

                    {/* AI Button */}
                    <Button
                        onClick={briefing ? () => setExpanded(!expanded) : handleGenerate}
                        variant={briefing ? "outline" : "default"}
                        className={briefing ? "border-indigo-200 text-indigo-700 hover:bg-indigo-50" : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-0"}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        {briefing ? (expanded ? "브리핑 접기" : "브리핑 보기") : "AI 브리핑 생성"}
                        {briefing && (expanded ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />)}
                    </Button>
                </div>
            </div>

            {/* AI Content Area */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-t border-slate-100 dark:border-slate-700/50 pt-4"
                    >
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
                                <Sparkles className="w-8 h-8 text-indigo-300 animate-pulse mb-3" />
                                <p>일정과 할 일을 분석하고 있습니다...</p>
                            </div>
                        ) : (
                            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                                <ReactMarkdown components={{
                                    h1: (props: any) => <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-2" {...props} />,
                                    h2: (props: any) => <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mt-3 mb-1" {...props} />,
                                    ul: (props: any) => <ul className="list-disc list-inside space-y-1 my-2" {...props} />,
                                    li: (props: any) => <li className="text-slate-600 dark:text-slate-400" {...props} />,
                                    p: (props: any) => <p className="mb-2 leading-relaxed" {...props} />
                                }}>
                                    {briefing || ''}
                                </ReactMarkdown>
                                <div className="flex justify-end mt-2">
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        localStorage.removeItem('morning_briefing_content');
                                        handleGenerate();
                                    }} className="text-xs text-muted-foreground hover:text-indigo-500 h-6">
                                        <RefreshCw className="w-3 h-3 mr-1" /> 다시 생성 (캐시 삭제)
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


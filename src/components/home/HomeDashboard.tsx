"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataProvider';
import {
    Calendar as CalendarIcon,
    CheckSquare,
    Clock,
    Sun,
    ArrowRight,
    TrendingUp,
    BookOpen,
    Dumbbell,
    Utensils,
    Palette,
    Lightbulb,
    Languages,
    Briefcase
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';
import { WeatherCard } from '@/components/widgets/WeatherCard';
import { SearchWidget } from '@/components/tools/SearchWidget';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

interface HomeDashboardProps {
    onNavigate: (mode: 'home' | 'schedule' | 'work') => void;
    onQuickLink: (mode: 'home' | 'schedule' | 'work', category: 'basic' | 'growth' | 'record', tab: string) => void;
}

export function HomeDashboard({ onNavigate, onQuickLink }: HomeDashboardProps) {
    const { events, tasks } = useData();
    const { data: session } = useSession();
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const todaysEvents = events
        .filter(e => {
            if (!e.start) return false;
            const start = new Date(e.start);
            if (!isValid(start)) return false;
            const today = new Date();
            return start.getDate() === today.getDate() &&
                start.getMonth() === today.getMonth() &&
                start.getFullYear() === today.getFullYear();
        })
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    const todaysTasks = tasks.filter(t => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        if (!isValid(due)) return false;
        const today = new Date();
        return due.getDate() === today.getDate() &&
            due.getMonth() === today.getMonth() &&
            due.getFullYear() === today.getFullYear();
    });

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto p-4 pb-20">
            {/* 1. Hero Section (Branding & Status) */}
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-[#202022] dark:to-[#1a1a1c] p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-2 duration-700 relative overflow-hidden">
                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
                    {/* Left: Branding & Quote */}
                    <div className="space-y-4">
                        <button
                            onClick={() => onNavigate('home')}
                            className="flex items-center gap-3 group text-left transition-opacity hover:opacity-80"
                        >
                            <div className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center shadow-lg transform rotate-[-5deg] group-hover:rotate-0 transition-transform duration-300">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="translate-y-[1px]">
                                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold tracking-tight text-[#191F28] dark:text-white leading-none">
                                    LIFE <span className="text-blue-600">Controller</span>
                                </h1>
                                <p className="text-xs text-gray-500 font-medium mt-0.5 ml-0.5">Daily Productivity OS</p>
                            </div>
                        </button>

                        <div className="space-y-1">
                            <h2 className="text-lg font-bold text-[#333D4B] dark:text-gray-200">
                                반가워요, {session?.user?.name || '사용자'}님!
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                "작은 습관이 모여 위대한 변화를 만듭니다."
                            </p>
                        </div>
                    </div>

                    {/* Right: Quick Stats (Chips) */}
                    <div className="flex flex-wrap gap-2">
                        {/* Date Chip */}
                        <div className="bg-white dark:bg-gray-800 px-4 py-2.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                {currentTime ? format(currentTime, 'M월 d일 EEEE', { locale: ko }) : '...'}
                            </span>
                        </div>

                        {/* Task Chip */}
                        <button
                            onClick={() => onQuickLink('schedule', 'basic', 'tasks')}
                            className="bg-white dark:bg-gray-800 px-4 py-2.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                        >
                            <div className="w-2 h-2 rounded-full bg-red-500 group-hover:animate-pulse" />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                할일 <span className="text-blue-600">{todaysTasks.length}</span>개
                            </span>
                        </button>

                        {/* Weather Chip (Simple) */}
                        <div className="bg-white dark:bg-gray-800 px-4 py-2.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                            <Sun className="w-4 h-4 text-orange-400" />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                맑음 24°
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Search (Minimal) */}
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100">
                <SearchWidget />
            </div>

            {/* 3. App Icon Grid (Toss Home Style) */}
            <div className="bg-white dark:bg-[#202022] rounded-[24px] p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                <h3 className="text-lg font-bold text-[#333D4B] dark:text-gray-200 mb-5">내 서비스</h3>
                <div className="grid grid-cols-4 md:grid-cols-5 gap-y-6 gap-x-2">
                    <AppIcon icon={CalendarIcon} label="일정" colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" onClick={() => onQuickLink('schedule', 'basic', 'calendar')} />
                    <AppIcon icon={CheckSquare} label="할일" colorClass="bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-400" onClick={() => onQuickLink('schedule', 'basic', 'tasks')} />
                    <AppIcon icon={TrendingUp} label="목표" colorClass="bg-orange-50 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400" onClick={() => onQuickLink('schedule', 'growth', 'goals')} />
                    <AppIcon icon={BookOpen} label="독서" colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" onClick={() => onQuickLink('schedule', 'growth', 'reading')} />
                    <AppIcon icon={Languages} label="어학" colorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400" onClick={() => onQuickLink('schedule', 'growth', 'language')} />

                    <AppIcon icon={Dumbbell} label="운동" colorClass="bg-cyan-50 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400" onClick={() => onQuickLink('schedule', 'growth', 'exercise')} />
                    <AppIcon icon={Utensils} label="식단" colorClass="bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-400" onClick={() => onQuickLink('schedule', 'growth', 'diet')} />
                    <AppIcon icon={Lightbulb} label="아이디어" colorClass="bg-yellow-50 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400" onClick={() => onQuickLink('schedule', 'record', 'ideas')} />
                    <AppIcon icon={Briefcase} label="업무" colorClass="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300" onClick={() => onQuickLink('work', 'basic', 'calendar')} />
                    <AppIcon icon={Palette} label="취미" colorClass="bg-pink-50 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400" onClick={() => onQuickLink('schedule', 'growth', 'hobby')} />
                </div>
            </div>

            {/* 4. Feeds (Cards) */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
                {/* Weather & Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-[#202022] rounded-[24px] p-5 shadow-sm flex flex-col justify-between min-h-[160px]">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-[#333D4B] dark:text-gray-200">오늘의 날씨</h3>
                                <p className="text-[#8B95A1] text-sm">준비는 하셨나요?</p>
                            </div>
                            <Sun className="w-8 h-8 text-orange-400" />
                        </div>
                        {/* Placeholder for Weather Card Content if we want to inline it or just keep simple */}
                        <div className="mt-2">
                            <WeatherCard />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#202022] rounded-[24px] p-5 shadow-sm flex flex-col justify-between min-h-[160px]">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-[#333D4B] dark:text-gray-200">다음 일정</h3>
                                {todaysEvents.length > 0 ? (
                                    <p className="text-[#8B95A1] text-sm mt-1">{format(new Date(todaysEvents[0].start), 'a h:mm')} · {todaysEvents[0].title}</p>
                                ) : (
                                    <p className="text-[#8B95A1] text-sm mt-1">예정된 일정이 없어요</p>
                                )}
                            </div>
                            <Clock className="w-8 h-8 text-blue-400" />
                        </div>
                        <Button
                            variant="secondary"
                            className="w-full mt-4 bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#4E5968] dark:bg-white/10 dark:text-gray-300 rounded-xl h-10 text-sm font-semibold border-none"
                            onClick={() => onQuickLink('schedule', 'basic', 'calendar')}
                        >
                            전체 일정 보기
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper component for Icon
import { AppIcon } from './AppIcon';

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
import { format } from 'date-fns';
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
    const [currentTime, setCurrentTime] = useState(new Date());
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) setGreeting('좋은 아침입니다');
        else if (hour >= 11 && hour < 17) setGreeting('활기찬 오후입니다');
        else if (hour >= 17 && hour < 22) setGreeting('편안한 저녁 되세요');
        else setGreeting('고요한 밤입니다');

        return () => clearInterval(timer);
    }, []);

    const todaysEvents = events
        .filter(e => {
            const start = new Date(e.start);
            const today = new Date();
            return start.getDate() === today.getDate() &&
                start.getMonth() === today.getMonth() &&
                start.getFullYear() === today.getFullYear();
        })
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    const todaysTasks = tasks.filter(t => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        const today = new Date();
        return due.getDate() === today.getDate() &&
            due.getMonth() === today.getMonth() &&
            due.getFullYear() === today.getFullYear();
    });

    const completedTasks = todaysTasks.filter(t => t.completed);
    const taskProgress = todaysTasks.length > 0
        ? Math.round((completedTasks.length / todaysTasks.length) * 100)
        : 0;

    const QuickAccessItem = ({ icon: Icon, label, color, onClick }: { icon: any, label: string, color: string, onClick: () => void }) => (
        <button
            onClick={onClick}
            className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/20 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md"
        >
            <div className={cn("p-3 rounded-xl mb-2 transition-colors", color, "bg-opacity-10 dark:bg-opacity-20 group-hover:bg-opacity-20")}>
                <Icon className={cn("w-6 h-6", color.replace('bg-', 'text-'))} />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto p-2 pb-10">
            {/* Header Section: Greeting & Time */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-2">
                        {greeting}, {session?.user?.name || '사용자'}님.
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium">
                        {format(currentTime, 'M월 d일 EEEE', { locale: ko })} · {format(currentTime, 'a h:mm')}
                    </p>
                </div>
                <div className="w-full md:w-auto">
                    <WeatherCard />
                </div>
            </div>

            {/* Search Widget */}
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                <SearchWidget />
            </div>

            {/* Quick Access Grid (Glassmorphism) */}
            <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-5 delay-100 duration-700">
                <QuickAccessItem icon={CalendarIcon} label="일정" color="bg-blue-500" onClick={() => onQuickLink('schedule', 'basic', 'calendar')} />
                <QuickAccessItem icon={TrendingUp} label="목표" color="bg-red-500" onClick={() => onQuickLink('schedule', 'growth', 'goals')} />
                <QuickAccessItem icon={BookOpen} label="독서" color="bg-emerald-500" onClick={() => onQuickLink('schedule', 'growth', 'reading')} />
                <QuickAccessItem icon={Languages} label="어학" color="bg-indigo-500" onClick={() => onQuickLink('schedule', 'growth', 'language')} />
                <QuickAccessItem icon={Dumbbell} label="운동" color="bg-orange-500" onClick={() => onQuickLink('schedule', 'growth', 'exercise')} />
                <QuickAccessItem icon={Utensils} label="식단" color="bg-green-500" onClick={() => onQuickLink('schedule', 'growth', 'diet')} />
                <QuickAccessItem icon={Palette} label="취미" color="bg-pink-500" onClick={() => onQuickLink('schedule', 'growth', 'hobby')} />
                <QuickAccessItem icon={Lightbulb} label="아이디어" color="bg-yellow-500" onClick={() => onQuickLink('schedule', 'record', 'ideas')} />
                <QuickAccessItem icon={Briefcase} label="업무" color="bg-slate-500" onClick={() => onQuickLink('work', 'basic', 'calendar')} />
            </div>

            {/* Main Content Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-6 delay-200 duration-700">

                {/* Left: Today's Schedule (2 cols wide) */}
                <Card className="lg:col-span-2 border-none shadow-lg bg-white/50 dark:bg-black/20 backdrop-blur-md overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-500" />
                                오늘의 일정
                                <span className="text-sm font-normal text-muted-foreground ml-2 bg-blue-100/50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                    {todaysEvents.length}건
                                </span>
                            </h2>
                            <Button variant="ghost" size="sm" onClick={() => onQuickLink('schedule', 'basic', 'calendar')} className="hover:bg-blue-100/20">
                                전체 보기 <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>

                        {todaysEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
                                <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-900/20">
                                    <Sun className="w-8 h-8 text-blue-400" />
                                </div>
                                <p>오늘 예정된 일정이 없습니다.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {todaysEvents.slice(0, 3).map((event, idx) => (
                                    <div key={event.id} className="flex items-center gap-4 group p-3 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
                                        <div className="flex flex-col items-center min-w-[60px]">
                                            <span className="text-lg font-bold text-foreground">
                                                {format(new Date(event.start), 'HH:mm')}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(event.end), 'HH:mm')}
                                            </span>
                                        </div>
                                        <div className="w-[2px] h-10 bg-gray-200 dark:bg-gray-700 group-hover:bg-blue-400 transition-colors rounded-full" />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-base mb-1">{event.title}</h3>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{event.description || '상세 내용 없음'}</p>
                                        </div>
                                        <div className={cn(
                                            "w-3 h-3 rounded-full shadow-sm",
                                            event.priority === 'high' ? "bg-red-500 shadow-red-500/50" :
                                                event.priority === 'medium' ? "bg-yellow-500 shadow-yellow-500/50" :
                                                    "bg-blue-500 shadow-blue-500/50"
                                        )} />
                                    </div>
                                ))}
                                {todaysEvents.length > 3 && (
                                    <p className="text-center text-xs text-muted-foreground pt-2">
                                        외 {todaysEvents.length - 3}개의 일정이 더 있습니다.
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right: Task Progress (1 col wide) */}
                <Card className="border-none shadow-lg bg-white/50 dark:bg-black/20 backdrop-blur-md overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-1 h-full bg-green-500/50" />
                    <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <CheckSquare className="w-5 h-5 text-green-500" />
                                업무 달성률
                            </h2>
                            <Button variant="ghost" size="sm" onClick={() => onQuickLink('work', 'basic', 'calendar')} className="hover:bg-green-100/20">
                                관리 <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center py-4">
                            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                                {/* Simple CSS Ring Visualization for brevity, ideally use Recharts Pie or SVG */}
                                <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        strokeDasharray={`${2 * Math.PI * 45}`}
                                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - taskProgress / 100 || 0)}`}
                                        className="text-green-500 transition-all duration-1000 ease-out"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black text-green-500">{taskProgress}%</span>
                                    <span className="text-xs text-muted-foreground">완료</span>
                                </div>
                            </div>

                            <div className="w-full space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">전체 업무</span>
                                    <span className="font-bold">{todaysTasks.length}개</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">완료</span>
                                    <span className="font-bold text-green-500">{completedTasks.length}개</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">진행 중</span>
                                    <span className="font-bold text-orange-500">{todaysTasks.length - completedTasks.length}개</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

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
    Briefcase,
    Plus,
    X,
    GripVertical,
    NotebookPen,
    PiggyBank,
    Settings2,
    FolderTree,
    UsersRound,
    Trophy,
    Award,
    Bookmark,
    Flame,
    Target,
    Zap,
    Quote,
    Sparkles
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';
import { WeatherCard } from '@/components/widgets/WeatherCard';
import { SearchWidget } from '@/components/tools/SearchWidget';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/SessionProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AppIcon } from './AppIcon';
import { useWeather } from '@/hooks/useWeather';

interface HomeDashboardProps {
    onNavigate: (mode: 'home' | 'schedule' | 'work') => void;
    onQuickLink: (mode: 'home' | 'schedule' | 'work', category: 'basic' | 'growth' | 'record', tab: string) => void;
}

// Define all available shortcuts
const ALL_SHORTCUTS = [
    { id: 'calendar', label: '일정', icon: CalendarIcon, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400', mode: 'schedule', cat: 'basic', tab: 'calendar' },
    { id: 'tasks', label: '할일', icon: CheckSquare, color: 'bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-400', mode: 'schedule', cat: 'basic', tab: 'tasks' },
    { id: 'projects', label: '프로젝트', icon: FolderTree, color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400', mode: 'schedule', cat: 'basic', tab: 'projects' },
    { id: 'people', label: '인맥', icon: UsersRound, color: 'bg-teal-50 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400', mode: 'schedule', cat: 'basic', tab: 'people' },
    { id: 'goals', label: '목표', icon: Trophy, color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400', mode: 'schedule', cat: 'growth', tab: 'goals' },
    { id: 'reading', label: '독서', icon: BookOpen, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400', mode: 'schedule', cat: 'growth', tab: 'reading' },
    { id: 'language', label: '어학', icon: Languages, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400', mode: 'schedule', cat: 'growth', tab: 'language' },
    { id: 'exercise', label: '운동', icon: Dumbbell, color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400', mode: 'schedule', cat: 'growth', tab: 'exercise' },
    { id: 'diet', label: '식단', icon: Utensils, color: 'bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-400', mode: 'schedule', cat: 'growth', tab: 'diet' },
    { id: 'hobby', label: '취미', icon: Palette, color: 'bg-pink-50 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400', mode: 'schedule', cat: 'growth', tab: 'hobby' },
    { id: 'learning', label: '학습', icon: Award, color: 'bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-900/40 dark:text-fuchsia-400', mode: 'schedule', cat: 'growth', tab: 'learning' },
    { id: 'portfolio', label: '커리어', icon: Briefcase, color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400', mode: 'schedule', cat: 'growth', tab: 'portfolio' },
    { id: 'journal', label: '일기', icon: NotebookPen, color: 'bg-violet-50 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400', mode: 'schedule', cat: 'record', tab: 'journal' },
    { id: 'ideas', label: '아이디어', icon: Lightbulb, color: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400', mode: 'schedule', cat: 'record', tab: 'ideas' },
    { id: 'scraps', label: '스크랩', icon: Bookmark, color: 'bg-lime-50 text-lime-600 dark:bg-lime-900/40 dark:text-lime-400', mode: 'schedule', cat: 'record', tab: 'scraps' },
    { id: 'ledger', label: '가계부', icon: PiggyBank, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400', mode: 'schedule', cat: 'finance', tab: 'ledger' },
    { id: 'work', label: '업무', icon: Briefcase, color: 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300', mode: 'work', cat: 'basic', tab: 'projects' },
] as const;

export function HomeDashboard({ onNavigate, onQuickLink }: HomeDashboardProps) {
    const { events, tasks, userProfile, homeShortcuts, setHomeShortcuts, habits, goals } = useData();
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const { weather, loading: weatherLoading, getWeatherIcon, getWeatherLabel } = useWeather();

    // Manage Shortcuts Dialog
    const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
    const [tempShortcuts, setTempShortcuts] = useState<string[]>([]);

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

            const now = currentTime || new Date();
            const today = new Date();

            const isToday = start.getDate() === today.getDate() &&
                start.getMonth() === today.getMonth() &&
                start.getFullYear() === today.getFullYear();

            return isToday && start > now;
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

    const displayName = userProfile?.name || user?.user_metadata?.name || '사용자';

    // Filter active shortcuts
    const activeShortcuts = ALL_SHORTCUTS.filter(s => homeShortcuts.includes(s.id));

    const handleOpenManage = () => {
        setTempShortcuts([...homeShortcuts]);
        setIsManageDialogOpen(true);
    };

    const handleSaveShortcuts = () => {
        setHomeShortcuts(tempShortcuts);
        setIsManageDialogOpen(false);
    };

    const toggleShortcut = (id: string) => {
        if (tempShortcuts.includes(id)) {
            setTempShortcuts(prev => prev.filter(mid => mid !== id));
        } else {
            setTempShortcuts(prev => [...prev, id]);
        }
    };

    return (
        <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-7xl mx-auto pb-20">
            {/* 1. Hero Section (Branding & Status) */}
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-[#202022] dark:to-[#1a1a1c] p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-2 duration-700 relative overflow-hidden">
                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
                    {/* Left: Branding & Quote */}
                    <div className="space-y-4">
                        <button
                            onClick={() => onNavigate('home')}
                            className="flex items-center gap-3 group text-left transition-opacity hover:opacity-80 cursor-pointer"
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
                                반가워요, {displayName}님!
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
                            className="bg-white dark:bg-gray-800 px-4 py-2.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group cursor-pointer"
                        >
                            <div className="w-2 h-2 rounded-full bg-red-500 group-hover:animate-pulse" />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                할일 <span className="text-blue-600">{todaysTasks.length}</span>개
                            </span>
                        </button>

                        {/* Weather Chip (Real Data) */}
                        <div className="bg-white dark:bg-gray-800 px-4 py-2.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                            {weatherLoading || !weather ? (
                                <Sun className="w-4 h-4 text-gray-300 animate-pulse" />
                            ) : (
                                getWeatherIcon(weather.current_weather.weathercode, "w-4 h-4")
                            )}
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                {weatherLoading || !weather ? '로딩중...' : `${getWeatherLabel(weather.current_weather.weathercode)} ${Math.round(weather.current_weather.temperature)}°`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Search (Minimal) */}
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100">
                <SearchWidget />
            </div>

            {/* 3. Icons (Customizable) */}
            <div className="bg-white dark:bg-[#202022] rounded-[24px] p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 relative group/section">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-[#333D4B] dark:text-gray-200">내 서비스</h3>
                    <Button variant="ghost" size="sm" onClick={handleOpenManage} className="h-8 text-xs text-muted-foreground hover:text-primary gap-1">
                        <Settings2 className="w-3.5 h-3.5" /> 편집
                    </Button>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-y-6 gap-x-2">
                    {activeShortcuts.map(item => (
                        <AppIcon
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            colorClass={item.color}
                            onClick={() => {
                                if (item.mode === 'work') {
                                    onNavigate('work');
                                } else {
                                    onQuickLink(item.mode as any, item.cat as any, item.tab);
                                }
                            }}
                        />
                    ))}
                    <button
                        onClick={handleOpenManage}
                        className="flex flex-col items-center justify-center gap-3 group"
                    >
                        <div className="w-[52px] h-[52px] rounded-2xl bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500 flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition-transform duration-300 border border-gray-100 dark:border-gray-700 border-dashed">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 group-hover:text-gray-600 transition-colors">
                            추가
                        </span>
                    </button>
                </div>
            </div>

            {/* 4. Feeds (Cards) - Unified 2x2 Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
                {/* Weather */}
                <div className="bg-white dark:bg-[#202022] rounded-[24px] p-5 shadow-sm flex flex-col justify-between min-h-[180px]">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg text-[#333D4B] dark:text-gray-200">오늘의 날씨</h3>
                            <p className="text-[#8B95A1] text-sm">준비는 하셨나요?</p>
                        </div>
                        <Sun className="w-8 h-8 text-orange-400" />
                    </div>
                    <div className="mt-2">
                        <WeatherCard />
                    </div>
                </div>

                {/* Schedule */}
                <div className="bg-white dark:bg-[#202022] rounded-[24px] p-5 shadow-sm flex flex-col min-h-[180px]">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-lg text-[#333D4B] dark:text-gray-200">다음 일정</h3>
                            <p className="text-[#8B95A1] text-sm mt-1">오늘 남은 일정을 확인하세요</p>
                        </div>
                        <Clock className="w-8 h-8 text-blue-400" />
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[160px] pr-2 -mr-2 space-y-2">
                        {todaysEvents.length > 0 ? (
                            todaysEvents.map((event, idx) => (
                                <div key={event.id} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50/50 dark:bg-black/20 text-sm">
                                    <div className="flex flex-col items-center min-w-[50px] text-xs font-medium text-muted-foreground border-r pr-3">
                                        <span>{format(new Date(event.start), 'HH:mm')}</span>
                                    </div>
                                    <div className="flex-1 truncate">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{event.title}</p>
                                    </div>
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: (event as any).isHabit ? '#fb923c' : '#3b82f6' }} />
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm opacity-60">
                                <p>예정된 일정이 없습니다.</p>
                            </div>
                        )}
                    </div>

                    {todaysEvents.length > 3 && (
                        <Button
                            variant="ghost"
                            className="w-full mt-2 h-8 text-xs text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => onQuickLink('schedule', 'basic', 'calendar')}
                        >
                            전체 일정 보기 <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                    )}
                </div>

                {/* Habits */}
                <div className="bg-white dark:bg-[#202022] rounded-[24px] p-5 shadow-sm flex flex-col min-h-[180px]">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-lg text-[#333D4B] dark:text-gray-200">오늘의 습관</h3>
                            <p className="text-[#8B95A1] text-sm mt-1">습관을 지키고 성장하세요</p>
                        </div>
                        <Flame className="w-8 h-8 text-orange-500" />
                    </div>

                    {(() => {
                        const todayHabits = habits.filter(h => {
                            const today = format(currentTime || new Date(), 'yyyy-MM-dd');
                            if (!h.days || h.days.length === 0) return true;
                            const dayOfWeek = (currentTime || new Date()).getDay();
                            return h.days.includes(dayOfWeek);
                        });
                        const completedCount = todayHabits.filter(h => h.completedDates.includes(format(currentTime || new Date(), 'yyyy-MM-dd'))).length;
                        const totalCount = todayHabits.length;
                        const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                        return (
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">완료율</span>
                                    <span className="text-2xl font-bold text-primary">{percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500 rounded-full"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{completedCount}/{totalCount} 습관 완료</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs"
                                        onClick={() => onQuickLink('schedule', 'basic', 'calendar')}
                                    >
                                        보기 <ArrowRight className="w-3 h-3 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Goals */}
                <div className="bg-white dark:bg-[#202022] rounded-[24px] p-5 shadow-sm flex flex-col min-h-[180px]">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-lg text-[#333D4B] dark:text-gray-200">활동 중인 목표</h3>
                            <p className="text-[#8B95A1] text-sm mt-1">목표를 향해 나아가세요</p>
                        </div>
                        <Trophy className="w-8 h-8 text-yellow-500" />
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 -mr-2">
                        {goals.slice(0, 3).map(goal => {
                            const progress = goal.progress || 0;
                            return (
                                <div key={goal.id} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1">{goal.title}</span>
                                        <span className="text-xs font-bold text-primary ml-2">{progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {goals.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm opacity-60">
                                <p>목표를 설정해보세요</p>
                            </div>
                        )}
                    </div>

                    {goals.length > 3 && (
                        <Button
                            variant="ghost"
                            className="w-full mt-2 h-6 text-xs text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => onQuickLink('schedule', 'growth', 'goals')}
                        >
                            전체 보기 <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Manage Shortcuts Dialog */}
            <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>내 서비스 관리</DialogTitle>
                        <DialogDescription>
                            자주 사용하는 메뉴를 선택하여 홈 화면에 추가하세요.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-4 gap-4 py-6 max-h-[60vh] overflow-y-auto">
                        {ALL_SHORTCUTS.map(item => {
                            const isSelected = tempShortcuts.includes(item.id);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => toggleShortcut(item.id)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all relative",
                                        isSelected
                                            ? "border-primary bg-primary/5"
                                            : "border-transparent bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                                    )}
                                >
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                                            <CheckSquare className="w-3 h-3" />
                                        </div>
                                    )}
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isSelected ? "bg-white shadow-sm" : "bg-gray-200/50 dark:bg-gray-700")}>
                                        <item.icon className={cn("w-5 h-5", isSelected ? "text-primary" : "text-gray-400")} />
                                    </div>
                                    <span className={cn("text-xs font-medium", isSelected ? "text-primary" : "text-gray-500")}>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsManageDialogOpen(false)}>취소</Button>
                        <Button onClick={handleSaveShortcuts}>저장하기</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

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
    Sparkles,
    Moon,
    Sunrise,
    Sunset
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';
import { WeatherCard } from '@/components/widgets/WeatherCard';
import { SearchWidget } from '@/components/tools/SearchWidget';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/SessionProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AppIcon } from './AppIcon';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeather } from '@/hooks/useWeather';
import { GlowingGrid, GlowingEffectItem } from '@/components/ui/glowing-effect';
import { motion, AnimatePresence } from 'framer-motion';

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

    // Greeting State
    const [greeting, setGreeting] = useState({ text: '안녕하세요', icon: Sun, sub: '오늘도 멋진 하루를 시작하세요.' });

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        // Initial greeting set
        updateGreeting(new Date());

        return () => clearInterval(timer);
    }, []);

    const updateGreeting = (date: Date) => {
        const hour = date.getHours();
        if (hour >= 5 && hour < 12) {
            setGreeting({ text: '좋은 아침입니다', icon: Sunrise, sub: '상쾌한 시작을 응원합니다.' });
        } else if (hour >= 12 && hour < 18) {
            setGreeting({ text: '활기찬 오후입니다', icon: Sun, sub: '남은 하루도 힘내세요!' });
        } else if (hour >= 18 && hour < 22) {
            setGreeting({ text: '편안한 저녁입니다', icon: Sunset, sub: '오늘 하루도 고생 많으셨습니다.' });
        } else {
            setGreeting({ text: '감성적인 밤입니다', icon: Moon, sub: '내일을 위한 충전의 시간입니다.' });
        }
    };

    // Update greeting every minute to verify
    useEffect(() => {
        if (currentTime) updateGreeting(currentTime);
    }, [currentTime]);

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

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 20
            }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col gap-4 sm:gap-6 w-full max-w-7xl mx-auto pb-20"
        >
            {/* 1. Hero Section (Branding & Status) */}
            <motion.div variants={itemVariants}>
                <GlowingEffectItem>
                    <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 h-full relative z-10">
                        {/* Left: Branding & Quote */}
                        <div className="space-y-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onNavigate('home')}
                                className="flex items-center gap-3 group text-left transition-opacity hover:opacity-80 cursor-pointer"
                            >
                                <div className="w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-[-5deg] group-hover:rotate-0 transition-transform duration-300">
                                    <LogoIcon />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-none">
                                        LIFE <span className="text-blue-600">Controller</span>
                                    </h1>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5 ml-0.5">Daily Productivity OS</p>
                                </div>
                            </motion.button>

                            <div className="space-y-1">
                                <motion.div
                                    key={greeting.text}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        {greeting.text}, {displayName}님!
                                        <greeting.icon className="w-5 h-5 text-yellow-500" />
                                    </h2>
                                </motion.div>
                                <motion.p
                                    key={greeting.sub}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm text-slate-500 font-medium"
                                >
                                    "{greeting.sub}"
                                </motion.p>
                            </div>
                        </div>

                        {/* Right: Quick Stats (Chips) */}
                        <div className="flex flex-wrap gap-2">
                            {/* Date Chip */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 cursor-default"
                            >
                                <CalendarIcon className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-bold text-slate-700">
                                    {currentTime ? format(currentTime, 'M월 d일 EEEE', { locale: ko }) : '...'}
                                </span>
                            </motion.div>

                            {/* Task Chip */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onQuickLink('schedule', 'basic', 'tasks')}
                                className="bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-colors group cursor-pointer"
                            >
                                <div className="w-2 h-2 rounded-full bg-red-500 group-hover:animate-pulse" />
                                <span className="text-sm font-bold text-slate-700">
                                    할일 <span className="text-blue-600">{todaysTasks.length}</span>개
                                </span>
                            </motion.button>

                            {/* Weather Chip (Real Data) */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 cursor-pointer min-w-[120px]"
                                onClick={() => {/* Open detailed weather if needed */ }}
                            >
                                {weatherLoading || !weather ? (
                                    <>
                                        <Skeleton className="w-4 h-4 rounded-full" />
                                        <Skeleton className="h-4 w-16 bg-gray-200" />
                                    </>
                                ) : (
                                    <>
                                        {getWeatherIcon(weather.current_weather.weathercode, "w-4 h-4")}
                                        <span className="text-sm font-bold text-slate-700">
                                            {`${getWeatherLabel(weather.current_weather.weathercode)} ${Math.round(weather.current_weather.temperature)}°`}
                                        </span>
                                    </>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </GlowingEffectItem>
            </motion.div>

            {/* 2. Search (Minimal) */}
            <motion.div variants={itemVariants} className="z-20">
                <GlowingEffectItem className="p-0">
                    <div className="px-2">
                        <SearchWidget />
                    </div>
                </GlowingEffectItem>
            </motion.div>

            {/* 3. Icons (Customizable) */}
            <motion.div variants={itemVariants}>
                <GlowingEffectItem>
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-slate-800">내 서비스</h3>
                        <Button variant="ghost" size="sm" onClick={handleOpenManage} className="h-8 text-xs text-slate-500 hover:text-slate-900 hover:bg-gray-100 gap-1">
                            <Settings2 className="w-3.5 h-3.5" /> 편집
                        </Button>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-y-6 gap-x-2">
                        {activeShortcuts.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + (i * 0.05) }}
                            >
                                <AppIcon
                                    icon={item.icon}
                                    label={item.label}
                                    colorClass={item.color}
                                    labelClassName="text-slate-600 group-hover:text-slate-900"
                                    onClick={() => {
                                        if (item.mode === 'work') {
                                            onNavigate('work');
                                        } else {
                                            onQuickLink(item.mode as any, item.cat as any, item.tab);
                                        }
                                    }}
                                />
                            </motion.div>
                        ))}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + (activeShortcuts.length * 0.05) }}
                            onClick={handleOpenManage}
                            className="flex flex-col items-center justify-center gap-3 group"
                        >
                            <div className="w-[52px] h-[52px] rounded-2xl bg-gray-50 text-slate-400 flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition-transform duration-300 border border-gray-200 border-dashed group-hover:border-gray-300 group-hover:bg-gray-100">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600 transition-colors">
                                추가
                            </span>
                        </motion.button>
                    </div>
                </GlowingEffectItem>
            </motion.div>

            {/* 4. Feeds (Cards) - Unified 2x2 Grid */}
            <motion.div variants={itemVariants}>
                <GlowingGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {/* Weather */}
                    <GlowingEffectItem>
                        <div className="flex flex-col justify-between min-h-[180px] h-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">오늘의 날씨</h3>
                                    <p className="text-slate-500 text-sm">준비는 하셨나요?</p>
                                </div>
                                <Sun className="w-8 h-8 text-orange-400" />
                            </div>
                            <div className="mt-2">
                                <WeatherCard />
                            </div>
                        </div>
                    </GlowingEffectItem>

                    {/* Schedule */}
                    <GlowingEffectItem>
                        <div className="flex flex-col min-h-[180px] h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">다음 일정</h3>
                                    <p className="text-slate-500 text-sm mt-1">오늘 남은 일정을 확인하세요</p>
                                </div>
                                <Clock className="w-8 h-8 text-blue-400" />
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[160px] pr-2 -mr-2 space-y-2">
                                {todaysEvents.length > 0 ? (
                                    todaysEvents.map((event, idx) => (
                                        <div key={event.id} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 text-sm border border-gray-100">
                                            <div className="flex flex-col items-center min-w-[50px] text-xs font-medium text-slate-500 border-r border-gray-200 pr-3">
                                                <span>{format(new Date(event.start), 'HH:mm')}</span>
                                            </div>
                                            <div className="flex-1 truncate">
                                                <p className="font-semibold text-slate-700 truncate">{event.title}</p>
                                            </div>
                                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: (event as any).isHabit ? '#fb923c' : '#3b82f6' }} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm opacity-60">
                                        <p>예정된 일정이 없습니다.</p>
                                    </div>
                                )}
                            </div>

                            {todaysEvents.length > 3 && (
                                <Button
                                    variant="ghost"
                                    className="w-full mt-2 h-8 text-xs text-slate-500 hover:bg-gray-100 hover:text-slate-900"
                                    onClick={() => onQuickLink('schedule', 'basic', 'calendar')}
                                >
                                    전체 일정 보기 <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                            )}
                        </div>
                    </GlowingEffectItem>

                    {/* Habits */}
                    <GlowingEffectItem>
                        <div className="flex flex-col min-h-[180px] h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">오늘의 습관</h3>
                                    <p className="text-slate-500 text-sm mt-1">습관을 지키고 성장하세요</p>
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
                                            <span className="text-sm font-medium text-slate-500">완료율</span>
                                            <span className="text-2xl font-bold text-primary">{percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                            />
                                        </div>
                                        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                                            <span>{completedCount}/{totalCount} 습관 완료</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-xs text-slate-500 hover:text-slate-900 hover:bg-gray-100"
                                                onClick={() => onQuickLink('schedule', 'basic', 'calendar')}
                                            >
                                                보기 <ArrowRight className="w-3 h-3 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </GlowingEffectItem>

                    {/* Goals */}
                    <GlowingEffectItem>
                        <div className="flex flex-col min-h-[180px] h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">활동 중인 목표</h3>
                                    <p className="text-slate-500 text-sm mt-1">목표를 향해 나아가세요</p>
                                </div>
                                <Trophy className="w-8 h-8 text-yellow-500" />
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 -mr-2">
                                {goals.slice(0, 3).map(goal => {
                                    const progress = goal.progress || 0;
                                    return (
                                        <div key={goal.id} className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-slate-700 truncate flex-1">{goal.title}</span>
                                                <span className="text-xs font-bold text-primary ml-2">{progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                {goals.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm opacity-60">
                                        <p>목표를 설정해보세요</p>
                                    </div>
                                )}
                            </div>

                            {goals.length > 3 && (
                                <Button
                                    variant="ghost"
                                    className="w-full mt-2 h-6 text-xs text-slate-500 hover:bg-gray-100 hover:text-slate-900"
                                    onClick={() => onQuickLink('schedule', 'growth', 'goals')}
                                >
                                    전체 보기 <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                            )}
                        </div>
                    </GlowingEffectItem>
                </GlowingGrid>
            </motion.div>

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
        </motion.div>
    );
}

const LogoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="translate-y-[1px]">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

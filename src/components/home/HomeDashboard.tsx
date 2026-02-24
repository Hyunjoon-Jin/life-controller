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
import { SetupChecklist } from './SetupChecklist';
import { CategoryType } from '@/constants/menu';

interface HomeDashboardProps {
    onNavigate: (mode: 'home' | 'schedule' | 'work' | 'study') => void;
    onQuickLink: (mode: 'home' | 'schedule' | 'work' | 'study', category: CategoryType, tab: string) => void;
}

// Define all available shortcuts
const ALL_SHORTCUTS = [
    { id: 'calendar', label: '일정', icon: CalendarIcon, color: 'text-emerald-400 bg-emerald-500/10', mode: 'schedule', cat: 'basic', tab: 'calendar' },
    { id: 'tasks', label: '할일', icon: CheckSquare, color: 'text-emerald-400 bg-emerald-500/10', mode: 'schedule', cat: 'basic', tab: 'tasks' },
    { id: 'projects', label: '인맥', icon: UsersRound, color: 'text-emerald-400 bg-emerald-500/10', mode: 'schedule', cat: 'basic', tab: 'projects' },
    { id: 'people', label: '인맥', icon: UsersRound, color: 'text-emerald-400 bg-emerald-500/10', mode: 'schedule', cat: 'basic', tab: 'people' },
    { id: 'goals', label: '목표', icon: Trophy, color: 'text-emerald-400 bg-emerald-500/10', mode: 'schedule', cat: 'basic', tab: 'goals' },
    { id: 'reading', label: '독서', icon: BookOpen, color: 'text-emerald-400 bg-emerald-500/10', mode: 'schedule', cat: 'basic', tab: 'reading' },
    { id: 'language', label: '어학', icon: Languages, color: 'text-emerald-400 bg-emerald-500/10', mode: 'schedule', cat: 'basic', tab: 'language' },
    { id: 'exercise', label: '운동', icon: Dumbbell, color: 'text-emerald-400 bg-emerald-500/10', mode: 'schedule', cat: 'basic', tab: 'exercise' },
    { id: 'diet', label: '식단', icon: Utensils, color: 'text-emerald-400 bg-emerald-500/10', mode: 'schedule', cat: 'basic', tab: 'diet' },
    { id: 'hobby', label: '취미', icon: Palette, color: 'text-emerald-400 bg-emerald-500/10', mode: 'schedule', cat: 'basic', tab: 'hobby' },
    { id: 'learning', label: '학습', icon: Award, color: 'text-emerald-400 bg-emerald-500/10', mode: 'schedule', cat: 'basic', tab: 'learning' },
    { id: 'portfolio', label: '커리어', icon: Briefcase, color: 'text-emerald-400 bg-emerald-500/10', mode: 'schedule', cat: 'record', tab: 'portfolio' },
    { id: 'journal', label: '일기', icon: NotebookPen, color: 'text-violet-400 bg-violet-500/10', mode: 'schedule', cat: 'record', tab: 'journal' },
    { id: 'ideas', label: '아이디어', icon: Lightbulb, color: 'text-yellow-400 bg-yellow-500/10', mode: 'schedule', cat: 'record', tab: 'ideas' },
    { id: 'scraps', label: '스크랩', icon: Bookmark, color: 'text-lime-400 bg-lime-500/10', mode: 'schedule', cat: 'record', tab: 'scraps' },
    { id: 'ledger', label: '가계부', icon: PiggyBank, color: 'text-amber-400 bg-amber-500/10', mode: 'schedule', cat: 'finance', tab: 'ledger' },
    { id: 'work', label: '업무', icon: Briefcase, color: 'text-indigo-400 bg-indigo-500/10', mode: 'work', cat: 'basic', tab: 'projects' },
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
            className="flex flex-col gap-6 sm:gap-8 w-full max-w-7xl mx-auto pb-20 relative z-10"
        >
            {/* 1. Hero Section (Branding & Status) */}
            <motion.div variants={itemVariants} className="relative">
                <div className="glass-premium p-6 sm:p-8 rounded-[28px] overflow-hidden relative">
                    {/* Decorative Flare */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32 rounded-full" />

                    <div className="flex flex-col md:flex-row justify-between md:items-end gap-8 h-full relative z-10">
                        {/* Left: Branding & Quote */}
                        <div className="space-y-6">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onNavigate('home')}
                                className="flex items-center gap-4 group text-left transition-opacity hover:opacity-90 cursor-pointer"
                            >
                                <div className="w-12 h-12 bg-emerald-500 text-white rounded-[14px] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] transform rotate-[-4deg] group-hover:rotate-0 transition-all duration-500">
                                    <LogoIcon />
                                </div>
                                <div className="space-y-0.5">
                                    <h1 className="text-3xl font-extrabold tracking-tighter text-white leading-none">
                                        LIFE <span className="text-emerald-400">Controller</span>
                                    </h1>
                                    <p className="text-[11px] text-emerald-400/60 font-bold uppercase tracking-[0.2em] ml-0.5">Premium Productivity OS</p>
                                </div>
                            </motion.button>

                            <div className="space-y-2">
                                <motion.div
                                    key={greeting.text}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-3"
                                >
                                    <h2 className="text-xl md:text-2xl font-bold text-white/90 flex items-center gap-3">
                                        {greeting.text}, {displayName}님!
                                        <greeting.icon className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
                                    </h2>
                                </motion.div>
                                <motion.p
                                    key={greeting.sub}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-base text-white/50 font-medium italic"
                                >
                                    "{greeting.sub}"
                                </motion.p>
                            </div>
                        </div>

                        {/* Right: Quick Stats (Chips) */}
                        <div className="flex flex-wrap gap-3">
                            {/* Date Chip */}
                            <motion.div
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                className="glass-surface px-5 py-3 rounded-2xl flex items-center gap-3 cursor-default transition-colors border-white/5"
                            >
                                <CalendarIcon className="w-5 h-5 text-emerald-400" />
                                <span className="text-sm font-bold text-white/80">
                                    {currentTime ? format(currentTime, 'M월 d일 EEEE', { locale: ko }) : '...'}
                                </span>
                            </motion.div>

                            {/* Task Chip */}
                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onQuickLink('schedule', 'basic', 'tasks')}
                                className="glass-surface px-5 py-3 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all group cursor-pointer border-white/5"
                            >
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] group-hover:animate-pulse" />
                                <span className="text-sm font-bold text-white/80">
                                    할일 <span className="text-emerald-400">{todaysTasks.length}</span>개
                                </span>
                            </motion.button>

                            {/* Weather Chip */}
                            <motion.div
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                className="glass-surface px-5 py-3 rounded-2xl flex items-center gap-3 cursor-pointer min-w-[130px] border-white/5"
                            >
                                {weatherLoading || !weather ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-white/10 animate-pulse" />
                                        <div className="h-4 w-12 bg-white/10 rounded animate-pulse" />
                                    </div>
                                ) : (
                                    <>
                                        {getWeatherIcon(weather.current_weather.weathercode, "w-5 h-5 text-emerald-400")}
                                        <span className="text-sm font-bold text-white/80">
                                            {`${getWeatherLabel(weather.current_weather.weathercode)} ${Math.round(weather.current_weather.temperature)}°`}
                                        </span>
                                    </>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 2. Search (Minimal) */}
            <motion.div variants={itemVariants} className="z-20" data-tour="search">
                <GlowingEffectItem className="p-0">
                    <div className="px-2">
                        <SearchWidget />
                    </div>
                </GlowingEffectItem>
            </motion.div>

            {/* Setup Checklist (Onboarding) */}
            <motion.div variants={itemVariants} data-tour="checklist">
                <SetupChecklist />
            </motion.div>

            {/* 3. Icons (Customizable) */}
            <motion.div variants={itemVariants} data-tour="shortcuts">
                <div className="glass-premium p-6 sm:p-8 rounded-[24px]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                            <h3 className="text-xl font-bold text-white/90">내 서비스</h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleOpenManage}
                            className="h-9 px-4 text-xs font-bold text-white/40 hover:text-white hover:bg-white/5 rounded-xl border border-white/5 gap-2"
                        >
                            <Settings2 className="w-4 h-4" /> 편집
                        </Button>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-y-8 gap-x-4">
                        {activeShortcuts.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + (i * 0.03) }}
                            >
                                <AppIcon
                                    icon={item.icon}
                                    label={item.label}
                                    colorClass={cn(item.color, "btn-premium btn-glow-life")}
                                    labelClassName="text-white/60 group-hover:text-white font-medium"
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
                            transition={{ delay: 0.2 + (activeShortcuts.length * 0.03) }}
                            onClick={handleOpenManage}
                            className="flex flex-col items-center justify-center gap-3 group"
                        >
                            <div className="w-[56px] h-[56px] rounded-2xl glass-surface text-white/50 flex items-center justify-center text-xl hover:scale-105 hover:bg-white/5 hover:text-white/60 transition-all duration-300 border-dashed border-white/10">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-white/50 group-hover:text-white/60 transition-colors">
                                추가
                            </span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* 4. Feeds (Cards) - Unified 2x2 Grid */}
            <motion.div variants={itemVariants}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {/* Weather */}
                    <div className="glass-premium p-8 rounded-[24px] flex flex-col justify-between min-h-[220px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[60px] rounded-full group-hover:bg-orange-500/10 transition-colors" />
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <h3 className="font-bold text-xl text-white/90">오늘의 날씨</h3>
                                <p className="text-white/40 text-sm font-medium">준비는 하셨나요?</p>
                            </div>
                            <Sun className="w-10 h-10 text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.4)]" />
                        </div>
                        <div className="mt-6 relative z-10">
                            <WeatherCard />
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="glass-premium p-8 rounded-[24px] flex flex-col min-h-[220px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full group-hover:bg-blue-500/10 transition-colors" />
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <h3 className="font-bold text-xl text-white/90">다음 일정</h3>
                                <p className="text-white/40 text-sm font-medium">오늘 남은 일정을 확인하세요</p>
                            </div>
                            <Clock className="w-10 h-10 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.4)]" />
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[160px] pr-2 -mr-2 space-y-3 relative z-10">
                            {todaysEvents.length > 0 ? (
                                todaysEvents.map((event, idx) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-center gap-4 p-3 rounded-2xl glass-surface text-sm border-white/5 group/link cursor-pointer hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex flex-col items-center min-w-[55px] text-xs font-bold text-white/40 border-r border-white/10 pr-4">
                                            <span>{format(new Date(event.start), 'HH:mm')}</span>
                                        </div>
                                        <div className="flex-1 truncate">
                                            <p className="font-bold text-white/80 truncate group-hover/link:text-white transition-colors">{event.title}</p>
                                        </div>
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.6)]" style={{ backgroundColor: (event as any).isHabit ? '#10B981' : '#3B82F6' }} />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-white/60 text-sm font-medium py-8">
                                    <p>예정된 일정이 없습니다.</p>
                                </div>
                            )}
                        </div>

                        {todaysEvents.length > 3 && (
                            <Button
                                variant="ghost"
                                className="w-full mt-4 h-10 text-xs font-bold text-white/50 hover:bg-white/5 hover:text-white rounded-xl gap-2 transition-all"
                                onClick={() => onQuickLink('schedule', 'basic', 'calendar')}
                            >
                                전체 일정 보기 <ArrowRight className="w-4 h-4" />
                            </Button>
                        )}
                    </div>

                    {/* Habits */}
                    <div className="glass-premium p-8 rounded-[24px] flex flex-col min-h-[220px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full group-hover:bg-emerald-500/10 transition-colors" />
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <h3 className="font-bold text-xl text-white/90">오늘의 습관</h3>
                                <p className="text-white/40 text-sm font-medium">습관을 지키고 성장하세요</p>
                            </div>
                            <Flame className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
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
                                <div className="flex-1 flex flex-col justify-center relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-bold text-white/40">완료율</span>
                                        <span className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">{percentage}%</span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-3.5 overflow-hidden border border-white/5">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                                        />
                                    </div>
                                    <div className="mt-5 flex items-center justify-between">
                                        <span className="text-sm font-bold text-white/40">{completedCount}/{totalCount} 습관 완료</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-9 px-4 text-xs font-bold text-white/40 hover:text-white hover:bg-white/5 rounded-xl border border-white/5 transition-all"
                                            onClick={() => onQuickLink('schedule', 'basic', 'calendar')}
                                        >
                                            보기 <ArrowRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Goals */}
                    <div className="glass-premium p-8 rounded-[24px] flex flex-col min-h-[220px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-[60px] rounded-full group-hover:bg-yellow-500/10 transition-colors" />
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <h3 className="font-bold text-xl text-white/90">활동 중인 목표</h3>
                                <p className="text-white/40 text-sm font-medium">목표를 향해 나아가세요</p>
                            </div>
                            <Trophy className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]" />
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 pr-2 -mr-2 relative z-10">
                            {goals.slice(0, 3).map((goal, idx) => {
                                const progress = goal.progress || 0;
                                return (
                                    <motion.div
                                        key={goal.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-white/70 truncate flex-1">{goal.title}</span>
                                            <span className="text-sm font-black text-emerald-400 ml-2">{progress}%</span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                                            />
                                        </div>
                                    </motion.div>
                                );
                            })}
                            {goals.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-white/60 text-sm font-medium py-8">
                                    <p>목표를 설정해보세요</p>
                                </div>
                            )}
                        </div>

                        {goals.length > 3 && (
                            <Button
                                variant="ghost"
                                className="w-full mt-4 h-10 text-xs font-bold text-white/50 hover:bg-white/5 hover:text-white rounded-xl gap-2 transition-all"
                                onClick={() => onQuickLink('schedule', 'basic', 'goals')}
                            >
                                전체 보기 <ArrowRight className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Manage Shortcuts Dialog */}
            <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
                <DialogContent className="max-w-lg bg-modal border border-border text-foreground">
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
                                            ? "border-primary bg-primary/15"
                                            : "border-border bg-muted/50 hover:bg-muted"
                                    )}
                                >
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                                            <CheckSquare className="w-3 h-3" />
                                        </div>
                                    )}
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isSelected ? "bg-primary/20" : "bg-muted")}>
                                        <item.icon className={cn("w-5 h-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                                    </div>
                                    <span className={cn("text-xs font-medium", isSelected ? "text-primary" : "text-muted-foreground")}>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => setIsManageDialogOpen(false)}>취소</Button>
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

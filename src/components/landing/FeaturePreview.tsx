'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Target, DollarSign, Activity,
    CheckCircle2, Clock, TrendingUp, TrendingDown,
    Dumbbell, ChevronRight, Flame, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
    { id: 'schedule', label: '일정 관리', icon: Calendar, color: 'blue' },
    { id: 'goals', label: '목표 달성', icon: Target, color: 'green' },
    { id: 'finance', label: '자산 관리', icon: DollarSign, color: 'emerald' },
    { id: 'health', label: '건강 관리', icon: Activity, color: 'rose' },
] as const;

type TabId = typeof TABS[number]['id'];

// --- Mock Data ---
const MOCK_SCHEDULE = {
    weekDays: ['월', '화', '수', '목', '금', '토', '일'],
    today: 3, // Thursday index
    events: [
        { time: '09:00', title: '팀 스탠드업 미팅', color: 'bg-blue-500' },
        { time: '11:00', title: '디자인 리뷰', color: 'bg-purple-500' },
        { time: '14:00', title: '프로젝트 기획 회의', color: 'bg-indigo-500' },
    ],
    tasks: [
        { title: '주간 보고서 작성', done: true },
        { title: 'UI 개선 PR 리뷰', done: false },
        { title: '신규 API 설계 문서', done: false },
    ],
};

const MOCK_GOALS = [
    { title: '올해 독서 24권 달성', progress: 62, sub: '15/24권 완독', icon: BookOpen, color: 'text-blue-400' },
    { title: '체중 5kg 감량', progress: 40, sub: '-2kg / -5kg', icon: Flame, color: 'text-orange-400' },
    { title: '사이드 프로젝트 런칭', progress: 85, sub: '최종 테스트 단계', icon: Target, color: 'text-green-400' },
];

const MOCK_FINANCE = {
    income: 4500000,
    expense: 2870000,
    categories: [
        { name: '식비', amount: 620000, ratio: 22, color: 'bg-orange-400' },
        { name: '교통비', amount: 180000, ratio: 6, color: 'bg-blue-400' },
        { name: '쇼핑', amount: 450000, ratio: 16, color: 'bg-pink-400' },
        { name: '주거비', amount: 850000, ratio: 30, color: 'bg-purple-400' },
        { name: '기타', amount: 770000, ratio: 26, color: 'bg-gray-400' },
    ],
};

const MOCK_HEALTH = {
    workouts: [
        { name: '벤치프레스', sets: '4세트 × 10회', weight: '60kg' },
        { name: '스쿼트', sets: '5세트 × 8회', weight: '80kg' },
        { name: '데드리프트', sets: '3세트 × 6회', weight: '100kg' },
    ],
    stats: { calories: 2150, steps: 8432, water: 1.8 },
};

// --- Sub-Components ---
function SchedulePreview() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Mini Week Calendar */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-muted-foreground">이번 주</h4>
                <div className="flex gap-2">
                    {MOCK_SCHEDULE.weekDays.map((day, i) => (
                        <div
                            key={day}
                            className={cn(
                                "flex-1 text-center py-2 rounded-xl text-sm font-bold transition-all",
                                i === MOCK_SCHEDULE.today
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                    : "bg-muted text-muted-foreground"
                            )}
                        >
                            <div className="text-[10px] opacity-70">{day}</div>
                            <div className="text-base">{13 + i}</div>
                        </div>
                    ))}
                </div>
                {/* Events */}
                <div className="space-y-2 mt-3">
                    {MOCK_SCHEDULE.events.map((event, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border shadow-sm"
                        >
                            <div className={cn("w-1 h-8 rounded-full", event.color)} />
                            <div>
                                <p className="text-sm font-bold text-foreground">{event.title}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {event.time}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Tasks */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-muted-foreground">오늘 할 일</h4>
                <div className="space-y-2">
                    {MOCK_SCHEDULE.tasks.map((task, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border transition-all",
                                task.done
                                    ? "bg-green-500/10 border-green-500/20"
                                    : "bg-card border-border shadow-sm"
                            )}
                        >
                            <CheckCircle2
                                className={cn(
                                    "w-5 h-5 shrink-0",
                                    task.done ? "text-green-500 fill-green-500/20" : "text-muted-foreground/40"
                                )}
                            />
                            <span className={cn(
                                "text-sm font-medium",
                                task.done ? "line-through text-muted-foreground" : "text-foreground"
                            )}>
                                {task.title}
                            </span>
                        </motion.div>
                    ))}
                </div>
                <div className="p-4 bg-blue-500/10 rounded-xl text-center">
                    <p className="text-xs text-blue-400 font-bold">📊 오늘 완료율</p>
                    <p className="text-2xl font-extrabold text-blue-400">33%</p>
                </div>
            </div>
        </div>
    );
}

function GoalsPreview() {
    return (
        <div className="space-y-4">
            {MOCK_GOALS.map((goal, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.12 }}
                    className="p-4 bg-card rounded-2xl border border-border shadow-sm"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-xl bg-muted/50", goal.color)}>
                                <goal.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">{goal.title}</p>
                                <p className="text-xs text-muted-foreground">{goal.sub}</p>
                            </div>
                        </div>
                        <span className="text-lg font-extrabold text-foreground">{goal.progress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${goal.progress}%` }}
                            transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }}
                        />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

function FinancePreview() {
    const balance = MOCK_FINANCE.income - MOCK_FINANCE.expense;
    return (
        <div className="space-y-5">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-center">
                    <TrendingUp className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <p className="text-[10px] text-blue-400 font-medium">수입</p>
                    <p className="text-sm font-extrabold text-blue-400">
                        {(MOCK_FINANCE.income / 10000).toFixed(0)}만
                    </p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-2xl text-center">
                    <TrendingDown className="w-5 h-5 text-red-400 mx-auto mb-1" />
                    <p className="text-[10px] text-red-400 font-medium">지출</p>
                    <p className="text-sm font-extrabold text-red-400">
                        {(MOCK_FINANCE.expense / 10000).toFixed(0)}만
                    </p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-2xl text-center">
                    <DollarSign className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <p className="text-[10px] text-green-400 font-medium">남은 금액</p>
                    <p className="text-sm font-extrabold text-green-400">
                        +{(balance / 10000).toFixed(0)}만
                    </p>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-3">
                <h4 className="text-sm font-bold text-muted-foreground">카테고리별 지출</h4>
                {MOCK_FINANCE.categories.map((cat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-3"
                    >
                        <div className={cn("w-3 h-3 rounded-full shrink-0", cat.color)} />
                        <span className="text-sm text-muted-foreground w-16">{cat.name}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                className={cn("h-full rounded-full", cat.color)}
                                initial={{ width: 0 }}
                                animate={{ width: `${cat.ratio}%` }}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                            />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground w-14 text-right">
                            {(cat.amount / 10000).toFixed(0)}만원
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function HealthPreview() {
    return (
        <div className="space-y-5">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-orange-500/10 rounded-2xl text-center">
                    <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                    <p className="text-[10px] text-orange-400 font-medium">칼로리</p>
                    <p className="text-sm font-extrabold text-orange-400">{MOCK_HEALTH.stats.calories}kcal</p>
                </div>
                <div className="p-3 bg-cyan-500/10 rounded-2xl text-center">
                    <Activity className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-[10px] text-cyan-400 font-medium">걸음수</p>
                    <p className="text-sm font-extrabold text-cyan-400">{MOCK_HEALTH.stats.steps.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-2xl text-center">
                    <span className="text-lg">💧</span>
                    <p className="text-[10px] text-blue-400 font-medium">수분</p>
                    <p className="text-sm font-extrabold text-blue-400">{MOCK_HEALTH.stats.water}L</p>
                </div>
            </div>

            {/* Workout Log */}
            <div className="space-y-3">
                <h4 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" /> 오늘 운동 기록
                </h4>
                {MOCK_HEALTH.workouts.map((w, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-3 bg-card rounded-xl border border-border shadow-sm"
                    >
                        <div>
                            <p className="text-sm font-bold text-foreground">{w.name}</p>
                            <p className="text-xs text-muted-foreground">{w.sets}</p>
                        </div>
                        <span className="text-sm font-extrabold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-lg">{w.weight}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// --- Main Component ---
export function FeaturePreview() {
    const [activeTab, setActiveTab] = useState<TabId>('schedule');

    const renderContent = () => {
        switch (activeTab) {
            case 'schedule': return <SchedulePreview />;
            case 'goals': return <GoalsPreview />;
            case 'finance': return <FinancePreview />;
            case 'health': return <HealthPreview />;
        }
    };

    return (
        <section className="py-20 md:py-28 px-4 bg-background relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />

            <div className="container mx-auto max-w-5xl relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
                        직접 체험해보세요
                    </h2>
                    <p className="text-muted-foreground text-base md:text-lg">
                        가입 전에 주요 기능을 미리 살펴보세요.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex bg-muted rounded-2xl p-1.5 gap-1">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "relative flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                                    activeTab === tab.id
                                        ? "text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activePreviewTab"
                                        className="absolute inset-0 bg-card rounded-xl shadow-sm"
                                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                    />
                                )}
                                <tab.icon className="w-4 h-4 relative z-10" />
                                <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Panel */}
                <div className="bg-muted/50 backdrop-blur-sm rounded-3xl border border-border p-6 md:p-8 min-h-[380px] shadow-sm">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* CTA */}
                <div className="text-center mt-10">
                    <a
                        href="/register"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-base font-bold shadow-lg shadow-black/10 transition-all hover:shadow-xl"
                    >
                        지금 무료로 시작하기 <ChevronRight className="w-5 h-5" />
                    </a>
                    <p className="text-xs text-muted-foreground mt-3">카드 등록 없이 바로 시작할 수 있습니다.</p>
                </div>
            </div>
        </section>
    );
}

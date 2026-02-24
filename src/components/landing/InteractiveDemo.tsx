'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
    Calendar, Target, DollarSign, Activity,
    CheckCircle2, Clock, TrendingUp, TrendingDown,
    Plus, ChevronRight, Flame, BookOpen, Trash2, PieChart, Sparkles,
    User, Briefcase, GraduationCap, Lightbulb, Users, Settings, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const DEMO_TABS = [
    { id: 'schedule', label: '일정', icon: Calendar, color: 'blue' },
    { id: 'goals', label: '목표', icon: Target, color: 'green' },
    { id: 'finance', label: '경제', icon: DollarSign, color: 'emerald' },
    { id: 'health', label: '건강', icon: Activity, color: 'rose' },
    { id: 'team', label: '팀', icon: Users, color: 'purple' },
    { id: 'ideas', label: '아이디어', icon: Lightbulb, color: 'amber' },
] as const;

type DemoTabId = typeof DEMO_TABS[number]['id'];

const PERSONAS = [
    { id: 'student', label: '학생', icon: GraduationCap, desc: '학습 및 시험 일정 관리' },
    { id: 'office', label: '직장인', icon: Briefcase, desc: '프로젝트 및 금융 관리' },
    { id: 'freelancer', label: '프리랜서', icon: User, desc: '루틴 및 자기계발 강화' },
];

// ─── Initial state constants ─────────────────────────────────────────────────
const INITIAL_TASKS = [
    { id: '1', title: '팀 스탠드업 미팅', time: '09:00', done: true },
    { id: '2', title: '신규 기능 기획서 작성', time: '11:00', done: false },
    { id: '3', title: '사용자 인터뷰 결과 정리', time: '14:30', done: false },
];

const INITIAL_GOALS = [
    { id: '1', title: '올해 독서 24권 완독', progress: 65, icon: BookOpen, sub: '16/24권 진행 중' },
    { id: '2', title: '바디프로필 촬영', progress: 42, icon: Flame, sub: '식단 3주차 유지' },
];

const INITIAL_NOTES = [
    { id: '1', content: '차기 프로젝트 컨셉: 미니멀리즘', color: 'bg-amber-100' },
    { id: '2', content: '운동용 플레이리스트 공유하기', color: 'bg-blue-100' },
];

const INITIAL_TEAM_TASKS = [
    { id: '1', member: '김민준', avatar: 'K', task: 'UI 디자인 검토', done: true, color: 'bg-blue-500' },
    { id: '2', member: '이서연', avatar: 'L', task: 'API 연동 작업', done: false, color: 'bg-violet-500' },
    { id: '3', member: '박지우', avatar: 'P', task: 'QA 테스트 진행', done: false, color: 'bg-emerald-500' },
];

const INITIAL_HABITS = [
    { id: '1', name: '독서 30분', icon: '📚', streak: 12, done: true },
    { id: '2', name: '운동', icon: '🏃', streak: 7, done: true },
    { id: '3', name: '명상', icon: '🧘', streak: 0, done: false },
];

// ─── Helper ──────────────────────────────────────────────────────────────────
function generateSubText(title: string, progress: number): string {
    if (title.includes('독서')) return `${Math.round(24 * progress / 100)}/24권 진행 중`;
    if (title.includes('바디프로필')) return `식단 ${Math.round(progress / 10)}주차 유지`;
    if (title.includes('학점')) return `진행률 ${progress}%`;
    if (title.includes('영어')) return `${Math.round(30 * progress / 100)}일차 유지`;
    if (title.includes('연봉')) return `달성률 ${progress}%`;
    if (title.includes('운동 주')) return `이번주 ${Math.ceil(4 * progress / 100)}회 완료`;
    if (title.includes('수입')) return `현재 ${Math.round(600 * progress / 100)}만원`;
    if (title.includes('포트폴리오') || title.includes('작품')) return `${Math.round(10 * progress / 100)}/10 완료`;
    return `${progress}% 달성`;
}

export function InteractiveDemo() {
    const [activeTab, setActiveTab] = useState<DemoTabId>('schedule');
    const [activePersona, setActivePersona] = useState('office');
    const [frameMode, setFrameMode] = useState<'mobile' | 'tablet'>('mobile');
    const [currentTime, setCurrentTime] = useState('');
    const [demoNotification, setDemoNotification] = useState<string | null>(null);
    const boardRef = useRef<HTMLDivElement>(null);

    // Clock Effect
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // ─── Demo State ───────────────────────────────────────────────────────────
    const [tasks, setTasks] = useState(INITIAL_TASKS.map(t => ({ ...t })));
    const [newTask, setNewTask] = useState('');
    const [notes, setNotes] = useState(INITIAL_NOTES.map(n => ({ ...n })));
    const [demoGoals, setDemoGoals] = useState(INITIAL_GOALS.map(g => ({ ...g })));
    const [financeInput, setFinanceInput] = useState({ income: '500', expense: '280' });
    const [healthStats, setHealthStats] = useState({ calories: 0, water: 0, workouts: 0 });
    const [teamTasks, setTeamTasks] = useState(INITIAL_TEAM_TASKS.map(t => ({ ...t })));
    const [habitItems, setHabitItems] = useState(INITIAL_HABITS.map(h => ({ ...h })));

    // ─── Derived values ───────────────────────────────────────────────────────
    const doneCount = tasks.filter(t => t.done).length;
    const taskProgress = tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0;
    const teamDoneCount = teamTasks.filter(t => t.done).length;
    const teamAchievement = teamTasks.length > 0 ? Math.round((teamDoneCount / teamTasks.length) * 100) : 0;
    const BASE_CALORIES = 2450;
    const BASE_WATER = 1.2;
    const totalCalories = BASE_CALORIES + healthStats.calories;
    const totalWater = parseFloat((BASE_WATER + healthStats.water).toFixed(2));
    const waterGoal = 2.0;
    const waterPercent = Math.min(100, Math.round((totalWater / waterGoal) * 100));

    // ─── Actions ──────────────────────────────────────────────────────────────
    const handlePersonaChange = (id: string) => {
        setActivePersona(id);
        if (id === 'student') {
            setTasks([
                { id: '1', title: '알고리즘 과제 제출', time: '10:00', done: true },
                { id: '2', title: '토익 오답 정리', time: '13:00', done: false },
            ]);
            setDemoGoals([
                { id: '1', title: '이번 학기 학점 4.0 달성', progress: 80, icon: GraduationCap, sub: '중간고사 완료' },
                { id: '2', title: '매일 영어 단어 50개', progress: 30, icon: BookOpen, sub: '9일차 유지' },
            ]);
        } else if (id === 'office') {
            setTasks([
                { id: '1', title: '주간 보고서 완료', time: '09:30', done: true },
                { id: '2', title: '협력사 미팅', time: '15:00', done: false },
            ]);
            setDemoGoals([
                { id: '1', title: '연봉 15% 인상 목표', progress: 50, icon: Target, sub: '자기 평가 완료' },
                { id: '2', title: '운동 주 4회 달성', progress: 75, icon: Flame, sub: '이번주 3회 완료' },
            ]);
        } else if (id === 'freelancer') {
            setTasks([
                { id: '1', title: '클라이언트 미팅 자료 준비', time: '10:00', done: false },
                { id: '2', title: '포트폴리오 페이지 업데이트', time: '14:00', done: true },
                { id: '3', title: '월별 청구서 발송', time: '17:00', done: false },
            ]);
            setDemoGoals([
                { id: '1', title: '월 수입 600만원 달성', progress: 68, icon: DollarSign, sub: '현재 408만원' },
                { id: '2', title: '포트폴리오 작품 10개', progress: 50, icon: Briefcase, sub: '5/10 완료' },
            ]);
        }
    };

    const addTask = () => {
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: Date.now().toString(), title: newTask, time: '16:00', done: false }]);
        setNewTask('');
    };

    const addNote = () => {
        if (!newTask.trim()) return;
        setNotes([{ id: Date.now().toString(), content: newTask, color: 'bg-amber-100' }, ...notes]);
        setNewTask('');
    };

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const toggleTeamTask = (id: string) => {
        setTeamTasks(teamTasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const toggleHabit = (id: string) => {
        setHabitItems(habitItems.map(h => h.id === id ? { ...h, done: !h.done } : h));
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Persona Selection */}
            <div className="text-center mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">페르소나를 선택하세요</p>
                <div className="flex justify-center gap-3">
                    {PERSONAS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => handlePersonaChange(p.id)}
                            className={cn(
                                "flex flex-col items-center gap-2 p-4 rounded-3xl transition-all border-2 w-32",
                                activePersona === p.id
                                    ? "bg-blue-600 border-blue-600 text-white shadow-2xl scale-110"
                                    : "bg-card border-border text-muted-foreground hover:border-blue-500/30"
                            )}
                        >
                            <p.icon className="w-6 h-6" />
                            <span className="text-xs font-black">{p.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
                {DEMO_TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all border-2",
                            activeTab === tab.id
                                ? "bg-card border-blue-600/20 text-blue-600 shadow-xl shadow-blue-500/10"
                                : "bg-muted border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Control Bar */}
            <div className="flex justify-end gap-2 mb-2 px-4">
                <div className="bg-muted p-1 rounded-xl flex">
                    <button
                        onClick={() => setFrameMode('mobile')}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            frameMode === 'mobile' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                    </button>
                    <button
                        onClick={() => setFrameMode('tablet')}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            frameMode === 'tablet' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                    </button>
                </div>
            </div>

            {/* Interactive Panel */}
            <div className="bg-card rounded-[40px] border border-border p-5 md:p-8 shadow-[0_32px_80px_rgba(0,0,0,0.06)] flex flex-col md:flex-row gap-6 lg:gap-10 overflow-hidden relative">
                {/* Reset Button */}
                <button
                    onClick={() => {
                        setActivePersona('office');
                        setActiveTab('schedule');
                        setTasks(INITIAL_TASKS.map(t => ({ ...t })));
                        setNewTask('');
                        setDemoGoals(INITIAL_GOALS.map(g => ({ ...g })));
                        setFinanceInput({ income: '500', expense: '280' });
                        setHealthStats({ calories: 0, water: 0, workouts: 0 });
                        setNotes(INITIAL_NOTES.map(n => ({ ...n })));
                        setTeamTasks(INITIAL_TEAM_TASKS.map(t => ({ ...t })));
                        setHabitItems(INITIAL_HABITS.map(h => ({ ...h })));
                        toast('데모가 초기화되었습니다.');
                    }}
                    className="absolute top-6 right-6 text-xs font-bold text-muted-foreground hover:text-blue-500 transition-colors z-10"
                >
                    데모 초기화
                </button>

                {/* Left: Input Dashboard */}
                <div className="flex-1 space-y-8 relative">
                    <div className="md:hidden absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mb-4" />

                    <motion.div
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(e, { offset }) => {
                            const swipe = offset.x;
                            if (swipe < -50) {
                                const currentIndex = DEMO_TABS.findIndex(t => t.id === activeTab);
                                setActiveTab(DEMO_TABS[(currentIndex + 1) % DEMO_TABS.length].id);
                            } else if (swipe > 50) {
                                const currentIndex = DEMO_TABS.findIndex(t => t.id === activeTab);
                                setActiveTab(DEMO_TABS[(currentIndex - 1 + DEMO_TABS.length) % DEMO_TABS.length].id);
                            }
                        }}
                        className="h-full touch-pan-y"
                    >
                        <AnimatePresence mode="wait">
                            {/* ── Schedule Input ── */}
                            {activeTab === 'schedule' && (
                                <motion.div
                                    key="sc-input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-black text-slate-900 dark:text-white">실제처럼 기록해보세요</h4>
                                        <p className="text-sm text-slate-500 font-medium">데모 화면에 할 일을 추가하고 체크해보세요. (좌우로 스와이프하여 메뉴 전환)</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newTask}
                                            onChange={(e) => setNewTask(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addTask()}
                                            placeholder="할 일을 입력하세요 (예: 비타민 챙겨먹기)"
                                            className="flex-1 h-14 px-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all"
                                        />
                                        <Button onClick={addTask} size="icon" className="w-14 h-14 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                                            <Plus className="w-6 h-6" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── Goals Input ── */}
                            {activeTab === 'goals' && (
                                <motion.div key="gl-input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-black text-slate-900 dark:text-white">목표를 쪼개어 정복하세요</h4>
                                        <p className="text-sm text-slate-500 font-medium">슬라이더를 움직여 진행률 변화를 확인하세요.</p>
                                    </div>
                                    <div className="space-y-8 py-4">
                                        {demoGoals.map((goal, i) => (
                                            <div key={goal.id} className="space-y-3">
                                                <div className="flex justify-between items-end">
                                                    <div className="flex items-center gap-2">
                                                        <goal.icon className="w-4 h-4 text-emerald-500" />
                                                        <span className="text-sm font-black text-slate-700 dark:text-slate-300">{goal.title}</span>
                                                    </div>
                                                    <span className="text-lg font-black text-emerald-600">{goal.progress}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    value={goal.progress}
                                                    onChange={(e) => {
                                                        const newProgress = parseInt(e.target.value);
                                                        setDemoGoals(demoGoals.map((g, idx) =>
                                                            idx === i ? { ...g, progress: newProgress, sub: generateSubText(g.title, newProgress) } : g
                                                        ));
                                                    }}
                                                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                                                />
                                                <p className="text-xs text-slate-400 font-medium">{goal.sub}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* ── Finance Input ── */}
                            {activeTab === 'finance' && (
                                <motion.div key="fi-input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-black text-slate-900 dark:text-white">자산을 시뮬레이션 하세요</h4>
                                        <p className="text-sm text-slate-500 font-medium">수입과 지출을 입력해보세요.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">월 수입 (만)</label>
                                            <input
                                                type="number"
                                                value={financeInput.income}
                                                onChange={(e) => setFinanceInput({ ...financeInput, income: e.target.value })}
                                                className="w-full h-14 px-4 bg-blue-50 dark:bg-blue-900/20 border-none rounded-2xl text-lg font-black text-blue-600 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">월 지출 (만)</label>
                                            <input
                                                type="number"
                                                value={financeInput.expense}
                                                onChange={(e) => setFinanceInput({ ...financeInput, expense: e.target.value })}
                                                className="w-full h-14 px-4 bg-red-50 dark:bg-red-900/20 border-none rounded-2xl text-lg font-black text-red-600 outline-none"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── Health Input ── */}
                            {activeTab === 'health' && (
                                <motion.div key="he-input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-black text-slate-900 dark:text-white">건강 지표를 트래킹하세요</h4>
                                        <p className="text-sm text-slate-500 font-medium">버튼을 눌러 오늘의 운동과 수분 섭취를 기록하세요.</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setHealthStats(s => ({ ...s, calories: s.calories + 45, workouts: s.workouts + 1 }));
                                                toast('스쿼트 30회 완료! +45 kcal 🏋️');
                                            }}
                                            className="h-16 rounded-2xl border-slate-100 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-900/10 font-bold text-slate-600"
                                        >
                                            스쿼트 추가
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setHealthStats(s => ({ ...s, calories: s.calories + 55, workouts: s.workouts + 1 }));
                                                toast('러닝 5분 완료! +55 kcal 🏃');
                                            }}
                                            className="h-16 rounded-2xl border-slate-100 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-900/10 font-bold text-slate-600"
                                        >
                                            러닝 추가
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setHealthStats(s => ({ ...s, water: parseFloat((s.water + 0.25).toFixed(2)) }));
                                                toast('수분 250ml 섭취 기록! 💧');
                                            }}
                                            className="h-16 rounded-2xl border-slate-100 hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/10 font-bold text-slate-600"
                                        >
                                            수분섭취 추가
                                        </Button>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1">
                                        <p className="text-xs font-black text-slate-400">오늘 누적</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            운동 {healthStats.workouts}회 · 칼로리 +{healthStats.calories} kcal · 수분 +{healthStats.water.toFixed(2)}L
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── Team Input ── */}
                            {activeTab === 'team' && (
                                <motion.div key="tm-input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-black text-slate-900 dark:text-white">팀원의 작업 상태를 업데이트하세요</h4>
                                        <p className="text-sm text-slate-500 font-medium">카드를 클릭하여 완료 여부를 토글해보세요.</p>
                                    </div>
                                    <div className="space-y-3">
                                        {teamTasks.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => toggleTeamTask(t.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                                                    t.done
                                                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700"
                                                        : "bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                                                )}
                                            >
                                                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0", t.color)}>
                                                    {t.avatar}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-black text-slate-400">{t.member}</p>
                                                    <p className={cn("text-sm font-bold truncate", t.done ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200")}>{t.task}</p>
                                                </div>
                                                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors", t.done ? "bg-emerald-500 border-emerald-500" : "border-slate-300")}>
                                                    {t.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* ── Ideas Input ── */}
                            {activeTab === 'ideas' && (
                                <motion.div key="id-input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-black text-slate-900 dark:text-white">메모를 던져보세요</h4>
                                        <p className="text-sm text-slate-500 font-medium">떠오르는 아이디어를 즉시 고정하세요.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newTask}
                                            onChange={(e) => setNewTask(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addNote()}
                                            placeholder="새로운 아이디어..."
                                            className="flex-1 h-14 px-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-amber-500 transition-all"
                                        />
                                        <Button onClick={addNote} size="icon" className="w-14 h-14 rounded-2xl bg-amber-500 text-white hover:bg-amber-600">
                                            <Plus className="w-6 h-6" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Right: Preview Screen (Mobile Frame Style) */}
                <motion.div
                    layout
                    className={cn(
                        "bg-slate-50 dark:bg-black/50 rounded-[48px] border-[8px] border-slate-900 dark:border-slate-800 shadow-2xl relative overflow-hidden h-[440px] mx-auto md:mx-0 transition-all duration-500",
                        frameMode === 'mobile' ? "w-full md:w-[360px]" : "w-full md:w-[600px]"
                    )}
                >
                    {/* Fake Status Bar */}
                    <div className="h-12 w-full flex items-center justify-between px-6 pt-3 relative z-20">
                        <span className="text-[12px] font-bold text-slate-900 dark:text-white pointer-events-none select-none">{currentTime}</span>
                        <div className="flex gap-1.5 items-center">
                            <div className="flex gap-0.5 items-end h-3">
                                <div className="w-1 h-1.5 bg-slate-900 dark:bg-white rounded-[1px]" />
                                <div className="w-1 h-2 bg-slate-900 dark:bg-white rounded-[1px]" />
                                <div className="w-1 h-3 bg-slate-900 dark:bg-white rounded-[1px]" />
                            </div>
                            <div className="w-5 h-2.5 bg-slate-900 dark:bg-white rounded-[2px] opacity-20 border border-slate-900 dark:border-white" />
                        </div>
                    </div>

                    {/* Fake Notification Toast */}
                    <AnimatePresence>
                        {demoNotification && (
                            <motion.div
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -50, opacity: 0 }}
                                className="absolute top-14 left-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-3 rounded-xl shadow-lg z-30 flex items-center gap-3 border border-slate-100 dark:border-white/10"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                    <Bell className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">새로운 알림</p>
                                    <p className="text-[10px] text-slate-500">{demoNotification}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={cn("p-6 h-[calc(100%-3rem)] overflow-y-auto custom-scrollbar relative", frameMode === 'tablet' ? "grid grid-cols-2 gap-6 content-start" : "")}>
                        <AnimatePresence mode="wait">
                            {/* ── Schedule Preview ── */}
                            {activeTab === 'schedule' && (
                                <motion.div key="sc-preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("space-y-3", frameMode === 'tablet' && "col-span-2")}>
                                    <div className="space-y-1">
                                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">오늘의 일정</h5>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">순서를 변경해보세요</p>
                                    </div>

                                    <Reorder.Group axis="y" values={tasks} onReorder={setTasks} className={cn("space-y-2", frameMode === 'tablet' && "grid grid-cols-2 gap-4 space-y-0")}>
                                        {tasks.map((t) => (
                                            <Reorder.Item key={t.id} value={t}>
                                                <div
                                                    onClick={() => toggleTask(t.id)}
                                                    className={cn(
                                                        "p-3 rounded-2xl border transition-all cursor-grab active:cursor-grabbing flex items-center gap-3",
                                                        t.done ? "bg-white border-blue-100 shadow-sm" : "bg-slate-100/50 border-transparent hover:bg-white hover:shadow-md"
                                                    )}
                                                >
                                                    <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors", t.done ? "bg-blue-600 border-blue-600" : "border-slate-300")}>
                                                        {t.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <span className={cn("text-xs font-bold flex-1", t.done ? "text-slate-900 line-through opacity-50" : "text-slate-600")}>
                                                        {t.title}
                                                    </span>
                                                    <div className="text-[10px] font-bold text-slate-300">{t.time}</div>
                                                </div>
                                            </Reorder.Item>
                                        ))}
                                    </Reorder.Group>

                                    <div className="p-3 bg-blue-600 rounded-[20px] text-white shadow-lg shadow-blue-500/30">
                                        <p className="text-[10px] font-black uppercase opacity-60 mb-1">달성률</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-black">{Math.round(taskProgress)}%</span>
                                            <Sparkles className="w-4 h-4 opacity-60" />
                                        </div>
                                    </div>

                                    {/* Habit Streak Card */}
                                    <div className="p-3 bg-white dark:bg-slate-800/80 rounded-[20px] border border-slate-100 dark:border-white/10 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">🔥 오늘의 습관</p>
                                            <span className="text-[10px] font-bold text-slate-400">{habitItems.filter(h => h.done).length}/{habitItems.length} 완료</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            {habitItems.map(habit => (
                                                <button
                                                    key={habit.id}
                                                    onClick={() => toggleHabit(habit.id)}
                                                    className="w-full flex items-center gap-2 text-left"
                                                >
                                                    <span className="text-xs">{habit.icon}</span>
                                                    <span className={cn("text-[11px] font-bold flex-1", habit.done ? "text-slate-700 dark:text-slate-200" : "text-slate-400")}>{habit.name}</span>
                                                    {habit.done ? (
                                                        <span className="text-[10px] font-black text-amber-500 shrink-0">{habit.streak}일 연속 🔥</span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-slate-300 shrink-0">오늘 미완료 ○</span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── Goals Preview ── */}
                            {activeTab === 'goals' && (
                                <motion.div key="gl-preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("space-y-6", frameMode === 'tablet' && "col-span-2")}>
                                    <div className="space-y-1">
                                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">성장 지표</h5>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">차근차근 앞으로</p>
                                    </div>
                                    <div className={cn("space-y-6", frameMode === 'tablet' && "grid grid-cols-2 gap-6 space-y-0")}>
                                        {demoGoals.map(goal => (
                                            <div key={goal.id} className="space-y-2">
                                                <div className="flex justify-between text-xs font-black">
                                                    <span className="text-slate-500">{goal.title}</span>
                                                    <span className="text-emerald-600">{goal.progress}%</span>
                                                </div>
                                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-emerald-500"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${goal.progress}%` }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-medium">{goal.sub}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* ── Finance Preview ── */}
                            {activeTab === 'finance' && (
                                <motion.div key="fi-preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("space-y-4", frameMode === 'tablet' && "col-span-2")}>
                                    <div className="p-5 bg-slate-900 dark:bg-slate-800 rounded-[28px] text-white space-y-3">
                                        <p className="text-[10px] font-black uppercase opacity-50 tracking-widest">이번달 저축</p>
                                        <h3 className="text-2xl font-black tracking-tighter">
                                            ₩{(parseInt(financeInput.income || '0') - parseInt(financeInput.expense || '0')).toLocaleString()}만
                                        </h3>
                                        <div className="flex gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-bold opacity-50">수입</p>
                                                <p className="text-sm font-black text-blue-400">+{parseInt(financeInput.income || '0').toLocaleString()}만</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-bold opacity-50">지출</p>
                                                <p className="text-sm font-black text-red-400">-{parseInt(financeInput.expense || '0').toLocaleString()}만</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expense Category Breakdown */}
                                    <div className="p-4 bg-white dark:bg-slate-800/80 rounded-[20px] border border-slate-100 dark:border-white/10 space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">지출 카테고리</p>
                                        {[
                                            { label: '식비', pct: 38, color: 'bg-orange-400' },
                                            { label: '교통', pct: 18, color: 'bg-blue-400' },
                                            { label: '취미/여가', pct: 26, color: 'bg-violet-400' },
                                            { label: '기타', pct: 18, color: 'bg-slate-300' },
                                        ].map(cat => (
                                            <div key={cat.label} className="space-y-1">
                                                <div className="flex justify-between text-[10px] font-bold">
                                                    <span className="text-slate-600 dark:text-slate-300">{cat.label}</span>
                                                    <span className="text-slate-400">{cat.pct}%</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className={cn("h-full rounded-full", cat.color)}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${cat.pct}%` }}
                                                        transition={{ duration: 0.6 }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* ── Health Preview ── */}
                            {activeTab === 'health' && (
                                <motion.div key="he-preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("space-y-4", frameMode === 'tablet' && "col-span-2")}>
                                    <div className="space-y-1">
                                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">오늘의 건강</h5>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">건강이 자산입니다</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-3xl text-center">
                                            <div className="text-2xl font-black text-rose-500">{totalCalories.toLocaleString()}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">Calories</div>
                                        </div>
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-3xl text-center">
                                            <div className="text-2xl font-black text-blue-500">{totalWater.toFixed(1)}L</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">수분섭취</div>
                                        </div>
                                    </div>
                                    {/* Water Progress Bar */}
                                    <div className="p-4 bg-white dark:bg-slate-800/80 rounded-[20px] border border-slate-100 dark:border-white/10 space-y-2">
                                        <div className="flex justify-between text-[10px] font-bold">
                                            <span className="text-slate-500">💧 수분 목표 달성률</span>
                                            <span className="text-blue-500">{waterPercent}% / 2L</span>
                                        </div>
                                        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-blue-400 rounded-full"
                                                animate={{ width: `${waterPercent}%` }}
                                                transition={{ duration: 0.4 }}
                                            />
                                        </div>
                                        {healthStats.workouts > 0 && (
                                            <p className="text-[10px] font-bold text-slate-400">운동 {healthStats.workouts}회 완료 💪</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* ── Team Preview ── */}
                            {activeTab === 'team' && (
                                <motion.div key="tm-preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("space-y-4", frameMode === 'tablet' && "col-span-2")}>
                                    <div className="space-y-1">
                                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">팀 현황</h5>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">오늘의 팀 달성률</p>
                                    </div>
                                    <div className="p-4 bg-violet-600 rounded-[24px] text-white">
                                        <p className="text-[10px] font-black uppercase opacity-60 mb-1">팀 전체 달성률</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-3xl font-black">{teamAchievement}%</span>
                                            <div className="flex -space-x-2">
                                                {teamTasks.map(t => (
                                                    <div key={t.id} className={cn("w-8 h-8 rounded-full border-2 border-violet-600 flex items-center justify-center text-white font-black text-xs", t.color)}>
                                                        {t.avatar}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {teamTasks.map(t => (
                                            <div key={t.id} className={cn(
                                                "flex items-center gap-3 p-3 rounded-2xl transition-all",
                                                t.done ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-white/10"
                                            )}>
                                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0", t.color)}>
                                                    {t.avatar}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-black text-slate-400">{t.member}</p>
                                                    <p className={cn("text-xs font-bold truncate", t.done ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200")}>{t.task}</p>
                                                </div>
                                                <div className={cn("shrink-0 text-[10px] font-black", t.done ? "text-emerald-500" : "text-slate-300")}>
                                                    {t.done ? '완료' : '진행중'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* ── Ideas Preview ── */}
                            {activeTab === 'ideas' && (
                                <motion.div key="id-preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("space-y-4 h-full", frameMode === 'tablet' && "col-span-2")}>
                                    <div className="space-y-1 mb-2">
                                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">아이디어 보드</h5>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">자유롭게 움직여보세요</p>
                                    </div>
                                    <div
                                        ref={boardRef}
                                        className="relative h-[270px] bg-slate-100 dark:bg-white/5 rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-white/10"
                                    >
                                        {notes.map((note, i) => (
                                            <motion.div
                                                key={note.id}
                                                drag
                                                dragConstraints={boardRef}
                                                dragElastic={0.05}
                                                initial={{ opacity: 0, scale: 0.8, rotate: i % 2 === 0 ? -4 : 4 }}
                                                animate={{ opacity: 1, scale: 1, rotate: i % 2 === 0 ? -3 : 3 }}
                                                whileDrag={{ scale: 1.08, zIndex: 10, cursor: 'grabbing' }}
                                                className={cn("absolute p-4 rounded-xl shadow-md text-xs font-black text-slate-800 w-36 cursor-grab", note.color)}
                                                style={{
                                                    left: i % 2 === 0 ? '8%' : '52%',
                                                    top: `${10 + Math.floor(i / 2) * 130}px`,
                                                }}
                                            >
                                                {note.content}
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Bottom Nav Mockup */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/10">
                        {[1, 2, 3, 4].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white/20" />)}
                    </div>
                </motion.div>
            </div>

        </div>
    );
}

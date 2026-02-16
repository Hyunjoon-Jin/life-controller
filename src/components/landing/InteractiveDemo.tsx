'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Target, DollarSign, Activity,
    CheckCircle2, Clock, TrendingUp, TrendingDown,
    Plus, ChevronRight, Flame, BookOpen, Trash2, PieChart, Sparkles,
    User, Briefcase, GraduationCap, Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DEMO_TABS = [
    { id: 'schedule', label: '일정 관리', icon: Calendar, color: 'blue' },
    { id: 'goals', label: '목표 달성', icon: Target, color: 'green' },
    { id: 'finance', label: '자산 관리', icon: DollarSign, color: 'emerald' },
    { id: 'health', label: '건강 관리', icon: Activity, color: 'rose' },
    { id: 'ideas', label: '아이디어', icon: Lightbulb, color: 'amber' },
] as const;

type DemoTabId = typeof DEMO_TABS[number]['id'];

const PERSONAS = [
    { id: 'student', label: '학생', icon: GraduationCap, desc: '학습 및 시험 일정 관리' },
    { id: 'office', label: '직장인', icon: Briefcase, desc: '프로젝트 및 금융 관리' },
    { id: 'freelancer', label: '프리랜서', icon: User, desc: '루틴 및 자기계발 강화' },
];

export function InteractiveDemo() {
    const [activeTab, setActiveTab] = useState<DemoTabId>('schedule');
    const [activePersona, setActivePersona] = useState('office');

    // --- Demo State Management ---
    const [tasks, setTasks] = useState([
        { id: '1', title: '팀 스탠드업 미팅', time: '09:00', done: true },
        { id: '2', title: '신규 기능 기획서 작성', time: '11:00', done: false },
        { id: '3', title: '사용자 인터뷰 결과 정리', time: '14:30', done: false },
    ]);
    const [newTask, setNewTask] = useState('');

    const [notes, setNotes] = useState([
        { id: '1', content: '차기 프로젝트 컨셉: 미니멀리즘', color: 'bg-amber-100' },
        { id: '2', content: '운동용 플레이리스트 공유하기', color: 'bg-blue-100' },
    ]);

    const [demoGoals, setDemoGoals] = useState([
        { id: '1', title: '올해 독서 24권 완독', progress: 65, icon: BookOpen, sub: '16/24권 진행 중' },
        { id: '2', title: '바디프로필 촬영', progress: 42, icon: Flame, sub: '식단 3주차 유지' },
    ]);

    const [financeInput, setFinanceInput] = useState({ income: '500', expense: '280' });

    // --- Actions ---
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
                { id: '2', title: '운동 주 4회 달성', progress: 75, icon: Flame, sub: '목요일 성공' },
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

    const doneCount = tasks.filter(t => t.done).length;

    const taskProgress = (doneCount / tasks.length) * 100;

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Persona Selection (Item 18) */}
            <div className="text-center mb-12">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Select Your Persona</p>
                <div className="flex justify-center gap-3">
                    {PERSONAS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => handlePersonaChange(p.id)}
                            className={cn(
                                "flex flex-col items-center gap-2 p-4 rounded-3xl transition-all border-2 w-32",
                                activePersona === p.id
                                    ? "bg-blue-600 border-blue-600 text-white shadow-2xl scale-110"
                                    : "bg-white border-slate-100 text-slate-400 hover:border-blue-200"
                            )}
                        >
                            <p.icon className="w-6 h-6" />
                            <span className="text-xs font-black">{p.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
                {DEMO_TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all border-2",
                            activeTab === tab.id
                                ? "bg-white border-blue-600/20 text-blue-600 shadow-xl shadow-blue-500/10"
                                : "bg-slate-50 border-transparent text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Interactive Panel */}
            <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-white/5 p-8 md:p-12 shadow-[0_32px_80px_rgba(0,0,0,0.06)] min-h-[500px] flex flex-col md:flex-row gap-12">

                {/* Left: Input Dashboard */}
                <div className="flex-1 space-y-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'schedule' && (
                            <motion.div
                                key="sc-input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h4 className="text-2xl font-black text-slate-900 dark:text-white">실제처럼 기록해보세요</h4>
                                    <p className="text-sm text-slate-500 font-medium">데모 화면에 할 일을 추가하고 체크해보세요.</p>
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
                                                    const newGoals = [...demoGoals];
                                                    newGoals[i].progress = parseInt(e.target.value);
                                                    setDemoGoals(newGoals);
                                                }}
                                                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'finance' && (
                            <motion.div key="fi-input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-2xl font-black text-slate-900 dark:text-white">자산을 시뮬레이션 하세요</h4>
                                    <p className="text-sm text-slate-500 font-medium">수입과 지출을 입력해보세요.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Income (만)</label>
                                        <input
                                            type="number"
                                            value={financeInput.income}
                                            onChange={(e) => setFinanceInput({ ...financeInput, income: e.target.value })}
                                            className="w-full h-14 px-4 bg-blue-50 dark:bg-blue-900/20 border-none rounded-2xl text-lg font-black text-blue-600 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Expense (만)</label>
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

                        {activeTab === 'health' && (
                            <motion.div key="he-input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-2xl font-black text-slate-900 dark:text-white">건강 지표를 트래킹하세요</h4>
                                    <p className="text-sm text-slate-500 font-medium">어제보다 더 나은 당신을 기록하세요.</p>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {['스쿼트', '러닝', '수분섭취'].map((label) => (
                                        <Button key={label} variant="outline" className="h-16 rounded-2xl border-slate-100 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-900/10 font-bold text-slate-600">
                                            {label} 추가
                                        </Button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

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
                </div>

                {/* Right: Preview Screen (Mobile Frame Style) */}
                <div className="w-full md:w-[360px] bg-slate-50 dark:bg-black/50 rounded-[48px] border-[8px] border-slate-900 dark:border-slate-800 shadow-2xl relative overflow-hidden h-[540px]">
                    {/* Top Bar */}
                    <div className="h-10 w-full flex items-center justify-between px-8 pt-2">
                        <span className="text-[10px] font-bold">9:41</span>
                        <div className="flex gap-1.5">
                            <div className="w-4 h-2 bg-slate-900 dark:bg-white rounded-sm" />
                        </div>
                    </div>

                    <div className="p-6 h-full overflow-y-auto custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {activeTab === 'schedule' && (
                                <motion.div key="sc-preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                    <div className="space-y-1">
                                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Today's Schedule</h5>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">준비되셨나요?</p>
                                    </div>
                                    <div className="space-y-3">
                                        {tasks.map((t, i) => (
                                            <motion.div
                                                key={t.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                onClick={() => toggleTask(t.id)}
                                                className={cn(
                                                    "p-4 rounded-3xl border transition-all cursor-pointer flex items-center gap-3",
                                                    t.done ? "bg-white border-blue-100 shadow-sm" : "bg-slate-100/50 border-transparent"
                                                )}
                                            >
                                                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors", t.done ? "bg-blue-600 border-blue-600" : "border-slate-300")}>
                                                    {t.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                </div>
                                                <span className={cn("text-sm font-bold", t.done ? "text-slate-900 line-through opacity-50" : "text-slate-600")}>
                                                    {t.title}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="p-4 bg-blue-600 rounded-[28px] text-white shadow-xl shadow-blue-500/30">
                                        <p className="text-[10px] font-black uppercase opacity-60 mb-1">Completion Rate</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-black">{Math.round(taskProgress)}%</span>
                                            <Sparkles className="w-5 h-5 opacity-60" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'goals' && (
                                <motion.div key="gl-preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                                    <div className="space-y-1">
                                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Growth Progress</h5>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">Step by Step</p>
                                    </div>
                                    <div className="space-y-6">
                                        {demoGoals.map(goal => (
                                            <div key={goal.id} className="space-y-3">
                                                <div className="flex justify-between text-xs font-black">
                                                    <span className="text-slate-500">{goal.title}</span>
                                                    <span className="text-emerald-600">{goal.progress}%</span>
                                                </div>
                                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-emerald-500"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${goal.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'finance' && (
                                <motion.div key="fi-preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                                    <div className="p-6 bg-slate-900 dark:bg-slate-800 rounded-[32px] text-white space-y-4">
                                        <p className="text-[10px] font-black uppercase opacity-50 tracking-widest">Total Savings</p>
                                        <h3 className="text-3xl font-black tracking-tighter">
                                            ₩{(parseInt(financeInput.income || '0') - parseInt(financeInput.expense || '0')).toLocaleString()}만
                                        </h3>
                                        <div className="flex gap-4 pt-2">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-bold opacity-50">INCOME</p>
                                                <p className="text-sm font-black text-blue-400">+{parseInt(financeInput.income || '0').toLocaleString()}만</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-bold opacity-50">EXPENSE</p>
                                                <p className="text-sm font-black text-red-400">-{parseInt(financeInput.expense || '0').toLocaleString()}만</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                                                <PieChart className="w-5 h-5 text-orange-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 dark:text-white">리포트 생성</p>
                                                <p className="text-[10px] text-slate-400">이번 달 소비 패턴 분석</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300" />
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'ideas' && (
                                <motion.div key="id-preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                    <div className="space-y-1 mb-4">
                                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Idea Board</h5>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">빠른 메모</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {notes.map(note => (
                                            <motion.div
                                                key={note.id}
                                                layout
                                                drag
                                                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                                initial={{ opacity: 0, rotate: -5 }}
                                                animate={{ opacity: 1, rotate: Math.random() * 6 - 3 }}
                                                className={cn("p-4 rounded-2xl shadow-sm text-xs font-black text-slate-800", note.color)}
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
                </div>
            </div>

            {/* CTA under Demo */}
            <div className="text-center mt-12">
                <p className="text-slate-400 text-sm font-medium mb-4 italic">※ 위 데모는 가입 전 체험을 위해 제공되는 가상 데이터입니다.</p>
                <Button size="lg" className="h-16 px-10 text-lg rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-2xl transition-all hover:scale-105">
                    지금 무료로 시작하기 <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}

const ArrowRight = ({ className }: { className?: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

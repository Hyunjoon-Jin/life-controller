'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ArrowRight, Sparkles, Trophy, Settings, ListTodo, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '@/context/DataProvider';
import { cn } from '@/lib/utils';

export function SetupChecklist() {
    const { goals, tasks, homeShortcuts, userProfile } = useData();
    const [isVisible, setIsVisible] = useState(true);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem('onboarding_checklist_dismissed');
        if (dismissed) setIsDismissed(true);
    }, []);

    const missions = [
        {
            id: 'profile',
            label: '프로필 설정하기',
            icon: Settings,
            completed: !!userProfile?.name,
            desc: '이름을 등록하고 나만의 공간을 만드세요.'
        },
        {
            id: 'task',
            label: '첫 번째 할 일 등록',
            icon: ListTodo,
            completed: tasks.length > 0,
            desc: '오늘 꼭 해야 할 일을 기록해보세요.'
        },
        {
            id: 'goal',
            label: '목표 세우기',
            icon: Trophy,
            completed: goals.length > 0,
            desc: '이루고 싶은 장기적인 꿈을 등록하세요.'
        },
        {
            id: 'shortcuts',
            label: '홈 화면 꾸미기',
            icon: Sparkles,
            completed: homeShortcuts.length > 5,
            desc: '자주 쓰는 기능을 홈화면에 배치하세요.'
        },
        {
            id: 'guide',
            label: '가이드 살펴보기',
            icon: Info,
            completed: false, // Will be tracked via local state or just manual click
            desc: '상세 가이드를 통해 모든 기능을 마스터하세요.'
        }
    ];

    const completedCount = missions.filter(m => m.completed).length;
    const progress = (completedCount / missions.length) * 100;

    if (isDismissed || (completedCount === missions.length && !isVisible)) return null;

    const handleDismiss = () => {
        setIsDismissed(true);
        localStorage.setItem('onboarding_checklist_dismissed', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8"
                >
                    <Card className="overflow-hidden border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900/50 dark:to-slate-900 rounded-[32px] p-0">
                        <div className="p-6 md:p-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                                            Getting Started
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white">준비되셨나요?</h3>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">서비스 사용을 위한 5가지 필수 단계를 완료하세요.</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Total Progress</p>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{Math.round(progress)}%</p>
                                    </div>
                                    <div className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-white/5 relative flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="32" cy="32" r="28"
                                                fill="transparent"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                className="text-indigo-500"
                                                strokeDasharray={175.9}
                                                strokeDashoffset={175.9 * (1 - progress / 100)}
                                            />
                                        </svg>
                                        <Sparkles className="absolute w-4 h-4 text-indigo-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                {missions.map((m) => (
                                    <div
                                        key={m.id}
                                        className={cn(
                                            "p-4 rounded-2xl border transition-all flex flex-col gap-3 group relative overflow-hidden",
                                            m.completed
                                                ? "bg-white dark:bg-slate-800 border-emerald-100 dark:border-emerald-900/30 shadow-sm"
                                                : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-900/30"
                                        )}
                                    >
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                                                m.completed ? "bg-emerald-500 text-white" : "bg-white dark:bg-black text-slate-400"
                                            )}>
                                                <m.icon className="w-5 h-5" />
                                            </div>
                                            {m.completed && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                        </div>
                                        <div className="relative z-10">
                                            <h4 className={cn("text-sm font-bold", m.completed ? "text-slate-900 dark:text-white" : "text-slate-500")}>
                                                {m.label}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 font-medium mt-1 leading-tight">{m.desc}</p>
                                        </div>
                                        {m.completed && (
                                            <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-full -mr-6 -mt-6" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                <p className="text-xs text-slate-400 font-medium italic">이 체크리스트는 모든 단계를 완료하면 사라집니다.</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDismiss}
                                    className="text-slate-400 hover:text-slate-600 font-bold text-xs"
                                >
                                    다시는 보지 않기
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

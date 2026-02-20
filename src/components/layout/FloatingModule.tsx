'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Clock,
    Flame,
    StickyNote,
    HelpCircle,
    X,
    LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Pomodoro } from '@/components/tools/Pomodoro';
import { HabitTracker } from '@/components/habits/HabitTracker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useData } from '@/context/DataProvider';

export function FloatingModule({ onOpenGuide }: { onOpenGuide?: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeModal, setActiveModal] = useState<'pomodoro' | 'habits' | 'memo' | null>(null);
    const { globalMemo, setGlobalMemo } = useData();

    const menuItems = [
        {
            id: 'guide',
            icon: HelpCircle,
            label: '사용법',
            color: 'bg-blue-500',
            onClick: () => {
                onOpenGuide?.();
                setIsOpen(false);
            }
        },
        {
            id: 'memo',
            icon: StickyNote,
            label: '메모',
            color: 'bg-amber-500',
            onClick: () => setActiveModal('memo')
        },
        {
            id: 'pomodoro',
            icon: Clock,
            label: '포모도로',
            color: 'bg-red-500',
            onClick: () => setActiveModal('pomodoro')
        },
        {
            id: 'habits',
            icon: Flame,
            label: '습관 관리',
            color: 'bg-orange-500',
            onClick: () => setActiveModal('habits')
        },
    ];

    return (
        <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50 flex flex-col items-end gap-3">
            {/* Sub Buttons */}
            <AnimatePresence>
                {isOpen && (
                    <div className="flex flex-col-reverse items-end gap-3 mb-2">
                        {menuItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-3"
                            >
                                <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded-md shadow-sm border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                    {item.label}
                                </span>
                                <Button
                                    size="icon"
                                    onClick={() => {
                                        item.onClick();
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-12 h-12 rounded-full shadow-lg text-white hover:scale-110 transition-transform",
                                        item.color
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Main Toggle Button */}
            <Button
                size="lg"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-14 h-14 rounded-full shadow-2xl transition-all duration-300 transform",
                    isOpen
                        ? "bg-slate-800 dark:bg-slate-700 rotate-45 scale-90"
                        : "bg-indigo-600 hover:bg-indigo-700 hover:scale-105"
                )}
            >
                {isOpen ? <Plus className="w-7 h-7" /> : (
                    <div className="flex flex-col items-center gap-0.5">
                        <LayoutGrid className="w-5 h-5" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">부가기능</span>
                    </div>
                )}
            </Button>

            {/* Modals */}
            <Dialog open={!!activeModal} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className={cn(
                    "p-0 overflow-hidden",
                    activeModal === 'memo' ? "sm:max-w-md" : "sm:max-w-lg"
                )}>
                    {activeModal === 'pomodoro' && (
                        <div className="p-2">
                            <Pomodoro />
                        </div>
                    )}
                    {activeModal === 'habits' && (
                        <div className="max-h-[80vh] overflow-y-auto p-2">
                            <HabitTracker />
                        </div>
                    )}
                    {activeModal === 'memo' && (
                        <div className="p-6 space-y-4">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <StickyNote className="w-5 h-5 text-amber-500" />
                                    글로벌 메모
                                </DialogTitle>
                            </DialogHeader>
                            <textarea
                                className="w-full h-64 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none font-medium text-slate-700 dark:text-slate-200"
                                placeholder="생각나는 것들을 자유롭게 적어보세요..."
                                value={globalMemo}
                                onChange={(e) => setGlobalMemo(e.target.value)}
                            />
                            <p className="text-[10px] text-slate-400 text-center">
                                * 이 메모는 모든 페이지에서 공유되며 자동으로 저장됩니다.
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

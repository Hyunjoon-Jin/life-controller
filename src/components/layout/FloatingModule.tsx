'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Clock,
    Flame,
    StickyNote,
    X,
    LayoutGrid,
    Zap,
    Target as TargetIcon
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
            id: 'memo',
            icon: StickyNote,
            label: '퀵 메모',
            color: 'from-amber-400 to-orange-500',
            onClick: () => setActiveModal('memo')
        },
        {
            id: 'pomodoro',
            icon: Clock,
            label: '포모도로',
            color: 'from-rose-500 to-red-600',
            onClick: () => setActiveModal('pomodoro')
        },
        {
            id: 'habits',
            icon: Flame,
            label: '습관 루틴',
            color: 'from-emerald-400 to-teal-500',
            onClick: () => setActiveModal('habits')
        },
    ];

    return (
        <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50 flex flex-col items-end gap-4">
            {/* Sub Buttons (Stacked above) */}
            <AnimatePresence>
                {isOpen && (
                    <div className="flex flex-col-reverse items-end gap-3 mb-2">
                        {menuItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30,
                                    delay: index * 0.05
                                }}
                                className="flex items-center gap-3 group/item"
                            >
                                <motion.span
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="glass-premium px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-black text-white/70 uppercase tracking-widest shadow-xl pointer-events-none group-hover/item:text-white transition-colors"
                                >
                                    {item.label}
                                </motion.span>
                                <Button
                                    size="icon"
                                    onClick={() => {
                                        item.onClick();
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-12 h-12 rounded-2xl shadow-[0_10px_20px_-5px_rgba(0,0,0,0.4)] text-white hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20",
                                        "bg-gradient-to-br",
                                        item.color
                                    )}
                                >
                                    <item.icon className="w-5 h-5" strokeWidth={2.5} />
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
                    "h-14 rounded-[22px] shadow-[0_20px_40px_-5px_rgba(0,0,0,0.5)] transition-all duration-500 group relative overflow-hidden border-2",
                    isOpen
                        ? "w-14 bg-white/10 border-white/20 backdrop-blur-xl"
                        : "w-[120px] bg-indigo-600 hover:bg-indigo-700 border-indigo-500/50 hover:shadow-[0_0_30px_rgba(79,70,229,0.4)]"
                )}
            >
                {/* Kinetic Background Glow */}
                {!isOpen && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                )}

                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X className="w-6 h-6 text-white" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.2, opacity: 0 }}
                            className="flex items-center gap-2"
                        >
                            <Zap className="w-5 h-5 text-white animate-pulse" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-white">부가기능</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Button>

            {/* Modals */}
            <Dialog open={!!activeModal} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className={cn(
                    "p-0 overflow-hidden glass-premium border-white/10 shadow-2xl rounded-[32px] max-h-[90vh]",
                    activeModal === 'memo' ? "sm:max-w-md" : "sm:max-w-2xl"
                )}>
                    {activeModal === 'pomodoro' && (
                        <div className="p-4 bg-slate-950/20">
                            <Pomodoro />
                        </div>
                    )}
                    {activeModal === 'habits' && (
                        <div className="overflow-y-auto p-4 custom-scrollbar">
                            <HabitTracker />
                        </div>
                    )}
                    {activeModal === 'memo' && (
                        <div className="p-8 space-y-6">
                            <DialogHeader>
                                <DialogTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                            <StickyNote className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white/90 uppercase tracking-tight">전송실 (Quick Sync)</h3>
                                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] mt-0.5">Global Neural Memo</p>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black text-emerald-500 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">AUTO-SYNC ACTIVE</div>
                                </DialogTitle>
                            </DialogHeader>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-amber-500/5 blur-2xl rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                <textarea
                                    className="relative w-full h-[400px] bg-white/[0.03] border border-white/10 rounded-[24px] p-6 text-[15px] font-medium leading-relaxed text-white/80 focus:outline-none focus:border-amber-500/40 focus:ring-4 focus:ring-amber-500/5 transition-all resize-none shadow-inner custom-scrollbar placeholder:text-white/10"
                                    placeholder="전역적으로 공유될 데이터를 입력하세요..."
                                    value={globalMemo}
                                    onChange={(e) => setGlobalMemo(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center justify-center gap-2 py-2">
                                <div className="w-1 h-1 rounded-full bg-amber-500 animate-ping" />
                                <p className="text-[10px] text-white/20 font-black tracking-widest uppercase">
                                    Secured Neural Link Optimized for Productivity
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

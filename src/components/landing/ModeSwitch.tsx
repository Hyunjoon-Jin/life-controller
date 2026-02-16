'use client';

import { motion } from 'framer-motion';
import { Sparkles, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModeSwitchProps {
    mode: 'life' | 'work';
    setMode: (mode: 'life' | 'work') => void;
}

export function ModeSwitch({ mode, setMode }: ModeSwitchProps) {
    return (
        <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full gap-1 border border-slate-200 dark:border-slate-700 shadow-inner">
            <button
                onClick={() => setMode('life')}
                className={cn(
                    "relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-black transition-all",
                    mode === 'life' ? "text-white" : "text-slate-400 hover:text-slate-600"
                )}
            >
                {mode === 'life' && (
                    <motion.div
                        layoutId="activeLandingMode"
                        className="absolute inset-0 bg-blue-600 rounded-full shadow-lg"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                )}
                <Sparkles className={cn("w-4 h-4 relative z-10", mode === 'life' ? "text-white" : "text-slate-400")} />
                <span className="relative z-10">일상 모드</span>
            </button>

            <button
                onClick={() => setMode('work')}
                className={cn(
                    "relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-black transition-all",
                    mode === 'work' ? "text-white" : "text-slate-400 hover:text-slate-600"
                )}
            >
                {mode === 'work' && (
                    <motion.div
                        layoutId="activeLandingMode"
                        className="absolute inset-0 bg-purple-600 rounded-full shadow-lg"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                )}
                <Briefcase className={cn("w-4 h-4 relative z-10", mode === 'work' ? "text-white" : "text-slate-400")} />
                <span className="relative z-10">업무 모드</span>
            </button>
        </div>
    );
}

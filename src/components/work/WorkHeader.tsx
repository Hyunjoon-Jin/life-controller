"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    Target,
    Maximize2,
    Minimize2,
    MoreHorizontal,
    Play,
    Pause,
    RotateCcw,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface WorkHeaderProps {
    isFocusMode: boolean;
    onToggleFocusMode: () => void;
}

export function WorkHeader({ isFocusMode, onToggleFocusMode }: WorkHeaderProps) {
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [timerState, setTimerState] = useState<'idle' | 'running' | 'paused'>('idle');
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [objective, setObjective] = useState('');

    useEffect(() => {
        setCurrentTime(new Date());
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timerState === 'running') {
            interval = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerState]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? `${h}:` : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleTimerToggle = () => {
        if (timerState === 'running') setTimerState('paused');
        else setTimerState('running');
    };

    const handleTimerReset = () => {
        setTimerState('idle');
        setElapsedSeconds(0);
    };

    return (
        <motion.div
            layout
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-500",
                isFocusMode
                    ? "bg-[#1a1b1e]/90 text-white border-b border-white/10 backdrop-blur-md py-4 px-6 mb-6 rounded-b-3xl shadow-2xl"
                    : "bg-white/80 border-b border-gray-200 backdrop-blur-sm py-3 px-4 mb-4"
            )}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                {/* Left: Clock & Timer */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Clock className={cn("w-5 h-5", isFocusMode ? "text-blue-400" : "text-slate-500")} />
                        <span className={cn("text-xl font-mono font-bold tracking-widest", isFocusMode ? "text-white" : "text-slate-700")}>
                            {currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </span>
                    </div>

                    <div className={cn("h-8 w-px", isFocusMode ? "bg-white/20" : "bg-gray-200")} />

                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "px-3 py-1 rounded-lg font-mono text-sm font-semibold min-w-[80px] text-center transition-colors",
                            timerState === 'running'
                                ? "bg-red-500/20 text-red-500 border border-red-500/30"
                                : isFocusMode ? "bg-white/10 text-gray-300" : "bg-gray-100 text-slate-600"
                        )}>
                            {formatTime(elapsedSeconds)}
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn("h-8 w-8", isFocusMode ? "hover:bg-white/10 text-gray-300" : "hover:bg-gray-100 text-slate-500")}
                                onClick={handleTimerToggle}
                            >
                                {timerState === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </Button>
                            {timerState !== 'idle' && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-8 w-8", isFocusMode ? "hover:bg-white/10 text-gray-300" : "hover:bg-gray-100 text-slate-500")}
                                    onClick={handleTimerReset}
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Center: Objective (Visible mainly in focus mode or large screens) */}
                <div className="flex-1 max-w-xl mx-auto hidden md:flex items-center justify-center">
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full transition-all w-full max-w-md",
                        isFocusMode
                            ? "bg-white/5 border border-white/10 focus-within:bg-white/10 focus-within:border-white/20 shadow-inner"
                            : "bg-gray-50 border border-gray-200 focus-within:bg-white focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100"
                    )}>
                        <Target className={cn("w-4 h-4", isFocusMode ? "text-blue-400" : "text-slate-400")} />
                        <input
                            type="text"
                            value={objective}
                            onChange={(e) => setObjective(e.target.value)}
                            placeholder="지금 집중할 목표는 무엇인가요?"
                            className={cn(
                                "bg-transparent border-none outline-none text-sm w-full placeholder:text-opacity-50",
                                isFocusMode ? "text-white placeholder:text-gray-400" : "text-slate-700 placeholder:text-slate-400"
                            )}
                        />
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleFocusMode}
                        className={cn(
                            "gap-2 transition-all",
                            isFocusMode
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 border-transparent"
                                : "text-slate-500 hover:text-slate-900"
                        )}
                    >
                        {isFocusMode ? (
                            <>
                                <Minimize2 className="w-4 h-4" />
                                <span className="hidden sm:inline">집중 모드 종료</span>
                            </>
                        ) : (
                            <>
                                <Maximize2 className="w-4 h-4" />
                                <span className="hidden sm:inline">집중 모드</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}

"use client";

import { useData } from '@/context/DataProvider';
import { Button } from '@/components/ui/button';
import { FocusSounds } from '@/components/project/FocusSounds';
import { X, CheckCircle2, Play, Pause, Maximize2, Minimize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ZenModeProps {
    onExit: () => void;
}

export function ZenMode({ onExit }: ZenModeProps) {
    const { activeTaskId, taskTimer, toggleTaskTimer, tasks, updateTask } = useData();
    const currentTask = activeTaskId ? tasks.find(t => t.id === activeTaskId) : null;
    const [quote, setQuote] = useState("");

    // Random motivational quotes
    const quotes = [
        "The only way to do great work is to love what you do.",
        "Focus on being productive instead of busy.",
        "Simplicity is the ultimate sophistication.",
        "One thing at a time.",
        "Deep work is valuable, rare, and meaningful."
    ];

    useEffect(() => {
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleComplete = () => {
        if (activeTaskId && currentTask) {
            toggleTaskTimer(activeTaskId); // Stop timer
            updateTask({ ...currentTask, completed: true });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full w-full text-center space-y-12 relative"
        >
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#0f172a] to-slate-900 pointer-events-none -z-10" />

            {/* Exit Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onExit}
                className="absolute top-8 right-8 text-slate-500 hover:text-white hover:bg-white/10"
            >
                <Minimize2 className="w-6 h-6" />
            </Button>

            {/* Main Content */}
            <div className="space-y-6 max-w-2xl w-full px-6">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 0.6, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg text-indigo-300 font-medium tracking-wide"
                >
                    {quote}
                </motion.p>

                {currentTask ? (
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="space-y-8"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            {currentTask.title}
                        </h1>

                        <div className="text-[120px] md:text-[180px] font-mono font-bold text-white/90 tracking-tighter leading-none select-none tabular-nums">
                            {formatTime(taskTimer)}
                        </div>

                        <div className="flex items-center justify-center gap-6">
                            <Button
                                size="lg"
                                className="h-16 w-16 rounded-full bg-white text-slate-900 hover:bg-indigo-50 hover:scale-105 transition-all text-xl"
                                onClick={() => toggleTaskTimer(activeTaskId!)}
                            >
                                {activeTaskId ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="h-16 w-16 rounded-full border-2 border-white/20 text-white hover:bg-green-500/20 hover:border-green-500 hover:text-green-500 transition-all"
                                onClick={handleComplete}
                                title="Complete Task"
                            >
                                <CheckCircle2 className="w-8 h-8" />
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="text-slate-400">
                        <p className="text-2xl mb-4">No active task focused.</p>
                        <p className="opacity-60">Select a task from the dashboard start focusing.</p>
                        <Button variant="outline" onClick={onExit} className="mt-6 border-white/20 text-white hover:bg-white/10">
                            Select Task
                        </Button>
                    </div>
                )}
            </div>

            {/* Footer Sounds */}
            <div className="absolute bottom-12 w-full max-w-md px-6">
                <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                    <FocusSounds />
                </div>
            </div>
        </motion.div>
    );
}

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
    CheckCircle2,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface WorkHeaderProps {
    isFocusMode: boolean;
    onToggleFocusMode: () => void;
    onOpenMeetingMode?: () => void; // Optional for now to avoid breaking other usages if any
}

import { useData } from '@/context/DataProvider';

export function WorkHeader({ isFocusMode, onToggleFocusMode, onOpenMeetingMode }: WorkHeaderProps) {
    const { activeTaskId, taskTimer, toggleTaskTimer, tasks } = useData();
    const currentTask = activeTaskId ? tasks.find(t => t.id === activeTaskId) : null;

    // ... existing helpers

    return (
        <motion.div
        // ... props
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                {/* Left: Active Task Timer */}
                <div className="flex-1 flex items-center gap-4">
                    {/* Existing Time/Date or Logo could go here, but fitting in.. */}
                    {activeTaskId && currentTask && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 text-red-600 px-3 py-1.5 rounded-full flex items-center gap-3 shadow-sm border border-red-100"
                        >
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <span className="font-medium text-sm max-w-[150px] truncate">
                                {currentTask.title}
                            </span>
                            <span className="font-mono font-bold w-[60px]">
                                {Math.floor(taskTimer / 60).toString().padStart(2, '0')}:
                                {(taskTimer % 60).toString().padStart(2, '0')}
                            </span>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 hover:bg-red-200 rounded-full"
                                onClick={() => toggleTaskTimer(activeTaskId)}
                            >
                                <Pause className="w-3 h-3 fill-current" />
                            </Button>
                        </motion.div>
                    )}
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-2">
                    {onOpenMeetingMode && !isFocusMode && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onOpenMeetingMode}
                            className="text-slate-500 hover:text-slate-900 border border-transparent hover:bg-gray-100"
                        >
                            <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                            <span className="hidden sm:inline">미팅 모드</span>
                        </Button>
                    )}

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

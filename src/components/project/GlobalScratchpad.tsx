"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataProvider';

interface GlobalScratchpadProps {
    triggerVisible?: boolean;
}

export function GlobalScratchpad({ triggerVisible = true }: GlobalScratchpadProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { globalMemo: note, setGlobalMemo: setNote } = useData();
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.code === 'KeyQ') {
                setIsOpen(prev => !prev);
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!isOpen) {
        if (!triggerVisible) return null; // Hidden trigger mode (for Zen Mode)
        return (
            <Button
                variant="outline"
                size="icon"
                className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50 bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-500"
                onClick={() => setIsOpen(true)}
                title="글로벌 메모장"
            >
                <StickyNote className="w-6 h-6" />
            </Button>
        );
    }

    if (isMinimized) {
        return (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-yellow-100 border border-yellow-300 rounded-full p-1 pl-3 shadow-lg animate-in fade-in slide-in-from-bottom-2">
                <span className="text-xs font-bold text-yellow-800 cursor-pointer" onClick={() => setIsMinimized(false)}>메모장</span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-yellow-200 text-yellow-800"
                    onClick={() => setIsMinimized(false)}
                >
                    <StickyNote className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-500"
                    onClick={() => setIsOpen(false)}
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-yellow-50 dark:bg-zinc-800 border-2 border-yellow-400 rounded-xl shadow-2xl z-50 flex flex-col animate-in fade-in slide-in-from-bottom-4 zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-yellow-200 dark:border-zinc-700 bg-yellow-100 dark:bg-zinc-900/50 rounded-t-lg handle cursor-move">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-500 font-bold">
                    <StickyNote className="w-4 h-4" />
                    <span className="text-sm">Quick Memo</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-yellow-700 dark:text-yellow-500 hover:bg-yellow-200 dark:hover:bg-zinc-700"
                        onClick={() => setNote('')}
                        title="지우기"
                    >
                        <RefreshCw className="w-3 h-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-yellow-700 dark:text-yellow-500 hover:bg-yellow-200 dark:hover:bg-zinc-700"
                        onClick={() => setIsMinimized(true)}
                    >
                        <span className="mb-2">_</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-yellow-700 dark:text-yellow-500 hover:bg-yellow-200 dark:hover:bg-zinc-700 hover:text-red-500"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-0">
                <Textarea
                    className="w-full h-full resize-none border-0 focus-visible:ring-0 bg-transparent p-4 text-base leading-relaxed placeholder:text-yellow-800/30 dark:placeholder:text-yellow-500/30"
                    placeholder="여기에 빠른 메모를 남기세요..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    autoFocus
                />
            </div>

            <div className="p-2 text-[10px] text-yellow-600 dark:text-yellow-500/50 text-right bg-yellow-100/50 dark:bg-zinc-900/30 rounded-b-lg">
                Autosaved
            </div>
        </div>
    );
}

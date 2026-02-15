'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Clock, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export function Pomodoro() {
    // Basic States
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<TimerMode>('focus');

    // Custom Durations (in minutes)
    const [focusDuration, setFocusDuration] = useState(25);
    const [shortBreakDuration, setShortBreakDuration] = useState(5);
    const [longBreakDuration, setLongBreakDuration] = useState(15);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Audio ref (using a simple bell sound url if available, or just visual)
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsActive(false);
            // Play sound here if we had one
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        if (mode === 'focus') setTimeLeft(focusDuration * 60);
        if (mode === 'shortBreak') setTimeLeft(shortBreakDuration * 60);
        if (mode === 'longBreak') setTimeLeft(longBreakDuration * 60);
    };

    const changeMode = (newMode: TimerMode) => {
        setMode(newMode);
        setIsActive(false);
        if (newMode === 'focus') setTimeLeft(focusDuration * 60);
        if (newMode === 'shortBreak') setTimeLeft(shortBreakDuration * 60);
        if (newMode === 'longBreak') setTimeLeft(longBreakDuration * 60);
    };

    const handleSaveSettings = () => {
        setIsSettingsOpen(false);
        resetTimer(); // Apply new settings immediately by resetting
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress based on current total duration
    const currentTotalDuration = mode === 'focus' ? focusDuration * 60
        : mode === 'shortBreak' ? shortBreakDuration * 60
            : longBreakDuration * 60;

    const progress = (timeLeft / currentTotalDuration) * 100;

    return (
        <div className="bg-card text-card-foreground rounded-3xl border border-transparent p-6 flex flex-col items-center shadow-sm relative overflow-hidden">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
                <Clock className="w-4 h-4 text-primary" />
                포모도로 타이머
            </h2>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6 bg-muted p-1 rounded-2xl w-full">
                {(['focus', 'shortBreak', 'longBreak'] as const).map(m => (
                    <button
                        key={m}
                        onClick={() => changeMode(m)}
                        className={cn(
                            "flex-1 py-1.5 text-xs font-medium rounded-xl transition-all",
                            mode === m
                                ? m === 'focus' ? "bg-white text-primary shadow-sm"
                                    : m === 'shortBreak' ? "bg-white text-green-600 shadow-sm"
                                        : "bg-white text-blue-600 shadow-sm"
                                : "text-muted-foreground hover:bg-white/50"
                        )}
                    >
                        {m === 'focus' ? '집중' : m === 'shortBreak' ? '짧은 휴식' : '긴 휴식'}
                    </button>
                ))}
            </div>

            {/* Settings Dialog */}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                    <button className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                        <Settings className="w-4 h-4" />
                    </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>타이머 시간 설정 (분)</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="focus" className="text-right">
                                집중
                            </Label>
                            <Input
                                id="focus"
                                type="number"
                                value={focusDuration}
                                onChange={(e) => setFocusDuration(Number(e.target.value))}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="shortBreak" className="text-right">
                                짧은 휴식
                            </Label>
                            <Input
                                id="shortBreak"
                                type="number"
                                value={shortBreakDuration}
                                onChange={(e) => setShortBreakDuration(Number(e.target.value))}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="longBreak" className="text-right">
                                긴 휴식
                            </Label>
                            <Input
                                id="longBreak"
                                type="number"
                                value={longBreakDuration}
                                onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveSettings}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Timer Display */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                {/* Progress Ring Background */}
                <svg className="absolute w-full h-full -rotate-90">
                    <circle
                        className="text-muted"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        r="70"
                        cx="80"
                        cy="80"
                    />
                    <circle
                        className={cn(
                            "text-primary transition-all duration-1000 ease-linear",
                            mode === 'focus' ? "text-primary" : mode === 'shortBreak' ? "text-green-500" : "text-blue-500"
                        )}
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        r="70"
                        cx="80"
                        cy="80"
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * progress) / 100}
                        strokeLinecap="round"
                    />
                </svg>
                {/* Actual Timer Text */}
                <div className="text-4xl font-bold font-mono tracking-wider tabular-nums text-foreground z-10">
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleTimer}
                    className="rounded-full w-12 h-12 border-border hover:bg-muted text-primary"
                >
                    {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={resetTimer}
                    className="rounded-full w-12 h-12 border-border hover:bg-muted text-muted-foreground"
                >
                    <RotateCcw className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}

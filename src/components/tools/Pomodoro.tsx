'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Clock, Settings, Flame, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

// Web Audio API beep — no external files needed
function playCompletionBeep() {
    try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 830;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);
        // Second beep
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1050;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.3);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.1);
        osc2.start(ctx.currentTime + 0.3);
        osc2.stop(ctx.currentTime + 1.1);
    } catch {
        // Silently fail if WebAudio is not supported
    }
}

function sendNotification(title: string, body: string) {
    if (typeof window === 'undefined') return;
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' });
    }
}

export function Pomodoro() {
    // Basic States
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<TimerMode>('focus');

    // Session tracking
    const [completedSessions, setCompletedSessions] = useState(0);
    const [autoSwitch, setAutoSwitch] = useState(true);

    // Custom Durations (in minutes)
    const [focusDuration, setFocusDuration] = useState(25);
    const [shortBreakDuration, setShortBreakDuration] = useState(5);
    const [longBreakDuration, setLongBreakDuration] = useState(15);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const getDuration = useCallback((m: TimerMode) => {
        if (m === 'focus') return focusDuration * 60;
        if (m === 'shortBreak') return shortBreakDuration * 60;
        return longBreakDuration * 60;
    }, [focusDuration, shortBreakDuration, longBreakDuration]);

    const handleTimerComplete = useCallback(() => {
        setIsActive(false);
        playCompletionBeep();

        if (mode === 'focus') {
            const newCount = completedSessions + 1;
            setCompletedSessions(newCount);
            const msg = `집중 세션 완료! (${newCount}회)`;
            toast.success(msg);
            sendNotification('🍅 포모도로 완료', msg);

            if (autoSwitch) {
                // Every 4 sessions → long break, else short break
                const nextMode: TimerMode = newCount % 4 === 0 ? 'longBreak' : 'shortBreak';
                setMode(nextMode);
                setTimeLeft(getDuration(nextMode));
                setTimeout(() => setIsActive(true), 1500);
            }
        } else {
            const msg = mode === 'shortBreak' ? '짧은 휴식 끝! 다시 집중하세요.' : '긴 휴식 끝! 새로운 세트를 시작하세요.';
            toast.info(msg);
            sendNotification('⏰ 휴식 종료', msg);

            if (autoSwitch) {
                setMode('focus');
                setTimeLeft(getDuration('focus'));
                setTimeout(() => setIsActive(true), 1500);
            }
        }
    }, [mode, completedSessions, autoSwitch, getDuration]);

    // Request notification permission on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Timer tick
    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            handleTimerComplete();
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, timeLeft, handleTimerComplete]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(getDuration(mode));
    };

    const changeMode = (newMode: TimerMode) => {
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(getDuration(newMode));
    };

    const skipToNext = () => {
        if (mode === 'focus') {
            const nextMode: TimerMode = (completedSessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
            changeMode(nextMode);
        } else {
            changeMode('focus');
        }
    };

    const handleSaveSettings = () => {
        setIsSettingsOpen(false);
        resetTimer();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const currentTotalDuration = getDuration(mode);
    const progress = (timeLeft / currentTotalDuration) * 100;

    return (
        <div className="bg-card text-card-foreground rounded-3xl border border-transparent p-6 flex flex-col items-center shadow-sm relative overflow-hidden">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
                <Clock className="w-4 h-4 text-primary" />
                포모도로 타이머
                {completedSessions > 0 && (
                    <span className="ml-auto flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                        <Flame className="w-3 h-3" /> {completedSessions}회
                    </span>
                )}
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
                        <DialogTitle>타이머 설정</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="focus" className="text-right">
                                집중 (분)
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
                        <div className="flex items-center justify-between px-1 pt-2 border-t">
                            <Label htmlFor="autoSwitch" className="text-sm font-medium cursor-pointer">
                                자동 모드 전환
                            </Label>
                            <button
                                id="autoSwitch"
                                type="button"
                                role="switch"
                                aria-checked={autoSwitch}
                                onClick={() => setAutoSwitch(!autoSwitch)}
                                className={cn(
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                    autoSwitch ? "bg-primary" : "bg-gray-200"
                                )}
                            >
                                <span className={cn(
                                    "inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm",
                                    autoSwitch ? "translate-x-6" : "translate-x-1"
                                )} />
                            </button>
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
                            "transition-all duration-1000 ease-linear",
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

            {/* Session dots — shows 4 dots for current round */}
            <div className="flex items-center gap-1.5 mb-4">
                {[0, 1, 2, 3].map(i => (
                    <div
                        key={i}
                        className={cn(
                            "w-2.5 h-2.5 rounded-full transition-colors",
                            i < (completedSessions % 4) ? "bg-primary" : "bg-muted"
                        )}
                    />
                ))}
                <span className="text-[10px] text-muted-foreground ml-1.5">
                    {4 - (completedSessions % 4)}회 후 긴 휴식
                </span>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={resetTimer}
                    className="rounded-full w-10 h-10 border-border hover:bg-muted text-muted-foreground"
                >
                    <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleTimer}
                    className={cn(
                        "rounded-full w-14 h-14 border-2 transition-all",
                        isActive
                            ? "border-primary bg-primary/5 text-primary hover:bg-primary/10"
                            : "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                >
                    {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={skipToNext}
                    className="rounded-full w-10 h-10 border-border hover:bg-muted text-muted-foreground"
                >
                    <SkipForward className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

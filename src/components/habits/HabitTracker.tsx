'use client';

import { useState, useEffect } from 'react';
import { Habit, EventType, EventPriority } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Flame, Check, Plus, Trash2, Pencil, Clock, ChevronDown, Tag, AlertCircle, Users, Handshake, FolderTree, Trophy } from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import { format } from 'date-fns';
import { useData } from '@/context/DataProvider';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HabitStats } from './HabitStats';

const generateTimeOptions = () => {
    const options = [];
    for (let i = 0; i < 24; i++) {
        for (let j = 0; j < 60; j += 15) {
            const hour = i.toString().padStart(2, '0');
            const minute = j.toString().padStart(2, '0');
            options.push(`${hour}:${minute}`);
        }
    }
    return options;
};
const timeOptions = generateTimeOptions();

export function HabitTracker() {
    const { habits, addHabit, updateHabit, deleteHabit, projects, goals } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newHabitTitle, setNewHabitTitle] = useState('');
    const [newHabitTime, setNewHabitTime] = useState(''); // Start Time
    const [newHabitEndTime, setNewHabitEndTime] = useState(''); // End Time
    const [newHabitDays, setNewHabitDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]); // Default: All days

    // New Event Fields
    const [type, setType] = useState<EventType>('personal');
    const [priority, setPriority] = useState<EventPriority>('medium');
    const [isMeeting, setIsMeeting] = useState(false);
    const [isAppointment, setIsAppointment] = useState(false);
    const [connectedProjectId, setConnectedProjectId] = useState<string | undefined>(undefined);
    const [connectedGoalId, setConnectedGoalId] = useState<string | undefined>(undefined);
    const [prepTime, setPrepTime] = useState<number>(0);
    const [travelTime, setTravelTime] = useState<number>(0);
    const [targetCount, setTargetCount] = useState<number>(1);
    const [isTracked, setIsTracked] = useState<boolean>(true);
    const [description, setDescription] = useState('');

    // Edit State
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [viewingStatsHabit, setViewingStatsHabit] = useState<Habit | null>(null);

    const [today, setToday] = useState('');

    // Hydration fix: Set today only on client
    useEffect(() => {
        setToday(format(new Date(), 'yyyy-MM-dd'));
    }, []);

    const toggleHabit = (id: string) => {
        const habit = habits.find(h => h.id === id);
        if (!habit) return;

        const target = habit.targetCount || 1;
        const currentProgress = habit.dailyProgress?.[today] || 0;

        // Cycle behavior: 0 -> 1 -> ... -> target -> 0 (reset)
        // Or should it be: 0 -> 1 -> ... -> target (stay) -> click to reset?
        // Let's go with: Increment until target, then reset to 0.
        // But if it's a simple toggle (target=1), it goes 0 -> 1 -> 0.

        let newProgress = currentProgress + 1;

        // If we are already at or above target, reset to 0 (toggle off behavior for completed habits)
        if (currentProgress >= target) {
            newProgress = 0;
        }

        const isCompletedNow = newProgress >= target;
        const wasCompleted = habit.completedDates.includes(today);

        const newCompletedDates = isCompletedNow
            ? (wasCompleted ? habit.completedDates : [...habit.completedDates, today])
            : habit.completedDates.filter(d => d !== today);


        // Calculate Streak Logic (Robust)
        // 1. Sort dates descending
        // 2. Iterate backwards from "Yesterday" (or Today if completed)
        // 3. Count consecutive days

        const sortedDates = [...newCompletedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        let calculatedStreak = 0;
        let checkDate = new Date(); // Start checking from Today

        // If today is NOT completed, we start checking from Yesterday to see if the streak is still alive
        // But if today IS completed, we start from Today.
        // Actually, let's normalize: verify if "checkDate" string exists in sortedDates.
        // If not, subtract 1 day and check. Stop when break.

        // However, standard streak:
        // If I did it today, streak includes today.
        // If I haven't done it today, streak includes up to yesterday.
        // If I missed yesterday, streak is 0 (unless I do it today to restart it).

        // Algorithm:
        // 1. Check if Today is completed.
        //    If YES: Streak = 1 + check yesterday...
        //    If NO: Check yesterday. 
        //       If Yesterday YES: Streak = 1 (yesterday) + check day before...
        //       If Yesterday NO: Streak = 0.

        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

        if (newCompletedDates.includes(todayStr)) {
            calculatedStreak++;
            checkDate = yesterday;
        } else {
            checkDate = yesterday;
        }

        while (true) {
            const dateStr = format(checkDate, 'yyyy-MM-dd');
            if (newCompletedDates.includes(dateStr)) {
                calculatedStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        updateHabit({
            ...habit,
            dailyProgress: {
                ...habit.dailyProgress,
                [today]: newProgress
            },
            completedDates: newCompletedDates,
            streak: calculatedStreak
        });
    };

    const handleSaveHabit = () => {
        if (!newHabitTitle.trim()) return;

        if (editingHabit) {
            updateHabit({
                ...editingHabit,
                title: newHabitTitle,
                time: newHabitTime || undefined,
                endTime: newHabitEndTime || undefined,
                days: newHabitDays.length > 0 ? newHabitDays : undefined,
                type,
                priority,
                isMeeting,
                isAppointment,
                connectedProjectId,
                connectedGoalId,
                prepTime: prepTime > 0 ? prepTime : undefined,
                travelTime: travelTime > 0 ? travelTime : undefined,
                targetCount: targetCount > 1 ? targetCount : 1,
                isTracked,
                description: description || undefined
            });
        } else {
            const newHabit: Habit = {
                id: generateId(),
                title: newHabitTitle,
                streak: 0,
                completedDates: [],
                time: newHabitTime || undefined,
                endTime: newHabitEndTime || undefined,
                days: newHabitDays.length > 0 ? newHabitDays : undefined,
                startDate: new Date(),
                skippedDates: [],
                type,
                priority,
                isMeeting,
                isAppointment,
                connectedProjectId,
                connectedGoalId,
                prepTime: prepTime > 0 ? prepTime : undefined,
                travelTime: travelTime > 0 ? travelTime : undefined,
                targetCount: targetCount > 1 ? targetCount : 1,
                dailyProgress: {},
                isTracked,
                description: description || undefined
            };
            addHabit(newHabit);
        }

        // Reset
        setNewHabitTitle('');
        setNewHabitTime('');
        setNewHabitEndTime('');
        setNewHabitDays([0, 1, 2, 3, 4, 5, 6]);
        setType('personal');
        setPriority('medium');
        setIsMeeting(false);
        setIsAppointment(false);
        setConnectedProjectId(undefined);
        setConnectedGoalId(undefined);
        setPrepTime(0);
        setTravelTime(0);
        setTargetCount(1);
        setIsTracked(true);
        setDescription('');
        setEditingHabit(null);
        setIsDialogOpen(false);
    };

    const handleOpenEdit = (habit: Habit) => {
        setEditingHabit(habit);
        setNewHabitTitle(habit.title);
        setNewHabitTime(habit.time || '');
        setNewHabitEndTime(habit.endTime || '');
        setNewHabitDays(habit.days || [0, 1, 2, 3, 4, 5, 6]);
        setType(habit.type || 'personal');
        setPriority(habit.priority || 'medium');
        setIsMeeting(habit.isMeeting || false);
        setIsAppointment(habit.isAppointment || false);
        setConnectedProjectId(habit.connectedProjectId);
        setConnectedGoalId(habit.connectedGoalId);
        setPrepTime(habit.prepTime || 0);
        setTravelTime(habit.travelTime || 0);
        setTargetCount(habit.targetCount || 1);
        setIsTracked(habit.isTracked !== false); // Default true
        setDescription(habit.description || '');
        setIsDialogOpen(true);
    };

    const handleOpenCreate = () => {
        setEditingHabit(null);
        setNewHabitTitle('');
        setNewHabitTime('');
        setNewHabitEndTime('');
        setNewHabitDays([0, 1, 2, 3, 4, 5, 6]);
        setType('personal');
        setPriority('medium');
        setIsMeeting(false);
        setIsAppointment(false);
        setConnectedProjectId(undefined);
        setConnectedGoalId(undefined);
        setPrepTime(0);
        setTravelTime(0);
        setTargetCount(1);
        setIsTracked(true);
        setDescription('');
        setIsDialogOpen(true);
    };

    return (
        <div className="border border-border/40 rounded-lg bg-card text-card-foreground p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" /> 습관
                </h2>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal={false}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="ghost" onClick={handleOpenCreate}><Plus className="w-4 h-4" /></Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto p-4 gap-3">
                        <DialogHeader className="pb-2 mb-0">
                            <DialogTitle>{editingHabit ? '습관 수정' : '새 습관 추가'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label htmlFor="habit-title" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Tag className="w-3 h-3 text-primary" /> 습관 이름
                                </Label>
                                <Input
                                    id="habit-title"
                                    value={newHabitTitle}
                                    onChange={(e) => setNewHabitTitle(e.target.value)}
                                    placeholder="물 마시기, 독서하기..."
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveHabit()}
                                    className="text-base font-bold h-8"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <AlertCircle className="w-3 h-3 text-primary" /> 하루 목표 횟수
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-6 w-6 rounded-full"
                                        onClick={() => setTargetCount(Math.max(1, targetCount - 1))}
                                    >
                                        -
                                    </Button>
                                    <span className="text-sm font-bold w-4 text-center">{targetCount}</span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-6 w-6 rounded-full"
                                        onClick={() => setTargetCount(targetCount + 1)}
                                    >
                                        +
                                    </Button>
                                    <span className="text-[10px] text-muted-foreground ml-1">회</span>
                                </div>
                            </div>

                            {/* Time Selection */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Clock className="w-3 h-3 text-primary" /> 시작 시간
                                    </Label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-medium border-muted/40 bg-muted/20 hover:bg-muted/40 h-7 text-xs">
                                                {newHabitTime || "선택 안 함"}
                                                <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="max-h-[200px] overflow-y-auto w-[150px]">
                                            <DropdownMenuItem className="text-xs" onSelect={() => setNewHabitTime('')}>선택 안 함</DropdownMenuItem>
                                            {timeOptions.map((t) => (
                                                <DropdownMenuItem className="text-xs" key={`start-${t}`} onSelect={() => setNewHabitTime(t)}>
                                                    {t}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Clock className="w-3 h-3 text-primary" /> 종료 시간
                                    </Label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-medium border-muted/40 bg-muted/20 hover:bg-muted/40 h-7 text-xs">
                                                {newHabitEndTime || "선택 안 함"}
                                                <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="max-h-[200px] overflow-y-auto w-[150px]">
                                            <DropdownMenuItem className="text-xs" onSelect={() => setNewHabitEndTime('')}>선택 안 함</DropdownMenuItem>
                                            {timeOptions.map((t) => (
                                                <DropdownMenuItem className="text-xs" key={`end-${t}`} onSelect={() => setNewHabitEndTime(t)}>
                                                    {t}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Repeat Days */}
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">반복 요일</Label>
                                <div className="flex justify-between gap-1">
                                    {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => {
                                        const isSelected = newHabitDays.includes(idx);
                                        return (
                                            <div
                                                key={day}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        const filtered = newHabitDays.filter(d => d !== idx);
                                                        setNewHabitDays(filtered);
                                                    } else {
                                                        const added = [...newHabitDays, idx].sort();
                                                        setNewHabitDays(added);
                                                    }
                                                }}
                                                className={cn(
                                                    "w-7 h-7 rounded-full text-[10px] font-bold transition-all border cursor-pointer select-none flex items-center justify-center",
                                                    isSelected
                                                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600 shadow-sm scale-105"
                                                        : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-300 hover:text-blue-600"
                                                )}
                                            >
                                                {day}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Prep & Travel Time */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Clock className="w-3 h-3 text-primary" /> 준비 (분)
                                    </Label>
                                    <Input
                                        type="number"
                                        className="h-7 text-xs"
                                        value={prepTime === 0 ? '' : prepTime}
                                        onChange={e => setPrepTime(Number(e.target.value))}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Clock className="w-3 h-3 text-primary" /> 이동 (분)
                                    </Label>
                                    <Input
                                        type="number"
                                        className="h-7 text-xs"
                                        value={travelTime === 0 ? '' : travelTime}
                                        onChange={e => setTravelTime(Number(e.target.value))}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Type & Priority */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <FolderTree className="w-3 h-3 text-primary" /> 유형
                                    </Label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-medium border-muted/40 bg-muted/20 hover:bg-muted/40 capitalize h-7 text-xs">
                                                {type === 'work' ? '업무' :
                                                    type === 'personal' ? '개인' :
                                                        type === 'study' ? '공부' :
                                                            type === 'hobby' ? '취미' :
                                                                type === 'health' ? '건강' :
                                                                    type === 'finance' ? '재테크' :
                                                                        type === 'social' ? '사교' :
                                                                            type === 'travel' ? '여행' :
                                                                                type === 'meal' ? '식사' : '기타'}
                                                <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[150px]">
                                            <DropdownMenuItem className="text-xs" onSelect={() => setType('work')}>업무</DropdownMenuItem>
                                            <DropdownMenuItem className="text-xs" onSelect={() => setType('personal')}>개인</DropdownMenuItem>
                                            <DropdownMenuItem className="text-xs" onSelect={() => setType('study')}>공부</DropdownMenuItem>
                                            <DropdownMenuItem className="text-xs" onSelect={() => setType('hobby')}>취미</DropdownMenuItem>
                                            <DropdownMenuItem className="text-xs" onSelect={() => setType('health')}>건강</DropdownMenuItem>
                                            <DropdownMenuItem className="text-xs" onSelect={() => setType('finance')}>재테크</DropdownMenuItem>
                                            <DropdownMenuItem className="text-xs" onSelect={() => setType('social')}>사교</DropdownMenuItem>
                                            <DropdownMenuItem className="text-xs" onSelect={() => setType('travel')}>여행</DropdownMenuItem>
                                            <DropdownMenuItem className="text-xs" onSelect={() => setType('meal')}>식사</DropdownMenuItem>
                                            <DropdownMenuItem className="text-xs" onSelect={() => setType('other')}>기타</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <AlertCircle className="w-3 h-3 text-primary" /> 우선순위
                                    </Label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-medium border-muted/40 bg-muted/20 hover:bg-muted/40 capitalize h-7 text-xs">
                                                {priority === 'low' ? '낮음' : priority === 'medium' ? '보통' : '높음'}
                                                <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[150px]">
                                            <DropdownMenuItem className="text-xs" onSelect={() => setPriority('low')}>낮음</DropdownMenuItem>
                                            <DropdownMenuItem className="text-xs" onSelect={() => setPriority('medium')}>보통</DropdownMenuItem>
                                            <DropdownMenuItem className="text-xs" onSelect={() => setPriority('high')}>높음</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Project & Goal Links */}
                            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border/10">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <FolderTree className="w-3 h-3 text-primary" /> 프로젝트
                                    </Label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-medium border-muted/40 bg-muted/20 hover:bg-muted/40 text-[10px] h-7 px-2">
                                                <span className="truncate max-w-[100px] text-left">
                                                    {projects.find(p => p.id === connectedProjectId)?.title || '선택 안 함'}
                                                </span>
                                                <ChevronDown className="ml-1 h-3 w-3 opacity-50 flex-shrink-0" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[160px] max-h-[200px] overflow-y-auto">
                                            <DropdownMenuItem className="text-[10px]" onSelect={() => setConnectedProjectId(undefined)}>선택 안 함</DropdownMenuItem>
                                            {projects.map(p => (
                                                <DropdownMenuItem className="text-[10px]" key={p.id} onSelect={() => setConnectedProjectId(p.id)}>
                                                    <div className="flex items-center gap-2 max-w-full">
                                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                                                        <span className="truncate">{p.title}</span>
                                                    </div>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Trophy className="w-3 h-3 text-primary" /> 목표
                                    </Label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-medium border-muted/40 bg-muted/20 hover:bg-muted/40 text-[10px] h-7 px-2">
                                                <span className="truncate max-w-[100px] text-left">
                                                    {goals.find(g => g.id === connectedGoalId)?.title || '선택 안 함'}
                                                </span>
                                                <ChevronDown className="ml-1 h-3 w-3 opacity-50 flex-shrink-0" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[160px] max-h-[200px] overflow-y-auto">
                                            <DropdownMenuItem className="text-[10px]" onSelect={() => setConnectedGoalId(undefined)}>선택 안 함</DropdownMenuItem>
                                            {goals.map(g => (
                                                <DropdownMenuItem className="text-[10px]" key={g.id} onSelect={() => setConnectedGoalId(g.id)}>
                                                    <span className="truncate">{g.title}</span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Meeting & Appointment Flags & Tracking */}
                            <div className="flex items-center justify-between gap-4 pt-1">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center space-x-1.5">
                                        <Checkbox
                                            id="isMeeting"
                                            checked={isMeeting}
                                            onCheckedChange={(c) => setIsMeeting(c as boolean)}
                                            className="h-3.5 w-3.5"
                                        />
                                        <Label htmlFor="isMeeting" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1">
                                            <Users className="w-3 h-3 text-blue-500" />
                                            회의
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-1.5">
                                        <Checkbox
                                            id="isAppointment"
                                            checked={isAppointment}
                                            onCheckedChange={(c) => setIsAppointment(c as boolean)}
                                            className="h-3.5 w-3.5"
                                        />
                                        <Label htmlFor="isAppointment" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1">
                                            <Handshake className="w-3 h-3 text-green-500" />
                                            약속
                                        </Label>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-1.5 bg-secondary/50 px-2 py-1.5 rounded-md border border-border/50">
                                    <Checkbox
                                        id="isTracked"
                                        checked={isTracked}
                                        onCheckedChange={(c) => setIsTracked(c as boolean)}
                                        className="h-3.5 w-3.5"
                                    />
                                    <Label htmlFor="isTracked" className="text-[10px] font-bold text-primary flex items-center gap-1 cursor-pointer">
                                        <Trophy className="w-3 h-3" />
                                        달성여부
                                    </Label>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">메모</Label>
                                <textarea
                                    className="w-full h-14 bg-muted/30 border border-border rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                    placeholder="추가 설명..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter className="pt-0">
                            <Button size="sm" onClick={handleSaveHabit} className="h-8 text-xs">{editingHabit ? '저장하기' : '추가하기'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Habit Stats Dialog */}
                <Dialog open={!!viewingStatsHabit} onOpenChange={(open) => !open && setViewingStatsHabit(null)}>
                    <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-transparent border-none shadow-none">
                        {viewingStatsHabit && <HabitStats habit={viewingStatsHabit} onClose={() => setViewingStatsHabit(null)} />}
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-3">
                {habits.filter(habit => habit.isTracked !== false).map(habit => {
                    const isCompleted = habit.completedDates.includes(today);
                    const target = habit.targetCount || 1;
                    const currentProgress = habit.dailyProgress?.[today] || 0;

                    return (
                        <div key={habit.id} className="group flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3 flex-1">
                                <button
                                    onClick={() => toggleHabit(habit.id)}
                                    className={cn(
                                        "flex items-center justify-center w-6 h-6 rounded border transition-colors",
                                        isCompleted
                                            ? "bg-primary border-primary text-primary-foreground"
                                            : "border-muted-foreground hover:border-foreground"
                                    )}
                                >
                                    {isCompleted && <Check className="w-4 h-4" />}
                                </button>

                                <div className="flex-1">
                                    <div className="font-bold text-sm flex items-center justify-between leading-none">
                                        <div className="flex items-center gap-2">
                                            <span
                                                onClick={() => setViewingStatsHabit(habit)}
                                                className="cursor-pointer hover:underline hover:text-primary transition-colors"
                                            >
                                                {habit.title}
                                            </span>
                                            {target > 1 && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                                                    {currentProgress} / {target}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-xs font-medium text-muted-foreground flex items-center gap-1 mt-1">
                                        <Flame className="w-3 h-3 text-orange-500" /> {habit.streak}일 연속
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                <button onClick={() => handleOpenEdit(habit)} className="text-muted-foreground hover:text-foreground">
                                    <Pencil className="w-3 h-3" />
                                </button>
                                <button onClick={() => deleteHabit(habit.id)} className="text-muted-foreground hover:text-destructive">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {habits.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                        등록된 습관이 없습니다. 시작해보세요!
                    </div>
                )}
            </div>
        </div>
    );
}

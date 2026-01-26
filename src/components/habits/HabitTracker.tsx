'use client';

import { useState } from 'react';
import { Habit } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Flame, Check, Plus, Trash2, Pencil, Clock, ChevronDown } from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import { format } from 'date-fns';
import { useData } from '@/context/DataProvider';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    const { habits, addHabit, updateHabit, deleteHabit } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newHabitTitle, setNewHabitTitle] = useState('');
    const [newHabitTime, setNewHabitTime] = useState(''); // Start Time
    const [newHabitEndTime, setNewHabitEndTime] = useState(''); // End Time
    const [newHabitDays, setNewHabitDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]); // Default: All days

    // Edit State
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

    const today = format(new Date(), 'yyyy-MM-dd');

    const toggleHabit = (id: string) => {
        const habit = habits.find(h => h.id === id);
        if (!habit) return;

        const isCompleted = habit.completedDates.includes(today);
        updateHabit({
            ...habit,
            completedDates: isCompleted
                ? habit.completedDates.filter(d => d !== today)
                : [...habit.completedDates, today],
            streak: isCompleted ? Math.max(0, habit.streak - 1) : habit.streak + 1
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
                days: newHabitDays.length > 0 ? newHabitDays : undefined
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
                skippedDates: []
            };
            addHabit(newHabit);
        }

        // Reset
        setNewHabitTitle('');
        setNewHabitTime('');
        setNewHabitEndTime('');
        setNewHabitDays([0, 1, 2, 3, 4, 5, 6]);
        setEditingHabit(null);
        setIsDialogOpen(false);
    };

    const handleOpenEdit = (habit: Habit) => {
        setEditingHabit(habit);
        setNewHabitTitle(habit.title);
        setNewHabitTime(habit.time || '');
        setNewHabitEndTime(habit.endTime || '');
        setNewHabitDays(habit.days || [0, 1, 2, 3, 4, 5, 6]);
        setIsDialogOpen(true);
    };

    const handleOpenCreate = () => {
        setEditingHabit(null);
        setNewHabitTitle('');
        setNewHabitTime('');
        setNewHabitEndTime('');
        setNewHabitDays([0, 1, 2, 3, 4, 5, 6]);
        setIsDialogOpen(true);
    };

    return (
        <div className="border border-border/40 rounded-lg bg-card text-card-foreground p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" /> 습관
                </h2>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="ghost" onClick={handleOpenCreate}><Plus className="w-4 h-4" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingHabit ? '습관 수정' : '새 습관 추가'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="habit-title">습관 이름</Label>
                                <Input
                                    id="habit-title"
                                    value={newHabitTitle}
                                    onChange={(e) => setNewHabitTitle(e.target.value)}
                                    placeholder="물 마시기, 독서하기..."
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveHabit()}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> 시작 시간
                                    </Label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-medium border-input bg-transparent shadow-sm hover:bg-muted/50 focus:ring-1 focus:ring-ring">
                                                {newHabitTime || "선택 안 함"}
                                                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="max-h-[200px] overflow-y-auto w-[180px]">
                                            <DropdownMenuItem onSelect={() => setNewHabitTime('')}>선택 안 함</DropdownMenuItem>
                                            {timeOptions.map((t) => (
                                                <DropdownMenuItem key={`start-${t}`} onSelect={() => setNewHabitTime(t)}>
                                                    {t}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> 종료 시간
                                    </Label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-medium border-input bg-transparent shadow-sm hover:bg-muted/50 focus:ring-1 focus:ring-ring">
                                                {newHabitEndTime || "선택 안 함"}
                                                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="max-h-[200px] overflow-y-auto w-[180px]">
                                            <DropdownMenuItem onSelect={() => setNewHabitEndTime('')}>선택 안 함</DropdownMenuItem>
                                            {timeOptions.map((t) => (
                                                <DropdownMenuItem key={`end-${t}`} onSelect={() => setNewHabitEndTime(t)}>
                                                    {t}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>반복 요일</Label>
                                <div className="flex justify-between gap-1">
                                    {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                                        <button
                                            key={day}
                                            onClick={() => {
                                                if (newHabitDays.includes(idx)) {
                                                    setNewHabitDays(newHabitDays.filter(d => d !== idx));
                                                } else {
                                                    setNewHabitDays([...newHabitDays, idx]);
                                                }
                                            }}
                                            className={cn(
                                                "w-8 h-8 rounded-full text-xs font-medium transition-colors border",
                                                newHabitDays.includes(idx)
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-transparent text-muted-foreground border-border hover:bg-muted"
                                            )}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSaveHabit}>{editingHabit ? '저장하기' : '추가하기'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-3">
                {habits.map(habit => {
                    const isCompleted = habit.completedDates.includes(today);
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
                                        <span onClick={() => handleOpenEdit(habit)} className="cursor-pointer hover:underline">
                                            {habit.title}
                                        </span>
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

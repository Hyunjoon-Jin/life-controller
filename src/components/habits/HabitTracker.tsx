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
    const [description, setDescription] = useState('');

    // Edit State
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

    const [today, setToday] = useState('');

    // Hydration fix: Set today only on client
    useEffect(() => {
        setToday(format(new Date(), 'yyyy-MM-dd'));
    }, []);

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
                days: newHabitDays.length > 0 ? newHabitDays : undefined,
                type,
                priority,
                isMeeting,
                isAppointment,
                connectedProjectId,
                connectedGoalId,
                prepTime: prepTime > 0 ? prepTime : undefined,
                travelTime: travelTime > 0 ? travelTime : undefined,
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
                    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingHabit ? '습관 수정' : '새 습관 추가'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="habit-title" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Tag className="w-3 h-3 text-primary" /> 습관 이름
                                </Label>
                                <Input
                                    id="habit-title"
                                    value={newHabitTitle}
                                    onChange={(e) => setNewHabitTitle(e.target.value)}
                                    placeholder="물 마시기, 독서하기..."
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveHabit()}
                                    className="text-lg font-bold"
                                />
                            </div>

                            {/* Time Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-primary" /> 시작 시간
                                    </Label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-medium border-muted/40 bg-muted/20 hover:bg-muted/40">
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
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-primary" /> 종료 시간
                                    </Label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-medium border-muted/40 bg-muted/20 hover:bg-muted/40">
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

                            {/* Repeat Days */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">반복 요일</Label>
                                <div className="flex justify-between gap-1">
                                    {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => {
                                        const isSelected = newHabitDays.includes(idx);
                                        return (
                                            <div
                                                key={day}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => {
                                                    console.log(`Toggling day ${day} (${idx}), currently selected:`, isSelected);
                                                    if (isSelected) {
                                                        const filtered = newHabitDays.filter(d => d !== idx);
                                                        console.log('Removing day, new array:', filtered);
                                                        setNewHabitDays(filtered);
                                                    } else {
                                                        const added = [...newHabitDays, idx].sort();
                                                        console.log('Adding day, new array:', added);
                                                        setNewHabitDays(added);
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        if (isSelected) {
                                                            setNewHabitDays(newHabitDays.filter(d => d !== idx));
                                                        } else {
                                                            setNewHabitDays([...newHabitDays, idx].sort());
                                                        }
                                                    }
                                                }}
                                                className={cn(
                                                    "w-8 h-8 rounded-full text-xs font-medium transition-all border cursor-pointer select-none flex items-center justify-center",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                                                        : "bg-white dark:bg-gray-800 text-muted-foreground border-border hover:bg-muted hover:scale-105"
                                                )}
                                            >
                                                {day}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Prep & Travel Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-primary" /> 준비 시간 (분)
                                    </Label>
                                    <Input
                                        type="number"
                                        value={prepTime === 0 ? '' : prepTime}
                                        onChange={e => setPrepTime(Number(e.target.value))}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-primary" /> 이동 시간 (분)
                                    </Label>
                                    <Input
                                        type="number"
                                        value={travelTime === 0 ? '' : travelTime}
                                        onChange={e => setTravelTime(Number(e.target.value))}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Type & Priority */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <FolderTree className="w-3 h-3 text-primary" /> 유형
                                    </Label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-medium border-muted/40 bg-muted/20 hover:bg-muted/40 capitalize">
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
                                        <DropdownMenuContent className="w-[180px]">
                                            <DropdownMenuItem onSelect={() => setType('work')}>업무</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setType('personal')}>개인</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setType('study')}>공부</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setType('hobby')}>취미</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setType('health')}>건강</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setType('finance')}>재테크</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setType('social')}>사교</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setType('travel')}>여행</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setType('meal')}>식사</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setType('other')}>기타</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <AlertCircle className="w-3 h-3 text-primary" /> 우선순위
                                    </Label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-medium border-muted/40 bg-muted/20 hover:bg-muted/40 capitalize">
                                                {priority === 'low' ? '낮음' : priority === 'medium' ? '보통' : '높음'}
                                                <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[180px]">
                                            <DropdownMenuItem onSelect={() => setPriority('low')}>낮음</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setPriority('medium')}>보통</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setPriority('high')}>높음</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Project & Goal Links */}
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/10">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <FolderTree className="w-3 h-3 text-primary" /> 프로젝트
                                    </Label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-medium border-muted/40 bg-muted/20 hover:bg-muted/40 text-xs h-9">
                                                {projects.find(p => p.id === connectedProjectId)?.title || '선택 안 함'}
                                                <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[180px] max-h-[200px] overflow-y-auto">
                                            <DropdownMenuItem onSelect={() => setConnectedProjectId(undefined)}>선택 안 함</DropdownMenuItem>
                                            {projects.map(p => (
                                                <DropdownMenuItem key={p.id} onSelect={() => setConnectedProjectId(p.id)}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                                        <span className="truncate">{p.title}</span>
                                                    </div>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Trophy className="w-3 h-3 text-primary" /> 목표
                                    </Label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-medium border-muted/40 bg-muted/20 hover:bg-muted/40 text-xs h-9">
                                                {goals.find(g => g.id === connectedGoalId)?.title || '선택 안 함'}
                                                <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[180px] max-h-[200px] overflow-y-auto">
                                            <DropdownMenuItem onSelect={() => setConnectedGoalId(undefined)}>선택 안 함</DropdownMenuItem>
                                            {goals.map(g => (
                                                <DropdownMenuItem key={g.id} onSelect={() => setConnectedGoalId(g.id)}>
                                                    <span className="truncate">{g.title}</span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Meeting & Appointment Flags */}
                            <div className="flex items-center gap-6 pt-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isMeeting"
                                        checked={isMeeting}
                                        onCheckedChange={(c) => setIsMeeting(c as boolean)}
                                    />
                                    <Label htmlFor="isMeeting" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1">
                                        <Users className="w-3.5 h-3.5 text-blue-500" />
                                        회의
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isAppointment"
                                        checked={isAppointment}
                                        onCheckedChange={(c) => setIsAppointment(c as boolean)}
                                    />
                                    <Label htmlFor="isAppointment" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1">
                                        <Handshake className="w-3.5 h-3.5 text-green-500" />
                                        약속
                                    </Label>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">메모</Label>
                                <textarea
                                    className="w-full h-20 bg-muted/30 border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                    placeholder="추가 설명..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
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

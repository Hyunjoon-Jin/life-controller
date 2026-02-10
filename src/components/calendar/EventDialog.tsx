'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarEvent, EventPriority, EventType } from '@/types';
import { format } from 'date-fns';
import { Trash2, Clock, Calendar as CalendarIcon, Tag, AlertCircle, Users, ChevronDown, Handshake, FolderTree, Trophy, Repeat, CheckCircle2 } from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import { useData } from '@/context/DataProvider';

interface EventDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    event: CalendarEvent | null;
    initialDate?: Date;
    initialEndDate?: Date;
    onSave: (event: CalendarEvent) => void;
    onDelete?: (eventId: string) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function EventDialog({ isOpen, onOpenChange, event, initialDate, initialEndDate, onSave, onDelete }: EventDialogProps) {
    const { projects, goals, addHabit, habits } = useData();
    const [title, setTitle] = useState('');
    const [type, setType] = useState<EventType>('work');
    const [priority, setPriority] = useState<EventPriority>('medium');
    const [isMeeting, setIsMeeting] = useState(false);
    const [isAppointment, setIsAppointment] = useState(false);

    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const [connectedProjectId, setConnectedProjectId] = useState<string | undefined>(undefined);
    const [connectedGoalId, setConnectedGoalId] = useState<string | undefined>(undefined);

    const [prepTime, setPrepTime] = useState<number>(0);
    const [travelTime, setTravelTime] = useState<number>(0);

    // Habit States
    const [isHabit, setIsHabit] = useState(false);
    const [repeatDays, setRepeatDays] = useState<number[]>([]);
    const [targetCount, setTargetCount] = useState<number>(1);

    // Generate 15-minute intervals
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

    const roundToNearest15 = (date: Date) => {
        const d = new Date(date);
        const minutes = d.getMinutes();
        const roundedMinutes = Math.round(minutes / 15) * 15;
        d.setMinutes(roundedMinutes);
        d.setSeconds(0);
        return d;
    };

    useEffect(() => {
        if (event) {
            setTitle(event.title);
            setType(event.type || 'work');
            setPriority(event.priority || 'medium');
            setIsMeeting(event.isMeeting || false);
            setIsAppointment(event.isAppointment || false);
            setStartTime(format(roundToNearest15(event.start), 'HH:mm')); // Changed to HH:mm for consistency
            setEndTime(format(roundToNearest15(event.end), 'HH:mm'));
            setConnectedProjectId(event.connectedProjectId);
            setConnectedGoalId(event.connectedGoalId);
            setPrepTime(event.prepTime || 0);
            setTravelTime(event.travelTime || 0);

            // If editing an existing event, we don't typically convert it to habit here,
            // unless it WAS a habit event, but habit events usually edit the master habit.
            // For simplicity in this dialog, we assume standard event editing.
            setIsHabit(false);
            setRepeatDays([]);
        } else if (isOpen && initialDate) {
            // Reset for new event
            setTitle('');
            setType('work');
            setPriority('medium');
            setIsMeeting(false);
            setIsAppointment(false);
            setConnectedProjectId(undefined);
            setConnectedGoalId(undefined);
            setPrepTime(0);
            setTravelTime(0);
            setIsHabit(false);

            const start = roundToNearest15(initialDate);
            setRepeatDays([start.getDay()]); // Default to current day

            setStartTime(format(start, 'HH:mm'));

            if (initialEndDate) {
                setEndTime(format(roundToNearest15(initialEndDate), 'HH:mm'));
            } else {
                const end = new Date(start);
                end.setMinutes(end.getMinutes() + 30);
                setEndTime(format(end, 'HH:mm'));
            }
        }
    }, [isOpen, event, initialDate, initialEndDate]);

    const handleSave = () => {
        if (!title.trim()) return;

        if (isHabit) {
            // Create as Habit
            addHabit({
                id: generateId(),
                title,
                streak: 0,
                completedDates: [],
                time: startTime,
                endTime: endTime,
                days: repeatDays,
                startDate: new Date(), // Start from today
                type,
                priority,
                isMeeting,
                isAppointment,
                connectedProjectId,
                connectedGoalId,
                prepTime: prepTime > 0 ? prepTime : undefined,
                travelTime: travelTime > 0 ? travelTime : undefined,
                color: event?.color // Or auto-assign based on type
            });
            onOpenChange(false);
        } else {
            // Create/Update as Standard Event
            const baseDate = event ? event.start : (initialDate || new Date());
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);

            const newStart = new Date(baseDate);
            newStart.setHours(startHour, startMin, 0, 0);

            const newEnd = new Date(baseDate);
            newEnd.setHours(endHour, endMin, 0, 0);

            // Handle overnight events or end < start
            if (newEnd < newStart) {
                newEnd.setDate(newEnd.getDate() + 1);
            }

            const updatedEvent: CalendarEvent = {
                id: event?.id || generateId(),
                title,
                start: newStart,
                end: newEnd,
                type,
                priority,
                isMeeting,
                isAppointment,
                color: event?.color,
                connectedProjectId,
                connectedGoalId,
                prepTime: prepTime > 0 ? prepTime : undefined,
                travelTime: travelTime > 0 ? travelTime : undefined
            };

            onSave(updatedEvent);
            onOpenChange(false);
        }
    };

    const handleDelete = () => {
        if (event && onDelete) {
            onDelete(event.id);
            onOpenChange(false);
        }
    };

    const toggleDay = (dayIndex: number) => {
        setRepeatDays(prev =>
            prev.includes(dayIndex)
                ? prev.filter(d => d !== dayIndex)
                : [...prev, dayIndex].sort()
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
                {/* Header */}
                <DialogHeader className="px-6 py-5 border-b border-gray-100 flex flex-row items-center justify-between">
                    <div>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-800">
                            {event ? '일정 수정' : '새 일정 등록'}
                        </DialogTitle>
                    </div>
                    {/* Event Type Badge (Visual Only) */}
                    <div className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-bold capitalize",
                        priority === 'high' ? "bg-red-50 text-red-600" :
                            priority === 'medium' ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"
                    )}>
                        {priority === 'high' ? '중요' : priority === 'medium' ? '보통' : '낮음'}
                    </div>
                </DialogHeader>

                <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar" onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                }}>
                    {/* Title Input */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5" /> 제목
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="일정 제목을 입력하세요"
                            className="text-lg font-bold border-0 border-b-2 border-gray-100 bg-transparent rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-primary placeholder:font-medium placeholder:text-gray-300 transition-colors"
                            autoFocus
                        />
                    </div>

                    {/* Time Selection */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-2">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" /> 시작
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start font-medium border-gray-200 bg-gray-50 hover:bg-white hover:border-primary/50 text-left px-3 text-base">
                                        {startTime}
                                        <ChevronDown className="ml-auto h-4 w-4 opacity-30" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="max-h-[200px] overflow-y-auto w-[180px]">
                                    {timeOptions.map((t) => (
                                        <DropdownMenuItem key={`start-${t}`} onSelect={() => setStartTime(t)}>
                                            {t}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="flex items-center justify-center pt-6 text-gray-300">-</div>
                        <div className="flex-1 space-y-2">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" /> 종료
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start font-medium border-gray-200 bg-gray-50 hover:bg-white hover:border-primary/50 text-left px-3 text-base">
                                        {endTime}
                                        <ChevronDown className="ml-auto h-4 w-4 opacity-30" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="max-h-[200px] overflow-y-auto w-[180px]">
                                    {timeOptions.map((t) => (
                                        <DropdownMenuItem key={`end-${t}`} onSelect={() => setEndTime(t)}>
                                            {t}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Prep & Travel Time (Horizontal Compact) */}
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">준비 (분)</Label>
                            <Input
                                type="number"
                                value={prepTime === 0 ? '' : prepTime}
                                onChange={e => setPrepTime(Number(e.target.value))}
                                placeholder="0"
                                className="bg-gray-50 border-gray-200 focus-visible:ring-primary/20 h-9"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">이동 (분)</Label>
                            <Input
                                type="number"
                                value={travelTime === 0 ? '' : travelTime}
                                onChange={e => setTravelTime(Number(e.target.value))}
                                placeholder="0"
                                className="bg-gray-50 border-gray-200 focus-visible:ring-primary/20 h-9"
                            />
                        </div>
                    </div>

                    {/* Habit Toggle & Repeat Days */}
                    {!event && (
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isHabit"
                                    checked={isHabit}
                                    onCheckedChange={(c) => setIsHabit(c as boolean)}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <Label htmlFor="isHabit" className="text-sm font-bold text-gray-700 flex items-center gap-2 cursor-pointer">
                                    <Repeat className="w-4 h-4 text-primary" />
                                    습관으로 설정하기 (반복)
                                </Label>
                            </div>

                            {isHabit && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-200 pl-6 border-l-2 border-primary/20">
                                    <Label className="text-xs font-bold text-gray-500 mb-2 block">반복 요일 선택</Label>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {WEEKDAYS.map((day, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => toggleDay(idx)}
                                                className={cn(
                                                    "w-8 h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center border",
                                                    repeatDays.includes(idx)
                                                        ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                                                        : "bg-white text-gray-400 border-gray-200 hover:border-blue-600/50 hover:text-blue-600"
                                                )}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-2">
                                        * 체크된 요일에 자동으로 일정이 생성됩니다.
                                    </p>

                                    <div className="mt-4 pt-4 border-t border-primary/20">
                                        <Label className="text-xs font-bold text-gray-500 mb-2 block">하루 목표 횟수</Label>
                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-full"
                                                onClick={() => setTargetCount(Math.max(1, targetCount - 1))}
                                            >
                                                -
                                            </Button>
                                            <span className="text-sm font-bold w-4 text-center">{targetCount}</span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-full"
                                                onClick={() => setTargetCount(targetCount + 1)}
                                            >
                                                +
                                            </Button>
                                            <span className="text-xs text-muted-foreground ml-2">회</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Type & Priority & Flags */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">유형</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between font-medium border-gray-200 bg-white hover:border-blue-600/50 text-xs h-9">
                                        {type === 'work' ? '업무' :
                                            type === 'personal' ? '개인' :
                                                type === 'study' ? '공부' :
                                                    type === 'hobby' ? '취미' : '기타'}
                                        <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[180px]">
                                    <DropdownMenuItem className="text-xs" onSelect={() => setType('work')}>업무</DropdownMenuItem>
                                    <DropdownMenuItem className="text-xs" onSelect={() => setType('personal')}>개인</DropdownMenuItem>
                                    <DropdownMenuItem className="text-xs" onSelect={() => setType('study')}>공부</DropdownMenuItem>
                                    <DropdownMenuItem className="text-xs" onSelect={() => setType('hobby')}>취미</DropdownMenuItem>
                                    <DropdownMenuItem className="text-xs" onSelect={() => setType('health')}>건강</DropdownMenuItem>
                                    <DropdownMenuItem className="text-xs" onSelect={() => setType('other')}>기타</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">우선순위</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between font-medium border-gray-200 bg-white hover:border-blue-600/50 text-xs h-9">
                                        {priority === 'low' ? '낮음' : priority === 'medium' ? '보통' : '높음'}
                                        <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[180px]">
                                    <DropdownMenuItem className="text-xs" onSelect={() => setPriority('low')}>낮음</DropdownMenuItem>
                                    <DropdownMenuItem className="text-xs" onSelect={() => setPriority('medium')}>보통</DropdownMenuItem>
                                    <DropdownMenuItem className="text-xs" onSelect={() => setPriority('high')}>높음</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-blue-200 transition-colors cursor-pointer" onClick={() => setIsMeeting(!isMeeting)}>
                            <Checkbox id="isMeeting" checked={isMeeting} onCheckedChange={(c) => setIsMeeting(c as boolean)} />
                            <Label className="text-sm font-medium flex items-center gap-1.5 cursor-pointer">
                                <Users className="w-3.5 h-3.5 text-blue-500" /> 회의
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-green-200 transition-colors cursor-pointer" onClick={() => setIsAppointment(!isAppointment)}>
                            <Checkbox id="isAppointment" checked={isAppointment} onCheckedChange={(c) => setIsAppointment(c as boolean)} />
                            <Label className="text-sm font-medium flex items-center gap-1.5 cursor-pointer">
                                <Handshake className="w-3.5 h-3.5 text-green-500" /> 약속
                            </Label>
                        </div>
                    </div>

                    {/* Project & Goal Link */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">연결 (선택 사항)</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between font-medium border-gray-200 bg-white hover:border-blue-600/50 text-xs h-9">
                                        <span className="truncate flex items-center gap-2">
                                            <FolderTree className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="truncate max-w-[100px] text-xs">
                                                {projects.find(p => p.id === connectedProjectId)?.title || '프로젝트 없음'}
                                            </span>
                                        </span>
                                        <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[200px] max-h-[200px] overflow-y-auto">
                                    <DropdownMenuItem className="text-xs" onSelect={() => setConnectedProjectId(undefined)}>선택 안 함</DropdownMenuItem>
                                    {projects.map(p => (
                                        <DropdownMenuItem key={p.id} className="text-xs" onSelect={() => setConnectedProjectId(p.id)}>
                                            <div className="flex items-center gap-2 w-full">
                                                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                                                <span className="truncate">{p.title}</span>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between font-medium border-gray-200 bg-white hover:border-blue-600/50 text-xs h-9">
                                        <span className="truncate flex items-center gap-2">
                                            <Trophy className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="truncate max-w-[100px] text-xs">
                                                {goals.find(g => g.id === connectedGoalId)?.title || '목표 없음'}
                                            </span>
                                        </span>
                                        <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[200px] max-h-[200px] overflow-y-auto">
                                    <DropdownMenuItem className="text-xs" onSelect={() => setConnectedGoalId(undefined)}>선택 안 함</DropdownMenuItem>
                                    {goals.map(g => (
                                        <DropdownMenuItem key={g.id} className="text-xs" onSelect={() => setConnectedGoalId(g.id)}>
                                            <span className="truncate">{g.title}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-gray-50 flex items-center justify-between sm:justify-between w-full border-t border-gray-100">
                    {event ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제
                        </Button>
                    ) : <div></div>}

                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-gray-500 hover:text-gray-700">취소</Button>
                        <Button size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-sm">
                            {isHabit ? '습관 등록' : '저장'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}

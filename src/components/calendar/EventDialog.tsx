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
import { useHaptic } from '@/hooks/useHaptic';
import { StickyBottomSubmit } from '@/components/ui/sticky-bottom-submit';

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
    const { triggerSuccess } = useHaptic();
    const { projects, goals, addHabit, habits } = useData();
    const [title, setTitle] = useState('');
    const [type, setType] = useState<EventType>('work');
    const [priority, setPriority] = useState<EventPriority>('medium');
    const [isMeeting, setIsMeeting] = useState(false);
    const [isAppointment, setIsAppointment] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const [connectedProjectId, setConnectedProjectId] = useState<string | undefined>(undefined);
    const [connectedGoalId, setConnectedGoalId] = useState<string | undefined>(undefined);

    const [prepTime, setPrepTime] = useState<number>(0);
    const [travelTime, setTravelTime] = useState<number>(0);

    // Habit States
    const [isHabit, setIsHabit] = useState(false);
    const [repeatDays, setRepeatDays] = useState<number[]>([]);

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

    const [lastEventId, setLastEventId] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setLastEventId(null);
            return;
        }

        if (event) {
            if (event.id !== lastEventId) {
                setLastEventId(event.id);
                setTitle(event.title);
                setType(event.type || 'work');
                setPriority(event.priority || 'medium');
                setIsMeeting(event.isMeeting || false);
                setIsAppointment(event.isAppointment || false);
                setStartTime(format(roundToNearest15(event.start), 'HH:mm'));
                setEndTime(format(roundToNearest15(event.end), 'HH:mm'));
                setConnectedProjectId(event.connectedProjectId);
                setConnectedGoalId(event.connectedGoalId);
                setPrepTime(event.prepTime || 0);
                setTravelTime(event.travelTime || 0);

                setIsHabit(false);
                setRepeatDays([]);
            }
        } else if (initialDate) {
            if (lastEventId !== 'new_entry') {
                setLastEventId('new_entry');

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
                setRepeatDays([start.getDay()]);

                setStartTime(format(start, 'HH:mm'));

                if (initialEndDate) {
                    setEndTime(format(roundToNearest15(initialEndDate), 'HH:mm'));
                } else {
                    const end = new Date(start);
                    end.setMinutes(end.getMinutes() + 30);
                    setEndTime(format(end, 'HH:mm'));
                }
            }
        }
    }, [isOpen, event, initialDate, initialEndDate, lastEventId]);

    const handleSave = async () => {
        if (!title.trim()) return;
        setIsLoading(true);
        triggerSuccess();

        try {
            if (isHabit) {
                addHabit({
                    id: generateId(),
                    title,
                    streak: 0,
                    completedDates: [],
                    time: startTime,
                    endTime: endTime,
                    days: repeatDays,
                    startDate: new Date(),
                    type,
                    priority,
                    isMeeting,
                    isAppointment,
                    connectedProjectId,
                    connectedGoalId,
                    prepTime: prepTime > 0 ? prepTime : undefined,
                    travelTime: travelTime > 0 ? travelTime : undefined,
                    color: event?.color
                });
            } else {
                const baseDate = event ? event.start : (initialDate || new Date());
                const [startHour, startMin] = startTime.split(':').map(Number);
                const [endHour, endMin] = endTime.split(':').map(Number);

                const newStart = new Date(baseDate);
                newStart.setHours(startHour, startMin, 0, 0);

                const newEnd = new Date(baseDate);
                newEnd.setHours(endHour, endMin, 0, 0);

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
            }
            onOpenChange(false);
        } finally {
            setIsLoading(false);
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
            <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden bg-modal border border-border shadow-2xl rounded-2xl flex flex-col max-h-[90vh] text-foreground">
                <DialogHeader className="px-6 py-5 border-b border-white/8 flex flex-row items-center justify-between shrink-0">
                    <div>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                            {event ? '일정 수정' : '새 일정 등록'}
                        </DialogTitle>
                    </div>
                    <div className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-bold",
                        priority === 'high' ? "bg-red-500/15 text-red-400" :
                            priority === 'medium' ? "bg-blue-500/15 text-blue-400" : "bg-muted text-muted-foreground"
                    )}>
                        {priority === 'high' ? '높음' : priority === 'medium' ? '보통' : '낮음'}
                    </div>
                </DialogHeader>

                <div className="px-6 py-5 space-y-6 overflow-y-auto custom-scrollbar flex-1" onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                }}>
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5" /> 제목
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="일정 제목을 입력하세요"
                            className="text-lg font-bold border-0 border-b-2 border-border bg-transparent rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-primary placeholder:font-medium placeholder:text-gray-300 transition-colors"
                            autoFocus
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" /> 시작
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start font-medium border-border bg-muted hover:bg-card hover:border-primary/50 text-left px-3 text-base h-11">
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
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" /> 종료
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start font-medium border-border bg-muted hover:bg-card hover:border-primary/50 text-left px-3 text-base h-11">
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

                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="prepTime" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">준비 (분)</Label>
                            <Input
                                id="prepTime"
                                type="number"
                                value={prepTime === 0 ? '' : prepTime}
                                onChange={e => setPrepTime(Number(e.target.value))}
                                placeholder="0"
                                className="bg-muted border-border focus-visible:ring-primary/20 h-11"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="travelTime" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">이동 (분)</Label>
                            <Input
                                id="travelTime"
                                type="number"
                                value={travelTime === 0 ? '' : travelTime}
                                onChange={e => setTravelTime(Number(e.target.value))}
                                placeholder="0"
                                className="bg-muted border-border focus-visible:ring-primary/20 h-11"
                            />
                        </div>
                    </div>

                    {!event && (
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isHabit"
                                    checked={isHabit}
                                    onCheckedChange={(c) => setIsHabit(c as boolean)}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <Label htmlFor="isHabit" className="text-sm font-bold text-foreground flex items-center gap-2 cursor-pointer">
                                    <Repeat className="w-4 h-4 text-primary" />
                                    해빗으로 설정하기 (반복)
                                </Label>
                            </div>

                            {isHabit && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-200 pl-6 border-l-2 border-primary/20">
                                    <Label className="text-xs font-bold text-muted-foreground mb-2 block">반복 요일 선택</Label>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {WEEKDAYS.map((day, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => toggleDay(idx)}
                                                className={cn(
                                                    "w-9 h-9 rounded-full text-sm font-bold transition-all flex items-center justify-center border",
                                                    repeatDays.includes(idx)
                                                        ? "bg-primary text-white border-blue-600 shadow-md scale-105"
                                                        : "bg-card text-muted-foreground border-border hover:border-blue-600/50 hover:text-blue-600"
                                                )}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">유형</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between font-medium border-border bg-card hover:border-blue-600/50 text-sm h-11">
                                        {type === 'work' ? '업무' :
                                            type === 'personal' ? '개인' :
                                                type === 'study' ? '공부' :
                                                    type === 'hobby' ? '취미' : '기타'}
                                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[180px]">
                                    <DropdownMenuItem onSelect={() => setType('work')}>업무</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setType('personal')}>개인</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setType('study')}>공부</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setType('hobby')}>취미</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setType('health')}>건강</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setType('other')}>기타</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">우선순위</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between font-medium border-border bg-card hover:border-blue-600/50 text-sm h-11">
                                        {priority === 'low' ? '낮음' : priority === 'medium' ? '보통' : '높음'}
                                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
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

                    <div className="flex gap-4 pt-2">
                        <div className="flex items-center space-x-2 bg-muted px-4 py-2 rounded-lg border border-transparent hover:border-blue-200 transition-colors cursor-pointer" onClick={() => setIsMeeting(!isMeeting)}>
                            <Checkbox id="isMeeting" checked={isMeeting} onCheckedChange={(c) => setIsMeeting(c as boolean)} />
                            <Label htmlFor="isMeeting" className="text-sm font-medium flex items-center gap-1.5 cursor-pointer">
                                <Users className="w-4 h-4 text-blue-500" /> 회의
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2 bg-muted px-4 py-2 rounded-lg border border-transparent hover:border-green-200 transition-colors cursor-pointer" onClick={() => setIsAppointment(!isAppointment)}>
                            <Checkbox id="isAppointment" checked={isAppointment} onCheckedChange={(c) => setIsAppointment(c as boolean)} />
                            <Label htmlFor="isAppointment" className="text-sm font-medium flex items-center gap-1.5 cursor-pointer">
                                <Handshake className="w-4 h-4 text-green-500" /> 약속
                            </Label>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">연결 (선택 사항)</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between font-medium border-border bg-card hover:border-blue-600/50 text-xs h-11">
                                        <span className="truncate flex items-center gap-2">
                                            <FolderTree className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span className="truncate max-w-[100px]">
                                                {projects.find(p => p.id === connectedProjectId)?.title || '프로젝트 없음'}
                                            </span>
                                        </span>
                                        <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[200px] max-h-[200px] overflow-y-auto">
                                    <DropdownMenuItem onSelect={() => setConnectedProjectId(undefined)}>선택 해제</DropdownMenuItem>
                                    {projects.map(p => (
                                        <DropdownMenuItem key={p.id} onSelect={() => setConnectedProjectId(p.id)}>
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
                                    <Button variant="outline" className="w-full justify-between font-medium border-border bg-card hover:border-blue-600/50 text-xs h-11">
                                        <span className="truncate flex items-center gap-2">
                                            <Trophy className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span className="truncate max-w-[100px]">
                                                {goals.find(g => g.id === connectedGoalId)?.title || '목표 없음'}
                                            </span>
                                        </span>
                                        <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[200px] max-h-[200px] overflow-y-auto">
                                    <DropdownMenuItem onSelect={() => setConnectedGoalId(undefined)}>선택 해제</DropdownMenuItem>
                                    {goals.map(g => (
                                        <DropdownMenuItem key={g.id} onSelect={() => setConnectedGoalId(g.id)}>
                                            <span className="truncate">{g.title}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                <StickyBottomSubmit
                    onSubmit={handleSave}
                    isLoading={isLoading}
                    label={event ? '수정' : '저장'}
                >
                    {event && (
                        <Button
                            variant="ghost"
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="mr-auto text-red-500 hover:text-red-400 hover:bg-red-500/10 h-12 px-6"
                        >
                            <Trash2 className="w-5 h-5 mr-2" />
                            삭제
                        </Button>
                    )}
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading} className="h-12 px-6">
                        취소
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading} className="h-12 px-8 min-w-[100px]">
                        {isLoading ? '저장 중...' : (event ? '수정' : '저장')}
                    </Button>
                </StickyBottomSubmit>
            </DialogContent>
        </Dialog >
    );
}

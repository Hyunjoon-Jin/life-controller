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
import { Trash2, Clock, Calendar as CalendarIcon, Tag, AlertCircle, Users, ChevronDown, Handshake, FolderTree, Trophy } from 'lucide-react';
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

export function EventDialog({ isOpen, onOpenChange, event, initialDate, initialEndDate, onSave, onDelete }: EventDialogProps) {
    const { projects, goals } = useData();
    const [title, setTitle] = useState('');
    const [type, setType] = useState<EventType>('work');
    const [priority, setPriority] = useState<EventPriority>('medium');
    const [isMeeting, setIsMeeting] = useState(false);
    const [isAppointment, setIsAppointment] = useState(false);

    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const [connectedProjectId, setConnectedProjectId] = useState<string | undefined>(undefined);
    const [connectedGoalId, setConnectedGoalId] = useState<string | undefined>(undefined);

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
            setStartTime(format(roundToNearest15(event.start), 'H:mm'));
            setEndTime(format(roundToNearest15(event.end), 'H:mm'));
            setConnectedProjectId(event.connectedProjectId);
            setConnectedGoalId(event.connectedGoalId);
        } else if (isOpen && initialDate) {
            // Reset for new event
            setTitle('');
            setType('work');
            setPriority('medium');
            setIsMeeting(false);
            setIsAppointment(false);
            setConnectedProjectId(undefined);
            setConnectedGoalId(undefined);

            const start = roundToNearest15(initialDate);
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
            connectedGoalId
        };

        onSave(updatedEvent);
        onOpenChange(false);
    };

    const handleDelete = () => {
        if (event && onDelete) {
            onDelete(event.id);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-card border-border shadow-2xl">
                <DialogHeader className="px-6 pt-6 pb-2">
                    <DialogTitle className="text-xl font-extrabold flex items-center gap-2 tracking-tight">
                        {event ? '일정 수정' : '새 일정'}
                    </DialogTitle>
                </DialogHeader>

                <div className="px-6 py-4 space-y-5" onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                }}>
                    {/* Title Input */}
                    <div className="space-y-1">
                        <Label htmlFor="title" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">제목</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="어떤 일인가요?"
                            className="text-lg font-bold border-0 border-b border-border rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-primary placeholder:font-medium placeholder:text-muted-foreground/50"
                            autoFocus
                        />
                    </div>

                    {/* Time Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <Clock className="w-3 h-3" /> 시작
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between font-medium border-input bg-transparent shadow-sm hover:bg-muted/50 focus:ring-1 focus:ring-ring">
                                        {startTime}
                                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
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
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <Clock className="w-3 h-3" /> 종료
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between font-medium border-input bg-transparent shadow-sm hover:bg-muted/50 focus:ring-1 focus:ring-ring">
                                        {endTime}
                                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
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

                    {/* Type & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <Tag className="w-3 h-3" /> 유형
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between font-medium border-input bg-transparent shadow-sm hover:bg-muted/50 focus:ring-1 focus:ring-ring capitalize">
                                        {type === 'work' ? '업무' :
                                            type === 'personal' ? '개인' :
                                                type === 'study' ? '공부' :
                                                    type === 'hobby' ? '취미' :
                                                        type === 'health' ? '건강' :
                                                            type === 'finance' ? '재테크' :
                                                                type === 'social' ? '사교' :
                                                                    type === 'travel' ? '여행' :
                                                                        type === 'meal' ? '식사' : '기타'}
                                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
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
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> 우선순위
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between font-medium border-input bg-transparent shadow-sm hover:bg-muted/50 focus:ring-1 focus:ring-ring capitalize">
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

                    {/* Meeting & Appointment Toggle */}
                    <div className="flex items-center gap-6 pt-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isMeeting"
                                checked={isMeeting}
                                onCheckedChange={(checked) => setIsMeeting(checked as boolean)}
                            />
                            <Label htmlFor="isMeeting" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span>회의</span>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isAppointment"
                                checked={isAppointment}
                                onCheckedChange={(checked) => setIsAppointment(checked as boolean)}
                            />
                            <Label htmlFor="isAppointment" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                                <Handshake className="w-4 h-4 text-muted-foreground" />
                                <span>약속</span>
                            </Label>
                        </div>
                    </div>

                    {/* Link Section */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <FolderTree className="w-3 h-3" /> 프로젝트 연동
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between font-medium border-input bg-transparent shadow-sm hover:bg-muted/50 focus:ring-1 focus:ring-ring text-xs h-9">
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
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <Trophy className="w-3 h-3" /> 목표 연동
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between font-medium border-input bg-transparent shadow-sm hover:bg-muted/50 focus:ring-1 focus:ring-ring text-xs h-9">
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
                </div>

                <DialogFooter className="px-6 py-4 bg-muted/20 flex items-center justify-between sm:justify-between w-full">
                    {event ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제
                        </Button>
                    ) : <div></div>}

                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>취소</Button>
                        <Button size="sm" onClick={handleSave}>저장</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

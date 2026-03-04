'use client';

import { useState, useEffect, useRef } from 'react';
import { useData } from '@/context/DataProvider';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Clock, Plus, Save, Play, Pause, RotateCcw, CheckSquare,
    FileText, Sparkles, Loader2, X, Trash2, ChevronDown, ListTodo
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { summarizeMeeting } from '@/lib/gemini';
import { generateId } from '@/lib/utils';
import { toast } from 'sonner';

interface AgendaItem {
    id: string;
    text: string;
    done: boolean;
}

export function MeetingMode({ project: initialProject, onClose }: { project?: Project; onClose: () => void }) {
    const { addTask, projects } = useData();
    const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProject?.id || '');
    const project = projects.find(p => p.id === selectedProjectId) || initialProject;

    const [isSummarizing, setIsSummarizing] = useState(false);
    const [saved, setSaved] = useState(false);

    // Timer
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(true);

    // Agenda
    const [agendas, setAgendas] = useState<AgendaItem[]>([]);
    const [newAgenda, setNewAgenda] = useState('');
    const agendaInputRef = useRef<HTMLInputElement>(null);

    // Minutes
    const [minutes, setMinutes] = useState('');

    // Action Items
    const [quickActions, setQuickActions] = useState<string[]>([]);
    const [newAction, setNewAction] = useState('');
    const actionInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive) {
            interval = setInterval(() => setSeconds(s => s + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const formatTime = (total: number) => {
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAddAgenda = () => {
        if (!newAgenda.trim()) return;
        setAgendas(prev => [...prev, { id: generateId(), text: newAgenda.trim(), done: false }]);
        setNewAgenda('');
        agendaInputRef.current?.focus();
    };

    const handleAddAction = () => {
        if (!newAction.trim()) return;
        setQuickActions(prev => [...prev, newAction.trim()]);
        setNewAction('');
        actionInputRef.current?.focus();
    };

    const toggleAgenda = (id: string) => {
        setAgendas(prev => prev.map(a => a.id === id ? { ...a, done: !a.done } : a));
    };

    const removeAction = (idx: number) => {
        setQuickActions(prev => prev.filter((_, i) => i !== idx));
    };

    const handleAISummary = async () => {
        if (!minutes.trim()) return;
        setIsSummarizing(true);
        try {
            const result = await summarizeMeeting(minutes);
            if (result) {
                setMinutes(`# [AI 요약]\n${result.summary}\n\n---\n\n${minutes}`);
                if (result.actionItems?.length > 0) {
                    setQuickActions(prev => [...prev, ...result.actionItems]);
                }
            }
        } catch {
            toast.error('AI 요약에 실패했습니다.');
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleSaveMeeting = () => {
        setIsActive(false);
        quickActions.forEach(title => {
            addTask({
                id: generateId(),
                title,
                completed: false,
                projectId: project?.id || '',
                priority: 'medium',
                dueDate: new Date(),
                source: 'timeline'
            });
        });
        setSaved(true);
        toast.success(`회의 종료 — ${formatTime(seconds)} 진행, 액션 아이템 ${quickActions.length}개 등록됨`);
        setTimeout(() => onClose(), 800);
    };

    const doneCount = agendas.filter(a => a.done).length;

    return (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col">
            {/* ── Header ── */}
            <div className="h-14 border-b border-border flex items-center justify-between px-5 bg-card shrink-0">
                <div className="flex items-center gap-4">
                    {/* Timer */}
                    <div className="flex items-center gap-2.5 bg-muted rounded-lg px-4 py-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-xl font-bold tabular-nums tracking-tight text-foreground">
                            {formatTime(seconds)}
                        </span>
                        <div className="flex items-center gap-1 ml-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsActive(v => !v)}>
                                {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSeconds(0); setIsActive(true); }}>
                                <RotateCcw className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                        {isActive && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                    </div>

                    <Separator orientation="vertical" className="h-6" />

                    {/* Project */}
                    {!initialProject ? (
                        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                            <SelectTrigger className="h-9 w-52 text-sm border-0 bg-transparent shadow-none focus:ring-0 text-muted-foreground">
                                <SelectValue placeholder="프로젝트 연결 (선택)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">프로젝트 없음</SelectItem>
                                {projects.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <span className="text-sm font-semibold text-foreground">{project?.title}</span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
                        <X className="w-4 h-4 mr-1.5" /> 취소
                    </Button>
                    <Button onClick={handleSaveMeeting} disabled={saved}>
                        <Save className="w-4 h-4 mr-1.5" />
                        회의 종료
                    </Button>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left panel */}
                <div className="w-80 border-r border-border flex flex-col shrink-0 bg-card/50">
                    {/* Agenda */}
                    <div className="flex-1 flex flex-col min-h-0 border-b border-border">
                        <div className="flex items-center justify-between px-5 py-4 shrink-0">
                            <div className="flex items-center gap-2">
                                <CheckSquare className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-semibold">아젠다</span>
                            </div>
                            {agendas.length > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                    {doneCount}/{agendas.length}
                                </Badge>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-2">
                            {agendas.length === 0 && (
                                <p className="text-xs text-muted-foreground py-4 text-center">아젠다를 추가하세요</p>
                            )}
                            {agendas.map(item => (
                                <div key={item.id} className="flex items-start gap-3 group py-1">
                                    <Checkbox
                                        id={item.id}
                                        checked={item.done}
                                        onCheckedChange={() => toggleAgenda(item.id)}
                                        className="mt-0.5"
                                    />
                                    <label
                                        htmlFor={item.id}
                                        className={cn(
                                            "text-sm cursor-pointer flex-1 leading-snug",
                                            item.done && "line-through text-muted-foreground"
                                        )}
                                    >
                                        {item.text}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 px-5 pb-4 shrink-0">
                            <Input
                                ref={agendaInputRef}
                                placeholder="아젠다 추가..."
                                value={newAgenda}
                                onChange={e => setNewAgenda(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddAgenda()}
                                className="h-8 text-sm"
                            />
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 shrink-0" onClick={handleAddAgenda}>
                                <Plus className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>

                    {/* Action Items */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between px-5 py-4 shrink-0">
                            <div className="flex items-center gap-2">
                                <ListTodo className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-semibold">액션 아이템</span>
                            </div>
                            {quickActions.length > 0 && (
                                <Badge variant="secondary" className="text-xs">{quickActions.length}</Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground px-5 pb-3 -mt-1 shrink-0">종료 시 할 일로 자동 등록</p>
                        <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-2">
                            {quickActions.length === 0 && (
                                <p className="text-xs text-muted-foreground py-2 text-center">아직 없습니다</p>
                            )}
                            {quickActions.map((action, i) => (
                                <div key={i} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 group">
                                    <span className="flex-1 text-sm leading-snug">{action}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeAction(i)}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 px-5 pb-5 shrink-0">
                            <Input
                                ref={actionInputRef}
                                placeholder="할 일 추가..."
                                value={newAction}
                                onChange={e => setNewAction(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddAction()}
                                className="h-8 text-sm"
                            />
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 shrink-0" onClick={handleAddAction}>
                                <Plus className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right: Minutes */}
                <div className="flex-1 flex flex-col bg-background min-w-0">
                    <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-semibold">회의록</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!minutes.trim() || isSummarizing}
                            onClick={handleAISummary}
                            className="h-8 text-xs gap-1.5"
                        >
                            {isSummarizing
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Sparkles className="w-3.5 h-3.5" />}
                            AI 요약
                        </Button>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto">
                        <Textarea
                            placeholder={`# 회의 제목\n\n주요 내용 및 결정 사항을 자유롭게 기록하세요...\n\n## 논의 사항\n\n## 결정 사항\n\n## 다음 단계`}
                            className="w-full min-h-full resize-none bg-transparent border-none focus-visible:ring-0 text-base leading-relaxed p-0 placeholder:text-muted-foreground/40 font-mono"
                            value={minutes}
                            onChange={e => setMinutes(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

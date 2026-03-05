'use client';

import { useState, useEffect, useRef } from 'react';
import { useData } from '@/context/DataProvider';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    Clock, Plus, Save, Play, Pause, RotateCcw, CheckSquare,
    FileText, Sparkles, Loader2, X, Trash2, ListTodo, Radio
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
    const progressPct = agendas.length > 0 ? Math.round((doneCount / agendas.length) * 100) : 0;

    return (
        <div className="fixed inset-0 z-[200] flex flex-col" style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}>
            {/* ── Header ── */}
            <div className="h-16 flex items-center justify-between px-6 shrink-0 border-b" style={{ background: 'rgba(15,15,20,0.95)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="flex items-center gap-4">
                    {/* Live indicator + Timer */}
                    <div className="flex items-center gap-2.5 rounded-xl px-4 py-2.5" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                        <Radio className="w-4 h-4 text-red-400" />
                        <span className="font-mono text-xl font-bold tabular-nums tracking-tight text-white">
                            {formatTime(seconds)}
                        </span>
                        <div className="flex items-center gap-1 ml-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-300 hover:text-white hover:bg-red-500/20"
                                onClick={() => setIsActive(v => !v)}
                            >
                                {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-300 hover:text-white hover:bg-red-500/20"
                                onClick={() => { setSeconds(0); setIsActive(true); }}
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                        {isActive && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-1" />}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-6 bg-white/10" />

                    {/* Project selector */}
                    {!initialProject ? (
                        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                            <SelectTrigger className="h-9 w-52 text-sm border-0 bg-white/5 text-gray-300 focus:ring-0 focus:ring-offset-0">
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
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project?.color || '#6b7280' }} />
                            <span className="text-sm font-semibold text-white">{project?.title}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white hover:bg-white/10"
                    >
                        <X className="w-4 h-4 mr-1.5" /> 취소
                    </Button>
                    <Button
                        onClick={handleSaveMeeting}
                        disabled={saved}
                        className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                    >
                        <Save className="w-4 h-4 mr-1.5" />
                        회의 종료
                    </Button>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left panel */}
                <div className="w-80 flex flex-col shrink-0" style={{ background: 'rgba(20,20,28,0.9)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                    {/* Agenda Section */}
                    <div className="flex-1 flex flex-col min-h-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="flex items-center justify-between px-5 py-4 shrink-0">
                            <div className="flex items-center gap-2">
                                <CheckSquare className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-semibold text-white">아젠다</span>
                            </div>
                            {agendas.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-blue-500 transition-all duration-300"
                                            style={{ width: `${progressPct}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-400">{doneCount}/{agendas.length}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-1.5">
                            {agendas.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <CheckSquare className="w-8 h-8 text-white/10 mb-2" />
                                    <p className="text-xs text-gray-500">아젠다를 추가하세요</p>
                                </div>
                            ) : (
                                agendas.map(item => (
                                    <div
                                        key={item.id}
                                        className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5 group"
                                    >
                                        <Checkbox
                                            id={item.id}
                                            checked={item.done}
                                            onCheckedChange={() => toggleAgenda(item.id)}
                                            className="mt-0.5 border-gray-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                        />
                                        <label
                                            htmlFor={item.id}
                                            className={cn(
                                                "text-sm cursor-pointer flex-1 leading-snug",
                                                item.done ? "line-through text-gray-600" : "text-gray-200"
                                            )}
                                        >
                                            {item.text}
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex gap-2 px-5 pb-4 shrink-0">
                            <Input
                                ref={agendaInputRef}
                                placeholder="아젠다 추가..."
                                value={newAgenda}
                                onChange={e => setNewAgenda(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddAgenda()}
                                className="h-8 text-sm bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-blue-500/50"
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 shrink-0 bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                                onClick={handleAddAgenda}
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>

                    {/* Action Items Section */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between px-5 py-4 shrink-0">
                            <div className="flex items-center gap-2">
                                <ListTodo className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm font-semibold text-white">액션 아이템</span>
                            </div>
                            {quickActions.length > 0 && (
                                <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                    {quickActions.length}
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 px-5 pb-3 -mt-1 shrink-0">종료 시 할 일로 자동 등록됩니다</p>

                        <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-2">
                            {quickActions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <ListTodo className="w-7 h-7 text-white/10 mb-2" />
                                    <p className="text-xs text-gray-500">아직 없습니다</p>
                                </div>
                            ) : (
                                quickActions.map((action, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 rounded-lg px-3 py-2 group"
                                        style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
                                    >
                                        <span className="flex-1 text-sm text-gray-200 leading-snug">{action}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                                            onClick={() => removeAction(i)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex gap-2 px-5 pb-5 shrink-0">
                            <Input
                                ref={actionInputRef}
                                placeholder="할 일 추가..."
                                value={newAction}
                                onChange={e => setNewAction(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddAction()}
                                className="h-8 text-sm bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-emerald-500/50"
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 shrink-0 bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                                onClick={handleAddAction}
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right: Minutes */}
                <div className="flex-1 flex flex-col min-w-0" style={{ background: 'rgba(12,12,18,0.95)' }}>
                    <div className="flex items-center justify-between px-6 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-orange-400" />
                            <span className="text-sm font-semibold text-white">회의록</span>
                            <span className="text-xs text-gray-500">자유롭게 기록하세요</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!minutes.trim() || isSummarizing}
                            onClick={handleAISummary}
                            className="h-8 text-xs gap-1.5 bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 disabled:opacity-40"
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
                            className="w-full min-h-[calc(100vh-200px)] resize-none border-none bg-transparent text-base leading-relaxed p-0 text-gray-100 placeholder:text-gray-700 font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
                            value={minutes}
                            onChange={e => setMinutes(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

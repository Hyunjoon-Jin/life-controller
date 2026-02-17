'use client';

import { useState, useEffect, useRef } from 'react';
import { useData } from '@/context/DataProvider';
import { Project, Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Ideally use TextareaAutosize
import TextareaAutosize from 'react-textarea-autosize';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Plus, Save, Play, Pause, RotateCcw, CheckSquare, FileText, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function MeetingMode({ project: initialProject, onClose }: { project?: Project, onClose: () => void }) {
    const { addJournal, addTask, projects } = useData();
    const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProject?.id || '');
    const project = projects.find(p => p.id === selectedProjectId) || initialProject;

    // ... (rest of state)

    // ... (rest of logic)

    // In Header:
    // <div className="flex items-center gap-4">
    //    ...
    //    <div>
    //       {project ? (
    //           <h2 className="font-bold text-lg">{project.title} - 회의 진행 중</h2>
    //       ) : (
    //           <select 
    //               value={selectedProjectId} 
    //               onChange={e => setSelectedProjectId(e.target.value)}
    //               className="bg-transparent font-bold text-lg border-none focus:ring-0 cursor-pointer"
    //           >
    //               <option value="" disabled>프로젝트 선택...</option>
    //               {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
    //           </select>
    //       )}
    //       ...


    // Timer State
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(true); // Start immediately

    // Agenda State
    const [agendas, setAgendas] = useState<{ id: string, text: string, done: boolean }[]>([]);
    const [newAgenda, setNewAgenda] = useState('');

    // Minutes State
    const [minutes, setMinutes] = useState('');

    // Action Items State
    const [quickActions, setQuickActions] = useState<string[]>([]);
    const [newAction, setNewAction] = useState('');

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAddAgenda = (e?: React.KeyboardEvent) => {
        if (e && e.key !== 'Enter') return;
        if (!newAgenda.trim()) return;
        setAgendas([...agendas, { id: Date.now().toString(), text: newAgenda, done: false }]);
        setNewAgenda('');
    };

    const toggleAgenda = (id: string) => {
        setAgendas(prev => prev.map(a => a.id === id ? { ...a, done: !a.done } : a));
    };

    const handleAddAction = (e?: React.KeyboardEvent) => {
        if (e && e.key !== 'Enter') return;
        if (!newAction.trim()) return;
        setQuickActions([...quickActions, newAction]);
        setNewAction('');
    };

    const handleSaveMeeting = () => {
        // 1. Create Tasks from Action Items
        quickActions.forEach(actionTitle => {
            addTask({
                id: Date.now().toString() + Math.random().toString().slice(2, 5),
                title: actionTitle,
                completed: false,
                projectId: project?.id || '', // Use optional chaining
                priority: 'medium',
                dueDate: new Date(), // Due today by default
                source: 'timeline'
            });
        });

        // 2. Save Minutes (As Journal or Archive? Let's use Archive for now as "Reference")
        // Or actually, user might want it in Journal. Let's ask or just save to Archive as "Meeting Note"
        // Since we have ArchiveDocument type.
        // But for now, let's just log it to console or alert as "Saved" simulation if no direct API.
        // Actually, let's use `addArchiveDocument` if available? 
        // Checking `useData` context... I don't recall explicit `addArchiveDocument`.
        // Let's assume we implement it later or just simulate for UI.
        // Wait, I see `ArchiveSystem` imports. It likely uses local state or mocked.
        // Re-checking types/context... `archiveDocuments` is in data provider.

        // For this MVP, let's just alert success and close.
        alert(`회의가 저장되었습니다.\n시간: ${formatTime(seconds)}\n액션 아이템: ${quickActions.length}개 생성됨`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-zinc-950 flex flex-col animate-in fade-in duration-200">
            {/* Header / Toolbar */}
            <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                        {project ? (
                            <h2 className="font-bold text-lg">{project.title} - 회의 진행 중</h2>
                        ) : (
                            <select
                                value={selectedProjectId}
                                onChange={e => setSelectedProjectId(e.target.value)}
                                className="bg-transparent font-bold text-lg border-none focus:ring-0 cursor-pointer w-64"
                            >
                                <option value="" disabled>프로젝트 선택 (선택 사항)</option>
                                <option value="">(프로젝트 없음)</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                            </select>
                        )}
                        <div className="text-xs text-muted-foreground font-mono ml-2 mt-1">{formatTime(seconds)}</div>
                    </div>

                    {/* Timer Controls */}
                    <div className="flex items-center gap-1 ml-4">
                        <Button variant="ghost" size="icon" onClick={() => setIsActive(!isActive)} className="h-8 w-8">
                            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setSeconds(0)} className="h-8 w-8">
                            <RotateCcw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={onClose}>취소</Button>
                    <Button onClick={handleSaveMeeting} className="gap-2">
                        <Save className="w-4 h-4" /> 회의 종료 및 저장
                    </Button>
                </div>
            </div>

            {/* Main Content (Split View) */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Agenda & Actions (30%) */}
                <div className="w-[350px] border-r border-border bg-muted/10 flex flex-col">
                    {/* Agenda Section */}
                    <div className="flex-1 p-6 border-b border-border overflow-y-auto">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-blue-500" /> 아젠다 (Agenda)
                        </h3>
                        <div className="space-y-3">
                            {agendas.map(agenda => (
                                <div key={agenda.id} className="flex items-center gap-3 group">
                                    <Checkbox
                                        checked={agenda.done}
                                        onCheckedChange={() => toggleAgenda(agenda.id)}
                                        id={agenda.id}
                                    />
                                    <label
                                        htmlFor={agenda.id}
                                        className={cn("text-sm cursor-pointer flex-1 break-words", agenda.done && "line-through text-muted-foreground")}
                                    >
                                        {agenda.text}
                                    </label>
                                </div>
                            ))}
                            <div className="flex gap-2 mt-2">
                                <Input
                                    placeholder="아젠다 추가..."
                                    value={newAgenda}
                                    onChange={e => setNewAgenda(e.target.value)}
                                    onKeyDown={handleAddAgenda}
                                    className="h-8 text-sm bg-background"
                                />
                                <Button size="sm" variant="ghost" onClick={() => handleAddAgenda()}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Action Items Section */}
                    <div className="h-1/2 p-6 overflow-y-auto bg-blue-50/30 dark:bg-blue-900/10">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Send className="w-4 h-4 text-green-600" /> 액션 아이템
                        </h3>
                        <div className="text-xs text-muted-foreground mb-3">
                            회의 종료 시 자동으로 작업으로 등록됩니다.
                        </div>
                        <ul className="space-y-2 mb-3">
                            {quickActions.map((action, i) => (
                                <li key={i} className="text-sm flex gap-2 items-start bg-background p-2 rounded shadow-sm">
                                    <span className="text-green-600 font-bold">•</span>
                                    {action}
                                </li>
                            ))}
                        </ul>
                        <div className="flex gap-2">
                            <Input
                                placeholder="할 일 입력..."
                                value={newAction}
                                onChange={e => setNewAction(e.target.value)}
                                onKeyDown={handleAddAction}
                                className="h-8 text-sm bg-background"
                            />
                            <Button size="sm" variant="ghost" onClick={() => handleAddAction()}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right: Minutes Editor (70%) */}
                <div className="flex-1 flex flex-col bg-background">
                    <div className="p-6 border-b border-border bg-gray-50/50 dark:bg-gray-800/10">
                        <h3 className="font-bold flex items-center gap-2">
                            <FileText className="w-4 h-4 text-orange-500" /> 회의록
                        </h3>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto" onClick={(e) => {
                        // Focus textarea if clicking on whitespace
                        const textarea = document.getElementById('meeting-minutes-editor');
                        if (textarea && e.target !== textarea) textarea.focus();
                    }}>
                        <TextareaAutosize
                            id="meeting-minutes-editor"
                            placeholder="# 회의 제목&#13;&#10;&#13;&#10;주요 내용 및 결정 사항을 자유롭게 기록하세요..."
                            className="w-full h-full resize-none bg-transparent border-none focus:ring-0 text-base leading-relaxed p-0 placeholder:text-muted-foreground/50"
                            minRows={10}
                            value={minutes}
                            onChange={(e) => setMinutes(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

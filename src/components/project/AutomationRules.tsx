"use client"

import { useState } from 'react';
import { Project, AutomationRule } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useData } from '@/context/DataProvider';
import { Zap, Plus, Trash2, Play, ToggleLeft, ToggleRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AutomationRulesProps {
    project: Project;
}

const TRIGGERS = [
    { id: 'task_completed', label: '작업이 완료되었을 때' },
    { id: 'task_created', label: '새 작업이 생성되었을 때' },
    { id: 'due_date_passed', label: '마감일이 지났을 때' },
];

const ACTIONS = [
    { id: 'archive_task', label: '작업을 아카이브로 이동' },
    { id: 'set_priority_high', label: '우선순위를 높음으로 변경' },
    { id: 'schedule_review', label: '검토 작업 자동 생성' },
];

export function AutomationRules({ project }: AutomationRulesProps) {
    const { updateProject } = useData();
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [trigger, setTrigger] = useState('');
    const [action, setAction] = useState('');

    const handleAddRule = () => {
        if (!name.trim() || !trigger || !action) return;

        const newRule: AutomationRule = {
            id: Date.now().toString(),
            name,
            trigger,
            action,
            isActive: true
        };

        const updatedProject = {
            ...project,
            automationRules: [...(project.automationRules || []), newRule]
        };

        updateProject(updatedProject);

        // Reset
        setName('');
        setTrigger('');
        setAction('');
        setIsAddOpen(false);
    };

    const handleDeleteRule = (id: string) => {
        if (!confirm('규칙을 삭제하시겠습니까?')) return;
        const updatedProject = {
            ...project,
            automationRules: (project.automationRules || []).filter(r => r.id !== id)
        };
        updateProject(updatedProject);
    };

    const toggleRule = (id: string) => {
        const updatedRules = (project.automationRules || []).map(r =>
            r.id === id ? { ...r, isActive: !r.isActive } : r
        );
        updateProject({ ...project, automationRules: updatedRules });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Zap className="w-6 h-6 text-yellow-500" /> 자동화 규칙 (Automation)
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        반복되는 작업을 자동화하여 효율을 높이세요.
                    </p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="gap-2 bg-yellow-400 text-black hover:bg-yellow-500">
                    <Plus className="w-4 h-4" /> 규칙 만들기
                </Button>
            </div>

            <div className="grid gap-4">
                {(project.automationRules || []).length === 0 ? (
                    <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
                        <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <h3 className="font-semibold text-lg text-muted-foreground">자동화 규칙이 없습니다</h3>
                        <p className="text-sm text-gray-500 mb-4">"완료된 작업을 자동으로 정리" 같은 규칙을 만들어보세요.</p>
                        <Button variant="outline" onClick={() => setIsAddOpen(true)}>규칙 추가하기</Button>
                    </div>
                ) : (
                    (project.automationRules || []).map(rule => (
                        <div key={rule.id} className={cn(
                            "group bg-white dark:bg-zinc-900 p-4 rounded-xl border border-border shadow-sm flex items-center justify-between transition-colors",
                            !rule.isActive && "opacity-60 bg-muted/10 grayscale"
                        )}>
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-3 rounded-full flex items-center justify-center",
                                    rule.isActive ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30" : "bg-muted"
                                )}>
                                    <Play className="w-5 h-5 fill-current" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{rule.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                        <span className="bg-muted px-2 py-0.5 rounded text-xs border">
                                            {TRIGGERS.find(t => t.id === rule.trigger)?.label || rule.trigger}
                                        </span>
                                        <ArrowRight className="w-3 h-3" />
                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs border border-primary/20">
                                            {ACTIONS.find(a => a.id === rule.action)?.label || rule.action}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button onClick={() => toggleRule(rule.id)} className="text-muted-foreground hover:text-primary transition-colors">
                                    {rule.isActive ? <ToggleRight className="w-10 h-10 text-green-500" /> : <ToggleLeft className="w-10 h-10" />}
                                </button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-red-500 transition-colors"
                                    onClick={() => handleDeleteRule(rule.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Rule Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>새 자동화 규칙</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>규칙 이름</Label>
                            <Input
                                placeholder="예: 완료된 작업 자동 정리"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>트리거 (조건)</Label>
                            <Select onValueChange={setTrigger} value={trigger}>
                                <SelectTrigger>
                                    <SelectValue placeholder="언제 실행할까요?" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TRIGGERS.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>액션 (동작)</Label>
                            <Select onValueChange={setAction} value={action}>
                                <SelectTrigger>
                                    <SelectValue placeholder="무엇을 할까요?" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ACTIONS.map(a => (
                                        <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>취소</Button>
                        <Button onClick={handleAddRule}>규칙 생성</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

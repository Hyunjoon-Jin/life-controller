"use client"

import { useState } from 'react';
import { Project, Objective, KeyResult } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useData } from '@/context/DataProvider';
import { Target, Plus, Trash2, ChevronDown, ChevronRight, Save, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface ProjectOKRProps {
    project: Project;
}

export function ProjectOKR({ project }: ProjectOKRProps) {
    const { updateProject } = useData();
    const [expandedObjId, setExpandedObjId] = useState<string | null>(null);
    const [isAddObjOpen, setIsAddObjOpen] = useState(false);

    // New Objective State
    const [newObjTitle, setNewObjTitle] = useState('');
    const [newObjDesc, setNewObjDesc] = useState('');

    const toggleExpand = (id: string) => {
        setExpandedObjId(expandedObjId === id ? null : id);
    };

    const handleAddObjective = () => {
        if (!newObjTitle.trim()) return;

        const newObjective: Objective = {
            id: Date.now().toString(),
            title: newObjTitle,
            description: newObjDesc,
            startDate: new Date(),
            progress: 0,
            keyResults: [],
            status: 'on-track'
        };

        const updatedProject = {
            ...project,
            okrs: [...(project.okrs || []), newObjective]
        };

        updateProject(updatedProject);
        setNewObjTitle('');
        setNewObjDesc('');
        setIsAddObjOpen(false);
    };

    const handleDeleteObjective = (objId: string) => {
        if (!confirm('목표를 삭제하시겠습니까?')) return;
        const updatedProject = {
            ...project,
            okrs: (project.okrs || []).filter(o => o.id !== objId)
        };
        updateProject(updatedProject);
    };

    const handleUpdateKeyResult = (objId: string, krId: string, currentValue: number) => {
        const updatedOkrs = (project.okrs || []).map(obj => {
            if (obj.id !== objId) return obj;

            const updatedKRs = obj.keyResults.map(kr =>
                kr.id === krId ? { ...kr, currentValue } : kr
            );

            // Recalculate Objective Progress
            // Simple average of KR progress percentage
            const totalProgress = updatedKRs.reduce((acc, kr) => {
                const percentage = Math.min(100, Math.max(0, (kr.currentValue / kr.targetValue) * 100));
                return acc + percentage;
            }, 0);

            const newProgress = updatedKRs.length > 0 ? Math.round(totalProgress / updatedKRs.length) : 0;

            return { ...obj, keyResults: updatedKRs, progress: newProgress };
        });

        updateProject({ ...project, okrs: updatedOkrs });
    };

    const handleAddKeyResult = (objId: string, title: string, target: number, unit: string) => {
        const updatedOkrs = (project.okrs || []).map(obj => {
            if (obj.id !== objId) return obj;
            const newKR: KeyResult = {
                id: Date.now().toString(),
                title,
                targetValue: target,
                currentValue: 0,
                unit
            };
            return {
                ...obj,
                keyResults: [...obj.keyResults, newKR],
                // Progress recalculation will happen on next update or simplified here:
                progress: Math.round((obj.progress * obj.keyResults.length) / (obj.keyResults.length + 1))
            };
        });
        updateProject({ ...project, okrs: updatedOkrs });
    };

    const handleDeleteKeyResult = (objId: string, krId: string) => {
        const updatedOkrs = (project.okrs || []).map(obj => {
            if (obj.id !== objId) return obj;
            const updatedKRs = obj.keyResults.filter(kr => kr.id !== krId);

            // Recalculate Objective Progress
            const totalProgress = updatedKRs.reduce((acc, kr) => {
                const percentage = Math.min(100, Math.max(0, (kr.currentValue / kr.targetValue) * 100));
                return acc + percentage;
            }, 0);
            const newProgress = updatedKRs.length > 0 ? Math.round(totalProgress / updatedKRs.length) : 0;

            return { ...obj, keyResults: updatedKRs, progress: newProgress };
        });
        updateProject({ ...project, okrs: updatedOkrs });
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Target className="w-6 h-6 text-red-500" /> OKR (Objectives & Key Results)
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        프로젝트의 핵심 목표와 달성 현황을 관리하세요.
                    </p>
                </div>
                <Button onClick={() => setIsAddObjOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" /> 목표 추가
                </Button>
            </div>

            <div className="grid gap-4">
                {(project.okrs || []).length === 0 ? (
                    <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
                        <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <h3 className="font-semibold text-lg text-muted-foreground">등록된 목표가 없습니다</h3>
                        <p className="text-sm text-gray-500 mb-4">첫 번째 목표를 설정하고 성과를 측정해보세요.</p>
                        <Button variant="outline" onClick={() => setIsAddObjOpen(true)}>목표 만들기</Button>
                    </div>
                ) : (
                    (project.okrs || []).map(obj => (
                        <div key={obj.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-border shadow-sm overflow-hidden">
                            {/* Objective Header */}
                            <div className="p-4 flex items-center gap-4 hover:bg-muted/10 transition-colors">
                                <button onClick={() => toggleExpand(obj.id)} className="p-1 rounded-md hover:bg-muted/50">
                                    {expandedObjId === obj.id ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-lg truncate">{obj.title}</h3>
                                        <span className={cn(
                                            "text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider border",
                                            obj.status === 'on-track' ? "bg-green-100 text-green-700 border-green-200" :
                                                obj.status === 'at-risk' ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                                                    "bg-red-100 text-red-700 border-red-200"
                                        )}>
                                            {obj.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        {obj.description && <span className="truncate max-w-md">{obj.description}</span>}
                                        <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                                            <Progress value={obj.progress} className="h-2" />
                                            <span className="font-mono font-bold text-foreground">{obj.progress}%</span>
                                        </div>
                                    </div>
                                </div>

                                <Button variant="ghost" size="icon" onClick={() => handleDeleteObjective(obj.id)} className="text-muted-foreground hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Key Results (Expandable) */}
                            {expandedObjId === obj.id && (
                                <div className="border-t border-border bg-muted/5 p-4 space-y-4">
                                    <div className="space-y-3">
                                        {obj.keyResults.map(kr => (
                                            <KeyResultItem
                                                key={kr.id}
                                                item={kr}
                                                onUpdate={(val) => handleUpdateKeyResult(obj.id, kr.id, val)}
                                                onDelete={() => handleDeleteKeyResult(obj.id, kr.id)}
                                            />
                                        ))}
                                        {obj.keyResults.length === 0 && (
                                            <div className="text-sm text-muted-foreground text-center py-2">측정 가능한 핵심 결과(Key Result)를 추가하세요.</div>
                                        )}
                                    </div>

                                    <AddKeyResultForm onAdd={(title, target, unit) => handleAddKeyResult(obj.id, title, target, unit)} />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Add Objective Dialog */}
            <Dialog open={isAddObjOpen} onOpenChange={setIsAddObjOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>새 목표(Objective) 설정</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>목표 제목</Label>
                            <Input
                                placeholder="예: 1분기 매출 200% 달성"
                                value={newObjTitle}
                                onChange={e => setNewObjTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>설명 (선택)</Label>
                            <Input
                                placeholder="구체적인 맥락을 적어주세요"
                                value={newObjDesc}
                                onChange={e => setNewObjDesc(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddObjOpen(false)}>취소</Button>
                        <Button onClick={handleAddObjective}>목표 생성</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Sub-components for cleaner code
function KeyResultItem({ item, onUpdate, onDelete }: { item: KeyResult, onUpdate: (val: number) => void, onDelete: () => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [val, setVal] = useState(item.currentValue.toString());

    const handleSave = () => {
        onUpdate(Number(val));
        setIsEditing(false);
    };

    const progress = Math.min(100, Math.max(0, (item.currentValue / item.targetValue) * 100));

    return (
        <div className="flex items-center gap-4 bg-background p-3 rounded-lg border border-border shadow-sm">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400">
                <TrendingUp className="w-4 h-4" />
            </div>

            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">{item.title}</span>
                    <span className="text-xs font-bold text-muted-foreground">
                        {item.currentValue} / {item.targetValue} {item.unit} ({Math.round(progress)}%)
                    </span>
                </div>
                <Progress value={progress} className="h-1.5" />
            </div>

            <div className="flex items-center gap-2">
                {isEditing ? (
                    <div className="flex items-center gap-1">
                        <Input
                            type="number"
                            className="w-20 h-8 text-sm"
                            value={val}
                            onChange={e => setVal(e.target.value)}
                        />
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleSave}>
                            <Save className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsEditing(true)}>
                        업데이트
                    </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={onDelete}>
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
    );
}

function AddKeyResultForm({ onAdd }: { onAdd: (t: string, ta: number, u: string) => void }) {
    const [title, setTitle] = useState('');
    const [target, setTarget] = useState('');
    const [unit, setUnit] = useState('%');
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = () => {
        if (!title || !target) return;
        onAdd(title, Number(target), unit);
        setTitle('');
        setTarget('');
        setUnit('%');
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors px-2"
            >
                <Plus className="w-4 h-4" /> 핵심 결과(Key Result) 추가
            </button>
        );
    }

    return (
        <div className="flex items-end gap-2 bg-muted/20 p-3 rounded-lg border border-dashed border-muted-foreground/30 animate-in fade-in zoom-in-95">
            <div className="grid gap-1.5 flex-1">
                <Label className="text-xs">핵심 결과</Label>
                <Input placeholder="예: 신규 가입자 수" className="h-8 text-sm" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-1.5 w-24">
                <Label className="text-xs">목표값</Label>
                <Input type="number" placeholder="1000" className="h-8 text-sm" value={target} onChange={e => setTarget(e.target.value)} />
            </div>
            <div className="grid gap-1.5 w-20">
                <Label className="text-xs">단위</Label>
                <Input placeholder="명" className="h-8 text-sm" value={unit} onChange={e => setUnit(e.target.value)} />
            </div>
            <div className="flex gap-1">
                <Button size="sm" onClick={handleSubmit} className="h-8">추가</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)} className="h-8">취소</Button>
            </div>
        </div>
    );
}

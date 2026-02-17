'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Save, Trash2, Check, ChevronsUpDown, Sparkles, Loader2 } from 'lucide-react';
import { Task, Priority } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command } from 'cmdk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/context/DataProvider';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/date-picker';


interface TaskDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    taskToEdit?: Task | null; // If null, create mode
    defaultStatus?: string | null; // New: 'todo', 'in_progress', 'done'
    initialPriority?: Priority; // New
}

export function TaskDialog({ isOpen, onOpenChange, projectId, taskToEdit, defaultStatus, initialPriority }: TaskDialogProps) {
    const { addTask, updateTask, deleteTask } = useData();

    const handleDelete = () => {
        if (taskToEdit) {
            deleteTask(taskToEdit.id);
            onOpenChange(false);
        }
    };

    // Form State
    const [title, setTitle] = useState('');
    const [remarks, setRemarks] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [type, setType] = useState('work');
    const [estimatedTime, setEstimatedTime] = useState<number | undefined>(undefined);
    const [tags, setTags] = useState<string[]>([]); // New Tags State
    const [isAnalyzing, setIsAnalyzing] = useState(false); // New AI State

    // Dependency State
    const [dependencies, setDependencies] = useState<string[]>([]);
    const [isDependencyOpen, setIsDependencyOpen] = useState(false);

    // Subtasks State
    const [subTaskInput, setSubTaskInput] = useState('');
    const [subTasks, setSubTasks] = useState<{ id: string, title: string, completed: boolean }[]>([]);

    const [lastTaskId, setLastTaskId] = useState<string | null>(null);

    const { projects } = useData(); // Get projects for AI analysis

    useEffect(() => {
        if (taskToEdit) {
            if (taskToEdit.id !== lastTaskId || isOpen) {
                if (taskToEdit.id === lastTaskId && title === taskToEdit.title && dependencies === taskToEdit.dependencies) return;

                setTitle(taskToEdit.title);
                setRemarks(taskToEdit.remarks || '');
                setPriority(taskToEdit.priority || 'medium');
                setStartDate(taskToEdit.startDate ? new Date(taskToEdit.startDate) : undefined);
                setEndDate(taskToEdit.endDate ? new Date(taskToEdit.endDate) : undefined);
                setType(taskToEdit.type || 'work');
                setEstimatedTime(taskToEdit.estimatedTime);
                setTags(taskToEdit.tags || []);
                setDependencies(taskToEdit.dependencies || []);

                if (taskToEdit.subTasks) {
                    setSubTasks(taskToEdit.subTasks.map(st => ({ id: st.id, title: st.title, completed: st.completed })));
                } else {
                    setSubTasks([]);
                }
                setLastTaskId(taskToEdit.id);
            }
        } else {
            if (lastTaskId !== null || isOpen) {
                setTitle('');
                setRemarks('');
                setPriority(initialPriority || 'medium');
                setStartDate(new Date());
                setEndDate(undefined);
                setType('work');
                setEstimatedTime(undefined);
                setTags([]);
                setDependencies([]);
                setSubTasks([]);
                setLastTaskId(null);
            }
        }
    }, [taskToEdit, isOpen, lastTaskId, title, priority, initialPriority, dependencies]);

    // ... handleAddSubTask, removeSubTask ... 

    const handleAIAnalyze = async () => {
        if (!title.trim()) return;
        setIsAnalyzing(true);
        try {
            const { suggestTaskDetails } = await import('@/lib/gemini');
            const result = await suggestTaskDetails(title, remarks, projects); // Pass projects

            if (result) {
                setPriority(result.priority);
                setTags(result.tags || []);
                if (result.category) setType(result.category);
                if (result.estimatedTime) setEstimatedTime(result.estimatedTime);
                // Project suggestion could be handled here if we had a project selector
            }
        } catch (error) {
            console.error("AI Analysis Failed", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAddSubTask = () => {
        if (!subTaskInput.trim()) return;
        setSubTasks([...subTasks, { id: Date.now().toString(), title: subTaskInput.trim(), completed: false }]);
        setSubTaskInput('');
    };

    const removeSubTask = (id: string) => {
        setSubTasks(subTasks.filter(st => st.id !== id));
    };

    const handleSave = () => {
        if (!title.trim()) return;

        let completed = false;
        let progress = 0;

        if (taskToEdit) {
            completed = taskToEdit.completed;
            progress = taskToEdit.progress || 0;
        } else {
            if (defaultStatus === 'done') {
                completed = true;
                progress = 100;
            } else if (defaultStatus === 'in_progress') {
                completed = false;
                progress = 50;
            }
        }

        const taskData: Task = {
            id: taskToEdit ? taskToEdit.id : Date.now().toString(),
            title,
            completed,
            projectId: projectId,
            priority,
            remarks,
            type,
            startDate: startDate,
            endDate: endDate,
            estimatedTime: estimatedTime || undefined,
            tags: tags,
            subTasks: subTasks.map(st => ({
                id: st.id,
                title: st.title,
                completed: st.completed,
                priority: 'medium',
                projectId: projectId
            })),
            dependencies: dependencies,
            progress,
            source: 'timeline'
        };

        if (taskToEdit) {
            updateTask(taskData);
        } else {
            addTask(taskData);
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>{taskToEdit ? '작업 수정' : '새 작업 추가'}</DialogTitle>
                    <DialogDescription>
                        상세 정보를 입력하여 작업을 관리하세요.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                    <div className="grid gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">작업명</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="col-span-3 font-semibold"
                                    placeholder="작업 이름을 입력하세요"
                                />
                                <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {/* Placeholder for optional hover actions */}
                                </div>
                            </div>

                            {/* AI Suggestion Button */}
                            <div className="flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-indigo-600 h-6 px-2 hover:bg-indigo-50"
                                    onClick={handleAIAnalyze}
                                    disabled={!title || isAnalyzing}
                                >
                                    {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                    AI 자동 분류
                                </Button>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">유형</Label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="work">업무</option>
                                    <option value="study">공부</option>
                                    <option value="personal">개인</option>
                                    <option value="health">건강</option>
                                    <option value="finance">재테크</option>
                                    <option value="other">기타</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">우선순위</Label>
                                <div className="col-span-3 flex gap-2">
                                    {['high', 'medium', 'low'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPriority(p as Priority)}
                                            className={cn(
                                                "px-4 py-2 rounded-md text-sm font-medium transition-colors border",
                                                priority === p
                                                    ? (p === 'high' ? "bg-red-100 border-red-500 text-red-700" : p === 'medium' ? "bg-yellow-100 border-yellow-500 text-yellow-700" : "bg-blue-100 border-blue-500 text-blue-700")
                                                    : "bg-white hover:bg-gray-50 text-gray-600"
                                            )}
                                        >
                                            {p === 'high' ? '높음' : p === 'medium' ? '중간' : '낮음'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">기간</Label>
                                <div className="col-span-3 flex gap-2 items-center">
                                    <DatePicker
                                        date={startDate}
                                        setDate={setStartDate}
                                        className="w-full"
                                    />
                                    <span className="text-muted-foreground">→</span>
                                    <DatePicker
                                        date={endDate}
                                        setDate={setEndDate}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">예상 소요</Label>
                                <div className="col-span-3 flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={estimatedTime}
                                        onChange={(e) => setEstimatedTime(Number(e.target.value))}
                                        className="w-24"
                                        placeholder="분"
                                    />
                                    <span className="text-sm text-muted-foreground">분 (입력 시 자동 스케줄링 가능)</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right mt-2">태그</Label>
                                <div className="col-span-3">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {tags.map(tag => (
                                            <div key={tag} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-md flex items-center gap-1">
                                                <span>#{tag}</span>
                                                <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:bg-indigo-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                                            </div>
                                        ))}
                                    </div>
                                    <Input
                                        placeholder="태그 입력 후 Enter"
                                        className="h-8 text-sm"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const val = (e.currentTarget as HTMLInputElement).value.trim();
                                                if (val && !tags.includes(val)) {
                                                    setTags([...tags, val]);
                                                    (e.currentTarget as HTMLInputElement).value = '';
                                                }
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 my-2"></div>

                        {/* Dependencies */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right mt-2">선행 작업</Label>
                                <div className="col-span-3">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {dependencies.map(depId => {
                                            const depTask = useData().tasks.find(t => t.id === depId);
                                            return (
                                                <div key={depId} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-md flex items-center gap-1">
                                                    <span>{depTask?.title || 'Unknown Task'}</span>
                                                    <button onClick={() => setDependencies(dependencies.filter(d => d !== depId))} className="hover:bg-red-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <Popover open={isDependencyOpen} onOpenChange={setIsDependencyOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal text-muted-foreground">
                                                <Plus className="w-4 h-4 mr-2" /> 선행 작업 추가...
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0 w-[400px]" align="start">
                                            <Command className="w-full">
                                                <Command.Input placeholder="작업 검색..." className="h-9 border-none focus:ring-0" />
                                                <Command.List className="max-h-[200px] overflow-y-auto">
                                                    <Command.Empty>작업을 찾을 수 없습니다.</Command.Empty>
                                                    <Command.Group>
                                                        {useData().tasks
                                                            .filter(t => t.projectId === projectId && t.id !== (taskToEdit?.id) && t.source === 'timeline')
                                                            .map(task => (
                                                                <Command.Item
                                                                    key={task.id}
                                                                    onSelect={() => {
                                                                        if (!dependencies.includes(task.id)) {
                                                                            setDependencies([...dependencies, task.id]);
                                                                        }
                                                                        setIsDependencyOpen(false);
                                                                    }}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={cn("w-2 h-2 rounded-full", task.completed ? "bg-green-500" : "bg-gray-300")} />
                                                                        <span>{task.title}</span>
                                                                        {dependencies.includes(task.id) && <Check className="ml-auto w-4 h-4" />}
                                                                    </div>
                                                                </Command.Item>
                                                            ))}
                                                    </Command.Group>
                                                </Command.List>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Info */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right mt-2">상세 메모</Label>
                                <Textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="col-span-3 min-h-[100px]"
                                    placeholder="작업에 대한 상세 내용, 링크, 참고사항 등을 기록하세요."
                                />
                            </div>

                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right mt-2">하위 작업</Label>
                                <div className="col-span-3 space-y-3">
                                    <div className="flex gap-2">
                                        <Input
                                            value={subTaskInput}
                                            onChange={(e) => setSubTaskInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddSubTask()}
                                            placeholder="하위 작업 추가 (Enter)"
                                        />
                                        <Button onClick={handleAddSubTask} size="sm" variant="secondary">추가</Button>
                                    </div>

                                    <div className="space-y-2">
                                        {subTasks.map((st, idx) => (
                                            <div key={st.id} className="flex items-center gap-2 bg-muted/30 p-2 rounded-md group">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                                <span className="text-sm flex-1">{st.title}</span>
                                                <Button
                                                    onClick={() => removeSubTask(st.id)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"
                                                >
                                                    <span className="sr-only">Delete</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t bg-muted/10 flex sm:justify-between w-full">
                    {taskToEdit ? (
                        <div className="flex-1 flex justify-start">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
                                onClick={handleDelete}
                            >
                                <Trash2 className="w-4 h-4" /> 삭제
                            </Button>
                        </div>
                    ) : <div></div>}
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
                        <Button onClick={handleSave} className="px-8">저장</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Save, Trash2 } from 'lucide-react';
import { Task, Priority } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/context/DataProvider';
import { cn } from '@/lib/utils';

interface TaskDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    taskToEdit?: Task | null; // If null, create mode
}

export function TaskDialog({ isOpen, onOpenChange, projectId, taskToEdit }: TaskDialogProps) {
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
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [type, setType] = useState('work');

    // Subtasks State (Simple string array for local editing, mapped to Task[] on save)
    const [subTaskInput, setSubTaskInput] = useState('');
    const [subTasks, setSubTasks] = useState<{ id: string, title: string, completed: boolean }[]>([]);

    useEffect(() => {
        if (taskToEdit) {
            setTitle(taskToEdit.title);
            setRemarks(taskToEdit.remarks || '');
            setPriority(taskToEdit.priority || 'medium');
            setStartDate(taskToEdit.startDate ? new Date(taskToEdit.startDate).toISOString().split('T')[0] : '');
            setEndDate(taskToEdit.endDate ? new Date(taskToEdit.endDate).toISOString().split('T')[0] : '');
            setType(taskToEdit.type || 'work');

            // Map existing subTasks if any
            if (taskToEdit.subTasks) {
                setSubTasks(taskToEdit.subTasks.map(st => ({ id: st.id, title: st.title, completed: st.completed })));
            } else {
                setSubTasks([]);
            }
        } else {
            // Reset for create
            setTitle('');
            setRemarks('');
            setPriority('medium');
            setStartDate(new Date().toISOString().split('T')[0]);
            setEndDate('');
            setType('work');
            setSubTasks([]);
        }
    }, [taskToEdit, isOpen]);

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

        const taskData: Task = {
            id: taskToEdit ? taskToEdit.id : Date.now().toString(),
            title,
            completed: taskToEdit ? taskToEdit.completed : false,
            projectId: projectId,
            priority,
            remarks,
            type,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            // Reconstruct subTasks
            subTasks: subTasks.map(st => ({
                id: st.id,
                title: st.title,
                completed: st.completed,
                priority: 'medium', // Default
                projectId: projectId
            })),
            // Keep existing fields
            dependencies: taskToEdit?.dependencies || [],
            progress: taskToEdit?.progress || 0,
            source: 'timeline' // Mark as Timeline Task
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
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full"
                                    />
                                    <span className="text-muted-foreground">→</span>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 my-2"></div>

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

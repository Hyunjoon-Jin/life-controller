'use client';

import { useState } from 'react';
import { Task, Project, Priority } from '@/types';
import { cn, generateId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, MoreHorizontal, Check, Search, ListTodo } from 'lucide-react';
import { useData } from '@/context/DataProvider';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { DatePicker } from '@/components/ui/date-picker';


const MOCK_PROJECTS: Project[] = [
    { id: '1', title: '개인', color: 'bg-blue-400' },
    { id: '2', title: '일', color: 'bg-orange-400' },
    { id: '3', title: '운동', color: 'bg-green-400' },
];

interface TaskBoardProps {
    projectId?: string; // Optional: If provided, filter by this project and hide switcher
    hideHeader?: boolean;
}

export function TaskBoard({ projectId, hideHeader = false }: TaskBoardProps) {
    const { tasks, addTask, updateTask, deleteTask } = useData();
    // If projectId is passed, lock selection to it. Otherwise default to 'all'
    const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || 'all');

    // Update selectedProjectId if prop changes
    if (projectId && selectedProjectId !== projectId) {
        setSelectedProjectId(projectId);
    }

    // Create & Edit State
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskType, setNewTaskType] = useState('work');
    const [newTaskRemarks, setNewTaskRemarks] = useState('');
    const [newTaskDeadline, setNewTaskDeadline] = useState<Date | undefined>(undefined);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');


    const filteredTasks = tasks.filter(t => {
        // If projectId prop provided, STRICTLY filter by it. Else use internal state.
        const targetId = projectId || selectedProjectId;
        const matchProject = targetId === 'all' || t.projectId === targetId;
        const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        // Separate: Exclude Timeline tasks from Daily TaskBoard
        const notTimeline = t.source !== 'timeline';

        return matchProject && matchSearch && notTimeline;
    });

    const handleSaveTask = () => {
        if (!newTaskTitle.trim()) return;

        if (editingTask) {
            // Update Existing
            updateTask({
                ...editingTask,
                title: newTaskTitle,
                type: newTaskType,
                remarks: newTaskRemarks,
                deadline: newTaskDeadline,
                // Keep existing project ID unless explicitly moving (not implemented here)
                projectId: editingTask.projectId
            });

        } else {
            // Create New
            const newTask: Task = {
                id: generateId(),
                title: newTaskTitle,
                completed: false,
                priority: 'medium',
                // Use the forced projectId, or selected one, or default to '1' (Personal)
                projectId: projectId || (selectedProjectId === 'all' ? '1' : selectedProjectId),
                type: newTaskType,
                remarks: newTaskRemarks,
                deadline: newTaskDeadline,
                source: 'daily'
            };

            addTask(newTask);
        }

        // Reset
        setNewTaskTitle('');
        setNewTaskRemarks('');
        setNewTaskDeadline(undefined);
        setNewTaskType('work');
        setEditingTask(null);


        setIsDialogOpen(false);
    };

    const openCreateDialog = () => {
        setEditingTask(null);
        setNewTaskTitle('');
        setNewTaskRemarks('');
        setNewTaskDeadline(undefined);
        setNewTaskType('work');
        setIsDialogOpen(true);

    };

    const openEditDialog = (task: Task) => {
        setEditingTask(task);
        setNewTaskTitle(task.title);
        setNewTaskRemarks(task.remarks || '');
        setNewTaskDeadline(task.deadline ? new Date(task.deadline) : undefined);
        setNewTaskType(task.type || 'work');

        setIsDialogOpen(true);
    };

    const toggleTask = (task: Task) => {
        updateTask({ ...task, completed: !task.completed });
    };

    const getPriorityBadge = (p: Priority) => {
        const colors = {
            high: 'bg-red-500/20 text-red-200',
            medium: 'bg-yellow-500/20 text-yellow-200',
            low: 'bg-blue-500/20 text-blue-200'
        };
        return (
            <span className={cn("px-1.5 py-0.5 rounded text-[10px] uppercase font-bold", colors[p])}>
                {p}
            </span>
        );
    };

    return (
        <div className={cn("flex flex-col h-full bg-card text-card-foreground border border-transparent shadow-sm", hideHeader ? "border-none shadow-none bg-transparent" : "rounded-3xl overflow-hidden")}>

            {/* Header */}
            {!hideHeader && (
                <div className="p-4 pt-6 pb-2">
                    <div className="flex items-center gap-2 mb-4">
                        <ListTodo className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-extrabold">작업 목록</h2>
                    </div>

                    {/* Toolbar */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => setSelectedProjectId('all')}
                                className={cn(
                                    "text-sm px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap font-bold",
                                    selectedProjectId === 'all' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                모든 작업
                            </button>
                            {MOCK_PROJECTS.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedProjectId(p.id)}
                                    className={cn(
                                        "text-sm px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap font-bold",
                                        selectedProjectId === p.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    )}
                                >
                                    {p.title}
                                </button>
                            ))}
                        </div>

                        {/* Add Task Button inside Toolbar */}
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={openCreateDialog} className="h-8 w-8 p-0 rounded-full hover:bg-muted">
                                    <Plus className="w-5 h-5 text-muted-foreground" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle className="font-extrabold text-xl">
                                        {editingTask ? '작업 수정' : '새 작업 추가'}
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground">작업 이름</label>
                                        <Input
                                            className="font-bold text-lg border-transparent bg-muted focus-visible:ring-primary/30"
                                            placeholder="무엇을 해야 하나요?"
                                            value={newTaskTitle}
                                            onChange={e => setNewTaskTitle(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground">유형</label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium"
                                                value={newTaskType}
                                                onChange={e => setNewTaskType(e.target.value)}
                                            >
                                                <option value="work">업무</option>
                                                <option value="study">공부</option>
                                                <option value="personal">개인</option>
                                                <option value="health">건강</option>
                                                <option value="finance">재테크</option>
                                                <option value="travel">여행</option>
                                                <option value="social">사교</option>
                                                <option value="hobby">취미</option>
                                                <option value="home">집안일</option>
                                                <option value="other">기타</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground">마감 기한</label>
                                            <label className="text-sm font-bold text-muted-foreground">마감 기한</label>
                                            <DatePicker
                                                date={newTaskDeadline}
                                                setDate={setNewTaskDeadline}
                                            />
                                        </div>

                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground">비고 사항</label>
                                        <Input
                                            className="bg-muted border-transparent"
                                            placeholder="추가 세부사항..."
                                            value={newTaskRemarks}
                                            onChange={e => setNewTaskRemarks(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button onClick={handleSaveTask} className="w-full font-bold">
                                        {editingTask ? '수정 완료' : '추가하기'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                </div>
            )}

            {/* Embedded Toolbar (Create Button) when header is hidden */}
            {hideHeader && (
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">작업 목록</h3>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={openCreateDialog} className="h-8 w-8 p-0 rounded-full hover:bg-muted">
                                <Plus className="w-5 h-5 text-muted-foreground" />
                            </Button>

                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            {/* ... Content duplicated below due to replace block structure ... */}
                            <DialogHeader>
                                <DialogTitle className="font-extrabold text-xl">
                                    {editingTask ? '작업 수정' : '새 작업 추가'}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground">작업 이름</label>
                                    <Input
                                        className="font-bold text-lg border-transparent bg-muted focus-visible:ring-primary/30"
                                        placeholder="무엇을 해야 하나요?"
                                        value={newTaskTitle}
                                        onChange={e => setNewTaskTitle(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground">유형</label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium"
                                            value={newTaskType}
                                            onChange={e => setNewTaskType(e.target.value)}
                                        >
                                            <option value="work">업무</option>
                                            <option value="study">공부</option>
                                            <option value="personal">개인</option>
                                            <option value="health">건강</option>
                                            <option value="finance">재테크</option>
                                            <option value="travel">여행</option>
                                            <option value="social">사교</option>
                                            <option value="hobby">취미</option>
                                            <option value="home">집안일</option>
                                            <option value="other">기타</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground">마감 기한</label>
                                        <DatePicker
                                            date={newTaskDeadline}
                                            setDate={setNewTaskDeadline}
                                        />
                                    </div>

                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground">비고 사항</label>
                                    <Input
                                        className="bg-muted border-transparent"
                                        placeholder="추가 세부사항..."
                                        value={newTaskRemarks}
                                        onChange={e => setNewTaskRemarks(e.target.value)}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button onClick={handleSaveTask} className="w-full font-bold">
                                    {editingTask ? '수정 완료' : '추가하기'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            {/* Main Create Dialog Removed (Moved to Toolbar) */}


            {/* List Header */}
            <div className="grid grid-cols-[30px_1.5fr_80px_100px_1fr_80px_30px] gap-4 px-6 py-3 border-b border-border/50 text-xs font-bold text-muted-foreground bg-muted/20">
                <div></div>
                <div>작업 이름</div>
                <div>유형</div>
                <div>마감 기한</div>
                <div>비고</div>
                <div>우선순위</div>
                <div></div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredTasks.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                        <ListTodo className="w-10 h-10 opacity-20" />
                        <p className="font-medium">등록된 작업이 없습니다.</p>
                    </div>
                ) : (
                    filteredTasks.map(task => (
                        <div
                            key={task.id}
                            className="group grid grid-cols-[30px_1.5fr_80px_100px_1fr_80px_30px] gap-4 px-6 py-3 border-b border-border/40 items-center hover:bg-muted/30 transition-colors"
                        >
                            <div className="flex justify-center">
                                <button
                                    onClick={() => toggleTask(task)}
                                    className={cn(
                                        "w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center",
                                        task.completed
                                            ? "bg-primary border-primary text-primary-foreground"
                                            : "border-muted-foreground/30 hover:border-primary/50"
                                    )}
                                >
                                    {task.completed && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                                </button>
                            </div>

                            <div className={cn(
                                "text-sm font-bold truncate transition-opacity",
                                task.completed && "opacity-50 line-through decoration-2 decoration-muted-foreground/50"
                            )}>
                                {task.title}
                            </div>

                            <div className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md w-fit">
                                {task.type === 'work' ? '업무' :
                                    task.type === 'study' ? '공부' :
                                        task.type === 'personal' ? '개인' :
                                            task.type === 'health' ? '건강' :
                                                task.type === 'finance' ? '재테크' :
                                                    task.type === 'travel' ? '여행' :
                                                        task.type === 'social' ? '사교' :
                                                            task.type === 'hobby' ? '취미' :
                                                                task.type === 'home' ? '집안일' : '기타'}
                            </div>

                            <div className="text-xs font-medium text-red-400">
                                {task.deadline ? new Date(task.deadline).toLocaleDateString() : '-'}
                            </div>

                            <div className="text-xs text-muted-foreground truncate" title={task.remarks}>
                                {task.remarks || '-'}
                            </div>

                            <div>
                                {getPriorityBadge(task.priority)}
                            </div>

                            <div className="opacity-0 group-hover:opacity-100 flex justify-end">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors">
                                            <MoreHorizontal className="w-4 h-4" strokeWidth={1.5} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[120px]">
                                        <DropdownMenuItem onClick={() => openEditDialog(task)} className="font-medium cursor-pointer">
                                            수정
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-red-500 font-medium cursor-pointer focus:text-red-600 focus:bg-red-50">
                                            삭제
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

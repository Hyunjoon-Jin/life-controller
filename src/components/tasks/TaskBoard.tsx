'use client';

import { useState } from 'react';
import { Task, Project, Priority } from '@/types';
import { cn, generateId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, MoreHorizontal, Check, ListTodo, Search, Trash2, Edit3, Briefcase } from 'lucide-react';
import { useData } from '@/context/DataProvider';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { DatePicker } from '@/components/ui/date-picker';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const DEFAULT_PROJECTS: Project[] = [
    { id: 'default-personal', title: '개인', color: '#10b981' },
    { id: 'default-work', title: '일', color: '#3b82f6' },
    { id: 'default-health', title: '운동', color: '#f59e0b' },
];

interface TaskBoardProps {
    projectId?: string;
    hideHeader?: boolean;
}

export function TaskBoard({ projectId, hideHeader = false }: TaskBoardProps) {
    const { tasks, addTask, updateTask, deleteTask, projects: userProjects } = useData();
    const displayProjects = userProjects.length > 0 ? userProjects.map(p => ({
        ...p,
        color: p.color.includes('bg-') ? '#10b981' : p.color
    })) : DEFAULT_PROJECTS;

    const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || 'all');
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskType, setNewTaskType] = useState('work');
    const [newTaskRemarks, setNewTaskRemarks] = useState('');
    const [newTaskDeadline, setNewTaskDeadline] = useState<Date | undefined>(undefined);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    if (projectId && selectedProjectId !== projectId) {
        setSelectedProjectId(projectId);
    }

    const filteredTasks = tasks.filter(t => {
        const targetId = projectId || selectedProjectId;
        const matchProject = targetId === 'all' || t.projectId === targetId;
        const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        const notTimeline = t.source !== 'timeline';
        return matchProject && matchSearch && notTimeline;
    });

    const handleSaveTask = () => {
        if (!newTaskTitle.trim()) return;
        if (editingTask) {
            updateTask({
                ...editingTask,
                title: newTaskTitle,
                type: newTaskType,
                remarks: newTaskRemarks,
                deadline: newTaskDeadline,
                projectId: editingTask.projectId
            });
        } else {
            const newTask: Task = {
                id: generateId(),
                title: newTaskTitle,
                completed: false,
                priority: 'medium',
                projectId: projectId || (selectedProjectId === 'all' ? (displayProjects[0]?.id || 'default-personal') : selectedProjectId),
                type: newTaskType,
                remarks: newTaskRemarks,
                deadline: newTaskDeadline,
                source: 'daily'
            };
            addTask(newTask);
        }
        resetForm();
        setIsDialogOpen(false);
    };

    const resetForm = () => {
        setNewTaskTitle('');
        setNewTaskRemarks('');
        setNewTaskDeadline(undefined);
        setNewTaskType('work');
        setEditingTask(null);
    };

    const openCreateDialog = () => {
        resetForm();
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
            high: 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]',
            medium: 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]',
            low: 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]'
        };
        const labels: Record<Priority, string> = { high: '높음', medium: '보통', low: '낮음' };
        return (
            <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-semibold", colors[p])}>
                {labels[p]}
            </span>
        );
    };

    const TaskForm = () => (
        <div className="grid gap-6 py-4">
            <div className="space-y-3">
                <label className="text-[10px] font-semibold text-muted-foreground tracking-wide">할 일</label>
                <Input
                    className="h-14 font-semibold text-xl border-border bg-card focus-visible:ring-primary/30 rounded-2xl text-foreground placeholder:text-muted-foreground"
                    placeholder="할 일을 입력하세요..."
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-semibold text-muted-foreground tracking-wide">카테고리</label>
                    <select
                        className="flex h-12 w-full rounded-2xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                        value={newTaskType}
                        onChange={e => setNewTaskType(e.target.value)}
                    >
                        <option value="work">업무</option>
                        <option value="study">학습</option>
                        <option value="personal">개인</option>
                        <option value="health">건강</option>
                        <option value="finance">재정</option>
                        <option value="travel">여행</option>
                        <option value="social">소셜</option>
                        <option value="hobby">취미</option>
                        <option value="home">집</option>
                        <option value="other">기타</option>
                    </select>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-semibold text-muted-foreground tracking-wide">마감일</label>
                    <div className="rounded-2xl overflow-hidden border border-border bg-card">
                        <DatePicker
                            date={newTaskDeadline}
                            setDate={setNewTaskDeadline}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-[10px] font-semibold text-muted-foreground tracking-wide">메모</label>
                <Input
                    className="h-12 bg-card border-border rounded-2xl text-foreground placeholder:text-muted-foreground"
                    placeholder="추가 내용을 입력하세요..."
                    value={newTaskRemarks}
                    onChange={e => setNewTaskRemarks(e.target.value)}
                />
            </div>
        </div>
    );

    return (
        <div className={cn("flex flex-col h-full glass-premium overflow-hidden border border-white/5 shadow-2xl relative", hideHeader ? "border-none shadow-none bg-transparent" : "rounded-[32px]")}>

            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />

            {!hideHeader && (
                <div className="p-8 pb-4 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(16,185,129,0.5)]">
                                <ListTodo className="w-6 h-6 text-white" strokeWidth={3} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-foreground tracking-tight">할 일 보드</h2>
                                <p className="text-xs font-medium text-muted-foreground mt-0.5">오늘의 할 일을 관리하세요</p>
                            </div>
                        </div>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <button onClick={openCreateDialog} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-white/60 hover:text-white">
                                    <Plus className="w-6 h-6" strokeWidth={3} />
                                </button>
                            </DialogTrigger>
                            <DialogContent className="glass-premium border border-white/10 text-white rounded-[40px] p-10 shadow-2xl sm:max-w-[550px]">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold tracking-tight">
                                        {editingTask ? '할 일 수정' : '새 할 일'}
                                    </DialogTitle>
                                </DialogHeader>
                                <TaskForm />
                                <DialogFooter className="mt-4">
                                    <Button
                                        onClick={handleSaveTask}
                                        className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-lg transition-all active:scale-95"
                                    >
                                        {editingTask ? '수정 완료' : '추가'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                        <button
                            onClick={() => setSelectedProjectId('all')}
                            className={cn(
                                "px-6 py-2.5 rounded-2xl transition-all font-medium text-[12px] border",
                                selectedProjectId === 'all'
                                    ? "bg-emerald-500 text-white border-emerald-500/50 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)]"
                                    : "bg-white/5 border-border text-muted-foreground hover:text-foreground hover:bg-white/10"
                            )}
                        >
                            전체
                        </button>
                        {displayProjects.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedProjectId(p.id)}
                                className={cn(
                                    "px-6 py-2.5 rounded-2xl transition-all font-medium text-[12px] border",
                                    selectedProjectId === p.id
                                        ? "bg-foreground text-background border-foreground/50 shadow-[0_10px_20px_-5px_rgba(255,255,255,0.2)]"
                                        : "bg-white/5 border-border text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                    {p.title}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {hideHeader && (
                <div className="flex justify-between items-center mb-6 p-2">
                    <h3 className="text-2xl font-bold text-foreground tracking-tight">빠른 할 일</h3>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <button onClick={openCreateDialog} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 text-white/40 hover:text-white">
                                <Plus className="w-5 h-5" strokeWidth={3} />
                            </button>
                        </DialogTrigger>
                        <DialogContent className="glass-premium border border-white/10 text-white rounded-[40px] p-10 shadow-2xl sm:max-w-[550px]">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold tracking-tight">
                                    {editingTask ? '할 일 수정' : '새 할 일'}
                                </DialogTitle>
                            </DialogHeader>
                            <TaskForm />
                            <DialogFooter className="mt-4">
                                <Button onClick={handleSaveTask} className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-lg">
                                    {editingTask ? '수정 완료' : '추가'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            <div className="hidden md:grid grid-cols-[60px_2fr_120px_140px_2fr_120px_80px] gap-4 px-8 py-4 border-b border-border text-[9px] font-semibold text-muted-foreground uppercase tracking-wide bg-muted/20">
                <div className="text-center">완료</div>
                <div>할 일</div>
                <div>카테고리</div>
                <div>마감일</div>
                <div>메모</div>
                <div>우선순위</div>
                <div className="text-right">관리</div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                {filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-center mb-8 relative"
                        >
                            <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full" />
                            <ListTodo className="w-10 h-10 text-white/30 relative z-10" />
                        </motion.div>
                        <p className="text-2xl font-bold text-foreground/80 tracking-tight">할 일이 없습니다</p>
                        <p className="text-sm font-medium text-muted-foreground mt-3 max-w-xs leading-relaxed">새 할 일을 추가하세요.</p>
                    </div>
                ) : (
                    <div className="p-4 md:p-0">
                        <AnimatePresence mode="popLayout">
                            {filteredTasks.map(task => (
                                <motion.div
                                    key={task.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group grid grid-cols-1 md:grid-cols-[60px_2fr_120px_140px_2fr_120px_80px] gap-2 md:gap-4 px-4 md:px-8 py-4 md:py-5 border-b border-white/[0.03] items-center hover:bg-white/[0.02] transition-all duration-300 relative rounded-2xl md:rounded-none mb-2 md:mb-0"
                                >
                                    <div className="flex items-center md:justify-center">
                                        <button
                                            onClick={() => toggleTask(task)}
                                            className={cn(
                                                "w-7 h-7 rounded-xl border-2 transition-all flex items-center justify-center active:scale-75",
                                                task.completed
                                                    ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                                                    : "border-white/10 hover:border-white/30 hover:bg-white/5"
                                            )}
                                        >
                                            {task.completed && <Check className="w-4 h-4" strokeWidth={4} />}
                                        </button>
                                    </div>

                                    <div className="flex flex-col min-w-0">
                                        <div className={cn(
                                            "text-sm font-medium tracking-tight text-foreground transition-all",
                                            task.completed && "opacity-40 line-through decoration-2"
                                        )}>
                                            {task.title}
                                        </div>
                                        <div className="md:hidden flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-medium text-muted-foreground">{task.type}</span>
                                            <div className="w-1 h-1 rounded-full bg-muted" />
                                            <span className="text-[9px] font-medium text-rose-500/60">
                                                {task.deadline ? format(new Date(task.deadline), 'MM월 dd일') : '기한 없음'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="hidden md:block">
                                        <div className="text-[9px] font-medium text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-xl w-fit border border-border">
                                            {task.type}
                                        </div>
                                    </div>

                                    <div className="hidden md:block font-bold text-[11px] text-white/40 tracking-tighter">
                                        {task.deadline ? format(new Date(task.deadline), 'yyyy . MM . dd') : '-'}
                                    </div>

                                    <div className="hidden md:block text-[11px] text-white/50 font-medium truncate italic" title={task.remarks}>
                                        {task.remarks || '-'}
                                    </div>

                                    <div className="hidden md:block">
                                        {getPriorityBadge(task.priority)}
                                    </div>

                                    <div className="opacity-100 md:opacity-0 group-hover:opacity-100 flex justify-end transition-all">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="glass-premium border border-border text-foreground p-2 min-w-[140px] rounded-2xl shadow-2xl">
                                                <DropdownMenuItem onClick={() => openEditDialog(task)} className="rounded-xl flex items-center gap-3 py-2.5 px-4 font-medium text-sm cursor-pointer hover:bg-muted/30 transition-all">
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                    수정
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => deleteTask(task.id)} className="rounded-xl flex items-center gap-3 py-2.5 px-4 font-medium text-sm cursor-pointer text-rose-500 hover:bg-rose-500/10 transition-all">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    삭제
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}

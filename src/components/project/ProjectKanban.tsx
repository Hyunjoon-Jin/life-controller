'use client';

import { useState, useMemo, useCallback } from 'react';
import { Project, Task, Priority } from '@/types';
import { useData } from '@/context/DataProvider';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, User, Flag, Filter, Layout, CheckSquare, Square, Lock } from 'lucide-react';
import { TaskDialog } from './TaskDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectKanbanProps {
    project: Project;
}

type GroupBy = 'status' | 'priority' | 'assignee';
type LayoutType = 'board' | 'swimlane';

export function ProjectKanban({ project }: ProjectKanbanProps) {
    const { tasks, updateTask } = useData();
    const [groupBy, setGroupBy] = useState<GroupBy>('status');
    const [layout, setLayout] = useState<LayoutType>('board');
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [newTaskStatus, setNewTaskStatus] = useState<string | null>(null);
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

    // Filter tasks for this project
    const projectTasks = useMemo(() => {
        return tasks.filter(t => t.projectId === project.id);
    }, [tasks, project.id]);

    // Derived Status Helpers
    const getTaskStatus = useCallback((task: Task) => {
        if (task.completed) return 'done';
        if ((task.progress || 0) > 0) return 'in_progress';
        return 'todo';
    }, []);

    // Board Structure Definitions
    const statusColumns = {
        todo: { id: 'todo', title: '할 일', color: 'bg-slate-500' },
        in_progress: { id: 'in_progress', title: '진행 중', color: 'bg-blue-500' },
        done: { id: 'done', title: '완료', color: 'bg-green-500' },
    };

    const priorityGroups = {
        high: { id: 'high', title: '높음', color: 'text-red-600 bg-red-50 border-red-200' },
        medium: { id: 'medium', title: '중간', color: 'text-orange-600 bg-orange-50 border-orange-200' },
        low: { id: 'low', title: '낮음', color: 'text-green-600 bg-green-50 border-green-200' },
    };

    // Organized Data
    const groupedTasks = useMemo(() => {
        const groups: Record<string, Task[]> = {};

        // Initialize groups structure
        if (layout === 'board') {
            if (groupBy === 'status') {
                Object.keys(statusColumns).forEach(key => groups[key] = []);
            } else if (groupBy === 'priority') {
                Object.keys(priorityGroups).forEach(key => groups[key] = []);
            }
        } else {
            // Swimlane: always Status columns, but we return a nested map or flat list?
            // Actually for swimlane we need a 2D structure.
            // But DragDropContext needs simpler IDs.
            // We'll organize logic inside the render.
        }

        projectTasks.forEach(task => {
            let key = '';
            if (layout === 'board') {
                if (groupBy === 'status') key = getTaskStatus(task);
                else if (groupBy === 'priority') key = task.priority;

                if (groups[key]) groups[key].push(task);
            }
        });

        return groups;
    }, [projectTasks, groupBy, layout, getTaskStatus]);

    // Handle Drag End
    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const task = tasks.find(t => t.id === draggableId);
        if (!task) return;

        // Parse Destination ID (Format: "status::priority" for swimlanes, or just "columnId" for board)
        const destId = destination.droppableId;
        const [destCol, destRow] = destId.split('::');

        let updates: Partial<Task> = {};

        // 1. Determine new Status/Priority based on drop
        if (layout === 'swimlane') {
            // Swimlane: Dest = status::priority (or other group)
            // Groups are Rows (Priority), Cols are Status.
            const newStatus = destCol; // 'todo', 'in_progress', 'done'
            const newGroup = destRow; // 'high', 'medium', 'low'

            // Update Status
            if (newStatus === 'done') updates = { ...updates, completed: true, progress: 100 };
            else if (newStatus === 'in_progress') updates = { ...updates, completed: false, progress: 50 };
            else if (newStatus === 'todo') updates = { ...updates, completed: false, progress: 0 };

            // Update Group (Priority)
            if (groupBy === 'priority') {
                updates = { ...updates, priority: newGroup as Priority };
            }
        } else {
            // Board Mode
            if (groupBy === 'status') {
                if (destId === 'done') updates = { completed: true, progress: 100 };
                else if (destId === 'in_progress') updates = { completed: false, progress: 50 };
                else if (destId === 'todo') updates = { completed: false, progress: 0 };
            } else if (groupBy === 'priority') {
                updates = { priority: destId as Priority };
            }
        }

        updateTask({ ...task, ...updates });

        // Clear selection on drop
        if (selectedTaskIds.size > 0 && !selectedTaskIds.has(task.id)) {
            setSelectedTaskIds(new Set());
        }
    };

    const toggleSelection = (taskId: string, multi: boolean) => {
        const newSet = new Set(multi ? selectedTaskIds : []);
        if (newSet.has(taskId)) newSet.delete(taskId);
        else newSet.add(taskId);
        setSelectedTaskIds(newSet);
    };

    // --- Render Helpers ---

    const renderCard = (task: Task, index: number) => {
        const isSelected = selectedTaskIds.has(task.id);

        // Check Dependencies
        const blockingTasks = task.dependencies?.map(dId => tasks.find(t => t.id === dId)).filter(t => t && !t.completed) || [];
        const isBlocked = blockingTasks.length > 0;

        return (
            <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={cn(
                            "bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border transaction-all group select-none mb-3",
                            isSelected ? "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" :
                                isBlocked ? "border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10" :
                                    "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500",
                            snapshot.isDragging ? "rotate-2 scale-105 shadow-xl z-50 opacity-90" : ""
                        )}
                        onClick={(e) => {
                            if (e.shiftKey || e.ctrlKey || e.metaKey) {
                                e.stopPropagation();
                                toggleSelection(task.id, true);
                            } else {
                                setEditingTask(task);
                                setIsTaskDialogOpen(true);
                            }
                        }}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex gap-2">
                                <Badge variant="outline" className={cn(
                                    "text-[10px] px-1.5 py-0 h-5 font-normal capitalize",
                                    task.priority === 'high' ? "text-red-600 bg-red-50 border-red-100" :
                                        task.priority === 'medium' ? "text-orange-600 bg-orange-50 border-orange-100" :
                                            "text-green-600 bg-green-50 border-green-100"
                                )}>
                                    {task.priority}
                                </Badge>
                                {isBlocked && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal text-red-600 bg-white border-red-200 gap-1" title={`Blocked by: ${blockingTasks.map(t => t?.title).join(', ')}`}>
                                        <Lock className="w-3 h-3" />
                                        <span>{blockingTasks.length}</span>
                                    </Badge>
                                )}
                            </div>
                            {isSelected && <CheckSquare className="w-4 h-4 text-indigo-500" />}
                        </div>
                        <h4 className={cn(
                            "font-medium text-sm leading-snug mb-2",
                            task.completed ? "text-slate-400 line-through" : "text-slate-800 dark:text-slate-200"
                        )}>
                            {task.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            {task.dueDate && (
                                <span className={cn(
                                    "flex items-center gap-1",
                                    new Date(task.dueDate) < new Date() && !task.completed ? "text-red-500 font-medium" : ""
                                )}>
                                    <Flag className="w-3 h-3" />
                                    {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </Draggable>
        );
    };

    return (
        <div className="h-full flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
            {/* Header Toolbar */}
            <div className="flex justify-between items-center mb-6 px-1">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            칸반 보드
                            <Badge variant="secondary" className="text-xs font-normal">Step 2.0</Badge>
                        </h2>
                        <p className="text-sm text-slate-500">프로젝트 진행 상황을 한눈에 파악하세요.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Layout Toggle */}
                    <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-8 px-2", layout === 'board' ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100" : "text-slate-500")}
                            onClick={() => setLayout('board')}
                        >
                            <Layout className="w-4 h-4 mr-1" /> 보드
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-8 px-2", layout === 'swimlane' ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100" : "text-slate-500")}
                            onClick={() => setLayout('swimlane')}
                        >
                            <Layout className="w-4 h-4 mr-1 rotate-90" /> 스윔레인
                        </Button>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Filter className="w-4 h-4" />
                                기준: {groupBy === 'status' ? '상태' : groupBy === 'priority' ? '우선순위' : '담당자'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>그룹화 기준</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setGroupBy('status')}>상태 (Status)</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setGroupBy('priority')}>우선순위 (Priority)</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden min-h-0">
                <DragDropContext onDragEnd={onDragEnd}>
                    {layout === 'board' ? (
                        // --- BOARD LAYOUT ---
                        <div className="flex gap-4 h-full overflow-x-auto pb-4 px-1">
                            {(groupBy === 'status' ? Object.values(statusColumns) : Object.values(priorityGroups)).map((col: any) => (
                                <div key={col.id} className="w-80 flex-shrink-0 flex flex-col bg-slate-100/50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                    <div className="p-3 font-medium text-sm flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-2 h-2 rounded-full", col.color.split(' ')[1] || 'bg-slate-400')} />
                                            {col.title}
                                            <span className="text-xs text-slate-400 font-normal ml-1">
                                                {groupedTasks[col.id]?.length || 0}
                                            </span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setNewTaskStatus(col.id); setIsTaskDialogOpen(true); }}>
                                            <Plus className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <Droppable droppableId={col.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={cn(
                                                    "flex-1 p-2 overflow-y-auto custom-scrollbar min-h-[100px]",
                                                    snapshot.isDraggingOver ? "bg-slate-100 dark:bg-slate-800" : ""
                                                )}
                                            >
                                                {groupedTasks[col.id]?.map((task, idx) => renderCard(task, idx))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // --- SWIMLANE LAYOUT ---
                        <div className="h-full overflow-auto custom-scrollbar pr-2">
                            <div className="min-w-[1000px]">
                                {/* Header Row */}
                                <div className="grid grid-cols-12 gap-0 sticky top-0 z-20 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                    <div className="col-span-1 p-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        {groupBy === 'priority' ? '우선순위' : '그룹'}
                                    </div>
                                    <div className="col-span-11 grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800">
                                        {Object.values(statusColumns).map(col => (
                                            <div key={col.id} className="p-3 text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", col.color)} />
                                                {col.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Swimlanes */}
                                {Object.values(priorityGroups).map(group => (
                                    <div key={group.id} className="grid grid-cols-12 border-b border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900/20">
                                        {/* Row Header */}
                                        <div className="col-span-1 p-4 border-r border-slate-100 dark:border-slate-800/50">
                                            <div className="sticky top-14">
                                                <Badge variant="outline" className={cn("mb-2 w-full justify-center capitalize", group.color)}>
                                                    {group.title}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Status Columns for this Row */}
                                        <div className="col-span-11 grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800/50">
                                            {Object.keys(statusColumns).map(statusKey => {
                                                const dropId = `${statusKey}::${group.id}`;
                                                const cellTasks = projectTasks.filter(t =>
                                                    getTaskStatus(t) === statusKey &&
                                                    t.priority === group.id
                                                );

                                                return (
                                                    <Droppable key={dropId} droppableId={dropId}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                {...provided.droppableProps}
                                                                ref={provided.innerRef}
                                                                className={cn(
                                                                    "p-2 min-h-[150px] transition-colors",
                                                                    snapshot.isDraggingOver ? "bg-slate-50 dark:bg-slate-800/50" : ""
                                                                )}
                                                            >
                                                                {cellTasks.map((task, idx) => renderCard(task, idx))}
                                                                {provided.placeholder}

                                                                {/* Quick Add Button */}
                                                                <button
                                                                    onClick={() => {
                                                                        setNewTaskStatus(statusKey);
                                                                        // need to set priority too? Handled in Dialog if passed
                                                                        // Actually TaskDialog needs to know priority if row selected
                                                                        setIsTaskDialogOpen(true);
                                                                    }}
                                                                    className="w-full py-2 mt-2 text-xs text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded border border-dashed border-transparent hover:border-slate-200 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <Plus className="w-3 h-3" /> 추가
                                                                </button>
                                                            </div>
                                                        )}
                                                    </Droppable>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </DragDropContext>
            </div>

            <TaskDialog
                isOpen={isTaskDialogOpen}
                onOpenChange={setIsTaskDialogOpen}
                projectId={project.id}
                taskToEdit={editingTask}
                defaultStatus={newTaskStatus ? newTaskStatus.split('::')[0] : null}
                initialPriority={newTaskStatus && newTaskStatus.includes('::') ? (newTaskStatus.split('::')[1] as Priority) : undefined}
            />
        </div>
    );
}

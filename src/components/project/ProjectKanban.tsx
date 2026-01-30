'use client';

import { useState, useMemo } from 'react';
import { Project, Task, Priority } from '@/types';
import { useData } from '@/context/DataProvider';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, User, Flag, Filter } from 'lucide-react';
import { TaskDialog } from './TaskDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface ProjectKanbanProps {
    project: Project;
}

type GroupBy = 'status' | 'priority' | 'assignee';

export function ProjectKanban({ project }: ProjectKanbanProps) {
    const { tasks, updateTask } = useData();
    const [groupBy, setGroupBy] = useState<GroupBy>('status');
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [newTaskStatus, setNewTaskStatus] = useState<string | null>(null);

    // Filter tasks for this project
    const projectTasks = useMemo(() => {
        return tasks.filter(t => t.projectId === project.id);
    }, [tasks, project.id]);

    // Define Columns based on GroupBy
    const columns = useMemo(() => {
        if (groupBy === 'status') {
            return {
                todo: { id: 'todo', title: '할 일', tasks: [] as Task[] },
                in_progress: { id: 'in_progress', title: '진행 중', tasks: [] as Task[] },
                review: { id: 'review', title: '검토/대기', tasks: [] as Task[] },
                done: { id: 'done', title: '완료', tasks: [] as Task[] },
            };
        } else if (groupBy === 'priority') {
            return {
                high: { id: 'high', title: '높음 (High)', tasks: [] as Task[] },
                medium: { id: 'medium', title: '중간 (Medium)', tasks: [] as Task[] },
                low: { id: 'low', title: '낮음 (Low)', tasks: [] as Task[] },
            };
        }
        return {}; // Assignee generic handling below
    }, [groupBy]);

    // Organize tasks into columns
    const boardData = useMemo(() => {
        if (groupBy === 'status') {
            const board = {
                todo: { id: 'todo', title: '할 일', tasks: [] as Task[] },
                in_progress: { id: 'in_progress', title: '진행 중', tasks: [] as Task[] },
                review: { id: 'review', title: '검토/대기', tasks: [] as Task[] },
                done: { id: 'done', title: '완료', tasks: [] as Task[] },
            };

            projectTasks.forEach(task => {
                // Map existing boolean 'completed' to status if no explicit status field exists
                // Assuming we might want to add a status field to Task type or infer it.
                // For now, let's assume specific Logic or use 'completed' flag.
                // If completed -> done. Else -> todo (default).
                // To support true Kanban, we need a status field. 
                // Let's use `remarks` or `type` temporarily if needed, 
                // BUT better to just infer from existing fields: 
                // completed=true -> done.
                // completed=false -> todo.
                // Wait, this is too simple.
                // Let's use a local map or just use 'completed' for now.
                // Refinement: Add 'status' field to Task in previous step? No I didn't.
                // PROPOSAL: Use 'remarks' to store 'in_progress' etc, or just stick to Todo/Done.

                // Let's stick to 2 columns for now: Remaining vs Completed if schema prevents it.
                // OR, assume `completed` = done.
                // If `progress` > 0 && < 100 -> in_progress?

                if (task.completed) {
                    board.done.tasks.push(task);
                } else if ((task.progress || 0) > 0) {
                    board.in_progress.tasks.push(task);
                } else {
                    board.todo.tasks.push(task);
                }
            });
            return board;
        } else if (groupBy === 'priority') {
            const board = {
                high: { id: 'high', title: '높음', tasks: [] as Task[] },
                medium: { id: 'medium', title: '중간', tasks: [] as Task[] },
                low: { id: 'low', title: '낮음', tasks: [] as Task[] },
            };
            projectTasks.forEach(task => {
                if (board[task.priority]) {
                    board[task.priority].tasks.push(task);
                }
            });
            return board;
        }
        return {};
    }, [projectTasks, groupBy]);

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const task = tasks.find(t => t.id === draggableId);
        if (!task) return;

        // Handle Status Change
        if (groupBy === 'status') {
            const newStatus = destination.droppableId;
            let updates: Partial<Task> = {};

            if (newStatus === 'done') {
                updates = { completed: true, progress: 100 };
            } else if (newStatus === 'in_progress') {
                updates = { completed: false, progress: 50 }; // Arbitrary 50%
            } else if (newStatus === 'todo') {
                updates = { completed: false, progress: 0 };
            }
            // 'review' logic omitted for simplicity unless field exists

            updateTask({ ...task, ...updates });
        } else if (groupBy === 'priority') {
            const newPriority = destination.droppableId as Priority;
            updateTask({ ...task, priority: newPriority });
        }
    };

    const handleCreateTask = (status: string) => {
        setNewTaskStatus(status);
        setEditingTask(null);
        setIsTaskDialogOpen(true);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold">칸반 보드</h2>
                    <p className="text-sm text-muted-foreground">{project.title}의 작업을 상태별로 관리합니다.</p>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Filter className="w-4 h-4" />
                                보기: {groupBy === 'status' ? '상태' : groupBy === 'priority' ? '우선순위' : '담당자'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>그룹화 기준</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setGroupBy('status')}>
                                상태별 (Status)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setGroupBy('priority')}>
                                우선순위별 (Priority)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto min-w-0">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-6 h-full min-w-max pb-4">
                        {Object.values(boardData).map((column: any) => (
                            <div key={column.id} className="w-80 flex-shrink-0 flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                {/* Column Header */}
                                <div className="p-4 flex items-center justify-between sticky top-0 bg-inherit rounded-t-xl z-10">
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            column.id === 'done' ? "bg-green-500" :
                                                column.id === 'in_progress' ? "bg-blue-500" :
                                                    column.id === 'high' ? "bg-red-500" :
                                                        "bg-gray-400"
                                        )} />
                                        <h3 className="font-bold text-sm tracking-tight">{column.title}</h3>
                                        <span className="text-xs text-muted-foreground bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full border">
                                            {column.tasks.length}
                                        </span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCreateTask(column.id)}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Task List */}
                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={cn(
                                                "flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar",
                                                snapshot.isDraggingOver ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                                            )}
                                        >
                                            {column.tasks.map((task: Task, index: number) => (
                                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={cn(
                                                                "bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group select-none",
                                                                snapshot.isDragging ? "rotate-2 scale-105 shadow-xl ring-2 ring-primary z-50" : ""
                                                            )}
                                                            onClick={() => {
                                                                setEditingTask(task);
                                                                setIsTaskDialogOpen(true);
                                                            }}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <Badge variant="outline" className={cn(
                                                                    "text-[10px] px-1.5 py-0 h-5 font-normal",
                                                                    task.priority === 'high' ? "text-red-500 border-red-200 bg-red-50" :
                                                                        task.priority === 'medium' ? "text-orange-500 border-orange-200 bg-orange-50" :
                                                                            "text-green-500 border-green-200 bg-green-50"
                                                                )}>
                                                                    {task.priority.toUpperCase()}
                                                                </Badge>
                                                                <div className="flex -space-x-1">
                                                                    {/* Assignee Avatar Placeholder - if we had assignees */}
                                                                    {/* <Avatar className="w-5 h-5 border-2 border-white">
                                                                        <AvatarFallback className="text-[8px] bg-blue-100 text-blue-600">JH</AvatarFallback>
                                                                    </Avatar> */}
                                                                </div>
                                                            </div>
                                                            <h4 className="font-medium text-sm mb-3 leading-snug group-hover:text-primary transition-colors">
                                                                {task.title}
                                                            </h4>
                                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                                <div className="flex items-center gap-2">
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
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            </div>

            <TaskDialog
                isOpen={isTaskDialogOpen}
                onOpenChange={setIsTaskDialogOpen}
                projectId={project.id}
                taskToEdit={editingTask}
            />
        </div>
    );
}

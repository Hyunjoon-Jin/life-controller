'use client';

import { useState, useMemo } from 'react';
import { Project, Task } from '@/types';
import { useData } from '@/context/DataProvider';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, differenceInDays, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { TaskDialog } from './TaskDialog';

interface GanttChartProps {
    project: Project;
}

export function GanttChart({ project }: GanttChartProps) {
    const { tasks } = useData();
    const [viewDate, setViewDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'week' | 'month'>('month');

    // Task Dialog State
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const handleCreateTask = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setEditingTask(null);
        setIsTaskDialogOpen(true);
    };

    const handleEditTask = (task: Task, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setEditingTask(task);
        setIsTaskDialogOpen(true);
    };

    // Filter tasks for this project AND ensure they are timeline tasks
    const projectTasks = useMemo(() => {
        return tasks.filter(t => t.projectId === project.id && t.source === 'timeline');
    }, [tasks, project.id]);

    // Calculate timeline range
    const startDate = viewMode === 'month' ? startOfMonth(viewDate) : startOfWeek(viewDate, { weekStartsOn: 0 });
    const endDate = viewMode === 'month' ? endOfMonth(viewDate) : endOfWeek(viewDate, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const handlePrev = () => {
        if (viewMode === 'month') {
            setViewDate(prev => addDays(startOfMonth(prev), -1));
        } else {
            setViewDate(prev => addDays(prev, -7));
        }
    };

    const handleNext = () => {
        if (viewMode === 'month') {
            setViewDate(prev => addDays(endOfMonth(prev), 1));
        } else {
            setViewDate(prev => addDays(prev, 7));
        }
    };

    const getTaskStyle = (task: Task) => {
        const tStart = task.startDate ? new Date(task.startDate) : new Date(); // Default to today if missing? Or should hide?
        const tEnd = task.endDate ? new Date(task.endDate) : (task.deadline ? new Date(task.deadline) : tStart);

        // Improve End Date Logic: If end < start, fix it visually
        const safeEnd = tEnd < tStart ? tStart : tEnd;

        // Calculate offset and width relative to view startDate
        const offset = differenceInDays(tStart, startDate);
        const duration = differenceInDays(safeEnd, tStart) + 1; // +1 to include the last day

        // If outside view, return hidden or clipped
        // Simple logic for now: visual implementation
        // Assuming 1 day = 40px (column width)

        return {
            left: `${offset * 100}px`, // Using percentages via grid might be better, but pixels for scrolling is easier
            width: `${duration * 100}px`
        };
    };

    // Grid Column Setup
    // Ensure we handle overflow if tasks extend beyond view, but for Month view pagination is safer.
    // Let's implement a scrollable area.

    // Drag & Drop State
    const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
    const [dragStartX, setDragStartX] = useState<number>(0);
    const [dragOffsetDays, setDragOffsetDays] = useState<number>(0);

    const { updateTask } = useData();

    // Handlers
    const handleDragStart = (e: React.MouseEvent, taskId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggingTaskId(taskId);
        setDragStartX(e.clientX);
        setDragOffsetDays(0);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingTaskId) return;
        const deltaX = e.clientX - dragStartX;
        const days = Math.round(deltaX / CELL_WIDTH);
        setDragOffsetDays(days);
    };

    const handleMouseUp = () => {
        if (draggingTaskId) {
            if (dragOffsetDays !== 0) {
                const task = tasks.find(t => t.id === draggingTaskId);
                if (task) {
                    const currentStart = task.startDate ? new Date(task.startDate) : new Date();
                    const currentEnd = task.endDate ? new Date(task.endDate) : (task.deadline || currentStart);

                    updateTask({
                        ...task,
                        startDate: addDays(currentStart, dragOffsetDays),
                        endDate: addDays(currentEnd, dragOffsetDays)
                    });
                }
            }
        }
        setDraggingTaskId(null);
        setDragOffsetDays(0);
    };

    const CELL_WIDTH = 40;
    const ROW_HEIGHT = 50;

    return (
        <div
            className="flex flex-col h-full bg-card rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300 select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={handlePrev}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="font-bold min-w-[120px] text-center">
                        {format(viewDate, 'yyyy년 M월', { locale: ko })}
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleNext}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('week')}
                    >
                        주간
                    </Button>
                    <Button
                        variant={viewMode === 'month' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('month')}
                    >
                        월간
                    </Button>
                    <Button size="sm" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200/50 shadow-sm" onClick={handleCreateTask}>
                        <Plus className="w-4 h-4 mr-1" /> 작업 추가
                    </Button>
                </div>
            </div>

            {/* Gantt Content */}
            <div className="flex-1 overflow-auto custom-scrollbar relative">
                <div className="min-w-fit relative">
                    {/* Header Row (Dates) */}
                    <div className="flex border-b border-gray-200 sticky top-0 bg-card z-30" style={{ height: 40 }}>
                        <div className="w-[200px] flex-shrink-0 border-r border-gray-200 p-2 font-semibold bg-white dark:bg-zinc-950 flex items-center sticky left-0 z-50 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
                            작업명
                        </div>
                        <div className="flex">
                            {days.map(day => (
                                <div
                                    key={day.toISOString()}
                                    className={cn(
                                        "flex-shrink-0 border-r border-gray-200 flex flex-col items-center justify-center text-xs",
                                        isSameDay(day, new Date()) ? "bg-blue-50" : ""
                                    )}
                                    style={{ width: CELL_WIDTH }}
                                >
                                    <span className="text-muted-foreground">{format(day, 'E', { locale: ko })}</span>
                                    <span className={cn("font-bold", isSameDay(day, new Date()) ? "text-primary" : "")}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dependency Lines Overlay */}
                    <svg className="absolute top-[40px] left-[200px] w-full h-full pointer-events-none z-20 overflow-visible">
                        {projectTasks.map((task, index) => {
                            if (!task.dependencies || task.dependencies.length === 0) return null;

                            const tStart = task.startDate ? new Date(task.startDate) : new Date();
                            const offset = draggingTaskId === task.id ? dragOffsetDays : 0;
                            const displayStart = addDays(tStart, offset);
                            const startX = differenceInDays(displayStart, startDate) * CELL_WIDTH;
                            const startY = index * ROW_HEIGHT + (ROW_HEIGHT / 2);

                            return task.dependencies.map(depId => {
                                const depIndex = projectTasks.findIndex(t => t.id === depId);
                                if (depIndex === -1) return null;

                                const depTask = projectTasks[depIndex];
                                const depEnd = depTask.endDate ? new Date(depTask.endDate) : (depTask.deadline ? new Date(depTask.deadline) : (depTask.startDate ? new Date(depTask.startDate) : new Date()));
                                const depOffset = draggingTaskId === depTask.id ? dragOffsetDays : 0;
                                const displayDepEnd = addDays(depEnd, depOffset);

                                // End of dependency (Predecessor)
                                const endX = (differenceInDays(displayDepEnd, startDate) + 1) * CELL_WIDTH;
                                const endY = depIndex * ROW_HEIGHT + (ROW_HEIGHT / 2);

                                // Draw elbow connector
                                const midX = (endX + startX) / 2;

                                // Path Logic
                                // M endX, endY -> L midX, endY -> L midX, startY -> L startX, startY
                                // But if startX < endX (backward dependency), we might need complex path.
                                // Simple Curve: C (endX + 20), endY (startX - 20), startY startX, startY

                                return (
                                    <g key={`${depId}-${task.id}`}>
                                        <path
                                            d={`M ${endX} ${endY} C ${endX + 20} ${endY}, ${startX - 20} ${startY}, ${startX} ${startY}`}
                                            fill="none"
                                            stroke="#94a3b8"
                                            strokeWidth="2"
                                            markerEnd="url(#arrowhead)"
                                        />
                                    </g>
                                );
                            });
                        })}
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                            </marker>
                        </defs>
                    </svg>

                    {/* Task Rows */}
                    <div className="relative">
                        {projectTasks.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground">
                                등록된 작업이 없습니다.
                            </div>
                        )}
                        {projectTasks.map(task => {
                            const isDragging = draggingTaskId === task.id;
                            const offset = isDragging ? dragOffsetDays : 0;

                            const tStart = task.startDate ? new Date(task.startDate) : new Date();
                            const tEnd = task.endDate ? new Date(task.endDate) : (task.deadline || tStart);

                            const displayStart = addDays(tStart, offset);
                            const displayEnd = addDays(tEnd, offset);

                            const startIndex = differenceInDays(displayStart, startDate);
                            const duration = differenceInDays(displayEnd, displayStart) + 1;

                            return (
                                <div
                                    key={task.id}
                                    className="flex border-b border-gray-200 hover:bg-muted/10 items-center group cursor-pointer even:bg-muted/5 transition-colors"
                                    style={{ height: ROW_HEIGHT }}
                                    onClick={(e) => handleEditTask(task, e)}
                                >
                                    <div className="w-[200px] flex-shrink-0 border-r border-gray-200 p-3 text-sm truncate bg-white dark:bg-zinc-950 sticky left-0 z-40 font-medium shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
                                        {task.title}
                                    </div>
                                    <div className="relative flex-1 h-full bg-white/50 dark:bg-zinc-950/50">
                                        {/* Grid Background */}
                                        <div className="absolute inset-0 flex pointer-events-none">
                                            {days.map(day => (
                                                <div
                                                    key={'bg-' + day.toISOString()}
                                                    className="flex-shrink-0 border-r border-gray-200 h-full "
                                                    style={{ width: CELL_WIDTH }}
                                                />
                                            ))}
                                        </div>

                                        {/* Task Bar */}
                                        <div
                                            className={cn(
                                                "absolute h-6 top-[13px] rounded-md shadow-sm flex items-center px-2 text-white text-xs whitespace-nowrap overflow-hidden transition-all",
                                                // Color Coding based on Type
                                                task.type === 'work' ? "bg-blue-500 hover:bg-blue-600" :
                                                    task.type === 'study' ? "bg-green-500 hover:bg-green-600" :
                                                        task.type === 'personal' ? "bg-purple-500 hover:bg-purple-600" :
                                                            task.type === 'health' ? "bg-red-500 hover:bg-red-600" :
                                                                task.type === 'finance' ? "bg-yellow-500 hover:bg-yellow-600" :
                                                                    "bg-gray-500 hover:bg-gray-600",

                                                isDragging ? "cursor-grabbing ring-2 ring-primary ring-offset-2 z-50 opacity-90 shadow-xl" : "cursor-grab"
                                            )}
                                            style={{
                                                left: startIndex * CELL_WIDTH,
                                                width: Math.max(CELL_WIDTH, duration * CELL_WIDTH) - 4 // -4 margin
                                            }}
                                            title={`${format(displayStart, 'MM.dd')} - ${format(displayEnd, 'MM.dd')}`}
                                            onMouseDown={(e) => handleDragStart(e, task.id)}
                                        >
                                            {task.title}
                                            {isDragging && (
                                                <span className="ml-2 bg-black/20 px-1 rounded text-[10px]">
                                                    {dragOffsetDays > 0 ? `+${dragOffsetDays}일` : dragOffsetDays < 0 ? `${dragOffsetDays}일` : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {/* Task Dialog */}
            <TaskDialog
                isOpen={isTaskDialogOpen}
                onOpenChange={setIsTaskDialogOpen}
                projectId={project.id}
                taskToEdit={editingTask}
            />
        </div>
    );
}

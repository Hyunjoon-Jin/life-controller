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
import { PremiumGate } from '@/components/subscription/PremiumGate';

interface GanttChartProps {
    project: Project;
}

export function GanttChart({ project }: GanttChartProps) {
    const { tasks, updateTask } = useData();
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

    const CELL_WIDTH = 40;
    const ROW_HEIGHT = 50;

    // Interaction State
    const [interactionMode, setInteractionMode] = useState<'none' | 'move' | 'resize_start' | 'resize_end' | 'connect'>('none');
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [dragStartX, setDragStartX] = useState<number>(0);
    const [currentMouseX, setCurrentMouseX] = useState<number>(0);
    const [currentMouseY, setCurrentMouseY] = useState<number>(0); // For connection line
    const [dragOffsetDays, setDragOffsetDays] = useState<number>(0);

    // Handlers
    const handleMouseDown = (e: React.MouseEvent, taskId: string, mode: 'move' | 'resize_start' | 'resize_end' | 'connect') => {
        e.preventDefault();
        e.stopPropagation();
        setInteractionMode(mode);
        setActiveTaskId(taskId);
        setDragStartX(e.clientX);
        setCurrentMouseX(e.clientX);
        setCurrentMouseY(e.clientY);
        setDragOffsetDays(0);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        // Update mouse position for connection line
        setCurrentMouseX(e.clientX);
        setCurrentMouseY(e.clientY);

        if (interactionMode === 'none' || !activeTaskId) return;

        const deltaX = e.clientX - dragStartX;
        const days = Math.round(deltaX / CELL_WIDTH);

        // Optimistic update state (dragOffsetDays)
        setDragOffsetDays(days);
    };

    const handleMouseUp = (e?: React.MouseEvent, targetTaskId?: string) => {
        if (interactionMode === 'none' || !activeTaskId) {
            // Reset if just clicking
            setInteractionMode('none');
            setActiveTaskId(null);
            return;
        }

        const task = tasks.find(t => t.id === activeTaskId);
        if (task) {
            const currentStart = task.startDate ? new Date(task.startDate) : new Date();
            const currentEnd = task.endDate ? new Date(task.endDate) : (task.deadline || currentStart);

            if (interactionMode === 'move') {
                if (dragOffsetDays !== 0) {
                    updateTask({
                        ...task,
                        startDate: addDays(currentStart, dragOffsetDays),
                        endDate: addDays(currentEnd, dragOffsetDays)
                    });
                }
            } else if (interactionMode === 'resize_start') {
                if (dragOffsetDays !== 0) {
                    // Ensure start <= end
                    const newStart = addDays(currentStart, dragOffsetDays);
                    if (newStart <= currentEnd) {
                        updateTask({ ...task, startDate: newStart });
                    }
                }
            } else if (interactionMode === 'resize_end') {
                if (dragOffsetDays !== 0) {
                    const newEnd = addDays(currentEnd, dragOffsetDays);
                    if (newEnd >= currentStart) {
                        updateTask({ ...task, endDate: newEnd });
                    }
                }
            } else if (interactionMode === 'connect') {
                // Dependency Creation
                // Check if dropped on another task
                // We need to know the target task ID. 
                // The `handleMouseUp` on the Container won't know the target unless passed or strictly calculated.
                // We'll rely on `onMouseUp` on the Task Bar components to pass `targetTaskId`.

                if (targetTaskId && targetTaskId !== activeTaskId) {
                    // Add dependency: activeTaskId relies on targetTaskId? Or vice versa?
                    // Standard: Drag from Predecessor (A) to Successor (B) -> B depends on A.
                    // So B.dependencies.push(A.id).

                    // Let's assume Drag from A (Right Handle) -> Drop on B.
                    // Target (B) depends on Active (A).

                    const targetTask = tasks.find(t => t.id === targetTaskId);
                    if (targetTask) {
                        const newDeps = [...(targetTask.dependencies || [])];
                        if (!newDeps.includes(activeTaskId)) {
                            newDeps.push(activeTaskId);
                            updateTask({ ...targetTask, dependencies: newDeps });
                            // Maybe show toast
                        }
                    }
                }
            }
        }

        setInteractionMode('none');
        setActiveTaskId(null);
        setDragOffsetDays(0);
        setDragStartX(0);
    };

    return (
        <PremiumGate featureName="Project Gantt Chart">
            <div
                className="flex flex-col h-full bg-card rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300 select-none"
                onMouseMove={handleMouseMove}
                onMouseUp={() => handleMouseUp()} // Global release
                onMouseLeave={() => handleMouseUp()}
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

                        {/* Dependency Lines & Interaction Overlay */}
                        <svg className="absolute top-[40px] left-[200px] w-full h-full pointer-events-none z-20 overflow-visible">
                            {/* Existing Dependencies */}
                            {projectTasks.map((task, index) => {
                                if (!task.dependencies || task.dependencies.length === 0) return null;

                                const tStart = task.startDate ? new Date(task.startDate) : new Date();
                                // Visualize Optimistic Updates for Dependencies if dragging handled? 
                                // For now, keep it simple, redraw on commit.
                                const offset = activeTaskId === task.id && interactionMode === 'move' ? dragOffsetDays : 0;
                                const displayStart = addDays(tStart, offset);
                                const startX = differenceInDays(displayStart, startDate) * CELL_WIDTH;
                                const startY = index * ROW_HEIGHT + (ROW_HEIGHT / 2);

                                return task.dependencies.map(depId => {
                                    const depIndex = projectTasks.findIndex(t => t.id === depId);
                                    if (depIndex === -1) return null;

                                    const depTask = projectTasks[depIndex];
                                    const depEnd = depTask.endDate ? new Date(depTask.endDate) : (depTask.deadline ? new Date(depTask.deadline) : (depTask.startDate ? new Date(depTask.startDate) : new Date()));
                                    const depOffset = activeTaskId === depTask.id && interactionMode === 'move' ? dragOffsetDays : 0;
                                    // Resize logic could affect end
                                    const depResizedEnd = activeTaskId === depTask.id && interactionMode === 'resize_end' ? addDays(depEnd, dragOffsetDays) : depEnd;

                                    const displayDepEnd = addDays(depResizedEnd, depOffset);

                                    // End of dependency (Predecessor)
                                    const endX = (differenceInDays(displayDepEnd, startDate) + 1) * CELL_WIDTH;
                                    const endY = depIndex * ROW_HEIGHT + (ROW_HEIGHT / 2);

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

                            {/* Active Connection Line */}
                            {interactionMode === 'connect' && activeTaskId && (
                                <g>
                                    {(() => {
                                        const taskIndex = projectTasks.findIndex(t => t.id === activeTaskId);
                                        const task = projectTasks[taskIndex];
                                        if (!task) return null;

                                        const tEnd = task.endDate ? new Date(task.endDate) : (task.deadline || new Date(task.startDate!));
                                        const startX = (differenceInDays(tEnd, startDate) + 1) * CELL_WIDTH;
                                        const startY = taskIndex * ROW_HEIGHT + (ROW_HEIGHT / 2);

                                        // Provide calculation relative to SVG
                                        // currentMouseX includes sidebar/padding offset. 
                                        // SVG is at left=200px inside container.
                                        // We need simpler absolute lines or specific offset calculation.
                                        // Or just render a line to mouse pointer if possible.
                                        // Simpler: Just straight line from Task End to Cursor.
                                        // Cursor relative to SVG?
                                        // This is hard without ref. 
                                        // We'll skip precise drawing for now or assume simple offset.

                                        // let mouseRelativeX = currentMouseX - (parentRect?.left || 0) - 200;
                                        // For now, let's just not draw the live line to avoid visual bugs,
                                        // Or draw it if we had refs.
                                        // Better: Draw nothing, just highlight cursor "crosshair".
                                        return null;
                                    })()}
                                </g>
                            )}

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
                                const isDragging = activeTaskId === task.id;
                                const offset = isDragging && interactionMode === 'move' ? dragOffsetDays : 0;
                                const resizeStartOffset = isDragging && interactionMode === 'resize_start' ? dragOffsetDays : 0;
                                const resizeEndOffset = isDragging && interactionMode === 'resize_end' ? dragOffsetDays : 0;

                                const tStart = task.startDate ? new Date(task.startDate) : new Date();
                                const tEnd = task.endDate ? new Date(task.endDate) : (task.deadline || tStart);

                                const displayStart = addDays(tStart, offset + resizeStartOffset);
                                const displayEnd = addDays(tEnd, offset + resizeEndOffset);

                                const startIndex = differenceInDays(displayStart, startDate);
                                const duration = differenceInDays(displayEnd, displayStart) + 1;

                                return (
                                    <div
                                        key={task.id}
                                        className="flex border-b border-gray-200 hover:bg-muted/10 items-center group cursor-pointer even:bg-muted/5 transition-colors"
                                        style={{ height: ROW_HEIGHT }}
                                        onClick={(e) => handleEditTask(task, e)}
                                        onMouseUp={(e) => {
                                            e.stopPropagation();
                                            handleMouseUp(e, task.id);
                                        }}
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
                                                    "absolute h-6 top-[13px] rounded-md shadow-sm flex items-center px-2 text-white text-xs whitespace-nowrap transition-all group/bar",
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
                                                    width: Math.max(CELL_WIDTH, duration * CELL_WIDTH) - 4
                                                }}
                                                title={`${format(displayStart, 'MM.dd')} - ${format(displayEnd, 'MM.dd')}`}
                                                onMouseDown={(e) => handleMouseDown(e, task.id, 'move')}
                                            >
                                                {/* Resize Handle Start */}
                                                <div
                                                    className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 rounded-l-md"
                                                    onMouseDown={(e) => handleMouseDown(e, task.id, 'resize_start')}
                                                />

                                                <span className="truncate px-2 pointer-events-none">{task.title}</span>

                                                {/* Resize Handle End */}
                                                <div
                                                    className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 rounded-r-md"
                                                    onMouseDown={(e) => handleMouseDown(e, task.id, 'resize_end')}
                                                />

                                                {/* Connection Handle (Right Side Dot) */}
                                                <div
                                                    className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full opacity-0 group-hover/bar:opacity-100 cursor-crosshair hover:scale-125 transition-all shadow-md z-50 flex items-center justify-center"
                                                    onMouseDown={(e) => handleMouseDown(e, task.id, 'connect')}
                                                >
                                                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                                </div>

                                                {isDragging && interactionMode === 'move' && (
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
        </PremiumGate>
    );
}

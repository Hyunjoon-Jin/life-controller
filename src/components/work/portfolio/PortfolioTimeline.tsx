import React from 'react';
import { Project } from '@/types';
import { format, differenceInDays, addMonths, startOfMonth, endOfMonth, eachMonthOfInterval, isWithinInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PortfolioTimelineProps {
    projects: Project[];
    onOpenProject: (id: string) => void;
}

export function PortfolioTimeline({ projects, onOpenProject }: PortfolioTimelineProps) {
    const today = new Date();
    const startRange = startOfMonth(addMonths(today, -2));
    const endRange = endOfMonth(addMonths(today, 6)); // 6 months ahead
    const months = eachMonthOfInterval({ start: startRange, end: endRange });
    const totalDays = differenceInDays(endRange, startRange);

    const getPositionStyle = (start?: Date, end?: Date) => {
        if (!start && !end) return { left: '0%', width: '0%' };

        const validStart = start ? new Date(start) : new Date();
        const validEnd = end ? new Date(end) : new Date(validStart.getTime() + 86400000 * 30); // Default 30 days if no end

        // Clamp to range
        const effectiveStart = validStart < startRange ? startRange : validStart;
        const effectiveEnd = validEnd > endRange ? endRange : validEnd;

        if (effectiveStart > endRange || effectiveEnd < startRange) return { display: 'none' };

        const startOffset = differenceInDays(effectiveStart, startRange);
        const duration = differenceInDays(effectiveEnd, effectiveStart) + 1;

        const leftPct = (startOffset / totalDays) * 100;
        const widthPct = (duration / totalDays) * 100;

        return { left: `${leftPct}%`, width: `${widthPct}%` };
    };

    return (
        <div className="border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col h-[600px]">
            {/* Timeline Header */}
            <div className="flex border-b bg-muted/30">
                <div className="w-64 p-4 font-semibold border-r shrink-0 bg-background z-10 sticky left-0">프로젝트명</div>
                <div className="flex-1 relative h-12">
                    <div className="absolute inset-0 flex">
                        {months.map(month => (
                            <div key={month.toString()} className="flex-1 border-r text-xs text-muted-foreground p-2 font-medium text-center bg-background/50">
                                {format(month, 'yyyy년 M월', { locale: ko })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="divide-y">
                    {projects.map(project => {
                        const style = getPositionStyle(project.startDate, project.endDate);

                        return (
                            <div key={project.id} className="flex group hover:bg-muted/30 transition-colors">
                                <div className="w-64 p-3 border-r shrink-0 bg-background z-10 sticky left-0 flex items-center gap-2">
                                    <div className={`w-1 h-8 rounded-full ${project.color ? `bg-[${project.color}]` : 'bg-gray-400'}`} style={{ backgroundColor: project.color }} />
                                    <div>
                                        <div
                                            className="font-medium text-sm truncate w-52 cursor-pointer hover:underline hover:text-primary"
                                            onClick={() => onOpenProject(project.id)}
                                        >
                                            {project.title}
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            {project.status === 'active' && <span className="text-blue-500">🔵 진행중</span>}
                                            {project.status === 'completed' && <span className="text-green-500">🟢 완료</span>}
                                            {project.status === 'hold' && <span className="text-orange-500">🟠 보류</span>}
                                            {project.health === 'at-risk' && <span className="bg-red-100 text-red-600 px-1 rounded ml-1">주의</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 relative h-14 bg-repeat-x" style={{ backgroundImage: 'linear-gradient(to right, transparent 0%, transparent 99%, #f1f5f9 100%)', backgroundSize: `${100 / months.length}% 100%` }}>
                                    {/* Project Bar */}
                                    {/* Today Marker */}
                                    <div
                                        className="absolute top-0 bottom-0 border-l-2 border-red-500 z-0 opacity-50 pointer-events-none"
                                        style={{ left: `${(differenceInDays(today, startRange) / totalDays) * 100}%` }}
                                    />

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={cn(
                                                        "absolute h-8 top-3 rounded-md shadow-sm border flex items-center px-2 text-xs font-medium text-white cursor-pointer hover:brightness-110 transition-all truncate",
                                                        "bg-primary" // Default
                                                    )}
                                                    style={{
                                                        ...style,
                                                        backgroundColor: project.color || '#64748b'
                                                    }}
                                                    onClick={() => onOpenProject(project.id)}
                                                >
                                                    {project.progress !== undefined && (
                                                        <div
                                                            className="absolute left-0 top-0 bottom-0 bg-black/10 rounded-l-md"
                                                            style={{ width: `${project.progress}%` }}
                                                        />
                                                    )}
                                                    <span className="relative z-10 drop-shadow-md">{project.title}</span>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="font-bold">{project.title}</p>
                                                <p className="text-xs">
                                                    {format(new Date(project.startDate || new Date()), 'MM.dd')} ~ {format(new Date(project.endDate || new Date()), 'MM.dd')}
                                                </p>
                                                <p className="text-xs">진척도: {project.progress}%</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}

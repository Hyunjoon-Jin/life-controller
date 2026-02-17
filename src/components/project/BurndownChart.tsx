import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Task, Project } from '@/types';
import { format, differenceInDays, addDays, isAfter, isBefore, startOfDay, isSameDay } from 'date-fns';

interface BurndownChartProps {
    project: Project;
    tasks: Task[];
}

export function BurndownChart({ project, tasks }: BurndownChartProps) {
    const data = useMemo(() => {
        if (!project.startDate || !project.endDate) return [];

        const start = startOfDay(new Date(project.startDate));
        const end = startOfDay(new Date(project.endDate));
        const totalDays = differenceInDays(end, start) + 1;

        // Calculate Total Scope (Estimated Time or Count)
        // Using Task Count for simplicity if estimatedTime is missing often
        const totalTasks = tasks.length;
        const totalEstimatedMinutes = tasks.reduce((acc, t) => acc + (t.estimatedTime || 60), 0); // Default 60 mins if missing

        const chartData = [];
        let remainingScope = totalEstimatedMinutes;

        // Map tasks by completion date
        const completedTasksByDate: Record<string, number> = {};
        tasks.forEach(t => {
            if (t.completed && t.completedAt) {
                const dateKey = format(new Date(t.completedAt), 'yyyy-MM-dd');
                completedTasksByDate[dateKey] = (completedTasksByDate[dateKey] || 0) + (t.estimatedTime || 60);
            }
        });

        // Ideal Burn Rate
        const burnRate = totalEstimatedMinutes / totalDays;

        for (let i = 0; i < totalDays; i++) {
            const currentDate = addDays(start, i);
            const dateKey = format(currentDate, 'yyyy-MM-dd');

            // Ideal Line
            const ideal = Math.max(0, totalEstimatedMinutes - (burnRate * i));

            // Actual Line
            // If date is in future, don't show actual
            const isFuture = isAfter(currentDate, new Date());
            let actual = undefined;

            if (!isFuture || isSameDay(currentDate, new Date())) {
                // Determine cumulative completed up to this date
                // Optimize: Loop assumes sequential.
                // Better: Decrement remainingScope by completedTasks on this date.
                const completedToday = completedTasksByDate[dateKey] || 0;
                remainingScope -= completedToday;
                actual = Math.max(0, remainingScope);
            }

            chartData.push({
                date: format(currentDate, 'MM/dd'),
                ideal: Math.round(ideal),
                actual: actual !== undefined ? Math.round(actual) : null,
            });
        }

        return chartData;
    }, [project, tasks]);

    if (!project.startDate || !project.endDate) {
        return <div className="h-full flex items-center justify-center text-muted-foreground text-sm">프로젝트 기간이 설정되지 않았습니다.</div>;
    }

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="ideal"
                        stroke="#94a3b8"
                        strokeDasharray="5 5"
                        name="목표 (Ideal)"
                        dot={false}
                        strokeWidth={2}
                    />
                    <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#3b82f6"
                        name="실제 (Actual)"
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                        connectNulls
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}


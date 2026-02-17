"use client"

import { useMemo } from 'react';
import { Project } from '@/types';
import { useData } from '@/context/DataProvider';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface TimeAnalyticsProps {
    project: Project;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function TimeAnalytics({ project }: TimeAnalyticsProps) {
    const { tasks } = useData();

    // Data Processing
    const projectTasks = useMemo(() => tasks.filter(t => t.projectId === project.id), [tasks, project.id]);

    const statusData = useMemo(() => {
        const completed = projectTasks.filter(t => t.completed).length;
        const remaining = projectTasks.length - completed;
        return [
            { name: '완료됨', value: completed },
            { name: '진행 중', value: remaining }
        ];
    }, [projectTasks]);

    const priorityData = useMemo(() => {
        const high = projectTasks.filter(t => t.priority === 'high').length;
        const medium = projectTasks.filter(t => t.priority === 'medium').length;
        const low = projectTasks.filter(t => t.priority === 'low').length;
        return [
            { name: '높음', value: high, fill: '#ef4444' },
            { name: '중간', value: medium, fill: '#f59e0b' },
            { name: '낮음', value: low, fill: '#3b82f6' }
        ];
    }, [projectTasks]);

    // Simple Time/Date Distribution (Tasks created/due distribution mock)
    // In a real scenario, we'd aggregated logs. Here we us simple counts.

    const completionRate = projectTasks.length > 0
        ? Math.round((projectTasks.filter(t => t.completed).length / projectTasks.length) * 100)
        : 0;


    // Workload Heatmap Data
    const heatmapData = useMemo(() => {
        const data: { [key: string]: number } = {};
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        projectTasks.forEach(task => {
            if (task.startDate) {
                const dateStr = new Date(task.startDate).toISOString().split('T')[0];
                data[dateStr] = (data[dateStr] || 0) + 1;
            }
            if (task.dueDate) {
                const dateStr = new Date(task.dueDate).toISOString().split('T')[0];
                data[dateStr] = (data[dateStr] || 0) + 1;
            }
        });

        // Fill empty days for the last 365 days
        const result = [];
        for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            result.push({
                date: dateStr,
                count: data[dateStr] || 0
            });
        }
        return result;
    }, [projectTasks]);

    // Burn-down Chart Mock Data (Simulated based on project duration)
    const burndownData = useMemo(() => {
        // Ideal: Linear drop from total tasks to 0 between start and end of project
        // Actual: Count remained tasks over time. 
        // Since we lack historical event logs in this simple app, we'll simulate "Ideal" vs "Current Snapshot"
        // For a real app, we'd need a separate 'History' table.

        const total = projectTasks.length;
        if (total === 0) return [];

        return [
            { name: 'Start', ideal: total, actual: total },
            { name: 'Now', ideal: Math.round(total * 0.5), actual: projectTasks.filter(t => !t.completed).length },
            { name: 'End', ideal: 0, actual: null }
        ];
    }, [projectTasks]);

    const getHeatmapColor = (count: number) => {
        if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
        if (count <= 2) return 'bg-green-200 dark:bg-green-900';
        if (count <= 4) return 'bg-green-400 dark:bg-green-700';
        if (count <= 6) return 'bg-green-600 dark:bg-green-500';
        return 'bg-green-800 dark:bg-green-300';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Clock className="w-6 h-6 text-cyan-500" /> 시간 & 성과 분석 (Analytics)
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        프로젝트 진행 상황과 성과를 데이터로 확인하세요.
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">총 작업 수</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{projectTasks.length}</div>
                        <p className="text-xs text-muted-foreground">
                            완료율 {completionRate}%
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">진행 중인 작업</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{projectTasks.filter(t => !t.completed).length}</div>
                        <p className="text-xs text-muted-foreground">
                            남은 작업
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">높은 우선순위</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{projectTasks.filter(t => t.priority === 'high' && !t.completed).length}</div>
                        <p className="text-xs text-muted-foreground">
                            긴급 처리 필요
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Heatmap Section */}
            <Card>
                <CardHeader>
                    <CardTitle>업무 밀도 (Workload Heatmap)</CardTitle>
                    <CardDescription>지난 1년간의 업무 집중도를 시각화합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-1">
                        {heatmapData.slice(-120).map((day, i) => ( // Show last ~4 months for better mobile view
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.count)}`}
                                title={`${day.date}: ${day.count} tasks`}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground justify-end">
                        <span>Less</span>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
                            <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900"></div>
                            <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700"></div>
                            <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500"></div>
                            <div className="w-3 h-3 rounded-sm bg-green-800 dark:bg-green-300"></div>
                        </div>
                        <span>More</span>
                    </div>
                </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Burn-down Chart (Placeholder/Simulated) */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>번다운 차트 (Burn-down)</CardTitle>
                        <CardDescription>남은 작업량의 추이 (Simulated)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={burndownData}>
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Legend />
                                <Bar dataKey="ideal" name="Ideal" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="actual" name="Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>우선순위별 작업</CardTitle>
                        <CardDescription>우선순위에 따른 작업 분포</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={priorityData}>
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                                    {priorityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>작업 상태 분포</CardTitle>
                        <CardDescription>완료 vs 미완료 작업 비율</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

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

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>작업 상태 분포</CardTitle>
                        <CardDescription>완료 vs 미완료 작업 비율</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
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
        </div>
    );
}

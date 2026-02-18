'use client';

import { Project, Task } from '@/types';
import { differenceInDays, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Calendar, DollarSign, Users, Clock, AlertCircle, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';

import { useData } from '@/context/DataProvider';
import { BurndownChart } from './BurndownChart';
import { suggestNextProjectTasks } from '@/lib/gemini';
import ReactMarkdown from 'react-markdown';

interface ProjectDashboardProps {
    project: Project;
}

export function ProjectDashboard({ project }: ProjectDashboardProps) {
    const { tasks } = useData();
    const projectTasks = tasks.filter(t => t.projectId === project.id);

    const [insight, setInsight] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleGetInsight = async () => {
        setIsAnalyzing(true);
        try {
            const result = await suggestNextProjectTasks(project, projectTasks);
            setInsight(result);
        } catch (error) {
            console.error("Failed to get project insight", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Calculate D-Day
    const today = new Date();
    const endDate = project.endDate ? new Date(project.endDate) : null;
    const dDay = endDate ? differenceInDays(endDate, today) : null;

    // Calculate Budget Percentage
    const budgetTotal = project.budget?.total || 0;
    const budgetSpent = project.budget?.spent || 0;
    const budgetPercent = budgetTotal > 0 ? Math.round((budgetSpent / budgetTotal) * 100) : 0;

    // Calculate Schedule Progress (Simple time-based)
    const startDate = project.startDate ? new Date(project.startDate) : new Date();
    const totalDays = endDate ? differenceInDays(endDate, startDate) : 1;
    const daysPassed = differenceInDays(today, startDate);
    const timeProgress = endDate ? Math.min(100, Math.max(0, Math.round((daysPassed / totalDays) * 100))) : 0;

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'active': return 'text-primary';
            case 'completed': return 'text-green-500'; // Keep specific for success
            case 'hold': return 'text-orange-500'; // Keep specific for warning
            default: return 'text-muted-foreground';
        }
    };

    const getStatusText = (status?: string) => {
        switch (status) {
            case 'active': return '진행 중';
            case 'completed': return '완료됨';
            case 'hold': return '보류됨';
            case 'preparation': return '준비 중';
            default: return '상태 없음';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">프로젝트 상태</CardTitle>
                        <AlertCircle className={`h-4 w-4 ${getStatusColor(project.status)}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{getStatusText(project.status)}</div>
                        <p className="text-xs text-muted-foreground">
                            {project.manager} (PM)
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">남은 기간 (D-Day)</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {dDay !== null ? (dDay < 0 ? `D+${Math.abs(dDay)}` : `D-${dDay}`) : '-'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {format(endDate || new Date(), 'yyyy.MM.dd', { locale: ko })} 종료 예정
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">예산 소진율</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{budgetPercent}%</div>
                        <Progress value={budgetPercent} className="h-2 mt-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                            {budgetSpent.toLocaleString()} / {budgetTotal.toLocaleString()} 원
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">전체 진척도</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{project.progress || 0}%</div>
                        <Progress value={project.progress || 0} className="h-2 mt-2 bg-secondary" indicatorClassName="bg-green-500" />
                        <p className="text-xs text-muted-foreground mt-1">
                            시간 경과: {timeProgress}%
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
                {/* Left: Project Details & Burndown (4 cols) */}
                <div className="md:col-span-4 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>번다운 차트 (Burndown Chart)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BurndownChart project={project} tasks={projectTasks} />
                        </CardContent>
                    </Card>

                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>프로젝트 개요</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold mb-1">설명</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {project.description || "프로젝트 설명이 없습니다."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div>
                                    <h4 className="text-sm font-semibold mb-1">참여 인원</h4>
                                    <div className="flex -space-x-2 overflow-hidden py-1">
                                        {project.members && project.members.length > 0 ? (
                                            project.members.map((member, i) => (
                                                <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                    {member[0]}
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-sm text-muted-foreground">인원 없음</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold mb-1">기간</h4>
                                    <div className="text-sm text-muted-foreground">
                                        {project.startDate ? format(new Date(project.startDate), 'yy.MM.dd') : '?'} ~ {project.endDate ? format(new Date(project.endDate), 'yy.MM.dd') : '?'}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Budget Chart (3 cols) */}
                <div className="md:col-span-3">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>예산 분석</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: '집행', value: budgetSpent },
                                                { name: '잔여', value: Math.max(0, budgetTotal - budgetSpent) },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            <Cell key="spent" fill="#ef4444" /> {/* Red for spent (expense) usually, or Primary */}
                                            <Cell key="remaining" fill="#e5e7eb" />
                                        </Pie>
                                        <Tooltip formatter={(value: number | undefined) => `${(value || 0).toLocaleString()}원`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-4 text-sm mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <span>사용함 ({budgetPercent}%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-muted" />
                                    <span>남음 ({100 - budgetPercent}%)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* AI Insights Card */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-500" />
                        AI 프로젝트 인사이트
                    </CardTitle>
                    <button
                        onClick={handleGetInsight}
                        disabled={isAnalyzing}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                    >
                        {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        {insight ? "다시 분석" : "분석 시작"}
                    </button>
                </CardHeader>
                <CardContent>
                    {isAnalyzing ? (
                        <div className="py-8 flex flex-col items-center justify-center text-sm text-muted-foreground">
                            <Sparkles className="h-8 w-8 text-indigo-200 animate-pulse mb-2" />
                            프로젝트 데이터를 분석하여 최적의 다음 단계를 제안하고 있습니다...
                        </div>
                    ) : insight ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown>{insight}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            "분석 시작"을 클릭하여 이 프로젝트를 위한 AI 맞춤 제안을 받아보세요.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

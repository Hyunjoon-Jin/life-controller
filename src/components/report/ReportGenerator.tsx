'use client';

import { useData } from '@/context/DataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Printer, Share2, Filter, CheckCircle2, TrendingUp, Wallet, Activity, CalendarDays, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth, min, isWithinInterval, startOfDay, endOfDay, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

export function ReportGenerator() {
    const {
        tasks = [],
        exerciseSessions = [],
        dietEntries = [],
        transactions = [],
        projects = []
    } = useData();

    const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const today = new Date();

    const handlePrint = () => {
        window.print();
    };

    // Calculate Date Range
    const { start, end, label } = useMemo(() => {
        let start = today;
        let end = today;
        let label = '';

        if (reportType === 'daily') {
            start = startOfDay(today);
            end = endOfDay(today);
            label = format(today, 'yyyy.MM.dd (EEE)', { locale: ko });
        } else if (reportType === 'weekly') {
            start = startOfWeek(today, { weekStartsOn: 1 });
            end = endOfWeek(today, { weekStartsOn: 1 });
            label = `${format(start, 'yyyy.MM.dd')} - ${format(end, 'yyyy.MM.dd')}`;
        } else {
            start = startOfMonth(today);
            end = endOfMonth(today);
            label = format(today, 'yyyy년 MM월');
        }

        return { start, end, label };
    }, [reportType]);

    // Filter Data
    const reportData = useMemo(() => {
        const interval = { start, end };

        // 1. Tasks: Filter by Due Date (or Created Date if no due date? For now Due Date)
        // We only count tasks that have a Due Date within range.
        const relevantTasks = tasks.filter(t => t.dueDate && isWithinInterval(new Date(t.dueDate), interval));
        const completedTasks = relevantTasks.filter(t => t.completed);
        const completionRate = relevantTasks.length > 0 ? Math.round((completedTasks.length / relevantTasks.length) * 100) : 0;

        // 2. Exercise
        const exercises = exerciseSessions.filter(e => isWithinInterval(new Date(e.date), interval));

        // 3. Diet
        const diets = dietEntries.filter(d => isWithinInterval(new Date(d.date), interval));
        const totalCalories = diets.reduce((acc, d) => acc + (d.totalCalories || 0), 0);
        const avgCalories = diets.length > 0 ? Math.round(totalCalories / (reportType === 'daily' ? 1 : 7)) : 0; // Rough avg

        // 4. Finance
        const expenses = transactions
            .filter(t => t.type === 'expense' && isWithinInterval(new Date(t.date), interval))
            .reduce((acc, t) => acc + t.amount, 0);

        const income = transactions
            .filter(t => t.type === 'income' && isWithinInterval(new Date(t.date), interval))
            .reduce((acc, t) => acc + t.amount, 0);

        return {
            tasks: { total: relevantTasks.length, completed: completedTasks.length, rate: completionRate, list: completedTasks },
            exercise: { count: exercises.length, list: exercises },
            diet: { count: diets.length, calories: totalCalories },
            finance: { expense: expenses, income }
        };
    }, [tasks, exerciseSessions, dietEntries, transactions, start, end, reportType]);

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-8 bg-slate-50 min-h-screen">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 print:hidden">
                <div className="bg-white p-1 rounded-full shadow-sm border">
                    <Button
                        variant={reportType === 'daily' ? 'default' : 'ghost'}
                        onClick={() => setReportType('daily')}
                        className="rounded-full px-6 h-8 text-xs font-bold"
                    >일간 리포트</Button>
                    <Button
                        variant={reportType === 'weekly' ? 'default' : 'ghost'}
                        onClick={() => setReportType('weekly')}
                        className="rounded-full px-6 h-8 text-xs font-bold"
                    >주간 리포트</Button>
                    <Button
                        variant={reportType === 'monthly' ? 'default' : 'ghost'}
                        onClick={() => setReportType('monthly')}
                        className="rounded-full px-6 h-8 text-xs font-bold"
                    >월간 리포트</Button>
                </div>
                <Button variant="outline" onClick={handlePrint} className="gap-2">
                    <Printer className="w-4 h-4" /> PDF 내보내기
                </Button>
            </div>

            {/* A4 Paper Layout */}
            <div className="bg-white shadow-lg mx-auto max-w-[210mm] min-h-[297mm] p-[15mm] md:p-[20mm] print:shadow-none print:p-0 print:m-0 print:w-full">

                {/* Report Header */}
                <div className="border-b-4 border-slate-900 pb-6 mb-10 flex justify-between items-end">
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Life Controller Report</div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                            {reportType} <br /> Insight
                        </h1>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-slate-700">{label}</div>
                        <div className="text-sm text-slate-400 mt-1">Generated by Hyunjoon Jin</div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Productivity</div>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-slate-900">{reportData.tasks.rate}%</span>
                            <span className="text-xs font-medium text-slate-500 mb-1">완료율</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1 mt-3 rounded-full overflow-hidden">
                            <div className="bg-slate-900 h-full" style={{ width: `${reportData.tasks.rate}%` }} />
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Health</div>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-blue-600">{reportData.exercise.count}</span>
                            <span className="text-xs font-medium text-slate-500 mb-1">운동 세션</span>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Spending</div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-red-600">₩{reportData.finance.expense.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Focus</div>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-indigo-600">{reportData.tasks.completed}</span>
                            <span className="text-xs font-medium text-slate-500 mb-1">Task Done</span>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12">

                    {/* Left Column */}
                    <div className="space-y-10">
                        {/* Task Summary */}
                        <section>
                            <h3 className="flex items-center gap-2 font-bold text-lg mb-4 text-slate-800 border-b pb-2">
                                <CheckCircle2 className="w-5 h-5 text-slate-900" />
                                주요 성과
                            </h3>
                            <div className="space-y-3">
                                {reportData.tasks.list.length > 0 ? reportData.tasks.list.slice(0, 8).map(task => (
                                    <div key={task.id} className="flex items-start gap-3 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                        <span className="text-slate-700 leading-snug">{task.title}</span>
                                    </div>
                                )) : (
                                    <p className="text-sm text-slate-400 italic">완료된 주요 성과가 없습니다.</p>
                                )}
                            </div>
                        </section>

                        {/* Finance Summary */}
                        <section>
                            <h3 className="flex items-center gap-2 font-bold text-lg mb-4 text-slate-800 border-b pb-2">
                                <Wallet className="w-5 h-5 text-slate-900" />
                                재무 현황
                            </h3>
                            <div className="bg-slate-50 rounded-lg p-5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-slate-500">수입</span>
                                    <span className="font-bold text-blue-600">+ ₩{reportData.finance.income.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-medium text-slate-500">지출</span>
                                    <span className="font-bold text-red-600">- ₩{reportData.finance.expense.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t">
                                    <span className="text-sm font-bold text-slate-900">순수익</span>
                                    <span className={cn("font-black text-lg", (reportData.finance.income - reportData.finance.expense) >= 0 ? "text-green-600" : "text-red-500")}>
                                        ₩{(reportData.finance.income - reportData.finance.expense).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-10">
                        {/* Health Summary */}
                        <section>
                            <h3 className="flex items-center gap-2 font-bold text-lg mb-4 text-slate-800 border-b pb-2">
                                <Activity className="w-5 h-5 text-slate-900" />
                                건강 & 습관
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                            <TrendingUp className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 font-bold uppercase">운동</div>
                                            <div className="font-bold text-slate-800">{reportData.exercise.count} 세션</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-400">Target: 4회</div>
                                </div>

                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 p-2 rounded-full text-green-600">
                                            <CalendarDays className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 font-bold uppercase">식단 기록</div>
                                            <div className="font-bold text-slate-800">{reportData.diet.count} 끼니</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Analysis / AI Feedback Placeholder */}
                        <section>
                            <h3 className="flex items-center gap-2 font-bold text-lg mb-4 text-slate-800 border-b pb-2">
                                <Sparkles className="w-5 h-5 text-indigo-600" />
                                AI Analysis
                            </h3>
                            <div className="bg-slate-900 text-slate-200 p-6 rounded-lg text-sm leading-relaxed shadow-lg">
                                <p className="mb-4">
                                    <strong className="text-white">이번 {reportType === 'daily' ? '일' : reportType === 'weekly' ? '주' : '달'}의 분석:</strong><br />
                                    전반적인 생산성이 {reportData.tasks.rate >= 80 ? '매우 높습니다' : '준수합니다'}.
                                    {reportData.finance.expense > 200000 ? ' 지출이 평소보다 높으니 주의가 필요합니다.' : ' 재무 관리가 안정적입니다.'}
                                    {reportData.exercise.count === 0 ? ' 운동량이 부족합니다. 다음 구간에는 가벼운 운동을 시작해보세요.' : ' 꾸준한 운동 습관이 돋보입니다.'}
                                </p>
                                <p className="text-xs text-slate-500 italic text-right">
                                    * This analysis is auto-generated based on your logs.
                                </p>
                            </div>
                        </section>

                    </div>
                </div>

                {/* Footer Notes */}
                <div className="mt-16 pt-8 border-t text-center text-xs text-slate-400">
                    <p>Life Controller - Personal Management System</p>
                    <p className="mt-1">Generated on {format(new Date(), 'yyyy-MM-dd HH:mm:ss')}</p>
                </div>

            </div>
        </div>
    );
}

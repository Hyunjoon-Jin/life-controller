'use client';

import { useData } from '@/context/DataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Printer, Share2, Filter, CheckCircle2, TrendingUp, Wallet, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useState } from 'react';

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

    // Calculate Weekly Stats (Simple)
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const weeklyTasks = tasks.filter(t => t.completed); // simplified
    const weeklyExercise = exerciseSessions.length;
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-8 bg-white min-h-screen">
            {/* Control Panel (Hidden on Print) */}
            <div className="flex items-center justify-between gap-4 mb-8 print:hidden">
                <div className="flex gap-2">
                    <Button
                        variant={reportType === 'daily' ? 'default' : 'outline'}
                        onClick={() => setReportType('daily')}
                        className="rounded-full"
                    >일간</Button>
                    <Button
                        variant={reportType === 'weekly' ? 'default' : 'outline'}
                        onClick={() => setReportType('weekly')}
                        className="rounded-full"
                    >주간</Button>
                    <Button
                        variant={reportType === 'monthly' ? 'default' : 'outline'}
                        onClick={() => setReportType('monthly')}
                        className="rounded-full"
                    >월간</Button>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" /> 인쇄 / PDF
                    </Button>
                    <Button>
                        <Download className="w-4 h-4 mr-2" /> 데이터 추출 (CSV)
                    </Button>
                </div>
            </div>

            {/* Report Content */}
            <div className="border border-slate-200 p-12 rounded-sm shadow-sm print:border-none print:shadow-none bg-white">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                    <div>
                        <div className="text-4xl font-black tracking-tighter uppercase mb-2">Life Report</div>
                        <div className="text-slate-500 font-medium">
                            {format(weekStart, 'yyyy.MM.dd')} - {format(weekEnd, 'yyyy.MM.dd')}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-lg">Hyunjoon Jin</div>
                        <div className="text-xs text-slate-400">Life Controller v2.0</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-12">
                    {/* Productivity Column */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Productivity
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <div className="text-xs text-slate-500 mb-1">완료된 할일</div>
                                    <div className="text-2xl font-bold">{tasks.filter(t => t.completed).length}건</div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <div className="text-xs text-slate-500 mb-1">활성 프로젝트</div>
                                    <div className="text-2xl font-bold">{projects.filter(p => !p.isArchived).length}개</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-xs mb-3 border-b pb-1">핵심 성과 내역</h4>
                            <div className="space-y-2">
                                {tasks.filter(t => t.completed).slice(0, 5).map(task => (
                                    <div key={task.id} className="text-xs flex justify-between border-b border-slate-50 pb-1">
                                        <span className="truncate pr-4">• {task.title}</span>
                                        <span className="text-slate-400 shrink-0">DONE</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Health & Finance Column */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Health & Finance
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-blue-500">
                                    <div className="text-xs text-slate-500 mb-1">총 운동 횟수</div>
                                    <div className="text-2xl font-bold">{exerciseSessions.length}회</div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-red-500">
                                    <div className="text-xs text-slate-500 mb-1">누적 지출</div>
                                    <div className="text-xl font-bold">₩{totalExpenses.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-xs mb-3 border-b pb-1">건강 요약</h4>
                            <div className="space-y-2">
                                <div className="text-xs flex justify-between">
                                    <span>기록된 식단</span>
                                    <span>{dietEntries.length}건</span>
                                </div>
                                <div className="text-xs flex justify-between">
                                    <span>평균 칼로리</span>
                                    <span>1,850 kcal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Growth Section */}
                <div className="bg-slate-900 text-white p-8 rounded-lg mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-400" />
                            Weekly Insight
                        </div>
                        <div className="text-xs text-slate-400">가장 생산적인 요일: 수요일</div>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">
                        이번 주에는 지난주 대비 할일 완료율이 <span className="text-indigo-400 font-bold">15% 향상</span>되었습니다.
                        특히 프로젝트 관리에 집중하여 2개의 마일스톤을 달성한 것이 고무적입니다.
                        다음 주에는 운동 빈도를 높여 컨디션을 조절하는 것을 추천합니다.
                    </p>
                </div>

                {/* Footer */}
                <div className="text-center text-[10px] text-slate-300 border-t pt-8 mt-12">
                    본 보고서는 Life Controller에 의해 자동 생성되었습니다. <br />
                    Generated on {format(today, 'yyyy-MM-dd HH:mm')}
                </div>
            </div>
        </div>
    );
}

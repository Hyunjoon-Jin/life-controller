'use client';

import { useData } from '@/context/DataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { BookOpen, Clock, Trophy } from 'lucide-react';

interface LanguageStatsProps {
    language: string;
}

export function LanguageStats({ language }: LanguageStatsProps) {
    const { languageEntries } = useData();

    // Filter entries for this language
    const entries = languageEntries.filter(e => e.language === language);

    // Calculate totals
    const totalTime = entries.reduce((acc, curr) => acc + (curr.studyTime || 0), 0);
    const totalVocab = entries.reduce((acc, curr) => acc + (curr.vocabulary?.length || 0), 0);
    const totalDays = new Set(entries.map(e => format(new Date(e.date), 'yyyy-MM-dd'))).size;

    // Prepare chart data (Last 7 days)
    const today = new Date();
    const last7Days = eachDayOfInterval({
        start: subDays(today, 6),
        end: today
    });

    const chartData = last7Days.map(day => {
        const dayEntries = entries.filter(e => isSameDay(new Date(e.date), day));
        const minutes = dayEntries.reduce((acc, curr) => acc + (curr.studyTime || 0), 0);
        return {
            name: format(day, 'E', { locale: ko }), // Mon, Tue...
            minutes: minutes,
            date: format(day, 'MM.dd')
        };
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">총 학습 시간</CardTitle>
                        <Clock className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Math.floor(totalTime / 60)}시간 {totalTime % 60}분
                        </div>
                        <p className="text-xs text-muted-foreground">
                            누적 학습량
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">암기한 단어</CardTitle>
                        <BookOpen className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVocab}개</div>
                        <p className="text-xs text-muted-foreground">
                            저장된 단어 및 표현
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">학습 일수</CardTitle>
                        <Trophy className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalDays}일</div>
                        <p className="text-xs text-muted-foreground">
                            꾸준함이 실력입니다!
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Chart */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>최근 7일 학습 추이</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}분`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

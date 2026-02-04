'use client';

import { useData } from '@/context/DataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Play, Square, Coffee, History, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, differenceInMinutes, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { generateId, cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function WorkTimeSection() {
    const { workLogs, addWorkLog, updateWorkLog, deleteWorkLog } = useData();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const activeLog = workLogs.find(log => !log.endTime && isSameDay(new Date(log.date), new Date()));

    const handleClockIn = () => {
        const newLog = {
            id: generateId(),
            date: new Date(),
            startTime: new Date(),
            notes: ''
        };
        addWorkLog(newLog);
    };

    const handleClockOut = () => {
        if (activeLog) {
            updateWorkLog({
                ...activeLog,
                endTime: new Date()
            });
        }
    };

    const calculateDuration = (start: Date, end?: Date) => {
        const endTime = end || currentTime;
        const diff = differenceInMinutes(new Date(endTime), new Date(start));
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        return `${hours}시간 ${minutes}분`;
    };

    const todayLogs = workLogs.filter(log => isSameDay(new Date(log.date), new Date()));
    const totalTodayMinutes = todayLogs.reduce((acc, log) => {
        const end = log.endTime ? new Date(log.endTime) : (isSameDay(new Date(log.date), new Date()) ? currentTime : new Date(log.startTime));
        return acc + differenceInMinutes(end, new Date(log.startTime));
    }, 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Clock-in/out Card */}
                <Card className="md:col-span-2 border-none shadow-sm overflow-hidden bg-slate-900 text-white">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <div className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">현재 시간</div>
                                <div className="text-5xl font-mono font-bold">{format(currentTime, 'HH:mm:ss')}</div>
                                <div className="text-sm text-slate-500 mt-2">{format(currentTime, 'yyyy년 MM월 dd일')}</div>
                            </div>

                            <div className="flex flex-col items-center md:items-end gap-4">
                                {activeLog ? (
                                    <div className="text-right">
                                        <div className="text-xs text-slate-400 mb-1">현재 근무 중</div>
                                        <div className="text-2xl font-bold text-green-400">{calculateDuration(activeLog.startTime)}</div>
                                    </div>
                                ) : (
                                    <div className="text-xs text-slate-400">오늘 총 근무: {Math.floor(totalTodayMinutes / 60)}시간 {totalTodayMinutes % 60}분</div>
                                )}

                                <div className="flex gap-3">
                                    {!activeLog ? (
                                        <Button onClick={handleClockIn} className="bg-primary hover:bg-primary/90 h-14 px-8 rounded-2xl text-lg font-bold">
                                            <Play className="w-5 h-5 mr-2 fill-current" /> 출근하기
                                        </Button>
                                    ) : (
                                        <>
                                            <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-700 hover:bg-slate-800 text-white">
                                                <Coffee className="w-5 h-5 mr-2" /> 휴식
                                            </Button>
                                            <Button onClick={handleClockOut} variant="destructive" className="h-14 px-8 rounded-2xl text-lg font-bold">
                                                <Square className="w-5 h-5 mr-2 fill-current" /> 퇴근하기
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics Card */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <BarChart2 className="w-4 h-4 text-primary" />
                            주간 근무 리포트
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-end gap-1 h-24 items-end">
                            {[40, 65, 30, 80, 50, 0, 0].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    <div className="w-full bg-slate-100 rounded-t-sm relative h-full">
                                        <div className="absolute bottom-0 w-full bg-primary/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">{['월', '화', '수', '목', '금', '토', '일'][i]}</span>
                                </div>
                            ))}
                        </div>
                        <div className="pt-2 border-t space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">이번 주 총 근무</span>
                                <span className="font-bold">24.5시간</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">일평균 근무</span>
                                <span className="font-bold">4.9시간</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* History Table */}
            <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <History className="w-4 h-4 text-primary" />
                        근무 이력
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs">전체 보기</Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {workLogs.length > 0 ? (
                            workLogs.slice().reverse().map(log => (
                                <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="font-bold w-20">{format(new Date(log.date), 'MM-dd (eee)')}</div>
                                        <div className="text-muted-foreground">
                                            {format(new Date(log.startTime), 'HH:mm')} - {log.endTime ? format(new Date(log.endTime), 'HH:mm') : '진행 중'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="font-bold">{log.endTime ? calculateDuration(log.startTime, log.endTime) : '...'}</div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => deleteWorkLog(log.id)}>
                                            <History className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-muted-foreground italic">아직 기록된 근무 이력이 없습니다.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

'use client';

import { useData } from '@/context/DataProvider';
import { Clock, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TodayWorkTimeProps {
    onNavigateToWorkTime?: () => void;
}

export function TodayWorkTime({ onNavigateToWorkTime }: TodayWorkTimeProps) {
    const { userProfile } = useData();
    const today = new Date();

    // In a real app, these would come from user session/data
    // Mocking for now based on common patterns
    const workStartTime = "09:00";
    const workEndTime = "18:00";
    const isVacation = false;

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    오늘의 근무시간
                </h3>
            </div>

            <div className="flex-1">
                <button
                    onClick={onNavigateToWorkTime}
                    className="w-full p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100/50 transition-all group"
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-8">
                            <div className="text-center">
                                <span className="text-[10px] font-bold text-indigo-400 block mb-1">출근</span>
                                <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{workStartTime}</span>
                            </div>
                            <div className="h-8 w-[1px] bg-indigo-200 dark:bg-indigo-800" />
                            <div className="text-center">
                                <span className="text-[10px] font-bold text-indigo-400 block mb-1">퇴근</span>
                                <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{workEndTime}</span>
                            </div>
                        </div>

                        <div className="w-full flex items-center justify-between px-2 pt-4 border-t border-indigo-100/50 dark:border-indigo-800/30">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-indigo-400" />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {isVacation ? '🏝️ 현재 휴가 중' : '💼 정상 근무'}
                                </span>
                            </div>
                            <span className="text-xs font-medium text-indigo-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                수정하기 <AlertCircle className="w-3 h-3" />
                            </span>
                        </div>
                    </div>
                </button>

                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4 text-center leading-relaxed">
                    근무 시간은 '근무시간 관리' 탭에서<br />언제든지 변경할 수 있습니다.
                </p>
            </div>
        </div>
    );
}

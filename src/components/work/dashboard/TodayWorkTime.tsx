'use client';

import { useData } from '@/context/DataProvider';
import { Clock, Calendar, AlertCircle, Zap, Activity, Timer } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface TodayWorkTimeProps {
    onNavigateToWorkTime?: () => void;
}

export function TodayWorkTime({ onNavigateToWorkTime }: TodayWorkTimeProps) {
    const { userProfile } = useData();
    const today = new Date();

    const workStartTime = "09:00";
    const workEndTime = "18:00";
    const isVacation = false;

    return (
        <div className="glass-premium rounded-[32px] border border-white/5 p-8 shadow-2xl h-full flex flex-col relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/[0.03] to-transparent pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Timer className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white tracking-widest uppercase mb-0.5">EFFICIENCY MATRIX</h3>
                        <p className="text-[8px] font-bold text-white/20 tracking-[0.2em] uppercase">OPERATIONAL TIMELINE</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 relative z-10">
                <button
                    onClick={onNavigateToWorkTime}
                    className="w-full p-8 rounded-[28px] bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 hover:bg-indigo-500/15 transition-all group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/[0.05] to-transparent pointer-events-none" />

                    <div className="flex flex-col items-center gap-8 relative z-10">
                        <div className="flex items-center gap-12">
                            <div className="text-center">
                                <span className="text-[10px] font-black text-indigo-400/60 block mb-2 tracking-[0.2em] uppercase">DEPLOY</span>
                                <span className="text-3xl font-black text-white tracking-tighter">{workStartTime}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/30 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                <div className="w-0.5 h-8 bg-gradient-to-b from-indigo-500/30 via-indigo-500/10 to-indigo-500/30" />
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/30 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                            </div>
                            <div className="text-center">
                                <span className="text-[10px] font-black text-indigo-400/60 block mb-2 tracking-[0.2em] uppercase">EXTRACT</span>
                                <span className="text-3xl font-black text-white tracking-tighter">{workEndTime}</span>
                            </div>
                        </div>

                        <div className="w-full flex items-center justify-between px-2 pt-6 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <Activity className="w-4 h-4 text-indigo-500" />
                                <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">
                                    {isVacation ? 'VACATION MODE ACTIVE' : 'STANDARD PROTOCOL'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 group-hover:gap-3 transition-all">
                                <span className="text-[9px] font-black text-indigo-400 tracking-widest uppercase">RECALIBRATE</span>
                                <Zap className="w-3 h-3 text-indigo-400" />
                            </div>
                        </div>
                    </div>
                </button>

                <div className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
                    <AlertCircle className="w-4 h-4 text-white/20 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-white/30 tracking-wide leading-relaxed uppercase">
                        OPERATIONAL PERIODS CAN BE ADJUSTED WITHIN THE MANAGEMENT MODULE FOR OPTIMAL RESOURCE ALLOCATION.
                    </p>
                </div>
            </div>
        </div>
    );
}

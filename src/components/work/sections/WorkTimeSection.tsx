import { useData } from '@/context/DataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Play, Square, Coffee, History, BarChart2, Zap, Terminal, Shield, Activity, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, differenceInMinutes, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { generateId, cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
        return `${hours}H ${minutes}M`;
    };

    const todayLogs = workLogs.filter(log => isSameDay(new Date(log.date), new Date()));
    const totalTodayMinutes = todayLogs.reduce((acc, log) => {
        const end = log.endTime ? new Date(log.endTime) : (isSameDay(new Date(log.date), new Date()) ? currentTime : new Date(log.startTime));
        return acc + differenceInMinutes(end, new Date(log.startTime));
    }, 0);

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Efficiency Matrix */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <div className="glass-premium rounded-[40px] border border-white/5 p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-sky-500/[0.05] pointer-events-none" />

                        <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                            <div className="text-center md:text-left">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                        <Timer className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <span className="text-[10px] font-black text-indigo-400 tracking-[0.3em] uppercase">OFFICIAL_TIME_UNIT</span>
                                </div>
                                <div className="text-7xl font-black text-white tracking-tighter tabular-nums leading-none">
                                    {format(currentTime, 'HH:mm')}<span className="text-indigo-500/30 font-light">:</span><span className="text-indigo-400">{format(currentTime, 'ss')}</span>
                                </div>
                                <div className="text-[11px] font-bold text-white/20 mt-4 tracking-[0.4em] uppercase flex items-center gap-2 justify-center md:justify-start">
                                    <Shield className="w-3 h-3 text-indigo-500/30" /> SYNCED_WITH_GLOBAL_COMMAND
                                </div>
                            </div>

                            <div className="flex flex-col items-center md:items-end gap-6">
                                <AnimatePresence mode="wait">
                                    {activeLog ? (
                                        <motion.div
                                            key="active"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="text-center md:text-right"
                                        >
                                            <div className="flex items-center gap-2 justify-center md:justify-end mb-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase">OPERATIONAL_NOW</span>
                                            </div>
                                            <div className="text-4xl font-black text-white tracking-tighter font-mono uppercase">
                                                {calculateDuration(activeLog.startTime)}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="idle"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="text-center md:text-right"
                                        >
                                            <div className="text-[9px] font-black text-white/20 tracking-widest uppercase mb-1">CUMULATIVE_OPERATIONS</div>
                                            <div className="text-2xl font-black text-white/60 tracking-tight uppercase">
                                                {Math.floor(totalTodayMinutes / 60)}H {totalTodayMinutes % 60}M
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex gap-4">
                                    {!activeLog ? (
                                        <Button
                                            onClick={handleClockIn}
                                            className="h-16 px-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs tracking-[0.2em] uppercase shadow-[0_12px_24px_-8px_rgba(99,102,241,0.5)] active:scale-95 transition-all"
                                        >
                                            <Play className="w-4 h-4 mr-3 fill-current" /> INITIALIZE_WORK
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline"
                                                className="h-16 px-8 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 text-white font-black text-xs tracking-[0.2em] uppercase"
                                            >
                                                <Coffee className="w-4 h-4 mr-3" /> SUSPEND
                                            </Button>
                                            <Button
                                                onClick={handleClockOut}
                                                className="h-16 px-12 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs tracking-[0.2em] uppercase shadow-[0_12px_24px_-8px_rgba(225,29,72,0.4)] active:scale-95 transition-all"
                                            >
                                                <Square className="w-4 h-4 mr-3 fill-current" /> TERMINATE
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-premium rounded-[32px] border border-white/5 p-8 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <History className="w-5 h-5 text-indigo-400" />
                                </div>
                                <h4 className="text-sm font-black text-white tracking-[0.2em] uppercase">OPERATIONAL_LOGS</h4>
                            </div>
                            <Button variant="ghost" className="text-[9px] font-black text-white/20 hover:text-white uppercase tracking-widest">EXPAND_ARCHIVE</Button>
                        </div>
                        <div className="space-y-4">
                            {workLogs.length > 0 ? (
                                workLogs.slice(-5).reverse().map(log => (
                                    <div key={log.id} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl group/log hover:bg-white/[0.05] transition-all">
                                        <div className="flex items-center gap-10">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-white/20 tracking-widest uppercase mb-1">TIMESTAMP</span>
                                                <span className="font-black text-xs text-white uppercase tracking-widest">{format(new Date(log.date), 'MM.dd.yyyy')}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-white/20 tracking-widest uppercase mb-1">DURATION</span>
                                                <span className="text-xs font-bold text-white/60 tracking-wider">
                                                    {format(new Date(log.startTime), 'HH:mm')} — {log.endTime ? format(new Date(log.endTime), 'HH:mm') : 'ACTIVE'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-xs font-black text-indigo-400 tracking-widest tabular-nums">
                                                {log.endTime ? calculateDuration(log.startTime, log.endTime) : '---'}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-white/10 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg"
                                                onClick={() => deleteWorkLog(log.id)}
                                            >
                                                <Terminal className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-3xl">
                                    <span className="text-[10px] font-black text-white/10 tracking-[0.3em] uppercase italic">NO DATA ENTRIES DETECTED</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Side Stats */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    <div className="glass-premium rounded-[32px] border border-white/5 p-8 shadow-2xl relative overflow-hidden h-full">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <BarChart2 className="w-5 h-5 text-indigo-400" />
                                </div>
                                <h4 className="text-sm font-black text-white tracking-[0.2em] uppercase text-sky-400">EFFICIENCY_METRICS</h4>
                            </div>
                        </div>

                        <div className="flex items-end gap-3 h-48 mb-10 px-2">
                            {[40, 65, 30, 80, 50, 20, 10].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full">
                                    <div className="w-full bg-white/5 rounded-2xl relative h-full group/bar overflow-hidden">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-sky-400 rounded-2xl shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all group-hover/bar:brightness-125"
                                        />
                                    </div>
                                    <span className="text-[9px] font-black text-white/20 tracking-tighter uppercase">{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][i]}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-6 pt-6 border-t border-white/5">
                            <div className="flex justify-between items-center group/item">
                                <span className="text-[10px] font-black text-white/20 tracking-widest uppercase group-hover/item:text-indigo-400 transition-colors">WEEKLY_TOTAL</span>
                                <span className="font-black text-lg text-white tabular-nums tracking-tighter">24.5H</span>
                            </div>
                            <div className="flex justify-between items-center group/item">
                                <span className="text-[10px] font-black text-white/20 tracking-widest uppercase group-hover/item:text-indigo-400 transition-colors">DAILY_AVERAGE</span>
                                <span className="font-black text-lg text-white tabular-nums tracking-tighter">4.9H</span>
                            </div>
                            <div className="flex justify-between items-center group/item">
                                <span className="text-[10px] font-black text-white/20 tracking-widest uppercase group-hover/item:text-indigo-400 transition-colors">PEAK_PROTOCOL</span>
                                <span className="font-black text-xs text-indigo-400 tracking-widest uppercase">THURSDAY</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

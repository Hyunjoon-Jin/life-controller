'use client';

import { useEffect, useState } from 'react';
import { useData } from '@/context/DataProvider';
import { MessageSquare, FileText, CheckSquare, Check, Bell, AlertCircle, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { loadActions, KeyManAction } from '@/components/work/sections/KeyManActionPanel';
import { isPast, isToday, parseISO } from 'date-fns';

const STORAGE_KEY = 'keyman-actions';

function saveActions(actions: KeyManAction[]) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
    }
}

const TYPE_CONFIG = {
    report:  { label: '보고',     Icon: FileText,     color: 'text-blue-400',    bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
    comm:    { label: '소통',     Icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10',border: 'border-emerald-500/20' },
    confirm: { label: '컨펌',     Icon: CheckSquare,  color: 'text-amber-400',   bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
};

export function TodayCommCard() {
    const { people } = useData();
    const [allActions, setAllActions] = useState<KeyManAction[]>([]);

    useEffect(() => {
        setAllActions(loadActions());
    }, []);

    const pending = allActions
        .filter(a => a.status === 'pending')
        .sort((a, b) => {
            // 마감일 있는 것 먼저, 그 중 오늘/지난 것 우선
            const aHas = !!a.dueDate, bHas = !!b.dueDate;
            if (aHas && !bHas) return -1;
            if (!aHas && bHas) return 1;
            if (aHas && bHas) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            return 0;
        });

    const overdueCount = pending.filter(a => a.dueDate && isPast(parseISO(a.dueDate)) && !isToday(parseISO(a.dueDate))).length;

    const handleDone = (id: string) => {
        const updated = allActions.map(a =>
            a.id === id ? { ...a, status: 'done' as const } : a
        );
        setAllActions(updated);
        saveActions(updated);
        toast.success('완료 처리됐습니다.');
    };

    return (
        <div className="glass-premium rounded-[28px] border border-white/5 p-6 shadow-2xl h-full flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                        <Bell className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground leading-none">오늘 소통</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {pending.length > 0 ? `${pending.length}건 대기 중` : '처리 완료'}
                        </p>
                    </div>
                </div>
                {overdueCount > 0 && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        {overdueCount}건 지연
                    </div>
                )}
            </div>

            {/* Action List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 relative z-10 pr-1">
                {pending.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-10 gap-2">
                        <Inbox className="w-8 h-8 text-muted-foreground/20" />
                        <p className="text-xs text-muted-foreground">대기 중인 소통 항목 없음</p>
                    </div>
                ) : (
                    pending.map((action, idx) => {
                        const person = people.find(p => p.id === action.personId);
                        const cfg = TYPE_CONFIG[action.type] ?? TYPE_CONFIG.comm;
                        const TypeIcon = cfg.Icon;
                        const isOverdue = action.dueDate && isPast(parseISO(action.dueDate)) && !isToday(parseISO(action.dueDate));
                        const isDueToday = action.dueDate && isToday(parseISO(action.dueDate));
                        const dateStr = action.dueDate
                            ? `${new Date(action.dueDate).getMonth() + 1}/${new Date(action.dueDate).getDate()}`
                            : null;

                        return (
                            <motion.div
                                key={action.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-xl border transition-all group",
                                    isOverdue
                                        ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40"
                                        : "bg-white/[0.02] border-white/5 hover:border-violet-500/30 hover:bg-white/[0.04]"
                                )}
                            >
                                {/* Type badge */}
                                <div className={cn(
                                    "shrink-0 flex items-center gap-1 px-1.5 py-1 rounded-lg text-xs font-medium border mt-0.5",
                                    cfg.color, cfg.bg, cfg.border
                                )}>
                                    <TypeIcon className="w-3 h-3" />
                                    <span className="hidden sm:inline">{cfg.label}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground leading-snug truncate">
                                        {action.subject}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {person && (
                                            <span className="text-xs text-muted-foreground font-medium truncate max-w-[80px]">
                                                {person.name}
                                            </span>
                                        )}
                                        {dateStr && (
                                            <span className={cn(
                                                "text-xs",
                                                isOverdue ? "text-red-400 font-medium" : isDueToday ? "text-amber-400 font-medium" : "text-muted-foreground"
                                            )}>
                                                {isOverdue ? `${dateStr} 지연` : isDueToday ? `오늘 (${dateStr})` : dateStr}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Done button */}
                                <button
                                    onClick={() => handleDone(action.id)}
                                    className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all flex items-center justify-center"
                                    title="완료 처리"
                                >
                                    <Check className="w-3 h-3" />
                                </button>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

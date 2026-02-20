import { format, getWeekOfMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, FolderTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarViewType } from '@/types';

interface CalendarHeaderProps {
    currentDate: Date;
    view: CalendarViewType;
    setView: (view: CalendarViewType) => void;
    onNext: () => void;
    onPrev: () => void;
    onToday: () => void;
    showProjectTasks: boolean;
    setShowProjectTasks: (show: boolean) => void;
}

export function CalendarHeader({ currentDate, view, setView, onNext, onPrev, onToday, showProjectTasks, setShowProjectTasks }: CalendarHeaderProps) {
    const renderTitle = () => {
        if (view === 'week') {
            const week = getWeekOfMonth(currentDate, { locale: ko });
            return format(currentDate, `yyyy년 M월 ${week}주`, { locale: ko });
        }
        if (view === 'day') {
            return format(currentDate, 'yyyy년 M월 d일', { locale: ko });
        }
        return format(currentDate, 'yyyy년 MMMM', { locale: ko });
    };

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 glass-premium rounded-[24px] mb-6 shadow-xl border border-white/5 gap-4 relative overflow-hidden">
            {/* Background Grain/Noise effect via parent class glass-premium */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start z-10">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToday}
                        className="rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white font-black text-[10px] tracking-widest h-9 px-4"
                    >
                        TODAY
                    </Button>
                    <div className="flex items-center rounded-xl bg-white/5 border border-white/5 p-1 shadow-inner">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onPrev}
                            className="h-8 w-8 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
                        </Button>
                        <div className="mx-4 font-black text-sm md:text-base min-w-[120px] md:min-w-[160px] text-center text-white/90 tracking-tight uppercase">
                            {renderTitle()}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onNext}
                            className="h-8 w-8 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                        </Button>
                    </div>
                </div>

                {/* Mobile View Switcher */}
                <div className="md:hidden flex items-center bg-white/5 border border-white/5 rounded-xl p-1 shadow-inner">
                    {(['month', 'week', 'day'] as CalendarViewType[]).map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={cn(
                                "px-3 py-1.5 text-[10px] font-black rounded-lg uppercase transition-all tracking-wider",
                                view === v
                                    ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                    : "text-white/40 hover:text-white/70"
                            )}
                        >
                            {v === 'month' ? 'MO' : v === 'week' ? 'WK' : 'DY'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-end z-10">
                <button
                    onClick={() => setShowProjectTasks(!showProjectTasks)}
                    className={cn(
                        "flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all border outline-none",
                        showProjectTasks
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                            : "bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white/60"
                    )}
                >
                    <FolderTree className="h-4 w-4" />
                    <span>SHOW PROJECT TASKS</span>
                </button>

                {/* Desktop View Switcher */}
                <div className="hidden md:flex items-center bg-white/5 border border-white/5 rounded-[18px] p-1 shadow-inner">
                    {(['month', 'week', 'day'] as CalendarViewType[]).map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={cn(
                                "px-5 py-2 text-[10px] font-black rounded-xl uppercase transition-all tracking-[0.1em]",
                                view === v
                                    ? "bg-emerald-500 text-white shadow-[0_8px_16px_-4px_rgba(16,185,129,0.4)]"
                                    : "text-white/30 hover:text-white/60 hover:bg-white/5"
                            )}
                        >
                            {v === 'month' ? 'MONTH' : v === 'week' ? 'WEEK' : 'DAY'}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

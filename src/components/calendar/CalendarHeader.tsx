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
        <div className="flex items-center justify-between p-4 bg-white rounded-3xl mb-4 shadow-sm border border-transparent">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onToday} className="rounded-xl border-border">오늘</Button>
                <div className="flex items-center rounded-xl border border-border bg-transparent p-0.5">
                    <Button variant="ghost" size="icon" onClick={onPrev} className="h-8 w-8 rounded-lg hover:bg-muted">
                        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                    <div className="mx-2 font-extrabold text-lg min-w-[140px] text-center text-foreground">
                        {renderTitle()}
                    </div>
                    <Button variant="ghost" size="icon" onClick={onNext} className="h-8 w-8 rounded-lg hover:bg-muted">
                        <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => setShowProjectTasks(!showProjectTasks)}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                        showProjectTasks
                            ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                            : "bg-transparent text-muted-foreground border-transparent hover:bg-muted"
                    )}
                >
                    <FolderTree className="h-3.5 w-3.5" />
                    프로젝트 작업 표시
                </button>

                <div className="flex items-center bg-muted/50 rounded-2xl p-1">
                    {(['month', 'week', 'day'] as CalendarViewType[]).map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={cn(
                                "px-4 py-1.5 text-sm font-bold rounded-xl capitalize transition-all",
                                view === v ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/50 font-medium"
                            )}
                        >
                            {v === 'month' ? '월' : v === 'week' ? '주' : '일'}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

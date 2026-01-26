'use client';
import { useState } from 'react';

import { useCalendar } from '@/hooks/useCalendar';
import { CalendarHeader } from './CalendarHeader';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';

export function CalendarView() {
    const { currentDate, setCurrentDate, view, setView, next, prev, today } = useCalendar();
    const [showProjectTasks, setShowProjectTasks] = useState(true);

    return (
        <div className="flex flex-col h-full space-y-4">
            <CalendarHeader
                currentDate={currentDate}
                view={view}
                setView={setView}
                onNext={next}
                onPrev={prev}
                onToday={today}
                showProjectTasks={showProjectTasks}
                setShowProjectTasks={setShowProjectTasks}
            />

            <div className="flex-1 min-h-[500px]">
                {view === 'month' && (
                    <MonthView
                        currentDate={currentDate}
                        onDateClick={(date) => {
                            setCurrentDate(date);
                            setView('day');
                        }}
                        showProjectTasks={showProjectTasks}
                    />
                )}
                {view === 'week' && <WeekView currentDate={currentDate} showProjectTasks={showProjectTasks} />}
                {view === 'day' && <DayView currentDate={currentDate} showProjectTasks={showProjectTasks} />}
            </div>
        </div>
    );
}

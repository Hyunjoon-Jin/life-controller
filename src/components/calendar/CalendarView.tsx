'use client';

import { useData } from '@/context/DataProvider';
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar';
import { format } from 'date-fns';

export function CalendarView() {
    const { events } = useData();

    // Transform events to FullScreenCalendar format
    // Map<DateString, Event[]>
    const eventsByDay = new Map<string, any[]>();

    events.forEach(event => {
        if (!event.start) return;
        const date = new Date(event.start);
        const dateKey = format(date, 'yyyy-MM-dd');

        const mappedEvent = {
            id: typeof event.id === 'string' ? parseInt(event.id) || Math.random() : event.id, // Ensure ID is number if needed, though interface says number. provided code says number.
            name: event.title,
            time: format(date, 'h:mm a'),
            datetime: event.start.toString(),
        };

        if (!eventsByDay.has(dateKey)) {
            eventsByDay.set(dateKey, []);
        }
        eventsByDay.get(dateKey)?.push(mappedEvent);
    });

    const calendarData = Array.from(eventsByDay.entries()).map(([dateString, dayEvents]) => ({
        day: new Date(dateString),
        events: dayEvents
    }));

    return (
        <div className="h-full w-full bg-background rounded-xl border shadow-sm overflow-hidden">
            <FullScreenCalendar data={calendarData} />
        </div>
    );
}

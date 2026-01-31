import { CalendarEvent } from '@/types';

export const getEventStyle = (event: CalendarEvent, pixelsPerHour: number) => {
    const start = new Date(event.start);
    const end = new Date(event.end);

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();

    // Calculate duration. Handle overnight events if necessary (though simplified here strictly based on DayView logic)
    // If end < start, it might mean next day, but for a single day view typically we clamp or assume same day.
    // The original logic just did end - start.
    let durationMins = endMinutes - startMinutes;
    if (durationMins < 0) durationMins += 24 * 60; // Handle midnight crossing primarily for display if needed

    // Position based on pixelsPerHour
    const top = (startMinutes / 60) * pixelsPerHour;
    const height = (durationMins / 60) * pixelsPerHour;

    return {
        top: `${top}px`,
        height: `${height}px`
    };
};

export const getEventColors = (event: CalendarEvent) => {
    if ((event as any).isHabit) return {
        bg: 'rgba(251, 146, 60, 0.05)', // Even lighter background
        border: 'transparent', // No border as requested
        text: '#ea580c',
        accent: '#fb923c'
    };

    switch (event.type) {
        case 'work':
            return {
                bg: 'rgba(16, 185, 129, 0.08)',
                border: 'rgba(16, 185, 129, 0.2)',
                text: '#059669',
                accent: '#10b981'
            };
        case 'study':
            return {
                bg: 'rgba(59, 130, 246, 0.08)',
                border: 'rgba(59, 130, 246, 0.2)',
                text: '#2563eb',
                accent: '#3b82f6'
            };
        case 'hobby':
            return {
                bg: 'rgba(245, 158, 11, 0.08)',
                border: 'rgba(245, 158, 11, 0.2)',
                text: '#d97706',
                accent: '#f59e0b'
            };
        case 'health':
            return {
                bg: 'rgba(239, 68, 68, 0.08)',
                border: 'rgba(239, 68, 68, 0.2)',
                text: '#dc2626',
                accent: '#ef4444'
            };
        case 'finance':
            return {
                bg: 'rgba(34, 197, 94, 0.08)',
                border: 'rgba(34, 197, 94, 0.2)',
                text: '#16a34a',
                accent: '#22c55e'
            };
        case 'social':
            return {
                bg: 'rgba(236, 72, 153, 0.08)',
                border: 'rgba(236, 72, 153, 0.2)',
                text: '#db2777',
                accent: '#ec4899'
            };
        case 'travel':
            return {
                bg: 'rgba(6, 182, 212, 0.08)',
                border: 'rgba(6, 182, 212, 0.2)',
                text: '#0891b2',
                accent: '#06b6d4'
            };
        case 'meal':
            return {
                bg: 'rgba(249, 115, 22, 0.08)',
                border: 'rgba(249, 115, 22, 0.2)',
                text: '#ea580c',
                accent: '#f97316'
            };
        case 'personal':
            return {
                bg: 'rgba(99, 102, 241, 0.08)',
                border: 'rgba(99, 102, 241, 0.2)',
                text: '#4f46e5',
                accent: '#6366f1'
            };
        default:
            return {
                bg: 'rgba(107, 114, 128, 0.08)',
                border: 'rgba(107, 114, 128, 0.2)',
                text: '#4b5563',
                accent: '#6b7280'
            };
    }
};

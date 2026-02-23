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
    // Dark-mode rgba palette — works with DayView's .replace('0.08','0.15') pattern
    if ((event as any).isHabit || (event as any).isHabitEvent) return {
        bg: 'rgba(251,146,60,0.08)',
        border: 'rgba(251,146,60,0.2)',
        text: '#FDBA74',
        accent: '#FB923C'
    };

    switch (event.type) {
        case 'work':
            return {
                bg: 'rgba(59,130,246,0.08)',
                border: 'rgba(59,130,246,0.2)',
                text: '#93C5FD',
                accent: '#3B82F6'
            };
        case 'study':
            return {
                bg: 'rgba(139,92,246,0.08)',
                border: 'rgba(139,92,246,0.2)',
                text: '#C4B5FD',
                accent: '#8B5CF6'
            };
        case 'hobby':
            return {
                bg: 'rgba(249,115,22,0.08)',
                border: 'rgba(249,115,22,0.2)',
                text: '#FDBA74',
                accent: '#F97316'
            };
        case 'health':
            return {
                bg: 'rgba(16,185,129,0.08)',
                border: 'rgba(16,185,129,0.2)',
                text: '#6EE7B7',
                accent: '#10B981'
            };
        case 'finance':
            return {
                bg: 'rgba(34,197,94,0.08)',
                border: 'rgba(34,197,94,0.2)',
                text: '#86EFAC',
                accent: '#22C55E'
            };
        case 'social':
            return {
                bg: 'rgba(236,72,153,0.08)',
                border: 'rgba(236,72,153,0.2)',
                text: '#F9A8D4',
                accent: '#EC4899'
            };
        case 'travel':
            return {
                bg: 'rgba(6,182,212,0.08)',
                border: 'rgba(6,182,212,0.2)',
                text: '#67E8F9',
                accent: '#06B6D4'
            };
        case 'meal':
            return {
                bg: 'rgba(234,179,8,0.08)',
                border: 'rgba(234,179,8,0.2)',
                text: '#FDE047',
                accent: '#EAB308'
            };
        case 'personal':
            return {
                bg: 'rgba(99,102,241,0.08)',
                border: 'rgba(99,102,241,0.2)',
                text: '#C7D2FE',
                accent: '#6366F1'
            };
        default:
            return {
                bg: 'rgba(107,114,128,0.08)',
                border: 'rgba(107,114,128,0.2)',
                text: '#D1D5DB',
                accent: '#9CA3AF'
            };
    }
};

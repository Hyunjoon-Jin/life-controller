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
    // Sophisticated Palette (Modern & Clean)
    if ((event as any).isHabit) return {
        bg: '#F5F5F7', // Warm Gray (Apple style)
        border: 'transparent',
        text: '#64748B', // Slate 500
        accent: '#94A3B8' // Slate 400
    };

    switch (event.type) {
        case 'work':
            return {
                bg: '#EFF6FF', // Blue 50
                border: '#DBEAFE', // Blue 100
                text: '#1E40AF', // Blue 800
                accent: '#3B82F6' // Blue 500
            };
        case 'study':
            return {
                bg: '#F5F3FF', // Violet 50
                border: '#EDE9FE', // Violet 100
                text: '#5B21B6', // Violet 800
                accent: '#8B5CF6' // Violet 500
            };
        case 'hobby':
            return {
                bg: '#FFF7ED', // Orange 50
                border: '#FFEDD5', // Orange 100
                text: '#9A3412', // Orange 800
                accent: '#F97316' // Orange 500
            };
        case 'health':
            return {
                bg: '#ECFDF5', // Emerald 50
                border: '#D1FAE5', // Emerald 100
                text: '#065F46', // Emerald 800
                accent: '#10B981' // Emerald 500
            };
        case 'finance':
            return {
                bg: '#F0FDF4', // Green 50
                border: '#DCFCE7', // Green 100
                text: '#166534', // Green 800
                accent: '#22C55E' // Green 500
            };
        case 'social':
            return {
                bg: '#FDF2F8', // Pink 50
                border: '#FCE7F3', // Pink 100
                text: '#9D174D', // Pink 800
                accent: '#EC4899' // Pink 500
            };
        case 'travel':
            return {
                bg: '#ECFEFF', // Cyan 50
                border: '#CFFAFE', // Cyan 100
                text: '#155E75', // Cyan 800
                accent: '#06B6D4' // Cyan 500
            };
        case 'meal':
            return {
                bg: '#FEFCEC', // Yellow 50 (Softer)
                border: '#FEF9C3', // Yellow 100
                text: '#854D0E', // Yellow 800
                accent: '#EAB308' // Yellow 500
            };
        case 'personal':
            return {
                bg: '#F8FAFC', // Slate 50
                border: '#F1F5F9', // Slate 100
                text: '#475569', // Slate 600
                accent: '#94A3B8' // Slate 400
            };
        default:
            return {
                bg: '#F3F4F6', // Gray 100
                border: '#E5E7EB', // Gray 200
                text: '#374151', // Gray 700
                accent: '#9CA3AF' // Gray 400
            };
    }
};

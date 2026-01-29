import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 9) + '-' + Math.random().toString(36).substring(2, 9);
}

export function safeFormat(date: Date | string | number | null | undefined, formatStr: string): string {
    if (!date) return '-';
    try {
        const d = new Date(date);
        if (!isValid(d)) return '-';
        return format(d, formatStr, { locale: ko });
    } catch {
        return '-';
    }
}

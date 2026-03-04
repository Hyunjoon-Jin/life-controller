import { CalendarEvent } from '@/types';

export const getEventStyle = (event: CalendarEvent, pixelsPerHour: number) => {
    const start = new Date(event.start);
    const end = new Date(event.end);

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();

    let durationMins = endMinutes - startMinutes;
    if (durationMins < 0) durationMins += 24 * 60;

    const top = (startMinutes / 60) * pixelsPerHour;
    const height = (durationMins / 60) * pixelsPerHour;

    return {
        top: `${top}px`,
        height: `${height}px`
    };
};

// 카테고리별 색상 팔레트 — 각 유형이 명확히 구분되도록 설계
// bg: 0.10 opacity (기존 0.08에서 소폭 상향해 가시성 확보)
// border: 0.25 opacity
export const getEventColors = (event: CalendarEvent) => {
    if ((event as any).isHabit || (event as any).isHabitEvent) return {
        bg: 'rgba(251,146,60,0.10)',
        border: 'rgba(251,146,60,0.25)',
        text: '#FDBA74',
        accent: '#FB923C'
    };

    switch (event.type) {
        case 'work':          // 업무 — 파란색
            return {
                bg: 'rgba(59,130,246,0.10)',
                border: 'rgba(59,130,246,0.25)',
                text: '#93C5FD',
                accent: '#3B82F6'
            };
        case 'study':         // 공부 — 보라색
            return {
                bg: 'rgba(168,85,247,0.10)',
                border: 'rgba(168,85,247,0.25)',
                text: '#D8B4FE',
                accent: '#A855F7'
            };
        case 'personal':      // 개인 — 스카이블루 (기존 인디고에서 변경, study 보라색과 명확히 구분)
            return {
                bg: 'rgba(14,165,233,0.10)',
                border: 'rgba(14,165,233,0.25)',
                text: '#7DD3FC',
                accent: '#0EA5E9'
            };
        case 'health':        // 건강 — 초록색
            return {
                bg: 'rgba(34,197,94,0.10)',
                border: 'rgba(34,197,94,0.25)',
                text: '#86EFAC',
                accent: '#22C55E'
            };
        case 'finance':       // 재테크 — 틸(청록색, 기존 연두색에서 변경, health 초록색과 구분)
            return {
                bg: 'rgba(20,184,166,0.10)',
                border: 'rgba(20,184,166,0.25)',
                text: '#5EEAD4',
                accent: '#14B8A6'
            };
        case 'social':        // 인간관계 — 핑크
            return {
                bg: 'rgba(236,72,153,0.10)',
                border: 'rgba(236,72,153,0.25)',
                text: '#F9A8D4',
                accent: '#EC4899'
            };
        case 'hobby':         // 취미 — 주황색
            return {
                bg: 'rgba(249,115,22,0.10)',
                border: 'rgba(249,115,22,0.25)',
                text: '#FDBA74',
                accent: '#F97316'
            };
        case 'travel':        // 여행 — 시안
            return {
                bg: 'rgba(6,182,212,0.10)',
                border: 'rgba(6,182,212,0.25)',
                text: '#67E8F9',
                accent: '#06B6D4'
            };
        case 'meal':          // 식사 — 노란색
            return {
                bg: 'rgba(234,179,8,0.10)',
                border: 'rgba(234,179,8,0.25)',
                text: '#FDE047',
                accent: '#EAB308'
            };
        case 'vacation':      // 휴가 — 라임그린
            return {
                bg: 'rgba(132,204,22,0.10)',
                border: 'rgba(132,204,22,0.25)',
                text: '#BEF264',
                accent: '#84CC16'
            };
        case 'family':        // 가족 — 레드
            return {
                bg: 'rgba(239,68,68,0.10)',
                border: 'rgba(239,68,68,0.25)',
                text: '#FCA5A5',
                accent: '#EF4444'
            };
        case 'shopping':      // 쇼핑 — 로즈
            return {
                bg: 'rgba(251,113,133,0.10)',
                border: 'rgba(251,113,133,0.25)',
                text: '#FDA4AF',
                accent: '#FB7185'
            };
        default:              // 기타 — 회색
            return {
                bg: 'rgba(107,114,128,0.10)',
                border: 'rgba(107,114,128,0.25)',
                text: '#D1D5DB',
                accent: '#9CA3AF'
            };
    }
};

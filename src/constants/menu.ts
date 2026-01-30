import {
    Calendar, ListTodo, UsersRound, Target, Book, Sparkles, Award, Briefcase,
    NotebookPen, Lightbulb, Bookmark, CheckSquare, Scale, ChevronRight,
    Utensils, Dumbbell, Wallet
} from 'lucide-react';

export type CategoryType = 'basic' | 'health' | 'growth' | 'record' | 'finance';
export type TabType = 'calendar' | 'tasks' | 'projects' | 'people' | 'goals' | 'language' | 'reading' | 'exercise' | 'diet' | 'inbody' | 'hobby' | 'certificate' | 'portfolio' | 'journal' | 'ideas' | 'scraps' | 'ledger' | 'assets';

export interface MenuItem {
    id: string;
    label: string;
    icon: any;
    desc: string;
}

export const CATEGORIES: { id: CategoryType; label: string }[] = [
    { id: 'basic', label: '기본 관리' },
    { id: 'health', label: '건강 관리' },
    { id: 'growth', label: '자기 성장' },
    { id: 'record', label: '기록 보관' },
    { id: 'finance', label: '자산 관리' },
];

export const SUB_MENUS: Record<CategoryType, MenuItem[]> = {
    basic: [
        { id: 'calendar', label: '일정', icon: Calendar, desc: '나의 하루를 계획하세요' },
        { id: 'tasks', label: '할일', icon: ListTodo, desc: '중요한 작업을 체크하세요' },
        { id: 'projects', label: '프로젝트 관리', icon: Briefcase, desc: '업무와 프로젝트를 체계적으로' },
        { id: 'people', label: '인맥', icon: UsersRound, desc: '소중한 관계를 관리하세요' },
    ],
    health: [
        { id: 'exercise', label: '운동', icon: Dumbbell, desc: '오늘의 운동을 기록하세요' },
        { id: 'diet', label: '식단', icon: Utensils, desc: '건강한 식습관 만들기' },
        { id: 'inbody', label: '신체 변화', icon: Scale, desc: '나의 변화를 확인하세요' },
    ],
    growth: [
        { id: 'goals', label: '목표', icon: Target, desc: '꿈을 향해 나아가세요' },
        { id: 'language', label: '어학', icon: Book, desc: '새로운 언어 배우기' },
        { id: 'reading', label: '독서', icon: Book, desc: '마음의 양식 쌓기' },
        { id: 'hobby', label: '취미', icon: Sparkles, desc: '즐거운 여가 생활' },
        { id: 'certificate', label: '자격증', icon: Award, desc: '나의 스펙 업그레이드' },
        { id: 'portfolio', label: '포트폴리오', icon: Briefcase, desc: '나의 커리어 정리' },
    ],
    record: [
        { id: 'journal', label: '일기장', icon: NotebookPen, desc: '오늘의 감정을 기록하세요' },
        { id: 'ideas', label: '아이디어', icon: Lightbulb, desc: '번뜩이는 영감 메모' },
        { id: 'scraps', label: '스크랩', icon: Bookmark, desc: '유용한 정보 저장' },
    ],
    finance: [
        { id: 'ledger', label: '가계부', icon: CheckSquare, desc: '수입과 지출 관리' },
        { id: 'assets', label: '자산 현황', icon: Wallet, desc: '나의 부를 한눈에' },
    ],
};

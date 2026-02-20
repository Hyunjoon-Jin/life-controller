import {
    Calendar, ListTodo, UsersRound, Target, Book, Sparkles, Award, Briefcase,
    NotebookPen, Lightbulb, Bookmark, CheckSquare, Scale, ChevronRight,
    Utensils, Dumbbell, Wallet, PieChart, Building, TrendingUp as TrendingUpIcon, FileText,
    Clock, LayoutTemplate
} from 'lucide-react';

export type CategoryType = 'basic' | 'health' | 'record' | 'finance';
export type TabType = 'calendar' | 'tasks' | 'projects' | 'people' | 'goals' | 'language' | 'reading' | 'exercise' | 'diet' | 'inbody' | 'hobby' | 'learning' | 'certificate' | 'portfolio' | 'journal' | 'ideas' | 'scraps' | 'report' | 'ledger' | 'assets' | 'fund' | 'realestate' | 'investment' | 'work_time' | 'templates' | 'full_schedule' | 'ambition';

import { LucideIcon } from 'lucide-react';

export interface MenuItem {
    id: string;
    label: string;
    icon: LucideIcon;
    desc: string;
}

export const CATEGORIES: { id: CategoryType; label: string }[] = [
    { id: 'basic', label: '기본' },
    { id: 'health', label: '건강' },
    { id: 'record', label: '기록' },
    { id: 'finance', label: '경제' },
];

export const WORK_NAV_ITEMS = [
    { id: 'calendar', label: '메인 대시보드', icon: Calendar },
    { id: 'full_schedule', label: '일정 관리', icon: Calendar },
    { id: 'projects', label: '프로젝트 관리', icon: Briefcase },
    { id: 'people', label: '인력 관리', icon: UsersRound },
    { id: 'work_time', label: '근무 관리', icon: Clock },
    { id: 'templates', label: '템플릿', icon: LayoutTemplate },
];

export const STUDY_NAV_ITEMS = [
    { id: 'learning', label: '학습 플래너', icon: Target },
    { id: 'language', label: '어학 학습', icon: Book },
    { id: 'reading', label: '독서 기록', icon: Book },
];

export const AMBITION_NAV_ITEMS = [
    { id: 'goals', label: '전략 목표 (OKR)', icon: Target },
    { id: 'portfolio', label: '커리어 포트폴리오', icon: Briefcase },
    { id: 'certificate', label: '자격 및 증명', icon: Award },
];

export const SUB_MENUS: Record<CategoryType, MenuItem[]> = {
    basic: [
        { id: 'calendar', label: '일정', icon: Calendar, desc: '나의 하루를 계획하세요' },
        { id: 'tasks', label: '할일', icon: ListTodo, desc: '중요한 작업을 체크하세요' },
        { id: 'people', label: '인맥', icon: UsersRound, desc: '소중한 관계를 관리하세요' },
        { id: 'hobby', label: '취미', icon: Sparkles, desc: '즐거운 여가 생활' },
    ],
    health: [
        { id: 'exercise', label: '운동', icon: Dumbbell, desc: '오늘의 운동을 기록하세요' },
        { id: 'diet', label: '식단', icon: Utensils, desc: '건강한 식습관 만들기' },
        { id: 'inbody', label: '신체 변화', icon: Scale, desc: '나의 변화를 확인하세요' },
    ],
    record: [
        { id: 'journal', label: '일기장', icon: NotebookPen, desc: '오늘의 감정을 기록하세요' },
        { id: 'ideas', label: '아이디어', icon: Lightbulb, desc: '번뜩이는 영감 메모' },
        { id: 'scraps', label: '스크랩', icon: Bookmark, desc: '유용한 정보 저장' },
        { id: 'portfolio', label: '포트폴리오', icon: Briefcase, desc: '나의 커리어 정리' },
    ],
    finance: [
        { id: 'ledger', label: '가계부', icon: CheckSquare, desc: '수입과 지출 관리' },
        { id: 'assets', label: '자산 현황', icon: Wallet, desc: '나의 부를 한눈에' },
        { id: 'investment', label: '투자 분석', icon: TrendingUpIcon, desc: '주식 및 금융상품 분석' },
        { id: 'realestate', label: '부동산', icon: Building, desc: '내 집 마련 및 투자' },
        { id: 'report', label: '활동 리포트', icon: FileText, desc: '성과 요약 및 데이터 추출' },
    ],
};

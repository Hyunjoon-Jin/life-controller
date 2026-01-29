'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    Calendar, ListTodo, UsersRound, Target, Book, Sparkles, Award, Briefcase,
    NotebookPen, Lightbulb, Bookmark, CheckSquare, Scale, Home, ChevronRight,
    Utensils, Dumbbell, Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export type CategoryType = 'basic' | 'health' | 'growth' | 'record' | 'finance';
export type TabType = 'calendar' | 'tasks' | 'people' | 'goals' | 'language' | 'reading' | 'exercise.weight' | 'exercise.cardio' | 'diet' | 'inbody' | 'hobby' | 'certificate' | 'portfolio' | 'journal' | 'ideas' | 'scraps' | 'ledger' | 'assets' | 'exercise';

interface MegaMenuNavProps {
    activeCategory: CategoryType;
    activeTab: string;
    onSelect: (category: CategoryType, tab: string) => void;
}

export function MegaMenuNav({ activeCategory, activeTab, onSelect }: MegaMenuNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState<CategoryType>(activeCategory);

    const categories: { id: CategoryType; label: string }[] = [
        { id: 'basic', label: '기본 관리' },
        { id: 'health', label: '건강 관리' },
        { id: 'growth', label: '자기 성장' },
        { id: 'record', label: '기록 보관' },
        { id: 'finance', label: '자산 관리' },
    ];

    const subMenus: Record<CategoryType, { id: string; label: string; icon: any; desc: string }[]> = {
        basic: [
            { id: 'calendar', label: '일정', icon: Calendar, desc: '나의 하루를 계획하세요' },
            { id: 'tasks', label: '할일', icon: ListTodo, desc: '중요한 작업을 체크하세요' },
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

    return (
        <div className="w-full relative z-50" onMouseLeave={() => setIsOpen(false)}>
            {/* Trigger Bar */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
                <Button
                    variant="ghost"
                    className={cn(
                        "rounded-full px-4 font-bold text-sm h-10 transition-all",
                        isOpen ? "bg-gray-100 text-black" : "hover:bg-gray-50 text-muted-foreground"
                    )}
                    onMouseEnter={() => setIsOpen(true)}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="mr-1">≡</span> 전체 메뉴
                </Button>

                <div className="h-4 w-[1px] bg-gray-200 mx-2" />

                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onMouseEnter={() => {
                            setHoveredCategory(cat.id);
                            setIsOpen(true);
                        }}
                        onClick={() => {
                            // Optionally select first tab
                            const firstTab = subMenus[cat.id][0].id;
                            onSelect(cat.id, firstTab);
                            setIsOpen(false);
                        }}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                            activeCategory === cat.id
                                ? "bg-black text-white shadow-md"
                                : "text-muted-foreground hover:bg-gray-100 hover:text-black"
                        )}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Mega Menu Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-800 p-2 min-h-[400px] flex overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

                    {/* Left: Categories List */}
                    <div className="w-48 py-4 px-2 border-r border-gray-100 dark:border-gray-800 flex flex-col gap-1">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onMouseEnter={() => setHoveredCategory(cat.id)}
                                className={cn(
                                    "text-left px-5 py-3.5 rounded-2xl text-[15px] font-bold transition-all flex justify-between items-center group",
                                    hoveredCategory === cat.id
                                        ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                {cat.label}
                                {hoveredCategory === cat.id && <ChevronRight className="w-4 h-4 text-gray-400" />}
                            </button>
                        ))}
                    </div>

                    {/* Center: Sub Menus Grid */}
                    <div className="flex-1 p-6 bg-white dark:bg-gray-900">
                        <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white px-2">
                            {categories.find(c => c.id === hoveredCategory)?.label} 서비스
                        </h3>
                        <div className="flex flex-col gap-1">
                            {subMenus[hoveredCategory].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onSelect(hoveredCategory, item.id);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl transition-all group hover:bg-gray-50 dark:hover:bg-gray-800 text-left w-full cursor-pointer",
                                        activeTab === item.id && activeCategory === hoveredCategory ? "bg-blue-50 dark:bg-blue-900/10" : ""
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                        activeTab === item.id && activeCategory === hoveredCategory
                                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                                            : "bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-blue-500 group-hover:shadow-sm"
                                    )}>
                                        <item.icon className="w-5 h-5" strokeWidth={2} />
                                    </div>
                                    <div className="flex-1 min-w-0 flex items-center gap-3">
                                        <div className={cn(
                                            "font-bold text-[15px] whitespace-nowrap",
                                            activeTab === item.id && activeCategory === hoveredCategory ? "text-blue-600" : "text-gray-900 dark:text-gray-100"
                                        )}>
                                            {item.label}
                                        </div>
                                        <div className="text-xs text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                            {item.desc}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

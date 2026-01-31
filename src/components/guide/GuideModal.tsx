'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils";
import { CATEGORIES, SUB_MENUS, CategoryType } from '@/constants/menu';
import { Info, CheckCircle2, MousePointerClick, Keyboard } from "lucide-react";

interface GuideModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialCategory?: CategoryType;
    onNavigate?: (category: CategoryType, tab: string) => void;
}

export function GuideModal({ isOpen, onOpenChange, initialCategory = 'basic', onNavigate }: GuideModalProps) {
    const [activeCategory, setActiveCategory] = useState<CategoryType>(initialCategory);

    // Sync active category when modal opens or initialCategory changes
    useEffect(() => {
        if (isOpen) {
            setActiveCategory(initialCategory);
        }
    }, [isOpen, initialCategory]);

    const getGuideContent = (id: string) => {
        switch (id) {
            case 'calendar': return '일정을 클릭하여 추가하고, 드래그하여 시간을 변경할 수 있습니다. 주간/일간 뷰에서는 시간을 더 세밀하게 관리할 수 있습니다.';
            case 'tasks': return '할 일을 추가하고 체크박스로 완료 처리하세요. 중요도 태그를 통해 우선순위를 관리할 수 있습니다.';
            case 'people': return '중요한 인맥 정보를 카드 형태로 저장하고 관리하세요. 연락처와 메모를 함께 기록할 수 있습니다.';

            case 'exercise': return '운동 종류와 시간, 강도를 기록하여 체력 증진 현황을 파악하세요.';
            case 'diet': return '아침, 점심, 저녁 식단을 사진과 함께 기록하고 칼로리를 관리해 보세요.';
            case 'inbody': return '체중, 골격근량, 체지방률 변화를 그래프로 확인하며 동기를 부여받으세요.';

            case 'goals': return '장기 목표를 세우고 하위 목표(Key Result)를 달성해 나가는 과정을 시각화하세요.';
            case 'language': return '매일 학습한 단어와 문장을 기록하고 복습하세요.';
            case 'reading': return '읽고 있는 책의 진도와 감상평을 남겨 독서 습관을 기르세요.';
            case 'hobby': return '취미 생활을 기록하고 나만의 여가 시간을 관리하세요.';
            case 'certificate': return '취득 목표 자격증 일정과 공부 계획을 관리하세요.';
            case 'portfolio': return '나만의 커리어 포트폴리오를 정리하고 관리하세요.';

            case 'journal': return '오늘 하루의 감정과 일어난 일들을 솔직하게 적어보세요.';
            case 'ideas': return '갑자기 떠오른 아이디어를 메모하고 발전시키세요.';
            case 'scraps': return '나중에 다시 보고 싶은 웹사이트 링크나 정보를 저장하세요.';

            case 'ledger': return '수입과 지출 내역을 입력하여 자산 흐름을 파악하세요.';
            case 'assets': return '현재 보유 중인 자산 현황을 한눈에 확인하세요.';

            default: return '이 기능을 활용하여 더 체계적인 삶을 계획해 보세요.';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-slate-100 flex flex-col rounded-[32px] border-0 shadow-2xl p-0 overflow-hidden">
                <div className="flex flex-1 h-full">
                    {/* Left Sidebar: Categories */}
                    <div className="w-64 bg-slate-50 dark:bg-[#2C2C2E] border-r border-slate-100 dark:border-white/5 p-6 flex flex-col gap-2">
                        <div className="mb-6 px-2">
                            <h2 className="text-xl font-extrabold flex items-center gap-2">
                                <Info className="w-6 h-6 text-blue-500" />
                                사용 가이드
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                                각 메뉴별 활용 방법을 확인하세요.
                            </p>
                        </div>

                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-between group",
                                    activeCategory === cat.id
                                        ? "bg-white dark:bg-black text-slate-900 dark:text-white shadow-sm"
                                        : "text-slate-500 hover:bg-white/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                {cat.label}
                                {activeCategory === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                            </button>
                        ))}
                    </div>

                    {/* Right Content: Guides */}
                    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#1C1C1E]">
                        <DialogHeader className="p-8 border-b border-slate-100 dark:border-white/5 shrink-0">
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                {CATEGORIES.find(c => c.id === activeCategory)?.label}
                                <span className="text-slate-300 dark:text-slate-700 font-light">|</span>
                                <span className="text-blue-500">기능 상세</span>
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                                선택하신 카테고리의 주요 기능 사용법입니다.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid gap-6">
                                {SUB_MENUS[activeCategory].map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => {
                                            if (onNavigate) {
                                                onNavigate(activeCategory, item.id);
                                                onOpenChange(false);
                                            }
                                        }}
                                        className="bg-slate-50 dark:bg-[#2C2C2E] p-6 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-900/30 transition-colors group cursor-pointer"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-black flex items-center justify-center shrink-0 shadow-sm text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                                <item.icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    {item.label}
                                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                        {item.desc}
                                                    </span>
                                                </h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                                    {getGuideContent(item.id)}
                                                </p>

                                                {/* Common Actions (Visual Only) */}
                                                <div className="flex gap-2 mt-3">
                                                    <div className="inline-flex items-center gap-1 text-[10px] bg-white dark:bg-black px-2 py-1 rounded-lg text-slate-400 border border-slate-100 dark:border-white/5">
                                                        <MousePointerClick className="w-3 h-3" /> 클릭하여 상세 보기
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* General Tips Section */}
                            <div className="mt-8 p-6 rounded-3xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                                <h4 className="font-bold flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                                    <CheckCircle2 className="w-5 h-5" />
                                    활용 팁
                                </h4>
                                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 ml-1 list-disc list-inside marker:text-blue-400">
                                    <li>우측 상단의 테마 토글 버튼으로 다크 모드를 설정할 수 있습니다.</li>
                                    <li>대시보드의 위젯을 통해 오늘의 할 일을 빠르게 확인할 수 있습니다.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

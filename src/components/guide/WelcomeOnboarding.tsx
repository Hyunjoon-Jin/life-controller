'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { GuideModal } from './GuideModal';
import { OnboardingTour } from './OnboardingTour';

import { createClient } from '@/lib/supabase';

const TOUR_STEPS = [
    {
        target: '.hero-section', // Need to add these classes to components
        title: '대시보드에 오신 것을 환영합니다!',
        content: '여기서 당신의 오늘의 현황과 날씨, 주요 지표를 한눈에 확인할 수 있습니다.',
        position: 'bottom' as const
    },
    {
        target: '[data-tour="search"]',
        title: '빠른 메뉴 검색',
        content: '필요한 기능이 어디 있는지 모르겠다면 검색창을 활용해보세요. Ctrl+K로도 열 수 있습니다.',
        position: 'bottom' as const
    },
    {
        target: '[data-tour="shortcuts"]',
        title: '나만의 바로가기',
        content: '자주 사용하는 기능을 홈 화면에 배치하여 빠르게 접근할 수 있습니다.',
        position: 'top' as const
    },
    {
        target: '[data-tour="checklist"]',
        title: '시작하기 체크리스트',
        content: '초기 설정을 완료하고 서비스의 모든 가치를 경험해보세요.',
        position: 'bottom' as const
    }
];

export function WelcomeOnboarding() {
    const [isOpen, setIsOpen] = useState(false);
    const [isTourOpen, setIsTourOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const checkGuideStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: settings } = await supabase
                .from('user_settings')
                .select('has_seen_guide')
                .eq('user_id', user.id)
                .single();

            if (settings && !settings.has_seen_guide) {
                setIsOpen(true);
            }
        };

        checkGuideStatus();
    }, []);

    const markAsSeen = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from('user_settings')
            .update({ has_seen_guide: true })
            .eq('user_id', user.id);
    };

    const startTour = async () => {
        setIsOpen(false);
        setIsTourOpen(true);
        await markAsSeen();
    };

    const handleClose = async () => {
        setIsOpen(false);
        await markAsSeen();
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[32px] border-none shadow-2xl">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-black mb-2 tracking-tight">반갑습니다!</h2>
                            <p className="text-blue-100 font-medium">당신의 새로운 삶을 설계할 준비가 되셨나요?</p>
                        </div>
                    </div>

                    <div className="p-8 space-y-6 bg-white dark:bg-slate-900">
                        <div className="space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">체계적인 일정 관리</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">계획부터 실천까지 모든 일정을 한눈에 관리하세요.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">건강 및 성장 기록</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">식단, 운동, 어학 등 어제보다 더 나은 나를 기록하세요.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <Button
                                onClick={startTour}
                                className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 group"
                            >
                                가이드 보기 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={handleClose}
                                className="w-full h-12 rounded-2xl font-bold text-slate-500"
                            >
                                나중에 살펴볼게요
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <OnboardingTour
                isOpen={isTourOpen}
                steps={TOUR_STEPS}
                onComplete={() => setIsTourOpen(false)}
            />
        </>
    );
}

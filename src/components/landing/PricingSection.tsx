'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function PricingSection({ mode }: { mode: 'life' | 'work' }) {
    const [isAnnual, setIsAnnual] = useState(true);

    const plans = [
        {
            name: "Life Plan",
            price: "Free",
            desc: "개인의 일상 관리를 위한 완벽한 시작",
            features: [
                "무제한 일정 및 할 일 생성",
                "기본 습관 트래커 (최대 5개)",
                "월간 목표 설정 (OKR 지원)",
                "기본 재무 대시보드",
                "모바일 앱 (PWA) 지원"
            ],
            notIncluded: [
                "팀 협업 및 프로젝트 공유",
                "고급 데이터 분석 리포트",
                "파일 첨부 용량 제한 (5MB)",
                "API 연동"
            ],
            cta: "지금 무료로 시작하기",
            href: "/register",
            popular: false
        },
        {
            name: "Pro Work",
            price: isAnnual ? "₩9,900" : "₩12,900",
            period: isAnnual ? "/월 (연간 청구)" : "/월",
            desc: "업무 효율을 극대화하는 전문가용 솔루션",
            features: [
                "Life Plan의 모든 기능 포함",
                "무제한 팀 워크스페이스",
                "고급 프로젝트 관리 & 간트 차트",
                "AI 기반 성과 분석 리포트",
                "구글 캘린더 양방향 동기화",
                "우선 순위 고객 지원"
            ],
            notIncluded: [],
            cta: "14일 무료 체험하기",
            href: "/register?plan=pro",
            popular: true
        }
    ];

    return (
        <section className={cn(
            "py-0 px-6 transition-colors duration-1000",
            mode === 'life' ? "bg-slate-50" : "bg-slate-900/50"
        )}>
            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-4">
                        단순하고 투명한 <span className="text-blue-600">요금제</span>
                    </h2>
                    <p className={cn(
                        "text-lg mb-8",
                        mode === 'life' ? "text-slate-500" : "text-slate-400"
                    )}>
                        복잡한 옵션 없이, 나에게 꼭 필요한 플랜만 선택하세요.
                    </p>

                    <div className="flex items-center justify-center gap-4">
                        <span className={cn("text-sm font-bold", !isAnnual && "text-blue-600")}>Monthly</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className={cn(
                                "w-14 h-8 rounded-full p-1 transition-colors relative",
                                isAnnual ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                            )}
                        >
                            <motion.div
                                animate={{ x: isAnnual ? 24 : 0 }}
                                className="w-6 h-6 rounded-full bg-white shadow-sm"
                            />
                        </button>
                        <span className={cn("text-sm font-bold", isAnnual && "text-blue-600")}>
                            Yearly <span className="text-xs text-rose-500 font-black ml-1">-20%</span>
                        </span>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={cn(
                                "relative p-8 md:p-10 rounded-[40px] border-2 transition-all duration-300",
                                plan.popular
                                    ? "bg-white dark:bg-slate-800 border-blue-600 shadow-2xl scale-105 z-10"
                                    : "bg-transparent border-slate-200 dark:border-slate-800 hover:border-blue-300"
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black">{plan.price}</span>
                                    {plan.period && <span className="text-sm font-medium text-slate-500">{plan.period}</span>}
                                </div>
                                <p className="text-sm text-slate-500 mt-4">{plan.desc}</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm font-medium">
                                        <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span className={mode === 'life' ? "text-slate-700" : "text-slate-300"}>{feature}</span>
                                    </li>
                                ))}
                                {plan.notIncluded.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm font-medium opacity-40">
                                        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                                            <X className="w-3 h-3" />
                                        </div>
                                        <span className={mode === 'life' ? "text-slate-700" : "text-slate-300"}>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link href={plan.href} className="block">
                                <Button
                                    className={cn(
                                        "w-full h-14 rounded-2xl text-lg font-bold transition-all",
                                        plan.popular
                                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/30"
                                            : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-900 dark:text-white"
                                    )}
                                >
                                    {plan.cta}
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Plus, Minus, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
    mode: 'life' | 'work';
}

function FAQItem({ question, answer, isOpen, onClick, mode }: FAQItemProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "border-b transition-colors cursor-pointer group",
                mode === 'life' ? "border-slate-200" : "border-white/10"
            )}
        >
            <div className="py-4 flex items-center justify-between gap-4">
                <h4 className={cn(
                    "text-base font-bold transition-colors text-left",
                    mode === 'life' ? "text-slate-800 group-hover:text-blue-600" : "text-slate-200 group-hover:text-blue-400"
                )}>
                    {question}
                </h4>
                <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0",
                    isOpen
                        ? (mode === 'life' ? "bg-blue-100 text-blue-600 rotate-180" : "bg-blue-900/30 text-blue-400 rotate-180")
                        : (mode === 'life' ? "bg-slate-100 text-slate-500" : "bg-white/5 text-slate-400")
                )}>
                    {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </div>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <p className={cn(
                            "pb-4 text-sm leading-relaxed whitespace-pre-line text-left",
                            mode === 'life' ? "text-slate-500" : "text-slate-400"
                        )}>
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const FAQS = [
    {
        q: "무료 버전과 유료 버전의 차이는?",
        a: "무료(Life Plan)로도 일정, 목표, 습관 관리가 가능합니다. Pro는 팀 협업과 고급 데이터 분석을 제공합니다."
    },
    {
        q: "모바일 앱 지원?",
        a: "iOS/Android 완벽 지원하며, 설치 없이 PWA로 즉시 사용할 수 있습니다."
    },
    {
        q: "데이터 보안?",
        a: "AES-256 암호화로 안전하게 저장되며, 실시간 클라우드 동기화를 지원합니다."
    },
    {
        q: "외부 데이터 연동?",
        a: "Google Calendar 연동을 지원하며, Notion 가져오기 기능도 곧 출시됩니다."
    }
];

export function PricingAndFAQ({ mode }: { mode: 'life' | 'work' }) {
    const [isAnnual, setIsAnnual] = useState(true);
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const plans = [
        {
            name: "Life Plan",
            price: "Free",
            desc: "개인용 완벽 시작",
            features: ["무제한 일정/할일", "습관 트래커(5개)", "월간 목표(OKR)", "기본 재무/자산"],
            cta: "무료 시작",
            href: "/register",
            popular: false
        },
        {
            name: "Pro Work",
            price: isAnnual ? "₩9,900" : "₩12,900",
            period: "/월",
            desc: "전문가용 솔루션",
            features: ["Life 기능 전체", "무제한 팀 워크스페이스", "고급 프로젝트/간트", "AI 성과 분석"],
            cta: "14일 무료",
            href: "/register?plan=pro",
            popular: true
        }
    ];

    return (
        <section className={cn(
            "h-screen flex flex-col justify-center px-4 md:px-6 transition-colors duration-1000 overflow-hidden",
            mode === 'life' ? "bg-white" : "bg-slate-900"
        )}>
            <div className="container mx-auto max-w-7xl h-full flex flex-col justify-center">
                {/* Header */}
                <div className="text-center mb-6 shrink-0">
                    <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
                        합리적인 <span className="text-blue-600">가격</span>과 궁금한 이야기
                    </h2>
                    <div className="flex items-center justify-center gap-4 text-sm">
                        <span className={cn("font-bold", !isAnnual && "text-blue-600")}>월간 결제</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className={cn(
                                "w-12 h-6 rounded-full p-1 transition-colors relative",
                                isAnnual ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                            )}
                        >
                            <motion.div animate={{ x: isAnnual ? 24 : 0 }} className="w-4 h-4 rounded-full bg-white shadow-sm" />
                        </button>
                        <span className={cn("font-bold", isAnnual && "text-blue-600")}>연간 결제 <span className="text-rose-500 font-black">-20%</span></span>
                    </div>
                </div>

                <div className="flex-1 min-h-0 grid lg:grid-cols-12 gap-6 lg:gap-12 items-center">
                    {/* Left: Pricing Cards (7 Cols) */}
                    <div className="lg:col-span-7 grid md:grid-cols-2 gap-4 h-full md:h-auto items-center overflow-y-auto custom-scrollbar p-1">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={cn(
                                    "relative p-6 rounded-[32px] border-2 transition-all duration-300 flex flex-col justify-between h-auto min-h-[320px]",
                                    plan.popular
                                        ? "bg-white dark:bg-slate-800 border-blue-600 shadow-xl z-10"
                                        : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                                )}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                                        추천
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-2">
                                        <span className="text-3xl font-black">{plan.price}</span>
                                        {plan.period && <span className="text-xs font-medium text-slate-500">{plan.period}</span>}
                                    </div>
                                    <p className="text-xs text-slate-500 mb-4">{plan.desc}</p>
                                    <ul className="space-y-2 mb-6">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs font-medium">
                                                <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                                                    <Check className="w-2.5 h-2.5" />
                                                </div>
                                                <span className={mode === 'life' ? "text-slate-700" : "text-slate-300"}>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Link href={plan.href} className="block mt-auto">
                                    <Button className={cn("w-full h-10 rounded-xl font-bold", plan.popular ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-900 dark:text-white")}>
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Right: FAQ (5 Cols) */}
                    <div className="lg:col-span-5 h-full flex flex-col justify-center">
                        <div className={cn(
                            "p-6 rounded-[32px] border",
                            mode === 'life' ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/5"
                        )}>
                            <div className="mb-4 flex items-center gap-2 text-slate-500">
                                <HelpCircle className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">FAQ</span>
                            </div>
                            <div className="space-y-0">
                                {FAQS.map((faq, index) => (
                                    <FAQItem
                                        key={index}
                                        question={faq.q}
                                        answer={faq.a}
                                        isOpen={openIndex === index}
                                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                        mode={mode}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

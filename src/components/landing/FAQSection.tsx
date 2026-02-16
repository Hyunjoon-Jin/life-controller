'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
            <div className="py-6 flex items-center justify-between gap-4">
                <h4 className={cn(
                    "text-lg font-bold transition-colors",
                    mode === 'life' ? "text-slate-800 group-hover:text-blue-600" : "text-slate-200 group-hover:text-blue-400"
                )}>
                    {question}
                </h4>
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    isOpen
                        ? (mode === 'life' ? "bg-blue-100 text-blue-600 rotate-180" : "bg-blue-900/30 text-blue-400 rotate-180")
                        : (mode === 'life' ? "bg-slate-100 text-slate-500" : "bg-white/5 text-slate-400")
                )}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
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
                            "pb-6 text-base leading-relaxed whitespace-pre-line",
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
        q: "무료 버전과 유료 버전의 차이는 무엇인가요?",
        a: "무료 버전(Life Plan)에서도 일정, 목표, 습관 관리의 핵심 기능을 제한 없이 사용할 수 있습니다.\n유료 버전(Pro Work)에서는 팀 협업, 무제한 프로젝트 생성, 고급 데이터 분석 리포트, API 연동 등 업무에 최적화된 전문 기능을 제공합니다."
    },
    {
        q: "모바일 앱도 지원하나요?",
        a: "네, 현재 iOS와 Android 모두 완벽하게 지원하는 PWA(Progressive Web App) 방식으로 제공됩니다.\n스토어 설치 없이 브라우저에서 '홈 화면에 추가'를 통해 앱처럼 빠르고 편리하게 사용할 수 있습니다."
    },
    {
        q: "데이터는 안전하게 보관되나요?",
        a: "모든 데이터는 업계 최고 수준의 암호화 기술(AES-256)을 통해 클라우드에 안전하게 저장됩니다.\n또한 실시간 동기화를 지원하여 기기를 변경하더라도 로그인만 하면 즉시 이어서 사용할 수 있습니다."
    },
    {
        q: "기존에 쓰던 Notion이나 Google Calendar 데이터를 가져올 수 있나요?",
        a: "현재 Google Calendar 연동을 지원하고 있으며, Notion 데이터 가져오기(Import) 기능은 베타 테스트 중입니다.\n빠른 시일 내에 원클릭 마이그레이션 기능을 정식 출시할 예정입니다."
    }
];

export function FAQSection({ mode }: { mode: 'life' | 'work' }) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className={cn(
            "py-12 px-6 transition-colors duration-1000",
            mode === 'life' ? "bg-white" : "bg-slate-950"
        )}>
            <div className="container mx-auto max-w-3xl">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">
                        <HelpCircle className="w-3 h-3" /> FAQ
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-4">
                        자주 묻는 질문
                    </h2>
                    <p className={cn(
                        "text-lg",
                        mode === 'life' ? "text-slate-500" : "text-slate-400"
                    )}>
                        궁금한 점이 있으신가요? 가장 많이 접수된 질문들을 모았습니다.
                    </p>
                </div>

                <div className="space-y-2">
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
        </section>
    );
}

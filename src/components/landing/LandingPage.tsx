'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import {
    Calendar, Target, Activity, DollarSign,
    Sparkles, ChevronRight, Zap,
    Shield, Globe, Heart, Star,
    CheckCircle2, TrendingUp, GraduationCap, Briefcase, BookOpen,
    Clock, Users
} from 'lucide-react';
import { BentoGrid, BentoCard, BentoVisuals } from './BentoGrid';
import { InteractiveDemo } from './InteractiveDemo';
import { PricingAndFAQ } from './PricingAndFAQ';
import { ErrorBoundary } from './ErrorBoundary';
import { cn } from '@/lib/utils';

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "J들의 놀이터",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "KRW"
    },
    "description": "인생과 업무의 균형을 위한 올인원 생산성 도구."
};

const MODES = [
    {
        id: 'life',
        label: '일상 모드',
        icon: Sparkles,
        desc: '하루를 체계적으로 설계하는 기본 워크스페이스',
        features: ['오늘의 일정 & 드래그 시간 배치', '습관 스트릭 & 반복 루틴 관리', '가계부 & 순자산 현황 추적', '인바디 · 식단 · 운동 기록'],
        accent: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        glow: 'bg-emerald-500',
    },
    {
        id: 'study',
        label: '학습 모드',
        icon: GraduationCap,
        desc: '시험·자격증·자기계발을 위한 집중 학습 환경',
        features: ['포모도로 타이머 & 집중 세션', '과목별 학습 진도 시각화', '시험 D-day 카운트다운', '독서 · 언어 학습 · 자격증 기록'],
        accent: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
        glow: 'bg-indigo-500',
    },
    {
        id: 'work',
        label: '업무 모드',
        icon: Briefcase,
        desc: '팀 프로젝트와 업무 효율을 극대화하는 전문가 모드',
        features: ['칸반 보드 & 프로젝트 관리', '팀 협업 & 업무 배분', '업무 시간 추적기 (타임로그)', '주간 보고서 자동 생성'],
        accent: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        glow: 'bg-purple-500',
    },
    {
        id: 'ambition',
        label: '야망 모드',
        icon: Target,
        desc: '큰 꿈을 현실로 만드는 장기 목표 관리 특화 모드',
        features: ['OKR 목표 & 핵심 결과 트리', '포트폴리오 & 이력 정리', '자격증 취득 로드맵', 'AI 기반 성과 분석 리포트'],
        accent: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        glow: 'bg-amber-500',
    },
];

export function LandingPage() {
    const [scrollProgress, setScrollProgress] = useState(0);
    const visuals = BentoVisuals();
    const containerRef = useRef<HTMLDivElement>(null);

    // SEO
    useEffect(() => {
        document.title = "J들의 놀이터 | 당신의 하루를 작품처럼";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', "목표, 일정, 습관, 자산 관리를 한 곳에서. J들의 놀이터로 당신의 일상을 체계적으로 설계하세요.");
        }
    }, []);

    // Scroll Progress
    useEffect(() => {
        const handleScroll = () => {
            const container = containerRef.current;
            if (!container) return;
            const totalHeight = container.scrollHeight - container.clientHeight;
            setScrollProgress((container.scrollTop / totalHeight) * 100);
        };
        const container = containerRef.current;
        container?.addEventListener('scroll', handleScroll);
        return () => container?.removeEventListener('scroll', handleScroll);
    }, []);

    const { scrollY } = useScroll({ container: containerRef });
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const sections = document.querySelectorAll('section[data-snap="true"]');
            const windowHeight = window.innerHeight;
            const container = containerRef.current;
            if (!container) return;

            let currentIndex = 0;
            sections.forEach((section, i) => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
                    currentIndex = i;
                }
            });

            if (e.key === 'ArrowDown') {
                const rect = sections[currentIndex].getBoundingClientRect();
                if (rect.bottom > windowHeight + 5) return;
                e.preventDefault();
                if (currentIndex < sections.length - 1) sections[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
            } else if (e.key === 'ArrowUp') {
                const rect = sections[currentIndex].getBoundingClientRect();
                if (rect.top < -5) return;
                e.preventDefault();
                if (currentIndex > 0) sections[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div
            ref={containerRef}
            className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-white text-slate-900"
        >
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Scroll Progress Indicator */}
            <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[60] hidden lg:flex flex-col gap-4 items-center">
                <div className="absolute top-0 bottom-0 w-0.5 bg-slate-200 -z-10" />
                <motion.div
                    className="absolute top-0 w-0.5 bg-blue-600 -z-10"
                    style={{ height: `${scrollProgress}%` }}
                />
                {[0, 17, 34, 51, 68, 85].map((p, i) => (
                    <div
                        key={p}
                        onClick={() => {
                            const sections = document.querySelectorAll('section[data-snap="true"]');
                            if (sections[i]) sections[i].scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300 border-2 border-white cursor-pointer hover:scale-150",
                            scrollProgress >= p ? "bg-blue-600 scale-125" : "bg-slate-200"
                        )}
                    />
                ))}
            </div>

            {/* Header — h-20 (80px) */}
            <header className="fixed top-0 w-full z-50 backdrop-blur-md border-b bg-white/80 border-gray-100">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Logo variant="full" className="scale-90" />
                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" className="font-bold text-slate-600">로그인</Button>
                        </Link>
                        <Link href="/register">
                            <Button className="rounded-full px-8 font-black shadow-xl transition-all hover:scale-105 bg-blue-600 hover:bg-blue-700 text-white">
                                시작하기
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* ── 1. Hero ── */}
            <section data-snap="true" className="h-screen snap-start flex flex-col justify-center relative overflow-hidden pt-20">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Card 1 – Today's Schedule (left, y1 parallax) */}
                    <motion.div
                        style={{ y: y1 }}
                        animate={{ rotate: [0, 1, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[30%] left-8 hidden xl:block"
                    >
                        <div className="w-56 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs font-black text-slate-700">오늘 할 일</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">3/5 완료</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }} />
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-2.5 h-2.5 text-blue-500" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 line-through">09:00 팀 미팅</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full border border-slate-200 shrink-0" />
                                    <span className="text-[10px] font-bold text-slate-600">11:00 기획서 작성</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2 – Monthly Savings (right top, independent) */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[28%] right-8 hidden xl:block"
                    >
                        <div className="w-48 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-black text-white">이번달 저축</span>
                            </div>
                            <p className="text-2xl font-black text-white tracking-tighter">₩220만</p>
                            <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-emerald-400" />
                                <span className="text-[10px] font-bold text-emerald-400">전월 대비 +15%</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3 – Goal Progress (right bottom, y2 parallax) */}
                    <motion.div
                        style={{ y: y2 }}
                        animate={{ rotate: [0, -1, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-[22%] right-8 hidden xl:block"
                    >
                        <div className="w-52 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-black text-slate-700">목표 달성률</span>
                            </div>
                            <div className="space-y-2">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-slate-500">독서 24권</span>
                                        <span className="text-emerald-500">65%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: '65%' }} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-slate-500">운동 루틴</span>
                                        <span className="text-emerald-500">42%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: '42%' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] blur-3xl opacity-20 pointer-events-none bg-blue-400" />

                <div className="container mx-auto text-center max-w-5xl relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-8 border bg-blue-50 border-blue-100 text-blue-600">
                            <Sparkles className="w-3 h-3" /> 올인원 라이프 컨트롤러
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-[1.0]">
                            당신의 하루를 <br /> <span className="text-blue-600">작품처럼</span> 설계하세요
                        </h1>

                        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed font-medium text-slate-600">
                            목표, 일정, 습관, 자산 관리를 한 곳에서. <br />
                            일상의 조각들을 하나로 연결하여 완성하는 나만의 라이프 시스템.
                        </p>

                        <Link href="/register">
                            <Button size="lg" className="h-14 px-10 text-lg rounded-full font-black shadow-2xl transition-all hover:scale-105 bg-slate-900 text-white">
                                지금 무료로 시작하기 <ChevronRight className="ml-2 w-6 h-6" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ── 2. Bento Grid Features ── */}
            <section data-snap="true" className="h-screen snap-start flex flex-col justify-center px-6 overflow-hidden pt-20">
                <div className="container mx-auto max-w-6xl h-full flex flex-col justify-center">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 shrink-0">
                        <div className="max-w-xl">
                            <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
                                기능 하나하나가 <br /> <span className="text-blue-600">혁신적인</span> 이유
                            </h2>
                            <p className="text-sm font-medium text-slate-500">
                                단조로운 할 일 목록이 아닙니다. 데이터가 연결되고 성장이 가시화되는 진짜 도구입니다.
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0">
                        <BentoGrid className="h-full">
                            {/* C1: col-span-2 row-span-2 */}
                            <BentoCard
                                title="스마트 스케줄러"
                                description="월·주·일 캘린더를 자유롭게 전환하고 드래그로 시간 블록을 배치하세요. 습관 스트릭, 우선순위 설정, 반복 알림까지 — 아무것도 놓치지 않는 하루 설계."
                                icon={Calendar}
                                className="md:col-span-2 md:row-span-2"
                                visual={visuals.Calendar}
                                delay={0.05}
                            />
                            {/* C2: col-span-2 */}
                            <BentoCard
                                title="목표 & OKR 트리"
                                description="큰 꿈을 측정 가능한 핵심 결과(KR)로 분해합니다. 상위 목표가 달성될수록 하위 지표가 자동 연산되고, 달성 히스토리가 타임라인으로 기록됩니다."
                                icon={Target}
                                colorClassName="bg-emerald-50 dark:bg-emerald-900/30"
                                iconClassName="text-emerald-600 dark:text-emerald-400"
                                className="md:col-span-2"
                                visual={visuals.Target}
                                delay={0.1}
                            />
                            {/* C3: 1 cell */}
                            <BentoCard
                                title="전방위 자산 관리"
                                description="가계부부터 부동산·투자 수익률까지. 순자산 변화 그래프와 저축 목표를 한 화면에서 추적합니다."
                                icon={DollarSign}
                                colorClassName="bg-purple-50 dark:bg-purple-900/30"
                                iconClassName="text-purple-600 dark:text-purple-400"
                                visual={visuals.Finance}
                                delay={0.15}
                            />
                            {/* C4: 1 cell */}
                            <BentoCard
                                title="통합 건강 기록"
                                description="운동 세션, 인바디, 식단, 수분 섭취를 모두 기록하고 신체 변화를 그래프로 가시화합니다."
                                icon={Activity}
                                colorClassName="bg-rose-50 dark:bg-rose-900/30"
                                iconClassName="text-rose-600 dark:text-rose-400"
                                visual={visuals.Health}
                                delay={0.2}
                            />
                            {/* C5: col-span-2 */}
                            <BentoCard
                                title="학습 플래너 & 포모도로"
                                description="독서, 언어, 자격증 학습 진도를 과목별로 추적합니다. 포모도로 타이머와 시험 D-day 카운터로 집중력을 극대화하세요."
                                icon={GraduationCap}
                                colorClassName="bg-indigo-50 dark:bg-indigo-900/30"
                                iconClassName="text-indigo-600 dark:text-indigo-400"
                                className="md:col-span-2"
                                visual={visuals.Study}
                                delay={0.25}
                            />
                            {/* C6: col-span-2 */}
                            <BentoCard
                                title="프로젝트 & 협업"
                                description="칸반 보드, 간트 차트, 팀 업무 배분까지. 업무 시간 추적기와 주간 보고서 자동 생성으로 생산성을 극대화합니다."
                                icon={Briefcase}
                                colorClassName="bg-violet-50 dark:bg-violet-900/30"
                                iconClassName="text-violet-600 dark:text-violet-400"
                                className="md:col-span-2"
                                visual={visuals.Project}
                                delay={0.3}
                            />
                        </BentoGrid>
                    </div>
                </div>
            </section>

            {/* ── 3. 4 Modes ── */}
            <section data-snap="true" className="h-screen snap-start flex flex-col justify-center px-6 bg-slate-900 overflow-hidden pt-20">
                <div className="container mx-auto max-w-6xl h-full flex flex-col justify-center gap-6">
                    {/* Header */}
                    <div className="text-center shrink-0">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">
                            <Sparkles className="w-3 h-3" /> 4가지 전문 모드
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white mb-2">
                            상황에 맞는 <span className="text-emerald-400">전문 워크스페이스</span>
                        </h2>
                        <p className="text-slate-400 font-medium text-sm max-w-xl mx-auto">
                            버튼 하나로 UI와 기능 세트가 자동 전환됩니다. 학습할 땐 학습에, 일할 땐 업무에 — 오직 지금 중요한 것에만 집중하세요.
                        </p>
                    </div>

                    {/* Mode Cards */}
                    <div className="flex-1 min-h-0 grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {MODES.map((mode, i) => (
                            <motion.div
                                key={mode.id}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                                className={cn(
                                    'relative p-5 rounded-[28px] border flex flex-col gap-4 overflow-hidden',
                                    mode.bg, mode.border
                                )}
                            >
                                {/* Icon + Label */}
                                <div className="flex items-center gap-3">
                                    <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center shrink-0', mode.bg, 'border', mode.border)}>
                                        <mode.icon className={cn('w-5 h-5', mode.accent)} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-white leading-tight">{mode.label}</h3>
                                        <p className={cn('text-[10px] font-bold uppercase tracking-wider', mode.accent)}>Mode</p>
                                    </div>
                                </div>

                                {/* Desc */}
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">{mode.desc}</p>

                                {/* Features */}
                                <ul className="space-y-2 flex-1">
                                    {mode.features.map((f, j) => (
                                        <li key={j} className="flex items-start gap-2 text-xs font-medium text-slate-300">
                                            <CheckCircle2 className={cn('w-3.5 h-3.5 mt-0.5 shrink-0', mode.accent)} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                {/* Background glow */}
                                <div className={cn('absolute -bottom-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-15', mode.glow)} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 4. Interactive Demo ── */}
            <section data-snap="true" className="h-screen snap-start flex flex-col justify-center px-6 bg-slate-50 overflow-hidden pt-20">
                <div className="container mx-auto h-full flex flex-col justify-center gap-4">
                    <div className="text-center shrink-0 space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                            라이브 데모
                        </div>
                        <h2 className="text-xl md:text-2xl font-black tracking-tight">
                            기다리지 말고 <span className="text-blue-600">지금 바로</span> 만져보세요
                        </h2>
                        <p className="text-slate-500 font-medium max-w-2xl mx-auto text-sm">
                            백문이 불여일견. 가입 전에도 앱의 핵심 기능을 실시간으로 조작해볼 수 있습니다.
                        </p>
                    </div>

                    <div className="flex-1 min-h-0 flex flex-col justify-center">
                        <ErrorBoundary>
                            <InteractiveDemo />
                        </ErrorBoundary>
                    </div>
                </div>
            </section>

            {/* ── 5. Pricing & FAQ ── */}
            <section data-snap="true" className="h-screen snap-start flex flex-col justify-center overflow-hidden pt-20">
                <PricingAndFAQ mode="life" />
            </section>

            {/* ── 6. Final CTA + Footer ── */}
            <section data-snap="true" className="h-screen snap-start flex flex-col bg-white overflow-hidden pt-20">
                {/* Final CTA */}
                <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-blue-50 border border-blue-100 text-blue-600">
                        <Sparkles className="w-3 h-3" /> 지금 바로 시작하세요
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-xl">
                        더 나은 내일을 위한 <br /> <span className="text-blue-600">첫 걸음</span>
                    </h2>
                    <p className="text-slate-500 font-medium max-w-md text-base">
                        무료로 가입하고 목표, 일정, 건강, 자산을 한 곳에서 관리해 보세요.
                    </p>
                    <Link href="/register">
                        <Button size="lg" className="h-14 px-10 text-lg rounded-full font-black shadow-2xl transition-all hover:scale-105 bg-slate-900 text-white">
                            무료로 시작하기 <ChevronRight className="ml-2 w-6 h-6" />
                        </Button>
                    </Link>
                </div>

                {/* Trust Badges */}
                <div className="py-6 border-y border-slate-100 bg-slate-50 shrink-0">
                    <div className="container mx-auto px-6 max-w-6xl">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 opacity-40">
                            <div className="flex items-center gap-2 justify-center font-bold text-sm"><Shield className="w-4 h-4" /> 강력한 보안</div>
                            <div className="flex items-center gap-2 justify-center font-bold text-sm"><Globe className="w-4 h-4" /> 클라우드 동기화</div>
                            <div className="flex items-center gap-2 justify-center font-bold text-sm"><Zap className="w-4 h-4" /> 다크모드 지원</div>
                            <div className="flex items-center gap-2 justify-center font-bold text-sm"><Heart className="w-4 h-4" /> 사용자 중심</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="py-5 px-6 font-medium bg-white shrink-0">
                    <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-6 mb-5">
                        <div>
                            <Logo variant="full" className="mb-4 scale-90 -ml-2" />
                            <p className="text-sm opacity-50">성장을 위한 완벽한 동반자.</p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-3 text-sm">제품</h4>
                            <ul className="space-y-1.5 text-sm opacity-50">
                                <li>기능</li>
                                <li>가격</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-3 text-sm">회사</h4>
                            <ul className="space-y-1.5 text-sm opacity-50">
                                <li>소개</li>
                                <li>문의</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-3 text-sm">소셜</h4>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                                    <Star className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="container mx-auto text-center pt-4 border-t border-slate-100 opacity-40 text-xs flex flex-col md:flex-row justify-between items-center gap-3">
                        <p>© {new Date().getFullYear()} J들의 놀이터.</p>
                        <div className="flex gap-6">
                            <Link href="/privacy" className="hover:underline hover:opacity-100 transition-opacity">개인정보처리방침</Link>
                            <Link href="/terms" className="hover:underline hover:opacity-100 transition-opacity">이용약관</Link>
                        </div>
                    </div>
                </footer>
            </section>
        </div>
    );
}

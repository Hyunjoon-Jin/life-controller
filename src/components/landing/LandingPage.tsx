'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import {
    Calendar, Target, Activity, DollarSign,
    Sparkles, Briefcase, ChevronRight, Zap,
    Shield, Globe, Heart, Star,
    Layers, MousePointer, Rocket
} from 'lucide-react';
import { BentoGrid, BentoCard, BentoVisuals } from './BentoGrid';
import { InteractiveDemo } from './InteractiveDemo';
import { ModeSwitch } from './ModeSwitch';
import { FAQSection } from './FAQSection';
import { NewsletterSection } from './NewsletterSection';
import { PricingSection } from './PricingSection';
import { ErrorBoundary } from './ErrorBoundary';
import { cn } from '@/lib/utils';
import { useScroll, useTransform } from 'framer-motion';

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Life Controller",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "KRW"
    },
    "description": "All-in-one productivity tool for life and work balance."
};

export function LandingPage() {
    const [landingMode, setLandingMode] = useState<'life' | 'work'>('life');
    const [scrollProgress, setScrollProgress] = useState(0);
    const visuals = BentoVisuals();
    const containerRef = useRef<HTMLDivElement>(null);

    // Mode Persistence & SEO
    useEffect(() => {
        const savedMode = localStorage.getItem('life_controller_landing_mode') as 'life' | 'work';
        if (savedMode) setLandingMode(savedMode);
    }, []);

    useEffect(() => {
        document.title = landingMode === 'life'
            ? "Life Controller | 당신의 하루를 작품처럼"
            : "Life Controller | 업무 생산성의 한계를 넘다";

        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', landingMode === 'life'
                ? "목표, 일정, 습관, 자산 관리를 한 곳에서. Life Controller로 당신의 일상을 체계적으로 설계하세요."
                : "팀 협업, 프로젝트 관리, 성과 분석까지. 업무 효율을 극대화하는 올인원 비즈니스 솔루션.");
        }
    }, [landingMode]);

    const handleModeChange = (mode: 'life' | 'work') => {
        setLandingMode(mode);
        localStorage.setItem('life_controller_landing_mode', mode);
    };

    useEffect(() => {
        const handleScroll = () => {
            // For snap scroll container, we might need to check container scrollTop if using ref
            const container = containerRef.current;
            if (!container) return;

            const totalHeight = container.scrollHeight - container.clientHeight;
            const progress = (container.scrollTop / totalHeight) * 100;
            setScrollProgress(progress);
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }
        return () => container?.removeEventListener('scroll', handleScroll);
    }, []);

    const { scrollY } = useScroll({ container: containerRef });
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    // Scroll Snap & Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const sections = document.querySelectorAll('section[data-snap="true"]');
            const windowHeight = window.innerHeight;
            const container = containerRef.current;
            if (!container) return;

            // Find current active section index based on visibility
            let currentIndex = 0;
            sections.forEach((section, i) => {
                const rect = section.getBoundingClientRect();
                // A section is "active" if it takes up the majority of the viewport
                if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
                    currentIndex = i;
                }
            });

            if (e.key === 'ArrowDown') {
                const currentSection = sections[currentIndex];
                const rect = currentSection.getBoundingClientRect();

                // If the bottom of the section is clearly below the viewport, allow normal scroll
                // Using a small buffer (5px) for float precision
                if (rect.bottom > windowHeight + 5) {
                    // Let default behavior happen (scroll down)
                    return;
                }

                // If we are at the bottom, jump to next section
                e.preventDefault();
                if (currentIndex < sections.length - 1) {
                    sections[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
                }
            } else if (e.key === 'ArrowUp') {
                const currentSection = sections[currentIndex];
                const rect = currentSection.getBoundingClientRect();

                // If the top of the section is clearly above the viewport, allow normal scroll
                if (rect.top < -5) {
                    // Let default behavior happen (scroll up)
                    return;
                }

                // If we are at the top, jump to previous section
                e.preventDefault();
                if (currentIndex > 0) {
                    sections[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div
            ref={containerRef}
            className={cn(
                "h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth transition-colors duration-1000",
                landingMode === 'life' ? "bg-white text-slate-900" : "bg-slate-950 text-white"
            )}
        >
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Scroll Progress Indicator (Item 17) */}
            <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[60] hidden lg:flex flex-col gap-4 items-center">
                <div className="absolute top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-white/10 -z-10" />
                <motion.div
                    className="absolute top-0 w-0.5 bg-blue-600 -z-10"
                    style={{ height: `${scrollProgress}%` }}
                />
                {[0, 15, 30, 45, 60, 75, 90, 100].map((p, i) => (
                    <div
                        key={p}
                        onClick={() => {
                            const sections = document.querySelectorAll('section[data-snap="true"]');
                            if (sections[i]) sections[i].scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300 border-2 border-white dark:border-slate-900 cursor-pointer hover:scale-150",
                            scrollProgress >= p ? "bg-blue-600 scale-125" : "bg-slate-200 dark:bg-white/20"
                        )}
                    />
                ))}
            </div>

            {/* Header - Fixed but inside relative to viewport */}
            <header className={cn(
                "fixed top-0 w-full z-50 backdrop-blur-md border-b transition-colors duration-500",
                landingMode === 'life' ? "bg-white/80 border-gray-100" : "bg-slate-950/80 border-white/5"
            )}>
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Logo variant="full" className={cn("scale-90 transition-all", landingMode === 'work' && "brightness-0 invert")} />

                    <div className="hidden md:block">
                        <ModeSwitch mode={landingMode} setMode={handleModeChange} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" className={cn(
                                "font-bold",
                                landingMode === 'life' ? "text-slate-600" : "text-slate-400 hover:text-white"
                            )}>
                                로그인
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button className={cn(
                                "rounded-full px-8 font-black shadow-xl transition-all hover:scale-105",
                                landingMode === 'life' ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-white text-slate-900 hover:bg-slate-100"
                            )}>
                                시작하기
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* 1. Hero Section */}
            <section data-snap="true" className="h-screen snap-start flex flex-col justify-center relative overflow-hidden">
                {/* Floating UI Elements (Item 13) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <motion.div
                        style={{ y: y1 }}
                        animate={{ rotate: [0, 5, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-10 w-48 h-32 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl opacity-40 hidden xl:block"
                    />
                    <motion.div
                        style={{ y: y2 }}
                        animate={{ rotate: [0, -5, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-1/4 right-10 w-40 h-40 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl opacity-30 hidden xl:block"
                    />
                </div>

                {/* Dynamic Background Glow */}
                <div className={cn(
                    "absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] blur-3xl opacity-20 pointer-events-none transition-colors duration-1000",
                    landingMode === 'life' ? "bg-blue-400" : "bg-purple-600"
                )} />

                <div className="container mx-auto text-center max-w-5xl relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className={cn(
                            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-8 border transition-colors",
                            landingMode === 'life' ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-white/5 border-white/10 text-white"
                        )}>
                            <Sparkles className="w-3 h-3" /> All-in-One Life & Work Controller
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-[1.0]">
                            {landingMode === 'life' ? (
                                <>당신의 하루를 <br /> <span className="text-blue-600">작품처럼</span> 설계하세요</>
                            ) : (
                                <>생산성의 한계를 <br /> <span className="text-purple-500 text-glow">뛰어넘으세요</span></>
                            )}
                        </h1>

                        <p className={cn(
                            "text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed font-medium transition-colors",
                            landingMode === 'life' ? "text-slate-600" : "text-slate-400"
                        )}>
                            {landingMode === 'life' ? (
                                "목표, 일정, 습관, 심지어 금융과 건강까지. \n 일상의 조각들을 하나로 연결하여 완성하는 나만의 라이프 시스템."
                            ) : (
                                "프로젝트 관리, 팀 협업, 성과 리포트까지. \n 업무에 최적화된 컨트롤 센터에서 압도적인 효율을 경험하세요."
                            )}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link href="/register">
                                <Button size="lg" className={cn(
                                    "h-14 px-10 text-lg rounded-full font-black shadow-2xl transition-all hover:scale-105",
                                    landingMode === 'life' ? "bg-slate-900 text-white" : "bg-white text-slate-950"
                                )}>
                                    지금 무료로 시작하기 <ChevronRight className="ml-2 w-6 h-6" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. Bento Grid Features */}
            <section data-snap="true" className="h-screen snap-start flex flex-col justify-center px-6 overflow-hidden">
                <div className="container mx-auto max-w-6xl h-full flex flex-col justify-center">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 shrink-0">
                        <div className="max-w-xl">
                            <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-4">
                                기능 하나하나가 <br /> <span className="text-blue-600">혁신적인</span> 이유
                            </h2>
                            <p className={cn(
                                "text-base font-medium",
                                landingMode === 'life' ? "text-slate-500" : "text-slate-400"
                            )}>
                                단조로운 할 일 목록이 아닙니다. 데이터가 연결되고 성장이 가시화되는 진짜 도구입니다.
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0">
                        <BentoGrid className="h-full">
                            <BentoCard
                                title="스마트 스케줄러"
                                description="일정과 할 일을 한눈에 관리하고 드래그하여 시간을 배치하세요."
                                icon={Calendar}
                                className="md:col-span-2 md:row-span-2"
                                visual={visuals.Calendar}
                                delay={0.1}
                            />
                            <BentoCard
                                title="목표 & OKR"
                                description="큰 꿈을 작은 행동으로 쪼개어 실현 가능한 계획으로 만듭니다."
                                icon={Target}
                                colorClassName="bg-emerald-50 dark:bg-emerald-900/30"
                                iconClassName="text-emerald-600 dark:text-emerald-400"
                                className="md:col-span-2"
                                visual={visuals.Target}
                                delay={0.2}
                            />
                            <BentoCard
                                title="전방위 자산 관리"
                                description="가계부, 자산, 투자 수익률까지 하나의 대시보드에서."
                                icon={DollarSign}
                                colorClassName="bg-purple-50 dark:bg-purple-900/30"
                                iconClassName="text-purple-600 dark:text-purple-400"
                                visual={visuals.Finance}
                                delay={0.3}
                            />
                            <BentoCard
                                title="통합 건강 기록"
                                description="운동, 식단, 인바디 변화를 기록하고 신체 변화를 분석하세요."
                                icon={Activity}
                                colorClassName="bg-rose-50 dark:bg-rose-900/30"
                                iconClassName="text-rose-600 dark:text-rose-400"
                                className="md:col-span-2"
                                delay={0.4}
                            />
                        </BentoGrid>
                    </div>
                </div>
            </section>

            {/* 3. Comparison (Renamed from Stats & Comparison) */}
            <section data-snap="true" className="h-screen snap-start flex flex-col justify-center px-6 overflow-hidden">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-2xl md:text-4xl font-black text-center mb-10 tracking-tight">
                        비교할수록, <span className="text-blue-600">LIFE Controller</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 rounded-[32px] bg-slate-100 dark:bg-white/5 border border-transparent flex flex-col justify-center">
                            <h4 className="text-xl font-bold mb-6 text-slate-400">기본 플래너 / 노션</h4>
                            <ul className="space-y-4">
                                {["단순 텍스트 기반 기록", "기능 간 데이터 파편화", "자동 분석 기능 부재", "복잡한 초기 세팅"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-base font-medium opacity-50">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs">✕</div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-10 rounded-[40px] bg-white dark:bg-slate-900 border-4 border-blue-600/20 shadow-2xl relative overflow-hidden flex flex-col justify-center">
                            <div className="absolute top-0 right-0 p-6">
                                <Zap className="w-10 h-10 text-blue-600 opacity-20" />
                            </div>
                            <h4 className="text-2xl font-black mb-8 text-blue-600">LIFE Controller</h4>
                            <ul className="space-y-5">
                                {[
                                    "강력한 데이터 시각화 엔진",
                                    "목표-일정-금융-건강 원스탑 통합",
                                    "일상/업무 모드 즉시 전환",
                                    "자동 성과 분석 리포트"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-lg font-black">
                                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white">✓</div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Interactive Demo Section */}
            <section data-snap="true" className={cn(
                "h-screen snap-start flex flex-col justify-center px-6 transition-colors duration-1000 overflow-hidden",
                landingMode === 'life' ? "bg-slate-50" : "bg-slate-900/50"
            )}>
                <div className="container mx-auto h-full flex flex-col justify-center">
                    <div className="text-center mb-10 space-y-4 shrink-0">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                            Live Demo
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black tracking-tight">
                            기다리지 말고 <span className="text-blue-600">지금 바로</span> 만져보세요
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
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

            {/* 5. Pricing Section (Item 27) */}
            <section data-snap="true" className="h-screen snap-start flex flex-col justify-center overflow-hidden">
                <PricingSection mode={landingMode} />
            </section>

            {/* 6. FAQ Section (Item 24) */}
            <section data-snap="true" className="h-screen snap-start flex flex-col justify-center overflow-hidden">
                <FAQSection mode={landingMode} />
            </section>

            {/* 7. Newsletter, Trust, Footer */}
            <section data-snap="true" className="h-screen snap-start flex flex-col justify-center relative bg-slate-50 dark:bg-slate-900 overflow-hidden">
                <div className="flex-1 flex flex-col justify-center">
                    <NewsletterSection mode={landingMode} />
                </div>

                {/* Trust Badges */}
                <div className="py-12 border-y border-slate-100 dark:border-white/5 bg-white dark:bg-slate-950">
                    <div className="container mx-auto px-6 max-w-6xl">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40">
                            <div className="flex items-center gap-2 justify-center font-bold"><Shield className="w-5 h-5" /> Enterprise Secure</div>
                            <div className="flex items-center gap-2 justify-center font-bold"><Globe className="w-5 h-5" /> Cloud Sync</div>
                            <div className="flex items-center gap-2 justify-center font-bold"><Zap className="w-5 h-5" /> Dark Mode Ready</div>
                            <div className="flex items-center gap-2 justify-center font-bold"><Heart className="w-5 h-5" /> User Focused</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className={cn(
                    "py-10 px-6 font-medium transition-colors",
                    landingMode === 'life' ? "bg-white" : "bg-slate-950"
                )}>
                    <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                        <div className="col-span-1 md:col-span-1">
                            <Logo variant="full" className={cn("mb-6 scale-90", landingMode === 'work' && "brightness-0 invert")} />
                            <p className="text-sm opacity-50">성장을 위한 완벽한 동반자. 당신의 삶을 직접 설계하고 관리하세요.</p>
                        </div>
                        {/* Simplified Footer Columns */}
                        <div>
                            <h4 className="font-bold mb-6">Product</h4>
                            <ul className="space-y-4 text-sm opacity-50">
                                <li>Features</li>
                                <li>Demo</li>
                                <li>Pricing</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6">Company</h4>
                            <ul className="space-y-4 text-sm opacity-50">
                                <li>About</li>
                                <li>Blog</li>
                                <li>Careers</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6">Contact</h4>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"><Star className="w-5 h-5" /></div>
                            </div>
                        </div>
                    </div>
                    <div className="container mx-auto text-center pt-12 border-t border-slate-100 dark:border-white/5 opacity-40 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
                        <p>© {new Date().getFullYear()} Life Controller. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link href="/privacy" className="hover:underline hover:opacity-100 transition-opacity">Privacy Policy</Link>
                            <Link href="/terms" className="hover:underline hover:opacity-100 transition-opacity">Terms of Service</Link>
                        </div>
                    </div>
                </footer>
            </section>
        </div>
    );
}


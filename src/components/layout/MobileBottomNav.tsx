'use client';

import { useState, useRef, useEffect } from 'react';
import { Home, Calendar, Activity, BookOpen, Menu, Sparkles, Briefcase, DollarSign, PenTool, Plus, ChevronRight, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CategoryType, SUB_MENUS } from '@/constants/menu';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileBottomNavProps {
    appMode: 'life' | 'work' | 'study' | 'ambition';
    setAppMode: (mode: 'life' | 'work' | 'study' | 'ambition') => void;
    mainMode: 'home' | 'schedule' | 'work' | 'study' | 'ambition';
    setMainMode: (mode: 'home' | 'schedule' | 'work' | 'study' | 'ambition') => void;
    activeCategory: CategoryType;
    setActiveCategory: (cat: CategoryType) => void;
    activeTab?: string;
    setActiveTab?: (tab: string) => void;
}

export function MobileBottomNav({
    appMode,
    setAppMode,
    mainMode,
    setMainMode,
    activeCategory,
    setActiveCategory,
    activeTab,
    setActiveTab,
}: MobileBottomNavProps) {
    const [expandedCategory, setExpandedCategory] = useState<CategoryType | null>(null);
    const [isHidden, setIsHidden] = useState(false);
    const lastScrollY = useRef(0);
    const popupRef = useRef<HTMLDivElement>(null);

    // Auto-hide on scroll
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setIsHidden(true);
            } else {
                setIsHidden(false);
            }
            lastScrollY.current = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close popup on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setExpandedCategory(null);
            }
        };
        if (expandedCategory) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [expandedCategory]);

    const handleNavTap = (id: CategoryType | 'home') => {
        if (id === 'home') {
            setMainMode('home');
            setExpandedCategory(null);
            return;
        }
        const category = id as CategoryType;
        if (expandedCategory === category) {
            setExpandedCategory(null);
            return;
        }
        setExpandedCategory(category);
    };

    const handleSubTabSelect = (category: CategoryType, tabId: string) => {
        setMainMode('schedule');
        setActiveCategory(category);
        if (setActiveTab) setActiveTab(tabId as any);
        setExpandedCategory(null);
    };

    const isActive = (id: CategoryType | 'home') => {
        if (id === 'home') return mainMode === 'home';
        return mainMode === 'schedule' && activeCategory === id;
    };

    return (
        <>
            <AnimatePresence>
                {expandedCategory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        onClick={() => setExpandedCategory(null)}
                    />
                )}
            </AnimatePresence>

            <div
                ref={popupRef}
                className={cn(
                    "md:hidden fixed bottom-4 left-4 right-4 z-50 transition-transform duration-300",
                    isHidden ? "translate-y-[100px]" : "translate-y-0"
                )}
            >
                {/* Sub-tab popup */}
                <AnimatePresence>
                    {expandedCategory && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                            className="mb-4 glass-premium border border-white/10 rounded-[28px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden max-h-[50vh] overflow-y-auto"
                        >
                            <div className="p-3 space-y-2">
                                {SUB_MENUS[expandedCategory]?.map((tab: any) => {
                                    const isSelected = mainMode === 'schedule' && activeCategory === expandedCategory && activeTab === tab.id;
                                    return (
                                        <motion.button
                                            key={tab.id}
                                            onClick={() => handleSubTabSelect(expandedCategory, tab.id)}
                                            whileTap={{ scale: 0.98 }}
                                            className={cn(
                                                "flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl text-left transition-all border",
                                                isSelected
                                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                    : "bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                                                isSelected ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "bg-white/5 text-white/20"
                                            )}>
                                                <tab.icon className="w-5 h-5" strokeWidth={1.5} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-black">{tab.label}</div>
                                                <div className="text-[10px] text-white/20 truncate mt-0.5">{tab.desc}</div>
                                            </div>
                                            <ChevronRight className={cn("w-4 h-4 transition-all", isSelected ? "text-emerald-400" : "text-white/10")} />
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom Nav Bar */}
                <div className="glass-premium border border-white/10 h-[72px] px-3 flex items-center justify-around rounded-[24px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] pb-safe relative overflow-hidden">
                    <motion.button onClick={() => handleNavTap('home')} whileTap={{ scale: 0.9 }} className="flex flex-col items-center justify-center w-full h-full gap-1.5 group relative z-10">
                        <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300",
                            isActive('home') ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "text-white/30 group-hover:text-white/60"
                        )}>
                            <Home className="w-5 h-5" />
                        </div>
                        <span className={cn("text-[9px] font-black tracking-widest", isActive('home') ? "text-emerald-400" : "text-white/20")}>홈</span>
                    </motion.button>

                    <motion.button onClick={() => handleNavTap('basic')} whileTap={{ scale: 0.9 }} className="flex flex-col items-center justify-center w-full h-full gap-1.5 group relative z-10">
                        <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300",
                            isActive('basic') ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "text-white/30 group-hover:text-white/60"
                        )}>
                            <Calendar className="w-5 h-5" />
                        </div>
                        <span className={cn("text-[9px] font-black tracking-widest", isActive('basic') ? "text-emerald-400" : "text-white/20")}>라이프</span>
                    </motion.button>

                    <motion.button onClick={() => handleNavTap('health')} whileTap={{ scale: 0.9 }} className="flex flex-col items-center justify-center w-full h-full gap-1.5 group relative z-10">
                        <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300",
                            isActive('health') ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "text-white/30 group-hover:text-white/60"
                        )}>
                            <Activity className="w-5 h-5" />
                        </div>
                        <span className={cn("text-[9px] font-black tracking-widest", isActive('health') ? "text-emerald-400" : "text-white/20")}>건강</span>
                    </motion.button>

                    <Sheet>
                        <SheetTrigger asChild>
                            <motion.button whileTap={{ scale: 0.9 }} className="flex flex-col items-center justify-center w-full h-full gap-1.5 group relative z-10">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white/30 group-hover:text-white/60">
                                    <Menu className="w-5 h-5" />
                                </div>
                                <span className="text-[9px] font-black tracking-widest text-white/20">전체</span>
                            </motion.button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="glass-premium rounded-t-[40px] h-[min(70vh,600px)] max-h-[85svh] border-t border-white/10 text-white p-5 sm:p-8 flex flex-col">
                            <SheetHeader className="mb-5 sm:mb-8 shrink-0">
                                <SheetTitle className="text-2xl font-black text-white px-2">둘러보기</SheetTitle>
                            </SheetHeader>
                            <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto no-scrollbar pb-safe pb-6 min-h-0">
                                <button onClick={() => { setMainMode('schedule'); setActiveCategory('finance'); setExpandedCategory(null); }} className="flex flex-col items-start gap-4 p-6 glass-premium border border-white/5 rounded-[32px] group">
                                    <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-lg font-black text-white">경제</div>
                                        <div className="text-xs text-white/30 font-medium">자산 및 지출 관리</div>
                                    </div>
                                </button>
                                <button onClick={() => { setMainMode('schedule'); setActiveCategory('record'); setExpandedCategory(null); }} className="flex flex-col items-start gap-4 p-6 glass-premium border border-white/5 rounded-[32px] group">
                                    <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <PenTool className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-lg font-black text-white">기록</div>
                                        <div className="text-xs text-white/30 font-medium">생각과 일상 기록</div>
                                    </div>
                                </button>
                                <button onClick={() => setAppMode('ambition')} className="flex flex-col items-start gap-4 p-6 glass-premium border border-amber-500/20 rounded-[32px] group col-span-2 mt-2 bg-gradient-to-br from-amber-500/10 to-transparent">
                                    <div className="w-12 h-12 bg-amber-600 text-white rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(217,119,6,0.4)] group-hover:scale-110 transition-transform">
                                        <Target className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-2">
                                            <div className="text-lg font-black text-white text-amber-500">야망 모드</div>
                                            <div className="px-2 py-0.5 rounded-full bg-amber-500/10 text-[9px] text-amber-500 font-black border border-amber-500/20">전환하기</div>
                                        </div>
                                        <div className="text-xs text-white/30 font-medium mt-1">인생의 야망과 전략적 목표를 한자리에서 관리합니다</div>
                                    </div>
                                </button>

                                <button onClick={() => setAppMode('work')} className="flex flex-col items-start gap-4 p-6 glass-premium border border-white/5 rounded-[32px] group col-span-2 mt-2 bg-gradient-to-br from-purple-500/10 to-transparent">
                                    <div className="w-12 h-12 bg-purple-500 text-white rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-2">
                                            <div className="text-lg font-black text-white text-emerald-400">워크 모드</div>
                                            <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[9px] text-emerald-400 font-black border border-emerald-500/20">전환하기</div>
                                        </div>
                                        <div className="text-xs text-white/30 font-medium mt-1">전문가용 생산성 워크스페이스로 전환합니다</div>
                                    </div>
                                </button>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Active highlight bar at bottom */}
                    {expandedCategory && (
                        <motion.div
                            layoutId="bottom-nav-active"
                            className="absolute bottom-1 w-8 h-1 bg-emerald-500 rounded-full"
                        />
                    )}
                </div>
            </div>
        </>
    );
}

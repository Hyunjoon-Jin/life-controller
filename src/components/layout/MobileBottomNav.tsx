'use client';

import { useState, useRef, useEffect } from 'react';
import { Home, Calendar, Activity, BookOpen, Menu, Sparkles, Briefcase, DollarSign, PenTool, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CategoryType, SUB_MENUS } from '@/constants/menu';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileBottomNavProps {
    appMode: 'life' | 'work' | 'study';
    setAppMode: (mode: 'life' | 'work' | 'study') => void;
    mainMode: 'home' | 'schedule' | 'work' | 'study';
    setMainMode: (mode: 'home' | 'schedule' | 'work' | 'study') => void;
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
                        className="md:hidden fixed inset-0 bg-black/20 z-40"
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
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                            className="mb-3 bg-popover/95 backdrop-blur-xl rounded-2xl shadow-xl border border-border overflow-hidden ring-1 ring-black/5"
                        >
                            <div className="p-3 space-y-1">
                                {SUB_MENUS[expandedCategory]?.map((tab: any) => {
                                    const isSelected = mainMode === 'schedule' && activeCategory === expandedCategory && activeTab === tab.id;
                                    return (
                                        <motion.button
                                            key={tab.id}
                                            onClick={() => handleSubTabSelect(expandedCategory, tab.id)}
                                            whileTap={{ scale: 0.97 }}
                                            className={cn(
                                                "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-all",
                                                isSelected
                                                    ? "bg-primary/10 text-primary"
                                                    : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                                                isSelected ? "bg-primary/20" : "bg-gray-100 dark:bg-gray-700"
                                            )}>
                                                <tab.icon className="w-4.5 h-4.5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold">{tab.label}</div>
                                                <div className="text-[11px] text-muted-foreground truncate">{tab.desc}</div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom Nav Bar */}
                <div className="bg-background/80 backdrop-blur-xl border border-border/50 h-[70px] px-2 flex items-center justify-around rounded-3xl shadow-lg ring-1 ring-black/5 pb-safe">
                    <motion.button onClick={() => handleNavTap('home')} whileTap={{ scale: 0.9 }} className="flex flex-col items-center justify-center w-full h-full gap-1">
                        <Home className={cn("w-6 h-6", isActive('home') ? "text-primary fill-primary" : "text-gray-400")} />
                        <span className={cn("text-[10px] font-bold", isActive('home') ? "text-primary" : "text-gray-400")}>홈</span>
                    </motion.button>

                    <motion.button onClick={() => handleNavTap('basic')} whileTap={{ scale: 0.9 }} className="flex flex-col items-center justify-center w-full h-full gap-1">
                        <Calendar className={cn("w-6 h-6", isActive('basic') ? "text-primary fill-primary" : "text-gray-400")} />
                        <span className={cn("text-[10px] font-bold", isActive('basic') ? "text-primary" : "text-gray-400")}>일정</span>
                    </motion.button>


                    <motion.button onClick={() => handleNavTap('health')} whileTap={{ scale: 0.9 }} className="flex flex-col items-center justify-center w-full h-full gap-1">
                        <Activity className={cn("w-6 h-6", isActive('health') ? "text-primary fill-primary" : "text-gray-400")} />
                        <span className={cn("text-[10px] font-bold", isActive('health') ? "text-primary" : "text-gray-400")}>건강</span>
                    </motion.button>

                    <Sheet>
                        <SheetTrigger asChild>
                            <motion.button whileTap={{ scale: 0.9 }} className="flex flex-col items-center justify-center w-full h-full gap-1">
                                <Menu className="w-6 h-6 text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-400">전체</span>
                            </motion.button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="rounded-t-[32px] h-[80vh]">
                            <SheetHeader className="mb-6">
                                <SheetTitle>전체 메뉴</SheetTitle>
                            </SheetHeader>
                            <div className="grid grid-cols-4 gap-4">
                                <button onClick={() => { setMainMode('schedule'); setActiveCategory('finance'); setExpandedCategory(null); }} className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">자산관리</span>
                                </button>
                                <button onClick={() => { setMainMode('schedule'); setActiveCategory('record'); setExpandedCategory(null); }} className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl">
                                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                                        <PenTool className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">기록보관</span>
                                </button>
                                <button onClick={() => setAppMode('work')} className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-2xl">
                                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">업무모드</span>
                                </button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </>
    );
}

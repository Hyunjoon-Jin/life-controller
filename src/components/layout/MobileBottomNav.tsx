import { useState, useRef, useEffect } from 'react';
import { Home, Calendar, Activity, BookOpen, Menu, Sparkles, Briefcase, DollarSign, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CategoryType, SUB_MENUS } from '@/constants/menu';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileBottomNavProps {
    appMode: 'life' | 'work';
    setAppMode: (mode: 'life' | 'work') => void;
    mainMode: 'home' | 'schedule' | 'work';
    setMainMode: (mode: 'home' | 'schedule' | 'work') => void;
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
    const popupRef = useRef<HTMLDivElement>(null);

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

    if (appMode === 'work') {
        return (
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border z-50 h-auto min-h-[64px] px-4 flex items-center justify-around pb-safe pt-1">
                <Button variant="ghost" className="flex flex-col gap-1 h-auto" onClick={() => setMainMode('home')}>
                    <Home className={cn("w-6 h-6", mainMode === 'home' ? "text-purple-600" : "text-muted-foreground")} />
                    <span className="text-[10px] font-medium">홈</span>
                </Button>
                <Button variant="ghost" className="flex flex-col gap-1 h-auto" onClick={() => setMainMode('work')}>
                    <Briefcase className={cn("w-6 h-6", mainMode === 'work' ? "text-purple-600" : "text-muted-foreground")} />
                    <span className="text-[10px] font-medium">업무</span>
                </Button>
                <Button variant="ghost" className="flex flex-col gap-1 h-auto" onClick={() => setAppMode('life')}>
                    <Sparkles className="w-6 h-6 text-muted-foreground" />
                    <span className="text-[10px] font-medium">일상모드</span>
                </Button>
            </div>
        );
    }

    const navItems: { id: CategoryType | 'home'; label: string; icon: any; }[] = [
        { id: 'home', label: '홈', icon: Home },
        { id: 'basic', label: '일정', icon: Calendar },
        { id: 'health', label: '건강', icon: Activity },
        { id: 'growth', label: '성장', icon: BookOpen },
    ];

    const handleNavTap = (id: CategoryType | 'home') => {
        if (id === 'home') {
            setMainMode('home');
            setExpandedCategory(null);
            return;
        }

        const category = id as CategoryType;

        // If already on this category and popup is showing, close it
        if (expandedCategory === category) {
            setExpandedCategory(null);
            return;
        }

        // Show sub-tab popup for this category
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
            {/* Overlay for closing popup */}
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

            <div ref={popupRef} className="md:hidden fixed bottom-4 left-4 right-4 z-50">
                {/* Sub-tab popup */}
                <AnimatePresence>
                    {expandedCategory && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                            className="mb-3 bg-white/95 dark:bg-[#1a1b1e]/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 dark:border-white/10 overflow-hidden ring-1 ring-black/5"
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
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-2 h-2 bg-primary rounded-full shrink-0"
                                                />
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom Nav Bar */}
                <div className="bg-white/80 dark:bg-[#1a1b1e]/80 backdrop-blur-xl border border-white/20 dark:border-white/10 h-[70px] px-2 flex items-center justify-around rounded-3xl shadow-lg ring-1 ring-black/5">
                    {navItems.map(item => (
                        <motion.button
                            key={item.id}
                            onClick={() => handleNavTap(item.id)}
                            whileTap={{ scale: 0.9 }}
                            className="flex flex-col items-center justify-center w-full h-full gap-1 relative"
                        >
                            <div className={cn(
                                "p-1.5 rounded-xl transition-all duration-300 relative z-10",
                                isActive(item.id)
                                    ? "text-primary -translate-y-1"
                                    : expandedCategory === item.id
                                        ? "text-primary/70"
                                        : "text-gray-400 hover:text-gray-600"
                            )}>
                                {isActive(item.id) && (
                                    <motion.div
                                        layoutId="navIndicator"
                                        className="absolute inset-0 bg-primary/10 rounded-xl"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <item.icon className={cn("w-6 h-6 relative z-10", isActive(item.id) && "fill-current")} strokeWidth={isActive(item.id) ? 2.5 : 2} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold transition-colors",
                                isActive(item.id) ? "text-primary" : expandedCategory === item.id ? "text-primary/70" : "text-gray-400"
                            )}>
                                {item.label}
                            </span>
                            {/* Expand indicator */}
                            {expandedCategory === item.id && (
                                <motion.div
                                    layoutId="expandIndicator"
                                    className="absolute -top-1 w-1 h-1 bg-primary rounded-full"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    ))}

                    {/* More Menu */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <motion.button whileTap={{ scale: 0.9 }} className="flex flex-col items-center justify-center w-full h-full gap-1" onClick={() => setExpandedCategory(null)}>
                                <div className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600">
                                    <Menu className="w-6 h-6" strokeWidth={2} />
                                </div>
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
                                <button onClick={() => setAppMode('work')} className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-2xl col-span-2">
                                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">업무 모드로 전환</span>
                                </button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </>
    );
}

import { Home, Calendar, Activity, BookOpen, Menu, Sparkles, Briefcase, DollarSign, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CategoryType } from '@/constants/menu';
import { motion } from 'framer-motion';

interface MobileBottomNavProps {
    appMode: 'life' | 'work';
    setAppMode: (mode: 'life' | 'work') => void;
    mainMode: 'home' | 'schedule' | 'work';
    setMainMode: (mode: 'home' | 'schedule' | 'work') => void;
    activeCategory: CategoryType;
    setActiveCategory: (cat: CategoryType) => void;
}

export function MobileBottomNav({
    appMode,
    setAppMode,
    mainMode,
    setMainMode,
    activeCategory,
    setActiveCategory,
}: MobileBottomNavProps) {
    if (appMode === 'work') {
        // Simple Work Mode Bottom Nav
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

    const navItems = [
        { id: 'home', label: '홈', icon: Home, action: () => setMainMode('home'), isActive: mainMode === 'home' },
        { id: 'basic', label: '일정', icon: Calendar, action: () => { setMainMode('schedule'); setActiveCategory('basic'); }, isActive: mainMode === 'schedule' && activeCategory === 'basic' },
        { id: 'health', label: '건강', icon: Activity, action: () => { setMainMode('schedule'); setActiveCategory('health'); }, isActive: mainMode === 'schedule' && activeCategory === 'health' },
        { id: 'growth', label: '성장', icon: BookOpen, action: () => { setMainMode('schedule'); setActiveCategory('growth'); }, isActive: mainMode === 'schedule' && activeCategory === 'growth' },
    ];

    return (
        <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white/80 dark:bg-[#1a1b1e]/80 backdrop-blur-xl border border-white/20 dark:border-white/10 z-50 h-[70px] px-2 flex items-center justify-around rounded-3xl shadow-lg ring-1 ring-black/5">
            {navItems.map(item => (
                <motion.button
                    key={item.id}
                    onClick={item.action}
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center justify-center w-full h-full gap-1 relative"
                >
                    <div className={cn(
                        "p-1.5 rounded-xl transition-all duration-300 relative z-10",
                        item.isActive
                            ? "text-primary -translate-y-1"
                            : "text-gray-400 hover:text-gray-600"
                    )}>
                        {item.isActive && (
                            <motion.div
                                layoutId="navIndicator"
                                className="absolute inset-0 bg-primary/10 rounded-xl"
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                        <item.icon className={cn("w-6 h-6 relative z-10", item.isActive && "fill-current")} strokeWidth={item.isActive ? 2.5 : 2} />
                    </div>
                    <span className={cn(
                        "text-[10px] font-bold transition-colors",
                        item.isActive ? "text-primary" : "text-gray-400"
                    )}>
                        {item.label}
                    </span>
                </motion.button>
            ))}

            {/* More Menu (Drawer) */}
            <Sheet>
                <SheetTrigger asChild>
                    <motion.button whileTap={{ scale: 0.9 }} className="flex flex-col items-center justify-center w-full h-full gap-1">
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
                        {/* Finance & Record Categories */}
                        <button onClick={() => { setMainMode('schedule'); setActiveCategory('finance'); }} className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-gray-700">자산관리</span>
                        </button>
                        <button onClick={() => { setMainMode('schedule'); setActiveCategory('record'); }} className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl">
                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                                <PenTool className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-gray-700">기록보관</span>
                        </button>

                        {/* Simple Mode Toggle */}
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
    );
}

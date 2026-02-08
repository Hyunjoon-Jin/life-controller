"use client"

import { useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Menu, Home, Briefcase, Sparkles, HelpCircle, X, ChevronRight, LayoutGrid } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserMenu } from '@/components/auth/UserMenu';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/constants/menu';

interface MobileHeaderProps {
    appMode: 'life' | 'work';
    setAppMode: (mode: 'life' | 'work') => void;
    mainMode: 'home' | 'schedule' | 'work';
    setMainMode: (mode: 'home' | 'schedule' | 'work') => void;
    activeCategory: string;
    setActiveCategory: (cat: any) => void;
    onOpenGuide: () => void;
}

export function MobileHeader({
    appMode,
    setAppMode,
    mainMode,
    setMainMode,
    activeCategory,
    setActiveCategory,
    onOpenGuide
}: MobileHeaderProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="md:hidden flex items-center justify-between p-4 bg-background border-b border-border sticky top-0 z-50">
            {/* Left: Logo */}
            <div onClick={() => setMainMode('home')} className="cursor-pointer">
                <Logo variant="icon" className="w-8 h-8" />
            </div>

            {/* Right: Hamburger Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <div />
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] flex flex-col p-6">
                    <SheetHeader className="mb-6 text-left">
                        <div className="flex items-center justify-between">
                            <SheetTitle className="text-lg font-bold">Menu</SheetTitle>
                            {/* Theme Toggle in Header */}
                            <ThemeToggle />
                        </div>
                    </SheetHeader>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto -mx-6 px-6 custom-scrollbar">
                        {/* 1. Mode Switcher (Large) */}
                        <div className="bg-muted rounded-xl p-1 flex mb-8">
                            <button
                                onClick={() => { setAppMode('life'); setIsOpen(false); }}
                                className={cn(
                                    "flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
                                    appMode === 'life' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Sparkles className={cn("w-4 h-4", appMode === 'life' && "text-yellow-500")} />
                                일상
                            </button>
                            <button
                                onClick={() => { setAppMode('work'); setIsOpen(false); }}
                                className={cn(
                                    "flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
                                    appMode === 'work' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Briefcase className={cn("w-4 h-4", appMode === 'work' && "text-blue-500")} />
                                업무
                            </button>
                        </div>

                        {/* 2. Main Navigation items */}
                        <div className="space-y-2 mb-8">
                            <button
                                onClick={() => { setMainMode('home'); setIsOpen(false); }}
                                className={cn(
                                    "w-full flex items-center gap-4 p-3 rounded-xl transition-colors text-left font-medium",
                                    mainMode === 'home' ? "bg-primary/10 text-primary" : "hover:bg-muted"
                                )}
                            >
                                <Home className="w-5 h-5" /> 홈 대시보드
                            </button>

                            <div className="p-3">
                                <h4 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">Categories</h4>
                                <div className="space-y-1">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => {
                                                setMainMode('schedule');
                                                setActiveCategory(cat.id as any);
                                                setIsOpen(false);
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-colors",
                                                mainMode === 'schedule' && activeCategory === cat.id ? "bg-muted font-bold text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                            )}
                                        >
                                            <span className="flex items-center gap-3">
                                                <LayoutGrid className="w-4 h-4 opacity-50" />
                                                {cat.label}
                                            </span>
                                            {mainMode === 'schedule' && activeCategory === cat.id && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {appMode === 'work' && (
                                <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm text-center">
                                    전체 메뉴 활성화됨 (기본 메뉴에서 '프로젝트 관리' 선택 가능)
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer: User & Help */}
                    <div className="border-t border-border pt-6 mt-auto">
                        <div className="flex items-center justify-between mb-4">
                            <UserMenu />
                            <Button variant="ghost" size="sm" onClick={onOpenGuide} className="text-muted-foreground">
                                <HelpCircle className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    );
}

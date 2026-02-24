"use client"

import { useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Menu, Home, Briefcase, Sparkles, HelpCircle, X, ChevronRight, LayoutGrid, Target } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserMenu } from '@/components/auth/UserMenu';
import { cn } from '@/lib/utils';
import { CATEGORIES, CategoryType } from '@/constants/menu';
import { AdBanner } from '@/components/ads/AdBanner';

interface MobileHeaderProps {
    appMode: 'life' | 'work' | 'study' | 'ambition';
    setAppMode: (mode: 'life' | 'work' | 'study' | 'ambition') => void;
    mainMode: 'home' | 'schedule' | 'work' | 'study' | 'ambition';
    setMainMode: (mode: 'home' | 'schedule' | 'work' | 'study' | 'ambition') => void;
    activeCategory: CategoryType;
    setActiveCategory: (cat: CategoryType) => void;
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
        <header className={cn(
            "md:hidden flex items-center justify-between px-5 py-4 sticky top-0 z-50 transition-all duration-500 glass-premium border-b border-white/5",
            appMode === 'work'
                ? "shadow-[0_4px_20px_rgba(99,102,241,0.1)]"
                : appMode === 'study'
                    ? "shadow-[0_4px_20px_rgba(63,81,181,0.1)]"
                    : "shadow-[0_4px_20px_rgba(16,185,129,0.1)]"
        )}>
            {/* Left: Logo */}
            <div onClick={() => setMainMode('home')} className="cursor-pointer group flex items-center gap-2">
                <div className="p-1 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 group-hover:scale-105 transition-transform">
                    <Logo variant="icon" className="w-7 h-7 brightness-0 invert" />
                </div>
                <span className="text-lg font-black tracking-tight text-white/90">LIFE <span className="text-emerald-400">PLANNER</span></span>
            </div>

            {/* Right: Hamburger Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white/70 hover:bg-white/10 hover:text-white rounded-xl" onClick={() => setIsOpen(true)}>
                        <Menu className="w-6 h-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[min(310px,85vw)] flex flex-col p-0 glass-premium border-l border-white/10 text-white overflow-hidden">
                    {/* Header with Title and Toggle */}
                    <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <SheetTitle className="text-xl font-black text-white/90 tracking-widest">MENU</SheetTitle>
                        <ThemeToggle />
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8 custom-scrollbar space-y-8 sm:space-y-10">
                        {/* Mode Switcher */}
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-1.5 flex shadow-inner">
                            <button
                                onClick={() => { setAppMode('life'); setIsOpen(false); }}
                                className={cn(
                                    "flex-1 py-3.5 rounded-xl text-[10px] font-black flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden",
                                    appMode === 'life' ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "text-white/30 hover:text-white/50"
                                )}
                            >
                                <Sparkles className="w-4 h-4" />
                                LIFE
                            </button>
                            <button
                                onClick={() => { setAppMode('study'); setIsOpen(false); }}
                                className={cn(
                                    "flex-1 py-3.5 rounded-xl text-[10px] font-black flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden",
                                    appMode === 'study' ? "bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]" : "text-white/30 hover:text-white/50"
                                )}
                            >
                                <LayoutGrid className="w-4 h-4" />
                                STUDY
                            </button>
                            <button
                                onClick={() => { setAppMode('ambition'); setIsOpen(false); }}
                                className={cn(
                                    "flex-1 py-3.5 rounded-xl text-[10px] font-black flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden",
                                    appMode === 'ambition' ? "bg-amber-600 text-white shadow-[0_0_20px_rgba(217,119,6,0.3)]" : "text-white/30 hover:text-white/50"
                                )}
                            >
                                <Target className="w-4 h-4" />
                                AMBITION
                            </button>
                            <button
                                onClick={() => { setAppMode('work'); setIsOpen(false); }}
                                className={cn(
                                    "flex-1 py-3.5 rounded-xl text-[10px] font-black flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden",
                                    appMode === 'work' ? "bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]" : "text-white/30 hover:text-white/50"
                                )}
                            >
                                <Briefcase className="w-4 h-4" />
                                WORK
                            </button>
                        </div>

                        {/* Navigation */}
                        <div className="space-y-4">
                            <button
                                onClick={() => { setMainMode('home'); setIsOpen(false); }}
                                className={cn(
                                    "w-full flex items-center gap-4 p-5 rounded-2xl transition-all text-sm font-black border",
                                    mainMode === 'home'
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                        : "bg-white/[0.03] border-transparent text-white/50 hover:bg-white/[0.06] hover:text-white"
                                )}
                            >
                                <Home className="w-5 h-5" /> HOME DASHBOARD
                            </button>

                            <div className="pt-6 border-t border-white/5">
                                <h4 className="text-[10px] font-black text-white/10 mb-5 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                                    <div className="w-1 h-3 bg-white/10 rounded-full" />
                                    Categories
                                </h4>
                                <div className="space-y-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => {
                                                setMainMode('schedule');
                                                setActiveCategory(cat.id as any);
                                                setIsOpen(false);
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-between p-4 rounded-xl text-sm font-bold transition-all border",
                                                mainMode === 'schedule' && activeCategory === cat.id
                                                    ? "bg-white/10 border-white/10 text-white"
                                                    : "bg-transparent border-transparent text-white/40 hover:bg-white/5 hover:text-white/70"
                                            )}
                                        >
                                            <span className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                                                    mainMode === 'schedule' && activeCategory === cat.id ? "bg-emerald-500 text-white shadow-lg" : "bg-white/5 text-white/20"
                                                )}>
                                                    <LayoutGrid className="w-4 h-4" />
                                                </div>
                                                {cat.label}
                                            </span>
                                            {mainMode === 'schedule' && activeCategory === cat.id && (
                                                <ChevronRight className="w-4 h-4 text-emerald-400" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {appMode === 'work' && (
                            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[11px] text-indigo-300 font-bold text-center leading-relaxed">
                                Professional Workspace Active: <br /> Advanced tools accessible in categories.
                            </div>
                        )}

                        <div className="pb-4">
                            <AdBanner dataAdSlot="1234567890" dataAdFormat="rectangle" className="w-full opacity-60 grayscale hover:grayscale-0 transition-all rounded-2xl overflow-hidden" />
                        </div>
                    </div>

                    {/* Footer Area */}
                    <div className="p-4 sm:p-6 bg-white/[0.02] border-t border-white/5 space-y-4 sm:space-y-6">
                        <Button asChild className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-[10px] tracking-widest border-0 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)]">
                            <a href="/pricing" className="flex items-center justify-center uppercase">UPGRADE TO PRO <Sparkles className="w-3 h-3 ml-2" /></a>
                        </Button>
                        <div className="flex items-center justify-between">
                            <UserMenu />
                            <Button variant="ghost" size="icon" onClick={onOpenGuide} className="text-white/20 hover:text-white/60 transition-colors">
                                <HelpCircle className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    );
}

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CATEGORIES, SUB_MENUS, CategoryType, WORK_NAV_ITEMS, STUDY_NAV_ITEMS, AMBITION_NAV_ITEMS } from '@/constants/menu';
import { motion, AnimatePresence } from 'framer-motion';

// TabType is now imported or we use string for flexibility in props as defined in interface
interface MegaMenuNavProps {
    activeCategory: CategoryType;
    activeTab: string;
    onSelect: (category: CategoryType, tab: string) => void;
    appMode: 'life' | 'work' | 'study' | 'ambition';
}

export function MegaMenuNav({ activeCategory, activeTab, onSelect, appMode }: MegaMenuNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState<CategoryType>(activeCategory);

    if (appMode === 'work') {
        return (
            <div className="w-full relative z-50">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 max-w-7xl mx-auto">
                    {WORK_NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => onSelect('basic', item.id)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap btn-premium",
                                activeTab === item.id
                                    ? "bg-[#6366F1] text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] btn-glow-work"
                                    : "text-white/40 hover:bg-white/5 hover:text-white/80 border border-white/5 nav-inactive"
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (appMode === 'study') {
        return (
            <div className="w-full relative z-50">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 max-w-7xl mx-auto">
                    {STUDY_NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => onSelect('basic', item.id)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap btn-premium",
                                activeTab === item.id
                                    ? "bg-[#3F51B5] text-white shadow-[0_0_20px_rgba(63,81,181,0.4)] btn-glow-study"
                                    : "text-white/40 hover:bg-white/5 hover:text-white/80 border border-white/5 nav-inactive"
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (appMode === 'ambition') {
        return (
            <div className="w-full relative z-50">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 max-w-7xl mx-auto">
                    {AMBITION_NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => onSelect('basic', item.id)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap btn-premium",
                                activeTab === item.id
                                    ? "bg-amber-600 text-white shadow-[0_0_20px_rgba(217,119,6,0.4)]"
                                    : "text-white/40 hover:bg-white/5 hover:text-white/80 border border-white/5 nav-inactive"
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Life Mode Logic (Existing)
    const visibleCategories = CATEGORIES; // In Life mode show all categories

    return (
        <div className="w-full relative z-50" onMouseLeave={() => setIsOpen(false)}>
            {/* Trigger Bar */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3 px-1">
                {visibleCategories.map(cat => (
                    <button
                        key={cat.id}
                        onMouseEnter={() => {
                            setHoveredCategory(cat.id);
                            setIsOpen(true);
                        }}
                        onClick={() => {
                            const firstTab = SUB_MENUS[cat.id][0].id;
                            onSelect(cat.id, firstTab);
                            setIsOpen(false);
                        }}
                        className={cn(
                            "px-5 py-2.5 rounded-full text-sm font-black transition-all whitespace-nowrap relative group",
                            activeCategory === cat.id
                                ? "text-emerald-400"
                                : "text-white/40 hover:text-white/80 nav-inactive"
                        )}
                    >
                        {cat.label}
                        {activeCategory === cat.id && (
                            <motion.div
                                layoutId="active-indicator"
                                className="absolute inset-0 bg-emerald-500/10 rounded-full border border-emerald-500/20 -z-10"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Mega Menu Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.99 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute top-full left-0 w-full glass-premium text-white rounded-[32px] p-2 min-h-[420px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] flex overflow-hidden z-50 border-white/10"
                    >

                        {/* Left: Categories List */}
                        <div className="w-56 py-6 px-3 border-r border-white/5 flex flex-col gap-2 relative z-10">
                            {visibleCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    onMouseEnter={() => setHoveredCategory(cat.id)}
                                    className={cn(
                                        "text-left px-5 py-4 rounded-2xl text-[15px] font-bold transition-all flex justify-between items-center group relative overflow-hidden",
                                        hoveredCategory === cat.id
                                            ? "bg-white/10 text-emerald-400"
                                            : "text-white/40 hover:bg-white/5 hover:text-white/70"
                                    )}
                                >
                                    {cat.label}
                                    {hoveredCategory === cat.id && (
                                        <motion.div layoutId="nav-glow" className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-full" />
                                    )}
                                    <ChevronRight className={cn(
                                        "w-4 h-4 transition-transform group-hover:translate-x-1",
                                        hoveredCategory === cat.id ? "text-emerald-400" : "text-white/10"
                                    )} />
                                </button>
                            ))}
                        </div>

                        {/* Right Content Area */}
                        <div className="flex-1 p-8 relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                                <h3 className="text-xl font-bold text-white/90">
                                    {CATEGORIES.find(c => c.id === hoveredCategory)?.label} 서비스
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {SUB_MENUS[hoveredCategory] ? SUB_MENUS[hoveredCategory]
                                    .map((item) => (

                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                onSelect(hoveredCategory, item.id);
                                                setIsOpen(false);
                                            }}
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-2xl transition-all group hover:bg-white/5 text-left w-full cursor-pointer border border-transparent hover:border-white/5",
                                                activeTab === item.id && activeCategory === hoveredCategory ? "bg-emerald-500/5 border-emerald-500/10" : ""
                                            )}
                                        >
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                                                activeTab === item.id && activeCategory === hoveredCategory
                                                    ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                                    : "bg-white/5 text-white/30 group-hover:bg-white/10 group-hover:text-emerald-400 group-hover:scale-110"
                                            )}>
                                                <item.icon className="w-6 h-6" strokeWidth={1.5} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className={cn(
                                                    "font-bold text-base transition-colors",
                                                    activeTab === item.id && activeCategory === hoveredCategory ? "text-emerald-400" : "text-white/80 group-hover:text-white"
                                                )}>
                                                    {item.label}
                                                </div>
                                                <div className="text-[13px] text-white/30 font-medium truncate mt-0.5">
                                                    {item.desc}
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                                        </button>
                                    )) : (
                                    <div className="text-white/20 text-sm p-4 italic font-medium">메뉴가 비어있습니다.</div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

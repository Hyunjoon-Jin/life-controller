'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CATEGORIES, SUB_MENUS, CategoryType, WORK_NAV_ITEMS } from '@/constants/menu';

// TabType is now imported or we use string for flexibility in props as defined in interface
interface MegaMenuNavProps {
    activeCategory: CategoryType;
    activeTab: string;
    onSelect: (category: CategoryType, tab: string) => void;
}

export function MegaMenuNav({ activeCategory, activeTab, onSelect, appMode = 'life' }: MegaMenuNavProps & { appMode?: 'life' | 'work' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState<CategoryType>(activeCategory);

    // If Work Mode, we use a flat list and direct navigation
    if (appMode === 'work') {
        return (
            <div className="w-full relative z-50">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 max-w-7xl mx-auto">
                    {WORK_NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => onSelect('basic', item.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                                activeTab === item.id
                                    ? "bg-secondary text-secondary-foreground shadow-md"
                                    : "text-muted-foreground hover:bg-secondary/10 hover:text-secondary"
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
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
                {visibleCategories.map(cat => (
                    <button
                        key={cat.id}
                        onMouseEnter={() => {
                            setHoveredCategory(cat.id);
                            setIsOpen(true);
                        }}
                        onClick={() => {
                            // Optionally select first tab
                            const firstTab = SUB_MENUS[cat.id][0].id;
                            onSelect(cat.id, firstTab);
                            setIsOpen(false);
                        }}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                            activeCategory === cat.id
                                ? "bg-black text-white shadow-md"
                                : "text-muted-foreground hover:bg-gray-100 hover:text-black"
                        )}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Mega Menu Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 w-full bg-white dark:bg-popover text-popover-foreground rounded-[32px] shadow-2xl border border-border p-2 min-h-[400px] flex overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">

                    {/* Left: Categories List */}
                    <div className="w-48 py-4 px-2 border-r border-border flex flex-col gap-1">
                        {visibleCategories.map(cat => (
                            <button
                                key={cat.id}
                                onMouseEnter={() => setHoveredCategory(cat.id)}
                                className={cn(
                                    "text-left px-5 py-3.5 rounded-2xl text-[15px] font-bold transition-all flex justify-between items-center group",
                                    hoveredCategory === cat.id
                                        ? "bg-muted text-foreground"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                {cat.label}
                                {hoveredCategory === cat.id && <ChevronRight className="w-4 h-4 text-gray-400" />}
                            </button>
                        ))}
                    </div>

                    {/* Center: Sub Menus Grid */}
                    <div className="flex-1 p-6 bg-card">
                        <h3 className="text-lg font-bold mb-6 text-foreground px-2">
                            {CATEGORIES.find(c => c.id === hoveredCategory)?.label} 서비스
                        </h3>
                        <div className="flex flex-col gap-1">
                            {SUB_MENUS[hoveredCategory] ? SUB_MENUS[hoveredCategory]
                                .map((item) => (

                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            onSelect(hoveredCategory, item.id);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl transition-all group hover:bg-gray-50 dark:hover:bg-gray-800 text-left w-full cursor-pointer",
                                            activeTab === item.id && activeCategory === hoveredCategory ? "bg-blue-50 dark:bg-blue-900/10" : ""
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                            activeTab === item.id && activeCategory === hoveredCategory
                                                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                                                : "bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-blue-500 group-hover:shadow-sm"
                                        )}>
                                            <item.icon className="w-5 h-5" strokeWidth={2} />
                                        </div>
                                        <div className="flex-1 min-w-0 flex items-center gap-3">
                                            <div className={cn(
                                                "font-bold text-[15px] whitespace-nowrap",
                                                activeTab === item.id && activeCategory === hoveredCategory ? "text-blue-600" : "text-gray-900 dark:text-gray-100"
                                            )}>
                                                {item.label}
                                            </div>
                                            <div className="text-xs text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                                {item.desc}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                    </button>
                                )) : (
                                <div className="text-gray-400 text-sm p-4">메뉴가 없습니다.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

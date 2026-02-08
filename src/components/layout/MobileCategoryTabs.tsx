import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SUB_MENUS, CategoryType } from '@/constants/menu';

interface MobileCategoryTabsProps {
    activeCategory: CategoryType;
    activeTab: string;
    onSelect: (tab: string) => void;
}

export function MobileCategoryTabs({ activeCategory, activeTab, onSelect }: MobileCategoryTabsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const tabs = SUB_MENUS[activeCategory] || [];

    // Scroll active tab into view
    useEffect(() => {
        if (scrollRef.current) {
            const activeElement = scrollRef.current.querySelector('[data-active="true"]');
            if (activeElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    }, [activeTab]);

    if (tabs.length === 0) return null;

    return (
        <div className="md:hidden sticky top-[57px] z-40 bg-background/95 backdrop-blur-sm border-b border-border transition-all">
            <div
                ref={scrollRef}
                className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 py-3"
            >
                {tabs.map((tab: any) => (
                    <button
                        key={tab.id}
                        onClick={() => onSelect(tab.id)}
                        data-active={activeTab === tab.id}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0",
                            activeTab === tab.id
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-white dark:bg-gray-800 text-muted-foreground border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                        )}
                    >
                        {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

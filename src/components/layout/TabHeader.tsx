import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface TabHeaderProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    className?: string;
}

export function TabHeader({ title, description, icon: Icon, className }: TabHeaderProps) {
    return (
        <div className={cn("flex items-center gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800", className)}>
            {Icon && (
                <div className="w-12 h-12 rounded-[18px] bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
            )}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    {title}
                </h2>
                {description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

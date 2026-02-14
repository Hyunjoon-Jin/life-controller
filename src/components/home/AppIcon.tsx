import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface AppIconProps {
    icon: LucideIcon;
    label: string;
    colorClass: string; // e.g., "bg-blue-100 text-blue-600"
    onClick: () => void;
    labelClassName?: string;
}

export function AppIcon({ icon: Icon, label, colorClass, onClick, labelClassName }: AppIconProps) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center gap-2 group w-full cursor-pointer"
        >
            <div className={cn(
                "w-[60px] h-[60px] rounded-[22px] flex items-center justify-center transition-transform duration-200 group-hover:scale-95 group-active:scale-90 shadow-sm",
                colorClass
            )}>
                <Icon className="w-7 h-7" strokeWidth={2} />
            </div>
            <span className={cn("text-[13px] font-medium text-slate-600 dark:text-slate-400 leading-tight transition-colors", labelClassName)}>
                {label}
            </span>
        </button>
    );
}

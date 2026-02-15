"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export const GlowingEffect = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div
            className={cn(
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10",
                className
            )}
        >
            {children}
        </div>
    );
};

export const GlowingEffectItem = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            className={cn(
                "relative group block p-2 h-full w-full",
                className
            )}
            style={
                {
                    "--mouse-x": `${mousePosition.x}px`,
                    "--mouse-y": `${mousePosition.y}px`,
                } as React.CSSProperties
            }
        >
            <div className="rounded-3xl h-full w-full overflow-hidden bg-white/70 backdrop-blur-md border border-white/40 relative z-20 transition duration-500 group-hover:border-blue-300 shadow-sm">
                <div className="relative z-50">
                    <div className="p-4 h-full">{children}</div>
                </div>
                <GlowingPattern />
            </div>
        </div>
    );
};

const GlowingPattern = () => {
    return (
        <motion.div
            className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"
            style={{
                background: `
                    radial-gradient(
                        600px circle at var(--mouse-x) var(--mouse-y),
                        rgba(59, 130, 246, 0.1),
                        transparent 40%
                    )
                `
            }}
        />
    )
}

/* 
  Actual Aceternity Glowing Effect usually involves a specific grid implementation. 
  I will implement a version that tracks mouse position for the "Glow".
*/

export const GlowingGrid = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <div className={cn("w-full relative", className)}>
            {children}
        </div>
    );
};

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
    target: string;
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface OnboardingTourProps {
    steps: TourStep[];
    onComplete: () => void;
    isOpen: boolean;
}

export function OnboardingTour({ steps, onComplete, isOpen }: OnboardingTourProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        const updatePosition = () => {
            if (isOpen && steps[currentStep]) {
                const el = document.querySelector(steps[currentStep].target);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    setTargetRect(rect);
                    // Only scroll if off-screen
                    if (rect.top < 0 || rect.bottom > window.innerHeight) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                } else if (steps[currentStep].position === 'center') {
                    setTargetRect(null);
                }
            }
        };

        // Initial update with delay for animations
        const timer1 = setTimeout(updatePosition, 100);
        const timer2 = setTimeout(updatePosition, 500); // Double check after animation

        // Poll for position changes (handling scroll/resize/animation)
        const interval = setInterval(updatePosition, 100);

        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, { capture: true });

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearInterval(interval);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, { capture: true });
        };
    }, [isOpen, currentStep, steps]);

    if (!isOpen) return null;

    const step = steps[currentStep];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] pointer-events-none">
            {/* Dark Overlay with Spot (Punch-out) */}
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] pointer-events-auto"
                    style={{
                        clipPath: targetRect
                            ? `polygon(0% 0%, 0% 100%, ${targetRect.left}px 100%, ${targetRect.left}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.bottom}px, ${targetRect.left}px ${targetRect.bottom}px, ${targetRect.left}px 100%, 100% 100%, 100% 0%)`
                            : 'none'
                    }}
                />
            </AnimatePresence>

            {/* Content Popover */}
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    left: targetRect ? (
                        step.position === 'right' ? targetRect.right + 20 :
                            step.position === 'left' ? targetRect.left - 340 :
                                targetRect.left + (targetRect.width / 2) - 160 // Center horizontally
                    ) : '50%',
                    top: targetRect ? (
                        step.position === 'bottom' ? targetRect.bottom + 20 :
                            step.position === 'top' ? targetRect.top - 200 : // Assuming height ~180px
                                targetRect.top + (targetRect.height / 2) - 100 // Center vertically
                    ) : '50%',
                    x: targetRect ? 0 : '-50%',
                    y: targetRect ? 0 : '-50%'
                }}
                className={cn(
                    "absolute pointer-events-auto w-[320px] bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl p-6 border border-white/20",
                    !targetRect && "fixed"
                )}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-blue-500" />
                    </div>
                    <button onClick={onComplete} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-2 mb-6">
                    <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                        {step.title}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        {step.content}
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-all",
                                    i === currentStep ? "bg-blue-500 w-4" : "bg-slate-200 dark:bg-slate-700"
                                )}
                            />
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <Button variant="ghost" size="sm" onClick={handlePrev} className="h-9 w-9 rounded-full p-0">
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                        )}
                        <Button size="sm" onClick={handleNext} className="h-9 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                            {currentStep === steps.length - 1 ? '시작하기' : '다음'} <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useData } from '@/context/DataProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Shuffle, ArrowRight, ArrowLeft, RefreshCw, Eye,
    EyeOff, Zap, BrainCircuit, Terminal, Activity,
    ScanLine, MousePointer2, Sparkles, Binary, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface VocabQuizProps {
    language: string;
}

export function VocabQuiz({ language }: VocabQuizProps) {
    const { languageEntries = [] } = useData();

    // Aggregate all words
    const allVocab = useMemo(() => {
        return languageEntries
            .filter(e => e.language === language)
            .flatMap(e => e.vocabulary || [])
            .filter(v => v.word && v.meaning); // Valid only
    }, [languageEntries, language]);

    const [quizList, setQuizList] = useState(allVocab);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Initialize/Reset
    useEffect(() => {
        setQuizList(allVocab);
        setCurrentIndex(0);
        setIsFlipped(false);
    }, [allVocab]);

    const handleShuffle = () => {
        const shuffled = [...allVocab].sort(() => Math.random() - 0.5);
        setQuizList(shuffled);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const handleNext = () => {
        if (currentIndex < quizList.length - 1) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(prev => prev + 1), 50);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setIsFlipped(false);
            setCurrentIndex(prev => prev - 1);
        }
    };

    const currentCard = quizList[currentIndex];

    if (quizList.length === 0) {
        return (
            <div className="h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-[48px] bg-muted/20 p-12 text-center opacity-30">
                <BrainCircuit className="w-16 h-16 text-indigo-500 mb-6" strokeWidth={1} />
                <h3 className="text-xl font-semibold text-foreground mb-4">어휘 데이터베이스가 비어있습니다</h3>
                <p className="text-sm text-muted-foreground leading-loose">
                    학습 로그에 어휘 항목을 기록하여<br />퀴즈를 시작하세요.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center max-w-2xl mx-auto space-y-10 py-12 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between w-full px-8 relative z-10">
                <div className="space-y-1">
                    <div className="text-sm font-medium text-indigo-400 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> 어휘 퀴즈
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                        <span className="text-foreground">{currentIndex + 1}</span> / {quizList.length}
                    </div>
                </div>
                <Button
                    variant="ghost"
                    onClick={handleShuffle}
                    className="h-10 px-5 rounded-xl bg-muted border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
                >
                    <Shuffle className="w-3 h-3 mr-2 text-indigo-400" /> 순서 섞기
                </Button>
            </div>

            {/* Flashcard Component */}
            <div className="w-full relative h-[450px] perspective-2000 group/card">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50, rotateY: 30 }}
                        animate={{ opacity: 1, x: 0, rotateY: 0 }}
                        exit={{ opacity: 0, x: -50, rotateY: -30 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                        className="w-full h-full relative"
                    >
                        <div
                            className={cn(
                                "w-full h-full relative cursor-pointer transition-all duration-700 transform-style-3d",
                                isFlipped ? "rotate-y-180" : ""
                            )}
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            {/* Front: Word Layer */}
                            <Card className="absolute inset-0 backface-hidden w-full h-full flex flex-col items-center justify-center p-12 glass-premium border border-border bg-gradient-to-br from-white/[0.03] to-transparent shadow-2xl rounded-[48px] overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-border rounded-full animate-pulse" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-border rounded-full animate-pulse delay-75" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-border rounded-full animate-pulse delay-150" />
                                </div>
                                <div className="z-10 text-center space-y-6">
                                    <span className="text-sm font-medium text-indigo-400/70 mb-4 block">단어</span>
                                    <h2 className="text-5xl md:text-6xl font-semibold text-foreground text-center break-words leading-tight tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                        {currentCard.word}
                                    </h2>
                                </div>
                                <div className="absolute bottom-10 flex items-center gap-3 text-sm font-medium text-muted-foreground/30 group-hover/card:text-indigo-400 transition-colors">
                                    <Sparkles className="w-3 h-3" /> 클릭하여 뒤집기
                                </div>
                            </Card>

                            {/* Back: Meaning Layer */}
                            <Card className="absolute inset-0 backface-hidden w-full h-full flex flex-col items-center justify-center p-12 glass-premium border-2 border-indigo-500/40 bg-gradient-to-br from-indigo-500/20 to-transparent shadow-[0_0_50px_rgba(99,102,241,0.2)] rounded-[48px] rotate-y-180">
                                <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none" />
                                <div className="z-10 text-center space-y-6">
                                    <span className="text-sm font-medium text-indigo-400 mb-4 block underline underline-offset-8">의미</span>
                                    <h2 className="text-3xl md:text-4xl font-semibold text-foreground text-center break-words leading-tight tracking-tight px-4">
                                        {currentCard.meaning}
                                    </h2>
                                </div>
                                <div className="absolute bottom-10 flex items-center gap-3 text-sm font-medium text-muted-foreground/30">
                                    <EyeOff className="w-3 h-3 text-indigo-500" /> 다시 클릭하여 접기
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="flex flex-col items-center gap-6 relative z-10 w-full px-12">
                <div className="flex items-center justify-between w-full">
                    <Button
                        variant="ghost"
                        className="w-16 h-16 rounded-3xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all active:scale-90"
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                    >
                        <ArrowLeft className="w-6 h-6" strokeWidth={3} />
                    </Button>

                    <div className="flex flex-col items-center gap-2">
                        <div className="text-sm font-medium text-indigo-400">
                            {isFlipped ? '의미 확인' : '단어 보는 중'}
                        </div>
                        <div className="flex gap-1.5">
                            {Array.from({ length: Math.min(quizList.length, 10) }).map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-1 rounded-full transition-all duration-500",
                                        i === currentIndex % 10 ? "w-8 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "w-2 bg-muted"
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    <Button
                        className="w-16 h-16 rounded-3xl bg-indigo-500 text-white shadow-[0_10px_30px_-5px_rgba(99,102,241,0.5)] hover:bg-indigo-600 transition-all active:scale-95"
                        onClick={handleNext}
                        disabled={currentIndex === quizList.length - 1}
                    >
                        <ArrowRight className="w-6 h-6" strokeWidth={3} />
                    </Button>
                </div>

            </div>
        </div>
    );
}

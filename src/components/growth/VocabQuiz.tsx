'use client';

import { useState, useMemo, useEffect } from 'react';
import { useData } from '@/context/DataProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Shuffle, ArrowRight, ArrowLeft, RefreshCw, Eye,
    EyeOff, Zap, BrainCircuit, Terminal, Activity,
    ScanLine, MousePointer2, Sparkles, Binary
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
            <div className="h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[48px] bg-white/[0.01] p-12 text-center opacity-30">
                <BrainCircuit className="w-16 h-16 text-indigo-500 mb-6" strokeWidth={1} />
                <h3 className="text-xl font-black text-white tracking-[0.3em] uppercase mb-4">LEXICAL DATABASE VACANT</h3>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-loose italic">
                    COMMIT LINGUISTIC ARTIFACTS IN THE INPUT LOG<br />TO INITIALIZE SYNAPTIC RECALL PROTOCOLS.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center max-w-2xl mx-auto space-y-10 py-12 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Header / Protocol Status */}
            <div className="flex items-center justify-between w-full px-8 relative z-10">
                <div className="space-y-1">
                    <div className="text-[10px] font-black text-indigo-400 tracking-[0.4em] uppercase italic flex items-center gap-2">
                        <ScanLine className="w-3 h-3" /> SYNAPTIC SCAN: ACTIVE
                    </div>
                    <div className="text-sm font-black text-white/20 tracking-widest uppercase">
                        INDEX: <span className="text-white">{currentIndex + 1}</span> / {quizList.length}
                    </div>
                </div>
                <Button
                    variant="ghost"
                    onClick={handleShuffle}
                    className="h-10 px-5 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black tracking-[0.2em] uppercase text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                    <Shuffle className="w-3 h-3 mr-2 text-indigo-400" /> REORDER MATRIX
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
                            <Card className="absolute inset-0 backface-hidden w-full h-full flex flex-col items-center justify-center p-12 glass-premium border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent shadow-2xl rounded-[48px] overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/10 rounded-full animate-pulse" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full animate-pulse delay-75" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full animate-pulse delay-150" />
                                </div>
                                <div className="z-10 text-center space-y-6">
                                    <span className="text-[10px] font-black text-indigo-400/50 uppercase tracking-[0.6em] mb-4 block">IDENTIFIER</span>
                                    <h2 className="text-5xl md:text-6xl font-black text-white text-center break-words leading-tight tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                        {currentCard.word}
                                    </h2>
                                </div>
                                <div className="absolute bottom-10 flex items-center gap-3 text-[9px] font-black text-white/10 uppercase tracking-[0.4em] italic group-hover/card:text-indigo-400 transition-colors">
                                    <Sparkles className="w-3 h-3" /> INITIALIZE RECALL
                                </div>
                            </Card>

                            {/* Back: Meaning Layer */}
                            <Card className="absolute inset-0 backface-hidden w-full h-full flex flex-col items-center justify-center p-12 glass-premium border-2 border-indigo-500/40 bg-gradient-to-br from-indigo-500/20 to-transparent shadow-[0_0_50px_rgba(99,102,241,0.2)] rounded-[48px] rotate-y-180">
                                <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none" />
                                <div className="z-10 text-center space-y-6">
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.6em] mb-4 block underline underline-offset-8">SEMANTIC VALUE</span>
                                    <h2 className="text-3xl md:text-4xl font-black text-white text-center break-words leading-tight tracking-tight px-4">
                                        {currentCard.meaning}
                                    </h2>
                                </div>
                                <div className="absolute bottom-10 flex items-center gap-3 text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic">
                                    <EyeOff className="w-3 h-3 text-indigo-500" /> SECURE DATA
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
                        className="w-16 h-16 rounded-3xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                    >
                        <ArrowLeft className="w-6 h-6" strokeWidth={3} />
                    </Button>

                    <div className="flex flex-col items-center gap-2">
                        <div className="text-[10px] font-black text-indigo-400 tracking-[0.3em] uppercase">
                            {isFlipped ? 'SEMANTIC VERIFIED' : 'PENDING RECALL'}
                        </div>
                        <div className="flex gap-1.5">
                            {Array.from({ length: Math.min(quizList.length, 10) }).map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-1 rounded-full transition-all duration-500",
                                        i === currentIndex % 10 ? "w-8 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "w-2 bg-white/10"
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

                <p className="text-[8px] font-black text-white/10 tracking-[0.5em] uppercase text-center mt-4">
                    ANTAGRAVITY LEXICAL ENGINE v2.0 // NEURAL SYNC: ENABLED
                </p>
            </div>
        </div>
    );
}

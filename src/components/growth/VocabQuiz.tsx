'use client';

import { useState, useMemo, useEffect } from 'react';
import { useData } from '@/context/DataProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shuffle, ArrowRight, ArrowLeft, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface VocabQuizProps {
    language: string;
}

export function VocabQuiz({ language }: VocabQuizProps) {
    const { languageEntries } = useData();

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
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
            setTimeout(() => setCurrentIndex(prev => prev + 1), 150); // Delay for flip animation reset if needed, but immediate is snappier
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
            <div className="flex flex-col items-center justify-center p-12 text-center h-[400px] border rounded-3xl bg-muted/20">
                <RefreshCw className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-lg font-bold text-muted-foreground">단어가 없습니다.</h3>
                <p className="text-sm text-muted-foreground">학습 로그에서 단어를 먼저 저장해주세요.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center max-w-2xl mx-auto space-y-8 py-8 animate-in fade-in duration-500">
            {/* Header / Controls */}
            <div className="flex items-center justify-between w-full px-4">
                <div className="text-sm font-bold text-muted-foreground">
                    {currentIndex + 1} / {quizList.length}
                </div>
                <Button variant="outline" size="sm" onClick={handleShuffle} className="gap-2">
                    <Shuffle className="w-4 h-4" /> 순서 섞기
                </Button>
            </div>

            {/* Flashcard Area */}
            <div className="w-full relative h-[400px] perspective-1000">
                <div
                    className={cn(
                        "w-full h-full relative cursor-pointer transition-all duration-500 transform-style-3d",
                        isFlipped ? "rotate-y-180" : ""
                    )}
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    {/* Front */}
                    <Card className="absolute inset-0 backface-hidden w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-950 border-2 border-primary/10 shadow-xl rounded-3xl group">
                        <span className="text-xs font-bold text-primary/50 uppercase tracking-widest mb-4">Word</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-center break-words leading-tight">
                            {currentCard.word}
                        </h2>
                        <div className="absolute bottom-6 text-muted-foreground text-xs flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                            <Eye className="w-3 h-3" /> 클릭하여 뜻 보기
                        </div>
                    </Card>

                    {/* Back */}
                    <Card className="absolute inset-0 backface-hidden w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-2 border-primary shadow-xl rounded-3xl rotate-y-180">
                        <span className="text-xs font-bold text-primary/50 uppercase tracking-widest mb-4">Meaning</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-center break-words text-primary leading-tight">
                            {currentCard.meaning}
                        </h2>
                        <div className="absolute bottom-6 text-muted-foreground text-xs flex items-center gap-1 opacity-50">
                            <EyeOff className="w-3 h-3" /> 클릭하여 단어 보기
                        </div>
                    </Card>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-6">
                <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full w-14 h-14 p-0"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                >
                    <ArrowLeft className="w-6 h-6" />
                </Button>

                <div className="text-sm text-muted-foreground font-medium">
                    {isFlipped ? '뜻 확인' : '단어 확인'}
                </div>

                <Button
                    size="lg"
                    className="rounded-full w-14 h-14 p-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/30 transition-all"
                    onClick={handleNext}
                    disabled={currentIndex === quizList.length - 1}
                >
                    <ArrowRight className="w-6 h-6" />
                </Button>
            </div>
        </div>
    );
}

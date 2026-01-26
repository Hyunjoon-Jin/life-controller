'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Plus, Trash2, Clock, Calendar as CalendarIcon, Save, Languages, BarChart2, GraduationCap, PenTool } from 'lucide-react';
import { format } from 'date-fns';
import { LanguageStats } from './LanguageStats';
import { VocabQuiz } from './VocabQuiz';
import { Textarea } from '@/components/ui/textarea';

export function LanguageLog() {
    const { languageEntries, addLanguageEntry, deleteLanguageEntry } = useData();
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [activeTab, setActiveTab] = useState<'log' | 'stats' | 'quiz'>('stats'); // Default to stats for dashboard feel

    const [studyTime, setStudyTime] = useState('');
    const [vocabList, setVocabList] = useState<{ word: string, meaning: string }[]>([]);
    const [currentWord, setCurrentWord] = useState('');
    const [currentMeaning, setCurrentMeaning] = useState('');
    const [memo, setMemo] = useState('');

    const languages = [
        { id: 'English', label: '영어' },
        { id: 'Japanese', label: '일본어' },
        { id: 'Chinese', label: '중국어' },
        { id: 'Spanish', label: '스페인어' },
        { id: 'German', label: '독일어' },
        { id: 'French', label: '프랑스어' },
    ];

    const handleAddVocab = () => {
        if (!currentWord.trim()) return;
        setVocabList([...vocabList, { word: currentWord.trim(), meaning: currentMeaning.trim() }]);
        setCurrentWord('');
        setCurrentMeaning('');
    };

    const handleSave = () => {
        if (!studyTime && vocabList.length === 0) return;

        addLanguageEntry({
            id: generateId(),
            language: selectedLanguage,
            date: new Date(),
            studyTime: parseInt(studyTime) || 0,
            vocabulary: vocabList,
            memo: memo
        });

        // Reset
        setStudyTime('');
        setVocabList([]);
        setMemo('');
        setCurrentWord('');
        setCurrentMeaning('');
    };

    const filteredEntries = (languageEntries || []).filter(entry => entry.language === selectedLanguage);

    return (
        <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-black/5">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Languages className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">어학 학습 센터</h2>
                    </div>
                    <p className="text-sm text-muted-foreground ml-1">오늘도 꾸준한 학습으로 실력을 쌓아보세요!</p>
                </div>

                {/* Language Selector */}
                <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-full shadow-sm border border-gray-100 dark:border-zinc-800">
                    {languages.map(lang => (
                        <button
                            key={lang.id}
                            onClick={() => setSelectedLanguage(lang.id)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-bold transition-all",
                                selectedLanguage === lang.id
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-zinc-800"
                            )}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-zinc-800 pb-1">
                <button
                    onClick={() => setActiveTab('stats')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition-colors",
                        activeTab === 'stats'
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    <BarChart2 className="w-4 h-4" /> 대시보드
                </button>
                <button
                    onClick={() => setActiveTab('log')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition-colors",
                        activeTab === 'log'
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    <PenTool className="w-4 h-4" /> 기록하기
                </button>
                <button
                    onClick={() => setActiveTab('quiz')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition-colors",
                        activeTab === 'quiz'
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    <GraduationCap className="w-4 h-4" /> 단어장 (퀴즈)
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0">
                {activeTab === 'stats' && <LanguageStats language={selectedLanguage} />}

                {activeTab === 'quiz' && <VocabQuiz language={selectedLanguage} />}

                {activeTab === 'log' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Input Section */}
                        <Card className="lg:col-span-1 border-border/50 shadow-sm h-fit">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <span className="text-primary font-bold">{languages.find(l => l.id === selectedLanguage)?.label}</span> 학습 기록
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>학습 시간 (분)</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            placeholder="ex) 60"
                                            className="pl-9"
                                            value={studyTime}
                                            onChange={(e) => setStudyTime(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>단어 / 표현 저장</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Word"
                                            value={currentWord}
                                            onChange={(e) => setCurrentWord(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Input
                                            placeholder="Meaning"
                                            value={currentMeaning}
                                            onChange={(e) => setCurrentMeaning(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddVocab()}
                                            className="flex-1"
                                        />
                                        <Button size="icon" onClick={handleAddVocab}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Vocab Preview List */}
                                    {vocabList.length > 0 && (
                                        <div className="bg-muted/50 rounded-lg p-2 max-h-[150px] overflow-y-auto space-y-1 mt-2 custom-scrollbar">
                                            {vocabList.map((v, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-sm bg-background p-2 rounded border border-border/50 animate-in slide-in-from-left-2">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold">{v.word}</span>
                                                        <span className="text-xs text-muted-foreground">{v.meaning}</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-red-400"
                                                        onClick={() => setVocabList(vocabList.filter((_, i) => i !== idx))}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>메모</Label>
                                    <Input
                                        placeholder="오늘의 학습 내용..."
                                        value={memo}
                                        onChange={(e) => setMemo(e.target.value)}
                                    />
                                </div>

                                <Button className="w-full font-bold" onClick={handleSave} disabled={!studyTime && vocabList.length === 0}>
                                    <Save className="w-4 h-4 mr-2" /> 기록 저장
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Recent Log List Section */}
                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-muted-foreground" /> 최근 기록 내역
                            </h3>

                            {filteredEntries.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground bg-white dark:bg-zinc-900 rounded-xl border border-dashed h-[300px]">
                                    <BookOpen className="w-12 h-12 mb-4 opacity-10" />
                                    <p className="font-medium">아직 학습 기록이 없습니다.</p>
                                    <p className="text-sm opacity-70">왼쪽의 입력폼을 통해 첫 기록을 남겨보세요!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                                        <Card key={entry.id} className="overflow-hidden hover:shadow-md transition-shadow border-l-4 border-l-primary/50">
                                            <CardContent className="p-0">
                                                <div className="flex flex-col md:flex-row">
                                                    <div className="bg-muted/10 p-4 flex flex-col justify-center items-center min-w-[100px] border-b md:border-b-0 md:border-r border-border/50">
                                                        <span className="text-xs font-bold text-muted-foreground">
                                                            {format(new Date(entry.date), 'yyyy.MM.dd')}
                                                        </span>
                                                        <span className="text-xl font-black text-foreground mt-1">
                                                            {entry.studyTime}
                                                            <span className="text-xs font-normal ml-0.5">분</span>
                                                        </span>
                                                    </div>

                                                    <div className="p-4 flex-1">
                                                        {entry.memo && (
                                                            <div className="mb-3 text-sm font-medium bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200 px-3 py-1.5 rounded-md inline-block">
                                                                📝 {entry.memo}
                                                            </div>
                                                        )}

                                                        {entry.vocabulary.length > 0 && (
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                                {entry.vocabulary.map((v, i) => (
                                                                    <div key={i} className="flex items-center gap-2 text-sm bg-muted/20 px-2 py-1 rounded">
                                                                        <span className="font-bold text-primary">{v.word}</span>
                                                                        <span className="text-muted-foreground text-xs">{v.meaning}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {entry.vocabulary.length === 0 && !entry.memo && (
                                                            <p className="text-sm text-muted-foreground italic">상세 기록 없음</p>
                                                        )}
                                                    </div>

                                                    <div className="p-2 flex items-start justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                            onClick={() => deleteLanguageEntry(entry.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BookOpen, Plus, Trash2, Clock, Calendar as CalendarIcon,
    Save, Languages, BarChart2, GraduationCap, PenTool,
    BookMarked, Brain, Sparkles, Zap, Target, BookMarked as BookMarkedIcon,
    Terminal, Fingerprint, Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { LanguageStats } from './LanguageStats';
import { VocabQuiz } from './VocabQuiz';
import { LanguageResources } from './LanguageResources';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

export function LanguageLog() {
    const { languageEntries, addLanguageEntry, deleteLanguageEntry } = useData();
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [activeTab, setActiveTab] = useState<'log' | 'stats' | 'quiz' | 'resources'>('stats');

    const [studyTime, setStudyTime] = useState('');
    const [vocabList, setVocabList] = useState<{ word: string, meaning: string }[]>([]);
    const [currentWord, setCurrentWord] = useState('');
    const [currentMeaning, setCurrentMeaning] = useState('');
    const [memo, setMemo] = useState('');

    const languages = [
        { id: 'English', label: 'ENGLISH', code: 'EN' },
        { id: 'Japanese', label: 'JAPANESE', code: 'JA' },
        { id: 'Chinese', label: 'CHINESE', code: 'ZH' },
        { id: 'Spanish', label: 'SPANISH', code: 'ES' },
        { id: 'German', label: 'GERMAN', code: 'DE' },
        { id: 'French', label: 'FRENCH', code: 'FR' },
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
        setStudyTime(''); setVocabList([]); setMemo(''); setCurrentWord(''); setCurrentMeaning('');
    };

    const filteredEntries = (languageEntries || []).filter(entry => entry.language === selectedLanguage);

    return (
        <div className="h-full flex flex-col glass-premium rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-sky-500/[0.03] pointer-events-none" />

            {/* Header Area */}
            <div className="p-8 pb-4 relative z-10">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(99,102,241,0.5)]">
                            <Languages className="w-6 h-6 text-white" strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">LINGUISTIC HUB</h2>
                            <p className="text-[10px] font-bold text-white/20 tracking-[0.3em] uppercase mt-2 italic flex items-center gap-2">
                                <Terminal className="w-3 h-3 text-indigo-500" /> NEURAL SYNAPSE CALIBRATION: ACTIVE
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                        {languages.map(lang => (
                            <button
                                key={lang.id}
                                onClick={() => setSelectedLanguage(lang.id)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-2",
                                    selectedLanguage === lang.id
                                        ? "bg-indigo-500 text-white shadow-lg"
                                        : "text-white/40 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[8px]">{lang.code}</span>
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sub-Navigation */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {[
                        { id: 'stats', label: 'ANALYTICS', icon: BarChart2 },
                        { id: 'log', label: 'INPUT LOG', icon: PenTool },
                        { id: 'quiz', label: 'LEXICON QUIZ', icon: GraduationCap },
                        { id: 'resources', label: 'RESOURCES', icon: BookMarkedIcon },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap border border-transparent",
                                activeTab === tab.id
                                    ? "bg-white/10 text-white border-white/10 shadow-inner"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-indigo-400" : "text-white/20")} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0 relative z-10">
                <AnimatePresence mode="wait">
                    {activeTab === 'stats' && (
                        <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full">
                            <LanguageStats language={selectedLanguage} />
                        </motion.div>
                    )}

                    {activeTab === 'quiz' && (
                        <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <VocabQuiz language={selectedLanguage} />
                        </motion.div>
                    )}

                    {activeTab === 'resources' && (
                        <motion.div key="resources" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <LanguageResources language={selectedLanguage} />
                        </motion.div>
                    )}

                    {activeTab === 'log' && (
                        <motion.div key="log" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                            {/* Input Panel */}
                            <Card className="lg:col-span-1 glass-premium rounded-[40px] border border-white/5 bg-transparent overflow-hidden h-fit">
                                <CardHeader className="p-8 pb-0">
                                    <div className="flex items-center gap-3">
                                        <Zap className="w-5 h-5 text-indigo-400" />
                                        <CardTitle className="text-xl font-black text-white tracking-widest uppercase">INPUT PROTOCOL</CardTitle>
                                    </div>
                                    <p className="text-[9px] font-bold text-white/20 uppercase mt-1 tracking-widest">TRANSMIT NEW STUDY DATA</p>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">SESSION DURATION (MIN)</Label>
                                        <div className="relative group">
                                            <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
                                            <Input
                                                type="number"
                                                placeholder="00"
                                                className="h-14 pl-14 font-black text-sm bg-white/5 border-white/5 rounded-2xl text-white focus:ring-indigo-500/30"
                                                value={studyTime}
                                                onChange={(e) => setStudyTime(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">LEXICAL ACQUISITION</Label>
                                        <div className="flex gap-3">
                                            <Input
                                                placeholder="WORD"
                                                value={currentWord}
                                                onChange={(e) => setCurrentWord(e.target.value)}
                                                className="h-12 flex-1 font-black text-[10px] tracking-widest bg-white/5 border-white/5 rounded-xl text-white"
                                            />
                                            <Input
                                                placeholder="MEANING"
                                                value={currentMeaning}
                                                onChange={(e) => setCurrentMeaning(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddVocab()}
                                                className="h-12 flex-1 font-black text-[10px] tracking-widest bg-white/5 border-white/5 rounded-xl text-white"
                                            />
                                            <Button
                                                size="icon"
                                                onClick={handleAddVocab}
                                                className="h-12 w-12 rounded-xl bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </Button>
                                        </div>

                                        {/* Vocab Queue */}
                                        <AnimatePresence>
                                            {vocabList.length > 0 && (
                                                <div className="space-y-2 mt-4 max-h-[200px] overflow-y-auto no-scrollbar">
                                                    {vocabList.map((v, idx) => (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 group"
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black text-white tracking-widest uppercase">{v.word}</span>
                                                                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{v.meaning}</span>
                                                            </div>
                                                            <button
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/10 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                                onClick={() => setVocabList(vocabList.filter((_, i) => i !== idx))}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">SESSION OVERVIEW</Label>
                                        <Textarea
                                            placeholder="ENTER NEURAL FEEDBACK..."
                                            className="min-h-[100px] bg-white/5 border-white/5 rounded-2xl font-bold text-[10px] tracking-widest uppercase text-white p-5 focus:ring-indigo-500/30"
                                            value={memo}
                                            onChange={(e) => setMemo(e.target.value)}
                                        />
                                    </div>

                                    <Button
                                        className="w-full h-14 rounded-2xl bg-indigo-500 hover:bg-indigo-600 font-black text-sm tracking-widest uppercase shadow-xl mt-4 active:scale-95 transition-all"
                                        onClick={handleSave}
                                        disabled={!studyTime && vocabList.length === 0}
                                    >
                                        <Save className="w-4 h-4 mr-3" /> COMMIT LOG
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Feed Panel */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="w-5 h-5 text-indigo-500" />
                                        <h3 className="text-xl font-black text-white tracking-widest uppercase">TRANSMISSION FEED</h3>
                                    </div>
                                </div>

                                {filteredEntries.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-10 gap-4 border-2 border-dashed border-white/10 rounded-[40px] py-20">
                                        <BookOpen className="w-12 h-12" />
                                        <p className="text-[10px] font-black tracking-[0.3em] uppercase text-center">NO LINGUISTIC ARTIFACTS DETECTED<br />IN THE CURRENT FREQUENCY</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {filteredEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={entry.id}
                                                className="group glass-premium rounded-[32px] border border-white/5 p-8 transition-all relative overflow-hidden flex flex-col sm:flex-row gap-8"
                                            >
                                                <div className="bg-white/5 w-20 h-20 rounded-2xl flex flex-col items-center justify-center border border-white/10 shrink-0">
                                                    <span className="text-[10px] font-black text-white/20 uppercase mb-1">{format(new Date(entry.date), 'MMM')}</span>
                                                    <span className="text-2xl font-black text-white tracking-tighter leading-none">{format(new Date(entry.date), 'dd')}</span>
                                                </div>

                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-6 items-center px-4 rounded-lg bg-indigo-500/20 text-[9px] font-black tracking-widest text-indigo-400 uppercase border border-indigo-500/20">
                                                                SESSION {entry.studyTime} MIN
                                                            </div>
                                                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{format(new Date(entry.date), 'hh:mm a')}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => deleteLanguageEntry(entry.id)}
                                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/5 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    {entry.memo && (
                                                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest italic line-clamp-2">
                                                                <Terminal className="w-3 h-3 inline mr-2 text-indigo-500" /> {entry.memo}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {entry.vocabulary.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {entry.vocabulary.map((v, i) => (
                                                                <div key={i} className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                                                    <span className="text-[10px] font-black text-white tracking-widest uppercase">{v.word}</span>
                                                                    <div className="h-3 w-px bg-white/10" />
                                                                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{v.meaning}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

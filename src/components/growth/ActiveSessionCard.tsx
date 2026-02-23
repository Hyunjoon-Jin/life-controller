'use client';

import { useState } from 'react';
import { ExerciseSession } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dumbbell, Trash2, Plus, GripVertical, Check, Zap, Target, Flame, ArrowRight, X } from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ActiveSessionCardProps {
    index: number;
    session: ExerciseSession;
    onUpdate: (updatedSession: ExerciseSession) => void;
    onDelete: (id: string) => void;
}

export function ActiveSessionCard({ index, session, onUpdate, onDelete }: ActiveSessionCardProps) {
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');

    const handleAddSet = () => {
        if (!weight || !reps) return;
        const newSet = {
            id: generateId(),
            setNumber: (session.sets?.length || 0) + 1,
            weight: parseFloat(weight),
            reps: parseInt(reps),
            completed: true
        };
        const updatedSession = { ...session, sets: [...(session.sets || []), newSet] };
        onUpdate(updatedSession);
        setReps(''); // Clear reps but keep weight for next set
    };

    const handleDeleteSet = (setId: string) => {
        const updatedSets = session.sets
            ?.filter(s => s.id !== setId)
            .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        onUpdate({ ...session, sets: updatedSets });
    };

    const colors = {
        weight: 'rose',
        cardio: 'sky',
        sport: 'amber',
        fitness: 'emerald'
    }[session.category as keyof typeof session.category] || 'rose';

    const accentColor = {
        rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-[0_5px_15px_rgba(244,63,94,0.3)]',
        sky: 'text-sky-500 bg-sky-500/10 border-sky-500/20 shadow-[0_5px_15px_rgba(14,165,233,0.3)]',
        amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-[0_5px_15px_rgba(245,158,11,0.3)]',
        emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_5px_15px_rgba(16,185,129,0.3)]'
    }[colors];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group glass-premium rounded-[32px] border border-white/5 p-8 shadow-xl transition-all hover:bg-white/[0.03]"
        >
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border",
                        accentColor
                    )}>
                        {index + 1}
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-white tracking-tighter uppercase leading-none">{session.type}</h4>
                        <div className="flex items-center gap-2 mt-1.5 opacity-40">
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                {({'weight': '웨이트', 'cardio': '유산소', 'sport': '스포츠', 'fitness': '피트니스'} as Record<string, string>)[session.category as string] || session.category} 구분
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => onDelete(session.id)}
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {session.category === 'weight' && (
                <div className="space-y-8 pl-18">
                    {/* Weight/Reps Input */}
                    <div className="flex items-center gap-4 bg-white/5 p-6 rounded-[28px] border border-white/5">
                        <div className="flex-1 space-y-2">
                            <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">무게 (KG)</label>
                            <Input
                                type="number"
                                value={weight}
                                onChange={e => setWeight(e.target.value)}
                                className="h-12 bg-transparent border-none text-2xl font-black text-white placeholder:text-white/5 focus-visible:ring-0 text-center"
                                placeholder="00"
                            />
                        </div>
                        <div className="w-px h-10 bg-white/5 shrink-0" />
                        <div className="flex-1 space-y-2">
                            <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">횟수</label>
                            <Input
                                type="number"
                                value={reps}
                                onChange={e => setReps(e.target.value)}
                                className="h-12 bg-transparent border-none text-2xl font-black text-white placeholder:text-white/5 focus-visible:ring-0 text-center"
                                placeholder="00"
                                onKeyDown={e => e.key === 'Enter' && handleAddSet()}
                            />
                        </div>
                        <Button
                            onClick={handleAddSet}
                            className="w-14 h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 shadow-xl transition-all shrink-0 active:scale-90"
                        >
                            <Plus className="w-6 h-6 text-white" strokeWidth={3} />
                        </Button>
                    </div>

                    {/* Sets Display */}
                    {session.sets && session.sets.length > 0 && (
                        <div className="space-y-3">
                            <AnimatePresence>
                                {session.sets.map((set) => (
                                    <motion.div
                                        key={set.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 transition-all group/set"
                                    >
                                        <div className="flex items-center gap-6">
                                            <span className="font-black text-[10px] text-white/20 w-8">{set.setNumber}세트</span>
                                            <div className="flex items-end gap-1">
                                                <span className="text-xl font-black text-white tracking-tighter">{set.weight}</span>
                                                <span className="text-[10px] font-black text-rose-500 mb-1">KG</span>
                                            </div>
                                            <X className="w-3 h-3 text-white/10" />
                                            <div className="flex items-end gap-1">
                                                <span className="text-xl font-black text-white tracking-tighter">{set.reps}</span>
                                                <span className="text-[10px] font-black text-sky-500 mb-1">회</span>
                                            </div>
                                        </div>
                                        <button
                                            className="w-8 h-8 rounded-lg bg-white/5 text-white/10 opacity-0 group-hover/set:opacity-100 hover:bg-rose-500 hover:text-white transition-all transform hover:rotate-12"
                                            onClick={() => handleDeleteSet(set.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-4">
                                <div className="flex items-center gap-2">
                                    <Flame className="w-4 h-4 text-rose-500" />
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">누적 볼륨</span>
                                </div>
                                <div className="flex items-end gap-1">
                                    <span className="text-2xl font-black text-white tracking-tighter">
                                        {session.sets.reduce((acc, curr) => acc + (curr.weight * curr.reps), 0).toLocaleString()}
                                    </span>
                                    <span className="text-[11px] font-black text-rose-500 mb-1.5 uppercase">KG</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {session.category !== 'weight' && (
                <div className="pl-18 space-y-6">
                    <div className="bg-white/5 p-8 rounded-[32px] border border-white/5 flex flex-wrap gap-8">
                        {session.category === 'cardio' && (
                            <>
                                {session.distance && (
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[9px] font-black text-white/20 uppercase tracking-widest">거리</label>
                                        <span className="text-3xl font-black text-white tracking-tighter">{session.distance} <small className="text-xs text-sky-500">KM</small></span>
                                    </div>
                                )}
                                {session.duration && (
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[9px] font-black text-white/20 uppercase tracking-widest">시간</label>
                                        <span className="text-3xl font-black text-white tracking-tighter">{Math.floor(session.duration)} <small className="text-xs text-rose-500">분</small></span>
                                    </div>
                                )}
                                {session.count && (
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[9px] font-black text-white/20 uppercase tracking-widest">횟수</label>
                                        <span className="text-3xl font-black text-white tracking-tighter">{session.count} <small className="text-xs text-amber-500">바퀴</small></span>
                                    </div>
                                )}
                            </>
                        )}
                        {session.category === 'fitness' && (
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-black text-white/20 uppercase tracking-widest">운동 시간</label>
                                <span className="text-3xl font-black text-white tracking-tighter">{Math.floor(session.duration || 0)} <small className="text-xs text-emerald-500">분</small></span>
                            </div>
                        )}
                        {session.category === 'sport' && (
                            <>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[9px] font-black text-white/20 uppercase tracking-widest">시간</label>
                                    <span className="text-3xl font-black text-white tracking-tighter">{Math.floor(session.duration || 0)} <small className="text-xs text-amber-500">분</small></span>
                                </div>
                                {session.score && (
                                    <div className="flex flex-col gap-1 pl-8 border-l border-white/10">
                                        <label className="text-[9px] font-black text-white/20 uppercase tracking-widest">점수</label>
                                        <span className="text-3xl font-black text-white tracking-tighter">{session.score} <small className="text-xs text-rose-500">점</small></span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

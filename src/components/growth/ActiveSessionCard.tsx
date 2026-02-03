'use client';

import { useState } from 'react';
import { ExerciseSession } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dumbbell, Trash2, Plus, GripVertical, Check } from 'lucide-react';
import { cn, generateId } from '@/lib/utils';

interface ActiveSessionCardProps {
    index: number;
    session: ExerciseSession;
    onUpdate: (updatedSession: ExerciseSession) => void;
    onDelete: (id: string) => void;
}

export function ActiveSessionCard({ index, session, onUpdate, onDelete }: ActiveSessionCardProps) {
    // Local state for adding sets
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

        const updatedSession = {
            ...session,
            sets: [...(session.sets || []), newSet]
        };

        onUpdate(updatedSession);
        // Keep weight, maybe clear reps? Or keep both for convenience?
        // Usually people do same weight, same reps. Keep it.
    };

    const handleDeleteSet = (setId: string) => {
        const updatedSets = session.sets
            ?.filter(s => s.id !== setId)
            .map((s, idx) => ({ ...s, setNumber: idx + 1 })); // Renumber

        onUpdate({
            ...session,
            sets: updatedSets
        });
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm font-bold text-sm",
                        session.category === 'weight' ? "bg-green-500" :
                            session.category === 'cardio' ? "bg-blue-500" :
                                session.category === 'sport' ? "bg-orange-500" : "bg-purple-500"
                    )}>
                        {index + 1}
                    </div>
                    <div>
                        <h4 className="font-bold text-lg leading-none">{session.type}</h4>
                        <span className="text-xs text-muted-foreground">
                            {session.category === 'weight' && '웨이트 트레이닝'}
                            {session.category === 'cardio' && '유산소'}
                            {session.category === 'sport' && '스포츠'}
                            {session.category === 'fitness' && '피트니스'}
                        </span>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onDelete(session.id)} className="text-muted-foreground hover:text-red-500 h-8 w-8 p-0">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            {/* Content based on Category */}
            {session.category === 'weight' && (
                <div className="space-y-4 pl-11">
                    {/* Input Row */}
                    <div className="flex items-end gap-2 p-3 bg-muted/20 rounded-lg">
                        <div className="grid gap-1 flex-1">
                            <Label className="text-[10px] text-muted-foreground">무게 (kg)</Label>
                            <Input
                                type="number"
                                value={weight}
                                onChange={e => setWeight(e.target.value)}
                                className="h-8 text-sm"
                                placeholder="0"
                            />
                        </div>
                        <div className="grid gap-1 flex-1">
                            <Label className="text-[10px] text-muted-foreground">횟수</Label>
                            <Input
                                type="number"
                                value={reps}
                                onChange={e => setReps(e.target.value)}
                                className="h-8 text-sm"
                                placeholder="0"
                                onKeyDown={e => e.key === 'Enter' && handleAddSet()}
                            />
                        </div>
                        <Button onClick={handleAddSet} size="sm" className="h-8 w-8 p-0 shrink-0 bg-green-600 hover:bg-green-700">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Sets List */}
                    {session.sets && session.sets.length > 0 && (
                        <div className="space-y-1">
                            {session.sets.map((set) => (
                                <div key={set.id} className="flex justify-between items-center text-sm p-2 hover:bg-muted/10 rounded-md border border-transparent hover:border-border transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs text-muted-foreground w-6 text-center bg-muted/30 rounded py-0.5">#{set.setNumber}</span>
                                        <span className="font-bold">{set.weight}kg</span>
                                        <span className="text-muted-foreground">x</span>
                                        <span>{set.reps}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-300 hover:text-red-500"
                                        onClick={() => handleDeleteSet(set.id)}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                            <div className="pt-2 text-right text-xs font-medium text-green-600 border-t mt-2">
                                Total Volume: {session.sets.reduce((acc, curr) => acc + (curr.weight * curr.reps), 0).toLocaleString()} kg
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Non-Weight content (static info for now, maybe allow editing later) */}
            {session.category !== 'weight' && (
                <div className="pl-11 text-sm text-muted-foreground">
                    {session.category === 'cardio' && (
                        <span>
                            {session.distance ? `${session.distance} km` : ''}
                            {session.distance && session.duration ? ' · ' : ''}
                            {session.duration ? `${Math.floor(session.duration)}분` : ''}
                            {session.count ? ` · ${session.count} laps` : ''}
                        </span>
                    )}
                    {session.category === 'fitness' && (
                        <span>{Math.floor(session.duration || 0)} 분 진행</span>
                    )}
                    {session.category === 'sport' && (
                        <span>
                            {Math.floor(session.duration || 0)}분
                            {session.score && ` · ${session.score}점`}
                            {session.result && ` · ${session.result}`}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

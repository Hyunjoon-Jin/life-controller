'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/context/DataProvider';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Utensils, Plus, Trash2, Camera, Flame, Edit2, X, ChevronDown,
    ChevronRight, Activity, Coffee, Sun, Moon, Sparkles, Scale, Info, Clock, ArrowRight
} from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { DietEntry, DietItem } from '@/types';
import { FoodSearchDialog } from './FoodSearchDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DietAnalysis } from './DietAnalysis';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export function DietLog() {
    const { dietEntries = [], addDietEntry, deleteDietEntry, updateDietEntry, inBodyEntries = [], exerciseSessions = [] } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [date, setDate] = useState<Date>(new Date());
    const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
    const [items, setItems] = useState<DietItem[]>([]);
    const [imageUrl, setImageUrl] = useState('');
    const [memo, setMemo] = useState('');

    const [tempName, setTempName] = useState('');
    const [tempCal, setTempCal] = useState('');
    const [tempCarbs, setTempCarbs] = useState('');
    const [tempProtein, setTempProtein] = useState('');
    const [tempFat, setTempFat] = useState('');

    const mealHistory = useMemo(() => {
        const history: Record<string, DietItem> = {};
        dietEntries.forEach(entry => {
            entry.items?.forEach(item => {
                if (!history[item.name]) history[item.name] = item;
            });
        });
        return Object.values(history).sort((a, b) => a.name.localeCompare(b.name));
    }, [dietEntries]);

    const suggestions = useMemo(() => {
        if (!tempName || tempName.length < 1) return [];
        return mealHistory.filter(h => h.name.toLowerCase().includes(tempName.toLowerCase())).slice(0, 5);
    }, [mealHistory, tempName]);

    const handleAddItem = () => {
        if (!tempName) return;
        const newItem: DietItem = {
            id: generateId(),
            name: tempName,
            calories: parseFloat(tempCal) || 0,
            macros: {
                carbs: parseFloat(tempCarbs) || 0,
                protein: parseFloat(tempProtein) || 0,
                fat: parseFloat(tempFat) || 0,
            }
        };
        setItems([...items, newItem]);
        resetTempInput();
    };

    const resetTempInput = () => {
        setTempName(''); setTempCal(''); setTempCarbs(''); setTempProtein(''); setTempFat('');
    };

    const handleRemoveItem = (itemId: string) => {
        setItems(items.filter(i => i.id !== itemId));
    };

    const handleSave = () => {
        if (items.length === 0) return;
        const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);
        const totalMacros = items.reduce((acc, item) => ({
            carbs: acc.carbs + item.macros.carbs,
            protein: acc.protein + item.macros.protein,
            fat: acc.fat + item.macros.fat,
        }), { carbs: 0, protein: 0, fat: 0 });

        const entry: DietEntry = {
            id: editingId || generateId(),
            date: date,
            mealType,
            items,
            totalCalories,
            totalMacros,
            image: imageUrl,
            memo
        };

        if (editingId && updateDietEntry) updateDietEntry(entry);
        else addDietEntry(entry);

        setIsDialogOpen(false);
        resetForm();
    };

    const handleEdit = (entry: DietEntry) => {
        setEditingId(entry.id);
        setDate(new Date(entry.date));
        setMealType(entry.mealType);
        setItems(entry.items || []);
        setImageUrl(entry.image || '');
        setMemo(entry.memo || '');
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingId(null); setDate(new Date()); setMealType('breakfast'); setItems([]); setImageUrl(''); setMemo(''); resetTempInput();
    };

    const handleFoodSelect = (food: any) => {
        const newItem: DietItem = {
            id: generateId(),
            name: food.name,
            calories: food.calories || 0,
            macros: {
                carbs: food.macros.carbs || 0,
                protein: food.macros.protein || 0,
                fat: food.macros.fat || 0,
            }
        };
        setItems(prev => [...prev, newItem]);
        if (food.image && !imageUrl) setImageUrl(food.image);
        setIsSearchOpen(false);
    };

    const mealMeta = {
        breakfast: { label: 'SUNRISE FUEL', icon: Coffee, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        lunch: { label: 'CORE INTAKE', icon: Sun, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        dinner: { label: 'NOCTURNAL RESTORE', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
        snack: { label: 'SUPPLEMENTAL', icon: Sparkles, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' }
    };

    const [activeTab, setActiveTab] = useState("log");

    const groupedEntries = useMemo(() => {
        const groups: Record<string, DietEntry[]> = {};
        (dietEntries || []).forEach(entry => {
            const dateKey = format(new Date(entry.date), 'yyyy-MM-dd');
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(entry);
        });
        return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
    }, [dietEntries]);

    return (
        <div className="h-full flex flex-col glass-premium rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/[0.02] via-transparent to-amber-500/[0.02] pointer-events-none" />

            {/* Header Area */}
            <div className="p-8 pb-4 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(16,185,129,0.5)]">
                            <Utensils className="w-6 h-6 text-white" strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">NUTRITIONAL CORE</h2>
                            <p className="text-[10px] font-bold text-white/20 tracking-[0.3em] uppercase mt-2 italic flex items-center gap-2">
                                <Scale className="w-3 h-3" /> METABOLIC STATUS: SYNCHRONIZED
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-md">
                            <TabsList className="bg-transparent border-none p-0 flex h-auto">
                                <TabsTrigger value="log" className="px-6 py-2.5 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all data-[state=active]:bg-emerald-500 data-[state=active]:text-white">JOURNAL</TabsTrigger>
                                <TabsTrigger value="analysis" className="px-6 py-2.5 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all data-[state=active]:bg-emerald-500 data-[state=active]:text-white">ANALYSIS</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <Button
                            onClick={() => { resetForm(); setIsDialogOpen(true); }}
                            className="h-12 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] tracking-widest uppercase shadow-xl transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4 mr-2" strokeWidth={3} /> INITIALIZE LOG
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden p-8 pt-0 relative z-10">
                <AnimatePresence mode="wait">
                    {activeTab === 'log' && (
                        <motion.div
                            key="log"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="h-full overflow-y-auto custom-scrollbar pr-2 space-y-12"
                        >
                            {groupedEntries.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-10 gap-6 py-32">
                                    <Utensils className="w-20 h-20" />
                                    <p className="text-[10px] font-black tracking-[0.4em] uppercase">SYSTEM AWAITING NUTRITIONAL DATA</p>
                                </div>
                            ) : (
                                groupedEntries.map(([dateKey, entries]) => {
                                    const order = { 'breakfast': 0, 'lunch': 1, 'dinner': 2, 'snack': 3 };
                                    const sortedDayEntries = entries.sort((a, b) => (order[a.mealType] || 0) - (order[b.mealType] || 0));
                                    const dayCalories = entries.reduce((acc, e) => acc + (e.totalCalories || 0), 0);

                                    return (
                                        <div key={dateKey} className="space-y-6">
                                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-3xl font-black text-white/10 italic tracking-tighter">{format(parseISO(dateKey), 'MM.dd')}</div>
                                                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{format(parseISO(dateKey), 'EEEE', { locale: ko })}</div>
                                                </div>
                                                <div className="flex items-end gap-2">
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">AGGREGATE</span>
                                                    <span className="text-2xl font-black text-rose-500 tracking-tighter">{Math.round(dayCalories)} <small className="text-[10px] opacity-40">KCAL</small></span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                                {sortedDayEntries.map(entry => {
                                                    const meta = mealMeta[entry.mealType] || mealMeta.snack;
                                                    return (
                                                        <motion.div
                                                            key={entry.id}
                                                            whileHover={{ y: -5 }}
                                                            className="group glass-premium rounded-[40px] border border-white/5 overflow-hidden shadow-xl flex flex-col bg-white/[0.02]"
                                                        >
                                                            {entry.image ? (
                                                                <div className="h-48 relative overflow-hidden">
                                                                    <Image src={entry.image} alt="Meal" fill className="object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                                                    <div className="absolute bottom-6 left-8 flex items-center gap-3">
                                                                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20", meta.bg)}>
                                                                            <meta.icon className={cn("w-4 h-4", meta.color)} />
                                                                        </div>
                                                                        <span className="text-[10px] font-black text-white tracking-widest uppercase">{meta.label}</span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="h-32 p-8 flex items-center justify-between border-b border-white/5">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", meta.bg)}>
                                                                            <meta.icon className={cn("w-5 h-5", meta.color)} />
                                                                        </div>
                                                                        <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">{meta.label}</span>
                                                                    </div>
                                                                    <div className="text-xl font-black text-rose-500 tracking-tighter">{Math.round(entry.totalCalories || 0)} <small className="text-[9px]">KCAL</small></div>
                                                                </div>
                                                            )}

                                                            <div className="p-8 flex-1 flex flex-col">
                                                                <div className="flex justify-between items-start mb-6">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">{format(new Date(entry.date), 'HH:mm')} PROTOCOL</span>
                                                                        {entry.items?.map((item, idx) => (
                                                                            <div key={idx} className="text-lg font-black text-white tracking-tighter uppercase">{item.name}</div>
                                                                        ))}
                                                                    </div>
                                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button onClick={() => handleEdit(entry)} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/20 hover:bg-emerald-500 hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
                                                                        <button onClick={() => deleteDietEntry(entry.id)} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/20 hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                                                                    </div>
                                                                </div>

                                                                {entry.totalMacros && (
                                                                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                                                        <div className="flex gap-4">
                                                                            <div className="flex flex-col">
                                                                                <span className="text-[8px] font-black text-white/10 uppercase mb-0.5">CARBS</span>
                                                                                <span className="text-xs font-black text-sky-400">{Math.round(entry.totalMacros.carbs)}G</span>
                                                                            </div>
                                                                            <div className="flex flex-col">
                                                                                <span className="text-[8px] font-black text-white/10 uppercase mb-0.5">PROT</span>
                                                                                <span className="text-xs font-black text-rose-400">{Math.round(entry.totalMacros.protein)}G</span>
                                                                            </div>
                                                                            <div className="flex flex-col">
                                                                                <span className="text-[8px] font-black text-white/10 uppercase mb-0.5">LIPID</span>
                                                                                <span className="text-xs font-black text-amber-400">{Math.round(entry.totalMacros.fat)}G</span>
                                                                            </div>
                                                                        </div>
                                                                        {entry.image && (
                                                                            <div className="text-2xl font-black text-rose-500 tracking-tighter">{Math.round(entry.totalCalories || 0)} <small className="text-[9px]">KCAL</small></div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {entry.memo && (
                                                                    <p className="mt-4 text-[10px] font-bold text-white/20 italic border-l-2 border-emerald-500/20 pl-4">{entry.memo}</p>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'analysis' && (
                        <motion.div
                            key="analysis"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="h-full overflow-y-auto custom-scrollbar"
                        >
                            <DietAnalysis entries={dietEntries} inBodyEntries={inBodyEntries} exerciseSessions={exerciseSessions} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Redesigned Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass-premium border border-white/10 text-white rounded-[40px] p-0 shadow-2xl sm:max-w-[600px] overflow-hidden">
                    <DialogHeader className="p-10 pb-0">
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase mb-2">
                            {editingId ? 'RECONSTRUCT LOG' : 'INITIALIZE INTAKE'}
                        </DialogTitle>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] italic">SPECIFY INPUT PARAMETERS FOR NUTRITIONAL ANALYSIS</p>
                    </DialogHeader>

                    <div className="p-10 space-y-10">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest">TEMPORAL TIMESTAMP</Label>
                                <Input
                                    type="datetime-local"
                                    value={date ? format(date, "yyyy-MM-dd'T'HH:mm") : ''}
                                    onChange={e => setDate(new Date(e.target.value))}
                                    className="h-14 font-black text-sm bg-white/5 border-white/5 rounded-2xl text-white focus:ring-emerald-500/30"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest">PHASE CLASSIFICATION</Label>
                                <Select value={mealType} onValueChange={(v) => setMealType(v as any)}>
                                    <SelectTrigger className="h-14 font-black text-[10px] tracking-widest uppercase bg-white/5 border-white/5 rounded-2xl text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="glass-premium border-white/10 text-white p-2 rounded-2xl">
                                        {Object.entries(mealMeta).map(([val, meta]) => (
                                            <SelectItem key={val} value={val} className="rounded-xl font-black text-[10px] tracking-widest uppercase py-4">
                                                <div className="flex items-center gap-3">
                                                    <meta.icon className={cn("w-4 h-4", meta.color)} />
                                                    {meta.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Items Section */}
                        <div className="bg-white/5 rounded-[32px] border border-white/5 p-8 space-y-8">
                            <div className="flex justify-between items-center">
                                <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest">NUTRITIONAL ENTITIES ({items.length})</Label>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsSearchOpen(true)}
                                    className="h-9 px-4 rounded-xl border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-black text-[9px] tracking-widest uppercase hover:bg-emerald-500/20"
                                >
                                    <Sparkles className="w-3.5 h-3.5 mr-2" /> SCAN DATABASE
                                </Button>
                            </div>

                            <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                                {items.map((item, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={item.id}
                                        className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 shadow-inner group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-black text-white uppercase tracking-tighter truncate">{item.name}</div>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-[9px] font-black text-rose-500 uppercase">{Math.round(item.calories)} KCAL</span>
                                                <div className="flex gap-2 text-[8px] font-black text-white/20 uppercase">
                                                    <span>C:{Math.round(item.macros.carbs)}G</span>
                                                    <span>P:{Math.round(item.macros.protein)}G</span>
                                                    <span>F:{Math.round(item.macros.fat)}G</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleRemoveItem(item.id)} className="w-8 h-8 rounded-lg bg-white/5 text-white/10 opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all transform hover:rotate-12">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                                {items.length === 0 && (
                                    <div className="py-12 text-center opacity-10 font-black text-[9px] tracking-[0.3em] uppercase border-2 border-dashed border-white/5 rounded-2xl">AWAITING INPUT...</div>
                                )}
                            </div>

                            {/* Quick Add */}
                            <div className="pt-8 border-t border-white/5 space-y-4">
                                <div className="flex gap-3 relative">
                                    <div className="flex-[3] relative">
                                        <Input
                                            placeholder="ENTITY NAME"
                                            value={tempName}
                                            onChange={e => setTempName(e.target.value)}
                                            className="h-12 bg-white/5 border-white/5 rounded-xl font-black text-xs uppercase"
                                        />
                                        {suggestions.length > 0 && (
                                            <div className="absolute top-full left-0 w-full glass-premium border border-white/10 rounded-xl shadow-2xl z-50 mt-2 p-2 max-h-48 overflow-y-auto">
                                                {suggestions.map((s, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-3 hover:bg-white/10 cursor-pointer rounded-lg border-b border-white/5 last:border-0"
                                                        onClick={() => {
                                                            setTempName(s.name); setTempCal(s.calories.toString()); setTempCarbs(s.macros.carbs.toString());
                                                            setTempProtein(s.macros.protein.toString()); setTempFat(s.macros.fat.toString());
                                                        }}
                                                    >
                                                        <div className="font-black text-[10px] text-white uppercase tracking-widest">{s.name}</div>
                                                        <div className="text-[8px] font-black text-emerald-500 uppercase mt-1">{Math.round(s.calories)} kcal</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <Input
                                        placeholder="KCAL"
                                        type="number"
                                        value={tempCal}
                                        onChange={e => setTempCal(e.target.value)}
                                        className="flex-1 h-12 bg-white/5 border-white/5 rounded-xl text-center font-black text-xs"
                                    />
                                    <Button onClick={handleAddItem} disabled={!tempName} className="w-12 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 shadow-xl shrink-0 transition-all">
                                        <Plus className="w-5 h-5 text-white" strokeWidth={3} />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-[7px] font-black text-white/20 uppercase tracking-widest ml-2">CARBS (G)</Label>
                                        <Input type="number" placeholder="0" className="h-10 bg-white/5 border-white/5 rounded-xl text-center font-black text-xs" value={tempCarbs} onChange={e => setTempCarbs(e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[7px] font-black text-white/20 uppercase tracking-widest ml-2">PROT (G)</Label>
                                        <Input type="number" placeholder="0" className="h-10 bg-white/5 border-white/5 rounded-xl text-center font-black text-xs" value={tempProtein} onChange={e => setTempProtein(e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[7px] font-black text-white/20 uppercase tracking-widest ml-2">LIPID (G)</Label>
                                        <Input type="number" placeholder="0" className="h-10 bg-white/5 border-white/5 rounded-xl text-center font-black text-xs" value={tempFat} onChange={e => setTempFat(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest">VISUAL RECORD (URL)</Label>
                                <div className="relative">
                                    <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <Input
                                        className="pl-12 h-14 bg-white/5 border-white/5 rounded-2xl font-bold text-xs"
                                        placeholder="COPY IMAGE ENDPOINT..."
                                        value={imageUrl}
                                        onChange={e => setImageUrl(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest">PERFORMANCE NOTES</Label>
                                <Input
                                    className="h-14 bg-white/5 border-white/5 rounded-2xl font-bold text-xs"
                                    placeholder="ENTER MISSION MEMO..."
                                    value={memo}
                                    onChange={e => setMemo(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-10 border-t border-white/5 items-center">
                            <div className="flex-1 flex items-end gap-2">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1.5">CUMULATIVE LOAD</span>
                                <span className="text-3xl font-black text-rose-500 tracking-tighter">
                                    {items.reduce((acc, i) => acc + i.calories, 0)}
                                    <small className="text-[11px] ml-1 opacity-40 uppercase">kcal</small>
                                </span>
                            </div>
                            <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 text-white/40 font-black text-[10px] tracking-widest uppercase hover:text-white" onClick={() => setIsDialogOpen(false)}>CANCEL</Button>
                            <Button
                                onClick={handleSave}
                                disabled={items.length === 0}
                                className="h-14 px-10 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm tracking-widest uppercase shadow-xl"
                            >
                                COMMIT LOG
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <FoodSearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} onSelect={handleFoodSelect} />
        </div>
    );
}

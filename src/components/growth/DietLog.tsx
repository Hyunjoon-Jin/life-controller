'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/context/DataProvider';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Utensils, Plus, Trash2, Camera, Flame, Edit2, X, ChevronDown, ChevronRight } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { DietEntry, DietItem } from '@/types';

import { FoodSearchDialog } from './FoodSearchDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DietAnalysis } from './DietAnalysis';
export function DietLog() {
    const { dietEntries = [], addDietEntry, deleteDietEntry, updateDietEntry } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Edit Mode
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [date, setDate] = useState<Date>(new Date());
    const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
    const [items, setItems] = useState<DietItem[]>([]);
    const [imageUrl, setImageUrl] = useState('');
    const [memo, setMemo] = useState('');

    // Manual Input State (Temp)
    const [tempName, setTempName] = useState('');
    const [tempCal, setTempCal] = useState('');
    const [tempCarbs, setTempCarbs] = useState('');
    const [tempProtein, setTempProtein] = useState('');
    const [tempFat, setTempFat] = useState('');

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
        setTempName('');
        setTempCal('');
        setTempCarbs('');
        setTempProtein('');
        setTempFat('');
    };

    const handleRemoveItem = (itemId: string) => {
        setItems(items.filter(i => i.id !== itemId));
    };

    const handleSave = () => {
        if (items.length === 0) return;

        // Calculate Totals
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

        if (editingId && updateDietEntry) {
            updateDietEntry(entry);
        } else {
            addDietEntry(entry);
        }

        setIsDialogOpen(false);
        resetForm();
    };

    const handleEdit = (entry: DietEntry) => {
        setEditingId(entry.id);
        setDate(new Date(entry.date));
        setMealType(entry.mealType);

        // Items Migration for Legacy Data
        if (entry.items && entry.items.length > 0) {
            setItems(entry.items);
        } else if ((entry as any).menu) {
            // Convert legacy single-menu to item
            setItems([{
                id: generateId(),
                name: (entry as any).menu,
                calories: (entry as any).calories || entry.totalCalories || 0,
                macros: (entry as any).macros || entry.totalMacros || { carbs: 0, protein: 0, fat: 0 }
            }]);
        } else {
            setItems([]);
        }

        setImageUrl(entry.image || '');
        setMemo(entry.memo || '');
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setDate(new Date());
        setMealType('breakfast');
        setItems([]);
        setImageUrl('');
        setMemo('');
        resetTempInput();
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
        // If image is selected and we don't have one yet, use it? 
        // Or maybe let user decide. Let's auto-set if empty.
        if (food.image && !imageUrl) {
            setImageUrl(food.image);
        }
        setIsSearchOpen(false);
    };

    const mealTypeLabels: Record<string, string> = {
        breakfast: '아침',
        lunch: '점심',
        dinner: '저녁',
        snack: '간식'
    };

    const mealTypeColors: Record<string, string> = {
        breakfast: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        lunch: 'bg-orange-50 text-orange-700 border-orange-200',
        dinner: 'bg-blue-50 text-blue-700 border-blue-200',
        snack: 'bg-green-50 text-green-700 border-green-200'
    };

    // Group by Date
    const groupedEntries = useMemo(() => {
        const groups: Record<string, DietEntry[]> = {};
        (dietEntries || []).forEach(entry => {
            const dateKey = format(new Date(entry.date), 'yyyy-MM-dd');
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(entry);
        });

        // Sort dates desc
        return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
    }, [dietEntries]);

    return (
        <div className="h-full flex flex-col p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <Tabs defaultValue="log" className="w-[300px]">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="log">기록</TabsTrigger>
                        <TabsTrigger value="analysis">상세 분석</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> 식사 기록하기
                </Button>
            </div>

            <Tabs defaultValue="log" className="flex-1 overflow-hidden flex flex-col">
                <TabsContent value="log" className="flex-1 overflow-y-auto custom-scrollbar space-y-8 mt-0">
                    <div className="flex items-center gap-2 mb-4">
                        <Utensils className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold">식단 기록</h2>
                    </div>

                    {/* Daily View List */}
                    {groupedEntries.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50 min-h-[200px]">
                            <Utensils className="w-16 h-16 mb-4" />
                            <p>오늘의 식단을 기록해보세요.</p>
                        </div>
                    ) : (
                        <div className="space-y-8 pb-4">
                            {groupedEntries.map(([dateKey, entries]) => {
                                // Sort entries by meal type order? (Breakfast -> Lunch -> Dinner -> Snack)
                                const order = { 'breakfast': 0, 'lunch': 1, 'dinner': 2, 'snack': 3 };
                                const sortedDayEntries = entries.sort((a, b) => (order[a.mealType] || 0) - (order[b.mealType] || 0));

                                return (
                                    <div key={dateKey} className="animate-in fade-in slide-in-from-bottom-2">
                                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-slate-700 border-b pb-2">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-sm font-mono text-slate-500">
                                                {format(parseISO(dateKey), 'MM.dd')}
                                            </span>
                                            <span>{format(parseISO(dateKey), 'EEEE', { locale: ko })}</span>
                                        </h3>

                                        <div className="grid grid-cols-1 gap-4">
                                            {sortedDayEntries.map(entry => {
                                                // Legacy Support for Display
                                                const displayItems = (entry.items && entry.items.length > 0)
                                                    ? entry.items
                                                    : (entry as any).menu
                                                        ? [{
                                                            id: 'legacy',
                                                            name: (entry as any).menu,
                                                            calories: (entry as any).calories || entry.totalCalories || 0,
                                                            macros: (entry as any).macros || entry.totalMacros || { carbs: 0, protein: 0, fat: 0 }
                                                        } as DietItem]
                                                        : [];

                                                return (
                                                    <Card key={entry.id} className="overflow-hidden hover:shadow-md transition-shadow group border-l-4" style={{ borderLeftColor: entry.mealType === 'breakfast' ? '#fde047' : entry.mealType === 'lunch' ? '#fdba74' : entry.mealType === 'dinner' ? '#93c5fd' : '#86efac' }}>
                                                        <CardContent className="p-0 flex flex-col sm:flex-row">
                                                            {/* Image Section */}
                                                            {entry.image && (
                                                                <div className="sm:w-[150px] w-full h-32 sm:h-auto shrink-0 relative">
                                                                    <img src={entry.image} alt="Meal" className="w-full h-full object-cover" />
                                                                </div>
                                                            )}

                                                            {/* Details Section */}
                                                            <div className="flex-1 p-4">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={cn("text-xs font-bold px-2 py-1 rounded border", mealTypeColors[entry.mealType])}>
                                                                            {mealTypeLabels[entry.mealType]}
                                                                        </span>
                                                                        <span className="text-sm font-medium text-slate-500">
                                                                            {format(new Date(entry.date), 'HH:mm')}
                                                                        </span>

                                                                        <div className="flex items-center text-xs font-bold text-red-500 ml-2">
                                                                            <Flame className="w-3 h-3 mr-0.5" />
                                                                            {Math.round(entry.totalCalories || (entry as any).calories || 0)} kcal
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleEdit(entry)}>
                                                                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                                                        </Button>
                                                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-red-500" onClick={() => deleteDietEntry(entry.id)}>
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                {/* Items List */}
                                                                <div className="space-y-1 mb-3">
                                                                    {displayItems.map((item, idx) => (
                                                                        <div key={idx} className="flex justify-between text-sm py-0.5 border-b border-dashed last:border-0 border-slate-100">
                                                                            <span className="font-medium text-slate-700">{item.name}</span>
                                                                            <span className="text-slate-400 text-xs">{Math.round(item.calories)} kcal</span>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {/* Macros Summary (Total) */}
                                                                {((entry.totalMacros || (entry as any).macros) && ((entry.totalMacros?.carbs || (entry as any).macros?.carbs) > 0)) && (
                                                                    <div className="flex gap-3 text-xs text-muted-foreground bg-slate-50 p-2 rounded-lg inline-block">
                                                                        <span className="mr-2 font-bold text-slate-500">Total</span>
                                                                        <span className="text-blue-600">C: {Math.round(entry.totalMacros?.carbs || (entry as any).macros?.carbs || 0)}g</span>
                                                                        <span className="text-red-600">P: {Math.round(entry.totalMacros?.protein || (entry as any).macros?.protein || 0)}g</span>
                                                                        <span className="text-yellow-600">F: {Math.round(entry.totalMacros?.fat || (entry as any).macros?.fat || 0)}g</span>
                                                                    </div>
                                                                )}

                                                                {entry.memo && (
                                                                    <p className="text-xs text-muted-foreground mt-2 bg-yellow-50/50 p-1.5 rounded">
                                                                        {entry.memo}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="analysis" className="flex-1 overflow-y-auto custom-scrollbar mt-0">
                    <DietAnalysis entries={dietEntries} />
                </TabsContent>
            </Tabs>

            {/* Food Search Dialog */}
            <FoodSearchDialog
                open={isSearchOpen}
                onOpenChange={setIsSearchOpen}
                onSelect={handleFoodSelect}
            />

            {/* Entry Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto custom-scrollbar">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "식단 수정" : "식단 기록"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>시간 & 종류</Label>
                            <div className="flex gap-2 mb-2">
                                <Input
                                    type="datetime-local"
                                    value={date ? format(date, "yyyy-MM-dd'T'HH:mm") : ''}
                                    onChange={e => setDate(new Date(e.target.value))}
                                    className="flex-[2]"
                                />
                                <select
                                    className="flex-1 border rounded-md px-2 text-sm bg-background"
                                    value={mealType}
                                    onChange={(e) => setMealType(e.target.value as any)}
                                >
                                    <option value="breakfast">아침</option>
                                    <option value="lunch">점심</option>
                                    <option value="dinner">저녁</option>
                                    <option value="snack">간식</option>
                                </select>
                            </div>
                        </div>

                        {/* Items Section */}
                        <div className="space-y-2 border rounded-lg p-3 bg-muted/10">
                            <div className="flex justify-between items-center mb-1">
                                <Label className="text-sm font-bold">식단 메뉴 목록 ({items.length})</Label>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs bg-blue-50 text-blue-600 border-blue-200"
                                    onClick={() => setIsSearchOpen(true)}
                                >
                                    <Utensils className="w-3 h-3 mr-1" /> 메뉴 검색
                                </Button>
                            </div>

                            {/* Added Items List */}
                            {items.length > 0 ? (
                                <ul className="space-y-2 mb-3">
                                    {items.map((item, idx) => (
                                        <li key={idx} className="flex justify-between items-center bg-white p-2 rounded border shadow-sm text-sm animate-in slide-in-from-top-1">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold truncate">{item.name}</div>
                                                <div className="text-[10px] text-muted-foreground flex gap-2">
                                                    <span className="text-red-500">{Math.round(item.calories)} kcal</span>
                                                    <span>C:{Math.round(item.macros.carbs)} P:{Math.round(item.macros.protein)} F:{Math.round(item.macros.fat)}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => handleRemoveItem(item.id)} className="text-slate-400 hover:text-red-500 ml-2">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-4 text-xs text-muted-foreground bg-white border border-dashed rounded">
                                    메뉴를 추가해주세요.
                                </div>
                            )}

                            {/* Manual Add Form */}
                            <div className="pt-2 border-t mt-2">
                                <div className="text-xs font-semibold mb-2 text-muted-foreground">직접 입력 추가</div>
                                <div className="flex gap-2 mb-2">
                                    <Input
                                        placeholder="음식명"
                                        className="flex-[2] h-8 text-sm"
                                        value={tempName} onChange={e => setTempName(e.target.value)}
                                    />
                                    <div className="relative flex-1">
                                        <Input
                                            placeholder="kcal"
                                            type="number"
                                            className="h-8 text-sm pr-6"
                                            value={tempCal} onChange={e => setTempCal(e.target.value)}
                                        />
                                    </div>
                                    <Button size="sm" className="h-8 w-8 p-0 shrink-0" onClick={handleAddItem} disabled={!tempName}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <Input placeholder="탄(g)" type="number" className="h-7 text-xs" value={tempCarbs} onChange={e => setTempCarbs(e.target.value)} />
                                    <Input placeholder="단(g)" type="number" className="h-7 text-xs" value={tempProtein} onChange={e => setTempProtein(e.target.value)} />
                                    <Input placeholder="지(g)" type="number" className="h-7 text-xs" value={tempFat} onChange={e => setTempFat(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>음식 사진 URL</Label>
                            <div className="relative">
                                <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    placeholder="이미지 주소 붙여넣기..."
                                    value={imageUrl}
                                    onChange={e => setImageUrl(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>메모</Label>
                            <Input
                                placeholder="식사 메모..."
                                value={memo}
                                onChange={e => setMemo(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <div className="flex justify-between items-center w-full">
                            <div className="text-xs text-muted-foreground">
                                Total: <span className="font-bold text-red-500">{items.reduce((acc, i) => acc + i.calories, 0)} kcal</span>
                            </div>
                            <Button onClick={handleSave} disabled={items.length === 0}>
                                {editingId ? "수정 완료" : "기록 저장"}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


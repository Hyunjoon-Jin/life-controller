'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Loader2, Plus, Utensils, Save } from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import { CustomFood } from '@/types';
import { useData } from '@/context/DataProvider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'; // Optional if using tabs

interface FoodSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (item: CustomFood) => void;
}

// Convert legacy FoodItem based popular foods to CustomFood format
const POPULAR_FOODS: CustomFood[] = [
    { id: 'pop-1', name: '쌀밥 (공기밥)', brand: '일반', calories: 300, macros: { carbs: 65, protein: 6, fat: 0.5 }, servingSize: '1공기', isCustom: false },
    { id: 'pop-2', name: '현미밥', brand: '일반', calories: 290, macros: { carbs: 60, protein: 7, fat: 1 }, servingSize: '1공기', isCustom: false },
    { id: 'pop-3', name: '닭가슴살', brand: '일반', calories: 109, macros: { carbs: 0, protein: 23, fat: 1.2 }, servingSize: '100g', isCustom: false },
    { id: 'pop-4', name: '삶은 달걀', brand: '일반', calories: 77, macros: { carbs: 0.6, protein: 6.3, fat: 5.3 }, servingSize: '1개', isCustom: false },
    { id: 'pop-5', name: '단백질 쉐이크', brand: '보충제', calories: 120, macros: { carbs: 5, protein: 20, fat: 1 }, servingSize: '1스쿱', isCustom: false },
    { id: 'pop-6', name: '김치찌개', brand: '한식', calories: 250, macros: { carbs: 15, protein: 15, fat: 15 }, servingSize: '1인분', isCustom: false },
    { id: 'pop-7', name: '된장찌개', brand: '한식', calories: 180, macros: { carbs: 10, protein: 12, fat: 10 }, servingSize: '1인분', isCustom: false },
    { id: 'pop-8', name: '비빔밥', brand: '한식', calories: 550, macros: { carbs: 80, protein: 15, fat: 15 }, servingSize: '1인분', isCustom: false },
    { id: 'pop-9', name: '김밥', brand: '분식', calories: 350, macros: { carbs: 50, protein: 10, fat: 10 }, servingSize: '1줄', isCustom: false },
    { id: 'pop-10', name: '라면', brand: '분식', calories: 500, macros: { carbs: 75, protein: 10, fat: 16 }, servingSize: '1개', isCustom: false },
    { id: 'pop-11', name: '떡볶이', brand: '분식', calories: 600, macros: { carbs: 100, protein: 10, fat: 10 }, servingSize: '1인분', isCustom: false },
    { id: 'pop-12', name: '제육볶음', brand: '한식', calories: 400, macros: { carbs: 15, protein: 25, fat: 25 }, servingSize: '1인분', isCustom: false },
    { id: 'pop-13', name: '삼겹살', brand: '구이', calories: 660, macros: { carbs: 0, protein: 20, fat: 60 }, servingSize: '200g', isCustom: false },
    { id: 'pop-14', name: '아메리카노', brand: '카페', calories: 5, macros: { carbs: 1, protein: 0, fat: 0 }, servingSize: '1잔', isCustom: false },
    { id: 'pop-15', name: '바나나', brand: '과일', calories: 90, macros: { carbs: 23, protein: 1, fat: 0.3 }, servingSize: '1개', isCustom: false },
    { id: 'pop-16', name: '사과', brand: '과일', calories: 52, macros: { carbs: 14, protein: 0.3, fat: 0.2 }, servingSize: '100g', isCustom: false },
];

export function FoodSearchDialog({ open, onOpenChange, onSelect }: FoodSearchDialogProps) {
    const { customFoods, addCustomFood } = useData();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<CustomFood[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [mode, setMode] = useState<'search' | 'create'>('search');

    // Create Form State
    const [newFood, setNewFood] = useState({
        name: '',
        brand: '',
        servingSize: '',
        calories: '',
        carbs: '',
        protein: '',
        fat: ''
    });

    const handleSearch = async () => {
        setIsLoading(true);
        setSearched(true);
        try {
            // 1. Search Custom Foods Local
            const localResults = customFoods.filter(f =>
                f.name.toLowerCase().includes(query.toLowerCase()) ||
                f.brand?.toLowerCase().includes(query.toLowerCase())
            );

            // 2. API Search (Mock or Real)
            let apiResults: CustomFood[] = [];
            if (query.trim()) {
                try {
                    const res = await fetch(`/api/food/search?q=${encodeURIComponent(query)}`);
                    const data = await res.json();
                    if (data.items) {
                        apiResults = data.items.map((item: any, idx: number) => ({
                            id: `api-${idx}`,
                            name: item.name,
                            brand: item.brand,
                            calories: item.calories,
                            macros: item.macros,
                            servingSize: item.servingSize,
                            isCustom: false
                        }));
                    }
                } catch (e) {
                    console.log('API search failed, falling back to local only');
                }
            }

            setResults([...localResults, ...apiResults]);

        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleCreate = () => {
        if (!newFood.name || !newFood.calories) return;

        const food: CustomFood = {
            id: generateId(),
            name: newFood.name,
            brand: newFood.brand,
            servingSize: newFood.servingSize || '1회',
            calories: Number(newFood.calories),
            macros: {
                carbs: Number(newFood.carbs) || 0,
                protein: Number(newFood.protein) || 0,
                fat: Number(newFood.fat) || 0
            },
            isCustom: true
        };

        addCustomFood(food);
        onSelect(food);
        // Reset and close (handled by onSelect mostly, but if we want to just add to DB)
        // Usually onSelect selects it for the meal.
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col p-0">
                <DialogHeader className="p-4 pb-2 border-b">
                    <div className="flex items-center justify-between">
                        <DialogTitle>식단 검색 & 추가</DialogTitle>
                        <div className="flex gap-2">
                            <Button
                                variant={mode === 'search' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setMode('search')}
                            >
                                <Search className="w-4 h-4 mr-2" /> 검색
                            </Button>
                            <Button
                                variant={mode === 'create' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setMode('create')}
                            >
                                <Plus className="w-4 h-4 mr-2" /> 직접 등록
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                {mode === 'search' ? (
                    <>
                        <div className="px-4 py-3 bg-muted/20 border-b">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="음식 이름 검색 (예: 닭가슴살, 김치찌개)"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="bg-white"
                                    autoFocus
                                />
                                <Button onClick={handleSearch} disabled={isLoading}>
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                            {results.length === 0 && searched && !isLoading ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
                                    <Utensils className="w-12 h-12 mb-3" />
                                    <p>검색 결과가 없습니다.</p>
                                    <Button variant="link" onClick={() => setMode('create')}>직접 등록하기</Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Custom Foods / Search Results */}
                                    <div className="grid gap-2">
                                        {(searched ? results : POPULAR_FOODS).map((item, idx) => (
                                            <div
                                                key={item.id || idx}
                                                className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer group"
                                                onClick={() => onSelect(item)}
                                            >
                                                <div className={cn(
                                                    "w-12 h-12 shrink-0 rounded-md flex items-center justify-center font-bold text-xs border",
                                                    item.isCustom ? "bg-blue-50 text-blue-500 border-blue-100" : "bg-orange-50 text-orange-400 border-orange-100"
                                                )}>
                                                    {item.isCustom ? 'User' : item.name[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-sm truncate">{item.name}</h4>
                                                        {item.brand && <span className="text-xs text-muted-foreground bg-slate-100 px-1.5 rounded">{item.brand}</span>}
                                                    </div>
                                                    <div className="flex gap-3 mt-1 text-[11px] text-slate-500">
                                                        <span className="font-bold text-slate-700">{Math.round(item.calories)} kcal</span>
                                                        <span>/ {item.servingSize}</span>
                                                        <span className="w-px h-2 bg-slate-200 my-auto" />
                                                        <span>C {Math.round(item.macros.carbs)}</span>
                                                        <span>P {Math.round(item.macros.protein)}</span>
                                                        <span>F {Math.round(item.macros.fat)}</span>
                                                    </div>
                                                </div>
                                                <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 shrink-0 text-primary h-8 w-8">
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    {!searched && (
                                        <div className="pt-2">
                                            <h3 className="text-sm font-semibold text-muted-foreground mb-2">내 커스텀 푸드</h3>
                                            {customFoods.length > 0 ? (
                                                <div className="grid gap-2">
                                                    {customFoods.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer group"
                                                            onClick={() => onSelect(item)}
                                                        >
                                                            <div className="w-12 h-12 shrink-0 bg-blue-50 rounded-md flex items-center justify-center text-blue-500 font-bold text-xs border border-blue-100">
                                                                User
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-bold text-sm truncate">{item.name}</h4>
                                                                <div className="flex gap-3 mt-1 text-[11px] text-slate-500">
                                                                    <span className="font-bold text-slate-700">{Math.round(item.calories)} kcal</span>
                                                                    <span>C {Math.round(item.macros.carbs)}</span>
                                                                    <span>P {Math.round(item.macros.protein)}</span>
                                                                    <span>F {Math.round(item.macros.fat)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground p-2">등록된 커스텀 푸드가 없습니다.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
                        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4 max-w-md mx-auto">
                            <div className="space-y-2">
                                <Label>음식 이름 <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder="예: 우리집 김치찌개"
                                    value={newFood.name}
                                    onChange={e => setNewFood({ ...newFood, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>브랜드/제조사</Label>
                                    <Input
                                        placeholder="선택사항"
                                        value={newFood.brand}
                                        onChange={e => setNewFood({ ...newFood, brand: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>1회 제공량</Label>
                                    <Input
                                        placeholder="예: 200g, 1인분"
                                        value={newFood.servingSize}
                                        onChange={e => setNewFood({ ...newFood, servingSize: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>칼로리 (kcal) <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={newFood.calories}
                                    onChange={e => setNewFood({ ...newFood, calories: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-2">
                                    <Label className="text-xs">탄수화물 (g)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={newFood.carbs}
                                        onChange={e => setNewFood({ ...newFood, carbs: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">단백질 (g)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={newFood.protein}
                                        onChange={e => setNewFood({ ...newFood, protein: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">지방 (g)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={newFood.fat}
                                        onChange={e => setNewFood({ ...newFood, fat: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Button onClick={handleCreate} className="w-full mt-4" disabled={!newFood.name || !newFood.calories}>
                                <Save className="w-4 h-4 mr-2" /> 저장 및 선택
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

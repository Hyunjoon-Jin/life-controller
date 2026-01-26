'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Plus, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';

type FoodItem = {
    name: string;
    brand: string;
    calories: number;
    macros: {
        carbs: number;
        protein: number;
        fat: number;
    };
    image?: string;
    servingSize: string;
};

interface FoodSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (item: FoodItem) => void;
}

export function FoodSearchDialog({ open, onOpenChange, onSelect }: FoodSearchDialogProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<FoodItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        setSearched(true);
        try {
            const res = await fetch(`/api/food/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setResults(data.items || []);
        } catch (error) {
            console.error('Search failed', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 gap-0">
                <DialogHeader className="p-4 pb-2">
                    <DialogTitle>식단 검색 (Open Food Facts)</DialogTitle>
                </DialogHeader>

                <div className="px-4 py-2 border-b bg-muted/20">
                    <div className="flex gap-2">
                        <Input
                            placeholder="음식 이름 (예: 신라면, Chicken Breast)"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="bg-white"
                        />
                        <Button onClick={handleSearch} disabled={isLoading} className="shrink-0">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        * 전 세계 오픈 데이터베이스를 검색합니다. 영어로 검색하면 더 정확할 수 있습니다.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-2 bg-slate-50">
                    {results.length === 0 && searched && !isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
                            <Utensils className="w-12 h-12 mb-3" />
                            <p>검색 결과가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            {results.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer group"
                                    onClick={() => onSelect(item)}
                                >
                                    {/* Image or Placeholder */}
                                    <div className="w-16 h-16 shrink-0 bg-slate-100 rounded-md overflow-hidden flex items-center justify-center border">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Utensils className="w-6 h-6 text-slate-300" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm truncate">{item.name}</h4>
                                        <p className="text-xs text-muted-foreground truncate">{item.brand}</p>
                                        <div className="flex gap-2 mt-1.5 text-xs">
                                            <span className="font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">{Math.round(item.calories)} kcal</span>
                                            <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">100g 기준</span>
                                        </div>
                                        <div className="flex gap-2 mt-1 text-[10px] text-slate-500">
                                            <span>탄 {Math.round(item.macros.carbs)}g</span>
                                            <span className="w-px h-3 bg-slate-200" />
                                            <span>단 {Math.round(item.macros.protein)}g</span>
                                            <span className="w-px h-3 bg-slate-200" />
                                            <span>지 {Math.round(item.macros.fat)}g</span>
                                        </div>
                                    </div>

                                    <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 shrink-0 text-primary">
                                        <Plus className="w-5 h-5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {!searched && (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-40">
                            <Search className="w-12 h-12 mb-3" />
                            <p>메뉴를 검색해보세요</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

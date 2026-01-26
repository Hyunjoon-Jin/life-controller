'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Youtube, Globe, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SearchHub() {
    const [query, setQuery] = useState('');
    const [engine, setEngine] = useState<'google' | 'naver' | 'youtube'>('google');

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;

        let url = '';
        switch (engine) {
            case 'google':
                url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                break;
            case 'naver':
                url = `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`;
                break;
            case 'youtube':
                url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
                break;
        }
        window.open(url, '_blank');
        setQuery('');
    };

    return (
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className="flex gap-2 p-1 bg-muted/30 rounded-lg w-fit">
                <button
                    type="button"
                    onClick={() => setEngine('google')}
                    className={cn(
                        "p-2 rounded-md transition-all flex items-center gap-2 text-xs font-bold",
                        engine === 'google' ? "bg-white shadow text-blue-600" : "text-muted-foreground hover:bg-white/50"
                    )}
                >
                    <Globe className="w-4 h-4" /> Google
                </button>
                <button
                    type="button"
                    onClick={() => setEngine('naver')}
                    className={cn(
                        "p-2 rounded-md transition-all flex items-center gap-2 text-xs font-bold",
                        engine === 'naver' ? "bg-white shadow text-green-600" : "text-muted-foreground hover:bg-white/50"
                    )}
                >
                    <BookOpen className="w-4 h-4" /> Naver
                </button>
                <button
                    type="button"
                    onClick={() => setEngine('youtube')}
                    className={cn(
                        "p-2 rounded-md transition-all flex items-center gap-2 text-xs font-bold",
                        engine === 'youtube' ? "bg-white shadow text-red-600" : "text-muted-foreground hover:bg-white/50"
                    )}
                >
                    <Youtube className="w-4 h-4" /> Youtube
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                    placeholder={`${engine === 'google' ? '구글' : engine === 'naver' ? '네이버' : '유튜브'} 검색어를 입력하세요...`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 h-12 text-lg bg-muted/20 border-border/50 focus-visible:ring-primary/20"
                />
                <Button type="submit" size="icon" className="absolute right-1 top-1 h-10 w-10 bg-primary/90 hover:bg-primary">
                    <Search className="w-4 h-4" />
                </Button>
            </div>
        </form>
    );
}

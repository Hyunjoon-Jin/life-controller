'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
        <form onSubmit={handleSearch} className="glass-premium rounded-2xl border border-white/10 p-4 flex flex-col gap-3 shadow-lg">
            {/* Engine Tabs */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl w-fit">
                <button
                    type="button"
                    onClick={() => setEngine('google')}
                    className={cn(
                        "px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-xs font-bold",
                        engine === 'google'
                            ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                            : "text-white/50 hover:text-white hover:bg-white/10"
                    )}
                >
                    <Globe className="w-3.5 h-3.5" /> Google
                </button>
                <button
                    type="button"
                    onClick={() => setEngine('naver')}
                    className={cn(
                        "px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-xs font-bold",
                        engine === 'naver'
                            ? "bg-green-500 text-white shadow-md shadow-green-500/20"
                            : "text-white/50 hover:text-white hover:bg-white/10"
                    )}
                >
                    <BookOpen className="w-3.5 h-3.5" /> Naver
                </button>
                <button
                    type="button"
                    onClick={() => setEngine('youtube')}
                    className={cn(
                        "px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-xs font-bold",
                        engine === 'youtube'
                            ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                            : "text-white/50 hover:text-white hover:bg-white/10"
                    )}
                >
                    <Youtube className="w-3.5 h-3.5" /> Youtube
                </button>
            </div>

            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                <input
                    type="text"
                    placeholder={`${engine === 'google' ? '구글' : engine === 'naver' ? '네이버' : '유튜브'} 검색어를 입력하세요...`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full h-12 pl-11 pr-14 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm font-medium placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                />
                <Button
                    type="submit"
                    size="icon"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg bg-primary hover:bg-primary/90 shadow-md"
                >
                    <Search className="w-4 h-4" />
                </Button>
            </div>
        </form>
    );
}

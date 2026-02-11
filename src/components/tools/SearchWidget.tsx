'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

type SearchEngine = 'google' | 'naver' | 'youtube';

export function SearchWidget() {
    const [query, setQuery] = useState('');
    const [searchEngine, setSearchEngine] = useState<SearchEngine>('google');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        let url = '';
        switch (searchEngine) {
            case 'google': url = `https://www.google.com/search?q=${encodeURIComponent(query)}`; break;
            case 'naver': url = `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`; break;
            case 'youtube': url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`; break;
        }
        window.open(url, '_blank');
    };

    return (
        <Card className="w-full bg-transparent border-none shadow-none">
            <CardContent className="p-0">
                <form onSubmit={handleSearch} className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
                        {/* Engine Toggles (Subtle) */}
                        <button
                            type="button"
                            onClick={() => setSearchEngine('google')}
                            className={cn("w-2.5 h-2.5 rounded-full transition-all ring-1 ring-white/20", searchEngine === 'google' ? "bg-blue-500 scale-125" : "bg-gray-300 hover:bg-blue-400")}
                            title="Google"
                        />
                        <button
                            type="button"
                            onClick={() => setSearchEngine('naver')}
                            className={cn("w-2.5 h-2.5 rounded-full transition-all ring-1 ring-white/20", searchEngine === 'naver' ? "bg-green-500 scale-125" : "bg-gray-300 hover:bg-green-400")}
                            title="Naver"
                        />
                        <button
                            type="button"
                            onClick={() => setSearchEngine('youtube')}
                            className={cn("w-2.5 h-2.5 rounded-full transition-all ring-1 ring-white/20", searchEngine === 'youtube' ? "bg-red-500 scale-125" : "bg-gray-300 hover:bg-red-400")}
                            title="YouTube"
                        />
                    </div>

                    <Input
                        type="text"
                        name="q"
                        id="search-query"
                        autoComplete="off"
                        placeholder={`${searchEngine === 'google' ? 'Google' : searchEngine === 'naver' ? '네이버' : 'YouTube'} 검색`}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full h-14 pl-24 pr-12 rounded-[24px] border-0 bg-white/80 dark:bg-white/10 shadow-sm backdrop-blur-xl text-lg placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all hover:bg-white/90"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full hover:bg-primary/10 text-primary w-10 h-10"
                    >
                        <Search className="w-5 h-5" />
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

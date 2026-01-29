'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SearchEngine = 'google' | 'naver' | 'youtube';

const GoogleIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const NaverIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156l8.897 12.844H24V0h-7.727v12.845z" />
    </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="#FF0000" xmlns="http://www.w3.org/2000/svg">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor" />
    </svg>
);

export function SearchWidget() {
    const [query, setQuery] = useState('');
    const [engine, setEngine] = useState<SearchEngine>('google');

    const handleSearch = () => {
        if (!query.trim()) return;
        let url = '';
        switch (engine) {
            case 'google': url = `https://www.google.com/search?q=${encodeURIComponent(query)}`; break;
            case 'naver': url = `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`; break;
            case 'youtube': url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`; break;
        }
        window.open(url, '_blank');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    const openShortcut = (url: string) => window.open(url, '_blank');

    return (
        <div className="bg-card text-card-foreground rounded-3xl border border-transparent shadow-sm p-4 flex flex-col gap-4">
            {/* Shortcuts */}
            <div className="flex justify-between gap-3">
                <Button
                    variant="outline"
                    className="flex-1 bg-white hover:bg-gray-50 border shadow-sm rounded-2xl h-12 relative overflow-hidden group"
                    onClick={() => openShortcut('https://www.google.com')}
                >
                    <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors" />
                    <GoogleIcon className="w-6 h-6" />
                </Button>
                <Button
                    variant="outline"
                    className="flex-1 bg-[#03C75A] hover:bg-[#02b351] text-white border-none rounded-2xl h-12 shadow-sm"
                    onClick={() => openShortcut('https://www.naver.com')}
                >
                    <NaverIcon className="w-5 h-5" />
                </Button>
                <Button
                    variant="outline"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none rounded-2xl h-12 shadow-sm"
                    onClick={() => openShortcut('https://www.youtube.com')}
                >
                    <YoutubeIcon className="w-6 h-6 text-white" />
                </Button>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-10 w-12 rounded-xl px-0 hover:bg-muted bg-muted/50">
                            {engine === 'google' && <GoogleIcon className="w-5 h-5" />}
                            {engine === 'naver' && <NaverIcon className="w-4 h-4 text-[#03C75A]" />}
                            {engine === 'youtube' && <YoutubeIcon className="w-5 h-5 text-red-600" />}
                            <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[140px]">
                        <DropdownMenuItem onSelect={() => setEngine('google')} className="gap-2">
                            <GoogleIcon className="w-4 h-4" /> Google
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setEngine('naver')} className="gap-2">
                            <NaverIcon className="w-4 h-4 text-[#03C75A]" /> Naver
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setEngine('youtube')} className="gap-2">
                            <YoutubeIcon className="w-4 h-4 text-red-600" /> Youtube
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="relative flex-1">
                    <Input
                        id="widget-search"
                        name="q"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`${engine === 'google' ? 'Google' : engine === 'naver' ? '네이버' : '유튜브'} 검색...`}
                        className="bg-muted/50 border-transparent pr-10 h-10 rounded-xl focus-visible:ring-primary/20 focus-visible:bg-background transition-all font-medium placeholder:font-normal placeholder:text-muted-foreground/70"
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

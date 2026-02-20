'use client';

import { useData } from '@/context/DataProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Book } from '@/types';
import { cn } from '@/lib/utils';
import {
    BookOpen, Star, MoreVertical, Play, CheckCircle,
    Bookmark, Trash2, Settings2, Info, ArrowUpRight,
    Library, ScrollText, Timer, Archive
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from 'framer-motion';

interface BookShelfProps {
    onEdit: (book: Book) => void;
}

export function BookShelf({ onEdit }: BookShelfProps) {
    const { books, updateBook, deleteBook } = useData();

    const renderBookCover = (book: Book) => {
        const colors = [
            'from-amber-500/20 to-orange-500/20',
            'from-blue-500/20 to-indigo-500/20',
            'from-emerald-500/20 to-teal-500/20',
            'from-rose-500/20 to-pink-500/20'
        ];
        const colorIndex = book.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        const gradient = colors[colorIndex];

        return (
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden group shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2">
                {/* Book Base / Spine Highlight */}
                <div className="absolute inset-y-0 left-0 w-1.5 bg-white/10 z-20" />

                {book.coverUrl ? (
                    <Image
                        src={book.coverUrl}
                        alt={book.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        unoptimized
                    />
                ) : (
                    <div className={cn("w-full h-full bg-gradient-to-br flex flex-col items-center justify-center p-6 text-center border border-white/5", gradient)}>
                        <BookOpen className="w-10 h-10 text-white/20 mb-4" />
                        <span className="font-black text-xs text-white uppercase tracking-tighter leading-tight opacity-40 line-clamp-3 px-2">
                            {book.title}
                        </span>
                    </div>
                )}

                {/* Progress Overlay (Always visible for reading) */}
                {book.status === 'reading' && (
                    <div className="absolute bottom-4 left-4 right-4 h-1.5 bg-black/40 rounded-full overflow-hidden backdrop-blur-md border border-white/10">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round((book.currentPage / book.totalPages) * 100)}%` }}
                            className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                        />
                    </div>
                )}

                {/* Hover UI */}
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-8 text-center ring-inset ring-1 ring-white/10">
                    <div className="mb-6">
                        <h5 className="text-[10px] font-black text-amber-500 tracking-[0.3em] uppercase mb-1">DATA INSPECTION</h5>
                        <p className="text-sm font-black text-white uppercase tracking-tighter line-clamp-2">{book.title}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 w-full">
                        <Button
                            variant="outline"
                            className="h-10 rounded-xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-white/10"
                            onClick={() => onEdit(book)}
                        >
                            <Info className="w-3.5 h-3.5 mr-2 text-indigo-400" /> FILE SPEC
                        </Button>
                        <Button
                            className="h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-black uppercase tracking-widest shadow-lg"
                            onClick={() => updateBook({ ...book, status: 'reading', startDate: new Date() })}
                        >
                            <Play className="w-3.5 h-3.5 mr-2" /> COMMENCE
                        </Button>
                    </div>

                    {book.status === 'reading' && (
                        <div className="mt-6 flex items-center gap-2">
                            <Timer className="w-3 h-3 text-amber-500" />
                            <span className="text-[10px] font-black text-white tracking-widest uppercase">
                                PROGRESS {Math.round((book.currentPage / book.totalPages) * 100)}%
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderShelf = (title: string, booksList: Book[], emptyMessage: string, icon: any, color: string) => (
        <div className="mb-16 last:mb-0">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/5", color)}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white tracking-widest uppercase">{title}</h3>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">{booksList.length} CODIFIED VOLUMES</p>
                    </div>
                </div>
            </div>

            {booksList.length === 0 ? (
                <div className="h-48 border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center text-white/10 text-center gap-4 group hover:border-white/10 transition-all">
                    <Archive className="w-8 h-8 opacity-20 group-hover:scale-110 transition-transform" />
                    <p className="text-[9px] font-black tracking-[0.3em] uppercase">{emptyMessage}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-10">
                    {booksList.map((book, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={book.id}
                            className="group relative"
                        >
                            {renderBookCover(book)}

                            <div className="mt-6 space-y-1 px-1">
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-black text-[10px] text-white/60 tracking-widest uppercase leading-tight line-clamp-1 group-hover:text-amber-500 transition-colors">
                                        {book.title}
                                    </h4>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="text-white/20 hover:text-white transition-colors">
                                                <MoreVertical className="w-3 h-3" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="glass-premium border-white/10 min-w-[160px]">
                                            <DropdownMenuItem className="text-[10px] font-black uppercase tracking-widest gap-3 py-3" onClick={() => updateBook({ ...book, status: 'reading', startDate: new Date() })}>
                                                <Play className="w-4 h-4 text-emerald-500" /> INITIALIZE READ
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-[10px] font-black uppercase tracking-widest gap-3 py-3" onClick={() => updateBook({ ...book, status: 'completed', endDate: new Date(), currentPage: book.totalPages })}>
                                                <CheckCircle className="w-4 h-4 text-sky-500" /> MARK COMPLETE
                                            </DropdownMenuItem>
                                            <div className="h-px bg-white/5 mx-2" />
                                            <DropdownMenuItem className="text-[10px] font-black uppercase tracking-widest gap-3 py-3 text-rose-500" onClick={() => deleteBook(book.id)}>
                                                <Trash2 className="w-4 h-4" /> ERASE ENTRY
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest truncate max-w-[80%]">
                                        BY {book.author || 'UNKNOWN AUTHOR'}
                                    </p>
                                    {book.rating && (
                                        <div className="flex items-center gap-0.5">
                                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                            <span className="text-[9px] font-black text-amber-500">{book.rating}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-4 pb-20">
            {renderShelf("ACTIVE LECTURE", books.filter(b => b.status === 'reading'), "NO ACTIVE SCANS DETECTED", <BookOpen className="w-5 h-5 text-emerald-400" />, "border-emerald-500/20")}
            {renderShelf("QUEUE PROTOCOL", books.filter(b => b.status === 'toread'), "WISH LIST IS VACANT", <Library className="w-5 h-5 text-amber-400" />, "border-amber-500/20")}
            {renderShelf("ARCHIVED INTELLIGENCE", books.filter(b => b.status === 'completed'), "NO COMPLETED VOLUMES FOUND", <ScrollText className="w-5 h-5 text-sky-400" />, "border-sky-500/20")}
        </div>
    );
}

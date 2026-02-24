'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Button } from '@/components/ui/button';
import {
    Book as BookIcon, Plus, Library, List as ListIcon,
    Sparkles, Bookmark, Search, GraduationCap, Archive,
    Compass, Feather, ScrollText, BookOpen
} from 'lucide-react';
import { Book } from '@/types';
import { BookShelf } from './BookShelf';
import { BookSearchDialog } from './BookSearchDialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function ReadingLog() {
    const { books } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [viewMode, setViewMode] = useState<'shelf' | 'list'>('shelf');

    const handleOpenCreate = () => {
        setEditingBook(null);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (book: Book) => {
        setEditingBook(book);
        setIsDialogOpen(true);
    };

    return (
        <div className="h-full flex flex-col glass-premium rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] via-transparent to-orange-500/[0.03] pointer-events-none" />

            {/* Header Area */}
            <div className="p-8 pb-4 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(245,158,11,0.5)]">
                            <BookIcon className="w-6 h-6 text-white" strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">도서 아카이브</h2>
                            <p className="text-[10px] font-bold text-white/20 tracking-[0.3em] uppercase mt-2 italic flex items-center gap-2">
                                <Feather className="w-3 h-3 text-amber-500" /> 지적 큐레이션: 지식 보관 중
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
                        <div className="flex bg-white/5 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('shelf')}
                                className={cn(
                                    "p-2 rounded-lg transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4",
                                    viewMode === 'shelf' ? "bg-amber-500 text-white shadow-lg" : "text-white/40 hover:text-white"
                                )}
                            >
                                <Library className="w-4 h-4" /> 책장
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-2 rounded-lg transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4",
                                    viewMode === 'list' ? "bg-amber-500 text-white shadow-lg" : "text-white/40 hover:text-white"
                                )}
                            >
                                <ListIcon className="w-4 h-4" /> 목록
                            </button>
                        </div>
                        <div className="w-px h-6 bg-white/10 mx-2" />
                        <Button
                            onClick={handleOpenCreate}
                            className="h-10 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] tracking-widest uppercase shadow-xl transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4 mr-2" strokeWidth={3} /> 도서 등록
                        </Button>
                    </div>
                </div>

                {/* Quick Selection / Filter TABS */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {[
                        { label: '전체 도서', icon: ScrollText, count: books.length },
                        { label: '읽고 있는 책', icon: BookOpen, count: books.filter(b => b.status === 'reading').length },
                        { label: '다 읽은 책', icon: Archive, count: books.filter(b => b.status === 'completed').length },
                        { label: '읽고 싶은 책', icon: Bookmark, count: books.filter(b => b.status === 'toread').length },
                    ].map(tab => (
                        <button
                            key={tab.label}
                            className="flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all bg-white/[0.03] border border-white/5 text-white/40 hover:text-white hover:bg-white/10"
                        >
                            <tab.icon className="w-4 h-4 text-amber-500/40" />
                            {tab.label}
                            <span className="ml-2 w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-[8px] border border-white/10">{tab.count}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4 relative z-10">
                <AnimatePresence mode="wait">
                    {viewMode === 'shelf' ? (
                        <motion.div
                            key="shelf"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <BookShelf onEdit={handleOpenEdit} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="py-32 flex flex-col items-center justify-center text-center opacity-10 gap-6"
                        >
                            <ScrollText className="w-20 h-20" />
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black tracking-[0.2em] uppercase">시스템 보정 중</h3>
                                <p className="text-[10px] font-bold tracking-[0.5em] uppercase">목록 뷰 기능 강화 중입니다</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Dialog */}
            <BookSearchDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                bookToEdit={editingBook}
            />
        </div>
    );
}

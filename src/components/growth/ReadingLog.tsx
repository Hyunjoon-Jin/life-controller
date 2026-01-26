'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Button } from '@/components/ui/button';
import { Book as BookIcon, Plus, Library, List as ListIcon } from 'lucide-react';
import { Book } from '@/types';
import { BookShelf } from './BookShelf';
import { BookSearchDialog } from './BookSearchDialog';
import { cn } from '@/lib/utils';

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
        <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar bg-amber-50/30 dark:bg-black/5">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                            <BookIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">독서 기록장</h2>
                    </div>
                    <p className="text-sm text-muted-foreground ml-1">
                        총 <span className="font-bold text-foreground">{books.length}</span>권의 책이 서재에 있습니다.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-lg border shadow-sm">
                        <button
                            onClick={() => setViewMode('shelf')}
                            className={cn(
                                "p-1.5 rounded-md transition-all",
                                viewMode === 'shelf' ? "bg-orange-100 text-orange-700" : "text-muted-foreground hover:bg-gray-100"
                            )}
                            title="서재 뷰"
                        >
                            <Library className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-1.5 rounded-md transition-all",
                                viewMode === 'list' ? "bg-orange-100 text-orange-700" : "text-muted-foreground hover:bg-gray-100"
                            )}
                            title="리스트 뷰"
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <Button onClick={handleOpenCreate} className="bg-orange-600 hover:bg-orange-700 text-white shadow-md">
                        <Plus className="w-4 h-4 mr-2" /> 책 등록하기
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1">
                {viewMode === 'shelf' ? (
                    <BookShelf onEdit={handleOpenEdit} />
                ) : (
                    <div className="text-center py-20 text-muted-foreground">
                        리스트 뷰 준비 중... (서재 뷰를 이용해주세요)
                    </div>
                )}
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

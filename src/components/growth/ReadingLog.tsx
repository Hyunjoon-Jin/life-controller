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
            {/* Toolbar */}
            <div className="flex items-center justify-end gap-2">
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

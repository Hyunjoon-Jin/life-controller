'use client';

import { useData } from '@/context/DataProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Book } from '@/types';
import { cn } from '@/lib/utils';
import { BookOpen, Star, MoreVertical, Play, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BookShelfProps {
    onEdit: (book: Book) => void;
}

export function BookShelf({ onEdit }: BookShelfProps) {
    const { books, updateBook, deleteBook } = useData();

    const renderBookCover = (book: Book) => {
        // Deterministic color based on ID if no cover image
        const colors = ['bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-pink-200', 'bg-indigo-200', 'bg-orange-200'];
        const colorIndex = book.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        const bgColor = colors[colorIndex];

        return (
            <div className={cn(
                "relative aspect-[2/3] rounded-md shadow-md transition-all group-hover:shadow-xl overflow-hidden",
                book.coverUrl ? "bg-gray-100" : bgColor
            )}>
                {book.coverUrl ? (
                    <Image src={book.coverUrl} alt={book.title} fill className="object-cover" unoptimized />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                        <BookOpen className="w-8 h-8 opacity-20 mb-2" />
                        <span className="font-bold text-sm line-clamp-3 leading-tight opacity-70">
                            {book.title}
                        </span>
                        <span className="text-xs mt-1 opacity-50 line-clamp-1">
                            {book.author}
                        </span>
                    </div>
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                    <Button size="sm" variant="secondary" className="w-full" onClick={() => onEdit(book)}>
                        상세 보기
                    </Button>
                    {book.status === 'reading' && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] py-1 text-center">
                            {Math.round((book.currentPage / book.totalPages) * 100)}% 읽음
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderShelf = (title: string, booksList: Book[], emptyMessage: string) => (
        <div className="mb-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                {title} <span className="text-muted-foreground text-sm font-normal">({booksList.length})</span>
            </h3>

            {booksList.length === 0 ? (
                <div className="h-40 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-muted-foreground text-sm bg-gray-50/50">
                    {emptyMessage}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {booksList.map(book => (
                        <div key={book.id} className="group relative">
                            {renderBookCover(book)}

                            <div className="mt-3 space-y-1">
                                <h4 className="font-bold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                                    {book.title}
                                </h4>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                    {book.author}
                                </p>
                                {book.rating && (
                                    <div className="flex items-center gap-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={cn("w-3 h-3", i < (book.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-200")}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 text-white/80 hover:text-white hover:bg-black/20">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => updateBook({ ...book, status: 'reading', startDate: new Date() })}>
                                        <Play className="w-4 h-4 mr-2" /> 읽기 시작
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateBook({ ...book, status: 'completed', endDate: new Date(), currentPage: book.totalPages })}>
                                        <CheckCircle className="w-4 h-4 mr-2" /> 완독 처리
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => deleteBook(book.id)} className="text-red-500">
                                        삭제
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-4 pb-12 animate-in fade-in duration-500">
            {renderShelf("읽고 있는 책", books.filter(b => b.status === 'reading'), "현재 읽고 있는 책이 없습니다.")}
            {renderShelf("읽을 책 (To Read)", books.filter(b => b.status === 'toread'), "서재가 비어있습니다. 읽고 싶은 책을 추가해보세요.")}
            {renderShelf("완독한 책", books.filter(b => b.status === 'completed'), "완독한 책이 쌓이면 지식이 됩니다.")}
        </div>
    );
}

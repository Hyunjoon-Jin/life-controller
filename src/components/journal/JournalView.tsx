'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { JournalEditor } from './JournalEditor';
import { NotebookPen, Plus, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { JournalEntry } from '@/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function JournalView() {
    const { journals, deleteJournal } = useData();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMood, setFilterMood] = useState('all');

    // Edit State
    const [editingJournal, setEditingJournal] = useState<JournalEntry | undefined>(undefined);

    const handleDelete = (id: string) => {
        if (confirm('정말 이 일기를 삭제하시겠습니까?')) {
            deleteJournal(id);
        }
    };

    const handleEdit = (journal: JournalEntry) => {
        setEditingJournal(journal);
        setIsOpen(true);
    };

    const handleCloseDialog = () => {
        setIsOpen(false);
        setEditingJournal(undefined);
    };

    // Filter Logic
    const filteredJournals = journals.filter(entry => {
        const matchesTerm =
            entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (entry.tags && entry.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
        const matchesMood = filterMood === 'all' || entry.mood === filterMood;
        return matchesTerm && matchesMood;
    });

    // Sort by date desc
    const sortedJournals = [...filteredJournals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const MOODS = ['😊', '😐', '😔', '😡', '😴', '🤩', '🤔', '🤒'];

    return (
        <div className="bg-card rounded-lg border border-border shadow-sm p-4 h-[450px] flex flex-col">
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <NotebookPen className="w-5 h-5 text-primary" />
                        일기장
                    </h2>
                    <Dialog open={isOpen} onOpenChange={(open) => {
                        if (!open) handleCloseDialog();
                        else setIsOpen(true);
                    }}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setEditingJournal(undefined)}>
                                <Plus className="w-4 h-4 mr-2" />
                                글쓰기
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>{editingJournal ? '일기 수정' : '새 일기 쓰기'}</DialogTitle>
                            </DialogHeader>
                            <JournalEditor onClose={handleCloseDialog} journal={editingJournal} />
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search & Filter */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            id="journal-search"
                            name="journal-search"
                            placeholder="내용 또는 태그 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-9 text-sm pl-8"
                        />
                        <NotebookPen className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground opacity-50" />
                    </div>
                    <select
                        id="journal-mood-filter"
                        name="journal-mood-filter"
                        className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-[100px]"
                        value={filterMood}
                        onChange={(e) => setFilterMood(e.target.value)}
                    >
                        <option value="all">전체 기분</option>
                        {MOODS.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {sortedJournals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm opacity-50">
                        <NotebookPen className="w-8 h-8 mb-2" />
                        <p>{searchTerm || filterMood !== 'all' ? '검색 결과가 없습니다.' : '작성된 일기가 없습니다. 지금 시작해보세요!'}</p>
                    </div>
                ) : (
                    sortedJournals.map(entry => (
                        <div key={entry.id} className="p-3 rounded-lg border border-border bg-muted/5 space-y-2 group relative">
                            <div className="flex justify-between items-start">
                                <div className="text-xs font-medium text-muted-foreground uppercase">
                                    {format(new Date(entry.date), 'yyyy년 MMMM d일 a h:mm', { locale: ko })}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-xl" title="Mood">{entry.mood}</div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(entry)}>
                                                <Pencil className="w-4 h-4 mr-2" /> 수정
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(entry.id)} className="text-destructive focus:text-destructive">
                                                <Trash2 className="w-4 h-4 mr-2" /> 삭제
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm whitespace-pre-wrap leading-relaxed truncate-3-lines">
                                    {entry.content}
                                </p>
                                {entry.content.length > 150 && (
                                    <button
                                        className="text-[10px] text-primary hover:underline font-medium"
                                        onClick={() => handleEdit(entry)}
                                    >
                                        더 보기...
                                    </button>
                                )}
                            </div>
                            {entry.images && entry.images.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto mt-2 pt-2 border-t border-border/50">
                                    {entry.images.map((img, i) => (
                                        <div key={i} className="w-16 h-16 rounded overflow-hidden flex-shrink-0 border border-border cursor-pointer hover:opacity-90">
                                            <img src={img} alt="Journal attachment" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                            {entry.tags && entry.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {entry.tags.map(tag => (
                                        <span key={tag} className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full font-medium">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

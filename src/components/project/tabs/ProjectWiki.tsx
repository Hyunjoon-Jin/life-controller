import React, { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Project, WikiPage } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus, Edit2, Trash2, Save, X, Search } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectWikiProps {
    project: Project;
}

export function ProjectWiki({ project }: ProjectWikiProps) {
    const { wikiPages, addWikiPage, updateWikiPage, deleteWikiPage } = useData();
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');

    const projectPages = wikiPages.filter(p => p.projectId === project.id);
    const filteredPages = projectPages.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedPage = projectPages.find(p => p.id === selectedPageId);

    const handleCreate = () => {
        const newPage: WikiPage = {
            id: crypto.randomUUID(),
            projectId: project.id,
            title: '새 문서',
            content: '',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        addWikiPage(newPage);
        setSelectedPageId(newPage.id);
        setEditTitle('새 문서');
        setEditContent('');
        setIsEditing(true);
    };

    const handleEdit = () => {
        if (!selectedPage) return;
        setEditTitle(selectedPage.title);
        setEditContent(selectedPage.content);
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!selectedPage) return;
        updateWikiPage({
            ...selectedPage,
            title: editTitle,
            content: editContent,
            updatedAt: new Date()
        });
        setIsEditing(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('문서를 삭제하시겠습니까?')) {
            deleteWikiPage(id);
            if (selectedPageId === id) setSelectedPageId(null);
        }
    };

    return (
        <div className="h-full flex gap-6">
            {/* Sidebar List */}
            <div className="w-64 flex flex-col gap-4 shrink-0">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-500" />
                        Wiki 문서
                    </h3>
                    <Button variant="outline" size="icon" onClick={handleCreate}>
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="문서 검색..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {filteredPages.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground py-8">
                            문서가 없습니다.
                        </div>
                    ) : (
                        filteredPages.map(page => (
                            <div
                                key={page.id}
                                onClick={() => {
                                    setSelectedPageId(page.id);
                                    setIsEditing(false);
                                }}
                                className={`p-3 rounded-lg cursor-pointer transition-colors border ${selectedPageId === page.id
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                                        : 'bg-white hover:bg-gray-50 border-transparent hover:border-gray-200'
                                    }`}
                            >
                                <div className="font-medium truncate">{page.title}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {format(new Date(page.updatedAt), 'yyyy.MM.dd')}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
                {selectedPage ? (
                    isEditing ? (
                        <div className="flex flex-col h-full p-6 gap-4">
                            <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="text-xl font-bold"
                                placeholder="문서 제목"
                            />
                            <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="flex-1 resize-none"
                                placeholder="마크다운 내용을 입력하세요..."
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                                    <X className="w-4 h-4 mr-2" /> 취소
                                </Button>
                                <Button onClick={handleSave}>
                                    <Save className="w-4 h-4 mr-2" /> 저장
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b flex justify-between items-start bg-gray-50/50">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">{selectedPage.title}</h2>
                                    <div className="text-sm text-muted-foreground mt-2">
                                        최종 수정: {format(new Date(selectedPage.updatedAt), 'yyyy.MM.dd HH:mm')}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={handleEdit}>
                                        <Edit2 className="w-4 h-4 mr-2" /> 편집
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(selectedPage.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 prose max-w-none">
                                {/* Simple Markdown Rendering (Replace with actual markdown component if available) */}
                                {selectedPage.content ? (
                                    <div className="whitespace-pre-wrap">{selectedPage.content}</div>
                                ) : (
                                    <div className="text-muted-foreground italic">내용이 없습니다.</div>
                                )}
                            </div>
                        </div>
                    )
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <FileText className="w-16 h-16 opacity-20 mb-4" />
                        <p>문서를 선택하거나 새로 만드세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

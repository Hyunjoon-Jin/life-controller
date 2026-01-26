'use client';

import { useState, useMemo } from 'react';
import { Project, ArchiveDocument } from '@/types';
import { useData } from '@/context/DataProvider';
import { FileText, Link as LinkIcon, File, Plus, Search, Tag, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '../ui/badge'; // Using relative path to fix resolution issue
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ArchiveSystemProps {
    project: Project;
}

export function ArchiveSystem({ project }: ArchiveSystemProps) {
    const { archiveDocuments, addDocument, updateDocument, deleteDocument } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Create/Edit State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<ArchiveDocument | null>(null);
    const [newDocData, setNewDocData] = useState<{
        title: string;
        type: 'markdown' | 'link' | 'file';
        content: string;
        tags: string;
    }>({ title: '', type: 'markdown', content: '', tags: '' });

    // Viewer State
    const [viewingDoc, setViewingDoc] = useState<ArchiveDocument | null>(null);

    const projectDocs = useMemo(() => {
        return archiveDocuments.filter(doc => doc.projectId === project.id);
    }, [archiveDocuments, project.id]);

    const filteredDocs = useMemo(() => {
        return projectDocs.filter(doc => {
            const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.content.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTag = selectedTag ? doc.tags?.includes(selectedTag) : true;
            return matchesSearch && matchesTag;
        });
    }, [projectDocs, searchQuery, selectedTag]);

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        projectDocs.forEach(doc => doc.tags?.forEach(tag => tags.add(tag)));
        return Array.from(tags);
    }, [projectDocs]);

    const handleOpenCreate = () => {
        setEditingDoc(null);
        setNewDocData({ title: '', type: 'markdown', content: '', tags: '' });
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!newDocData.title.trim()) return;

        const tags = newDocData.tags.split(',').map(t => t.trim()).filter(Boolean);

        if (editingDoc) {
            updateDocument({
                ...editingDoc,
                title: newDocData.title,
                type: newDocData.type,
                content: newDocData.content,
                tags: tags,
                updatedAt: new Date()
            });
        } else {
            addDocument({
                id: Date.now().toString(),
                projectId: project.id,
                title: newDocData.title,
                type: newDocData.type,
                content: newDocData.content,
                tags: tags,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        setIsDialogOpen(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('이 문서를 삭제하시겠습니까?')) {
            deleteDocument(id);
            if (viewingDoc?.id === id) setViewingDoc(null);
        }
    }

    return (
        <div className="h-full flex gap-4 animate-in fade-in transition-all">
            {/* Left: Document List */}
            <div className="w-1/3 flex flex-col border border-gray-200 rounded-xl bg-card overflow-hidden">
                <div className="p-4 border-b border-gray-200 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">문서 보관함</h3>
                        <Button size="sm" onClick={handleOpenCreate}>
                            <Plus className="w-4 h-4 mr-1" /> 새 문서
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="제목, 내용 검색..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {allTags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                    className={cn(
                                        "text-xs px-2 py-1 rounded-full border border-gray-200 transition-colors",
                                        selectedTag === tag ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    )}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {filteredDocs.length === 0 ? (
                        <div className="text-center text-muted-foreground py-10">
                            문서가 없습니다.
                        </div>
                    ) : (
                        filteredDocs.map(doc => (
                            <div
                                key={doc.id}
                                onClick={() => setViewingDoc(doc)}
                                className={cn(
                                    "p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-muted/50 transition-colors flex items-start gap-3",
                                    viewingDoc?.id === doc.id ? "bg-muted border-primary/50 ring-1 ring-primary/20" : ""
                                )}
                            >
                                <div className="mt-1">
                                    {doc.type === 'markdown' && <FileText className="w-4 h-4 text-blue-500" />}
                                    {doc.type === 'link' && <LinkIcon className="w-4 h-4 text-green-500" />}
                                    {doc.type === 'file' && <File className="w-4 h-4 text-orange-500" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{doc.title}</div>
                                    <div className="text-xs text-muted-foreground truncate">{doc.content.substring(0, 50)}</div>
                                    <div className="flex gap-2 mt-2">
                                        {doc.tags?.map(tag => (
                                            <span key={tag} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">#{tag}</span>
                                        ))}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-1 text-right">
                                        {format(new Date(doc.updatedAt), 'yy.MM.dd')}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right: Viewer / Editor */}
            <div className="flex-1 border border-gray-200 rounded-xl bg-card overflow-hidden flex flex-col">
                {viewingDoc ? (
                    <>
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-muted/20">
                            <div className="flex items-center gap-2">
                                {viewingDoc.type === 'markdown' && <FileText className="w-5 h-5 text-blue-500" />}
                                {viewingDoc.type === 'link' && <LinkIcon className="w-5 h-5 text-green-500" />}
                                <h2 className="font-bold text-lg">{viewingDoc.title}</h2>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => {
                                    setEditingDoc(viewingDoc);
                                    setNewDocData({
                                        title: viewingDoc.title,
                                        type: viewingDoc.type,
                                        content: viewingDoc.content,
                                        tags: viewingDoc.tags?.join(', ') || ''
                                    });
                                    setIsDialogOpen(true);
                                }}>수정</Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(viewingDoc.id)}>삭제</Button>
                                <Button variant="ghost" size="icon" onClick={() => setViewingDoc(null)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar prose dark:prose-invert max-w-none">
                            {viewingDoc.type === 'markdown' ? (
                                <div className="whitespace-pre-wrap">{viewingDoc.content}</div>
                            ) : viewingDoc.type === 'link' ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <LinkIcon className="w-16 h-16 text-muted-foreground/20" />
                                    <a
                                        href={viewingDoc.content.startsWith('http') ? viewingDoc.content : `https://${viewingDoc.content}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline flex items-center gap-2 text-lg font-medium"
                                    >
                                        {viewingDoc.content}
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground">파일 미리보기는 지원되지 않습니다.</div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                        <FileText className="w-16 h-16 mb-4 opacity-20" />
                        <p>문서를 선택하여 내용을 확인하세요.</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>{editingDoc ? '문서 수정' : '새 문서 작성'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">유형</Label>
                            <div className="col-span-3 flex gap-2">
                                <Button
                                    type="button"
                                    variant={newDocData.type === 'markdown' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setNewDocData({ ...newDocData, type: 'markdown' })}
                                >
                                    <FileText className="w-4 h-4 mr-1" /> 노트
                                </Button>
                                <Button
                                    type="button"
                                    variant={newDocData.type === 'link' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setNewDocData({ ...newDocData, type: 'link' })}
                                >
                                    <LinkIcon className="w-4 h-4 mr-1" /> 링크
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">제목</Label>
                            <Input
                                value={newDocData.title}
                                onChange={(e) => setNewDocData({ ...newDocData, title: e.target.value })}
                                className="col-span-3"
                                placeholder="문서 제목을 입력하세요"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right mt-2">내용</Label>
                            <Textarea
                                value={newDocData.content}
                                onChange={(e) => setNewDocData({ ...newDocData, content: e.target.value })}
                                className="col-span-3 min-h-[300px] font-mono text-sm"
                                placeholder={newDocData.type === 'link' ? 'https://example.com' : '마크다운 내용을 입력하세요...'}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">태그</Label>
                            <Input
                                value={newDocData.tags}
                                onChange={(e) => setNewDocData({ ...newDocData, tags: e.target.value })}
                                className="col-span-3"
                                placeholder="콤마(,)로 구분하여 태그 입력 (예: 기획, 참고자료)"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
                        <Button onClick={handleSave}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

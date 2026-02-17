'use client';

import { useState, useMemo } from 'react';
import { Project, ArchiveDocument } from '@/types';
import { useData } from '@/context/DataProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Plus, Search, Book, Save, Edit, Trash, Layout, Eye, Hash, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import TextareaAutosize from 'react-textarea-autosize';
import { format } from 'date-fns';

interface ProjectWikiProps {
    project: Project;
}

// Simple Markdown Parser for Preview
const MarkdownPreview = ({ content }: { content: string }) => {
    // This is a naive parser. In production, use react-markdown.
    // Supports: # Headings, **Bold**, - List, > Blockquote
    const lines = content.split('\n');
    return (
        <div className="space-y-2 text-gray-800 dark:text-gray-200">
            {lines.map((line, idx) => {
                if (line.startsWith('# ')) return <h1 key={idx} className="text-2xl font-bold mt-4 mb-2">{line.replace('# ', '')}</h1>;
                if (line.startsWith('## ')) return <h2 key={idx} className="text-xl font-bold mt-3 mb-2">{line.replace('## ', '')}</h2>;
                if (line.startsWith('### ')) return <h3 key={idx} className="text-lg font-bold mt-2 mb-1">{line.replace('### ', '')}</h3>;
                if (line.startsWith('- ')) return <li key={idx} className="ml-4 list-disc">{line.replace('- ', '')}</li>;
                if (line.startsWith('> ')) return <blockquote key={idx} className="border-l-4 border-gray-300 pl-4 italic text-gray-500">{line.replace('> ', '')}</blockquote>;
                return <p key={idx} className="min-h-[1em]">{line}</p>;
            })}
        </div>
    );
};

export function ProjectWiki({ project }: ProjectWikiProps) {
    const { archiveDocuments, deleteDocument, addDocument, updateDocument } = useData();
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [previewMode, setPreviewMode] = useState<'edit' | 'preview' | 'split'>('edit'); // State for View Mode

    // Editor State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter project docs
    const docs = useMemo(() => {
        return archiveDocuments
            .filter(d => d.projectId === project.id && d.type === 'markdown')
            .filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.tags?.some(t => t.includes(searchQuery)));
    }, [archiveDocuments, project.id, searchQuery]);

    const handleSelectDoc = (doc: ArchiveDocument) => {
        setSelectedDocId(doc.id);
        setTitle(doc.title);
        setContent(doc.content);
        setTags(doc.tags?.join(', ') || '');
        setIsEditing(false);
        setPreviewMode('preview');
    };

    const handleNewDoc = () => {
        setSelectedDocId(null);
        setTitle('');
        setContent('');
        setTags('');
        setIsEditing(true);
        setPreviewMode('edit');
    };

    const handleDelete = () => {
        if (selectedDocId && confirm('정말 삭제하시겠습니까?')) {
            deleteDocument(selectedDocId);
            setSelectedDocId(null);
            setIsEditing(false);
        }
    };

    const handleSave = () => {
        if (!title.trim()) return;

        const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

        if (selectedDocId) {
            const existingDoc = archiveDocuments.find(d => d.id === selectedDocId);
            if (existingDoc) {
                updateDocument({
                    ...existingDoc,
                    title,
                    content,
                    tags: tagList,
                    updatedAt: new Date()
                });
            }
        } else {
            const newDoc: ArchiveDocument = {
                id: Date.now().toString(),
                title,
                content,
                type: 'markdown',
                projectId: project.id,
                createdAt: new Date(),
                updatedAt: new Date(),
                tags: tagList
            };
            addDocument(newDoc);
            setSelectedDocId(newDoc.id);
        }

        setIsEditing(false);
        setPreviewMode('preview');
    };

    return (
        <div className="flex h-full rounded-2xl border border-gray-200 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm animate-in fade-in duration-300">
            {/* Sidebar List */}
            <div className="w-64 border-r border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50 flex flex-col">
                <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                        <Book className="w-4 h-4" /> 문서함
                    </h3>
                    <Button variant="ghost" size="icon" onClick={handleNewDoc} className="h-7 w-7 hover:bg-gray-200 dark:hover:bg-zinc-800">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
                <div className="p-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                            placeholder="문서 검색..."
                            className="h-9 pl-8 text-sm bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {docs.length === 0 && !isEditing && (
                        <div className="text-center py-10 text-xs text-muted-foreground">
                            작성된 문서가 없습니다.
                        </div>
                    )}
                    {docs.map(doc => (
                        <button
                            key={doc.id}
                            onClick={() => handleSelectDoc(doc)}
                            className={cn(
                                "w-full text-left px-3 py-2.5 rounded-lg text-sm flex flex-col gap-1 transition-all group",
                                selectedDocId === doc.id
                                    ? "bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50"
                            )}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span className={cn("font-medium truncate", selectedDocId === doc.id ? "text-primary" : "")}>
                                    {doc.title}
                                </span>
                                <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                    {format(new Date(doc.updatedAt), 'MM.dd')}
                                </span>
                            </div>
                            {doc.tags && doc.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {doc.tags.slice(0, 2).map(t => (
                                        <span key={t} className="text-[10px] bg-muted px-1 rounded text-muted-foreground">#{t}</span>
                                    ))}
                                    {doc.tags.length > 2 && <span className="text-[10px] text-muted-foreground">+{doc.tags.length - 2}</span>}
                                </div>
                            )}
                        </button>
                    ))}
                    {isEditing && selectedDocId === null && (
                        <div className="px-3 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm flex items-center gap-2 font-medium border border-blue-100 dark:border-blue-900/50">
                            <Plus className="w-3.5 h-3.5" />
                            새 문서 작성 중...
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content / Editor */}
            <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 min-w-0">
                {(selectedDocId || isEditing) ? (
                    <>
                        {/* Toolbar */}
                        <div className="h-14 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0 bg-white dark:bg-zinc-900 sticky top-0 z-10">
                            <div className="flex-1 mr-4">
                                {isEditing ? (
                                    <Input
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="제목을 입력하세요..."
                                        className="font-bold text-lg border-none shadow-none focus-visible:ring-0 px-0 h-auto bg-transparent placeholder:text-muted-foreground/50"
                                    />
                                ) : (
                                    <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">{title}</h2>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {isEditing ? (
                                    <>
                                        <div className="flex bg-muted rounded-md p-1 mr-2">
                                            <button
                                                onClick={() => setPreviewMode('edit')}
                                                className={cn("p-1.5 rounded text-xs", previewMode === 'edit' ? "bg-white shadow text-primary" : "text-muted-foreground hover:text-foreground")}
                                                title="Edit Only"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => setPreviewMode('split')}
                                                className={cn("p-1.5 rounded text-xs", previewMode === 'split' ? "bg-white shadow text-primary" : "text-muted-foreground hover:text-foreground")}
                                                title="Split View"
                                            >
                                                <Layout className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => setPreviewMode('preview')}
                                                className={cn("p-1.5 rounded text-xs", previewMode === 'preview' ? "bg-white shadow text-primary" : "text-muted-foreground hover:text-foreground")}
                                                title="Preview Only"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <Button variant="ghost" onClick={() => setIsEditing(false)} size="sm">취소</Button>
                                        <Button onClick={handleSave} size="sm" className="gap-2"><Save className="w-4 h-4" /> 저장</Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                                            <Edit className="w-4 h-4 mr-2" /> 편집
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                            <Trash className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Meta Info (Tags) - Only in Edit or if has tags */}
                        {(isEditing || tags) && (
                            <div className="px-6 py-2 border-b border-gray-50 dark:border-zinc-800/50 flex items-center gap-2 text-sm text-muted-foreground bg-gray-50/30 dark:bg-zinc-900/50">
                                <Hash className="w-3.5 h-3.5" />
                                {isEditing ? (
                                    <Input
                                        value={tags}
                                        onChange={e => setTags(e.target.value)}
                                        placeholder="태그 입력 (콤마로 구분)"
                                        className="h-6 text-xs bg-transparent border-none shadow-none focus-visible:ring-0 p-0 placeholder:text-muted-foreground/50 w-full"
                                    />
                                ) : (
                                    <div className="flex gap-2">
                                        {tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                                            <span key={t} className="bg-muted px-2 py-0.5 rounded text-xs">#{t}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Editor/Preview Area */}
                        <div className="flex-1 overflow-hidden flex relative">
                            {/* Editor Pane */}
                            {(isEditing && (previewMode === 'edit' || previewMode === 'split')) && (
                                <div className={cn(
                                    "h-full overflow-y-auto custom-scrollbar p-6 transition-all",
                                    previewMode === 'split' ? "w-1/2 border-r border-gray-200 dark:border-zinc-800" : "w-full"
                                )}>
                                    <TextareaAutosize
                                        placeholder="# 제목\n\n내용을 작성하세요..."
                                        className="w-full h-full resize-none border-none focus:ring-0 text-base leading-relaxed text-gray-800 dark:text-gray-200 p-0 bg-transparent font-mono"
                                        minRows={20}
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            )}

                            {/* Preview Pane */}
                            {(previewMode === 'preview' || previewMode === 'split') && (
                                <div className={cn(
                                    "h-full overflow-y-auto custom-scrollbar p-8 transition-all bg-white dark:bg-zinc-900",
                                    previewMode === 'split' ? "w-1/2 bg-gray-50/50 dark:bg-zinc-950/30" : "w-full"
                                )}>
                                    <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                                        <MarkdownPreview content={content} />
                                    </article>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <Book className="w-16 h-16 opacity-10 mb-4" />
                        <p>문서를 선택하거나 새로운 문서를 작성하세요.</p>
                        <Button variant="outline" className="mt-4" onClick={handleNewDoc}>
                            <Plus className="w-4 h-4 mr-2" /> 새 문서 만들기
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

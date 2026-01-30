'use client';

import { useState } from 'react';
import { Project, ArchiveDocument } from '@/types';
import { useData } from '@/context/DataProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Plus, Search, Book, Code, Save, Edit, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import TextareaAutosize from 'react-textarea-autosize';

interface ProjectWikiProps {
    project: Project;
}

export function ProjectWiki({ project }: ProjectWikiProps) {
    const { archiveDocuments, deleteDocument, addDocument, updateDocument } = useData(); // Assuming these exist
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Editor State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    // Filter project docs
    const docs = archiveDocuments.filter(d => d.projectId === project.id);

    const handleSelectDoc = (doc: ArchiveDocument) => {
        setSelectedDocId(doc.id);
        setTitle(doc.title);
        setContent(doc.content);
        setIsEditing(false);
    };

    const handleNewDoc = () => {
        setSelectedDocId(null);
        setTitle('');
        setContent('');
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!title.trim()) return;

        if (selectedDocId) {
            const existingDoc = archiveDocuments.find(d => d.id === selectedDocId);
            if (existingDoc) {
                updateDocument({
                    ...existingDoc,
                    title,
                    content,
                    updatedAt: new Date()
                });
            }
        } else {
            const newDoc: ArchiveDocument = {
                id: Date.now().toString(),
                title,
                content,
                type: 'markdown', // Fixed type
                projectId: project.id,
                createdAt: new Date(),
                updatedAt: new Date(),
                tags: []
            };
            addDocument(newDoc);
            setSelectedDocId(newDoc.id);
        }

        alert('문서가 저장되었습니다.');
        setIsEditing(false);
    };

    return (
        <div className="flex h-full rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            {/* Sidebar List */}
            <div className="w-64 border-r border-gray-100 bg-gray-50 flex flex-col">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2">
                        <Book className="w-4 h-4" /> 위키/문서
                    </h3>
                    <Button variant="ghost" size="icon" onClick={handleNewDoc} className="h-7 w-7">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
                <div className="p-2">
                    <div className="relative mb-2">
                        <Search className="absolute left-2 top-2 w-3 h-3 text-muted-foreground" />
                        <Input placeholder="문서 검색..." className="h-8 pl-7 text-xs bg-white" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
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
                                "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors",
                                selectedDocId === doc.id ? "bg-white shadow-sm font-medium text-primary" : "text-gray-600 hover:bg-gray-100"
                            )}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            <span className="truncate">{doc.title}</span>
                        </button>
                    ))}
                    {isEditing && selectedDocId === null && (
                        <div className="px-3 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm flex items-center gap-2 font-medium">
                            <Plus className="w-3.5 h-3.5" />
                            새 문서 작성 중...
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content / Editor */}
            <div className="flex-1 flex flex-col bg-white">
                {(selectedDocId || isEditing) ? (
                    <>
                        {/* Toolbar */}
                        <div className="h-14 border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
                            {isEditing ? (
                                <Input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="문서 제목을 입력하세요"
                                    className="font-bold text-lg border-none shadow-none focus-visible:ring-0 px-0 h-auto"
                                />
                            ) : (
                                <h2 className="font-bold text-lg text-gray-900">{title}</h2>
                            )}

                            <div className="flex items-center gap-2">
                                {isEditing ? (
                                    <>
                                        <Button variant="ghost" onClick={() => setIsEditing(false)}>취소</Button>
                                        <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" /> 저장</Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                                            <Edit className="w-4 h-4 mr-2" /> 편집
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Editor/Preview Area */}
                        <div className="flex-1 overflow-y-auto p-8">
                            {isEditing ? (
                                <TextareaAutosize
                                    placeholder="내용을 작성하세요... (Markdown 지원)"
                                    className="w-full min-h-[500px] resize-none border-none focus:ring-0 text-base leading-relaxed text-gray-800 p-0"
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                />
                            ) : (
                                <div className="prose prose-sm md:prose-base max-w-none text-gray-800">
                                    {/* Simple Rendering for now. In real app, use ReactMarkdown */}
                                    <pre className="whitespace-pre-wrap font-sans">{content}</pre>
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

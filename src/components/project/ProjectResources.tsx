"use client"

import { useState } from 'react';
import { Project, ProjectResource } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useData } from '@/context/DataProvider';
import { Link2, Plus, Trash2, ExternalLink, File, Figma, Github, HardDrive, Image as ImageIcon, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface ProjectResourcesProps {
    project: Project;
}

export function ProjectResources({ project }: ProjectResourcesProps) {
    const { updateProject } = useData();
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [type, setType] = useState<ProjectResource['type']>('link');
    const [desc, setDesc] = useState('');

    const handleAddResource = () => {
        if (!title.trim() || !url.trim()) return;

        // Auto-detect type if generic 'link' is selected
        let finalType = type;
        if (type === 'link') {
            if (url.includes('figma.com')) finalType = 'figma';
            else if (url.includes('github.com')) finalType = 'github';
            else if (url.includes('drive.google.com') || url.includes('dropbox.com')) finalType = 'drive';
            else if (url.includes('notion.so')) finalType = 'notion';
        }

        const newResource: ProjectResource = {
            id: Date.now().toString(),
            title,
            url,
            type: finalType,
            description: desc,
            createdAt: new Date()
        };

        const updatedProject = {
            ...project,
            resources: [...(project.resources || []), newResource]
        };

        updateProject(updatedProject);

        // Reset
        setTitle('');
        setUrl('');
        setType('link');
        setDesc('');
        setIsAddOpen(false);
    };

    const handleDeleteResource = (id: string) => {
        if (!confirm('리소스를 삭제하시겠습니까?')) return;
        const updatedProject = {
            ...project,
            resources: (project.resources || []).filter(r => r.id !== id)
        };
        updateProject(updatedProject);
    };

    const getIcon = (type: ProjectResource['type']) => {
        switch (type) {
            case 'figma': return <Figma className="w-5 h-5 text-purple-500" />;
            case 'github': return <Github className="w-5 h-5 text-gray-800 dark:text-gray-200" />;
            case 'drive': return <HardDrive className="w-5 h-5 text-green-500" />;
            case 'notion': return <File className="w-5 h-5 text-gray-500" />; // Notion icon replacement
            case 'image': return <ImageIcon className="w-5 h-5 text-blue-500" />;
            case 'file': return <File className="w-5 h-5 text-orange-500" />;
            default: return <Link2 className="w-5 h-5 text-blue-400" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Link2 className="w-6 h-6 text-blue-500" /> 리소스 라이브러리 (Library)
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        프로젝트, 디자인, 문서 등 흩어진 링크와 파일을 한 곳에 보관하세요.
                    </p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" /> 리소스 추가
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(project.resources || []).length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-muted/30 rounded-xl border border-dashed">
                        <Layout className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <h3 className="font-semibold text-lg text-muted-foreground">리소스가 없습니다</h3>
                        <p className="text-sm text-gray-500 mb-4">자주 사용하는 링크나 문서를 추가하여 생산성을 높이세요.</p>
                        <Button variant="outline" onClick={() => setIsAddOpen(true)}>링크 추가하기</Button>
                    </div>
                ) : (
                    (project.resources || []).map(resource => (
                        <div key={resource.id} className="group bg-white dark:bg-zinc-900 p-4 rounded-xl border border-border shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-muted rounded-lg">
                                        {getIcon(resource.type)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm leading-tight line-clamp-1">{resource.title}</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">{resource.type}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2 text-muted-foreground hover:text-red-500 h-8 w-8"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteResource(resource.id); }}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>

                            {resource.description && (
                                <p className="text-xs text-gray-500 line-clamp-2 h-8">
                                    {resource.description}
                                </p>
                            )}

                            <a
                                href={resource.url.startsWith('http') ? resource.url : `https://${resource.url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-auto w-full"
                            >
                                <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                                    <ExternalLink className="w-3 h-3" /> 열기
                                </Button>
                            </a>
                        </div>
                    ))
                )}
            </div>

            {/* Add Resource Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>새 리소스 추가</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>제목</Label>
                            <Input
                                placeholder="예: 기획서 드래프트"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>URL / 경로</Label>
                            <Input
                                placeholder="https://..."
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>유형</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {['link', 'figma', 'github', 'drive'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setType(t as any)}
                                        className={cn(
                                            "text-xs py-2 rounded-md border transition-all capitalize",
                                            type === t
                                                ? "bg-primary text-primary-foreground border-primary font-bold"
                                                : "bg-background border-border hover:bg-muted"
                                        )}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>설명 (선택)</Label>
                            <Input
                                placeholder="어떤 문서인가요?"
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>취소</Button>
                        <Button onClick={handleAddResource}>추가하기</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

import React, { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Project, ProjectResource } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Link2, File, Key, Image as ImageIcon, Plus, Trash2, ExternalLink, MoreVertical, Layout, Figma, Github, HardDrive } from 'lucide-react';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ResourceLibraryProps {
    project: Project;
}

export function ResourceLibrary({ project }: ResourceLibraryProps) {
    const { projectResources, addProjectResource, deleteProjectResource } = useData();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Form State
    const [newTitle, setNewTitle] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newType, setNewType] = useState<ProjectResource['type']>('link');
    const [newDesc, setNewDesc] = useState('');

    const resources = projectResources.filter(r => r.projectId === project.id);

    const handleAdd = () => {
        if (!newTitle || !newUrl) return;

        const newResource: ProjectResource = {
            id: crypto.randomUUID(),
            projectId: project.id,
            title: newTitle,
            url: newUrl,
            type: newType,
            description: newDesc,
            addedAt: new Date()
        };

        addProjectResource(newResource);
        setIsAddDialogOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setNewTitle('');
        setNewUrl('');
        setNewType('link');
        setNewDesc('');
    };

    const iconMap: Record<string, any> = {
        link: Link2,
        file: File,
        credential: Key,
        design: Layout,
        figma: Figma,
        github: Github,
        drive: HardDrive,
        notion: File,
        image: ImageIcon
    };

    const handleOpenUrl = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h3 className="text-lg font-bold">리소스 라이브러리</h3>
                    <p className="text-sm text-muted-foreground">프로젝트 관련 링크, 파일, 디자인 자산 등을 한곳에서 관리하세요.</p>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> 리소스 추가
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto p-1">
                {resources.map(resource => {
                    const Icon = iconMap[resource.type];
                    return (
                        <Card key={resource.id} className="group hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div className={cn(
                                        "p-2 rounded-md",
                                        resource.type === 'link' && "bg-blue-500/10 text-blue-400",
                                        resource.type === 'file' && "bg-orange-500/10 text-orange-400",
                                        resource.type === 'credential' && "bg-red-500/10 text-red-400",
                                        resource.type === 'design' && "bg-purple-500/10 text-purple-400",
                                        resource.type === 'figma' && "bg-purple-500/10 text-purple-400",
                                        resource.type === 'github' && "bg-zinc-500/10 text-zinc-300",
                                        resource.type === 'drive' && "bg-green-500/10 text-green-400",
                                        resource.type === 'notion' && "bg-gray-500/10 text-muted-foreground",
                                        resource.type === 'image' && "bg-sky-500/10 text-sky-400"
                                    )}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => deleteProjectResource(resource.id)} className="text-red-600">
                                                <Trash2 className="w-4 h-4 mr-2" /> 삭제
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div>
                                    <h4 className="font-semibold truncate" title={resource.title}>{resource.title}</h4>
                                    <p className="text-xs text-muted-foreground truncate" title={resource.description || ''}>
                                        {resource.description || '설명 없음'}
                                    </p>
                                </div>

                                <div className="mt-auto pt-2 flex items-center justify-between border-t border-border">
                                    <span className="text-[10px] text-muted-foreground">
                                        {format(new Date(resource.addedAt), 'MM.dd')}
                                    </span>
                                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => handleOpenUrl(resource.url)}>
                                        열기 <ExternalLink className="w-3 h-3 ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {resources.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-muted-foreground border-2 border-dashed rounded-xl">
                        <Link2 className="w-12 h-12 opacity-20 mb-3" />
                        <p>등록된 리소스가 없습니다.</p>
                        <Button variant="link" onClick={() => setIsAddDialogOpen(true)}>
                            첫 번째 리소스 추가하기
                        </Button>
                    </div>
                )}
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>리소스 추가</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">유형</Label>
                            <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="link">웹 링크</SelectItem>
                                    <SelectItem value="design">디자인 (UI/UX)</SelectItem>
                                    <SelectItem value="figma">Figma</SelectItem>
                                    <SelectItem value="github">GitHub</SelectItem>
                                    <SelectItem value="drive">구글 드라이브</SelectItem>
                                    <SelectItem value="notion">Notion</SelectItem>
                                    <SelectItem value="file">파일 경로</SelectItem>
                                    <SelectItem value="image">이미지</SelectItem>
                                    <SelectItem value="credential">계정/키</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">제목</Label>
                            <Input
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="col-span-3"
                                placeholder="예: 기획서 드라이브"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">URL/경로</Label>
                            <Input
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                className="col-span-3"
                                placeholder="https://..."
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">설명 (옵션)</Label>
                            <Input
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                className="col-span-3"
                                placeholder="간단한 설명..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>취소</Button>
                        <Button onClick={handleAdd}>추가하기</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

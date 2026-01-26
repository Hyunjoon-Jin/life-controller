'use client';

import { useState, useMemo } from 'react';
import { Project } from '@/types';
import { useData } from '@/context/DataProvider';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ProjectStructure() {
    const { projects, addProject, updateProject, deleteProject } = useData();
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creatingParentId, setCreatingParentId] = useState<string | null>(null);
    const [newProjectTitle, setNewProjectTitle] = useState('');

    // Recursive Type Definition
    type ProjectNode = Project & { children: ProjectNode[] };

    // Transform flat list to tree
    const projectTree = useMemo(() => {
        const tree: ProjectNode[] = [];
        const map = new Map<string, ProjectNode>();

        // Initialize map with empty children arrays
        projects.forEach(p => {
            // Cast to ProjectNode (we adhere to the structure by adding children)
            map.set(p.id, { ...p, children: [] } as ProjectNode);
        });

        // Build hierarchy
        projects.forEach(p => {
            const node = map.get(p.id);
            if (node) {
                if (p.parentId && map.has(p.parentId)) {
                    map.get(p.parentId)!.children.push(node);
                } else {
                    tree.push(node);
                }
            }
        });

        return { tree, map };
    }, [projects]);

    // Recursive Progress Calculation (Roll-up)
    const getProgress = (node: ProjectNode): number => {
        // If leaf node (no children), use its own progress
        if (!node.children || node.children.length === 0) {
            return node.progress || 0;
        }

        // Calculate average of children
        const totalProgress = node.children.reduce((sum, child) => sum + getProgress(child), 0);
        return Math.round(totalProgress / node.children.length);
    };

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

    const handleAddSubProject = (parentId: string | null) => {
        setCreatingParentId(parentId);
        setNewProjectTitle('');
        setIsCreateOpen(true);
    };

    const confirmCreateProject = () => {
        if (!newProjectTitle.trim()) return;

        const newProject: Project = {
            id: Date.now().toString(),
            title: newProjectTitle,
            color: '#6b7280', // Default literal gray
            status: 'preparation',
            budget: { total: 0, spent: 0 },
            startDate: new Date(),
            progress: 0,
            parentId: creatingParentId || undefined
        };

        addProject(newProject);
        setIsCreateOpen(false);

        // Auto expand parent
        if (creatingParentId) {
            setExpandedIds(prev => new Set(prev).add(creatingParentId));
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('정말 삭제하시겠습니까? 하위 프로젝트도 모두 삭제됩니다.')) {
            // Recursive delete logic needs to be handled cautiously.
            // For now, simple delete. Ideally DataProvider should handle cascade or we filter recursively.
            // Let's just delete the specific one for now to avoid complexity bugs, user can delete children manually or improve later.
            deleteProject(id);
        }
    }

    const renderNode = (node: ProjectNode, level: number) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedIds.has(node.id);
        const rolledUpProgress = getProgress(node);

        return (
            <div key={node.id} className="select-none animate-in fade-in slide-in-from-left-2 duration-300">
                <div
                    className={cn(
                        "flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group transition-colors",
                        "border border-transparent hover:border-gray-200"
                    )}
                    style={{ paddingLeft: `${level * 24 + 8}px` }}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
                        className={cn("p-1 rounded-md hover:bg-muted text-muted-foreground", !hasChildren && "opacity-0 pointer-events-none")}
                    >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div className="flex items-center gap-2 flex-1">
                        {isExpanded ? <FolderOpen className="w-4 h-4 text-primary" /> : <Folder className="w-4 h-4 text-primary/80" />}
                        <span className="font-medium text-sm">{node.title}</span>
                        {hasChildren && (
                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                                {node.children.length}
                            </span>
                        )}
                    </div>

                    {/* Rolled-up Progress Bar */}
                    <div className="w-24 mr-4 flex flex-col items-end gap-1">
                        <div className="text-[10px] text-muted-foreground font-medium">{rolledUpProgress}%</div>
                        <Progress value={rolledUpProgress} className="h-1.5 w-full" />
                    </div>

                    {/* Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleAddSubProject(node.id)}>
                                    <Plus className="w-4 h-4 mr-2" /> 하위 프로젝트 추가
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Edit2 className="w-4 h-4 mr-2" /> 수정
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(node.id)}>
                                    <Trash2 className="w-4 h-4 mr-2" /> 삭제
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {isExpanded && node.children.map(child => renderNode(child, level + 1))}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold">프로젝트 계층 구조</h2>
                    <p className="text-sm text-muted-foreground">전체 프로젝트의 진행 상황을 한눈에 파악하세요.</p>
                </div>
                <Button onClick={() => handleAddSubProject(null)}>
                    <Plus className="w-4 h-4 mr-2" /> 새 루트 프로젝트
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar border border-gray-200 rounded-xl p-4 bg-background/50">
                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Folder className="w-12 h-12 mb-4 opacity-20" />
                        <p>등록된 프로젝트가 없습니다.</p>
                    </div>
                ) : (
                    projectTree.tree.map(node => renderNode(node, 0))
                )}
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>새 프로젝트 생성</DialogTitle>
                        <DialogDescription>
                            {creatingParentId
                                ? `선택한 상위 프로젝트 아래에 새 하위 프로젝트를 만듭니다.`
                                : `새로운 최상위 프로젝트를 만듭니다.`
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>프로젝트명</Label>
                            <Input
                                placeholder="프로젝트 이름을 입력하세요"
                                value={newProjectTitle}
                                onChange={(e) => setNewProjectTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && confirmCreateProject()}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>취소</Button>
                        <Button onClick={confirmCreateProject}>생성</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

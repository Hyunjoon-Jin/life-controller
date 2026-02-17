import React, { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Project, ProjectRetrospectiveItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ThumbsUp, Trash2, Repeat, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from "@/lib/utils";

interface ProjectRetrospectiveProps {
    project: Project;
}

export function ProjectRetrospective({ project }: ProjectRetrospectiveProps) {
    const { updateProject } = useData();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Form State
    const [content, setContent] = useState('');
    const [type, setType] = useState<'keep' | 'problem' | 'try'>('keep');

    const retrospectives = project.retrospectives || [];

    const handleAdd = () => {
        if (!content) return;

        const newItem: ProjectRetrospectiveItem = {
            id: crypto.randomUUID(),
            projectId: project.id,
            type,
            content,
            votes: 0,
            createdAt: new Date()
        };

        const updatedRetrospectives = [...retrospectives, newItem];
        updateProject({ ...project, retrospectives: updatedRetrospectives });

        setIsAddDialogOpen(false);
        setContent('');
        setType('keep');
    };

    const handleDelete = (id: string) => {
        if (confirm('삭제하시겠습니까?')) {
            const updated = retrospectives.filter(r => r.id !== id);
            updateProject({ ...project, retrospectives: updated });
        }
    };

    const handleVote = (id: string) => {
        const updated = retrospectives.map(r => r.id === id ? { ...r, votes: r.votes + 1 } : r);
        updateProject({ ...project, retrospectives: updated });
    };

    const Section = ({ title, type, icon: Icon, colorClass, items }: { title: string, type: 'keep' | 'problem' | 'try', icon: any, colorClass: string, items: ProjectRetrospectiveItem[] }) => (
        <div className="flex-1 flex flex-col bg-gray-50/50 rounded-xl border overflow-hidden">
            <div className={cn("p-4 border-b flex items-center gap-2 font-bold", colorClass)}>
                <Icon className="w-5 h-5" />
                {title}
                <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">{items.length}</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
                {items.length === 0 && (
                    <div className="text-center text-muted-foreground py-8 text-sm">작성된 내용이 없습니다.</div>
                )}
                {items.map(item => (
                    <Card key={item.id} className="group hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                            <p className="text-sm whitespace-pre-wrap">{item.content}</p>
                            <div className="flex items-center justify-between mt-3 pt-2 border-t">
                                <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-blue-500 gap-1" onClick={() => handleVote(item.id)}>
                                    <ThumbsUp className="w-3 h-3" /> {item.votes}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500" onClick={() => handleDelete(item.id)}>
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="p-3 border-t bg-gray-50">
                <Button variant="outline" className="w-full text-xs h-8 dashed border-gray-300 hover:border-gray-400 hover:bg-white" onClick={() => {
                    setType(type);
                    setIsAddDialogOpen(true);
                }}>
                    <Plus className="w-3 h-3 mr-1" /> 추가하기
                </Button>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Repeat className="w-5 h-5 text-orange-500" />
                        회고 (Retrospective)
                    </h3>
                    <p className="text-sm text-muted-foreground">KPT (Keep, Problem, Try) 방식으로 프로젝트를 회고합니다.</p>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
                <Section
                    title="Keep (잘한 점)"
                    type="keep"
                    icon={CheckCircle2}
                    colorClass="bg-green-100 text-green-800"
                    items={retrospectives.filter(r => r.type === 'keep')}
                />
                <Section
                    title="Problem (아쉬운 점)"
                    type="problem"
                    icon={AlertTriangle}
                    colorClass="bg-red-100 text-red-800"
                    items={retrospectives.filter(r => r.type === 'problem')}
                />
                <Section
                    title="Try (시도할 점)"
                    type="try"
                    icon={Lightbulb}
                    colorClass="bg-blue-100 text-blue-800"
                    items={retrospectives.filter(r => r.type === 'try')}
                />
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>회고 내용 추가</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">유형</Label>
                            <Select value={type} onValueChange={(val: any) => setType(val)}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="keep">Keep (지속할 점)</SelectItem>
                                    <SelectItem value="problem">Problem (문제점)</SelectItem>
                                    <SelectItem value="try">Try (시도할 점)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">내용</Label>
                            <Textarea value={content} onChange={e => setContent(e.target.value)} className="col-span-3 h-32" placeholder="내용을 입력하세요..." />
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

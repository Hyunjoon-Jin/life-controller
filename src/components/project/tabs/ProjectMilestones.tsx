import React, { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Project, Milestone } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Flag, Calendar as CalendarIcon, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, isPast, isToday } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface ProjectMilestonesProps {
    project: Project;
}

export function ProjectMilestones({ project }: ProjectMilestonesProps) {
    const { updateProject } = useData();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [desc, setDesc] = useState('');

    const milestones = (project.milestones || []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const handleAdd = () => {
        if (!title || !date) return;

        const newMilestone: Milestone = {
            id: crypto.randomUUID(),
            projectId: project.id,
            title,
            date,
            description: desc,
            status: 'pending',
            order: milestones.length
        };

        const updatedMilestones = [...milestones, newMilestone];
        updateProject({ ...project, milestones: updatedMilestones });

        setIsAddDialogOpen(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        if (confirm('삭제하시겠습니까?')) {
            const updatedMilestones = milestones.filter(m => m.id !== id);
            updateProject({ ...project, milestones: updatedMilestones });
        }
    };

    const toggleStatus = (milestone: Milestone) => {
        const newStatus: 'pending' | 'completed' = milestone.status === 'completed' ? 'pending' : 'completed';
        const updatedMilestones = milestones.map(m => m.id === milestone.id ? { ...m, status: newStatus } : m);
        updateProject({ ...project, milestones: updatedMilestones });
    };

    const resetForm = () => {
        setTitle('');
        setDate(new Date());
        setDesc('');
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Flag className="w-5 h-5 text-indigo-500" />
                        마일스톤 (Milestones)
                    </h3>
                    <p className="text-sm text-muted-foreground">프로젝트의 주요 단계와 목표 날짜를 로드맵으로 관리합니다.</p>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> 마일스톤 추가
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 rounded-xl border relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-200" />

                <div className="space-y-8 relative">
                    {milestones.map((milestone, index) => {
                        const isCompleted = milestone.status === 'completed';
                        const isOverdue = milestone.status === 'pending' && isPast(new Date(milestone.date)) && !isToday(new Date(milestone.date));

                        return (
                            <div key={milestone.id} className="flex gap-6 group">
                                {/* Timeline Node */}
                                <div className={cn(
                                    "relative z-10 w-16 flex flex-col items-center justify-start pt-1",
                                    isCompleted ? "text-green-600" : isOverdue ? "text-red-500" : "text-gray-400"
                                )}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white transition-colors",
                                        isCompleted ? "border-green-500 bg-green-50" :
                                            isOverdue ? "border-red-500 bg-red-50" : "border-gray-300"
                                    )}>
                                        {isCompleted ? <CheckCircle className="w-4 h-4" /> :
                                            isOverdue ? <AlertCircle className="w-4 h-4" /> :
                                                <Clock className="w-4 h-4" />}
                                    </div>
                                    <div className="text-xs font-medium mt-1 text-center">
                                        {format(new Date(milestone.date), 'MM.dd')}
                                    </div>
                                </div>

                                {/* Content Card */}
                                <Card className={cn(
                                    "flex-1 transition-all hover:shadow-md",
                                    isCompleted ? "opacity-70" : ""
                                )}>
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div onClick={() => toggleStatus(milestone)} className="cursor-pointer flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className={cn("font-bold text-lg", isCompleted && "line-through decoration-gray-400")}>
                                                    {milestone.title}
                                                </h4>
                                                {isOverdue && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Overdue</span>}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{milestone.description || '설명 없음'}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(milestone.id)}>
                                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}

                    {milestones.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Flag className="w-12 h-12 opacity-20 mb-3" />
                            <p>등록된 마일스톤이 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>새 마일스톤 추가</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">제목</Label>
                            <Input value={title} onChange={e => setTitle(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">날짜</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "col-span-3 justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>날짜 선택</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">설명</Label>
                            <Textarea value={desc} onChange={e => setDesc(e.target.value)} className="col-span-3" />
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

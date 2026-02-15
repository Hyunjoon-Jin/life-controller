'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/context/DataProvider';
import { DatePicker } from '@/components/ui/date-picker';


interface ProjectDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    projectToEdit?: Project | null; // If null, create mode
}

export function ProjectDialog({ isOpen, onOpenChange, projectToEdit }: ProjectDialogProps) {
    const { addProject, updateProject, people } = useData();

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<string>('preparation');
    const [color, setColor] = useState('#6b7280');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);

    const [manager, setManager] = useState('');
    const [myRole, setMyRole] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [budgetTotal, setBudgetTotal] = useState('');

    const [lastProjectId, setLastProjectId] = useState<string | null>(null);

    useEffect(() => {
        if (projectToEdit) {
            if (projectToEdit.id !== lastProjectId || isOpen) {
                // Prevent creating loop if parent passes new object reference but same ID
                if (projectToEdit.id === lastProjectId && title === projectToEdit.title) return;

                // eslint-disable-next-line react-hooks/set-state-in-effect
                setTitle(projectToEdit.title);
                setDescription(projectToEdit.description || '');
                setStatus(projectToEdit.status || 'preparation');
                setColor(projectToEdit.color);
                setStartDate(projectToEdit.startDate ? new Date(projectToEdit.startDate) : undefined);
                setEndDate(projectToEdit.endDate ? new Date(projectToEdit.endDate) : undefined);

                setManager(projectToEdit.manager || '');
                setMyRole(projectToEdit.myRole || '');
                setSelectedMembers(projectToEdit.members || []);
                setBudgetTotal(projectToEdit.budget?.total.toString() || '');
                setLastProjectId(projectToEdit.id);
            }
        } else {
            // Reset for create
            if (lastProjectId !== null || isOpen) {
                // Optimization: if we already reset, don't do it again?
                // But we need to handle "Open Create Dialog" action.
                // Ideally check if we are already in "create state".
                if (lastProjectId === null && title === '' && status === 'preparation') return;

                setTitle('');
                setDescription('');
                setStatus('preparation');
                setColor('#3b82f6'); // Default Blue
                setStartDate(new Date());
                setEndDate(undefined);
                setManager('Me');

                setMyRole('');
                setSelectedMembers([]);
                setBudgetTotal('');
                setLastProjectId(null);
            }
        }
    }, [projectToEdit, isOpen, lastProjectId, title, status]);

    const handleSave = () => {
        if (!title.trim()) return;

        const projectData: Project = {
            id: projectToEdit ? projectToEdit.id : Date.now().toString(),
            title,
            description,
            status: status as any,
            color,
            manager,
            myRole,
            members: selectedMembers,
            startDate: startDate,
            endDate: endDate,
            budget: {

                total: Number(budgetTotal) || 0,
                spent: projectToEdit?.budget?.spent || 0
            },
            progress: projectToEdit?.progress || 0,
            parentId: projectToEdit?.parentId
        };

        if (projectToEdit) {
            updateProject(projectData);
        } else {
            addProject(projectData);
        }
        onOpenChange(false);
    };

    const toggleMember = (personId: string) => {
        setSelectedMembers(prev =>
            prev.includes(personId)
                ? prev.filter(id => id !== personId)
                : [...prev, personId]
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto custom-scrollbar">
                <DialogHeader>
                    <DialogTitle>{projectToEdit ? '프로젝트 수정' : '새 프로젝트 생성'}</DialogTitle>
                    <DialogDescription>
                        프로젝트의 주요 정보를 입력해주세요.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">프로젝트명</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
                        />
                    </div>

                    {/* Role & Manager */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">나의 역할</Label>
                        <Input
                            value={myRole}
                            onChange={(e) => setMyRole(e.target.value)}
                            className="col-span-3"
                            placeholder="예: PM, 디자이너, 개발자"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">관리자</Label>
                        <Input
                            value={manager}
                            onChange={(e) => setManager(e.target.value)}
                            className="col-span-3"
                            placeholder="프로젝트 총괄 관리자 이름"
                        />
                    </div>

                    {/* Team Members */}
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right mt-2">팀원 선택</Label>
                        <div className="col-span-3 border rounded-md p-3 h-32 overflow-y-auto bg-muted/20">
                            {people.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-2">등록된 인맥이 없습니다. 인맥 관리에서 추가해주세요.</p>
                            ) : (
                                <div className="space-y-2">
                                    {people.map(person => (
                                        <div key={person.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`member-${person.id}`}
                                                checked={selectedMembers.includes(person.id)}
                                                onChange={() => toggleMember(person.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <label
                                                htmlFor={`member-${person.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {person.name} <span className="text-xs text-muted-foreground">({person.relationship})</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">상태</Label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="preparation">준비 중</option>
                            <option value="active">진행 중</option>
                            <option value="hold">보류됨</option>
                            <option value="completed">완료됨</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">색상</Label>
                        <div className="col-span-3 flex gap-2">
                            <Input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-12 h-10 p-1"
                            />
                            <div className="text-xs text-muted-foreground flex items-center">리스트에 표시될 색상입니다.</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">기간</Label>
                        <div className="col-span-3 flex gap-2">
                            <DatePicker
                                date={startDate}
                                setDate={setStartDate}
                            />
                            <span className="flex items-center text-muted-foreground">~</span>
                            <DatePicker
                                date={endDate}
                                setDate={setEndDate}
                            />
                        </div>

                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">총 예산</Label>
                        <Input
                            type="number"
                            value={budgetTotal}
                            onChange={(e) => setBudgetTotal(e.target.value)}
                            className="col-span-3"
                            placeholder="0"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right mt-2">설명</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="col-span-3 min-h-[80px]"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
                    <Button onClick={handleSave}>저장</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

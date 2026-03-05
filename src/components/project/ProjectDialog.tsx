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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ProjectDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    projectToEdit?: Project | null;
}

const COLOR_PRESETS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#10b981',
    '#f59e0b', '#ef4444', '#06b6d4', '#6b7280',
];

export function ProjectDialog({ isOpen, onOpenChange, projectToEdit }: ProjectDialogProps) {
    const { addProject, updateProject, people, projects, tasks, addTask, goals } = useData();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<string>('preparation');
    const [color, setColor] = useState('#3b82f6');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [manager, setManager] = useState('');
    const [myRole, setMyRole] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [budgetTotal, setBudgetTotal] = useState('');
    const [isTemplate, setIsTemplate] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [selectedGoalId, setSelectedGoalId] = useState<string>('');
    const [category, setCategory] = useState<'work' | 'personal' | 'study'>('work');
    const [lastProjectId, setLastProjectId] = useState<string | null>(null);

    const templates = projects.filter(p => p.isTemplate);

    useEffect(() => {
        if (projectToEdit) {
            if (projectToEdit.id !== lastProjectId || isOpen) {
                if (projectToEdit.id === lastProjectId && title === projectToEdit.title) return;
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
                setIsTemplate(projectToEdit.isTemplate || false);
                setSelectedGoalId(projectToEdit.connectedGoalId || '');
                setCategory(projectToEdit.category || 'work');
                setLastProjectId(projectToEdit.id);
            }
        } else {
            if (lastProjectId !== null || isOpen) {
                if (lastProjectId === null && title === '' && status === 'preparation') return;
                setTitle('');
                setDescription('');
                setStatus('preparation');
                setColor('#3b82f6');
                setStartDate(new Date());
                setEndDate(undefined);
                setManager('');
                setMyRole('');
                setSelectedMembers([]);
                setBudgetTotal('');
                setIsTemplate(false);
                setSelectedTemplateId('');
                setSelectedGoalId('');
                setCategory('work');
                setLastProjectId(null);
            }
        }
    }, [projectToEdit, isOpen, lastProjectId]);

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplateId(templateId);
        if (templateId) {
            const template = templates.find(t => t.id === templateId);
            if (template) {
                setTitle(`${template.title} (Copy)`);
                setDescription(template.description || '');
                setColor(template.color);
                setManager(template.manager || '');
                setMyRole(template.myRole || '');
                setBudgetTotal(template.budget?.total.toString() || '');
            }
        }
    };

    const handleSave = () => {
        if (!title.trim()) return;
        const newProjectId = projectToEdit ? projectToEdit.id : Date.now().toString();
        const projectData: Project = {
            id: newProjectId,
            title,
            description,
            status: status as any,
            color,
            manager,
            myRole,
            members: selectedMembers,
            startDate,
            endDate,
            budget: { total: Number(budgetTotal) || 0, spent: projectToEdit?.budget?.spent || 0 },
            progress: projectToEdit?.progress || 0,
            parentId: projectToEdit?.parentId,
            isTemplate,
            connectedGoalId: selectedGoalId,
            category,
        };
        if (projectToEdit) {
            updateProject(projectData);
        } else {
            addProject(projectData);
            if (selectedTemplateId) {
                const templateTasks = tasks.filter(t => t.projectId === selectedTemplateId);
                templateTasks.forEach(task => {
                    addTask({ ...task, id: Date.now().toString() + Math.random().toString(36).substr(2, 5), projectId: newProjectId, completed: false, progress: 0, startDate: undefined, endDate: undefined, dependencies: [] });
                });
            }
        }
        onOpenChange(false);
    };

    const toggleMember = (personId: string) => {
        setSelectedMembers(prev =>
            prev.includes(personId) ? prev.filter(id => id !== personId) : [...prev, personId]
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto custom-scrollbar bg-modal border-border">
                <DialogHeader className="pb-2">
                    <DialogTitle className="text-xl font-bold">
                        {projectToEdit ? '프로젝트 수정' : '새 프로젝트 생성'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        프로젝트의 주요 정보를 입력해주세요.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-2">
                    {/* Template Selection */}
                    {!projectToEdit && templates.length > 0 && (
                        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">템플릿 불러오기</Label>
                            <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue placeholder="빈 프로젝트로 시작" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">빈 프로젝트로 시작</SelectItem>
                                    {templates.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Section: 기본 정보 */}
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">기본 정보</Label>

                        {/* Title */}
                        <div className="space-y-1.5">
                            <Label htmlFor="proj-title">프로젝트명 <span className="text-destructive">*</span></Label>
                            <Input
                                id="proj-title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="프로젝트 이름을 입력하세요"
                                className="bg-background border-border"
                            />
                        </div>

                        {/* Category + Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>카테고리</Label>
                                <Select value={category} onValueChange={v => setCategory(v as any)}>
                                    <SelectTrigger className="bg-background border-border">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="work">💼 업무</SelectItem>
                                        <SelectItem value="personal">🏠 개인</SelectItem>
                                        <SelectItem value="study">📚 학습</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>상태</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="bg-background border-border">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="preparation">⏳ 준비 중</SelectItem>
                                        <SelectItem value="active">🚀 진행 중</SelectItem>
                                        <SelectItem value="hold">⏸ 보류됨</SelectItem>
                                        <SelectItem value="completed">✅ 완료됨</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* My Role + Manager */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="proj-role">나의 역할</Label>
                                <Input
                                    id="proj-role"
                                    value={myRole}
                                    onChange={e => setMyRole(e.target.value)}
                                    placeholder="예: PM, 디자이너"
                                    className="bg-background border-border"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="proj-manager">관리자</Label>
                                <Input
                                    id="proj-manager"
                                    value={manager}
                                    onChange={e => setManager(e.target.value)}
                                    placeholder="총괄 관리자 이름"
                                    className="bg-background border-border"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Section: 일정 & 예산 */}
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">일정 & 예산</Label>

                        {/* Date Range */}
                        <div className="space-y-1.5">
                            <Label>프로젝트 기간</Label>
                            <div className="flex items-center gap-2">
                                <DatePicker date={startDate} setDate={setStartDate} />
                                <span className="text-muted-foreground text-sm">~</span>
                                <DatePicker date={endDate} setDate={setEndDate} />
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="space-y-1.5">
                            <Label htmlFor="proj-budget">총 예산 (원)</Label>
                            <Input
                                id="proj-budget"
                                type="number"
                                value={budgetTotal}
                                onChange={e => setBudgetTotal(e.target.value)}
                                placeholder="0"
                                className="bg-background border-border"
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Section: 색상 & 목표 */}
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">색상 & 연결</Label>

                        {/* Color */}
                        <div className="space-y-1.5">
                            <Label>프로젝트 색상</Label>
                            <div className="flex items-center gap-3">
                                <div className="flex gap-2 flex-wrap">
                                    {COLOR_PRESETS.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            className={cn(
                                                "w-7 h-7 rounded-full transition-all",
                                                color === c ? "ring-2 ring-offset-2 ring-offset-modal ring-white scale-110" : "hover:scale-105"
                                            )}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                                <input
                                    type="color"
                                    value={color}
                                    onChange={e => setColor(e.target.value)}
                                    className="w-7 h-7 rounded-full border border-border cursor-pointer bg-transparent p-0"
                                    title="커스텀 색상"
                                />
                                <div className="flex items-center gap-1.5 ml-1">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                    <span className="text-xs text-muted-foreground font-mono">{color}</span>
                                </div>
                            </div>
                        </div>

                        {/* Goal */}
                        <div className="space-y-1.5">
                            <Label>상위 목표 연결</Label>
                            <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue placeholder="연동 안함" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">연동 안함</SelectItem>
                                    {goals.map(g => (
                                        <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Section: 팀원 */}
                    {people.length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">팀원 선택</Label>
                                    {selectedMembers.length > 0 && (
                                        <Badge variant="secondary" className="text-xs">{selectedMembers.length}명 선택됨</Badge>
                                    )}
                                </div>
                                <div className="rounded-lg border border-border bg-background p-3 max-h-36 overflow-y-auto custom-scrollbar space-y-2">
                                    {people.map(person => (
                                        <div key={person.id} className="flex items-center gap-3 py-0.5">
                                            <Checkbox
                                                id={`member-${person.id}`}
                                                checked={selectedMembers.includes(person.id)}
                                                onCheckedChange={() => toggleMember(person.id)}
                                            />
                                            <label
                                                htmlFor={`member-${person.id}`}
                                                className="text-sm cursor-pointer flex-1 leading-none"
                                            >
                                                {person.name}
                                                <span className="text-xs text-muted-foreground ml-1.5">({person.relationship})</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <Separator />

                    {/* Section: 설명 & 옵션 */}
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">설명 & 옵션</Label>

                        <div className="space-y-1.5">
                            <Label htmlFor="proj-desc">프로젝트 설명</Label>
                            <Textarea
                                id="proj-desc"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="프로젝트에 대해 간략히 설명해주세요..."
                                className="min-h-[80px] resize-none bg-background border-border"
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3">
                            <div className="space-y-0.5">
                                <Label htmlFor="is-template" className="text-sm font-medium cursor-pointer">템플릿으로 저장</Label>
                                <p className="text-xs text-muted-foreground">다른 프로젝트 생성 시 재사용 가능</p>
                            </div>
                            <Switch
                                id="is-template"
                                checked={isTemplate}
                                onCheckedChange={setIsTemplate}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 pt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
                    <Button onClick={handleSave} disabled={!title.trim()}>
                        {projectToEdit ? '저장' : '프로젝트 생성'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

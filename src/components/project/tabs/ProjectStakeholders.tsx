import React, { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Project, Stakeholder } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Mail, Phone, Edit2, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProjectStakeholdersProps {
    project: Project;
}

export function ProjectStakeholders({ project }: ProjectStakeholdersProps) {
    const { updateProject } = useData();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [contact, setContact] = useState('');
    const [org, setOrg] = useState('');
    const [notes, setNotes] = useState('');

    const stakeholders = project.stakeholders || [];

    const handleAdd = () => {
        if (!name || !role) return;

        const newStakeholder: Stakeholder = {
            id: crypto.randomUUID(),
            name,
            role,
            contact,
            organization: org,
            notes
        };

        const updatedStakeholders = [...stakeholders, newStakeholder];
        updateProject({ ...project, stakeholders: updatedStakeholders });

        setIsAddDialogOpen(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        if (confirm('삭제하시겠습니까?')) {
            const updatedStakeholders = stakeholders.filter(s => s.id !== id);
            updateProject({ ...project, stakeholders: updatedStakeholders });
        }
    };

    const resetForm = () => {
        setName('');
        setRole('');
        setContact('');
        setOrg('');
        setNotes('');
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-500" />
                        이해관계자 관리 (Stakeholders)
                    </h3>
                    <p className="text-sm text-muted-foreground">프로젝트 관련 인물, 팀, 클라이언트 정보를 관리합니다.</p>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> 인물 추가
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto p-1">
                {stakeholders.map(person => (
                    <Card key={person.id} className="group hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <Avatar className="h-12 w-12">
                                <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <CardTitle className="text-base truncate">{person.name}</CardTitle>
                                <p className="text-sm text-muted-foreground truncate">{person.role}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(person.id)}>
                                <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                            </Button>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            {person.organization && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Badge variant="secondary" className="font-normal">{person.organization}</Badge>
                                </div>
                            )}
                            {person.contact && (
                                <div className="flex items-center gap-2 text-muted-foreground truncate" title={person.contact}>
                                    <Mail className="w-3 h-3" /> {person.contact}
                                </div>
                            )}
                            {person.notes && (
                                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded line-clamp-2">
                                    {person.notes}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {stakeholders.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-muted-foreground border-2 border-dashed rounded-xl">
                        <User className="w-12 h-12 opacity-20 mb-3" />
                        <p>등록된 이해관계자가 없습니다.</p>
                    </div>
                )}
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>새 이해관계자 추가</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">이름</Label>
                            <Input value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">역할/직책</Label>
                            <Input value={role} onChange={e => setRole(e.target.value)} className="col-span-3" placeholder="예: PM, 디자이너, 클라이언트" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">조직/부서</Label>
                            <Input value={org} onChange={e => setOrg(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">연락처</Label>
                            <Input value={contact} onChange={e => setContact(e.target.value)} className="col-span-3" placeholder="이메일 또는 전화번호" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">메모</Label>
                            <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="col-span-3" />
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

"use client"

import { useState } from 'react';
import { Project, Stakeholder } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useData } from '@/context/DataProvider';
import { Users, Plus, Trash2, Mail, Phone, Building, User, Save, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProjectTeamProps {
    project: Project;
}

export function ProjectTeam({ project }: ProjectTeamProps) {
    const { updateProject } = useData();
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [contact, setContact] = useState('');
    const [org, setOrg] = useState('');
    const [notes, setNotes] = useState('');

    const handleAddMember = () => {
        if (!name.trim()) return;

        const newMember: Stakeholder = {
            id: Date.now().toString(),
            name,
            role,
            contact,
            organization: org,
            notes
        };

        const updatedProject = {
            ...project,
            stakeholders: [...(project.stakeholders || []), newMember]
        };

        updateProject(updatedProject);

        // Reset & Close
        setName('');
        setRole('');
        setContact('');
        setOrg('');
        setNotes('');
        setIsAddOpen(false);
    };

    const handleDeleteMember = (id: string) => {
        if (!confirm('팀원을 목록에서 삭제하시겠습니까?')) return;
        const updatedProject = {
            ...project,
            stakeholders: (project.stakeholders || []).filter(m => m.id !== id)
        };
        updateProject(updatedProject);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" /> 팀 & 이해관계자 (Team)
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        프로젝트에 참여하는 모든 인원과 연락처를 관리하세요.
                    </p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-200/50 shadow-sm">
                    <Plus className="w-4 h-4" /> 팀원 추가
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(project.stakeholders || []).length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-muted/30 rounded-xl border border-dashed">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <h3 className="font-semibold text-lg text-muted-foreground">등록된 팀원이 없습니다</h3>
                        <p className="text-sm text-gray-500 mb-4">함께 일하는 동료나 클라이언트를 추가해보세요.</p>
                        <Button variant="outline" onClick={() => setIsAddOpen(true)}>팀원 초대하기</Button>
                    </div>
                ) : (
                    (project.stakeholders || []).map(member => (
                        <div key={member.id} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-border shadow-sm flex flex-col gap-4 relative group hover:border-indigo-500/50 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`} />
                                        <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight">{member.name}</h3>
                                        <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{member.role || 'Role Undefined'}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2 text-muted-foreground hover:text-red-500"
                                    onClick={() => handleDeleteMember(member.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="space-y-2 text-sm text-muted-foreground">
                                {member.organization && (
                                    <div className="flex items-center gap-2">
                                        <Building className="w-3.5 h-3.5 opacity-70" />
                                        <span>{member.organization}</span>
                                    </div>
                                )}
                                {member.contact && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 opacity-70" />
                                        <span className="truncate">{member.contact}</span>
                                    </div>
                                )}
                            </div>

                            {member.notes && (
                                <div className="mt-auto pt-3 border-t border-border/50 text-xs text-gray-500 line-clamp-2">
                                    {member.notes}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Add Member Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>새 팀원 추가</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>이름 <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder="홍길동"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>역할/직책</Label>
                                <Input
                                    placeholder="PM, Designer..."
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>연락처 (이메일/전화)</Label>
                            <Input
                                placeholder="email@example.com"
                                value={contact}
                                onChange={e => setContact(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>소속 (회사/부서)</Label>
                            <Input
                                placeholder="마케팅팀"
                                value={org}
                                onChange={e => setOrg(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>메모</Label>
                            <Textarea
                                placeholder="특이사항, 업무 분장 내용 등..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                className="resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>취소</Button>
                        <Button onClick={handleAddMember}>추가하기</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

"use client"

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Person, Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Search, Plus, Mail, Phone, Building, Briefcase, UserPlus, Filter, MoreHorizontal, User } from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkPeopleSectionProps {
    project?: Project;
}

export function WorkPeopleSection({ project }: WorkPeopleSectionProps) {
    const { people, addPerson, updatePerson, deletePerson } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Filter Logic
    const filteredPeople = people.filter(p =>
        p.name.includes(searchTerm) ||
        p.company?.includes(searchTerm) ||
        p.role?.includes(searchTerm)
    );

    // If project is provided, we could highlight stakeholders or filter relevant people
    // For now, we show all people as a "Synced Contact List"

    // Form State
    const [personForm, setPersonForm] = useState<Partial<Person>>({});

    const handleAddClick = () => {
        setPersonForm({ relationship: 'work' }); // Default to work
        setIsAddOpen(true);
    };

    const handleSavePerson = () => {
        if (!personForm.name) return;

        const newPerson: Person = {
            id: personForm.id || generateId(),
            name: personForm.name!,
            relationship: personForm.relationship || 'work',
            contact: personForm.contact || '',
            email: personForm.email,
            company: personForm.company,
            department: personForm.department,
            jobTitle: personForm.jobTitle || personForm.role,
            notes: personForm.notes
        };

        if (personForm.id) updatePerson(newPerson);
        else addPerson(newPerson);

        setIsAddOpen(false);
    };

    const handleEditClick = (person: Person) => {
        setPersonForm(person);
        setIsAddOpen(true);
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                        <Users className="w-6 h-6 text-primary" />
                        {project ? `${project.title} 팀원 & 연락처` : '인맥 관리 (Personnel)'}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        업무와 관련된 모든 연락처와 팀원을 통합 관리합니다.
                    </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="이름, 회사, 역할 검색..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleAddClick} className="gap-2 shrink-0">
                        <UserPlus className="w-4 h-4" /> 연락처 추가
                    </Button>
                </div>
            </div>

            {/* If Project Selected: Show Stakeholders vs All Contacts View? 
                For now keeping it simple: List Grid 
            */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1 content-start">
                {filteredPeople.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>등록된 연락처가 없습니다.</p>
                    </div>
                ) : (
                    filteredPeople.map(person => (
                        <div key={person.id} className="group bg-card/50 backdrop-blur-sm p-5 rounded-xl border border-white/10 shadow-sm hover:shadow-md hover:border-white/20 transition-all flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 border border-slate-100">
                                        {person.avatar ? (
                                            <AvatarImage src={person.avatar} />
                                        ) : (
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${person.name}`} />
                                        )}
                                        <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-bold text-lg text-slate-900 leading-tight">{person.name}</div>
                                        <div className="text-xs text-primary font-medium bg-primary/5 px-2 py-0.5 rounded-full inline-block mt-1">
                                            {person.relationship === 'work' ? '업무' : (person.relationship === 'friend' ? '친구' : '기타')}
                                        </div>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEditClick(person)}>
                                            <Briefcase className="w-4 h-4 mr-2" /> 수정
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => deletePerson(person.id)}>
                                            <Users className="w-4 h-4 mr-2" /> 삭제
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="space-y-2.5 text-sm text-slate-500 flex-1">
                                {(person.company || person.department || person.jobTitle) && (
                                    <div className="flex items-start gap-2">
                                        <Building className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                        <span>
                                            {[person.company, person.department, person.jobTitle].filter(Boolean).join(' · ')}
                                        </span>
                                    </div>
                                )}
                                {person.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                        <a href={`mailto:${person.email}`} className="hover:text-primary truncate">{person.email}</a>
                                    </div>
                                )}
                                {person.contact && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span>{person.contact}</span>
                                    </div>
                                )}
                            </div>

                            {person.notes && (
                                <div className="mt-4 pt-3 border-t border-slate-50 text-xs text-slate-400 bg-slate-50/50 p-2 rounded-md">
                                    {person.notes}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{personForm.id ? '전체 연락처 수정' : '새 연락처 추가'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>이름 <span className="text-red-500">*</span></Label>
                                <Input value={personForm.name || ''} onChange={e => setPersonForm({ ...personForm, name: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>관계</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={personForm.relationship || 'work'}
                                    onChange={e => setPersonForm({ ...personForm, relationship: e.target.value as any })}
                                >
                                    <option value="work">업무 (Work)</option>
                                    <option value="friend">지인 (Friend)</option>
                                    <option value="family">가족 (Family)</option>
                                    <option value="other">기타 (Other)</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>회사</Label>
                                <Input value={personForm.company || ''} onChange={e => setPersonForm({ ...personForm, company: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>부서 / 직책</Label>
                                <Input
                                    placeholder="기획팀 / 과장"
                                    value={personForm.jobTitle || ''}
                                    onChange={e => setPersonForm({ ...personForm, jobTitle: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>이메일</Label>
                            <Input value={personForm.email || ''} onChange={e => setPersonForm({ ...personForm, email: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>전화번호</Label>
                            <Input value={personForm.contact || ''} onChange={e => setPersonForm({ ...personForm, contact: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>메모</Label>
                            <Textarea value={personForm.notes || ''} onChange={e => setPersonForm({ ...personForm, notes: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSavePerson}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

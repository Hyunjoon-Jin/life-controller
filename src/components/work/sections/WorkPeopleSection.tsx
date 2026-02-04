'use client';

import { useData } from '@/context/DataProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Search, Phone, Mail, Link2, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { generateId } from '@/lib/utils';
import { Person, RelationshipType } from '@/types';

export function WorkPeopleSection() {
    const { people, addPerson, updatePerson, deletePerson } = useData();
    const [search, setSearch] = useState('');

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Person>>({
        name: '',
        relationship: 'work',
        company: '',
        jobTitle: '',
        contact: '',
        email: '',
        notes: '',
        tags: []
    });

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({
            name: '',
            relationship: 'work',
            company: '',
            jobTitle: '',
            contact: '',
            email: '',
            notes: '',
            tags: []
        });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (person: Person) => {
        setEditingId(person.id);
        setFormData(person);
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!formData.name) return;

        if (editingId) {
            updatePerson({ ...formData, id: editingId } as Person);
        } else {
            addPerson({ ...formData, id: generateId() } as Person);
        }
        setIsDialogOpen(false);
    };

    const [showWorkOnly, setShowWorkOnly] = useState(true);

    const filteredPeople = people.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.company?.toLowerCase().includes(search.toLowerCase()) ||
            p.role?.toLowerCase().includes(search.toLowerCase()) ||
            p.jobTitle?.toLowerCase().includes(search.toLowerCase());

        if (showWorkOnly) {
            return matchesSearch && (p.relationship === 'work' || !p.relationship); // Default to work if undefined, or explicit work
        }
        return matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="이름, 회사, 직함으로 검색"
                            className="pl-10"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <Button
                        variant={showWorkOnly ? "secondary" : "ghost"}
                        onClick={() => setShowWorkOnly(!showWorkOnly)}
                        className="text-xs"
                    >
                        {showWorkOnly ? "업무 연락처만" : "모든 연락처"}
                    </Button>
                </div>
                <Button onClick={handleOpenCreate}>
                    <Users className="w-4 h-4 mr-2" /> 새 연락처 추가
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPeople.map(person => (
                    <Card key={person.id} className="hover:shadow-md transition-shadow border-slate-100">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-12 h-12 border">
                                        <AvatarImage src={person.avatar} />
                                        <AvatarFallback>{person.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-bold">{person.name}</div>
                                        <div className="text-xs text-muted-foreground">{person.role || person.jobTitle} @ {person.company || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {person.contact && (
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => window.open(`tel:${person.contact}`)}>
                                            <Phone className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                    {person.email && (
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => window.open(`mailto:${person.email}`)}>
                                            <Mail className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => handleOpenEdit(person)}>
                                        <Link2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 bg-slate-50 rounded-lg">
                                    <Link2 className="w-3 h-3" />
                                    {person.notes || '메모 없음'}
                                </div>
                                <Button variant="outline" className="w-full h-8 text-xs" onClick={() => handleOpenEdit(person)}>
                                    상세 정보 / 수정
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredPeople.length === 0 && (
                    <div className="col-span-full py-20 text-center text-muted-foreground bg-slate-50 rounded-2xl border-2 border-dashed">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>검색 결과가 없거나 등록된 인맥이 없습니다.</p>
                    </div>
                )}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? '연락처 수정' : '새 연락처 추가'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>이름</Label>
                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="이름" />
                            </div>
                            <div className="grid gap-2">
                                <Label>관계</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.relationship}
                                    onChange={e => setFormData({ ...formData, relationship: e.target.value as RelationshipType })}
                                >
                                    <option value="work">직장</option>
                                    <option value="friend">친구</option>
                                    <option value="family">가족</option>
                                    <option value="other">기타</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>회사/소속</Label>
                                <Input value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} placeholder="회사명" />
                            </div>
                            <div className="grid gap-2">
                                <Label>직책</Label>
                                <Input value={formData.jobTitle} onChange={e => setFormData({ ...formData, jobTitle: e.target.value })} placeholder="직책/직위" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>연락처</Label>
                            <Input value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} placeholder="010-0000-0000" />
                        </div>
                        <div className="grid gap-2">
                            <Label>이메일</Label>
                            <Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="example@company.com" />
                        </div>
                        <div className="grid gap-2">
                            <Label>메모</Label>
                            <Input value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="메모 사항" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>취소</Button>
                        <Button onClick={handleSave} disabled={!formData.name}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

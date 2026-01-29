'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Person, RelationshipType } from '@/types';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { UsersRound, Plus, Phone, Search, User, Filter, MoreHorizontal, Trash2, Image as ImageIcon, X, MessageSquare, PhoneCall } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

export function PeopleManager() {
    const { people, addPerson, updatePerson, deletePerson } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRelation, setSelectedRelation] = useState<RelationshipType | 'all'>('all');

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Person>>({
        name: '',
        relationship: 'friend',
        contact: '',
        notes: '',
        businessCardImage: ''
    });

    // Preview state for View Mode
    const [viewImage, setViewImage] = useState<string | null>(null);

    const filteredPeople = people.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.contact.includes(searchQuery);
        const matchRel = selectedRelation === 'all' || p.relationship === selectedRelation;
        return matchSearch && matchRel;
    });

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ name: '', relationship: 'friend', contact: '', notes: '', businessCardImage: '', company: '', department: '', jobTitle: '' });
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

    const handleDelete = (id: string) => {
        deletePerson(id);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert("이미지 크기가 2MB를 초과합니다.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                setFormData(prev => ({ ...prev, businessCardImage: reader.result as string }));
            }
        };
        reader.readAsDataURL(file);
    };

    const getRelationBadge = (rel: RelationshipType) => {
        const styles = {
            family: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
            friend: 'bg-green-500/20 text-green-300 border-green-500/30',
            work: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            other: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        };
        return (
            <span className={cn("px-2 py-0.5 rounded textxs capitalize border", styles[rel])}>
                {rel === 'family' ? '가족' : rel === 'friend' ? '친구' : rel === 'work' ? '직장' : '기타'}
            </span>
        );
    };

    return (
        <div className="h-full flex flex-col bg-card text-card-foreground rounded-3xl border border-transparent shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 pt-6 pb-2">
                <div className="flex items-center gap-2 mb-4">
                    <UsersRound className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">인맥 관리</h2>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-1 max-w-sm relative">
                        <Search className="w-4 h-4 absolute left-2 text-muted-foreground" />
                        <Input
                            id="people-search"
                            name="search"
                            placeholder="검색 (이름, 연락처)"
                            className="h-9 pl-9 bg-muted border-transparent rounded-xl focus-visible:ring-primary/30"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl text-xs">
                            {(['all', 'family', 'friend', 'work', 'other'] as const).map(rel => (
                                <button
                                    key={rel}
                                    onClick={() => setSelectedRelation(rel)}
                                    className={cn(
                                        "px-2 py-1 rounded transition-colors capitalize",
                                        selectedRelation === rel ? "bg-white text-primary shadow-sm rounded-lg" : "text-muted-foreground hover:bg-white/50 rounded-lg"
                                    )}
                                >
                                    {rel === 'all' ? '전체' : rel === 'family' ? '가족' : rel === 'friend' ? '친구' : rel === 'work' ? '직장' : '기타'}
                                </button>
                            ))}
                        </div>

                        <Button onClick={handleOpenCreate} size="sm" className="h-8 bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" /> 추가
                        </Button>
                    </div>
                </div>
            </div>

            {/* List Header */}
            <div className="grid grid-cols-[1.5fr_1fr_1.5fr_2fr_50px] gap-4 px-6 py-2 border-b border-[#2E2E2E] text-xs text-muted-foreground font-medium uppercase mt-2">
                <div>이름</div>
                <div>관계</div>
                <div>연락처</div>
                <div>메모</div>
                <div></div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredPeople.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground opacity-50">
                        <User className="w-10 h-10 mb-2 opacity-50" />
                        <p>등록된 사람이 없습니다.</p>
                    </div>
                ) : (
                    filteredPeople.map(person => (
                        <div
                            key={person.id}
                            className="group grid grid-cols-[1.5fr_1fr_1.5fr_2fr_50px] gap-4 px-6 py-3 border-b border-border items-center hover:bg-muted/30 transition-colors text-sm"
                        >
                            <div className="font-medium flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 flex items-center justify-center text-xs">
                                    {person.name.slice(0, 1)}
                                </div>
                                {person.name}
                                {person.businessCardImage && (
                                    <button
                                        onClick={() => setViewImage(person.businessCardImage || null)}
                                        className="ml-2 text-muted-foreground hover:text-primary transition-colors"
                                        title="명함 보기"
                                    >
                                        <ImageIcon className="w-4 h-4" />
                                    </button>
                                )}
                                {(person.company || person.jobTitle) && (
                                    <span className="text-xs text-muted-foreground font-normal ml-1">
                                        | {[person.company, person.jobTitle].filter(Boolean).join(' ')}
                                    </span>
                                )}
                            </div>
                            <div>{getRelationBadge(person.relationship)}</div>
                            <div className="text-muted-foreground flex items-center gap-1 text-xs font-mono group/contact">
                                {person.contact && <Phone className="w-3 h-3 inline mr-1" />}
                                {person.contact}
                                {person.contact && (
                                    <div className="ml-2 flex gap-1 opacity-0 group-hover/contact:opacity-100 transition-opacity">
                                        <a
                                            href={`tel:${person.contact}`}
                                            title="전화 걸기"
                                            className="p-1 rounded-full hover:bg-green-100 text-green-600 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <PhoneCall className="w-3 h-3" />
                                        </a>
                                        <a
                                            href={`sms:${person.contact}`}
                                            title="문자 보내기"
                                            className="p-1 rounded-full hover:bg-blue-100 text-blue-600 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MessageSquare className="w-3 h-3" />
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div className="text-muted-foreground truncate">{person.notes}</div>
                            <div className="flex justify-end opacity-0 group-hover:opacity-100">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-card border-border">
                                        <DropdownMenuItem onClick={() => handleOpenEdit(person)}>수정</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDelete(person.id)} className="text-red-400">삭제</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-card text-card-foreground">
                    <DialogHeader>
                        <DialogTitle>{editingId ? '정보 수정' : '새 인맥 추가'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">이름</Label>
                            <Input
                                id="person-name"
                                name="name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="col-span-3 bg-muted border-transparent rounded-xl focus-visible:ring-primary/30"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">관계</Label>
                            <select
                                id="person-relationship"
                                name="relationship"
                                value={formData.relationship}
                                onChange={e => setFormData({ ...formData, relationship: e.target.value as RelationshipType })}
                                className="col-span-3 flex h-9 w-full rounded-xl bg-muted px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30"
                            >
                                <option value="family">가족</option>
                                <option value="friend">친구</option>
                                <option value="work">직장</option>
                                <option value="other">기타</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">연락처</Label>
                            <Input
                                id="person-contact"
                                name="contact"
                                value={formData.contact}
                                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                className="col-span-3 bg-muted border-transparent rounded-xl focus-visible:ring-primary/30"
                                placeholder="010-0000-0000"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">생일</Label>
                            <Input
                                id="person-birthdate"
                                type="date"
                                name="birthdate"
                                value={formData.birthdate ? new Date(formData.birthdate).toISOString().split('T')[0] : ''}
                                onChange={e => setFormData({ ...formData, birthdate: e.target.value ? new Date(e.target.value) : undefined })}
                                className="col-span-3 bg-muted border-transparent rounded-xl focus-visible:ring-primary/30"
                            />
                        </div>

                        {/* Workplace Info */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">회사/소속</Label>
                            <Input
                                id="person-company"
                                name="company"
                                value={formData.company || ''}
                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                                className="col-span-3 bg-muted border-transparent rounded-xl focus-visible:ring-primary/30"
                                placeholder="회사명 또는 소속"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">부서</Label>
                            <Input
                                id="person-department"
                                name="department"
                                value={formData.department || ''}
                                onChange={e => setFormData({ ...formData, department: e.target.value })}
                                className="col-span-3 bg-muted border-transparent rounded-xl focus-visible:ring-primary/30"
                                placeholder="부서명"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">직책</Label>
                            <Input
                                id="person-jobTitle"
                                name="jobTitle"
                                value={formData.jobTitle || ''}
                                onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                                className="col-span-3 bg-muted border-transparent rounded-xl focus-visible:ring-primary/30"
                                placeholder="직책/직위"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right mt-2">메모</Label>
                            <textarea
                                id="person-notes"
                                name="notes"
                                value={formData.notes || ''}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                className="col-span-3 bg-muted border-transparent rounded-xl p-3 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="기억 해야 할 특징, 생일 등..."
                            />
                        </div>

                        {/* Business Card Upload */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right mt-2">명함</Label>
                            <div className="col-span-3">
                                <Label className="flex items-center gap-2 cursor-pointer w-fit text-muted-foreground hover:text-foreground transition-colors mb-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('card-upload')?.click()}>
                                        <ImageIcon className="w-4 h-4 mr-2" /> 이미지 업로드
                                    </Button>
                                    <input
                                        id="card-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </Label>
                                {formData.businessCardImage && (
                                    <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                                        <img src={formData.businessCardImage} alt="Business Card" className="w-full h-full object-contain bg-black/5" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, businessCardImage: '' }))}
                                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>취소</Button>
                        <Button onClick={handleSave} disabled={!formData.name}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image View Dialog */}
            <Dialog open={!!viewImage} onOpenChange={(open) => !open && setViewImage(null)}>
                <DialogContent className="sm:max-w-3xl bg-card p-0 overflow-hidden">
                    <DialogHeader className="p-4 bg-muted/20">
                        <DialogTitle>명함 미리보기</DialogTitle>
                    </DialogHeader>
                    {viewImage && (
                        <div className="w-full h-[60vh] bg-black/5 flex items-center justify-center p-4">
                            <img src={viewImage} alt="Full Business Card" className="max-w-full max-h-full object-contain shadow-lg rounded-md" />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

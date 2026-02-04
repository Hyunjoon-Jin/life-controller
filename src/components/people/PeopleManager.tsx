'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Person, RelationshipType } from '@/types';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { UsersRound, Plus, Phone, Search, User, Filter, MoreHorizontal, Trash2, Image as ImageIcon, X, MessageSquare, PhoneCall, Network, ChevronDown } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PeopleMap } from './PeopleMap';
import { format } from 'date-fns';


export function PeopleManager() {

    const { people, addPerson, updatePerson, deletePerson } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRelation, setSelectedRelation] = useState<RelationshipType | 'all'>('all');

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false); // New Map State
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<Person>>({
        name: '',
        relationship: 'friend',
        contact: '',
        notes: '',
        businessCardImage: '',
        school: '',
        major: '',
        industry: '',
        group: '',
        isMe: false,
        tags: [],
        interactions: []
    });
    const [tagInput, setTagInput] = useState('');
    const [interactionType, setInteractionType] = useState<'call' | 'meeting' | 'email' | 'event' | 'other'>('call');
    const [interactionContent, setInteractionContent] = useState('');
    const [interactionDate, setInteractionDate] = useState<Date>(new Date());


    // Preview state for View Mode
    const [viewImage, setViewImage] = useState<string | null>(null);

    const filteredPeople = people.filter(p => {
        const searchLower = searchQuery.toLowerCase();
        const matchSearch = p.name.toLowerCase().includes(searchLower) ||
            p.contact.includes(searchQuery) ||
            p.industry?.toLowerCase().includes(searchLower) ||
            p.group?.toLowerCase().includes(searchLower) ||
            p.company?.toLowerCase().includes(searchLower);
        const matchRel = selectedRelation === 'all' || p.relationship === selectedRelation;
        return matchSearch && matchRel;
    });

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({
            name: '', relationship: 'friend', contact: '', notes: '', businessCardImage: '',
            company: '', department: '', jobTitle: '', school: '', major: '',
            industry: '', group: '', isMe: false, tags: [], interactions: []
        });
        setTagInput('');
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (person: Person) => {
        setEditingId(person.id);
        setFormData(person);
        setTagInput('');
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

    const handleAddTag = () => {
        const tag = tagInput.trim();
        if (!tag) return;

        const currentTags = formData.tags || [];
        if (!currentTags.includes(tag)) {
            setFormData(prev => ({ ...prev, tags: [...currentTags, tag] }));
        }
        setTagInput('');
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
        }));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddTag();
        } else if (e.key === 'Backspace' && !tagInput && formData.tags?.length) {
            const lastTag = formData.tags[formData.tags.length - 1];
            handleRemoveTag(lastTag);
        }
    };

    const handleAddInteraction = () => {
        if (!interactionContent.trim()) return;
        const newLog = {
            id: generateId(),
            date: interactionDate,
            type: interactionType,
            content: interactionContent
        };
        setFormData(prev => ({
            ...prev,
            interactions: [newLog, ...(prev.interactions || [])]
        }));
        setInteractionContent('');
        setInteractionDate(new Date());
    };

    const handleRemoveInteraction = (id: string) => {
        setFormData(prev => ({
            ...prev,
            interactions: prev.interactions?.filter(log => log.id !== id) || []
        }));
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
            <div className="p-4 pt-4 pb-2">
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

                        <Button onClick={() => setIsMapOpen(true)} variant="outline" size="sm" className="h-8 gap-2 hidden md:flex">
                            <Network className="w-4 h-4" />
                            <span className="text-xs">인맥 지도</span>
                        </Button>

                        <Button onClick={handleOpenCreate} variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                            <Plus className="w-4 h-4" />
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
                                {person.isMe && <Badge variant="default" className="text-[10px] px-1 h-5">Me</Badge>}
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
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0 overflow-hidden bg-card text-card-foreground">
                    <DialogHeader className="p-6 pb-2 shrink-0">
                        <DialogTitle className="text-xl">{editingId ? '정보 수정' : '새 인맥 추가'}</DialogTitle>
                    </DialogHeader>

                    <Tabs defaultValue="profile" className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 pt-2">
                            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 h-9">
                                <TabsTrigger value="profile" className="text-xs">기본 정보</TabsTrigger>
                                <TabsTrigger value="interactions" className="text-xs">기록 및 히스토리</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="profile" className="flex-1 overflow-y-auto custom-scrollbar p-6 py-4 mt-0 space-y-6">
                            <div className="grid gap-6">
                                {/* Basic Info Group */}
                                <div className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="person-name">이름 <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="person-name"
                                                name="name"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="이름 입력"
                                                className="bg-muted/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="person-relationship">관계</Label>
                                            <div className="relative">
                                                <select
                                                    id="person-relationship"
                                                    name="relationship"
                                                    value={formData.relationship}
                                                    onChange={e => setFormData({ ...formData, relationship: e.target.value as RelationshipType })}
                                                    className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm appearance-none"
                                                >
                                                    <option value="family">가족</option>
                                                    <option value="friend">친구</option>
                                                    <option value="work">직장</option>
                                                    <option value="other">기타</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 opacity-50 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="person-isMe"
                                            checked={formData.isMe}
                                            onCheckedChange={(checked) => setFormData({ ...formData, isMe: checked === true })}
                                        />
                                        <label htmlFor="person-isMe" className="text-sm font-medium leading-none cursor-pointer">
                                            이 프로필이 '나'입니다 (본인 표시)
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>연락처</Label>
                                            <Input
                                                value={formData.contact}
                                                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                                placeholder="010-0000-0000"
                                                className="bg-muted/50"
                                            />
                                        </div>
                                        <div className="space-y-2 flex flex-col">
                                            <Label>생일</Label>
                                            <DatePicker
                                                date={formData.birthdate ? new Date(formData.birthdate) : undefined}
                                                setDate={(date) => setFormData({ ...formData, birthdate: date })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-border/50" />

                                {/* Industry / Group Group */}
                                <div className="grid gap-4">
                                    <Label className="text-muted-foreground text-xs uppercase font-bold tracking-wider">분류</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>산업 분야</Label>
                                            <Input
                                                value={formData.industry || ''}
                                                onChange={e => setFormData({ ...formData, industry: e.target.value })}
                                                placeholder="예: IT, 금융, 의료"
                                                className="bg-muted/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>그룹</Label>
                                            <Input
                                                value={formData.group || ''}
                                                onChange={e => setFormData({ ...formData, group: e.target.value })}
                                                placeholder="예: 고등학교 친구, 독서모임"
                                                className="bg-muted/50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-border/50" />

                                {/* Social / Work Group */}
                                <div className="grid gap-4">
                                    <Label className="text-muted-foreground text-xs uppercase font-bold tracking-wider">소속 및 학력</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            value={formData.company || ''}
                                            onChange={e => setFormData({ ...formData, company: e.target.value })}
                                            placeholder="회사/소속명"
                                            className="col-span-2 bg-muted/50"
                                        />
                                        <Input
                                            value={formData.department || ''}
                                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                                            placeholder="부서"
                                            className="bg-muted/50"
                                        />
                                        <Input
                                            value={formData.jobTitle || ''}
                                            onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                                            placeholder="직책/직위"
                                            className="bg-muted/50"
                                        />
                                        <Input
                                            value={formData.school || ''}
                                            onChange={e => setFormData({ ...formData, school: e.target.value })}
                                            placeholder="학교명"
                                            className="bg-muted/50"
                                        />
                                        <Input
                                            value={formData.major || ''}
                                            onChange={e => setFormData({ ...formData, major: e.target.value })}
                                            placeholder="전공"
                                            className="bg-muted/50"
                                        />
                                    </div>
                                </div>

                                <div className="h-px bg-border/50" />

                                {/* Additional Info */}
                                <div className="space-y-4">
                                    <Label className="text-muted-foreground text-xs uppercase font-bold tracking-wider">추가 정보</Label>

                                    <div className="space-y-2">
                                        <Label>태그</Label>
                                        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-xl border border-input/50 transition-all">
                                            {(formData.tags || []).map(tag => (
                                                <Badge key={tag} variant="secondary" className="px-2 py-1 text-sm font-normal rounded-md bg-background border shadow-sm hover:bg-accent transition-colors">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="ml-1 text-muted-foreground hover:text-red-500 rounded-full"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                            <input
                                                id="person-tags"
                                                value={tagInput}
                                                onChange={e => setTagInput(e.target.value)}
                                                onKeyDown={handleTagKeyDown}
                                                onBlur={handleAddTag}
                                                className="flex-1 min-w-[120px] bg-transparent outline-none text-sm h-6"
                                                placeholder={formData.tags?.length ? "" : "태그 입력 (Enter)"}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="person-notes">메모</Label>
                                        <textarea
                                            id="person-notes"
                                            name="notes"
                                            value={formData.notes || ''}
                                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm"
                                            placeholder="기억해야 할 특징 등..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>명함 이미지</Label>
                                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-4 transition-colors hover:bg-muted/50">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                {formData.businessCardImage ? (
                                                    <div className="relative w-full h-[150px] rounded-lg overflow-hidden border bg-background">
                                                        <img src={formData.businessCardImage} alt="Business Card" className="w-full h-full object-contain" />
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="destructive"
                                                            onClick={() => setFormData(prev => ({ ...prev, businessCardImage: '' }))}
                                                            className="absolute top-2 right-2 h-6 w-6 rounded-full shadow-md"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center text-center py-2" onClick={() => document.getElementById('card-upload')?.click()}>
                                                        <ImageIcon className="w-6 h-6 text-muted-foreground/50 mb-1" />
                                                        <p className="text-[10px] text-muted-foreground">명함 업로드</p>
                                                    </div>
                                                )}
                                                <input
                                                    id="card-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageUpload}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="interactions" className="flex-1 overflow-y-auto custom-scrollbar p-6 py-4 mt-0 space-y-6">
                            <div className="grid gap-4">
                                <Label className="text-muted-foreground text-xs uppercase font-bold">새 기록 추가</Label>
                                <div className="p-4 bg-muted/30 rounded-xl border border-dashed border-primary/20 space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <select
                                            value={interactionType}
                                            onChange={e => setInteractionType(e.target.value as any)}
                                            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
                                        >
                                            <option value="call">전화</option>
                                            <option value="meeting">미팅</option>
                                            <option value="email">이메일</option>
                                            <option value="event">경조사/행사</option>
                                            <option value="other">기타</option>
                                        </select>
                                        <Input
                                            type="date"
                                            value={format(interactionDate, 'yyyy-MM-dd')}
                                            onChange={e => setInteractionDate(new Date(e.target.value))}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                    <textarea
                                        value={interactionContent}
                                        onChange={e => setInteractionContent(e.target.value)}
                                        placeholder="대화 내용, 논의 사항 등..."
                                        className="w-full h-20 rounded-md border border-input bg-background p-3 text-xs resize-none"
                                    />
                                    <Button size="sm" className="w-full text-xs h-8" onClick={handleAddInteraction}>기록 저장</Button>
                                </div>

                                <Label className="text-muted-foreground text-xs uppercase font-bold pt-4">과거 타임라인</Label>
                                <div className="space-y-3">
                                    {(!formData.interactions || formData.interactions.length === 0) ? (
                                        <p className="text-center text-xs text-muted-foreground py-8 opacity-50 italic">기록된 이력이 없습니다.</p>
                                    ) : (
                                        formData.interactions.map(log => (
                                            <div key={log.id} className="relative pl-4 pb-4 border-l border-primary/20 last:pb-0">
                                                <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-primary" />
                                                <div className="bg-muted/40 p-3 rounded-lg border border-border/50 text-xs">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-[10px] h-4 font-bold capitalize">{log.type}</Badge>
                                                            <span className="text-muted-foreground opacity-60 font-mono">{format(new Date(log.date), 'yyyy.MM.dd')}</span>
                                                        </div>
                                                        <button onClick={() => handleRemoveInteraction(log.id)} className="text-muted-foreground hover:text-red-500 transition-opacity">
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <p className="whitespace-pre-wrap">{log.content}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="p-6 pt-2 shrink-0">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>취소</Button>
                        <Button onClick={handleSave} disabled={!formData.name}>
                            {editingId ? '수정 완료' : '등록'}
                        </Button>
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
                            <img src={viewImage || ''} alt="Full Business Card" className="max-w-full max-h-full object-contain shadow-lg rounded-md" />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* People Map View */}
            {isMapOpen && <PeopleMap onClose={() => setIsMapOpen(false)} />}
        </div >
    );
}


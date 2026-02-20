'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { Person, RelationshipType } from '@/types';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import {
    UsersRound, Plus, Phone, Search, User, Filter, MoreHorizontal,
    Trash2, Image as ImageIcon, X, MessageSquare, PhoneCall,
    Network, ChevronDown, Edit3, UserPlus, Map as MapIcon,
    Briefcase, GraduationCap, Heart, Globe
} from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PeopleMap } from './PeopleMap';
import { format } from 'date-fns';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export function PeopleManager() {
    const { people, addPerson, updatePerson, deletePerson } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRelation, setSelectedRelation] = useState<RelationshipType | 'all'>('all');

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);
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
        if (file.size > 2 * 1024 * 1024) {
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
            family: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]',
            friend: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
            work: 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
            other: 'bg-white/10 text-white/40 border-white/10',
        };
        return (
            <span className={cn("px-2.5 py-0.5 rounded-lg text-[10px] uppercase font-black tracking-widest border", styles[rel])}>
                {rel}
            </span>
        );
    };

    return (
        <div className="h-full flex flex-col glass-premium rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative">

            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />

            {/* Header / Search & Filters */}
            <div className="p-8 pb-6 relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(99,102,241,0.5)]">
                            <UsersRound className="w-6 h-6 text-white" strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">RELATIONS</h2>
                            <p className="text-xs font-bold text-white/30 tracking-widest uppercase mt-0.5">MANAGE YOUR SOCIAL NETWORK</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                            <Input
                                placeholder="FIND SOMEONE..."
                                className="h-12 pl-12 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/10 font-bold focus-visible:ring-indigo-500/30"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button onClick={handleOpenCreate} className="w-12 h-12 rounded-2xl bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center transition-all text-white shadow-[0_10px_20px_-5px_rgba(99,102,241,0.4)] active:scale-95">
                            <UserPlus className="w-6 h-6" strokeWidth={3} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
                        {(['all', 'family', 'friend', 'work', 'other'] as const).map(rel => (
                            <button
                                key={rel}
                                onClick={() => setSelectedRelation(rel)}
                                className={cn(
                                    "px-6 py-2.5 rounded-2xl transition-all font-black text-[11px] tracking-widest uppercase border whitespace-nowrap",
                                    selectedRelation === rel
                                        ? "bg-indigo-500 text-white border-indigo-500 shadow-[0_8px_16px_-4px_rgba(99,102,241,0.4)]"
                                        : "bg-white/5 border-white/5 text-white/30 hover:text-white/60 hover:bg-white/10"
                                )}
                            >
                                {rel}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsMapOpen(true)}
                        className="flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all font-black text-[11px] tracking-widest uppercase"
                    >
                        <MapIcon className="w-4 h-4" strokeWidth={3} />
                        NETWORK MAP
                    </button>
                </div>
            </div>

            {/* List Table Header */}
            <div className="hidden md:grid grid-cols-[1.5fr_1fr_1.5fr_2fr_80px] gap-6 px-10 py-4 border-b border-white/[0.03] text-[9px] font-black text-white/20 uppercase tracking-[0.2em] bg-white/[0.01] relative z-10">
                <div>Identity</div>
                <div>Connection</div>
                <div>Intelligence</div>
                <div>Status / Notes</div>
                <div className="text-right">Actions</div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                {filteredPeople.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-center mb-8 relative"
                        >
                            <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full" />
                            <UsersRound className="w-10 h-10 text-white/10 relative z-10" />
                        </motion.div>
                        <p className="text-2xl font-black text-white/80 uppercase tracking-tighter">NO RELATIONS FOUND</p>
                        <p className="text-xs font-bold text-white/20 tracking-widest uppercase mt-3 max-w-xs leading-relaxed">EXPAND YOUR CIRCLE. REGISTER A NEW CONNECTION TO BEGIN.</p>
                    </div>
                ) : (
                    <div className="p-4 md:p-0">
                        <AnimatePresence mode="popLayout">
                            {filteredPeople.map(person => (
                                <motion.div
                                    key={person.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1.5fr_2fr_80px] gap-4 px-6 md:px-10 py-5 md:py-6 border-b border-white/[0.03] items-center hover:bg-white/[0.02] transition-all duration-300 relative rounded-2xl md:rounded-none mb-3 md:mb-0"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-lg font-black text-white shadow-xl">
                                            {person.name.slice(0, 1)}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base font-black text-white tracking-tight">{person.name}</span>
                                                {person.isMe && <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/10 text-[9px] font-black h-5 uppercase px-1.5">SELF</Badge>}
                                                {person.businessCardImage && (
                                                    <button onClick={() => setViewImage(person.businessCardImage || null)} className="text-white/20 hover:text-indigo-400 transition-colors">
                                                        <ImageIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            {(person.company || person.jobTitle) && (
                                                <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-0.5 truncate">
                                                    {[person.company, person.jobTitle].filter(Boolean).join(' // ')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div>{getRelationBadge(person.relationship)}</div>

                                    <div className="flex flex-col gap-1.5 min-w-0">
                                        {person.contact && (
                                            <div className="flex items-center gap-3 group/info">
                                                <Phone className="w-3.5 h-3.5 text-white/20 group-hover/info:text-indigo-400 transition-colors" />
                                                <span className="text-[11px] font-bold text-white/40 font-mono tracking-tighter truncate">{person.contact}</span>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <a href={`tel:${person.contact}`} className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all">
                                                        <PhoneCall className="w-3 h-3" />
                                                    </a>
                                                    <a href={`sms:${person.contact}`} className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all">
                                                        <MessageSquare className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        {person.industry && (
                                            <div className="flex items-center gap-3">
                                                <Briefcase className="w-3.5 h-3.5 text-white/10" />
                                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{person.industry}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-[11px] text-white/30 font-bold leading-relaxed truncate md:line-clamp-2" title={person.notes}>
                                        {person.notes || <span className="opacity-20 italic">NO NOTES RECORDED</span>}
                                    </div>

                                    <div className="flex justify-end opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 text-white/20 hover:text-white transition-all">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="glass-premium border border-white/10 text-white p-2 min-w-[150px] rounded-2xl shadow-2xl">
                                                <DropdownMenuItem onClick={() => handleOpenEdit(person)} className="rounded-xl flex items-center gap-3 py-3 px-4 font-black text-[10px] tracking-widest cursor-pointer hover:bg-white/10 transition-all">
                                                    <Edit3 className="w-4 h-4" />
                                                    UPDATE DOSSIER
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(person.id)} className="rounded-xl flex items-center gap-3 py-3 px-4 font-black text-[10px] tracking-widest cursor-pointer text-rose-500 hover:bg-rose-500/10 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                    TERMINATE
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Dialogs */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass-premium border border-white/10 text-white rounded-[40px] p-0 shadow-2xl sm:max-w-[700px] max-h-[90vh] overflow-hidden">
                    <DialogHeader className="p-10 pb-0 relative">
                        <div className="absolute top-10 right-10 flex items-center gap-2">
                            <Badge className="bg-white/5 border-white/5 text-white/30 text-[9px] font-black h-6 uppercase px-3 tracking-widest">
                                {editingId ? 'edit mode' : 'initialization'}
                            </Badge>
                        </div>
                        <DialogTitle className="text-4xl font-black tracking-tighter uppercase mb-2">
                            {editingId ? 'UPDATE PERSONA' : 'NEW CONNECTION'}
                        </DialogTitle>
                        <p className="text-xs font-bold text-white/20 tracking-widest uppercase">ENCRYPTING SOCIAL DATA...</p>
                    </DialogHeader>

                    <Tabs defaultValue="profile" className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-10 mt-8">
                            <TabsList className="bg-white/5 border border-white/5 rounded-2xl p-1 h-12 w-full grid grid-cols-2">
                                <TabsTrigger value="profile" className="rounded-xl font-black text-[10px] tracking-[0.2em] uppercase data-[state=active]:bg-indigo-500 data-[state=active]:text-white">IDENTITY</TabsTrigger>
                                <TabsTrigger value="interactions" className="rounded-xl font-black text-[10px] tracking-[0.2em] uppercase data-[state=active]:bg-indigo-500 data-[state=active]:text-white">INTEL LOGS</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="profile" className="flex-1 overflow-y-auto custom-scrollbar p-10 mt-0 space-y-8">
                            <div className="grid gap-10">
                                {/* Core Info */}
                                <div className="grid gap-6">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">full name <span className="text-indigo-500">*</span></label>
                                            <Input
                                                className="h-14 font-black text-xl border-white/5 bg-white/5 focus-visible:ring-indigo-500/30 rounded-2xl text-white placeholder:text-white/10"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="IDENTITY..."
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">connection type</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.relationship}
                                                    onChange={e => setFormData({ ...formData, relationship: e.target.value as RelationshipType })}
                                                    className="flex h-14 w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-2 text-sm font-black text-white outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none uppercase tracking-widest"
                                                >
                                                    <option value="family">FAMILY</option>
                                                    <option value="friend">FRIEND</option>
                                                    <option value="work">COLLEAGUE</option>
                                                    <option value="other">OTHER</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-20 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 p-4 bg-white/5 border border-white/5 rounded-2xl">
                                        <Checkbox
                                            id="person-isMe"
                                            checked={formData.isMe}
                                            onCheckedChange={(checked) => setFormData({ ...formData, isMe: checked === true })}
                                            className="w-5 h-5 border-white/20 data-[state=checked]:bg-indigo-500 rounded-lg"
                                        />
                                        <label htmlFor="person-isMe" className="text-[11px] font-black text-white/40 uppercase tracking-widest cursor-pointer">
                                            MARK THIS PROFILE AS MY PERSONAL IDENTITY
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">COMMS CHANNEL</label>
                                            <Input
                                                className="h-14 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/10 font-mono text-sm"
                                                value={formData.contact}
                                                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                                placeholder="010-0000-0000"
                                            />
                                        </div>
                                        <div className="space-y-3 flex flex-col">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Origin Date (Birth)</label>
                                            <div className="glass-premium rounded-2xl overflow-hidden border border-white/5 bg-black/20">
                                                <DatePicker
                                                    date={formData.birthdate ? new Date(formData.birthdate) : undefined}
                                                    setDate={(date) => setFormData({ ...formData, birthdate: date })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[1px] bg-white/[0.03]" />

                                {/* Social Context */}
                                <div className="grid gap-6">
                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">SOCIAL ARCHITECTURE</label>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Industry Sector</label>
                                            <Input
                                                className="h-12 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/10 text-sm font-bold uppercase tracking-wider"
                                                value={formData.industry || ''}
                                                onChange={e => setFormData({ ...formData, industry: e.target.value })}
                                                placeholder="TECH / FINANCE / ETC"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Collective Group</label>
                                            <Input
                                                className="h-12 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/10 text-sm font-bold uppercase tracking-wider"
                                                value={formData.group || ''}
                                                onChange={e => setFormData({ ...formData, group: e.target.value })}
                                                placeholder="HIGH SCHOOL / CLUB"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Organization</label>
                                            <Input
                                                className="h-12 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/10 text-sm font-bold uppercase"
                                                value={formData.company || ''}
                                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                                                placeholder="CORP / ENTITY"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Designation</label>
                                            <Input
                                                className="h-12 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-white/10 text-sm font-bold uppercase"
                                                value={formData.jobTitle || ''}
                                                onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                                                placeholder="OPERATIVE ROLE"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[1px] bg-white/[0.03]" />

                                {/* Tags & Cards */}
                                <div className="space-y-8">
                                    <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">SUPPLEMENTARY DATA</label>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">TAG CLOUD</label>
                                        <div className="flex flex-wrap gap-2 p-4 bg-white/5 rounded-2xl border border-white/5 transition-all">
                                            {(formData.tags || []).map(tag => (
                                                <Badge key={tag} className="px-3 py-1.5 text-[10px] font-black rounded-xl bg-white/5 border border-white/10 text-white shadow-sm hover:bg-indigo-500 transition-colors uppercase tracking-widest">
                                                    {tag}
                                                    <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 opacity-30 hover:opacity-100">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                            <input
                                                value={tagInput}
                                                onChange={e => setTagInput(e.target.value)}
                                                onKeyDown={handleTagKeyDown}
                                                onBlur={handleAddTag}
                                                className="flex-1 min-w-[120px] bg-transparent outline-none text-sm h-8 italic text-white/20 placeholder:text-white/10"
                                                placeholder="+ ADD LABEL..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Dossier Notes</label>
                                        <textarea
                                            value={formData.notes || ''}
                                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                            className="flex min-h-[120px] w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-4 text-sm font-bold text-white placeholder:text-white/10 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            placeholder="RECORDS, PREFERENCES, TRAITS..."
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">IDENTIFICATION MEDIA (Business Card)</label>
                                        <div className="border-2 border-dashed border-white/5 rounded-3xl p-8 transition-all hover:bg-white/5 group relative overflow-hidden">
                                            {formData.businessCardImage ? (
                                                <div className="relative w-full h-[250px] rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl">
                                                    <Image src={formData.businessCardImage} alt="Business Card" fill className="object-contain" unoptimized />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, businessCardImage: '' }))}
                                                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-rose-500 text-white shadow-xl flex items-center justify-center hover:scale-110 transition-all active:scale-90"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-center py-6 cursor-pointer" onClick={() => document.getElementById('card-upload')?.click()}>
                                                    <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                                                        <ImageIcon className="w-8 h-8 text-white/10" />
                                                    </div>
                                                    <p className="text-xs font-black text-white/20 tracking-[0.2em] uppercase">UPLOAD SCAN</p>
                                                    <p className="text-[10px] font-bold text-white/10 mt-2 uppercase">PNG, JPG UP TO 2MB</p>
                                                </div>
                                            )}
                                            <input id="card-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="interactions" className="flex-1 overflow-y-auto custom-scrollbar p-10 mt-0 space-y-10">
                            <div className="space-y-8">
                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">NEW ENGAGEMENT LOG</label>
                                <div className="p-8 bg-white/5 rounded-[32px] border border-white/5 space-y-6 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full" />
                                    <div className="grid grid-cols-2 gap-6 relative z-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">LOG TYPE</label>
                                            <select
                                                value={interactionType}
                                                onChange={e => setInteractionType(e.target.value as any)}
                                                className="h-12 w-full rounded-xl border border-white/5 bg-white/5 px-4 text-xs font-black text-white outline-none uppercase tracking-widest cursor-pointer"
                                            >
                                                <option value="call">COMS CALL</option>
                                                <option value="meeting">DIRECT MEETING</option>
                                                <option value="email">SECURE EMAIL</option>
                                                <option value="event">SOCIAL EVENT</option>
                                                <option value="other">MISC</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">ENGAGEMENT DATE</label>
                                            <Input
                                                type="date"
                                                value={format(interactionDate, 'yyyy-MM-dd')}
                                                onChange={e => setInteractionDate(new Date(e.target.value))}
                                                className="h-12 bg-white/5 border-white/5 rounded-xl text-white text-[11px] font-black tracking-widest font-mono cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3 relative z-10">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">INTEL CONTENT</label>
                                        <textarea
                                            value={interactionContent}
                                            onChange={e => setInteractionContent(e.target.value)}
                                            placeholder="LOG ENTRY DETAILS..."
                                            className="w-full h-32 rounded-2xl border border-white/5 bg-white/10 p-4 text-sm font-bold text-white placeholder:text-white/10 resize-none outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                    <Button
                                        className="w-full h-14 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-sm tracking-[0.2em] shadow-lg relative z-10"
                                        onClick={handleAddInteraction}
                                    >
                                        COMMIT TO TIMELINE
                                    </Button>
                                </div>

                                <div className="space-y-8">
                                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">CHRONOLOGICAL HISTORY</label>
                                    <div className="space-y-6">
                                        {(!formData.interactions || formData.interactions.length === 0) ? (
                                            <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] rounded-[32px] border border-dashed border-white/5">
                                                <Briefcase className="w-10 h-10 text-white/5 mb-4" />
                                                <p className="text-[11px] font-black text-white/10 uppercase tracking-[0.2em]">NO LOGS DETECTED</p>
                                            </div>
                                        ) : (
                                            formData.interactions.map(log => (
                                                <div key={log.id} className="relative pl-10 pb-8 last:pb-0 group/log">
                                                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-white/10 border-2 border-white/5 z-10 group-hover/log:bg-indigo-500 group-hover/log:scale-125 transition-all" />
                                                    <div className="absolute left-[7px] top-5 bottom-0 w-[2px] bg-white/[0.03]" />

                                                    <div className="glass-premium p-6 rounded-[24px] border border-white/5 hover:border-white/10 transition-all shadow-xl">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-4">
                                                                <Badge className="bg-white/10 border-white/10 text-white text-[9px] font-black h-6 uppercase px-3 tracking-widest">
                                                                    {log.type}
                                                                </Badge>
                                                                <span className="text-[10px] font-black text-white/20 tracking-widest font-mono">
                                                                    {format(new Date(log.date), 'yyyy . MM . dd')}
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleRemoveInteraction(log.id)}
                                                                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                                                            >
                                                                <X className="w-4 h-4" strokeWidth={3} />
                                                            </button>
                                                        </div>
                                                        <p className="text-sm font-bold text-white/60 leading-relaxed whitespace-pre-wrap">{log.content}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="p-10 shrink-0 bg-white/[0.02] border-t border-white/5">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDialogOpen(false)}
                            className="h-14 px-8 rounded-2xl font-black text-[11px] tracking-widest uppercase text-white/30 hover:text-white"
                        >
                            ABORT
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!formData.name}
                            className="h-14 px-10 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-sm tracking-[0.2em] shadow-[0_15px_30px_-5px_rgba(99,102,241,0.4)] transition-all active:scale-95"
                        >
                            {editingId ? 'COMMIT CHANGES' : 'INITIALIZE DOSSIER'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!viewImage} onOpenChange={(open) => !open && setViewImage(null)}>
                <DialogContent className="glass-premium border border-white/20 text-white rounded-[40px] p-0 shadow-2xl sm:max-w-4xl overflow-hidden">
                    <DialogHeader className="p-8 bg-white/[0.05] border-b border-white/5 flex flex-row items-center justify-between">
                        <DialogTitle className="text-2xl font-black tracking-tighter uppercase">ID MEDIA PREVIEW</DialogTitle>
                    </DialogHeader>
                    {viewImage && (
                        <div className="w-full h-[70vh] bg-black/40 flex items-center justify-center p-10 relative">
                            <Image src={viewImage || ''} alt="Full Business Card" fill className="object-contain" unoptimized />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {isMapOpen && <PeopleMap onClose={() => setIsMapOpen(false)} />}
        </div>
    );
}

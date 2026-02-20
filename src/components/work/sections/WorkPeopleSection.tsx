import { useData } from '@/context/DataProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Search, Phone, Mail, Link2, ExternalLink, Shield, Target, Activity, Terminal, Zap, UserPlus, Filter, MoreHorizontal, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { generateId, cn } from '@/lib/utils';
import { Person, RelationshipType } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

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
            return matchesSearch && (p.relationship === 'work' || !p.relationship);
        }
        return matchesSearch;
    });

    return (
        <div className="space-y-10">
            {/* Header / Protocol Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="relative group/search flex-1 md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within/search:text-indigo-400 transition-colors" />
                        <Input
                            placeholder="SEARCH_COGNITIVE_NODES..."
                            className="h-14 pl-12 pr-6 bg-white/[0.03] border-white/5 rounded-2xl text-[11px] font-black tracking-widest text-white uppercase focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all placeholder:text-white/10"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-white/[0.03] border border-white/5 p-1 rounded-2xl">
                        <Button
                            variant="ghost"
                            onClick={() => setShowWorkOnly(true)}
                            className={cn(
                                "h-12 px-6 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all",
                                showWorkOnly ? "bg-indigo-500 text-white shadow-lg" : "text-white/20 hover:text-white"
                            )}
                        >
                            WORK_NODES
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setShowWorkOnly(false)}
                            className={cn(
                                "h-12 px-6 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all",
                                !showWorkOnly ? "bg-indigo-500 text-white shadow-lg" : "text-white/20 hover:text-white"
                            )}
                        >
                            ALL_VECTORS
                        </Button>
                    </div>
                </div>
                <Button
                    onClick={handleOpenCreate}
                    className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs tracking-[0.2em] uppercase shadow-[0_12px_24px_-8px_rgba(99,102,241,0.5)] active:scale-95 transition-all w-full md:w-auto"
                >
                    <UserPlus className="w-4 h-4 mr-3" /> INITIALIZE_NODE
                </Button>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredPeople.map((person, idx) => (
                        <motion.div
                            key={person.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <Card className="glass-premium border-white/5 hover:border-indigo-500/30 transition-all group/card h-full relative overflow-hidden rounded-[32px] shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent pointer-events-none" />

                                <CardContent className="p-6 relative z-10 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="relative">
                                            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-sky-500 rounded-full blur opacity-0 group-hover/card:opacity-40 transition-opacity" />
                                            <Avatar className="w-16 h-16 border-2 border-white/10 relative z-10">
                                                <AvatarImage src={person.avatar} />
                                                <AvatarFallback className="bg-white/5 text-white font-black text-xl">{person.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0A0B10] z-20" />
                                        </div>
                                        <div className="flex gap-1">
                                            {person.contact && (
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl bg-white/5 hover:bg-indigo-500 hover:text-white transition-all" onClick={() => window.open(`tel:${person.contact}`)}>
                                                    <Phone className="w-3 h-3" />
                                                </Button>
                                            )}
                                            {person.email && (
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl bg-white/5 hover:bg-sky-500 hover:text-white transition-all" onClick={() => window.open(`mailto:${person.email}`)}>
                                                    <Mail className="w-3 h-3" />
                                                </Button>
                                            )}
                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10" onClick={() => handleOpenEdit(person)}>
                                                <MoreHorizontal className="w-3 h-3 text-white/20" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[8px] font-black text-indigo-400 tracking-widest uppercase px-1.5 py-0.5 bg-indigo-500/10 rounded">
                                                {person.relationship || 'WORK_NODE'}
                                            </span>
                                            {person.isFavorite && <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />}
                                        </div>
                                        <h4 className="text-xl font-black text-white tracking-widest uppercase truncate mb-1">{person.name}</h4>
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] truncate">
                                            {person.role || person.jobTitle || 'UNSPECIFIED_ROLE'} @ <span className="text-white/60">{person.company || 'UNKNOWN_ORGA'}</span>
                                        </p>
                                    </div>

                                    <div className="mt-auto space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/5 rounded-xl group/memo hover:bg-white/10 transition-colors">
                                            <MessageSquare className="w-3 h-3 text-white/20 group-hover/memo:text-indigo-400" />
                                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest italic truncate">
                                                {person.notes || 'NO_METADATA_AVAILABLE'}
                                            </span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="w-full h-10 rounded-xl border-white/5 bg-transparent hover:bg-indigo-500 hover:border-indigo-500 text-[9px] font-black text-white/20 hover:text-white tracking-[0.2em] uppercase transition-all"
                                            onClick={() => handleOpenEdit(person)}
                                        >
                                            DEPLOY_DETAIL_MATRIX
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredPeople.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-32 flex flex-col items-center justify-center glass-premium rounded-[40px] border-2 border-dashed border-white/5"
                    >
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <Users className="w-10 h-10 text-white/10" strokeWidth={1} />
                        </div>
                        <h5 className="text-sm font-black text-white/20 tracking-[0.3em] uppercase">NO_VECTORS_DETECTED_IN_THIS_RADIUS</h5>
                    </motion.div>
                )}
            </div>

            {/* Premium Dialog Overhaul */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass-premium border-white/10 rounded-[40px] p-8 max-w-2xl bg-[#0A0B10]/95 backdrop-blur-3xl shadow-3xl text-white overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-sky-500/[0.05] pointer-events-none" />
                    <DialogHeader className="mb-8 relative z-10">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <Target className="w-5 h-5 text-indigo-400" />
                            </div>
                            <span className="text-[10px] font-black text-indigo-400 tracking-[0.3em] uppercase">SYSTEM_NODE_CONFIGURATION</span>
                        </div>
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase">{editingId ? 'EDIT_COGNITIVE_VECTOR' : 'REGISTER_NEW_VECTOR'}</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-6 py-4 relative z-10">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-white/20 tracking-widest uppercase ml-1">DESIGNATION</Label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="ENTRY_NAME"
                                    className="h-12 bg-white/5 border-white/5 rounded-xl text-xs font-bold tracking-wider placeholder:text-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-white/20 tracking-widest uppercase ml-1">RELATION_TYPE</Label>
                                <select
                                    className="flex h-12 w-full rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-widest text-white/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    value={formData.relationship}
                                    onChange={e => setFormData({ ...formData, relationship: e.target.value as RelationshipType })}
                                >
                                    <option value="work">WORK_PROTOCOL</option>
                                    <option value="friend">FRIEND_PROTOCOL</option>
                                    <option value="family">FAMILY_PROTOCOL</option>
                                    <option value="other">STRAY_VECTOR</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-white/20 tracking-widest uppercase ml-1">ORGANIZATION</Label>
                                <Input
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                    placeholder="COMMAND_BASE"
                                    className="h-12 bg-white/5 border-white/5 rounded-xl text-xs font-bold tracking-wider"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-white/20 tracking-widest uppercase ml-1">MISSION_ROLE</Label>
                                <Input
                                    value={formData.jobTitle}
                                    onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                                    placeholder="SPECIALIST_GRADE"
                                    className="h-12 bg-white/5 border-white/5 rounded-xl text-xs font-bold tracking-wider"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-white/20 tracking-widest uppercase ml-1">COMMS_LINK</Label>
                                <Input
                                    value={formData.contact}
                                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                    placeholder="SECURE_LINE"
                                    className="h-12 bg-white/5 border-white/5 rounded-xl text-xs font-bold tracking-wider"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-white/20 tracking-widest uppercase ml-1">ELECTRONIC_MAIL</Label>
                                <Input
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="ENCRYPTED_MAIL"
                                    className="h-12 bg-white/5 border-white/5 rounded-xl text-xs font-bold tracking-wider"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-white/20 tracking-widest uppercase ml-1">BIOMETRIC_METADATA / NOTES</Label>
                            <Input
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="OBSERVATIONAL_LOGS..."
                                className="h-12 bg-white/5 border-white/5 rounded-xl text-xs font-bold tracking-wider"
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-10 relative z-10">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-12 px-8 rounded-xl text-[10px] font-black text-white/20 hover:text-white uppercase tracking-widest">ABORT</Button>
                        <Button
                            onClick={handleSave}
                            disabled={!formData.name}
                            className="h-12 px-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] tracking-widest uppercase shadow-xl"
                        >
                            COMMIT_VECTOR
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

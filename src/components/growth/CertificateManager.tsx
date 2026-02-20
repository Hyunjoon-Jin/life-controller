'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
    Award, Plus, Trash2, Edit2, Calendar, CheckCircle2,
    AlertCircle, ShieldCheck, Fingerprint, Terminal,
    Link as LinkIcon, FileCheck, Search, Zap, Clock,
    ExternalLink, Cpu, Database
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Certificate } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export function CertificateManager() {
    const { certificates = [], addCertificate, updateCertificate, deleteCertificate } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form
    const [name, setName] = useState('');
    const [issuer, setIssuer] = useState('');
    const [date, setDate] = useState<Date>(new Date());
    const [expiryDate, setExpiryDate] = useState<string>('');
    const [score, setScore] = useState('');
    const [status, setStatus] = useState<Certificate['status']>('studying');
    const [memo, setMemo] = useState('');
    const [credentialId, setCredentialId] = useState('');
    const [fileUrl, setFileUrl] = useState('');

    const handleSave = () => {
        if (!name) return;

        const cert: Certificate = {
            id: editingId || generateId(),
            name,
            issuer,
            date: date,
            expiryDate: expiryDate ? new Date(expiryDate) : undefined,
            score,
            status,
            memo,
            credentialId,
            fileUrl
        };

        if (editingId) {
            updateCertificate(cert);
        } else {
            addCertificate(cert);
        }

        setIsDialogOpen(false);
        resetForm();
    };

    const handleEdit = (c: Certificate) => {
        setEditingId(c.id);
        setName(c.name);
        setIssuer(c.issuer);
        setDate(new Date(c.date));
        setExpiryDate(c.expiryDate ? format(new Date(c.expiryDate), 'yyyy-MM-dd') : '');
        setScore(c.score || '');
        setStatus(c.status);
        setMemo(c.memo || '');
        setCredentialId(c.credentialId || '');
        setFileUrl(c.fileUrl || '');
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingId(null); setName(''); setIssuer(''); setDate(new Date());
        setExpiryDate(''); setScore(''); setStatus('studying'); setMemo('');
        setCredentialId(''); setFileUrl('');
    };

    const getStatusColor = (status: Certificate['status']) => {
        switch (status) {
            case 'acquired': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'studying': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
            case 'expired': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            default: return 'text-slate-400 bg-white/5 border-white/5';
        }
    };

    const getStatusLabel = (status: Certificate['status']) => {
        switch (status) {
            case 'acquired': return 'ACQUIRED';
            case 'studying': return 'IN PROGRESS';
            case 'expired': return 'EXPIRED';
            default: return 'UNKNOWN';
        }
    };

    const getDDay = (targetDate?: Date | string) => {
        if (!targetDate) return null;
        const diff = differenceInDays(new Date(targetDate), new Date());
        if (diff < 0) return 'D+' + Math.abs(diff);
        if (diff === 0) return 'D-DAY';
        return 'D-' + diff;
    };

    return (
        <div className="h-full flex flex-col glass-premium rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] via-transparent to-cyan-500/[0.03] pointer-events-none" />

            {/* Header */}
            <div className="p-8 pb-4 relative z-10">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(16,185,129,0.5)]">
                            <ShieldCheck className="w-6 h-6 text-white" strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">CREDENTIAL VAULT</h2>
                            <p className="text-[10px] font-bold text-white/20 tracking-[0.3em] uppercase mt-2 italic flex items-center gap-2">
                                <Terminal className="w-3 h-3 text-emerald-500" /> ENCRYPTED REPOSITORY: ACTIVE
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => { resetForm(); setIsDialogOpen(true); }}
                        className="h-12 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] tracking-widest uppercase shadow-xl transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4 mr-2" strokeWidth={3} /> NEW CREDENTIAL
                    </Button>
                </div>

                {/* Vault Filter/Search Placeholder UI */}
                <div className="flex items-center gap-4 mb-8 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                    <Search className="w-4 h-4 text-white/20 ml-2" />
                    <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest italic">SCANNING ARCHIVES...</span>
                    <div className="ml-auto flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse delay-75" />
                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse delay-150" />
                    </div>
                </div>
            </div>

            {/* Content Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {certificates.map((cert, idx) => {
                            const isStudying = cert.status === 'studying';
                            const isAcquired = cert.status === 'acquired';
                            const examDDay = isStudying ? getDDay(cert.date) : null;
                            const expiryDDay = isAcquired && cert.expiryDate ? getDDay(cert.expiryDate) : null;

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={cert.id}
                                >
                                    <Card className="group glass-premium rounded-[32px] border border-white/5 p-6 hover:bg-white/[0.03] transition-all relative overflow-hidden h-full flex flex-col">
                                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                            <Fingerprint className="w-20 h-20 text-white" strokeWidth={1} />
                                        </div>

                                        <div className="flex justify-between items-start mb-6">
                                            <span className={cn("text-[9px] font-black px-3 py-1 rounded-lg border tracking-widest uppercase", getStatusColor(cert.status))}>
                                                {getStatusLabel(cert.status)}
                                            </span>
                                            {examDDay && (
                                                <div className="flex items-center gap-2 text-[9px] font-black text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20 tracking-tighter uppercase">
                                                    <Zap className="w-3 h-3" /> EXAM: {examDDay}
                                                </div>
                                            )}
                                            {expiryDDay && (
                                                <div className="flex items-center gap-2 text-[9px] font-black text-rose-400 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20 tracking-tighter uppercase">
                                                    <Clock className="w-3 h-3" /> EXPIRES: {expiryDDay}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1 mb-6">
                                            <h3 className="text-lg font-black text-white tracking-widest uppercase truncate">{cert.name}</h3>
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic">{cert.issuer}</p>
                                        </div>

                                        <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
                                            {cert.score && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                        <FileCheck className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">PERFORMANCE SCORE</p>
                                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{cert.score}</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{isStudying ? 'SCHEDULED DATE' : 'ACQUISITION DATE'}</p>
                                                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">{format(new Date(cert.date), 'yyyy.MM.dd')}</p>
                                                </div>
                                            </div>

                                            {cert.fileUrl && (
                                                <a
                                                    href={cert.fileUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-black text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all tracking-widest uppercase mt-2"
                                                >
                                                    <ExternalLink className="w-3 h-3" /> DATALINK SECURED
                                                </a>
                                            )}
                                        </div>

                                        <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <button onClick={() => handleEdit(cert)} className="w-10 h-10 rounded-xl bg-white/5 text-white/20 hover:text-white flex items-center justify-center backdrop-blur-md">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => deleteCertificate(cert.id)} className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center backdrop-blur-md">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass-premium border border-white/10 text-white rounded-[40px] p-0 shadow-2xl sm:max-w-3xl max-h-[90vh] overflow-hidden">
                    <DialogHeader className="p-10 pb-0">
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase mb-2">{editingId ? 'RECALIBRATE VAULT' : 'INITIALIZE CREDENTIAL'}</DialogTitle>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] italic">UPDATING NEURAL CREDENTIALS IN ENCRYPTED REPOSITORY</p>
                    </DialogHeader>

                    <div className="p-10 pt-4 overflow-y-auto custom-scrollbar space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">CREDENTIAL IDENTIFIER</Label>
                                <Input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="EX: CLOUD SOLUTIONS ARCHITECT"
                                    className="h-14 font-black text-xl border-white/5 bg-white/5 rounded-2xl text-white placeholder:text-white/10"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">ISSUING SECTOR</Label>
                                <Input
                                    value={issuer}
                                    onChange={e => setIssuer(e.target.value)}
                                    placeholder="EX: AWS, COMPTIA, GOOGLE"
                                    className="h-14 font-black text-lg border-white/5 bg-white/5 rounded-2xl text-white placeholder:text-white/10"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">VAULT STATUS</Label>
                                <select
                                    className="flex h-12 w-full rounded-2xl border border-white/5 bg-white/5 px-4 font-black uppercase text-[10px] tracking-widest text-white outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    value={status}
                                    onChange={e => setStatus(e.target.value as any)}
                                >
                                    <option value="studying" className="bg-slate-900">IN PROGRESS</option>
                                    <option value="acquired" className="bg-slate-900">ACQUIRED</option>
                                    <option value="expired" className="bg-slate-900">EXPIRED</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">{status === 'studying' ? 'TARGET CHRONO' : 'ACQUIRED CHRONO'}</Label>
                                <Input
                                    type="date"
                                    value={date ? format(date, "yyyy-MM-dd") : ''}
                                    onChange={e => setDate(new Date(e.target.value))}
                                    className="h-12 font-black text-[10px] bg-white/5 border-white/5 rounded-2xl text-white"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">EXPIRATION SCAN (OPTIONAL)</Label>
                                <Input
                                    type="date"
                                    value={expiryDate}
                                    onChange={e => setExpiryDate(e.target.value)}
                                    className="h-12 font-black text-[10px] bg-white/5 border-white/5 rounded-2xl text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">PERFORMANCE METRICS</Label>
                                <Input
                                    value={score}
                                    onChange={e => setScore(e.target.value)}
                                    placeholder="EX: 990, GRADE A, LEVEL 1"
                                    className="h-12 font-black text-[10px] bg-white/5 border-white/5 rounded-2xl text-white uppercase tracking-widest"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">CREDENTIAL ID</Label>
                                <Input
                                    value={credentialId}
                                    onChange={e => setCredentialId(e.target.value)}
                                    placeholder="SERIAL NUMBER"
                                    className="h-12 font-black text-[10px] bg-white/5 border-white/5 rounded-2xl text-white uppercase tracking-widest"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">EXTERNAL DATALINK (URL)</Label>
                            <Input
                                value={fileUrl}
                                onChange={e => setFileUrl(e.target.value)}
                                placeholder="HTTPS://VERIFY.CERT..."
                                className="h-12 bg-white/5 border-white/5 rounded-2xl text-white text-[10px] font-black tracking-widest uppercase"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">NEURAL MEMO / ANTAGRAVITY LOG</Label>
                            <Textarea
                                value={memo}
                                onChange={e => setMemo(e.target.value)}
                                placeholder="ENTER SUPPLEMENTARY DATA..."
                                className="min-h-[120px] bg-white/5 border-white/5 rounded-3xl p-6 text-[11px] font-bold text-white/60 leading-relaxed italic placeholder:text-white/10 resize-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-10 pt-4 bg-white/[0.02] border-t border-white/5">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDialogOpen(false)}
                            className="h-16 px-8 rounded-2xl text-[10px] font-black text-white/20 hover:text-white hover:bg-white/5 uppercase tracking-widest"
                        >
                            ABORT
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!name}
                            className="flex-1 h-16 rounded-3xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm tracking-[0.2em] shadow-2xl active:scale-95 transition-all uppercase"
                        >
                            ENCRYPT DATA
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

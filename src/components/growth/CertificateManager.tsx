'use client';

import { useState } from 'react';
import { useData } from '@/context/DataProvider';
import { generateId, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Plus, Trash2, Edit2, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Certificate } from '@/types';

export function CertificateManager() {
    const { certificates, addCertificate, updateCertificate, deleteCertificate } = useData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form
    const [name, setName] = useState('');
    const [issuer, setIssuer] = useState('');
    const [date, setDate] = useState<Date>(new Date());
    const [expiryDate, setExpiryDate] = useState<string>(''); // Managed as string for input
    const [score, setScore] = useState('');
    const [status, setStatus] = useState<Certificate['status']>('studying');
    const [memo, setMemo] = useState('');

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
            memo
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
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setIssuer('');
        setDate(new Date());
        setExpiryDate('');
        setScore('');
        setStatus('studying');
        setMemo('');
    };

    const getStatusColor = (status: Certificate['status']) => {
        switch (status) {
            case 'acquired': return 'bg-green-100 text-green-700 border-green-200';
            case 'studying': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'expired': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status: Certificate['status']) => {
        switch (status) {
            case 'acquired': return '취득 완료';
            case 'studying': return '준비 중';
            case 'expired': return '만료됨';
            default: return '';
        }
    };

    const getDDay = (targetDate?: Date) => {
        if (!targetDate) return null;
        const diff = differenceInDays(new Date(targetDate), new Date());
        if (diff < 0) return 'D+' + Math.abs(diff);
        if (diff === 0) return 'D-Day';
        return 'D-' + diff;
    };

    return (
        <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">자격증 관리</h2>
                </div>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> 자격증 추가
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificates.map(cert => (
                    <Card key={cert.id} className="group hover:shadow-md transition-all">
                        <CardContent className="p-5 flex flex-col h-full relative">
                            <div className="flex justify-between items-start mb-3">
                                <span className={cn("text-xs px-2 py-1 rounded-full font-bold border", getStatusColor(cert.status))}>
                                    {getStatusLabel(cert.status)}
                                </span>
                                {cert.status === 'studying' && (
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                        시험 {getDDay(new Date(cert.date))}
                                    </span>
                                )}
                                {cert.status === 'acquired' && cert.expiryDate && (
                                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                        만료 {getDDay(new Date(cert.expiryDate))}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-lg font-bold mb-1">{cert.name}</h3>
                            <div className="text-sm text-slate-500 mb-4">{cert.issuer}</div>

                            <div className="mt-auto space-y-2 text-sm">
                                {cert.score && (
                                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span>점수/등급: {cert.score}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                        {cert.status === 'studying' ? '시험일: ' : '취득일: '}
                                        {format(new Date(cert.date), 'yyyy.MM.dd')}
                                    </span>
                                </div>
                            </div>

                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(cert)}>
                                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-red-500" onClick={() => deleteCertificate(cert.id)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? '자격증 수정' : '자격증 추가'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>자격증 명</Label>
                            <Input
                                placeholder="예: 정보처리기사, TOEIC"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>발급 기관</Label>
                                <Input
                                    placeholder="예: 한국산업인력공단"
                                    value={issuer}
                                    onChange={e => setIssuer(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>상태</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    value={status}
                                    onChange={e => setStatus(e.target.value as any)}
                                >
                                    <option value="studying">시험 준비 중</option>
                                    <option value="acquired">취득 완료</option>
                                    <option value="expired">만료됨</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>{status === 'studying' ? '시험 예정일' : '취득일'}</Label>
                                <Input
                                    type="date"
                                    value={date ? format(date, "yyyy-MM-dd") : ''}
                                    onChange={e => setDate(new Date(e.target.value))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>만료일 (선택)</Label>
                                <Input
                                    type="date"
                                    value={expiryDate}
                                    onChange={e => setExpiryDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>점수 / 등급 (선택)</Label>
                            <Input
                                placeholder="예: 850점, Level 6, 1급"
                                value={score}
                                onChange={e => setScore(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>메모 (선택)</Label>
                            <Input
                                placeholder="추가 메모"
                                value={memo}
                                onChange={e => setMemo(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave} disabled={!name}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

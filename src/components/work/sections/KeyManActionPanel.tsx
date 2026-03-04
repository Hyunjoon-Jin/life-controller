'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, Clock, AlertCircle, MessageSquare, FileText, CheckSquare, Trash2, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn, generateId } from '@/lib/utils';
import { toast } from 'sonner';
import { Person } from '@/types';

// ── Types ────────────────────────────────────────────────────────────────────
export type ActionType = 'report' | 'comm' | 'confirm';

export interface KeyManAction {
    id: string;
    personId: string;
    type: ActionType;
    subject: string;
    content: string;
    dueDate: string;
    status: 'pending' | 'done';
    createdAt: string;
}

const STORAGE_KEY = 'keyman-actions';

export function loadActions(): KeyManAction[] {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function saveActions(actions: KeyManAction[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
}

// ── Action Type Config ────────────────────────────────────────────────────────
const ACTION_TYPES: {
    value: ActionType;
    label: string;
    icon: typeof MessageSquare;
    color: string;
    bg: string;
    border: string;
}[] = [
    { value: 'report', label: '보고', icon: FileText, color: 'text-blue-300', bg: 'bg-blue-500/20', border: 'border-blue-500/40' },
    { value: 'comm', label: '소통', icon: MessageSquare, color: 'text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' },
    { value: 'confirm', label: '컨펌 요청', icon: CheckSquare, color: 'text-amber-300', bg: 'bg-amber-500/20', border: 'border-amber-500/40' },
];

// ── Main Panel ────────────────────────────────────────────────────────────────
interface KeyManActionPanelProps {
    person: Person;
    onClose: () => void;
}

export function KeyManActionPanel({ person, onClose }: KeyManActionPanelProps) {
    const [actions, setActions] = useState<KeyManAction[]>([]);
    const [actionType, setActionType] = useState<ActionType>('report');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [showForm, setShowForm] = useState(true);
    const [showDone, setShowDone] = useState(false);

    useEffect(() => {
        setActions(loadActions());
    }, []);

    const personActions = actions.filter(a => a.personId === person.id);
    const pending = personActions.filter(a => a.status === 'pending');
    const done = personActions.filter(a => a.status === 'done');

    const handleAdd = () => {
        if (!subject.trim()) { toast.error('내용을 입력해 주세요.'); return; }
        const newAction: KeyManAction = {
            id: generateId(),
            personId: person.id,
            type: actionType,
            subject: subject.trim(),
            content: content.trim(),
            dueDate,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        const updated = [...actions, newAction];
        setActions(updated);
        saveActions(updated);
        setSubject('');
        setContent('');
        setDueDate('');
        setShowForm(false);
        toast.success('추가되었습니다.');
    };

    const toggleStatus = (id: string) => {
        const updated: KeyManAction[] = actions.map(a =>
            a.id === id ? { ...a, status: (a.status === 'pending' ? 'done' : 'pending') as KeyManAction['status'] } : a
        );
        setActions(updated);
        saveActions(updated);
    };

    const deleteAction = (id: string) => {
        const updated = actions.filter(a => a.id !== id);
        setActions(updated);
        saveActions(updated);
    };

    const getTypeConfig = (type: ActionType) => ACTION_TYPES.find(t => t.value === type)!;

    const formatDate = (iso: string) => {
        if (!iso) return '';
        const d = new Date(iso);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="relative w-full max-w-md h-full glass-premium border-l border-white/10 shadow-2xl flex flex-col overflow-hidden"
                style={{ background: 'rgba(10,11,16,0.97)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div className="p-5 border-b border-white/8 flex-shrink-0">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="w-12 h-12 border-2 border-white/10">
                                    <AvatarImage src={person.avatar} />
                                    <AvatarFallback className="bg-indigo-500/20 text-indigo-300 font-black text-lg">
                                        {person.name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0A0B10]" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-white tracking-wide">{person.name}</h3>
                                <p className="text-xs text-white/40 font-medium">
                                    {[person.jobTitle || person.role, person.company].filter(Boolean).join(' · ')}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Quick contact */}
                    <div className="flex gap-2">
                        {person.contact && (
                            <button
                                onClick={() => window.open(`tel:${person.contact}`)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/8 hover:border-emerald-500/30 text-xs text-white/50 hover:text-emerald-300 transition-all"
                            >
                                <Phone className="w-3.5 h-3.5" /> {person.contact}
                            </button>
                        )}
                        {person.email && (
                            <button
                                onClick={() => window.open(`mailto:${person.email}`)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-sky-500/20 border border-white/8 hover:border-sky-500/30 text-xs text-white/50 hover:text-sky-300 transition-all"
                            >
                                <Mail className="w-3.5 h-3.5" /> 메일
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Action Form ── */}
                <div className="flex-shrink-0 border-b border-white/8">
                    <button
                        onClick={() => setShowForm(v => !v)}
                        className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Plus className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm font-semibold text-white/70">새 소통 항목 추가</span>
                        </div>
                        {showForm ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                    </button>

                    <AnimatePresence>
                        {showForm && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="px-5 pb-5 space-y-3">
                                    {/* Action type selector */}
                                    <div className="flex gap-2">
                                        {ACTION_TYPES.map(t => {
                                            const Icon = t.icon;
                                            return (
                                                <button
                                                    key={t.value}
                                                    onClick={() => setActionType(t.value)}
                                                    className={cn(
                                                        'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all',
                                                        actionType === t.value
                                                            ? `${t.bg} ${t.color} ${t.border}`
                                                            : 'bg-white/5 text-white/30 border-white/8 hover:bg-white/10'
                                                    )}
                                                >
                                                    <Icon className="w-3.5 h-3.5" />
                                                    {t.label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Subject */}
                                    <Input
                                        placeholder="내용 (예: Q3 예산안 검토 요청)"
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(); } }}
                                        className="bg-white/5 border-white/10 text-white text-sm h-9 placeholder:text-white/25"
                                        autoFocus
                                    />

                                    {/* Detail (optional) */}
                                    <Textarea
                                        placeholder="세부 내용 (선택)"
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        rows={2}
                                        className="bg-white/5 border-white/10 text-white text-sm resize-none placeholder:text-white/20"
                                    />

                                    {/* Due date + Submit */}
                                    <div className="flex gap-2 items-center">
                                        <div className="relative flex-1">
                                            <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
                                            <Input
                                                type="date"
                                                value={dueDate}
                                                onChange={e => setDueDate(e.target.value)}
                                                className="bg-white/5 border-white/10 text-white/60 text-xs h-9 pl-8 [color-scheme:dark]"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleAdd}
                                            disabled={!subject.trim()}
                                            className="h-9 px-5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0"
                                        >
                                            추가
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Action List ── */}
                <div className="flex-1 overflow-y-auto">
                    {/* Pending */}
                    <div className="p-5 space-y-2">
                        {pending.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-xs text-white/20 font-medium">등록된 소통 항목이 없습니다</p>
                                <p className="text-[11px] text-white/10 mt-1">위에서 보고·소통·컨펌 항목을 추가하세요</p>
                            </div>
                        ) : (
                            pending.map(action => (
                                <ActionItem
                                    key={action.id}
                                    action={action}
                                    onToggle={() => toggleStatus(action.id)}
                                    onDelete={() => deleteAction(action.id)}
                                    formatDate={formatDate}
                                />
                            ))
                        )}
                    </div>

                    {/* Done (collapsible) */}
                    {done.length > 0 && (
                        <div className="px-5 pb-5">
                            <button
                                onClick={() => setShowDone(v => !v)}
                                className="flex items-center gap-2 text-xs text-white/25 hover:text-white/50 transition-colors mb-2"
                            >
                                {showDone ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                완료된 항목 {done.length}개
                            </button>
                            <AnimatePresence>
                                {showDone && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden space-y-1.5"
                                    >
                                        {done.map(action => (
                                            <ActionItem
                                                key={action.id}
                                                action={action}
                                                onToggle={() => toggleStatus(action.id)}
                                                onDelete={() => deleteAction(action.id)}
                                                formatDate={formatDate}
                                                isDone
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

// ── ActionItem ────────────────────────────────────────────────────────────────
function ActionItem({
    action, onToggle, onDelete, formatDate, isDone = false,
}: {
    action: KeyManAction;
    onToggle: () => void;
    onDelete: () => void;
    formatDate: (s: string) => string;
    isDone?: boolean;
}) {
    const cfg = ACTION_TYPES.find(t => t.value === action.type)!;
    const Icon = cfg.icon;
    const isOverdue = !isDone && action.dueDate && new Date(action.dueDate) < new Date();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={cn(
                'flex items-start gap-3 p-3 rounded-xl border transition-all group',
                isDone
                    ? 'bg-white/[0.02] border-white/5 opacity-50'
                    : 'bg-white/[0.04] border-white/8 hover:border-white/15'
            )}
        >
            {/* Check button */}
            <button
                onClick={onToggle}
                className={cn(
                    'mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all',
                    isDone
                        ? 'bg-emerald-500/30 border-emerald-500/50 text-emerald-400'
                        : 'border-white/20 hover:border-indigo-400 hover:bg-indigo-500/10'
                )}
            >
                {isDone && <Check className="w-3 h-3" />}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span className={cn('flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md', cfg.bg, cfg.color)}>
                        <Icon className="w-2.5 h-2.5" />
                        {cfg.label}
                    </span>
                    {action.dueDate && (
                        <span className={cn(
                            'text-[10px] font-medium flex items-center gap-0.5',
                            isOverdue ? 'text-red-400' : 'text-white/30'
                        )}>
                            {isOverdue && <AlertCircle className="w-3 h-3" />}
                            {formatDate(action.dueDate)}
                        </span>
                    )}
                </div>
                <p className={cn('text-xs font-medium leading-snug', isDone ? 'line-through text-white/30' : 'text-white/80')}>
                    {action.subject}
                </p>
                {action.content && (
                    <p className="text-[11px] text-white/30 mt-0.5 leading-relaxed">{action.content}</p>
                )}
            </div>

            {/* Delete */}
            <button
                onClick={onDelete}
                className="opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-red-400 transition-all shrink-0"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </motion.div>
    );
}

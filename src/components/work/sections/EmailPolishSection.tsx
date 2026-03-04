'use client';

import { useState, useEffect, ReactNode } from 'react';
import {
    Sparkles, Copy, Check, Mail, BookOpen, Layers, Lightbulb,
    Settings, Plus, Trash2, User, Edit3, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { generateId } from '@/lib/utils';
import { toast } from 'sonner';
import { PHRASE_CATEGORIES, EMAIL_TEMPLATES, EMAIL_TIPS } from '@/data/emailSkills';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { copyAsEmailHtml } from '@/lib/markdownToEmailHtml';

// ── Types ────────────────────────────────────────────────────────────────────
type Tone = 'formal' | 'professional' | 'friendly' | 'assertive' | 'concise';
type Purpose = 'report' | 'request' | 'decline' | 'proposal' | 'announcement' | 'thanks' | 'apology' | 'general';
type Language = 'korean' | 'english';
type SkillTab = 'tips' | 'phrases' | 'templates' | 'settings';

interface UserEmailProfile {
    name: string;
    title: string;
    department: string;
    company: string;
    email: string;
    phone: string;
    signature: string;
}

export interface GreetingTemplate {
    id: string;
    label: string;
    type: 'internal' | 'external';
    opening: string;
    closing: string;
}

interface PolishResult {
    subject: string;
    body: string;
    improvements: string[];
    tone_summary: string;
    structure_note?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────
const PROFILE_KEY = 'email-user-profile';
const TEMPLATES_KEY = 'email-greeting-templates';

const DEFAULT_PROFILE: UserEmailProfile = {
    name: '', title: '', department: '', company: '', email: '', phone: '', signature: '',
};

const DEFAULT_GREETING_TEMPLATES: GreetingTemplate[] = [
    {
        id: 'internal-standard',
        label: '사내 기본',
        type: 'internal',
        opening: '안녕하세요,',
        closing: '감사합니다.',
    },
    {
        id: 'external-formal',
        label: '외부 공식',
        type: 'external',
        opening: '안녕하십니까, 귀사의 무궁한 발전을 기원합니다.',
        closing: '감사드립니다. [이름] 드림',
    },
    {
        id: 'external-casual',
        label: '외부 친근',
        type: 'external',
        opening: '안녕하세요 [이름]님,',
        closing: '감사합니다. 좋은 하루 되세요!',
    },
];

const TONE_OPTIONS: { value: Tone; label: string }[] = [
    { value: 'formal', label: '격식체' },
    { value: 'professional', label: '전문적' },
    { value: 'friendly', label: '친근한' },
    { value: 'assertive', label: '단호한' },
    { value: 'concise', label: '간결한' },
];

const PURPOSE_OPTIONS: { value: Purpose; label: string }[] = [
    { value: 'general', label: '일반' },
    { value: 'report', label: '업무 보고' },
    { value: 'request', label: '요청' },
    { value: 'decline', label: '거절/사양' },
    { value: 'proposal', label: '제안' },
    { value: 'announcement', label: '공지/안내' },
    { value: 'thanks', label: '감사' },
    { value: 'apology', label: '사과' },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function EmailPolishSection() {
    // Compose state
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [tone, setTone] = useState<Tone>('professional');
    const [purpose, setPurpose] = useState<Purpose>('general');
    const [language, setLanguage] = useState<Language>('korean');
    const [selectedGreetingId, setSelectedGreetingId] = useState<string | null>(null);

    // Result state
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PolishResult | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // UI state
    const [skillTab, setSkillTab] = useState<SkillTab>('tips');
    const [activePhraseCat, setActivePhraseCat] = useState(PHRASE_CATEGORIES[0].id);
    const [showSkill, setShowSkill] = useState(true);

    // Profile & greeting templates
    const [profile, setProfile] = useState<UserEmailProfile>(DEFAULT_PROFILE);
    const [greetingTemplates, setGreetingTemplates] = useState<GreetingTemplate[]>(DEFAULT_GREETING_TEMPLATES);

    // Load from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(PROFILE_KEY);
            const savedT = localStorage.getItem(TEMPLATES_KEY);
            if (saved) setProfile(JSON.parse(saved));
            if (savedT) setGreetingTemplates(JSON.parse(savedT));
        } catch { /* ignore */ }
    }, []);

    const saveProfile = (p: UserEmailProfile) => {
        setProfile(p);
        localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
        toast.success('프로필이 저장되었습니다.');
    };

    const saveTemplates = (templates: GreetingTemplate[]) => {
        setGreetingTemplates(templates);
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    };

    const handlePolish = async () => {
        if (!body.trim()) { toast.error('메일 본문을 입력해 주세요.'); return; }
        setLoading(true);
        setResult(null);
        const selectedGreeting = greetingTemplates.find(t => t.id === selectedGreetingId);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'polish_email',
                    payload: {
                        to, subject, body, tone, purpose, language,
                        userProfile: profile.name ? profile : undefined,
                        greetingTemplate: selectedGreeting,
                    },
                }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResult(data);
        } catch (e: any) {
            toast.error(`AI 오류: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text: string, field: string, asHtml = false) => {
        let ok = false;
        if (asHtml) {
            ok = await copyAsEmailHtml(text);
        } else {
            try { await navigator.clipboard.writeText(text); ok = true; } catch { ok = false; }
        }
        if (ok) {
            setCopiedField(field);
            toast.success(asHtml ? 'Gmail·Outlook에 바로 붙여넣기 가능합니다.' : '클립보드에 복사되었습니다.');
            setTimeout(() => setCopiedField(null), 2500);
        } else {
            toast.error('복사 실패. 브라우저 권한을 확인해 주세요.');
        }
    };

    const insertPhrase = (text: string) => {
        setBody(prev => prev ? prev + '\n' + text : text);
        toast.success('본문에 삽입되었습니다.');
    };

    const applyTemplate = (templateBody: string, templateSubject: string) => {
        setBody(templateBody);
        if (!subject) setSubject(templateSubject);
        toast.success('템플릿이 적용되었습니다.');
    };

    const selectedGreeting = greetingTemplates.find(t => t.id === selectedGreetingId);
    const currentPhraseCat = PHRASE_CATEGORIES.find(c => c.id === activePhraseCat);

    return (
        <div className="h-full overflow-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-4">

                {/* ── Header ── */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl glass-premium flex items-center justify-center">
                            <Mail className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">메일 다듬기 AI</h2>
                            <p className="text-xs text-muted-foreground">스킬 기반 AI가 BLUF·피라미드 구조로 전문 메일을 완성합니다</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {profile.name && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-muted border border-white/10">
                                <User className="w-3.5 h-3.5 text-blue-400" />
                                <span className="text-xs text-foreground/70">
                                    {profile.name}{profile.title ? ` · ${profile.title}` : ''}{profile.company ? ` / ${profile.company}` : ''}
                                </span>
                            </div>
                        )}
                        <button
                            onClick={() => { setShowSkill(true); setSkillTab('settings'); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
                        >
                            <Settings className="w-3.5 h-3.5" />
                            설정
                        </button>
                        <button
                            onClick={() => setShowSkill(v => !v)}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                                showSkill
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                    : 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10'
                            )}
                        >
                            <BookOpen className="w-3.5 h-3.5" />
                            스킬 가이드
                        </button>
                    </div>
                </div>

                <div className={cn(
                    'grid gap-4',
                    showSkill ? 'grid-cols-1 xl:grid-cols-[1fr_1fr_380px]' : 'grid-cols-1 lg:grid-cols-2'
                )}>

                    {/* ── Col 1: Input Panel ── */}
                    <div className="glass-premium rounded-2xl p-5 space-y-4">
                        <h3 className="text-sm font-medium text-foreground/80 border-b border-white/10 pb-2">원문 입력</h3>

                        {/* Greeting Template Selector */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">인사말 템플릿</Label>
                            <div className="flex flex-wrap gap-1.5">
                                <button
                                    onClick={() => setSelectedGreetingId(null)}
                                    className={cn(
                                        'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                                        selectedGreetingId === null
                                            ? 'bg-white/15 text-foreground border-white/30'
                                            : 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10'
                                    )}
                                >
                                    기본
                                </button>
                                {greetingTemplates.map(tmpl => (
                                    <button
                                        key={tmpl.id}
                                        onClick={() => setSelectedGreetingId(tmpl.id)}
                                        className={cn(
                                            'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                                            selectedGreetingId === tmpl.id
                                                ? tmpl.type === 'internal'
                                                    ? 'bg-blue-500/25 text-blue-300 border-blue-500/40'
                                                    : 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40'
                                                : 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10'
                                        )}
                                    >
                                        <span className={cn(
                                            'text-[9px] px-1 rounded font-semibold',
                                            tmpl.type === 'internal' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                                        )}>
                                            {tmpl.type === 'internal' ? '내부' : '외부'}
                                        </span>
                                        {tmpl.label}
                                    </button>
                                ))}
                                <button
                                    onClick={() => { setShowSkill(true); setSkillTab('settings'); }}
                                    className="px-2 py-1 rounded-lg text-xs text-muted-foreground border border-dashed border-white/20 hover:border-white/40 transition-all"
                                >
                                    + 관리
                                </button>
                            </div>
                            {selectedGreeting && (
                                <div className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/8 text-[11px] text-muted-foreground space-y-0.5">
                                    <div><span className="text-foreground/50">오프닝: </span>{selectedGreeting.opening}</div>
                                    <div><span className="text-foreground/50">클로징: </span>{selectedGreeting.closing}</div>
                                </div>
                            )}
                        </div>

                        {/* Tone */}
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">톤</Label>
                            <div className="flex flex-wrap gap-1">
                                {TONE_OPTIONS.map(opt => (
                                    <button key={opt.value} onClick={() => setTone(opt.value)}
                                        className={cn(
                                            'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                                            tone === opt.value
                                                ? 'bg-blue-500/30 text-blue-300 border-blue-500/50'
                                                : 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10'
                                        )}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Purpose */}
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">목적</Label>
                            <div className="flex flex-wrap gap-1">
                                {PURPOSE_OPTIONS.map(opt => (
                                    <button key={opt.value} onClick={() => setPurpose(opt.value)}
                                        className={cn(
                                            'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                                            purpose === opt.value
                                                ? 'bg-violet-500/30 text-violet-300 border-violet-500/50'
                                                : 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10'
                                        )}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Language */}
                        <div className="flex gap-2">
                            {(['korean', 'english'] as const).map(lang => (
                                <button key={lang} onClick={() => setLanguage(lang)}
                                    className={cn(
                                        'flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border',
                                        language === lang
                                            ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50'
                                            : 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10'
                                    )}>
                                    {lang === 'korean' ? '🇰🇷 한국어' : '🇺🇸 English'}
                                </button>
                            ))}
                        </div>

                        {/* Fields */}
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">수신자 (선택)</Label>
                                <Input placeholder="예: 김팀장님, 고객사 담당자" value={to}
                                    onChange={e => setTo(e.target.value)}
                                    className="bg-white/5 border-white/10 text-foreground text-sm h-8" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">제목 힌트 (선택 — AI가 완성)</Label>
                                <Input placeholder="키워드만 입력해도 됩니다" value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    className="bg-white/5 border-white/10 text-foreground text-sm h-8" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">본문 원문 <span className="text-red-400">*</span></Label>
                                <Textarea
                                    placeholder="초안, 메모, 핵심 내용 등 어떤 형태로든 입력하세요. AI가 전문적으로 완성합니다."
                                    value={body} onChange={e => setBody(e.target.value)}
                                    rows={9} className="bg-white/5 border-white/10 text-foreground text-sm resize-none" />
                            </div>
                        </div>

                        <Button onClick={handlePolish} disabled={loading || !body.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white gap-2">
                            {loading ? (
                                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />AI 다듬는 중...</>
                            ) : (
                                <><Sparkles className="w-4 h-4" />AI로 다듬기</>
                            )}
                        </Button>
                    </div>

                    {/* ── Col 2: Result Panel ── */}
                    <div className="glass-premium rounded-2xl p-5 space-y-4">
                        <h3 className="text-sm font-medium text-foreground/80 border-b border-white/10 pb-2">AI 결과</h3>

                        {!result && !loading && (
                            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                                <div className="w-14 h-14 rounded-2xl glass-muted flex items-center justify-center">
                                    <Sparkles className="w-7 h-7 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">좌측에 메일 내용을 입력하고<br />"AI로 다듬기" 버튼을 누르세요</p>
                                {profile.name && (
                                    <p className="text-xs text-muted-foreground/60">
                                        발신: {profile.name} {profile.title && `· ${profile.title}`}
                                    </p>
                                )}
                            </div>
                        )}

                        {loading && (
                            <div className="flex flex-col items-center justify-center h-64 gap-3">
                                <div className="w-10 h-10 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                                <p className="text-sm text-muted-foreground">BLUF · 피라미드 구조로 다듬는 중...</p>
                            </div>
                        )}

                        {result && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                {/* Meta badges */}
                                <div className="flex gap-2 flex-wrap">
                                    {result.tone_summary && (
                                        <div className="flex-1 min-w-[120px] px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                                            {result.tone_summary}
                                        </div>
                                    )}
                                    {result.structure_note && (
                                        <div className="flex-1 min-w-[120px] px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300">
                                            {result.structure_note}
                                        </div>
                                    )}
                                </div>

                                {/* Subject */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs text-muted-foreground">제목</Label>
                                        <button onClick={() => copyToClipboard(result.subject, 'subject')}
                                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                            {copiedField === 'subject' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            복사
                                        </button>
                                    </div>
                                    <div className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground font-semibold">
                                        {result.subject}
                                    </div>
                                </div>

                                {/* Body — Markdown rendered */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs text-muted-foreground">본문</Label>
                                        <div className="flex items-center gap-2">
                                            {/* 일반 텍스트 복사 */}
                                            <button
                                                onClick={() => copyToClipboard(result.body, 'body-plain')}
                                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                                title="마크다운 원문 복사"
                                            >
                                                {copiedField === 'body-plain' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                텍스트
                                            </button>
                                            {/* 서식 포함 HTML 복사 (Gmail/Outlook 직접 붙여넣기) */}
                                            <button
                                                onClick={() => copyToClipboard(result.body, 'body-html', true)}
                                                className={cn(
                                                    'flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border transition-all',
                                                    copiedField === 'body-html'
                                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                                        : 'bg-blue-500/15 text-blue-300 border-blue-500/30 hover:bg-blue-500/25'
                                                )}
                                                title="볼드·표·줄바꿈 서식 유지 복사 (Gmail/Outlook 붙여넣기용)"
                                            >
                                                {copiedField === 'body-html'
                                                    ? <><Check className="w-3.5 h-3.5" />복사됨</>
                                                    : <><Copy className="w-3.5 h-3.5" />서식 복사</>
                                                }
                                            </button>
                                        </div>
                                    </div>
                                    {/* Rendered markdown preview */}
                                    <div className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 max-h-96 overflow-y-auto">
                                        <MarkdownRenderer content={result.body} />
                                    </div>
                                </div>

                                {/* Improvements */}
                                {result.improvements?.length > 0 && (
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground">개선 포인트</Label>
                                        <ul className="space-y-1.5">
                                            {result.improvements.map((imp, i) => (
                                                <li key={i} className="flex items-start gap-2 text-xs text-foreground/70">
                                                    <span className="mt-0.5 w-4 h-4 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                                                        {i + 1}
                                                    </span>
                                                    {imp}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Col 3: Skill / Settings Panel ── */}
                    {showSkill && (
                        <div className="glass-premium rounded-2xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-right-4 duration-200">

                            {/* Tab Bar */}
                            <div className="grid grid-cols-4 gap-0.5 p-1 rounded-xl bg-white/5 border border-white/10">
                                {([
                                    { id: 'tips' as SkillTab, label: '팁', icon: <Lightbulb className="w-3 h-3" /> },
                                    { id: 'phrases' as SkillTab, label: '표현', icon: <BookOpen className="w-3 h-3" /> },
                                    { id: 'templates' as SkillTab, label: '템플릿', icon: <Layers className="w-3 h-3" /> },
                                    { id: 'settings' as SkillTab, label: '설정', icon: <Settings className="w-3 h-3" /> },
                                ]).map(tab => (
                                    <button key={tab.id} onClick={() => setSkillTab(tab.id)}
                                        className={cn(
                                            'flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[11px] font-medium transition-all',
                                            skillTab === tab.id
                                                ? tab.id === 'settings' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}>
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tips */}
                            {skillTab === 'tips' && (
                                <div className="overflow-y-auto flex-1 space-y-2 pr-0.5">
                                    {EMAIL_TIPS.map(tip => (
                                        <div key={tip.id} className="rounded-xl p-3 bg-white/[0.04] border border-white/8 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base leading-none">{tip.icon}</span>
                                                <span className="text-xs font-semibold text-foreground">{tip.title}</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed">{tip.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Phrases */}
                            {skillTab === 'phrases' && (
                                <div className="flex flex-col gap-2 flex-1 min-h-0">
                                    <div className="flex flex-wrap gap-1">
                                        {PHRASE_CATEGORIES.map(cat => (
                                            <button key={cat.id} onClick={() => setActivePhraseCat(cat.id)}
                                                className={cn(
                                                    'px-2 py-0.5 rounded-md text-[11px] font-medium transition-all border',
                                                    activePhraseCat === cat.id
                                                        ? 'bg-blue-500/25 text-blue-300 border-blue-500/40'
                                                        : 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10'
                                                )}>
                                                {cat.icon} {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="overflow-y-auto flex-1 space-y-1.5 pr-0.5">
                                        {currentPhraseCat?.phrases.map((phrase, i) => (
                                            <div key={i} className="rounded-lg p-2.5 bg-white/[0.04] border border-white/8 space-y-1 group">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-[11px] text-foreground leading-relaxed flex-1">{phrase.ko}</p>
                                                    <button
                                                        onClick={() => insertPhrase(language === 'english' && phrase.en ? phrase.en : phrase.ko)}
                                                        className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        삽입
                                                    </button>
                                                </div>
                                                {phrase.en && <p className="text-[10px] text-muted-foreground italic">{phrase.en}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quick Templates */}
                            {skillTab === 'templates' && (
                                <div className="overflow-y-auto flex-1 space-y-2 pr-0.5">
                                    {EMAIL_TEMPLATES.map(tmpl => (
                                        <div key={tmpl.id} className="rounded-xl p-3 bg-white/[0.04] border border-white/8 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-foreground">{tmpl.label}</span>
                                                <button onClick={() => applyTemplate(tmpl.body, tmpl.subject)}
                                                    className="text-[10px] px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">
                                                    적용
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-mono line-clamp-2">{tmpl.subject}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Settings */}
                            {skillTab === 'settings' && (
                                <div className="overflow-y-auto flex-1 space-y-5 pr-0.5">
                                    <ProfileEditor profile={profile} onSave={saveProfile} />
                                    <div className="border-t border-white/10" />
                                    <GreetingTemplateManager
                                        templates={greetingTemplates}
                                        onSave={saveTemplates}
                                        selectedId={selectedGreetingId}
                                        onSelect={setSelectedGreetingId}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── ProfileEditor ─────────────────────────────────────────────────────────────
function ProfileEditor({ profile, onSave }: { profile: UserEmailProfile; onSave: (p: UserEmailProfile) => void }) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<UserEmailProfile>(profile);

    useEffect(() => { setForm(profile); }, [profile]);

    const FIELDS: { key: keyof UserEmailProfile; label: string; placeholder: string }[] = [
        { key: 'name', label: '이름', placeholder: '홍길동' },
        { key: 'title', label: '직함', placeholder: '대리 / 과장 / 팀장' },
        { key: 'department', label: '부서', placeholder: '영업팀 / 개발팀' },
        { key: 'company', label: '회사', placeholder: '회사명' },
        { key: 'email', label: '이메일', placeholder: 'hong@company.com' },
        { key: 'phone', label: '연락처', placeholder: '010-0000-0000' },
    ];

    if (!editing) {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-400" />내 프로필
                    </span>
                    <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                        <Edit3 className="w-3 h-3" /> 편집
                    </button>
                </div>
                {profile.name ? (
                    <div className="rounded-xl p-3 bg-white/[0.04] border border-white/8 space-y-1">
                        <p className="text-xs font-medium text-foreground">{profile.name}{profile.title && ` · ${profile.title}`}</p>
                        {(profile.department || profile.company) && (
                            <p className="text-[11px] text-muted-foreground">
                                {[profile.department, profile.company].filter(Boolean).join(' / ')}
                            </p>
                        )}
                        {profile.email && <p className="text-[11px] text-muted-foreground">{profile.email}</p>}
                        {profile.phone && <p className="text-[11px] text-muted-foreground">{profile.phone}</p>}
                        {profile.signature && (
                            <div className="mt-2 pt-2 border-t border-white/8 text-[10px] text-muted-foreground whitespace-pre-line">
                                {profile.signature}
                            </div>
                        )}
                    </div>
                ) : (
                    <button onClick={() => setEditing(true)}
                        className="w-full rounded-xl p-3 bg-white/[0.04] border border-dashed border-white/15 text-[11px] text-muted-foreground hover:border-white/30 transition-colors text-center">
                        + 프로필 설정 (이름, 직함, 소속 등)
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">프로필 편집</span>
                <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
            <div className="space-y-2">
                {FIELDS.map(f => (
                    <div key={f.key} className="space-y-0.5">
                        <Label className="text-[11px] text-muted-foreground">{f.label}</Label>
                        <Input
                            value={form[f.key]}
                            onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                            placeholder={f.placeholder}
                            className="bg-white/5 border-white/10 text-foreground text-xs h-7" />
                    </div>
                ))}
                <div className="space-y-0.5">
                    <Label className="text-[11px] text-muted-foreground">커스텀 서명 (선택)</Label>
                    <Textarea
                        value={form.signature}
                        onChange={e => setForm(prev => ({ ...prev, signature: e.target.value }))}
                        placeholder="이메일 서명 문구..."
                        rows={3}
                        className="bg-white/5 border-white/10 text-foreground text-xs resize-none" />
                </div>
                <Button onClick={() => { onSave(form); setEditing(false); }}
                    className="w-full h-7 text-xs bg-blue-600 hover:bg-blue-500 text-white">
                    저장
                </Button>
            </div>
        </div>
    );
}

// ── GreetingTemplateManager ───────────────────────────────────────────────────
function GreetingTemplateManager({
    templates, onSave, selectedId, onSelect,
}: {
    templates: GreetingTemplate[];
    onSave: (t: GreetingTemplate[]) => void;
    selectedId: string | null;
    onSelect: (id: string | null) => void;
}) {
    const blank = (): GreetingTemplate => ({ id: generateId(), label: '', type: 'internal', opening: '', closing: '' });
    const [form, setForm] = useState<GreetingTemplate>(blank());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const isEditing = editingId !== null || isAdding;

    const startEdit = (t: GreetingTemplate) => { setForm({ ...t }); setEditingId(t.id); setIsAdding(false); };
    const startAdd = () => { setForm(blank()); setIsAdding(true); setEditingId(null); };
    const cancel = () => { setEditingId(null); setIsAdding(false); };

    const handleSave = () => {
        if (!form.label.trim()) { toast.error('템플릿 이름을 입력하세요.'); return; }
        const updated = editingId
            ? templates.map(t => t.id === editingId ? form : t)
            : [...templates, form];
        onSave(updated);
        cancel();
        toast.success('저장되었습니다.');
    };

    const handleDelete = (id: string) => {
        onSave(templates.filter(t => t.id !== id));
        if (selectedId === id) onSelect(null);
        toast.success('삭제되었습니다.');
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />인사말 템플릿
                </span>
                {!isEditing && (
                    <button onClick={startAdd} className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors">
                        <Plus className="w-3 h-3" /> 추가
                    </button>
                )}
            </div>

            {/* List */}
            {!isEditing && (
                <div className="space-y-1.5">
                    {templates.map(tmpl => (
                        <div key={tmpl.id}
                            className={cn(
                                'rounded-xl p-2.5 border transition-all space-y-1',
                                selectedId === tmpl.id
                                    ? 'bg-white/[0.07] border-white/20'
                                    : 'bg-white/[0.04] border-white/8'
                            )}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <span className={cn(
                                        'text-[9px] px-1.5 py-0.5 rounded font-semibold',
                                        tmpl.type === 'internal' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                                    )}>
                                        {tmpl.type === 'internal' ? '내부' : '외부'}
                                    </span>
                                    <span className="text-xs font-medium text-foreground">{tmpl.label}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => startEdit(tmpl)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                                        <Edit3 className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => handleDelete(tmpl.id)} className="p-1 text-muted-foreground hover:text-red-400 transition-colors">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">{tmpl.opening}</p>
                        </div>
                    ))}
                    {templates.length === 0 && (
                        <p className="text-[11px] text-muted-foreground text-center py-3">저장된 템플릿이 없습니다</p>
                    )}
                </div>
            )}

            {/* Edit / Add Form */}
            {isEditing && (
                <div className="rounded-xl p-3 bg-white/[0.04] border border-white/12 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-foreground">{isAdding ? '새 인사말 템플릿' : '템플릿 편집'}</span>
                        <button onClick={cancel} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
                    </div>

                    <div className="space-y-0.5">
                        <Label className="text-[11px] text-muted-foreground">이름</Label>
                        <Input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                            placeholder="예: 사내 기본, 외부 공식" className="bg-white/5 border-white/10 text-foreground text-xs h-7" />
                    </div>

                    <div className="flex gap-2">
                        {(['internal', 'external'] as const).map(t => (
                            <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))}
                                className={cn(
                                    'flex-1 py-1 rounded-lg text-[11px] font-medium transition-all border',
                                    form.type === t
                                        ? t === 'internal' ? 'bg-blue-500/25 text-blue-300 border-blue-500/40' : 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40'
                                        : 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10'
                                )}>
                                {t === 'internal' ? '내부용' : '외부용'}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-0.5">
                        <Label className="text-[11px] text-muted-foreground">머리말 (오프닝)</Label>
                        <Textarea value={form.opening} onChange={e => setForm(p => ({ ...p, opening: e.target.value }))}
                            placeholder="예: 안녕하십니까, 귀사의 무궁한 발전을 기원합니다." rows={2}
                            className="bg-white/5 border-white/10 text-foreground text-xs resize-none" />
                    </div>

                    <div className="space-y-0.5">
                        <Label className="text-[11px] text-muted-foreground">맺음말 (클로징)</Label>
                        <Textarea value={form.closing} onChange={e => setForm(p => ({ ...p, closing: e.target.value }))}
                            placeholder="예: 감사드립니다. 홍길동 드림" rows={2}
                            className="bg-white/5 border-white/10 text-foreground text-xs resize-none" />
                    </div>

                    <Button onClick={handleSave} className="w-full h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white">
                        저장
                    </Button>
                </div>
            )}
        </div>
    );
}

'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, Mail, BookOpen, Layers, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PHRASE_CATEGORIES, EMAIL_TEMPLATES, EMAIL_TIPS } from '@/data/emailSkills';

type Tone = 'formal' | 'professional' | 'friendly' | 'assertive' | 'concise';
type Purpose = 'report' | 'request' | 'decline' | 'proposal' | 'announcement' | 'thanks' | 'apology' | 'general';
type Language = 'korean' | 'english';
type SkillTab = 'phrases' | 'templates' | 'tips';

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

interface PolishResult {
    subject: string;
    body: string;
    improvements: string[];
    tone_summary: string;
}

export default function EmailPolishSection() {
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [tone, setTone] = useState<Tone>('professional');
    const [purpose, setPurpose] = useState<Purpose>('general');
    const [language, setLanguage] = useState<Language>('korean');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PolishResult | null>(null);
    const [copiedField, setCopiedField] = useState<'subject' | 'body' | string | null>(null);
    const [skillTab, setSkillTab] = useState<SkillTab>('tips');
    const [activePhraseCat, setActivePhraseCat] = useState(PHRASE_CATEGORIES[0].id);
    const [showSkill, setShowSkill] = useState(true);

    const handlePolish = async () => {
        if (!body.trim()) {
            toast.error('메일 본문을 입력해 주세요.');
            return;
        }
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'polish_email',
                    payload: { to, subject, body, tone, purpose, language },
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

    const copyToClipboard = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success('클립보드에 복사되었습니다.');
        setTimeout(() => setCopiedField(null), 2000);
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

    const currentPhraseCat = PHRASE_CATEGORIES.find(c => c.id === activePhraseCat);

    return (
        <div className="h-full overflow-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl glass-premium flex items-center justify-center">
                            <Mail className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">메일 다듬기 AI</h2>
                            <p className="text-xs text-muted-foreground">원문을 입력하면 AI가 전문적으로 다듬어 드립니다</p>
                        </div>
                    </div>
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

                <div className={cn('grid gap-4', showSkill ? 'grid-cols-1 xl:grid-cols-[1fr_1fr_360px]' : 'grid-cols-1 lg:grid-cols-2')}>
                    {/* ── Col 1: Input Panel ── */}
                    <div className="glass-premium rounded-2xl p-5 space-y-4">
                        <h3 className="text-sm font-medium text-foreground/80 border-b border-white/10 pb-2">원문 입력</h3>

                        {/* Tone */}
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs text-muted-foreground">톤</Label>
                            <div className="flex flex-wrap gap-1">
                                {TONE_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setTone(opt.value)}
                                        className={cn(
                                            'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                                            tone === opt.value
                                                ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                                                : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Purpose */}
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs text-muted-foreground">목적</Label>
                            <div className="flex flex-wrap gap-1">
                                {PURPOSE_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setPurpose(opt.value)}
                                        className={cn(
                                            'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                                            purpose === opt.value
                                                ? 'bg-violet-500/30 text-violet-300 border border-violet-500/50'
                                                : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Language */}
                        <div className="flex gap-2">
                            {(['korean', 'english'] as const).map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setLanguage(lang)}
                                    className={cn(
                                        'flex-1 py-1.5 rounded-lg text-xs font-medium transition-all',
                                        language === lang
                                            ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                                            : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
                                    )}
                                >
                                    {lang === 'korean' ? '🇰🇷 한국어' : '🇺🇸 English'}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">수신자 (선택)</Label>
                                <Input
                                    placeholder="예: 김팀장님, 고객사 담당자"
                                    value={to}
                                    onChange={e => setTo(e.target.value)}
                                    className="bg-white/5 border-white/10 text-foreground text-sm h-8"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">제목 (선택)</Label>
                                <Input
                                    placeholder="메일 제목"
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    className="bg-white/5 border-white/10 text-foreground text-sm h-8"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">본문 <span className="text-red-400">*</span></Label>
                                <Textarea
                                    placeholder="다듬을 메일 내용을 입력하세요. 초안이나 메모 수준이어도 괜찮습니다."
                                    value={body}
                                    onChange={e => setBody(e.target.value)}
                                    rows={10}
                                    className="bg-white/5 border-white/10 text-foreground text-sm resize-none"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handlePolish}
                            disabled={loading || !body.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    AI 다듬는 중...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    AI로 다듬기
                                </>
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
                            </div>
                        )}

                        {loading && (
                            <div className="flex flex-col items-center justify-center h-64 gap-3">
                                <div className="w-10 h-10 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                                <p className="text-sm text-muted-foreground">AI가 메일을 다듬고 있습니다...</p>
                            </div>
                        )}

                        {result && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                {result.tone_summary && (
                                    <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                                        {result.tone_summary}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs text-muted-foreground">다듬어진 제목</Label>
                                        <button
                                            onClick={() => copyToClipboard(result.subject, 'subject')}
                                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {copiedField === 'subject' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            복사
                                        </button>
                                    </div>
                                    <div className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground">
                                        {result.subject}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs text-muted-foreground">다듬어진 본문</Label>
                                        <button
                                            onClick={() => copyToClipboard(result.body, 'body')}
                                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {copiedField === 'body' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            복사
                                        </button>
                                    </div>
                                    <div className="px-3 py-3 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground whitespace-pre-line max-h-72 overflow-y-auto leading-relaxed">
                                        {result.body}
                                    </div>
                                </div>

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

                    {/* ── Col 3: Skill Guide Panel ── */}
                    {showSkill && (
                        <div className="glass-premium rounded-2xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-right-4 duration-200">
                            {/* Skill Tab Switcher */}
                            <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                                {([
                                    { id: 'tips', label: '핵심 팁', icon: <Lightbulb className="w-3.5 h-3.5" /> },
                                    { id: 'phrases', label: '표현 사전', icon: <BookOpen className="w-3.5 h-3.5" /> },
                                    { id: 'templates', label: '템플릿', icon: <Layers className="w-3.5 h-3.5" /> },
                                ] as { id: SkillTab; label: string; icon: React.ReactNode }[]).map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSkillTab(tab.id)}
                                        className={cn(
                                            'flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all',
                                            skillTab === tab.id
                                                ? 'bg-amber-500/20 text-amber-300'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tips Tab */}
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

                            {/* Phrases Tab */}
                            {skillTab === 'phrases' && (
                                <div className="flex flex-col gap-2 flex-1 min-h-0">
                                    {/* Category selector */}
                                    <div className="flex flex-wrap gap-1">
                                        {PHRASE_CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setActivePhraseCat(cat.id)}
                                                className={cn(
                                                    'px-2 py-0.5 rounded-md text-[11px] font-medium transition-all',
                                                    activePhraseCat === cat.id
                                                        ? 'bg-blue-500/25 text-blue-300 border border-blue-500/40'
                                                        : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
                                                )}
                                            >
                                                {cat.icon} {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                    {/* Phrase list */}
                                    <div className="overflow-y-auto flex-1 space-y-1.5 pr-0.5">
                                        {currentPhraseCat?.phrases.map((phrase, i) => (
                                            <div key={i} className="rounded-lg p-2.5 bg-white/[0.04] border border-white/8 space-y-1 group">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-[11px] text-foreground leading-relaxed flex-1">{phrase.ko}</p>
                                                    <button
                                                        onClick={() => insertPhrase(language === 'english' && phrase.en ? phrase.en : phrase.ko)}
                                                        className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        삽입
                                                    </button>
                                                </div>
                                                {phrase.en && (
                                                    <p className="text-[10px] text-muted-foreground italic">{phrase.en}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Templates Tab */}
                            {skillTab === 'templates' && (
                                <div className="overflow-y-auto flex-1 space-y-2 pr-0.5">
                                    {EMAIL_TEMPLATES.map(tmpl => (
                                        <div key={tmpl.id} className="rounded-xl p-3 bg-white/[0.04] border border-white/8 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-foreground">{tmpl.label}</span>
                                                <button
                                                    onClick={() => applyTemplate(tmpl.body, tmpl.subject)}
                                                    className="text-[10px] px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                                                >
                                                    적용
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-mono leading-relaxed line-clamp-3">{tmpl.subject}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

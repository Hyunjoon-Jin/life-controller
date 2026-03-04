'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, Mail, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Tone = 'formal' | 'professional' | 'friendly' | 'assertive' | 'concise';
type Purpose = 'report' | 'request' | 'decline' | 'proposal' | 'announcement' | 'thanks' | 'apology' | 'general';
type Language = 'korean' | 'english';

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
    const [copiedField, setCopiedField] = useState<'subject' | 'body' | null>(null);

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

    const copyToClipboard = async (text: string, field: 'subject' | 'body') => {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success('클립보드에 복사되었습니다.');
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="h-full overflow-auto p-4 md:p-6">
            <div className="max-w-6xl mx-auto space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl glass-premium flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">메일 다듬기 AI</h2>
                        <p className="text-xs text-muted-foreground">원문을 입력하면 AI가 전문적으로 다듬어 드립니다</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left: Input Panel */}
                    <div className="glass-premium rounded-2xl p-5 space-y-4">
                        <h3 className="text-sm font-medium text-foreground/80 border-b border-white/10 pb-2">원문 입력</h3>

                        {/* Options row */}
                        <div className="flex flex-wrap gap-2">
                            {/* Tone */}
                            <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
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
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {/* Purpose */}
                            <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
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

                    {/* Right: Result Panel */}
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
                                {/* Tone summary badge */}
                                {result.tone_summary && (
                                    <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                                        {result.tone_summary}
                                    </div>
                                )}

                                {/* Subject */}
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

                                {/* Body */}
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
                </div>
            </div>
        </div>
    );
}

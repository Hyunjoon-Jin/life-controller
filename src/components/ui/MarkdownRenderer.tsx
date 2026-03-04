'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
    content: string;
    className?: string;
    /** 다크 배경(glass) 위 렌더링 시 true (기본값 true) */
    dark?: boolean;
}

export function MarkdownRenderer({ content, className, dark = true }: MarkdownRendererProps) {
    const text = dark ? 'text-foreground/80' : 'text-gray-800';
    const muted = dark ? 'text-foreground/60' : 'text-gray-500';
    const bold = dark ? 'text-foreground font-bold' : 'text-gray-900 font-bold';
    const border = dark ? 'border-white/15' : 'border-gray-200';
    const thBg = dark ? 'bg-white/[0.06]' : 'bg-gray-50';

    return (
        <div className={cn('text-sm leading-relaxed', text, className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // ── 단락
                    p: ({ children }) => (
                        <p className={cn('mb-2.5 leading-[1.75]', text)}>{children}</p>
                    ),
                    // ── 제목
                    h1: ({ children }) => (
                        <h1 className={cn('text-xl font-extrabold mb-3 mt-5', dark ? 'text-foreground' : 'text-gray-900')}>{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className={cn('text-lg font-bold mb-2 mt-4', dark ? 'text-foreground' : 'text-gray-900')}>{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className={cn('text-base font-semibold mb-1.5 mt-3', dark ? 'text-foreground/90' : 'text-gray-800')}>{children}</h3>
                    ),
                    // ── 강조
                    strong: ({ children }) => (
                        <strong className={bold}>{children}</strong>
                    ),
                    em: ({ children }) => (
                        <em className={cn('italic', muted)}>{children}</em>
                    ),
                    // ── 목록
                    ul: ({ children }) => (
                        <ul className={cn('list-disc pl-5 mb-2.5 space-y-1', text)}>{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className={cn('list-decimal pl-5 mb-2.5 space-y-1', text)}>{children}</ol>
                    ),
                    li: ({ children }) => (
                        <li className={cn('leading-relaxed', text)}>{children}</li>
                    ),
                    // ── 표 (GFM)
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-3">
                            <table className={cn('w-full border-collapse text-xs', border)}>{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className={thBg}>{children}</thead>
                    ),
                    th: ({ children }) => (
                        <th className={cn('border px-3 py-2 text-left font-semibold', dark ? 'border-white/15 text-foreground' : 'border-gray-200 text-gray-800')}>{children}</th>
                    ),
                    td: ({ children }) => (
                        <td className={cn('border px-3 py-2', dark ? 'border-white/10 text-foreground/70' : 'border-gray-100 text-gray-700')}>{children}</td>
                    ),
                    tr: ({ children }) => (
                        <tr className={cn('transition-colors', dark ? 'hover:bg-white/[0.04]' : 'hover:bg-gray-50')}>{children}</tr>
                    ),
                    // ── 수평선
                    hr: () => (
                        <hr className={cn('my-4 border-t', dark ? 'border-white/10' : 'border-gray-200')} />
                    ),
                    // ── 인라인 코드
                    code: ({ children, className: codeClass }) => {
                        const isBlock = codeClass?.includes('language-');
                        if (isBlock) {
                            return (
                                <code className={cn(
                                    'block p-3 rounded-lg font-mono text-xs leading-relaxed my-2 overflow-x-auto',
                                    dark ? 'bg-black/30 text-emerald-300' : 'bg-gray-100 text-gray-800'
                                )}>
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <code className={cn(
                                'px-1.5 py-0.5 rounded font-mono text-[12px]',
                                dark ? 'bg-white/10 text-amber-300' : 'bg-gray-100 text-gray-700'
                            )}>
                                {children}
                            </code>
                        );
                    },
                    // ── 블록 인용
                    blockquote: ({ children }) => (
                        <blockquote className={cn(
                            'border-l-2 pl-4 my-2 italic',
                            dark ? 'border-blue-400/40 text-foreground/60' : 'border-blue-400 text-gray-500'
                        )}>
                            {children}
                        </blockquote>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
